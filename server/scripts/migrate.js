import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getClient } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.resolve(
    __dirname,
    "../database/migrations"
);

const MIGRATION_LOCK_KEY = 748392615;

function parseMigration(filename) {
    const match = filename.match(
        /^(\d+)_([a-zA-Z0-9_-]+)\.sql$/
    );

    if (!match) {
        return null;
    }

    return {
        version: Number(match[1]),
        name: filename
    };
}

async function getMigrations() {
    const files = await fs.readdir(migrationsDir);

    return files
        .map(parseMigration)
        .filter(Boolean)
        .sort(
            (a, b) =>
                a.version - b.version
        );
}

async function ensureMigrationTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (

            version INTEGER PRIMARY KEY,

            name TEXT NOT NULL,

            applied_at TIMESTAMPTZ
                NOT NULL
                DEFAULT NOW()

        );
    `);
}

async function assertBootstrapReady(client) {
    const result = await client.query(`
        SELECT to_regclass(
            'public.users'
        ) AS users_table;
    `);

    if (!result.rows[0].users_table) {
        throw new Error(
            "ShadowDock database is not initialized. " +
            "Run server/database/init.sql first."
        );
    }
}

async function getAppliedVersions(client) {
    const result = await client.query(`
        SELECT version
        FROM schema_migrations
        ORDER BY version ASC;
    `);

    return new Set(
        result.rows.map(
            row => row.version
        )
    );
}

async function run() {

    const client = await getClient();

    let lockAcquired = false;

    try {

        console.log(
            "🔧 ShadowDock migration runner"
        );

        console.log(
            `📁 Migration directory: ${migrationsDir}`
        );

        /*
        |--------------------------------------------------------------------------
        | Verify database bootstrap
        |--------------------------------------------------------------------------
        */

        await assertBootstrapReady(
            client
        );

        /*
        |--------------------------------------------------------------------------
        | Prevent concurrent migration runners
        |--------------------------------------------------------------------------
        */

        await client.query(
            "SELECT pg_advisory_lock($1);",
            [MIGRATION_LOCK_KEY]
        );

        lockAcquired = true;

        /*
        |--------------------------------------------------------------------------
        | Migration tracking table
        |--------------------------------------------------------------------------
        */

        await ensureMigrationTable(
            client
        );

        const migrations =
            await getMigrations();

        const appliedVersions =
            await getAppliedVersions(
                client
            );

        if (
            migrations.length === 0
        ) {

            console.log(
                "ℹ️ No migration files found."
            );

            return;
        }

        let pendingCount = 0;

        /*
        |--------------------------------------------------------------------------
        | Apply migrations
        |--------------------------------------------------------------------------
        */

        for (
            const migration
            of migrations
        ) {

            if (
                appliedVersions.has(
                    migration.version
                )
            ) {

                console.log(
                    `⏭️ ${String(
                        migration.version
                    ).padStart(
                        3,
                        "0"
                    )} ${migration.name} — already applied`
                );

                continue;
            }

            const filePath =
                path.join(
                    migrationsDir,
                    migration.name
                );

            const sql =
                await fs.readFile(
                    filePath,
                    "utf8"
                );

            if (
                !sql.trim()
            ) {

                throw new Error(
                    `Migration file is empty: ${migration.name}`
                );
            }

            console.log(
                `🚀 Applying ${String(
                    migration.version
                ).padStart(
                    3,
                    "0"
                )} ${migration.name}`
            );

            try {

                await client.query(
                    "BEGIN"
                );

                await client.query(
                    sql
                );

                await client.query(
                    `
                    INSERT INTO schema_migrations (
                        version,
                        name
                    )
                    VALUES (
                        $1,
                        $2
                    );
                    `,
                    [
                        migration.version,
                        migration.name
                    ]
                );

                await client.query(
                    "COMMIT"
                );

                console.log(
                    `✅ Applied ${String(
                        migration.version
                    ).padStart(
                        3,
                        "0"
                    )} ${migration.name}`
                );

                pendingCount++;

            } catch (error) {

                await client.query(
                    "ROLLBACK"
                );

                console.error(
                    `❌ Migration failed: ${migration.name}`
                );

                throw error;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        if (
            pendingCount === 0
        ) {

            console.log(
                "✨ Database is already up to date."
            );

        } else {

            console.log(
                `✨ Migration complete. ` +
                `Applied ${pendingCount} migration(s).`
            );
        }

    } finally {

        if (
            lockAcquired
        ) {

            await client.query(
                "SELECT pg_advisory_unlock($1);",
                [MIGRATION_LOCK_KEY]
            );
        }

        client.release();
    }
}

run().catch(
    error => {

        console.error(
            "💥 Migration runner failed."
        );

        console.error(
            error
        );

        process.exitCode = 1;
    }
);
