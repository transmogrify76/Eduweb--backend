import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const generateAccessRefreshToken = async (userId) => {
  try {
    const student = await Student.findById(userId);
    const accessToken = student.generateAccessToken();
    const refreshToken = student.generateRefreshToken();
    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

// Register Student
export const registerStudent = asyncHandler(async (req, res) => {
  const { firstName, lastName, dob, studentId, email, password } = req.body;

  if (!firstName || !lastName || !dob || !studentId || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingStudent = await Student.findOne({ $or: [{ studentId }, { email }] });
  if (existingStudent) {
    throw new ApiError(409, "Student with this studentId or email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newStudent = await Student.create({
    firstName,
    lastName,
    dob,
    studentId,
    email,
    password: hashedPassword,
  });

  res.status(201).json(new ApiResponse(201, newStudent, "Student registered successfully"));
});

// Login Student
export const loginStudent = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;

  const student = await Student.findOne({ studentId });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const isPasswordValid = await bcrypt.compare(password.trim(), student.password.trim());
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(student._id);
  const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { student: loggedInStudent, accessToken, refreshToken }, "Login successful"));
});

// Logout Student
export const logout = asyncHandler(async (req, res) => {
  await Student.findByIdAndUpdate(req.student._id, { refreshToken: null }, { new: true });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// Get Student Data
export const getStudentData = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.student._id).select("-password -refreshToken");
  if (!student) {
    throw new ApiError(404, "Student not found");
  }
  res.status(200).json(new ApiResponse(200, student, "Student data retrieved successfully"));
});

// Refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_KEY);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const student = await Student.findById(decodedToken._id);
  if (!student) {
    throw new ApiError(401, "Student not found");
  }

  if (incomingRefreshToken !== student.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken: newRefreshToken } = await generateAccessRefreshToken(student._id);

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
});

// Change Password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const student = await Student.findById(req.student._id);

  const isPasswordCorrect = await bcrypt.compare(oldPassword, student.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Wrong password");
  }

  student.password = await bcrypt.hash(newPassword, 10);
  await student.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Update Student Details
export const updateDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !email || !lastName) {
    throw new ApiError(400, "All fields are required");
  }

  const student = await Student.findByIdAndUpdate(
    req.student._id,
    { 
      firstName, 
      lastName, 
      email 
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, student, "Student details updated"));
});
