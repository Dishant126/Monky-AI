import mongoose, { Document, Schema } from 'mongoose'

export interface ICode extends Document {
  userId: string
  title: string
  code: string
  language: string
  createdAt: Date
  updatedAt: Date
}

const CodeSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    default: 'javascript',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
CodeSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default (mongoose.models.Code as mongoose.Model<ICode>) || mongoose.model<ICode>('Code', CodeSchema)
