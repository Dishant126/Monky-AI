import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from './db'
import User from './models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    await dbConnect()
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) return null

    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
    }
  } catch (error) {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) return null

    return await verifyToken(token)
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getUserFromRequest(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
