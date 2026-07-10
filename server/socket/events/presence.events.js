import {
  markUserOnline,
  markUserOffline,
} from "../../services/user.service.js";

import {
  registerSocket,
  removeSocket,
  getUserSockets,
} from "../socketStore.js";

/**
 * ============================================================
 * ShadowDock Messenger
 * Presence Events
 * ============================================================
 *
 * Handles:
 *
 * • User Online
 * • User Offline
 * • Presence Broadcasting
 * • Multi-device Presence
 * • Last Seen Updates
 *
 * ------------------------------------------------------------
 * IMPORTANT
 * ------------------------------------------------------------
 *
 * This module DOES NOT:
 *
 * ❌ Access PostgreSQL directly
 * ❌ Import repositories
 * ❌ Contain business logic
 *
 * Everything database related goes through
 * the Service Layer.
 *
 * Architecture:
 *
 * Socket
 *   ↓
 * Presence Events
 *   ↓
 * User Service
 *   ↓
 * Repository
 *   ↓
 * PostgreSQL
 *
 * ============================================================
 */


/* ============================================================
 * Event Names
 * ============================================================
 */

const EVENTS = {
  ONLINE: "presence:online",

  OFFLINE: "presence:offline",
};


/* ============================================================
 * Broadcast Helpers
 * ============================================================
 */

/**
 * Broadcast that a user has come online.
 *
 * @param {Server} io
 * @param {Object} user
 */
function broadcastOnline(
  io,
  user
) {
  io.emit(
    EVENTS.ONLINE,
    {
      userId: user.public_id,

      username: user.username,

      isOnline: true,
    }
  );
}

/**
 * Broadcast that a user has gone offline.
 *
 * @param {Server} io
 * @param {Object} user
 */
function broadcastOffline(
  io,
  user
) {
  io.emit(
    EVENTS.OFFLINE,
    {
      userId: user.public_id,

      username: user.username,

      isOnline: false,

      lastSeen:
        new Date().toISOString(),
    }
  );
}


/* ============================================================
 * Online Lifecycle
 * ============================================================
 */

/**
 * Marks a user online if this is their
 * first active socket.
 *
 * Supports:
 *
 * Desktop
 * Mobile
 * Tablet
 *
 * Only the FIRST connected device updates
 * the database.
 *
 * Every additional device only updates the
 * in-memory socket store.
 *
 * @param {Server} io
 * @param {Socket} socket
 * @param {Object} user
 */
async function handleUserOnline(
  io,
  socket,
  user
) {
  try {
    /*
    ----------------------------------------
    Register socket
    ----------------------------------------
    */

    registerSocket(
      user.id,
      socket
    );

    /*
    ----------------------------------------
    Count active sockets
    ----------------------------------------
    */

    const socketCount =
      getUserSockets(
        user.id
      );

    /*
    ----------------------------------------
    Already online on another device.
    Nothing to update.
    ----------------------------------------
    */

    if (socketCount > 1) {
      console.log(
        `🟢 ${user.username} connected from another device (${socketCount} active sockets)`
      );

      return;
    }

    /*
    ----------------------------------------
    First active connection.
    Mark database online.
    ----------------------------------------
    */

    await markUserOnline(
      user.id
    );

    console.log(
      `🟢 ${user.username} is now ONLINE`
    );

    /*
    ----------------------------------------
    Broadcast presence
    ----------------------------------------
    */

    broadcastOnline(
      io,
      user
    );

  } catch (err) {
    console.error(
      "Presence Online Error:",
      err
    );
  }
}
/* ============================================================
 * Offline Lifecycle
 * ============================================================
 */

/**
 * Marks a user offline only when their
 * LAST active socket disconnects.
 *
 * Multi-device example:
 *
 * Laptop
 * Phone
 * Tablet
 *
 * Socket Count:
 *
 * 3 → 2 → 1
 *
 * Still online.
 *
 * Only when:
 *
 * 1 → 0
 *
 * We update:
 *
 * is_online = false
 * last_seen = NOW()
 *
 * @param {Server} io
 * @param {Socket} socket
 * @param {Object} user
 */
