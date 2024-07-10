import { Router } from "express";
import { registerStudent, loginStudent, logout, getStudentData, refreshAccessToken, changeCurrentPassword } from "../controllers/student.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.route("/logout").post(verifyJWT,logout);
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.get("/data",verifyJWT, getStudentData);
router.post("/refresh-token",refreshAccessToken)




export default router;