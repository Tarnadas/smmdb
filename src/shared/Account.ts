import { resolve } from 'url'

export const initAccount = async (apiKey: string) => {
  try {
    const response = await fetch(resolve(process.env.DOMAIN!, '/api/getaccountdata'), {
      headers: {
        'Authorization': `APIKEY ${apiKey}`
      }
    })
    if (!response.ok) throw new Error(response.statusText)
    const account = await response.json()
    return account
  } catch (err) {
    console.error(err)
  }
  return null
}
