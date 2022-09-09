import mongoose, { Document, Schema } from 'mongoose'

interface ICampagin extends Document {
  _id?: mongoose.Schema.Types.ObjectId
  name: string
  identifer: number
  start: Date
  end: Date
  createdAt: Date
  updatedAt: Date
  prizes: [IPrize]
}
interface IPrize {
  _id?: mongoose.Schema.Types.ObjectId
  name: string
  dailyQuota: number
  totalQuota: number
  remainingQuota: number
  probability: number
  createdAt: Date
  updatedAt: Date
  unlimited: boolean
  default: boolean
}
const campaginSchema: Schema = new Schema<ICampagin>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  identifer: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  start: {
    type: Date
  },
  end: {
    type: Date
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  prizes: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        index: true
      },
      default: {
        type: Boolean
      },
      name: {
        type: String
      },
      unlimited: {
        type: Boolean
      },
      dailyQuota: {
        type: Number
      },
      totalQuota: {
        type: Number
      },
      remainingQuota: {
        type: Number
      },
      probability: {
        type: Number
      },
      createdAt: {
        type: Date
      },
      updatedAt: {
        type: Date
      }
    }
  ]
})

const Campagin = mongoose.model<ICampagin>('Campagin', campaginSchema)

export { Campagin, ICampagin, IPrize }
