import { query } from "../config/db.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Attachment Repository
|
| Database access layer.
|
| Responsibilities
|
| ✓ SQL Queries
| ✓ Attachment Persistence
| ✓ Retrieval
| ✓ Metadata
| ✓ Upload State
| ✓ Statistics
|
| Business logic belongs to the Service Layer.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Shared Column Definitions
|--------------------------------------------------------------------------
|
| Every query returns the same attachment structure.
|
*/

const ATTACHMENT_COLUMNS = `
    a.id,
    a.public_id,

    a.message_id,
    a.uploader_id,

    a.uploader_public_id,

    a.attachment_type,

    a.original_filename,
    a.stored_filename,
    a.file_extension,

    a.mime_type,
    a.file_size,

    a.sha256_hash,
    a.perceptual_hash,

    a.storage_provider,
    a.storage_path,

    a.public_url,
    a.cdn_url,

    a.thumbnail_path,
    a.preview_path,

    a.preview_generated,
    a.thumbnail_generated,

    a.image_width,
    a.image_height,
    a.image_format,

    a.duration_seconds,

    a.video_width,
    a.video_height,

    a.frame_rate,
    a.bitrate,
    a.codec,

    a.sample_rate,
    a.audio_channels,

    a.page_count,
    a.language,

    a.extracted_text,

    a.ai_description,
    a.ai_tags,

    a.metadata,

    a.encrypted,
    a.encryption_version,
    a.encryption_algorithm,

    a.file_nonce,
    a.encrypted_key,

    a.compressed,
    a.compression_algorithm,

    a.upload_status,
    a.uploaded_at,
    a.upload_completed_at,

    a.virus_scan_status,
    a.scanned_at,

    a.download_count,
    a.last_downloaded_at,

    a.deleted_at,

    a.created_at,
    a.updated_at
`;

const ATTACHMENT_WITH_MESSAGE_COLUMNS = `
    ${ATTACHMENT_COLUMNS},

    m.public_id AS message_public_id
`;

/*
|--------------------------------------------------------------------------
| Find Attachment By Internal ID
|--------------------------------------------------------------------------
*/

