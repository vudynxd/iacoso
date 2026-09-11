import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#fbfbf9] border-2 border-red-600 rounded-md text-[#111111] shadow-lg max-w-lg mx-auto my-8">
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h3 className="text-base font-black uppercase tracking-wider">
              {this.props.fallbackMessage || 'Ocurrió un error al cargar la vista'}
            </h3>
          </div>
          <p className="text-xs text-gray-700 mb-4 font-mono">
            {this.state.error?.message || 'Error inesperado en el componente.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-[#facc15] font-black text-xs uppercase tracking-wider flex items-center gap-2 rounded-none transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar y restaurar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
