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
  
  dob: { 
    type: Date, 
    required: true 
  },

  aadharNo:{
    type:String,
    required:true
  },

  refreshToken:{
    type:String,
  },

  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student' 
   }
},

{ timestamps: true }

);


// ParentSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   try {
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

ParentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

ParentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      aadharNo:this.aadharNo
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    }
  );
};


ParentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXP,
    }
  );
};

export const Parent = mongoose.model('Parent',ParentSchema)