export async function findAttachmentById(
    attachmentId
) {

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            a.id = $1

        LIMIT 1;
        `,

        [

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Find Attachment By Public ID
|--------------------------------------------------------------------------
*/

export async function findAttachmentByPublicId(
    publicId
) {

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            a.public_id = $1

        LIMIT 1;
        `,

        [

            publicId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Find Attachments By Public IDs
|--------------------------------------------------------------------------
|
| Bulk lookup.
|
| Future Uses
|
| • Bulk Delete
| • Export Chats
| • AI Processing
| • Malware Scanning
|
*/

export async function findAttachmentsByPublicIds(
    publicIds = []
) {

    if (

        !Array.isArray(publicIds)

        ||

        publicIds.length === 0

    ) {

        return [];

    }

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            a.public_id = ANY($1)

        ORDER BY

            a.created_at ASC;
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Create Attachment
|--------------------------------------------------------------------------
|
| Creates a new attachment.
|
| Must execute inside an active transaction.
|
*/

export async function createAttachment(

    client,

    {

        messageId,

        uploaderId,

        uploaderPublicId,

        attachmentType,

        originalFilename,

        storedFilename,

        fileExtension = null,

        mimeType,

        fileSize,

        sha256Hash,

        perceptualHash = null,

        storageProvider = "local",

        storagePath,

        publicUrl = null,

        cdnUrl = null,

        encrypted = false,

        encryptionVersion = null,

        encryptionAlgorithm = null,

        fileNonce = null,

        encryptedKey = null,

        metadata = {}

    }

) {

    const result = await client.query(

        `
        INSERT INTO attachments (

            message_id,

            uploader_id,

            uploader_public_id,

            attachment_type,

            original_filename,

            stored_filename,

            file_extension,

            mime_type,

            file_size,

            sha256_hash,

            perceptual_hash,

            storage_provider,

            storage_path,

            public_url,

            cdn_url,

            encrypted,

            encryption_version,

            encryption_algorithm,

            file_nonce,

            encrypted_key,

            metadata,

            created_by

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            $16,

            $17,

            $18,

            $19,

            $20,

            $21,

            $2

        )

        RETURNING *;
        `,

        [

            messageId,

            uploaderId,

            uploaderPublicId,

            attachmentType,

            originalFilename,

            storedFilename,

            fileExtension,

            mimeType,

            fileSize,

            sha256Hash,

            perceptualHash,

            storageProvider,

            storagePath,

            publicUrl,

            cdnUrl,

            encrypted,

            encryptionVersion,

            encryptionAlgorithm,

            fileNonce,

            encryptedKey,

            metadata

        ]

    );

    return result.rows[0];

}

/*
|--------------------------------------------------------------------------
| Update Attachment Metadata
|--------------------------------------------------------------------------
*/

export async function updateAttachment(

    client,

    {

        attachmentId,

        metadata,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            metadata = $1,

            updated_by = $2,

            updated_at = NOW()

        WHERE

            id = $3

        RETURNING *;
        `,

        [

            metadata,

            updatedBy,

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Mark Upload Completed
|--------------------------------------------------------------------------
*/

export async function markUploadCompleted(

    client,

    attachmentId

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            upload_status = 'completed',

            uploaded_at = COALESCE(uploaded_at, NOW()),

            upload_completed_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Mark Virus Scan
|--------------------------------------------------------------------------
*/

export async function markVirusScan(

    client,

    {

        attachmentId,

        status

    }

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            virus_scan_status = $1,

            scanned_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            status,

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Soft Delete Attachment
|--------------------------------------------------------------------------
*/

export async function softDeleteAttachment(

    client,

    {

        attachmentId,

        deletedBy

    }

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            deleted_at = NOW(),

            deleted_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            deletedBy,

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Restore Attachment
|--------------------------------------------------------------------------
*/

export async function restoreAttachment(

    client,

    {

        attachmentId,

        restoredBy

    }

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            deleted_at = NULL,

            restored_at = NOW(),

            restored_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            restoredBy,

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Get Message Attachments
|--------------------------------------------------------------------------
|
| Returns all active attachments belonging to a message.
|
*/

export async function getMessageAttachments(

    messageId

) {

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            a.message_id = $1

        AND

            a.deleted_at IS NULL

        ORDER BY

            a.created_at ASC;
        `,

        [

            messageId

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Get Chat Attachments
|--------------------------------------------------------------------------
|
| Returns attachments from an entire chat.
|
| Useful for:
|
| • Media Gallery
| • Documents View
| • Shared Links
| • Search
|
*/

export async function getChatAttachments(

    chatId,

    limit = 100,

    attachmentType = null

) {

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            m.chat_id = $1

        AND

            a.deleted_at IS NULL

        AND (

            $2::varchar IS NULL

            OR

            a.attachment_type = $2

        )

        ORDER BY

            a.created_at DESC

        LIMIT $3;
        `,

        [

            chatId,

            attachmentType,

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Search Attachments
|--------------------------------------------------------------------------
|
| Uses PostgreSQL Full Text Search.
|
| Powered by:
|
| idx_attachments_ocr
|
*/

export async function searchAttachments(

    chatId,

    searchText,

    limit = 50

) {

    const result = await query(

        `
        SELECT

            ${ATTACHMENT_WITH_MESSAGE_COLUMNS}

        FROM attachments a

        INNER JOIN messages m

            ON m.id = a.message_id

        WHERE

            m.chat_id = $1

        AND

            a.deleted_at IS NULL

        AND

            to_tsvector(

                'simple',

                COALESCE(

                    a.extracted_text,

                    ''

                )

            )

            @@

            plainto_tsquery(

                'simple',

                $2

            )

        ORDER BY

            ts_rank(

                to_tsvector(

                    'simple',

                    COALESCE(

                        a.extracted_text,

                        ''

                    )

                ),

                plainto_tsquery(

                    'simple',

                    $2

                )

            ) DESC,

            a.created_at DESC

        LIMIT $3;
        `,

        [

            chatId,

            searchText,

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Count Message Attachments
|--------------------------------------------------------------------------
|
| Returns total active attachments for a message.
|
*/

export async function countMessageAttachments(

    messageId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM attachments

        WHERE

            message_id = $1

        AND

            deleted_at IS NULL;
        `,

        [

            messageId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Count User Uploads
|--------------------------------------------------------------------------
|
| Returns total uploads by a user.
|
*/

export async function countUserUploads(

    uploaderId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM attachments

        WHERE

            uploader_id = $1

        AND

            deleted_at IS NULL;
        `,

        [

            uploaderId

        ]

    );

    return result.rows[0].total;

}
/*
|--------------------------------------------------------------------------
| Update Attachment Processing Metadata
|--------------------------------------------------------------------------
|
| Updates metadata generated after upload.
|
| Used by:
|
| • Image Processor
| • Video Transcoder
| • OCR Service
| • AI Analyzer
| • Thumbnail Generator
|
*/

export async function updateAttachmentMetadata(

    client,

    {

        attachmentId,

        imageWidth = null,

        imageHeight = null,

        imageFormat = null,

        durationSeconds = null,

        videoWidth = null,

        videoHeight = null,

        frameRate = null,

        bitrate = null,

        codec = null,

        sampleRate = null,

        audioChannels = null,

        pageCount = null,

        language = null,

        extractedText = null,

        aiDescription = null,

        aiTags = [],

        metadata = {},

        thumbnailPath = null,

        previewPath = null,

        thumbnailGenerated = false,

        previewGenerated = false,

        updatedBy = null

    }

) {

    const result = await client.query(

        `
        UPDATE attachments

        SET

            image_width = $1,

            image_height = $2,

            image_format = $3,

            duration_seconds = $4,

            video_width = $5,

            video_height = $6,

            frame_rate = $7,

            bitrate = $8,

            codec = $9,

            sample_rate = $10,

            audio_channels = $11,

            page_count = $12,

            language = $13,

            extracted_text = $14,

            ai_description = $15,

            ai_tags = $16,

            metadata = $17,

            thumbnail_path = $18,

            preview_path = $19,

            thumbnail_generated = $20,

            preview_generated = $21,

            updated_by = $22,

            updated_at = NOW()

        WHERE

            id = $23

        RETURNING *;
        `,

        [

            imageWidth,

            imageHeight,

            imageFormat,

            durationSeconds,

            videoWidth,

            videoHeight,

            frameRate,

            bitrate,

            codec,

            sampleRate,

            audioChannels,

            pageCount,

            language,

            extractedText,

            aiDescription,

            aiTags,

            metadata,

            thumbnailPath,

            previewPath,

            thumbnailGenerated,

            previewGenerated,

            updatedBy,

            attachmentId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Update Download Statistics
|--------------------------------------------------------------------------
|
| Updates download analytics.
|
*/

export async function updateDownloadStatistics(

    client,

    attachmentId

) {

    await client.query(

        `
        UPDATE attachments

        SET

            download_count = download_count + 1,

            last_downloaded_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1;
        `,

        [

            attachmentId

        ]

    );

}

/*
|--------------------------------------------------------------------------
| Repository Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ SQL Only
| ✓ CRUD Operations
| ✓ Upload Processing
| ✓ Metadata Updates
| ✓ OCR Search
| ✓ AI Metadata
| ✓ Virus Scan
| ✓ Download Statistics
| ✓ Soft Delete
| ✓ Restore
| ✓ Media Queries
| ✓ Statistics
|
|--------------------------------------------------------------------------
|
| Repository Rules
|--------------------------------------------------------------------------
|
| Repository MUST:
|
| ✓ Execute SQL
| ✓ Return Data
|
| Repository MUST NEVER:
|
| ✗ Validate Requests
| ✗ Authorize Users
| ✗ Start Transactions
| ✗ Commit Transactions
| ✗ Rollback Transactions
| ✗ Emit Socket Events
| ✗ Apply Business Logic
|
|--------------------------------------------------------------------------
|
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ PostgreSQL Optimized
| ✓ Repository Pattern
| ✓ OCR Ready
| ✓ AI Ready
| ✓ Cloud Storage Ready
| ✓ CDN Ready
| ✓ Virus Scan Ready
| ✓ Image Ready
| ✓ Video Ready
| ✓ Audio Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/