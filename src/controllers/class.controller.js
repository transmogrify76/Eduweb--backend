import asyncHandler from "../utils/asyncHandler";
import { Class } from "../models/class.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";



export const clssGenerator = asyncHandler(async (req,res)=>{   

    const { gradeName } =  req.body

    if (!gradeName){
        throw new ApiError(400,"All fields are required")
    }
    const classexists = await Class.findone({gradeName})

    if(classexists){
        throw new ApiError(400,"The class is already exists")
    }
    const newClass = await Class.create({
        gradeName
    })
    return res.json(new ApiResponse(200,newClass,"New class is successfully generated"))
})

export const allStudent = asyncHandler(async (req,res)=>{
    const { } = req.body
})