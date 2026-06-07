import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches uncaught render errors anywhere in the tree and shows a
 * non-fatal fallback UI instead of white-screening the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="grid size-12 place-items-center rounded-xl bg-rose-50 text-rose-500">
          <AlertTriangle size={20} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-zinc-900">Something went wrong</h2>
        <p className="mt-1 max-w-md text-xs text-zinc-500">
          The app hit an unexpected error. You can try reloading the current view — your data is safe.
        </p>
        {this.state.error && (
          <pre className="mt-4 max-h-40 w-full overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left text-[11px] text-zinc-600">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        )}
        <button
          onClick={this.reset}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          <RefreshCw size={12} /> Try again
        </button>
      </div>
    );
  }
}
