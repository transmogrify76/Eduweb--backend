import mongoose,{Schema} from "mongoose";
import { Student } from "./student.model.js";


const ParentSchema = new Schema({
  firstName: { 
    type: String,
    required: true 
},
  lastName: { 
    type: String, 
    required: true 
},
  phone: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true 
},

password:{
    type:String,
    required:[true,'password is requred']
},

refreshToken:{
    type:String,
},
  students: [{ student_id: { type: Schema.Types.ObjectId, ref: 'Student' } }]
},
{ timestamps: true }
);

export const Parent = mongoose.model('Parent',ParentSchema)
