import { Router } from "express";

import { registerStudent, loginStudent, logout, getStudentData, refreshAccessToken , updateDetails, changeCurrentPassword} from "../controllers/student.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router();


//student registration
router.post("/register", registerStudent);

//student login
router.post("/login", loginStudent);

//student logout
router.route("/logout").post(verifyJWT,logout);

//student password change
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

//get data of a particular student 
router.get("/data",verifyJWT, getStudentData);

//regresh accesstoken for a logged in student
router.post("/refresh-token",refreshAccessToken)

//parent register
router.post("/register-parent",)

//changing password
router.post("/change-password", verifyJWT, changeCurrentPassword);

// Update student details
router.put("/update-details", verifyJWT, updateDetails);

export default router;