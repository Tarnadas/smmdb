import { Router } from 'express'

import portcheck from './portcheck'

const router = Router()

router.use('/portcheck', portcheck)

export default router
