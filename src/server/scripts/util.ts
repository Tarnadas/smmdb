import cryptoRandomString from 'crypto-random-string'

export function log (message: string): void {
  console.log(`${new Date().toISOString().substr(0, 19)} ${message}`)
}

export function generateAPIKey (): string {
  return cryptoRandomString(30)
}
