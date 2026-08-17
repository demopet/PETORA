import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Invoice, CreateInvoiceInput, RecordPaymentInput } from '@/types/invoice'

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Invoice[]
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Invoice
    },
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...input,
          status: 'UNPAID',
        })
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ invoiceId, input }: { invoiceId: string; input: RecordPaymentInput }) => {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...input,
          invoice_id: invoiceId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
