/* eslint-disable no-console */
/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */

import type { Payload } from 'payload'
import dotenv from 'dotenv'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import { NextRESTClient } from './helpers/NextRESTClient.js'

import { sdk } from '../src/utils/medusa-config.ts'
// import Medusa from '@medusajs/js-sdk'
// let sdk: Medusa

const dirname = path.dirname(fileURLToPath(import.meta.url))

let payload: Payload
let restClient: NextRESTClient
let memoryDB: MongoMemoryReplSet | undefined

describe('Plugin tests', () => {
  beforeAll(async () => {
    dotenv.config({
      path: path.resolve(dirname, './.env'),
    })

    // Log environment variables to verify they are loaded correctly
    console.log('MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL)
    console.log('NEXT_PUBLIC_MEDUSA_API_SECRET:', process.env.NEXT_PUBLIC_MEDUSA_API_SECRET)

    // Initialize a new Medusa SDK for testing
    // sdk = new Medusa({
    //   baseUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000', // Replace with your Medusa backend URL
    //   debug: process.env.NODE_ENV === 'test',
    //   apiKey: process.env.NEXT_PUBLIC_MEDUSA_API_SECRET,
    // })

    console.log('sdk------->', sdk.admin.apiKey)

    process.env.DISABLE_PAYLOAD_HMR = 'true'
    process.env.PAYLOAD_DROP_DATABASE = 'true'

    if (!process.env.DATABASE_URI) {
      console.log('Starting memory database')
      memoryDB = await MongoMemoryReplSet.create({
        replSet: {
          count: 3,
          dbName: 'payloadmemory',
        },
      })
      console.log('Memory database started')

      process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
    }

    const { default: config } = await import('./payload.config.js')

    payload = await getPayload({ config })
    restClient = new NextRESTClient(payload.config)
  })

  afterAll(async () => {
    if (payload.db.destroy) {
      await payload.db.destroy()
    }

    if (memoryDB) {
      await memoryDB.stop()
    }
  })

  it('should query added by plugin custom endpoint', async () => {
    const response = await restClient.GET('/my-plugin-endpoint')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      message: 'Hello from custom endpoint',
    })
  })

  it('can create post with a custom text field added by plugin', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        addedByPlugin: 'added by plugin',
      },
    })

    expect(post.addedByPlugin).toBe('added by plugin')
  })

  it('plugin creates and seeds plugin-collection', async () => {
    expect(payload.collections['plugin-collection']).toBeDefined()

    const { docs } = await payload.find({ collection: 'plugin-collection' })

    expect(docs).toHaveLength(1)
  })
})

describe('Medusa Admin UI Integration Tests', () => {
  it('should have the custom view path added by the plugin', () => {
    const customView = payload.config.admin.components.views.myCustomView
    expect(customView).toBeDefined()
    expect(customView.Component).toBe('medusa-plugin/components/CustomAdminUI#CustomAdminUI')
    expect(customView.path).toBe('/medusa-plugin')
  })
})

describe('Medusa Admin User Authentication Integration Tests', () => {
  it('should log an admin user in to Medusa', async () => {
    try {
      await sdk.auth.login('user', 'emailpass', {
        email: 'medusa-payload-prototype@instance.studio',
        password: 'o4Qf@xYTRbjDQrVU4',
      })

      console.log('Admin user logged in successfully')
    } catch (error) {
      console.error('Failed to log in admin user:', error)
      throw error
    }
  })
})

describe('Medusa Product Management Integration Tests', () => {
  let createdProductId: string

  it('should fetch a list of products with the Medusa SDK', async () => {
    try {
      const response = await sdk.admin.product.list()
      expect(response).toHaveProperty('products')
      expect(Array.isArray(response.products)).toBe(true)

      console.log('Fetched products from Medusa:', response.products)
    } catch (error) {
      console.error('Failed to fetch products from Medusa', error)
      throw error
    }
  })

  it('should create and then delete a product', async () => {
    // Step 1: Create a product
    const newProduct = {
      title: 'Test Product',
      optionTitle: 'Size',
      optionValue: 'Medium',
    }

    try {
      const createResponse = await sdk.admin.product.create({
        title: newProduct.title,
        options: [
          {
            title: newProduct.optionTitle,
            values: [newProduct.optionValue],
          },
        ],
        shipping_profile_id: 'sp_01JKT5BAW15K58EAQ799KT1Q6Z', // hardcoded for now
      })

      console.log('PRODUCT CREATED: ', createResponse)
      createdProductId = createResponse.product.id

      // Verify that the product was created successfully
      expect(createResponse).toHaveProperty('product')
      expect(createResponse.product).toHaveProperty('id')
      expect(createResponse.product.title).toBe(newProduct.title)

      // Step 2: Delete the product
      const deleteResponse = await sdk.admin.product.delete(createdProductId)
      console.log('PRODUCT DELETED: ', deleteResponse)

      // Verify that the product was deleted successfully
      expect(deleteResponse).toHaveProperty('id')
      expect(deleteResponse.id).toBe(createdProductId)
    } catch (error) {
      console.error('Error during product creation or deletion:', error)
      throw error
    }
  })
})
