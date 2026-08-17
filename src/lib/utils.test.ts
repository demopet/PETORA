import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

describe('utils', () => {
  it('cn merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('formatCurrency formats IDR', () => {
    const result = formatCurrency(15000)
    expect(result).toContain('15.000')
    expect(result).toContain('Rp')
  })

  it('formatDate formats date in id-ID', () => {
    const result = formatDate('2025-01-15')
    expect(result).toContain('2025')
  })

  it('formatDateTime includes time', () => {
    const result = formatDateTime('2025-01-15T10:30:00')
    expect(result).toContain('2025')
    expect(result).toContain('10.30')
  })
})
