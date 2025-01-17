import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const StudentSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  dob: {
    type: Date,
    required: true,
  },

  studentId: {
    type: Number,
    required: true,
    index: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  refreshToken: {
    type: String,
  },

  class: {
    type: Number
  },

  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Parent',
    unique: true,
  },

}, { timestamps: true });


StudentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});


StudentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);

};


StudentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      studentId: this.studentId,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    }
  );
};


StudentSchema.methods.generateRefreshToken = function () {
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

export const Student = mongoose.model("Student", StudentSchema);
