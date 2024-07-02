import { Router } from "express";
import { registerStudent, loginStudent,logout,getStudentData, refreshAccessToken } from "../controllers/student.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.route("/logout").post(verifyJWT,logout);
router.get("/data",verifyJWT, getStudentData);
router.post("/refresh-token",refreshAccessToken)

export default router;