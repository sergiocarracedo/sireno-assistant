interface ScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function Screenshot({ src, alt, caption }: ScreenshotProps) {
  // Convert relative paths to extension URLs
  const imageUrl = src.startsWith('/') ? chrome.runtime.getURL(src.slice(1)) : src;
  
  return (
    <figure className="my-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto"
          onError={(e) => {
            // Show placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
