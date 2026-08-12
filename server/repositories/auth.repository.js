import { query } from "../config/db.js";

/* ============================================================
   User Queries
============================================================ */

/**
 * Find user by email.
 * Includes password hash for authentication.
 */
export async function findUserByEmail(email) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      account_number,
      username,
      display_name,
      email,
      password_hash,
      avatar,
      bio,
      status,
      last_seen,
      show_online_status,
      profile_visibility,
      last_seen_visibility,
      read_receipts_enabled,
      verified,
      account_deleted,
      banned,
      banned_reason,
      banned_until,
      language_code,
      timezone,
      password_changed_at,
      username_changed_at,
      profile_updated_at,
      metadata,
      created_at,
      updated_at,
      deleted_at
    FROM users
    WHERE email = $1
      AND deleted_at IS NULL
      AND account_deleted = FALSE
      AND banned = FALSE
    LIMIT 1;
    `,
    [email]
  );

  return rows[0] ?? null;
}

/**
 * Find user by UUID.
 */
export async function findUserById(id) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      account_number,
      username,
      display_name,
      email,
      avatar,
      bio,
      status,
      last_seen,
      show_online_status,
      profile_visibility,
      last_seen_visibility,
      read_receipts_enabled,
      verified,
      language_code,
      timezone,
      metadata,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [id]
  );

  return rows[0] ?? null;
}

/**
 * Find user by public ID.
 */
export async function findUserByPublicId(publicId) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      account_number,
      username,
      display_name,
      email,
      avatar,
      bio,
      status,
      last_seen,
      show_online_status,
      profile_visibility,
      last_seen_visibility,
      read_receipts_enabled,
      verified,
      language_code,
      timezone,
      metadata,
      created_at,
      updated_at
    FROM users
    WHERE public_id = $1
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [publicId]
  );

  return rows[0] ?? null;
}

/**
 * Find existing user by username or email.
 */
export async function findExistingUser(
  username,
  email
) {
  const { rows } = await query(
    `
    SELECT
      id,
      username,
      email,
      (username = $1) AS username_taken,
      (email = $2) AS email_taken
    FROM users
    WHERE
      deleted_at IS NULL
      AND (
        username = $1
        OR email = $2
      )
    LIMIT 1;
    `,
    [
      username,
      email,
    ]
  );

  return rows[0] ?? null;
}
/**
 * Create user.
 * Uses transaction client.
 */
export async function createUser(client, user) {
  const {
    publicId,
    username,
    displayName,
    email,
    passwordHash,
  } = user;

  const { rows } = await client.query(
    `
    INSERT INTO users
    (
      public_id,
      username,
      display_name,
      email,
      password_hash
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING
      id,
      public_id,
      account_number,
      username,
      display_name,
      email,
      avatar,
      bio,
      status,
      verified,
      created_at;
    `,
    [
      publicId,
      username,
      displayName,
      email,
      passwordHash,
    ]
  );

  return rows[0];
}

/**
 * Update online status.
 */
export async function updateUserStatus(
  client,
  userId,
  status
) {
  const { rows } = await client.query(
    `
    UPDATE users
    SET
      status = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      status;
    `,
    [userId, status]
  );

  return rows[0] ?? null;
}

/**
 * Update last seen timestamp.
 */
export async function updateLastSeen(
  client,
  userId
) {
  await client.query(
    `
    UPDATE users
    SET
      last_seen = NOW(),
      updated_at = NOW()
    WHERE id = $1;
    `,
    [userId]
  );
}

/**
 * Update avatar.
 */
export async function updateAvatar(
  client,
  userId,
  avatar
) {
  const { rows } = await client.query(
    `
    UPDATE users
    SET
      avatar = $2,
      profile_updated_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING avatar;
    `,
    [userId, avatar]
  );

  return rows[0] ?? null;
}

/* ============================================================
   Device Queries
============================================================ */

/**
 * Find device belonging to a user by unique identifier.
 */
export async function findDeviceByIdentifier(
  client,
  userId,
  deviceIdentifier
) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      public_id,
      user_id,
      device_name,
      manufacturer,
      model,
      device_type,
      operating_system,
      os_version,
      app_version,
      cpu_architecture,
      device_identifier,
      trusted,
      push_provider,
      public_key,
      encryption_version,
      last_active,
      last_ip_address,
      last_user_agent,
      revoked_at,
      metadata,
      created_at,
      updated_at,
      deleted_at
    FROM devices
    WHERE
      user_id = $1
      AND device_identifier = $2
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [
      userId,
      deviceIdentifier,
    ]
  );

  return rows[0] ?? null;
}

/**
 * Find device by internal UUID.
 */
export async function findDeviceById(
  deviceId
) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      user_id,
      device_name,
      manufacturer,
      model,
      device_type,
      operating_system,
      os_version,
      app_version,
      cpu_architecture,
      device_identifier,
      trusted,
      push_provider,
      public_key,
      encryption_version,
      last_active,
      last_ip_address,
      last_user_agent,
      revoked_at,
      metadata,
      created_at,
      updated_at,
      deleted_at
    FROM devices
    WHERE id = $1
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [deviceId]
  );

  return rows[0] ?? null;
}

/**
 * Create device.
 * Uses transaction client.
 */
export async function createDevice(
  client,
  device
) {
  const {
    publicId,
    userId,
    deviceName,
    manufacturer,
    model,
    deviceType,
    operatingSystem,
    osVersion,
    appVersion,
    cpuArchitecture,
    deviceIdentifier,
    lastIpAddress,
    lastUserAgent,
  } = device;

  const { rows } = await client.query(
    `
    INSERT INTO devices
    (
      public_id,
      user_id,
      device_name,
      manufacturer,
      model,
      device_type,
      operating_system,
      os_version,
      app_version,
      cpu_architecture,
      device_identifier,
      last_ip_address,
      last_user_agent
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    )
    RETURNING
      id,
      public_id,
      user_id,
      device_name,
      manufacturer,
      model,
      device_type,
      operating_system,
      os_version,
      app_version,
      cpu_architecture,
      device_identifier,
      trusted,
      last_active,
      created_at;
    `,
    [
      publicId,
      userId,
      deviceName,
      manufacturer,
      model,
      deviceType,
      operatingSystem,
      osVersion,
      appVersion,
      cpuArchitecture,
      deviceIdentifier,
      lastIpAddress,
      lastUserAgent,
    ]
  );

  return rows[0];
}
/* ============================================================
   Session Queries
============================================================ */

/**
 * Create authentication session.
 * Uses transaction client.
 */
export async function createSession(
  client,
  session
) {
  const {
    publicId,
    userId,
    deviceId,
    refreshTokenHash,
    ipAddress,
    userAgent,
    country,
    city,
    expiresAt,
    metadata = {},
  } = session;

  const { rows } = await client.query(
    `
    INSERT INTO sessions
    (
      public_id,
      user_id,
      device_id,
      refresh_token_hash,
      ip_address,
      user_agent,
      country,
      city,
      expires_at,
      metadata
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )
    RETURNING
      id,
      public_id,
      user_id,
      device_id,
      token_version,
      session_state,
      last_activity,
      expires_at,
      created_at;
    `,
    [
      publicId,
      userId,
      deviceId,
      refreshTokenHash,
      ipAddress,
      userAgent,
      country,
      city,
      expiresAt,
      metadata,
    ]
  );

  return rows[0];
}

/**
 * Find active session by public ID.
 */
export async function findSessionByPublicId(
  publicId
) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      user_id,
      device_id,
      refresh_token_hash,
      token_version,
      ip_address,
      user_agent,
      country,
      city,
      mfa_verified,
      risk_score,
      suspicious,
      session_state,
      last_activity,
      expires_at,
      revoked_at,
      terminated_at,
      terminated_by,
      termination_reason,
      passkey_used,
      metadata,
      created_at,
      updated_at,
      deleted_at
    FROM sessions
    WHERE public_id = $1
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [publicId]
  );

  return rows[0] ?? null;
}

/**
 * Find session using refresh token hash.
 */
export async function findSessionByRefreshHash(
  refreshTokenHash
) {
  const { rows } = await query(
    `
    SELECT
      id,
      public_id,
      user_id,
      device_id,
      refresh_token_hash,
      token_version,
      session_state,
      last_activity,
      expires_at,
      revoked_at,
      terminated_at,
      metadata,
      created_at
    FROM sessions
    WHERE refresh_token_hash = $1
      AND deleted_at IS NULL
    LIMIT 1;
    `,
    [refreshTokenHash]
  );

  return rows[0] ?? null;
}

/**
 * Update refresh token hash.
 * Used during refresh token rotation.
 */
export async function updateRefreshToken(
  client,
  sessionId,
  refreshTokenHash
) {
  const { rows } = await client.query(
    `
    UPDATE sessions
    SET
      refresh_token_hash = $2,
      token_version = token_version + 1,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      token_version,
      updated_at;
    `,
    [
      sessionId,
      refreshTokenHash,
    ]
  );

  return rows[0] ?? null;
}

/**
 * Update session activity.
 */
export async function updateSessionActivity(
  client,
  sessionId,
  ipAddress,
  userAgent
) {
  await client.query(
    `
    UPDATE sessions
    SET
      last_activity = NOW(),
      ip_address = $2,
      user_agent = $3,
      updated_at = NOW()
    WHERE id = $1;
    `,
    [
      sessionId,
      ipAddress,
      userAgent,
    ]
  );
}

/**
 * Update device activity.
 */
export async function updateDeviceActivity(
  client,
  deviceId,
  ipAddress,
  userAgent
) {
  await client.query(
    `
    UPDATE devices
    SET
      last_active = NOW(),
      last_ip_address = $2,
      last_user_agent = $3,
      updated_at = NOW()
    WHERE id = $1;
    `,
    [
      deviceId,
      ipAddress,
      userAgent,
    ]
  );
}
/* ============================================================
   Session Management
============================================================ */

/**
 * Revoke a single session.
 */
export async function revokeSession(
  client,
  sessionId,
  terminatedBy,
  reason = "User logout"
) {
  const { rows } = await client.query(
    `
    UPDATE sessions
    SET
      session_state = 'revoked',
      revoked_at = NOW(),
      terminated_at = NOW(),
      terminated_by = $2,
      termination_reason = $3,
      updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING
      id,
      public_id,
      session_state,
      revoked_at,
      terminated_at;
    `,
    [
      sessionId,
      terminatedBy,
      reason,
    ]
  );

  return rows[0] ?? null;
}

/**
 * Revoke all active sessions for a user.
 * (Logout from all devices)
 */
export async function revokeAllUserSessions(
  client,
  userId,
  terminatedBy,
  reason = "Logout from all devices"
) {
  const { rows } = await client.query(
    `
    UPDATE sessions
    SET
      session_state = 'revoked',
      revoked_at = NOW(),
      terminated_at = NOW(),
      terminated_by = $2,
      termination_reason = $3,
      updated_at = NOW()
    WHERE user_id = $1
      AND session_state = 'active'
      AND deleted_at IS NULL
    RETURNING
      id,
      public_id,
      device_id;
    `,
    [
      userId,
      terminatedBy,
      reason,
    ]
  );

  return rows;
}

/**
 * Terminate a session.
 * Intended for admin/security actions.
 */
export async function terminateSession(
  client,
  sessionId,
  terminatedBy,
  reason
) {
  const { rows } = await client.query(
    `
    UPDATE sessions
    SET
      session_state = 'terminated',
      terminated_at = NOW(),
      terminated_by = $2,
      termination_reason = $3,
      updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING
      id,
      public_id,
      session_state,
      terminated_at;
    `,
    [
      sessionId,
      terminatedBy,
      reason,
    ]
  );

  return rows[0] ?? null;
}

/**
 * Return all active sessions for a user.
 */
export async function findActiveSessionsByUser(
  userId
) {
  const { rows } = await query(
    `
    SELECT
      s.id,
      s.public_id,
      s.session_state,
      s.last_activity,
      s.expires_at,
      s.created_at,

      d.public_id AS device_public_id,
      d.device_name,
      d.device_type,
      d.operating_system,
      d.os_version,
      d.app_version,
      d.last_active

    FROM sessions s
    INNER JOIN devices d
      ON d.id = s.device_id

    WHERE s.user_id = $1
      AND s.session_state = 'active'
      AND s.deleted_at IS NULL
      AND d.deleted_at IS NULL

    ORDER BY s.last_activity DESC;
    `,
    [userId]
  );

  return rows;
}

/**
 * Soft-delete expired sessions.
 * Intended for scheduled cleanup jobs.
 */
export async function deleteExpiredSessions(
  client
) {
  const { rowCount } = await client.query(
    `
    UPDATE sessions
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE
      expires_at < NOW()
      AND deleted_at IS NULL;
    `
  );

  return rowCount;
}