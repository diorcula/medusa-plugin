'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import { ManageProducts } from './ManageProducts.tsx'
import { ShippingProfiles } from './ShippingProfiles.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AdminViewProps } from 'payload'

// Create a new QueryClient for Tanstack Query to be used in all components
const queryClient = new QueryClient()

export const CustomAdminUI: React.FC<AdminViewProps> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Gutter>
        <div>
          <h1>Medusa Dashboard</h1>
          <ManageProducts />
          <ShippingProfiles />
        </div>
      </Gutter>
    </QueryClientProvider>
  )
}

// export default CustomAdminUI;
