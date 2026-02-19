import { Request, Response, NextFunction } from 'express'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import fsPromises from 'fs/promises'

class Logging {
  public static logEvents = async (message: string, logFileName: string) => {
    const date = `${format(new Date(), 'dd-MM-yyyy\tHH:mm:ssss')}`
    const logItem = `${date}\t${uuidv4()}\t${message}\n`
    try {
      if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
      }
      await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (error) {
      console.log(error)
    }
  }
  public static logger = (req: Request, res: Response, next: NextFunction) => {
    this.logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method}\t${req.path}`)
    next()
  }
}

export default Logging
