import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
    console.log("Token:", token); // Log the token

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token is not present");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    console.log("Decoded Token:", decodedToken); // Log the decoded token

    const student = await Student.findById(decodedToken._id).select("-password");
    if (!student) {
      throw new ApiError(401, "Unauthorized: Invalid access token");
    }

    req.student = student;
    next();
    
  } catch (error) {
    console.error("Error:", error); 
    throw new ApiError(401, error.message || "Unauthorized: Invalid access token");
  }
});
export default verifyJWT;