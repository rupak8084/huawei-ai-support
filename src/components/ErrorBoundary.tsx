'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We encountered an unexpected error. Please try again or refresh the page.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={this.handleRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button onClick={this.handleReload}>
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 p-4 bg-muted rounded-lg text-left max-w-lg w-full">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
