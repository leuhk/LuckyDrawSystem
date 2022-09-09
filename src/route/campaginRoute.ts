import express, { Request, Response, Router } from 'express'
import { body, CustomValidator, validationResult } from 'express-validator'
import { createCampagin, addPrizes, drawPrize } from '../controller/index'

const campaginRouter: Router = express.Router()

const isValidDate: CustomValidator = (value) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (value.match(regex) === null) {
    return Promise.reject('invalid date format, must be in yyyy-mm-dd format')
  }
  return true
}

const isValidMobile: CustomValidator = (value) => {
  const regex = /^[0-9]{8}$/
  if (value.match(regex) === null) {
    return Promise.reject('invalid mobile format, must be exactly 8 numbers')
  }
  return true
}

campaginRouter.post(
  '/create',
  body('start').custom(isValidDate),
  body('end').custom(isValidDate),
  body('name').exists().withMessage('Must Provide a valid name'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
      }
      const result = await createCampagin({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end
      })
      return res.status(200).json({ campagin_number: result })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  }
)

campaginRouter.patch(
  '/add-prizes',
  body('campaginNumber').isNumeric(),
  body('prize.*.name').not().isEmpty().isString(),
  body('prize.*.unlimited').isBoolean(),
  body('prize.*.dailyQuota').isNumeric(),
  body('prize.*.totalQuota').isNumeric(),
  body('prize.*.probability').isNumeric(),
  body('prize.*.default').isBoolean(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
      }
      await addPrizes({
        campaginNumber: req.body.campaginNumber,
        prize: req.body.prize
      })
      return res.status(200).json({ msg: 'prize added successfully' })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  }
)

campaginRouter.post(
  '/draw',
  body('mobile').isString().custom(isValidMobile),
  body('campaginNumber').isNumeric(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
      }
      const result = await drawPrize({
        mobile: req.body.mobile,
        campaginNumber: req.body.campaginNumber
      })
      res.status(200).json({ drawing_result: result })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  }
)

export { campaginRouter }
