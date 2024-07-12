import { Router } from "express";
import { parentRegister } from "../controllers/parents.controller.js";
const router = Router();

router.post("/register", parentRegister);

export default router;