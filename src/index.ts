import express, { Application, Request, Response } from 'express'
import multer from 'multer'
import { Worker } from 'worker_threads'
const upload: multer.Multer = multer({})
const app: Application = express()

app.post('/to_jpeg', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const buffer: Buffer | undefined = req.file?.buffer

    if (req.file?.mimetype !== 'image/png') throw new Error('input file must be a png image')
    if (buffer === undefined) throw new Error('invalid file')

    const worker = new Worker(__dirname + '/worker.js', {
      workerData: {
        path: './worker.ts',
        buffer: buffer
      }
    })
    worker.once('message', (buffer: Buffer) => {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length
      })
      res.end(buffer)
    })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})
app.listen(32678, () => console.log('server running on port 32678'))

export default app
