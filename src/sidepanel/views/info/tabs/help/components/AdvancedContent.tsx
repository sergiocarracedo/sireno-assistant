import { Globe, Keyboard, Target, Wrench } from 'lucide-react';
import Screenshot from './Screenshot';
import CodeExample from './CodeExample';

interface AdvancedContentProps {
  searchQuery: string;
}

export default function AdvancedContent({ searchQuery }: AdvancedContentProps) {
  const query = searchQuery.toLowerCase();

  const shouldShow = (text: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Creating Custom Skills */}
      {shouldShow('creating custom skills create skill editor markdown') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Creating Custom Skills
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Skills are domain-specific AI assistants that activate automatically. Here's how to create one:
          </p>

          <div className="space-y-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Step 1: Open Skills Tab
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Navigate to the Skills tab and click "Create New"
              </p>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Step 2: Fill in Basic Info
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Name:</strong> Short, descriptive name (e.g., "LinkedIn Helper")</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Description:</strong> What this skill does</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Domain Match:</strong> Where it activates (see Domain Matching below)</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Step 3: Write Instructions
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Instructions tell the AI how to behave. Be specific:
              </p>
              <CodeExample
                title="Example skill instructions"
                code={`You are a job application assistant specialized in tech roles.

When helping with job applications:
- Use professional but friendly tone
- Highlight technical skills and achievements
- Include specific metrics where possible
- Tailor responses to the job description when available

For "Why do you want to work here" questions:
- Research the company from the page content
- Connect personal interests with company mission
- Mention specific products or initiatives

Keep responses concise unless explicitly asked for longer form content.`}
              />
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Step 4: Add Intent Triggers (Optional)
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Intent triggers are keywords that suggest this skill in inline chat:
              </p>
              <CodeExample
                code="job, application, resume, cover letter, linkedin"
                title="Example intent triggers"
              />
            </div>
          </div>

          <Screenshot
            src="/screenshots/skill-editor.png"
            alt="Skill editor interface"
            caption="Skill editor with all fields visible"
          />
        </section>
      )}

      {/* Domain Matching */}
      {shouldShow('domain matching regex pattern exact match url') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Matching
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Skills can activate on specific domains using exact matches or regex patterns:
          </p>

          <div className="space-y-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Exact Domain Match
              </div>
              <CodeExample
                code="linkedin.com"
                title="Activates only on linkedin.com"
              />
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Subdomain Wildcard
              </div>
              <CodeExample
                code="*.github.com"
                title="Activates on gist.github.com, api.github.com, etc."
              />
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Regex Pattern (Advanced)
              </div>
              <CodeExample
                code="/(linkedin|indeed|glassdoor)\.com/"
                title="Activates on multiple job sites"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Regex must start and end with forward slashes
              </p>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Always Active (Any Domain)
              </div>
              <CodeExample
                code="*"
                title="Activates on all websites"
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900 mt-4">
            <div className="text-xs text-yellow-800 dark:text-yellow-300">
              <strong>Pro Tip:</strong> Even if a skill matches the domain, you can manually disable 
              it using the toggle switch in the Skills tab. This gives you full control without 
              changing the domain pattern.
            </div>
          </div>
        </section>
      )}

      {/* Context Strategies */}
      {shouldShow('context strategies selected fields full page token optimization') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Context Strategies
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Choose the right context level for your use case:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Selected Fields Only
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>When to use:</strong> Quick fills, unrelated fields
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>Pros:</strong> Fastest, lowest token usage, focused responses
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Cons:</strong> AI lacks broader form context
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                All Form Fields
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>When to use:</strong> Related fields, multi-section forms
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>Pros:</strong> Balanced context, understands field relationships
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Cons:</strong> May include irrelevant fields
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Full Page Content
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>When to use:</strong> Complex forms, job applications with context
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>Pros:</strong> Maximum context, best for tailored responses
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Cons:</strong> Highest token usage, slower, more expensive
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 mt-4">
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Cost Tip:</strong> Start with "Selected Fields Only" and upgrade to broader 
              context only when needed. This saves API costs while maintaining quality.
            </div>
          </div>
        </section>
      )}

      {/* Keyboard Shortcuts */}
      {shouldShow('keyboard shortcuts hotkeys keys commands') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-gray-600 dark:text-gray-400">Open inline chat</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono">
                Ctrl+Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-gray-600 dark:text-gray-400">Close inline chat</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-gray-600 dark:text-gray-400">Send message</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono">
                Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-gray-600 dark:text-gray-400">New line in message</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono">
                Shift+Enter
              </kbd>
            </div>
          </div>
        </section>
      )}

      {/* Troubleshooting */}
      {shouldShow('troubleshooting problems issues errors bugs help debug') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Troubleshooting
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                AI not responding
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 text-xs">
                <li>• Check that API key is configured in Settings</li>
                <li>• Verify API key is valid (try copying it fresh)</li>
                <li>• Check browser console for errors (F12 → Console)</li>
                <li>• Ensure you have credits with your AI provider</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Fields not detected
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 text-xs">
                <li>• Refresh the page after opening sidepanel</li>
                <li>• Some fields load dynamically - wait a moment</li>
                <li>• Check if field is inside an iframe (limited support)</li>
                <li>• Try clicking the field to make it visible to the extension</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Skill not activating
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 text-xs">
                <li>• Check domain pattern matches current URL</li>
                <li>• Ensure skill toggle is ON (not disabled)</li>
                <li>• Try refreshing the page</li>
                <li>• Verify skill instructions are saved</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Extension stopped working after update
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 text-xs">
                <li>• Hard refresh the page (Ctrl+Shift+R)</li>
                <li>• Close and reopen the sidepanel</li>
                <li>• Reload the extension in chrome://extensions</li>
                <li>• Check GitHub for known issues</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mt-4">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Still having issues?</strong> Report bugs on{' '}
              <a
                href="https://github.com/sergiocarracedo/sireno-assistant/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                GitHub Issues
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
