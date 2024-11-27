import { Suspended } from "./Suspended";

interface SuspendedRenderProps<T> {
  fallback?: React.ReactNode;
  children: () => T;
}

export function SuspendedRender<T extends React.ReactNode>({
  children,
  fallback,
}: SuspendedRenderProps<T>) {
  return <Suspended fallback={fallback}>{children}</Suspended>;
}
