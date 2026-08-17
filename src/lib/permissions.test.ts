import { describe, it, expect } from 'vitest'
import { ErrorCode } from '@/lib/errors'
import { hasPermission, canAccessRoute } from '@/lib/permissions'

describe('errors', () => {
  it('has all required error codes', () => {
    expect(ErrorCode.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS')
    expect(ErrorCode.ACCOUNT_LOCKED).toBe('ACCOUNT_LOCKED')
    expect(ErrorCode.INSUFFICIENT_STOCK).toBe('INSUFFICIENT_STOCK')
  })
})

describe('permissions', () => {
  it('owner has all permissions', () => {
    expect(hasPermission('OWNER', ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'])).toBe(true)
    expect(hasPermission('OWNER', 'OWNER')).toBe(true)
  })

  it('kasir cannot delete customers', () => {
    expect(hasPermission('KASIR', ['OWNER', 'ADMIN'])).toBe(false)
  })

  it('dokter can access medical records', () => {
    expect(canAccessRoute('DOKTER', '/medical-records')).toBe(true)
  })

  it('kasir cannot access inventory', () => {
    expect(canAccessRoute('KASIR', '/inventory')).toBe(false)
  })
})
