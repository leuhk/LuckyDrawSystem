import { Draw } from '../../model'
import mongoose from 'mongoose'
import { findLastDraw, addOneDraw, findDailyPrizeCount } from '../../service'
import * as db from '../db'

beforeAll(async () => {
  await db.connect()
})
afterEach(async () => {
  await db.clearDatabase()
})
afterAll(async () => {
  await db.closeDatabase()
})

describe('addOneDraw', () => {
  it('should save a new draw result', async () => {
    const mobile = '99991111'
    const prizeId = new mongoose.Types.ObjectId()
    const campaginId = new mongoose.Types.ObjectId()

    await addOneDraw(
      mobile,
      prizeId as unknown as mongoose.Schema.Types.ObjectId,
      campaginId as unknown as mongoose.Schema.Types.ObjectId
    )

    const fetched = await Draw.findOne({ mobile: mobile })
    expect(fetched).not.toBeNull()
    expect(fetched?.prizeId).toStrictEqual(prizeId)
    expect(fetched?.campaginId).toStrictEqual(campaginId)
  })
})

describe('findLastDraw', () => {
  it('should find the last draw', async () => {
    const mobile = '99991111'
    const prizeId1 = new mongoose.Types.ObjectId('6318685fb99cb9601160a48c')
    const prizeId2 = new mongoose.Types.ObjectId('6318685fb99cb9601160a48d')
    const campaginId = new mongoose.Types.ObjectId()

    const draw1 = new Draw({
      mobile: mobile,
      date: new Date(2020, 1, 1),
      prizeId: prizeId1,
      campaginId: campaginId
    })
    await draw1.save()
    const draw2 = new Draw({
      mobile: mobile,
      date: new Date(2022, 1, 1),
      prizeId: prizeId2,
      campaginId: campaginId
    })
    await draw2.save()

    const result = await findLastDraw(
      mobile,
      campaginId as unknown as mongoose.Schema.Types.ObjectId
    )

    expect(result).not.toBeNull()
    expect(result![0].prizeId).toStrictEqual(prizeId2)
  })
})

describe('findDailyPrizeCount', () => {
  it('should return the number of prize drawed todays', async () => {
    const mobile = '99991111'
    const mobile2 = '81723333'
    const prizeId = new mongoose.Types.ObjectId('6318685fb99cb9601160a48c')
    const campaginId = new mongoose.Types.ObjectId('6318685fb99cb9601160a48d')

    const draw1 = new Draw({
      mobile: mobile,
      date: Date.now(),
      prizeId: prizeId,
      campaginId: campaginId
    })
    await draw1.save()
    const draw2 = new Draw({
      mobile: mobile2,
      date: Date.now(),
      prizeId: prizeId,
      campaginId: campaginId
    })
    await draw2.save()

    const result = await findDailyPrizeCount(
      prizeId as unknown as mongoose.Schema.Types.ObjectId,
      campaginId as unknown as mongoose.Schema.Types.ObjectId
    )

    expect(result).toBe(2)
  })
})
