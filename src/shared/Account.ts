import got from 'got'

import { resolve } from 'url'

export const initAccount = async (apiKey: string) => {
  try {
    const account = (await got(resolve(process.env.DOMAIN!, '/api/getaccountdata'), {
      headers: {
        'Authorization': `APIKEY ${apiKey}`
      },
      json: true,
      useElectronNet: false
    })).body
    return account
  } catch (err) {
    if (err.response) {
      console.error(err.response.body)
    } else {
      console.error(err)
    }
  }
  return null
}
