import mongoose, { Document, Schema } from 'mongoose'

export interface IDebugHistory extends Document {
  userId: string
  errorMessage: string
  analysis?: string
  fixedCode: string
  codeSnippetId?: string | null
  createdAt: Date
}

const DebugHistorySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  errorMessage: {
    type: String,
    required: true,
  },
  analysis: {
    type: String,
  },
  fixedCode: {
    type: String,
    required: true,
  },
  codeSnippetId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default (mongoose.models.DebugHistory as mongoose.Model<IDebugHistory>) || mongoose.model<IDebugHistory>('DebugHistory', DebugHistorySchema)
