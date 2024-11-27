import React, { type ErrorInfo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  // errorFallback?: React.ReactNode // can be added to support inline errors, currently renders block errors
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-destructive-foreground" />
            <AlertTitle className="text-destructive-foreground">Error</AlertTitle>
            <AlertDescription className="text-destructive-foreground">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </AlertDescription>
          </Alert>
          <Button onClick={this.resetError}>Retry</Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
