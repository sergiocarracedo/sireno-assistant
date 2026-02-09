import { useEffect, useState, useRef } from 'react'
import { X, Zap, EyeOff } from 'lucide-react'
import { ChatInput, ChatInputRef, ErrorMessage, ThinkingMessage, Tooltip } from '../../shared/components'
import { Button } from '../../sidepanel/components/ui/button'

interface InlineChatAppProps {
  fieldLabel?: string
  fieldId?: string
  skills?: Array<{ name: string; description: string }>
  isDarkMode?: boolean
  draft?: string | null
}

export function InlineChatApp({
  fieldLabel = 'Input field',
  fieldId,
  skills = [],
  isDarkMode = false,
  draft = null,
}: InlineChatAppProps) {
  const [message, setMessage] = useState(draft || '')
  const [status, setStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const chatInputRef = useRef<ChatInputRef>(null)

  // Auto-focus input when component mounts
  useEffect(() => {
    chatInputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Load logo from extension resources
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      setLogoUrl(chrome.runtime.getURL('icons/logo.svg'))
    }
  }, [])

  useEffect(() => {
    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sireno-chat-status') {
        const { status, isError } = event.data
        setStatus(status || '')
        setIsError(isError || false)
        
        if (status === '' || status === 'Done!' || isError) {
          setIsProcessing(false)
        }
      } else if (event.data?.type === 'sireno-save-draft-and-close') {
        // Parent is requesting us to save draft and close
        handleSaveDraftAndClose()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [message]) // Add message as dependency so we always have latest value

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isProcessing) return

    // Send to parent
    window.parent.postMessage({
      type: 'sireno-chat',
      action: 'send',
      message: trimmedMessage,
    }, '*')

    setMessage('')
    setIsProcessing(true)
    setStatus('Processing...')
    setIsError(false)
  }

  const handleClose = () => {
    // Save draft if there's unsent content
    const trimmedMessage = message.trim()
    if (trimmedMessage) {
      window.parent.postMessage({
        type: 'sireno-chat',
        action: 'save-draft',
        draftContent: trimmedMessage,
      }, '*')
    } else {
      // No content, just close
      window.parent.postMessage({
        type: 'sireno-chat',
        action: 'close',
      }, '*')
    }
  }

  const handleSaveDraftAndClose = () => {
    // Called by parent when click outside is detected
    const trimmedMessage = message.trim()
    window.parent.postMessage({
      type: 'sireno-chat',
      action: 'save-draft',
      draftContent: trimmedMessage,
    }, '*')
  }

  // TODO: Re-enable when sidebar continuation is fixed
  // const handleContinueInSidebar = () => {
  //   window.parent.postMessage({
  //     type: 'sireno-chat',
  //     action: 'continue-in-sidebar',
  //     fieldId,
  //     inputText: message.trim(),
  //   }, '*')
  // }

  const handleOpenSkills = () => {
    window.parent.postMessage({
      type: 'sireno-chat',
      action: 'open-skills',
    }, '*')
  }

  const handleExcludeField = () => {
    window.parent.postMessage({
      type: 'sireno-chat',
      action: 'exclude-field',
      fieldId,
      fieldLabel,
    }, '*')
  }

  const activeSkillsCount = skills.length

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Compact Single-Line Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0 h-10">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Sireno" 
              className="h-4 w-4 flex-shrink-0"
            />
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            Sireno • {fieldLabel}
          </span>
        </div>

        {/* Skills Badge */}
        {activeSkillsCount > 0 && (
          <Tooltip
            content={
              <div className="text-left">
                <p className="font-semibold mb-1">{activeSkillsCount} active skill{activeSkillsCount !== 1 ? 's' : ''}</p>
                {skills.map((skill, i) => (
                  <div key={i} className="text-xs text-gray-300 dark:text-gray-400">
                    • {skill.name}
                  </div>
                ))}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click to manage</p>
              </div>
            }
            side="bottom"
          >
            <button
              onClick={handleOpenSkills}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3 w-3" />
              {activeSkillsCount}
            </button>
          </Tooltip>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="xs-icon"
          onClick={handleClose}
          className="flex-shrink-0 h-6 w-6"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Compact Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4 bg-white dark:bg-gray-900">
        <div className="space-y-2">
          {/* Chat Input */}
          <ChatInput
            ref={chatInputRef}
            value={message}
            onChange={setMessage}
            onSubmit={handleSend}
            placeholder="e.g., Write a professional greeting..."
            loading={isProcessing}
          />

          {/* Action Links */}
          <div className="flex justify-between items-center">
            <Tooltip content="Hide assistant button for this field" side="top">
              <button
                onClick={handleExcludeField}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:underline flex items-center gap-1"
              >
                <EyeOff className="h-3 w-3" />
                Exclude field
              </button>
            </Tooltip>
            {/* TODO: Re-enable when sidebar continuation is fixed */}
            {/* <button
              onClick={handleContinueInSidebar}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Continue in sidebar →
            </button> */}
          </div>

          {/* Subtle Status Messages */}
          {isProcessing && !isError && <ThinkingMessage text={status || 'Processing...'} subtle />}
          {isError && status && <ErrorMessage error={status} subtle />}
        </div>
      </div>
    </div>
  )
}
