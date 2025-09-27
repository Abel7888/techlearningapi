import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // You can also log to an error reporting service here
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-xl text-center space-y-3">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">A runtime error occurred while rendering this page.</p>
            {process.env.NODE_ENV !== 'production' && this.state.error ? (
              <pre className="text-left text-sm whitespace-pre-wrap bg-muted p-3 rounded border overflow-auto max-h-64">
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
