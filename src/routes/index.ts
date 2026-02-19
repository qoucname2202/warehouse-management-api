import { Router } from 'express'
import authRouter from './v1/auth.routes'
import roleRouter from './v1/role.routes'
import permissionRouter from './v1/permission.routes'
import userRouter from './v1/user.routes'

const rootRouter = Router()

rootRouter.use('/v1/auth', authRouter)

rootRouter.use('/v1/users', userRouter)

rootRouter.use('/v1/roles', roleRouter)

rootRouter.use('/v1/permissions', permissionRouter)

export default rootRouter
