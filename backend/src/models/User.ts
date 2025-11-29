import { Schema, model, type Document, type Types } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    organization: { type: String }
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", UserSchema);
