import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../lib/utils'
import type { QuoteStatus } from '../../../api/types'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const getStatusStyles = (status: QuoteStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-primary text-primary-foreground hover:bg-primary/90'
      case 'REJECTED':
      case 'EXPIRED':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      case 'SENT':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80'
    }
  }

  return (
    <Badge variant={status === 'DRAFT' ? 'default' : 'outline'} className={cn(getStatusStyles(status))}>
      {status}
    </Badge>
  )
}
