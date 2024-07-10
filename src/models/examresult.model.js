import mongoose,{Schema} from "mongoose"
import { Student } from "./student.model"

const examSchema = new Schema({
    StudentName:{
        type: Schema.Types.ObjectId, 
        ref: 'Student', required: true  
    },
    subject:{
      type:String  
    } ,
    subject_no:{
      type:Number,
      required:true
    }
})