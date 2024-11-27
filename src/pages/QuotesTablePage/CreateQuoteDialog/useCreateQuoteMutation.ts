import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BaseRecord, ProductWithQuantity, Quote } from '../../../api/types'
import { getCurrentUserInfo } from '../../../api/getCurrentUserInfo'
import { useApiService } from '@/api/ApiServiceProvider'

const TAX_RATE = 0.1 // 10% tax rate for example

export function useCreateQuoteMutation({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const service = useApiService()

  return useMutation({
    mutationFn: async ({ description, products }: { description: string; products: ProductWithQuantity[] }) => {
      if (products.length === 0) throw new Error('Please select at least one product and try again!')

      const { items, subtotal, total_tax, total } = calculateTotals(products)

      const validUntil = new Date()
      validUntil.setMonth(validUntil.getMonth() + 1) // valid for 1 month

      const quote: Omit<Quote, keyof BaseRecord> = {
        customer_info: getCurrentUserInfo(),
        status: 'SENT',
        items,
        subtotal,
        total_tax,
        total,
        valid_until: validUntil.toISOString(),
        description,
      }

      await service.createQuote(quote)
    },
    onSuccess: () => {
      onSuccess()
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

export function calculateTotals(products: ProductWithQuantity[]) {
  const items = products
    .filter((p) => p.quantity > 0)
    .map((p) => ({
      product_name: p.title,
      quantity: p.quantity,
      price: p.price,
      subtotal: p.quantity * p.price,
    }))

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const total_tax = subtotal * TAX_RATE
  const total = subtotal + total_tax

  return { items, subtotal, total_tax, total }
}
