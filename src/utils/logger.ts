import pino from 'pino'
import pretty from 'pino-pretty'
import { format } from 'date-fns'

const logger = pino(
  {
    base: {
      pid: false
    }
  },
  pretty({
    colorize: true,
    translateTime: `${format(new Date(), 'dd-MM-yyyy HH:mm:ssss')}`
  })
)

export default logger
