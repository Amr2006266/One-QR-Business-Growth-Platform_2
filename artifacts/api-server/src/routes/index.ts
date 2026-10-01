import { Router } from "express";
import healthRouter from "./health";
import businessesRouter from "./businesses";
import publicRouter from "./public";
import analyticsRouter from "./analytics";
import adminRouter from "./admin";
import authRouter from "./auth";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(businessesRouter);
router.use(publicRouter);
router.use(analyticsRouter);
router.use("/admin", adminRouter);

export default router;
