import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  grade: string;
  guardianName: string;
  guardianPhone: string;
  dob?: Date;
  address?: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    dob: { type: Date },
    address: { type: String },
  },
  { timestamps: true }
);

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export default Student;