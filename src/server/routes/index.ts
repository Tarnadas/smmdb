import { Router } from 'express'

import net64 from './net64'

const router = Router()

router.use('/net64', net64)

export default router
