import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import SettingsPage from './SettingsPage'

vi.mock('../hooks/use-users', () => ({
  useUsers: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateUser: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeactivateUser: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useResetPin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe('SettingsPage', () => {
  it('renders active user management instead of a placeholder', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>
    )

    expect(screen.getByText(/user management/i)).toBeInTheDocument()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })
})
