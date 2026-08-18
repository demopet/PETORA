import * as React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePets } from './use-pets'

const orderMock = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: orderMock,
    })),
  },
}))

describe('usePets', () => {
  beforeEach(() => {
    orderMock.mockReset()
  })

  it('loads pets even without customerId filter', async () => {
    const pets = [{
      id: 'pet-1',
      customer_id: 'customer-1',
      name: 'Milo',
      species: 'Dog',
      breed: 'Labrador',
      birth_date: null,
      gender: 'Male',
      photo_url: null,
      microchip_number: null,
      is_active: true,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }]

    orderMock.mockResolvedValue({ data: pets, error: null })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => usePets(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(pets)
  })
})
