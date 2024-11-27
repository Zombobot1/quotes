import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface LoadingTableSkeletonProps {
  rows?: number
  cols?: number
}

export function LoadingTableSkeleton({ rows = 10, cols = 7 }: LoadingTableSkeletonProps) {
  return (
    <Table aria-label="Loading table skeleton" data-testid="loading-table">
      <TableHeader>
        <TableRow>
          {Array.from({ length: cols }).map((_, index) => (
            <TableHead key={index}>
              <Skeleton className="h-6 w-full" aria-label={`Loading column header ${index + 1}`} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton
                  className="h-4 w-full"
                  aria-label={`Loading cell row ${rowIndex + 1}, column ${colIndex + 1}`}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
