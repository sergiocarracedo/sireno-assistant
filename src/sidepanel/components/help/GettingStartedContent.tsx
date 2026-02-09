import { ExternalLink, Hand, MessageSquare, Settings } from 'lucide-react';
import Screenshot from './Screenshot';
import { ButtonLink } from '../ui/button-link';

interface GettingStartedContentProps {
  searchQuery: string;
}

export default function GettingStartedContent({ searchQuery }: GettingStartedContentProps) {
  const query = searchQuery.toLowerCase();

  const shouldShow = (text: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Welcome */}
      {shouldShow('welcome introduction') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Welcome to Sireno Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Sireno Assistant is an AI-powered Chrome extension that helps you fill web forms 
            intelligently. It uses your own API key to communicate with leading AI providers 
            (OpenAI, Claude, or Gemini) to generate contextual, accurate responses.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Get started by configuring your AI model in the Settings tab, then explore the 
            powerful features below.
          </p>
        </section>
      )}

      {/* Configure AI Model */}
      {shouldShow('configure ai model api key openai claude gemini settings') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Your AI Model
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            To use Sireno Assistant, you need an API key from one of these providers:
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    OpenAI (GPT-4, GPT-3.5)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Most popular and versatile
                  </div>
                </div>
                <ButtonLink
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Key
                </ButtonLink>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Anthropic Claude
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Advanced reasoning capabilities
                  </div>
                </div>
                <ButtonLink
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Key
                </ButtonLink>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Google Gemini
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Fast and efficient
                  </div>
                </div>
                <ButtonLink
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Key
                </ButtonLink>
              </div>
            </div>
          </div>

          <Screenshot
            src="/screenshots/settings-api-key.png"
            alt="Settings tab showing API key configuration"
            caption="Go to Settings tab and paste your API key"
          />

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 mt-4">
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Privacy Note:</strong> Your API key is stored locally in your browser and 
              never sent to our servers. All AI requests go directly from your browser to your 
              chosen provider.
            </div>
          </div>
        </section>
      )}

      {/* First Inline Chat */}
      {shouldShow('first inline chat getting started tutorial') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your First Inline Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Inline Chat is the quickest way to fill individual form fields:
          </p>
          
          <ol className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[1.5rem]">
                1.
              </span>
              <span>
                Navigate to any web page with a form (e.g., a job application, contact form)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[1.5rem]">
                2.
              </span>
              <span>
                Click on any text input or textarea field
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[1.5rem]">
                3.
              </span>
              <span>
                Look for the purple AI assistant icon that appears near the field
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[1.5rem]">
                4.
              </span>
              <span>
                Click the icon or press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs">Ctrl+Space</kbd>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[1.5rem]">
                5.
              </span>
              <span>
                Type your request (e.g., "Write a professional introduction") and press Enter
              </span>
            </li>
          </ol>

          <Screenshot
            src="/screenshots/inline-chat.png"
            alt="Inline chat interface on a form field"
            caption="Inline chat appears directly on the field you're working with"
          />

          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900 mt-4">
            <div className="text-xs text-green-800 dark:text-green-300">
              <strong>Tip:</strong> Your prompts are saved automatically for each field. When you 
              return to the same page, your last prompt will be there waiting for you.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
