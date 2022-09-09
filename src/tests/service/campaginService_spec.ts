import { Campagin, IPrize } from '../../model'
import mongoose from 'mongoose'
import { AddCampagin, findCampagin, addNewPrizes, updatePrizeCount } from '../../service'
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

describe('AddCampagin', () => {
  it('should save new campagin', async () => {
    const name = 'Test Campagin'
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)

    const result = await AddCampagin(name, start, end)

    const fetched = await Campagin.findOne({ name: name })
    expect(fetched).not.toBeNull()
    expect(fetched?.name).toBe(name)
    expect(result).toBe(fetched?.identifer)
  })
})

describe('findCampagin', () => {
  it('should existing campagin', async () => {
    const name = 'Test Campagin'
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)

    const campagin = await AddCampagin(name, start, end)
    const result = await findCampagin(campagin)
    expect(result?.name).toBe(name)
    expect(result?.start).toStrictEqual(start)
    expect(result?.end).toStrictEqual(end)
  })
})

describe('AddNewPrizes', () => {
  it('should add prizes to existing campagin', async () => {
    const name = 'Test Campagin'
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)

    const campagin = await AddCampagin(name, start, end)
    const prizes: IPrize[] = [
      {
        name: '$50 coupon',
        unlimited: false,
        dailyQuota: 100,
        totalQuota: 200,
        probability: 80,
        default: false,
        createdAt: Date.now() as unknown as Date,
        updatedAt: Date.now() as unknown as Date,
        remainingQuota: 50
      },
      {
        name: 'No Prize',
        unlimited: true,
        dailyQuota: 100,
        totalQuota: 200,
        probability: 20,
        default: true,
        createdAt: Date.now() as unknown as Date,
        updatedAt: Date.now() as unknown as Date,
        remainingQuota: 50
      }
    ]
    await addNewPrizes(campagin, prizes)
    const fetched = await Campagin.findOne({ identifer: campagin })
    expect(fetched?.prizes.length).toBe(2)
    expect(fetched?.prizes[0].name).toBe('$50 coupon')
    expect(fetched?.prizes[0].dailyQuota).toBe(100)
    expect(fetched?.prizes[0].probability).toBe(80)
    expect(fetched?.prizes[0].remainingQuota).toBe(50)
  })
})

describe('UpdatePrizeCount', () => {
  it('should add prizes to existing campagin', async () => {
    const name = 'Test Campagin'
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)

    const campagin = await AddCampagin(name, start, end)
    const prizes: IPrize[] = [
      {
        name: '$50 coupon',
        unlimited: false,
        dailyQuota: 100,
        totalQuota: 200,
        probability: 80,
        default: false,
        createdAt: Date.now() as unknown as Date,
        updatedAt: Date.now() as unknown as Date,
        remainingQuota: 50
      },
      {
        name: 'No Prize',
        unlimited: true,
        dailyQuota: 100,
        totalQuota: 200,
        probability: 20,
        default: true,
        createdAt: Date.now() as unknown as Date,
        updatedAt: Date.now() as unknown as Date,
        remainingQuota: 50
      }
    ]
    await addNewPrizes(campagin, prizes)

    const fetched = await Campagin.findOne({ identifer: campagin })
    const campaginId = fetched?._id as unknown as mongoose.Schema.Types.ObjectId
    const prizeId = fetched?.prizes[0]._id as unknown as mongoose.Schema.Types.ObjectId

    await updatePrizeCount(prizeId, campaginId)

    const record = await Campagin.findOne({ identifer: campagin })
    expect(record?.prizes[0].remainingQuota).toBe(49)
  })
})
