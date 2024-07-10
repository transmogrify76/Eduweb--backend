import mongoose, {Schema} from "mongoose";

const ClassSchema = new Schema({

  gradeName: { 
    type: String, 
    required: true 
  },

  classTeacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', required: true 
  },

  students: [{ student_id: { type: Schema.Types.ObjectId, ref: 'Student' } }],

});

export const Class = mongoose.model('Class', ClassSchema);
