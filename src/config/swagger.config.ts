import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import expressBasicAuth from 'express-basic-auth'
import { Express } from 'express'

const swaggerDocument = YAML.load(path.resolve(__dirname, '../docs/openapi.yml'))

export const setupSwagger = (app: Express) => {
  app.use(
    '/api-docs',
    expressBasicAuth({
      users: { admin123: 'admin123' },
      challenge: true,
      unauthorizedResponse: (req: any) => (req.auth ? 'Credentials rejected' : 'No credentials provided')
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  )
}
