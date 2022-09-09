import { Campagin } from '../../model'
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
  it('should save campagin', async () => {
    const name = 'Test Campagin'
    const identifer = 123456
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)
    const createdAt = Date.now()
    const updatedAt = Date.now()

    const campagin = new Campagin({
      name: name,
      start: start,
      identifer: identifer,
      end: end,
      createdAt: createdAt,
      updatedAt: updatedAt
    })
    await campagin.save()

    const fetched = await Campagin.findOne({ _id: campagin._id })
    expect(fetched).not.toBeNull()
    expect(fetched?.name).toBe(name)
    expect(fetched?.identifer).toBe(identifer)
  })
  it('should fail to save', async () => {
    const campagin = new Campagin({})
    expect(campagin.save()).rejects.toThrowError(
      'Campagin validation failed: identifer: Path `identifer` is required., name: Path `name` is required.'
    )
  })
})

describe('update', () => {
  it('should update campagin name', async () => {
    const name = 'Test Campagin'
    const identifer = 123456
    const start = new Date(2020, 1, 1)
    const end = new Date(2023, 1, 1)
    const createdAt = Date.now()
    const updatedAt = Date.now()

    const campagin = new Campagin({
      name: name,
      start: start,
      identifer: identifer,
      end: end,
      createdAt: createdAt,
      updatedAt: updatedAt
    })
    const campagin1 = await campagin.save()
    const name2 = 'new Campagin'
    campagin1.name = name2
    const campagin2 = await campagin1.save()
    expect(campagin2.name).toEqual(name2)
  })
})
