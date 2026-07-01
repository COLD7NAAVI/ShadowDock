import { Router } from "express";

import healthRoutes from "./v1/health.routes.js";
import authRoutes from "./v1/auth.routes.js";
import messageRoutes from "./v1/message.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);

export default router;