async function handleUserOffline(
  io,
  socket,
  user
) {
  try {
    /*
    ----------------------------------------
    Remove socket
    ----------------------------------------
    */

    removeSocket(
      user.id,
      socket.id
    );

    /*
    ----------------------------------------
    Remaining sockets
    ----------------------------------------
    */

    const socketCount =
      getUserSockets(
        user.id
      );

    /*
    ----------------------------------------
    User still connected elsewhere.
    ----------------------------------------
    */

    if (socketCount > 0) {
      console.log(
        `🟢 ${user.username} still online (${socketCount} active sockets)`
      );

      return;
    }

    /*
    ----------------------------------------
    Last socket disconnected.
    ----------------------------------------
    */

    await markUserOffline(
      user.id
    );

    console.log(
      `🔴 ${user.username} is now OFFLINE`
    );

    /*
    ----------------------------------------
    Broadcast Offline
    ----------------------------------------
    */

    broadcastOffline(
      io,
      user
    );

  } catch (err) {
    console.error(
      "Presence Offline Error:",
      err
    );
  }
}


/* ============================================================
 * Presence Synchronization Helpers
 * ============================================================
 */

/**
 * Logs current socket count.
 *
 * Useful during development
 * and debugging.
 *
 * @param {Object} user
 */
function logPresenceState(
  user
) {
  const count =
    getUserSockets(
      user.id
    );

  console.log(
    `👤 ${user.username} has ${count} active socket(s)`
  );
}


/**
 * Handles successful authentication.
 *
 * Called immediately after
 * Socket Authentication middleware.
 *
 * @param {Server} io
 * @param {Socket} socket
 */
async function initializePresence(
  io,
  socket
) {
  const user =
    socket.user;

  if (!user) {
    return;
  }

  await handleUserOnline(
    io,
    socket,
    user
  );

  logPresenceState(user);
}


/**
 * Handles socket disconnect.
 *
 * @param {Server} io
 * @param {Socket} socket
 * @param {string} reason
 */
async function destroyPresence(
  io,
  socket,
  reason
) {
  const user =
    socket.user;

  if (!user) {
    return;
  }

  console.log(
    `⚫ Disconnect reason: ${reason}`
  );

  await handleUserOffline(
    io,
    socket,
    user
  );

  logPresenceState(user);
}
/* ============================================================
 * Presence Event Registration
 * ============================================================
 *
 * Registers every presence-related Socket.IO event.
 *
 * Responsibilities:
 *
 * • Initialize presence
 * • Cleanup on disconnect
 * • Future heartbeat support
 * • Future manual status support
 *
 * ============================================================
 */

export default function registerPresenceEvents(
  io,
  socket
) {

  /*
  ------------------------------------------------------------
  User Connected
  ------------------------------------------------------------
  */

  initializePresence(
    io,
    socket
  ).catch((err) => {

    console.error(
      "Presence initialization failed:",
      err
    );

  });

  /*
  ------------------------------------------------------------
  Disconnect
  ------------------------------------------------------------
  */

  socket.on(
    "disconnect",
    async (reason) => {

      try {

        await destroyPresence(
          io,
          socket,
          reason
        );

      } catch (err) {

        console.error(
          "Presence cleanup failed:",
          err
        );

      }

    }
  );

  /*
  ------------------------------------------------------------
  Future Events
  ------------------------------------------------------------
  */

  /*
  socket.on(
      "presence:heartbeat",
      ...
  );

  socket.on(
      "presence:away",
      ...
  );

  socket.on(
      "presence:busy",
      ...
  );

  socket.on(
      "presence:invisible",
      ...
  );
  */

}

/* ============================================================
 * Module Summary
 * ============================================================
 *
 * Features
 * --------
 *
 * ✓ Online Presence
 * ✓ Offline Presence
 * ✓ Multi-device Support
 * ✓ Socket Counting
 * ✓ Last Seen Updates
 * ✓ Presence Broadcasting
 * ✓ Clean Error Handling
 * ✓ Service-layer Integration
 *
 * Architecture
 * ------------
 *
 * Socket
 *   ↓
 * Presence Events
 *   ↓
 * User Service
 *   ↓
 * User Repository
 *   ↓
 * PostgreSQL
 *
 * Future Ready
 * ------------
 *
 * ✓ Redis Adapter
 * ✓ Horizontal Scaling
 * ✓ Presence Heartbeats
 * ✓ Manual Status (Away/Busy)
 * ✓ Invisible Mode
 * ✓ Friend-only Presence
 * ✓ Cluster Synchronization
 *
 * ============================================================
 */