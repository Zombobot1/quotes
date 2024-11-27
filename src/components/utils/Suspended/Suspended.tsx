import type React from "react";
import { type FC, Suspense } from "react";
import ErrorBoundary from "../ErrorBoundary";
import { defaultSuspenseFallback } from "../defaultSuspenseFallback";

interface SuspendedProps {
  children: React.ReactNode | FC<void>;
  fallback?: React.ReactNode;
  // errorFallback?: React.ReactNode // can be added to support inline errors
}

export function Suspended({ children, fallback }: SuspendedProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback ?? defaultSuspenseFallback}>
        {/* biome-ignore lint/correctness/noChildrenProp: <explanation> */}
        <SuspenseImplementation children={children} />
      </Suspense>
    </ErrorBoundary>
  );
}

function SuspenseImplementation({
  children,
}: Pick<SuspendedProps, "children">) {
  return <>{typeof children === "function" ? children() : children}</>;
}
