import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const generateAccessRefreshToken = async(userid)=>{
    try {
      const student = await Student.findById(userid)
      const accessToken = student.generateAccessToken();
      const refreshToken = student.generateRefreshToken();
      student.refreshToken = refreshToken;
      await student.save({ validateBeforeSave: false })


      return {accessToken,refreshToken}

    } catch (error) {
      throw new ApiError(500,"something went wrong")
    }
}


//  payload = {
//   "firstName": "sagnik",
//   "lastName": "ghosh",
//   "dob": "2000-01-01",
//   "studentId": "12345",
//   "email": "abcd@example.com",
//   "password": "Test@2024"
// } 

export const registerStudent = asyncHandler(async (req, res) => {
  const { firstName, lastName, dob, studentId, email, password } = req.body;


  if (!firstName || !lastName || !dob || !studentId || !email || !password ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingStudent = await Student.findOne({ $or: [{ studentId }, { email }] });
  if (existingStudent) {
    throw new ApiError(409, "Student with this studentId or email already exists");
  }

  const newStudent = await Student.create({
    firstName,
    lastName,
    dob,
    studentId,
    email,
    password,

  });

  return res.status(201).json(new ApiResponse(201, newStudent, "Student registered successfully"));
  
});

// login ={
//   "studentId": "12345",
//   "password": "password"
// }

export const loginStudent = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;


  const student = await Student.findOne({ studentId });
  console.log (student)
  if (!student) {
    throw new ApiError(404, "Student not found");
  }
  console.log("Provided Password:", password);
  console.log("Stored Hashed Password:", student.password);

  const isPasswordValid = await bcrypt.compare(password.trim(), student.password.trim());
  console.log(isPasswordValid)


  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }
  const {accessToken,refreshToken} = await generateAccessRefreshToken(student._id)
  const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken ")
  
  const options = {
    httpOnly: true,
    secure:true
  }

  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200, 
    {
      student:loggedInStudent,accessToken,refreshToken
    }, "Login successful"));
});




export const logout = asyncHandler(async (req,res)=>{
    await Student.findByIdAndUpdate(req.student._id,
      {
        $set: {
          refreshToken: null
        }
      },
      {
        new:true
      }
    )
    const options={
      httpOnly: true,
      secure:true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})




export const getStudentData = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.student._id).select("-password -refreshToken");
  if (!student) {
    throw new ApiError(404, "Student not found");
  }
  res.status(200).json(new ApiResponse(200, student, "Student data retrieved successfully"));
});




export const refreshAccessToken = asyncHandler(async(req,res) =>{
  const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
 

  if(!incomingrefreshToken){
    throw new ApiError(401,"no refreshToken")
  }
  const decodedToken = jwt.verify(
    incomingrefreshToken,process.env.REFRESH_TOKEN_KEY
  )

  const student = Student.findById(decodedToken?._id)
  if(!student){
    throw new ApiError(401,"no student found")
  }
  if(incomingrefreshToken !== student?.refreshToken){
    throw new ApiError(401,"refresh Token is expired or used")
  }
  const options = {
    httpOnly:true,
    secure:true
  }
  const {accessToken,newrefreshToken} = await generateAccessRefreshToken(student._id)

  return res.status(200).Cookie("accessToken",accessToken,options).clearCookie("refreshToken",newrefreshToken,options)
  .json(
    new ApiResponse(200,
      {
        accessToken, 
        refreshToken:newrefreshToken
      },
      "Access token Refreshed"
    )
  )
})



export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old and new passwords are required');
  }
  const student = await Student.findById(req.student?._id);
  console.log()

  if (!student) {
    throw new ApiError(404, "Student not found");
  }
  
  console.log('oldPassword:', oldPassword);
  console.log('student.password:', student.password);

  const isPasswordValid = await bcrypt.compare(oldPassword, student.password);
  console.log(isPasswordValid);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Wrong password");
  }

  student.password = newPassword;
  
  await student.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});









