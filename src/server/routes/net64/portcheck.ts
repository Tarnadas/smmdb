import { Router } from 'express'
import { Request, Response } from 'express-serve-static-core'
import * as WebSocket from 'ws'
import { lookup, Lookup } from 'geoip-lite'

const router = Router()

router.get('/', async (req, res) => {
  const ip = req.ip.replace('::ffff:', '')
  console.log('IP', ip, req.ip)
  const port = req.query.port
  console.log('CHECK')
  if (!await portCheck(req, res, ip, port)) return
  console.log('CHECK SUCCEED')
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
  if (!(await hasPortOpen(ip, port))) {
    res.status(400).send(`Port is closed`)
    return false
  }
  return true
}

async function hasPortOpen (ip: string, port: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      console.log(`ws://${ip}:${port}`)
      const ws = new WebSocket(`ws://${ip}:${port}`)

      ws.on('open', () => {
        console.error('OPEN')
        if (ws.readyState >= ws.CLOSING) return
        ws.close()
        resolve(true)
      })
      ws.on('error', (err) => {
        console.error('ERR', err)
        if (ws.readyState >= ws.CLOSING) return
        ws.close()
        resolve(false)
      })
      setTimeout(() => {
        console.error('TIMEOUT')
        if (ws.readyState >= ws.CLOSING) return
        ws.close()
        resolve(false)
      }, 2000)
    } catch (err) {
      resolve(false)
    }
  })
}
