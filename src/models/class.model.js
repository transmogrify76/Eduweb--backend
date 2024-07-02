
import mongoose,{Schema} from "mongoose";

const ClassSchema = new Schema({
  name: { 
    type: String, 
    required: true 
},
//   teacher_id: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Teacher', required: true 
// },
  students: [{ student_id: { type: Schema.Types.ObjectId, ref: 'Student' } }],
//   grade_id: { type: Schema.Types.ObjectId, ref: 'Grade', required: true }
});

export const Class = mongoose.model('Class', ClassSchema);
