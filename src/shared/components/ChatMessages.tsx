import { Loader2, AlertCircle } from 'lucide-react'
import { Card } from '../../sidepanel/components/ui/card'

export interface ThinkingMessageProps {
  text?: string
  subtle?: boolean
}

/**
 * Loading/thinking indicator message
 */
export function ThinkingMessage({ text = 'Thinking...', subtle = false }: ThinkingMessageProps) {
  if (subtle) {
    return (
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs px-1 py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{text}</span>
      </div>
    )
  }

  return (
    <div className="flex justify-start px-1">
      <Card className="max-w-[85%] p-3 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{text}</span>
        </div>
      </Card>
    </div>
  )
}

export interface ErrorMessageProps {
  error: string
  subtle?: boolean
}

/**
 * Error message display
 */
export function ErrorMessage({ error, subtle = false }: ErrorMessageProps) {
  if (subtle) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs px-1 py-1">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="px-1">
      <Card className="p-3 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <div className="text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      </Card>
    </div>
  )
}

export interface UserMessageProps {
  content: string
}

/**
 * User message bubble
 */
export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <Card className="max-w-[85%] p-3 bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600">
        <div className="text-sm whitespace-pre-wrap">{content}</div>
      </Card>
    </div>
  )
}

export interface AssistantMessageProps {
  content: string
}

/**
 * Assistant message bubble
 */
export function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <Card className="p-3 bg-white dark:bg-gray-800 max-w-[85%]">
      <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
        {content}
      </div>
    </Card>
  )
}

export interface EmptyChatProps {
  icon?: string
  message?: string
}

/**
 * Empty chat state
 */
export function EmptyChat({ 
  icon = '💬', 
  message = 'Start a conversation to fill fields' 
}: EmptyChatProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 dark:text-gray-500 mb-2 text-2xl">
        {icon}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {message}
      </div>
    </div>
  )
}
