import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Quote } from '../../../api/types'
import { useApiService } from '@/api/ApiServiceProvider'

type PatchQuoteData = Partial<Omit<Quote, 'id'>>

export function usePatchQuoteMutation() {
  const queryClient = useQueryClient()
  const service = useApiService()

  return useMutation<void, unknown, { id: string; data: PatchQuoteData }>({
    mutationFn: async ({ id, data }) => service.patchQuote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
    onError: (error) => {
      console.error('Failed to update quote:', error)
    },
  })
}
