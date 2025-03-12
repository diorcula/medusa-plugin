import type { CollectionSlug, Config } from 'payload'

export type PayloadMedusaPluginConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>
  disabled?: boolean
}

export const payloadMedusaPlugin =
  (pluginOptions: PayloadMedusaPluginConfig) =>
  (incomingConfig: Config): Config => {
    // create copy of incoming config
    let config = { ...incomingConfig }

    if (!config.collections) {
      config.collections = []
    }

    config.collections.push({
      slug: 'plugin-collection',
      fields: [
        {
          name: 'id',
          type: 'text',
        },
      ],
    })

    if (pluginOptions.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          collection.fields.push({
            name: 'addedByPlugin',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
          })
        }
      }
    }

    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    config.admin.components.beforeDashboard.push(`medusa-plugin/client#BeforeDashboardClient`)
    config.admin.components.beforeDashboard.push(`medusa-plugin/rsc#BeforeDashboardServer`)

    config.endpoints.push({
      handler: () => {
        return Response.json({ message: 'Hello from custom endpoint' })
      },
      method: 'get',
      path: '/my-plugin-endpoint',
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      const { totalDocs } = await payload.count({
        collection: 'plugin-collection',
        where: {
          id: {
            equals: 'seeded-by-plugin',
          },
        },
      })

      if (totalDocs === 0) {
        await payload.create({
          collection: 'plugin-collection',
          data: {
            id: 'seeded-by-plugin',
          },
        })
      }
    }

    // Add the custom admin UI component as a view
    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        afterNavLinks: ['medusa-plugin/components/afterNavLinks/LinkToCustomView'],
        views: {
          ...config.admin?.components?.views,
          myCustomView: {
            Component: 'medusa-plugin/components/CustomAdminUI#CustomAdminUI', // This is the path to the view component
            path: '/medusa-plugin', // This is the path where the view will be accessible in the admin: admin/medusa-products
          },
        },
      },
    }

    // Finally, return the modified config
    return config
  }

export default payloadMedusaPlugin
