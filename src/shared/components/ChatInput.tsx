import { ArrowUp, LoaderCircle } from 'lucide-react'
import { forwardRef, KeyboardEvent, useImperativeHandle, useRef } from 'react'
import { useControllable, UseControllableProps } from 'use-controllable'
import { Button } from '../../sidepanel/components/ui/button'
import { Textarea } from '../../sidepanel/components/ui/textarea'

export type ChatInputProps = UseControllableProps<string> & {
  /** Callback when user submits the message */
  onSubmit: (message: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  loading?: boolean
  /** Custom className for the container */
  className?: string
}

export interface ChatInputRef {
  focus: () => void
}

/**
 * ChatInput component with controllable pattern
 * Can be used in controlled or uncontrolled mode
 * 
 * @see https://sergiocarracedo.es/react-controllable-components/
 * 
 * @example Controlled
 * const [value, setValue] = useState('')
 * <ChatInput value={value} onChange={setValue} onSubmit={handleSend} />
 * 
 * @example Uncontrolled
 * <ChatInput defaultValue="" onSubmit={handleSend} />
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput({
  onSubmit,
  placeholder = 'Type your message...',
  loading,
  className,
  ...props
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    },
  }))

  const [value, setValue] = useControllable({
    value: props.value,
    defaultValue: props.defaultValue ?? '',
    onChange: props.onChange,
  })


  const handleChange = (newValue: string) => {
    setValue(newValue)
  }

  const handleSubmit = () => {
    const trimmed = value || ''.trim()
    if (!trimmed || loading) return

    onSubmit(trimmed)
    
    setValue('') // Clear input after submit
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={className}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="min-h-19 max-h-32 resize-none"
        />
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !value?.trim()}
          size="icon"
          className="absolute bottom-1 right-1"
        >
          {loading ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <ArrowUp className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
})
