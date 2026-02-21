import { type Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  gitHubId: string;
  accessToken: string;
  commitedToday: boolean;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  gitHubId: { type: String, required: true },
  accessToken: { type: String, required: true },
  commitedToday: { type: Boolean, required: true },
  avatarUrl: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const User = model<IUser>("User", userSchema);

export default User;
