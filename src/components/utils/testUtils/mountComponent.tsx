import { ApiServiceProvider } from '@/api/ApiServiceProvider'
import type { pocketBaseService } from '@/api/pocketBaseService'
import { makeSqliteFakeService } from '@/api/sqliteFakeService'
import { AppProviders } from '@/App'
import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'

export interface TestOverrides {
  override?: Partial<typeof pocketBaseService>
  fakeApiService?: ReturnType<typeof makeSqliteFakeService>
}

export function mountComponent(component: React.ReactNode, overrides: TestOverrides = {}) {
  const queryClient = new QueryClient()
  const fakeApiService = overrides.fakeApiService ?? makeSqliteFakeService()
  render(
    <ApiServiceProvider override={{ ...fakeApiService, ...overrides.override }}>
      <AppProviders queryClient={queryClient}>{component}</AppProviders>
    </ApiServiceProvider>,
  )
  return fakeApiService
}
