import pkg from "pg"

const { Pool } = pkg

const pool = new Pool({
  user: "postgres",
  host: "172.29.192.1",
  database: "shadowdock",
  password: "gh0st",
  port: 5432,
})

export default pool