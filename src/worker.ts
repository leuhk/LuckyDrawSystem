import { parentPort, workerData } from 'worker_threads'

const buffer: Buffer = workerData.buffer

//add logic here before sending back to main thread
parentPort?.postMessage(buffer)
process.exit()
