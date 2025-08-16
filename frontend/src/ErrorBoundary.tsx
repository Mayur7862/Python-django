import React from "react";

type State = { hasError: boolean; message?: string; stack?: string };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: any) {
    return { hasError: true, message: String(err?.message || err), stack: String(err?.stack || "") };
  }
  componentDidCatch(err: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 18, marginBottom: 8 }}>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
          <details style={{ marginTop: 8 }}>
            <summary>Stack</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.stack}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

