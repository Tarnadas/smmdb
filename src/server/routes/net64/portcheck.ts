import { Router } from 'express'
import { Request, Response } from 'express-serve-static-core'
import * as WebSocket from 'ws'
import { lookup, Lookup } from 'geoip-lite'

const router = Router()

router.get('/', (req, res) => {
  const ip = req.ip.replace('::ffff:', '')
  const port = req.query.port
  if (!portCheck(req, res, ip, port)) return
  const geo = lookup(ip) as Lookup | null
  res.json({
    ip,
    country: geo ? geo.country : 'LAN',
    countryCode: geo ? geo.country : 'LAN',
    latitude: geo ? geo.ll[0] : 0,
    longitude: geo ? geo.ll[1] : 0
  })
})

export default router

export async function portCheck (req: Request, res: Response, ip: any, port: any): Promise<boolean> {
  if (!ip) {
    res.status(400).send(`IP is missing`)
    return false
  }
  try {
    port = parseInt(port)
    if (port == null) {
      res.status(400).send(`Port is missing`)
      return false
    }
    if (isNaN(port)) {
      res.status(400).send(`Port is NaN`)
      return false
    }
  } catch (err) {
    res.status(400).send(`Port is not a number: ${port}`)
    return false
  }
  if (!hasPortOpen(ip, port)) {
    res.status(400).send(`Port is closed`)
    return false
  }
  return true
}

async function hasPortOpen (ip: string, port: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      const ws = new WebSocket(`ws://${ip}:${port}`)

      ws.on('open', () => {
        ws.close()
        resolve(true)
      })
      ws.on('error', () => {
        ws.close()
        resolve(false)
      })
      setTimeout(() => {
        ws.close()
        resolve(false)
      }, 10000)
    } catch (err) {}
    resolve(false)
  })
}
