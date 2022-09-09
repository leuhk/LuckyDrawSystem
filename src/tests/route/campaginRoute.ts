import request from 'supertest'
import { Campagin, ICampagin } from '../../model'
import app from '../../../index'
import * as db from '../db'
import mongoose, { Schema } from 'mongoose'
import { addOneDraw } from '../../service'

beforeAll(async () => {
  await db.connect()
})
afterEach(async () => {
  await db.clearDatabase()
})
afterAll(async () => {
  await db.closeDatabase()
})

describe('/create', () => {
  test('create a new campagin', (done) => {
    request(app)
      .post('/campagin/create')
      .send({ start: '2022-01-01', end: '2023-01-01', name: 'New test' })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(typeof response.body.campagin_number).toBe('number')
        expect(response.statusCode).toBe(200)
        done()
      })
  })
  test('validation guard on body format (Wrong date format)', (done) => {
    request(app)
      .post('/campagin/create')
      .send({ start: '20229191', end: '20231919', name: 'New test' })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.error).toBe('invalid date format, must be in yyyy-mm-dd format')
        expect(response.statusCode).toBe(422)
        done()
      })
  })
  test('validation guard on body format. (Without name)', (done) => {
    request(app)
      .post('/campagin/create')
      .send({ start: '2022-01-01', end: '2023-01-01' })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.error).toBe('Must Provide a valid name')
        expect(response.statusCode).toBe(422)
        done()
      })
  })
})
describe('/draw', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let result: ICampagin & Required<{ _id: Schema.Types.ObjectId }>
  beforeEach(async () => {
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
      updatedAt: updatedAt,
      prizes: [
        {
          name: '$5 Cash Coupon',
          unlimited: false,
          dailyQuota: 100,
          totalQuota: 500,
          probability: 80,
          default: false,
          remainingQuota: 500
        },
        {
          name: '$100 Cash Coupon',
          unlimited: false,
          dailyQuota: 100,
          totalQuota: 500,
          probability: 10,
          default: false,
          remainingQuota: 500
        },
        {
          name: 'No Price',
          unlimited: false,
          dailyQuota: 100,
          totalQuota: 500,
          probability: 10,
          default: true,
          remainingQuota: 500
        }
      ]
    })
    result = await campagin.save()
  })

  test('new draw', (done) => {
    request(app)
      .post('/campagin/draw')
      .send({
        campaginNumber: 123456,
        mobile: '92113344'
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })
  test('validation guard', (done) => {
    request(app)
      .post('/campagin/draw')
      .send({
        campaginNumber: 123456
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.statusCode).toBe(422)
        done()
      })
  })
  describe('guard user drawing again in the same day', () => {
    const mobile = '92113344'
    beforeEach(async () => {
      await addOneDraw(
        mobile,
        result.prizes[0]._id as unknown as mongoose.Schema.Types.ObjectId,
        result._id as unknown as mongoose.Schema.Types.ObjectId
      )
    })
    test('user already draw today, tell use to particapte tomorrow', (done) => {
      request(app)
        .post('/campagin/draw')
        .send({
          campaginNumber: 123456,
          mobile: mobile
        })
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body.drawing_result).toBe(
            'Already participated in the draw, please join again tomorrow!'
          )
          expect(response.statusCode).toBe(200)
          done()
        })
    })
  })
})

describe('/add-prizes', () => {
  beforeEach(async () => {
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
  })
  test('add new prizes', (done) => {
    request(app)
      .patch('/campagin/add-prizes')
      .send({
        campaginNumber: 123456,
        prize: [
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500,
            probability: 100,
            default: true
          }
        ]
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })
  test('validation guard', (done) => {
    request(app)
      .patch('/campagin/add-prizes')
      .send({
        campaginNumber: 'daw',
        prize: [
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500
          }
        ]
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.error).toBe('Invalid value')
        expect(response.statusCode).toBe(422)
        done()
      })
  })
  test('validation guard(Probabilities doesnt add up 100%)', (done) => {
    request(app)
      .patch('/campagin/add-prizes')
      .send({
        campaginNumber: 123456,
        prize: [
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500,
            probability: 30,
            default: true
          },
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500,
            probability: 20,
            default: false
          }
        ]
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.error).toBe('Probability must add up to 100%')
        expect(response.statusCode).toBe(400)
        done()
      })
  })
  test('validation guard(More then one default)', (done) => {
    request(app)
      .patch('/campagin/add-prizes')
      .send({
        campaginNumber: 123456,
        prize: [
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500,
            probability: 80,
            default: true
          },
          {
            name: '$5 Cash Coupon',
            unlimited: false,
            dailyQuota: 100,
            totalQuota: 500,
            probability: 20,
            default: true
          }
        ]
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.error).toBe('Must only have one default prize')
        expect(response.statusCode).toBe(400)
        done()
      })
  })
})
