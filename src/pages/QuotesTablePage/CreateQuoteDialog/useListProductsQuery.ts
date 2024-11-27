import { type QueryClient, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { Product, ProductWithQuantity } from '../../../api/types'
import { useApiService } from '@/api/ApiServiceProvider'

export function useListProductsQueryWithQuantity() {
  const service = useApiService()
  return useSuspenseQuery({
    queryKey: ['products', 'with-quantities'],
    queryFn: () =>
      service.listProducts().then((products) => products.map((p): ProductWithQuantity => ({ ...p, quantity: 0 }))),
  })
}

export function useSetQuantityOnListProductQuery() {
  const queryClient = useQueryClient()

  return {
    unsetAllQuantities: () => {
      queryClient.setQueryData<Product[] | undefined>(['products', 'with-quantities'], (oldData) => {
        if (!oldData) return oldData
        return oldData.map((product) => ({ ...product, quantity: 0 }))
      })
    },
    setQuantity: (id: string, quantity: number) => {
      queryClient.setQueryData<Product[] | undefined>(['products', 'with-quantities'], (oldData) => {
        if (!oldData) return oldData
        return oldData.map((product) => (product.id === id ? { ...product, quantity } : product))
      })
    },
  }
}

export function getProductsWithPositiveQuantities(queryClient: QueryClient) {
  const data = queryClient.getQueryData<ProductWithQuantity[]>(['products', 'with-quantities'])
  if (!data) return []
  return data.filter((p) => p.quantity > 0)
}
