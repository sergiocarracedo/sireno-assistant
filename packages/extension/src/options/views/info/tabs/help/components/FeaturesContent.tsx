import { EyeOff, FileText, Globe, List, MessageSquare, MessagesSquare, Target } from "lucide-react";
import Screenshot from "./Screenshot";
import CodeExample from "./CodeExample";

interface FeaturesContentProps {
  searchQuery: string;
}

export default function FeaturesContent({ searchQuery }: FeaturesContentProps) {
  const query = searchQuery.toLowerCase();

  const shouldShow = (text: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Inline Chat */}
      {shouldShow("inline chat field ai assistant") && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Inline Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Inline Chat provides AI assistance directly on form fields. Perfect for quick,
            single-field fills.
          </p>

          <div className="space-y-2">
            <div className="font-medium text-gray-900 dark:text-gray-100">Example prompts:</div>
            <CodeExample code="Write a professional bio in 150 words" title="Professional bio" />
            <CodeExample
              code="Create a compelling subject line for a marketing email"
              title="Email subject"
            />
            <CodeExample
              code="Generate a cover letter for a software engineer position at a startup"
              title="Cover letter"
            />
          </div>

          <Screenshot
            src="/screenshots/inline-chat.png"
            alt="Inline chat in action"
            caption="Inline chat provides contextual assistance for each field"
          />
        </section>
      )}

      {/* Sidepanel Chat */}
      {shouldShow("sidepanel chat multi-field bulk fill context") && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" />
            Sidepanel Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Sidepanel Chat lets you fill multiple fields at once with a single prompt. It provides
            three context levels for different scenarios:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Selected Fields Only
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                AI sees only the fields you&apos;ve selected. Best for focused, specific fills.
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Form Fields
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                AI sees all detectable form fields on the page. Better context for related fields.
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Full Page Content
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                AI sees the entire page content. Most context, useful for complex forms.
              </div>
            </div>
          </div>

          <Screenshot
            src="/screenshots/sidepanel-multi-field.png"
            alt="Sidepanel showing multiple selected fields"
            caption="Select multiple fields and fill them all with one prompt"
          />

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 mt-4">
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <strong>How to use:</strong> Open the sidepanel, go to the Fields tab, select the
              fields you want to fill, then switch to the Chat tab and describe what you want.
            </div>
          </div>
        </section>
      )}

      {/* Skills System */}
      {shouldShow("skills custom domain matching automatic") && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Skills are pre-configured AI assistants that activate automatically on specific
            websites. They provide domain-specific knowledge and shortcuts.
          </p>

          <div className="space-y-2">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Built-in skills include:
            </div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4">
              <li className="flex gap-2">
                <span>•</span>
                <span>Job application helper for LinkedIn and Indeed</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Customer support responder for help desk forms</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Code review assistant for GitHub PRs</span>
              </li>
            </ul>
          </div>

          <Screenshot
            src="/screenshots/skills-tab.png"
            alt="Skills tab showing available skills"
            caption="Manage skills with toggle switches - disable when not needed"
          />

          <div className="space-y-2 mt-4">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              You can also create custom skills for:
            </div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4">
              <li className="flex gap-2">
                <span>•</span>
                <span>Internal company tools</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Frequently used forms</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Domain-specific terminology</span>
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* Fields View */}
      {shouldShow("fields view select deselect focus button navigate") && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <List className="h-5 w-5" />
            Fields View
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            The Fields tab shows all detectable form fields on the current page. Use it to:
          </p>

          <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong className="text-gray-900 dark:text-gray-100">Select/deselect</strong> fields
                for bulk filling in sidepanel chat
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong className="text-gray-900 dark:text-gray-100">Focus</strong> on specific
                fields - the page scrolls and highlights the field
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong className="text-gray-900 dark:text-gray-100">Exclude</strong> fields from AI
                detection (e.g., passwords, sensitive data)
              </span>
            </li>
          </ul>

          <Screenshot
            src="/screenshots/fields-tab.png"
            alt="Fields tab showing field list with focus buttons"
            caption="Fields tab with checkboxes, focus buttons, and exclude options"
          />
        </section>
      )}

      {/* Field Exclusion */}
      {shouldShow("exclude excluded fields password sensitive privacy") && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Field Exclusion
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Exclude fields to prevent AI from accessing them. Useful for:
          </p>

          <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 mb-3">
            <li className="flex gap-2">
              <span>•</span>
              <span>Password fields</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Credit card numbers</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Social security numbers</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Any sensitive personal information</span>
            </li>
          </ul>

          <Screenshot
            src="/screenshots/excluded-fields.png"
            alt="Excluded fields tab"
            caption="Excluded fields won't appear in AI context"
          />

          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900 mt-4">
            <div className="text-xs text-red-800 dark:text-red-300">
              <strong>Security Best Practice:</strong> Always exclude fields containing passwords,
              payment information, or other sensitive data before using AI assistance.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
