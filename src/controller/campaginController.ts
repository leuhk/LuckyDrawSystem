import {
  AddCampagin,
  findCampagin,
  addNewPrizes,
  findLastDraw,
  addOneDraw,
  findDailyPrizeCount,
  updatePrizeCount
} from '../service/index'
import { ICampagin, IDraw, IPrize } from '../model'
import mongoose from 'mongoose'

interface AddCampaginEntity {
  name: string
  start: string
  end: string
}

interface AddPrizeEntity {
  campaginNumber: number
  prize: [
    {
      name: string
      unlimited: boolean
      dailyQuota: number
      totalQuota: number
      probability: number
      default: boolean
    }
  ]
}

type NewDrawEntity = {
  mobile: string
  campaginNumber: number
}

async function createCampagin(obj: AddCampaginEntity): Promise<number> {
  try {
    const startDate = new Date(obj.start.toString())
    const endDate = new Date(obj.end.toString())
    if (startDate >= endDate) {
      throw Error('endDate must be greater than startDate')
    }
    return await AddCampagin(obj.name, startDate, endDate)
  } catch (err) {
    throw new Error((err as Error).message)
  }
}

async function addPrizes(obj: AddPrizeEntity): Promise<void> {
  try {
    const campagin: ICampagin | null = await findCampagin(obj.campaginNumber)
    if (!campagin) {
      throw Error('Campagin not found')
    }

    let probabilityCount: number = 0
    let defaultCount: number = 0
    const prize: IPrize[] = []

    for (const element of obj.prize) {
      const obj: IPrize = {
        ...element,
        createdAt: Date.now() as unknown as Date,
        updatedAt: Date.now() as unknown as Date,
        remainingQuota: element.totalQuota
      }
      prize.push(obj)

      probabilityCount += element.probability
      if (element.default === true) defaultCount += 1
    }

    //check if probability add up to 100%
    if (probabilityCount !== 100) throw Error('Probability must add up to 100%')
    //check if it includes default fall back prize
    if (defaultCount !== 1) throw Error('Must only have one default prize')

    await addNewPrizes(obj.campaginNumber, prize)
    return
  } catch (err) {
    throw new Error((err as Error).message)
  }
}

async function drawPrize(obj: NewDrawEntity): Promise<string> {
  try {
    //get campagin info
    const campagin: ICampagin | null = await findCampagin(obj.campaginNumber)
    if (!campagin) {
      throw Error('Campagin not found')
    }
    const today: Date = new Date()
    if (today < campagin.start || today > campagin.end) throw Error('campagin has expired')

    //Find user last draw record
    const lastDraw: IDraw[] | null = await findLastDraw(
      obj.mobile,
      campagin._id as unknown as mongoose.Schema.Types.ObjectId
    )
    if (lastDraw?.length !== 0 && lastDraw !== null) {
      //check if last draw date is today
      const lastDrawDate: Date = lastDraw[0].date

      if (
        lastDrawDate.getDate() == today.getDate() &&
        lastDrawDate.getMonth() == today.getMonth() &&
        lastDrawDate.getFullYear() == today.getFullYear()
      ) {
        return 'Already participated in the draw, please join again tomorrow!'
      }
    }

    const prizes: IPrize[] = campagin.prizes
    if (prizes.length === 0) throw Error('no Prize available to draw')
    // draw prize
    const prize: IPrize = getRandom(prizes)
    const defaultPrize: IPrize | undefined = prizes.find((element) => element.default === true)

    if (prize.unlimited === false) {
      const remainingCount: number = prize.remainingQuota
      const dailyQuota: number = prize.dailyQuota
      const dailyCount = await findDailyPrizeCount(
        prize._id as unknown as mongoose.Schema.Types.ObjectId,
        campagin._id as unknown as mongoose.Schema.Types.ObjectId
      )
      if (remainingCount <= 0 || dailyCount >= dailyQuota) {
        //fall back to default prize
        await addOneDraw(
          obj.mobile,
          defaultPrize?._id as unknown as mongoose.Schema.Types.ObjectId,
          campagin._id as unknown as mongoose.Schema.Types.ObjectId
        )
        return defaultPrize?.name as unknown as string
      }
      // deduct 1 from inventory count
      await updatePrizeCount(
        prize?._id as unknown as mongoose.Schema.Types.ObjectId,
        campagin._id as unknown as mongoose.Schema.Types.ObjectId
      )
    }
    // add result to draw table
    await addOneDraw(
      obj.mobile,
      prize?._id as unknown as mongoose.Schema.Types.ObjectId,
      campagin._id as unknown as mongoose.Schema.Types.ObjectId
    )

    return prize.name
  } catch (err) {
    throw new Error((err as Error).message)
  }
}

function getRandom(prizes: IPrize[]): IPrize {
  const num = Math.random()
  let s = 0

  for (const element of prizes) {
    s += element.probability / 100
    if (num < s) {
      return element
    }
  }
  return prizes[prizes.length - 1]
}

export { createCampagin, addPrizes, AddPrizeEntity, drawPrize }
