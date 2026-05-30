import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for debugging in development only
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary caught an error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className="flex flex-col items-center justify-center h-full p-6 text-center"
          style={{ background: 'var(--surface-container-lowest)' }}
        >
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              😵
            </div>

            {/* Error Title */}
            <h2
              className="text-xl font-black mb-2"
              style={{ color: 'var(--text-main)' }}
            >
              Oups! Gen yon ti pwoblèm
            </h2>

            {/* Error Description */}
            <p
              className="text-sm font-medium mb-6 leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Aplikasyon an gen yon erè teknik. Pa enkyete, ou ka eseye ankò oswa retounen nan paj akèy la.
            </p>

            {/* Error Details (Dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <details
                className="mb-6 p-4 rounded-xl text-left text-xs font-mono glass-card"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                <summary className="font-bold cursor-pointer mb-2" style={{ color: 'var(--text-main)' }}>
                  📋 Erè detay (Dev mode)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="font-bold text-red-500 mb-1">Error:</p>
                    <pre className="whitespace-pre-wrap break-words text-[11px]">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="font-bold text-red-500 mb-1">Component Stack:</p>
                      <pre className="whitespace-pre-wrap break-words text-[11px]">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }}
              >
                🔄 Eseye Ankò
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 rounded-xl font-black text-sm border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--text-main)',
                  background: 'rgba(22, 29, 51, 0.85)',
                }}
              >
                🏠 Retounen Akèy
              </button>
            </div>

            {/* Help Text */}
            <p
              className="text-[10px] font-medium mt-6 opacity-60"
              style={{ color: 'var(--text-muted)' }}
            >
              Si erè a kontinye, kontakte sipò teknik la.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ---- Specialized Error Boundaries ----

// For wrapping individual pages/sections
export const PageErrorBoundary: React.FC<{ children: ReactNode; pageName?: string }> = ({ 
  children, 
  pageName = 'Paj sa a' 
}) => (
  <ErrorBoundary
    fallback={
      <div
        className="flex flex-col items-center justify-center h-full p-6 text-center"
        style={{ background: 'var(--surface-container-lowest)' }}
      >
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-main)' }}>
          {pageName} gen yon erè
        </h3>
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
          Eseye chwazi yon lòt modil oswa retounen nan Tablodbo a.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{
            background: 'rgba(79,70,229,0.15)',
            color: 'var(--primary)',
          }}
        >
          🔄 Rechaje
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// For wrapping async operations
export const AsyncErrorBoundary: React.FC<{ 
  children: ReactNode; 
  onRetry?: () => void 
}> = ({ children, onRetry }) => (
  <ErrorBoundary
    fallback={
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-3xl mb-3">🔌</div>
        <h4 className="font-bold text-base mb-2" style={{ color: 'var(--text-main)' }}>
          Erè koneksyon
        </h4>
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
          Pa t kapab chaje enfòmasyon an. Tcheke koneksyon ou.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{
              background: 'var(--accent-main)',
              color: 'white',
            }}
          >
            🔄 Eseye Ankò
          </button>
        )}
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
