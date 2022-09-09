import { Campagin, ICampagin, IPrize } from '../model'
import mongoose from 'mongoose'

async function AddCampagin(name: string, start: Date, end: Date): Promise<number> {
  const campagin = new Campagin({
    name: name,
    start: start,
    identifer: Math.floor(100000 + Math.random() * 900000),
    end: end,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
  await campagin.save()
  return campagin.identifer as number
}

async function findCampagin(campaginNumber: number): Promise<ICampagin | null> {
  return await Campagin.findOne({ identifer: campaginNumber })
}

async function addNewPrizes(campaginNumber: number, obj: IPrize[]): Promise<void> {
  await Campagin.updateOne({ identifer: campaginNumber }, { $set: { prizes: obj } })
}

async function updatePrizeCount(
  prizeId: mongoose.Schema.Types.ObjectId,
  campaginId: mongoose.Schema.Types.ObjectId
): Promise<void> {
  await Campagin.updateOne(
    { _id: campaginId, 'prizes._id': prizeId },
    { $inc: { 'prizes.$.remainingQuota': -1 } }
  )
}

export { AddCampagin, findCampagin, addNewPrizes, updatePrizeCount }
