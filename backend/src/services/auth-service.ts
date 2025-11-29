import bcrypt from "bcryptjs";
import { UserModel, type UserDocument } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

const SALT_ROUNDS = 10;

export async function registerUser(params: { email: string; password: string; name?: string }): Promise<UserDocument> {
  const existing = await UserModel.findOne({ email: params.email.toLowerCase() }).exec();
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const user = await UserModel.create({
    email: params.email.toLowerCase(),
    passwordHash,
    name: params.name
  });

  logger.info({ userId: user.id }, "User registered");
  return user;
}

export async function authenticateUser(params: { email: string; password: string }): Promise<UserDocument> {
  const user = await UserModel.findOne({ email: params.email.toLowerCase() }).exec();
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(params.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  return user;
}

export function createSessionToken(user: UserDocument): string {
  return signToken({ sub: user.id, email: user.email });
}
