import type { ReactNode } from "react";
import ErrorBoundary from "../ErrorBoundary";
import { defaultSuspenseFallback } from "../defaultSuspenseFallback";

type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
};

interface SuspendedQueryProps<T> {
  query: QueryResult<T>;
  fallback?: ReactNode;
  children: (data: T) => ReactNode;
}

export function SuspendedQuery<T>({
  query,
  fallback,
  children,
}: SuspendedQueryProps<T>) {
  return (
    <ErrorBoundary>
      <SuspendedQueryImplementation
        query={query}
        fallback={fallback}
        // biome-ignore lint/correctness/noChildrenProp: <explanation>
        children={children}
      />
    </ErrorBoundary>
  );
}

function SuspendedQueryImplementation<T>({
  query,
  fallback,
  children,
}: SuspendedQueryProps<T>) {
  if (query.error) throw query.error;
  if (query.isLoading) return fallback ?? defaultSuspenseFallback;
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  return <ErrorBoundary>{children(query.data!)}</ErrorBoundary>;
}
