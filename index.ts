import express, { Application } from 'express'
import * as dotenv from 'dotenv'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import { campaginRouter } from './src/route/index'

dotenv.config()

const app: Application = express()
const port = process.env.PORT || 8080

app.use(json())
app.use('/campagin', campaginRouter)

if (process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'PRODUCTION') {
  mongoose
    .connect(`${process.env.MONGODB_URI}`)
    .then(() => {
      console.log('Mongodb connected....')
    })
    .catch((err) => console.log(err.message))
}

app.listen(port, () => console.log(`server running on port ${port}`))

export default app
