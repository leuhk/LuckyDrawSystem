import mongoose from 'mongoose'
import { Draw, IDraw } from '../model/index'

async function findLastDraw(
  mobile: string,
  campaginId: mongoose.Schema.Types.ObjectId
): Promise<Array<IDraw> | null> {
  try {
    return await Draw.find({ mobile: mobile, campaginId: campaginId }).sort({ date: -1 }).limit(1)
  } catch (err) {
    throw new Error((err as Error).message)
  }
}

async function addOneDraw(
  mobile: string,
  prizeId: mongoose.Schema.Types.ObjectId,
  campaginId: mongoose.Schema.Types.ObjectId
): Promise<void> {
  const draw = new Draw({
    mobile: mobile,
    date: Date.now(),
    campaginId: campaginId,
    prizeId: prizeId
  })
  await draw.save()
  return
}

async function findDailyPrizeCount(
  prizeId: mongoose.Schema.Types.ObjectId,
  campaginId: mongoose.Schema.Types.ObjectId
): Promise<number> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return await Draw.find({
    prizeId: prizeId,
    campaginId: campaginId,
    date: { $gte: startOfToday }
  }).count()
}
export { findLastDraw, addOneDraw, findDailyPrizeCount }
