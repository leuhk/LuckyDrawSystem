import mongoose, { Schema, Document } from 'mongoose'

interface IDraw extends Document {
  mobile: string
  date: Date
  prizeId: mongoose.Schema.Types.ObjectId
  campaginId: mongoose.Schema.Types.ObjectId
}

const DrawSchema: Schema = new Schema<IDraw>({
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  prizeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  campaginId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

const Draw = mongoose.model<IDraw>('Draw', DrawSchema)

export { Draw, IDraw }
