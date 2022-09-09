import { Draw } from '../../model'
import mongoose from 'mongoose'

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

describe('save', () => {
  it('should save draw result', async () => {
    const mobile = '99991111'
    const prizeId = new mongoose.Types.ObjectId()
    const campaginId = new mongoose.Types.ObjectId()
    const draw = new Draw({
      mobile: mobile,
      date: Date.now(),
      prizeId: prizeId,
      campaginId: campaginId
    })
    await draw.save()

    const fetched = await Draw.findOne({ _id: draw._id })
    expect(fetched).not.toBeNull()
    expect(fetched?.mobile).toBe(mobile)
    expect(fetched?.prizeId).toStrictEqual(prizeId)
    expect(fetched?.campaginId).toStrictEqual(campaginId)
  })
})
