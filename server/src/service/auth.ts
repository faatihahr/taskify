import bcrypt from 'bcryptjs'
import { prisma } from '../prisma/client'
import { signToken, UserPayload } from '../utils/jwt'

interface AuthResponse {
  user_id: string
  name: string
  email: string
  token: string
  createdAt: Date
  updatedAt: Date
}

function withTimeout<T>(p: Promise<T>, ms: number, message = 'Operation timed out') {
  let timeout: NodeJS.Timeout
  const t = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([p, t]) as Promise<T>
}

// REGISTER (kept simple)
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  if (!email.match(/@/) || password.length < 6) {
    throw new Error('Invalid email or password')
  }
  const existingUser = await withTimeout(
    prisma.user.findUnique({ where: { email } }),
    Number(process.env.DB_QUERY_TIMEOUT || 5000),
    'DB lookup timed out'
  )
  if (existingUser) throw new Error('Email already registered')
  const hashed = await bcrypt.hash(password, 10)
  const user = await withTimeout(
    prisma.user.create({ data: { name, email, password: hashed } }),
    Number(process.env.DB_QUERY_TIMEOUT || 5000),
    'DB create timed out'
  )
  const payload: UserPayload = { id: user.id }
  const token = signToken(payload)
  return {
    user_id: user.id,
    name: user.name!,
    email: user.email,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// LOGIN - simplified with timeout + logs
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  console.log('loginUser: start for', email)
  if (!process.env.DATABASE_URL) {
    console.warn('loginUser: DATABASE_URL not set')
  }
  try {
    const user = await withTimeout(
      prisma.user.findUnique({ where: { email } }),
      Number(process.env.DB_QUERY_TIMEOUT || 5000),
      'DB lookup timed out'
    )
    console.log('loginUser: user lookup done for', email)
    if (!user) throw new Error('User not found')
    if (!user.password) throw new Error('Password not set for this user')
    const isMatch = await withTimeout(bcrypt.compare(password, user.password), 3000, 'bcrypt timed out')
    if (!isMatch) throw new Error('Incorrect password')
    const payload: UserPayload = { id: user.id }
    const token = signToken(payload)
    return {
      user_id: user.id,
      name: user.name!,
      email: user.email,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (err) {
    console.error('loginUser: error for', email, err instanceof Error ? err.message : err)
    throw err
  }
}
