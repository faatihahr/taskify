import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client";
import { signToken, UserPayload } from "../utils/jwt";

interface AuthResponse {
  user_id: string;
  name: string;
  email: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

// REGISTER
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Validasi sederhana
  if (!email.match(/@/) || password.length < 6) {
    throw new Error("Invalid email or password");
  }

  // Cek apakah email sudah ada
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });

  // Buat JWT token
  const payload: UserPayload = {
    id: user.id,
  };
  const token = signToken(payload);

  return {
    user_id: user.id,
    name: user.name!,
    email: user.email,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// LOGIN
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (!user.password) throw new Error("Password not set for this user");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const payload: UserPayload = { id: user.id };
  const token = signToken(payload);

  return {
    user_id: user.id,
    name: user.name!,
    email: user.email,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
