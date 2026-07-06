import { Router } from "express";
import healthRoutes from "./v1/health.routes.js";
import authRoutes from "./v1/auth.routes.js";
import messageRoutes from "./v1/message.routes.js";
import userRoutes from "./v1/user.routes.js";
import friendRoutes from "./v1/friend.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);

router.use(
  "/users",
  userRoutes
);
router.use(
  "/friends",
  friendRoutes
);

export default router;