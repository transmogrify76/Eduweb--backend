import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Parent } from "../models/parent.model.js";
import { Student } from "../models/student.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";


const generateAccessRefreshToken = async(id) =>{
    try {
       const parent = Parent.findById({id}) ;
       const accessToken = parent.generateAccessToken();
       const refreshToken = parent.generateRefreshToken();
       parent.refreshToken = refreshToken
       await parent.save({ validateBeforeSave: false })


       return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
}

export const parentRegister = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, email, dob, aadharNo, password, studentId } = req.body;
  
    if (!firstName || !lastName || !phone || !email || !dob || !aadharNo || !password || !studentId) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existingParent = await Parent.findOne({ email });
    
    if (existingParent) {
      throw new ApiError(409, "Parent already exists");
    }
  
    const student = await Student.findOne({ studentId });
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    if (student.parent) {
      throw new ApiError(409, "Student already has a parent");
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newParent = await Parent.create({
      firstName,
      lastName,
      phone,
      email,
      dob,
      aadharNo,
      password: hashedPassword,
      studentId: student._id,
    });
   
    student.parent = newParent._id;
    await student.save({ validateBeforeSave: false });
  
    return res.status(201).json(new ApiResponse(201, newParent, "New Parent Created Successfully"));
  });




export const loginParent = asyncHandler(async(req,res)=>{
    const { email ,password } = req.body;

    if(!email || !password){
        throw new ApiError(400,"email and password is required")
    }
    const parent = Parent.findOne({email})
    console.log(parent);
    const isPasswordCorrect = await bcrypt.compare(password,parent.password);

    if(!isPasswordCorrect){
        throw new ApiError(400,"password is no correct")
    }
    const {accessToken,refreshToken} = generateAccessRefreshToken(parent._id)

    const loggedInParent = await Parent.findById(parent._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).
    json(200,new ApiResponse(200,{
        loggedInParent,
        accessToken,
        refreshToken
    }))

})


export const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    const parent = await Parent.findById(req.parent._id)

    if (!oldPassword || !newPassword){
        throw new ApiError(400,"Old and new passwords are required")
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword,parent.password)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Password is not currect")
    }
    parent.password = newPassword;
    parent.save({validateBeforeSave:false});
    return es.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
})

export const updateDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, email } = req.body;
  
    if (!firstName || !lastName || !email || !aadharNo) {
      throw new ApiError(400, "All fields are required");
    }
  
    const parent = await Parent.findByIdAndUpdate(
      req.parent._id,
      { firstName, lastName, email, aadharNo },
      { new: true }
    ).select("-password");
  
    return res.status(200).json(new ApiResponse(200, parent, "Student details updated"));
  });
  










