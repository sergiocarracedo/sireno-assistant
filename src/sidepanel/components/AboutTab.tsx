import { AlertTriangle, ExternalLink, Github, Heart, Lock } from 'lucide-react';
import { useTranslation } from '../../shared/i18n';
import { ButtonLink } from './ui/button-link';

export default function AboutTab() {
  const { t } = useTranslation();
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  const authorImageUrl = chrome.runtime.getURL('images/author.jpg');

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {t('about.title')}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('about.version')} {version}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Author */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
            <img
              src={authorImageUrl}
              alt="Sergio Carracedo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to showing initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-initials')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-initials text-4xl font-bold text-gray-500 dark:text-gray-400';
                  fallback.textContent = 'SC';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Sergio Carracedo
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('about.creator')}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <a
              href="https://sergiocarracedo.es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              sergiocarracedo.es
            </a>
            <a
              href="https://github.com/sergiocarracedo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Github className="h-4 w-4" />
              @sergiocarracedo
            </a>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Privacy Statement */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('about.privacy.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('about.privacy.text')}
            </p>
          </section>

          {/* Open Source */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Github className="h-5 w-5" />
              {t('about.openSource.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('about.openSource.text')}
            </p>
            <div className="flex gap-2 flex-wrap">
              <ButtonLink
                variant="outline"
                size="sm"
                icon={Github}
                href="https://github.com/sergiocarracedo/sireno-assistant"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('about.openSource.viewGithub')}
              </ButtonLink>
              <ButtonLink
                variant="outline"
                size="sm"
                icon={Github}
                href="https://github.com/sergiocarracedo/sireno-assistant/stargazers"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('about.openSource.starProject')}
              </ButtonLink>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('about.disclaimer.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('about.disclaimer.text')}
            </p>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              {t('about.support.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('about.support.text')}
            </p>
            <div className="flex gap-2">
              <ButtonLink
                variant="outline"
                size="sm"
                icon={Heart}
                href="https://github.com/sponsors/sergiocarracedo"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('about.support.sponsor')}
              </ButtonLink>
            </div>
          </section>

          {/* License */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {t('about.license')}{' '}
              <a
                href="https://github.com/sergiocarracedo/sireno-assistant/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                GPL License
              </a>
              {' • '}
              {t('about.madeWith')} <Heart className="inline h-3 w-3 text-red-500" /> {t('about.by')} Sergio Carracedo
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
