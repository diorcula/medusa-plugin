import Medusa, { Config } from '@medusajs/js-sdk'

//Define the config object
const config: Config = {
  baseUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000', // Replace with your Medusa backend URL
  debug: process.env.NODE_ENV === 'development',
  apiKey: process.env.NEXT_PUBLIC_MEDUSA_API_SECRET,
}
// Create an instance of the Medusa class with the config object
export const sdk = new Medusa(config)
