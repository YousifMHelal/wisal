"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { WidgetError } from "@/components/widgets/widget"

interface Props {
  children: ReactNode
  widgetTitle?: string
}

interface State {
  error: Error | null
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Wisal] Widget error (${this.props.widgetTitle ?? "unknown"}):`, error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <WidgetError
          message={this.state.error.message || "فشل تحميل القسم. حاول تحديث الصفحة."}
        />
      )
    }
    return this.props.children
  }
}
