import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { getRandomAvatar } from '@/lib/constants/avatars'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar?: string
  bio?: string
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: getRandomAvatar,
  },
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this as IUser

  if (!user.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash(user.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema)
