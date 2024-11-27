import { useApiService } from '@/api/ApiServiceProvider'
import { type ListQuotesOptions, prepareListOptions } from '../../api/pocketBaseService'
import { stableStringify } from '../../lib/stableStringify'
import { useQuery } from '@tanstack/react-query'

export function useListQuotes(options: ListQuotesOptions = {}) {
  const service = useApiService()
  // suspenseQuery doesn't allow for placeholderData and worsens UX when selecting multiple filters
  return useQuery({
    queryKey: ['quotes', 'list', stableStringify(prepareListOptions(options))],
    queryFn: () => service.listQuotes(options),
    placeholderData: (prev) => prev, // for better UX when selecting multiple filters
    retry: import.meta.env.PROD ? 2 : false,
  })
}
