import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

export const generateAccessToken = (user: {
  _id: Types.ObjectId
  email: string
  role: string
}): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions)
}

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as jwt.SignOptions
  )
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
}

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string }
}

export const generateEmailVerificationToken = (userId: string): string => {
  return jwt.sign(
    { 
      type: 'email_verification', 
      userId,
      timestamp: Date.now() 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
}

export const generatePasswordResetToken = (): string => {
  return jwt.sign(
    { type: 'password_reset', timestamp: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )
}