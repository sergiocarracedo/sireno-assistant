import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../../shared/i18n';
import type { ExcludedField } from '../../../../../background/storage';
import { Button } from '../../../../../shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../shared/components/ui/card';
import { EyeOff, Trash2, RefreshCw } from 'lucide-react';
import { createLogger } from '../../../../../shared/logger';

const logger = createLogger('ExcludedFieldsTab');

export default function ExcludedFieldsTab() {
  const { t } = useTranslation();
  const [excludedFields, setExcludedFields] = useState<ExcludedField[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExcludedFields();
    
    // Listen for tab changes
    const handleTabChange = (activeInfo: chrome.tabs.TabActiveInfo) => {
      logger.debug('Tab changed:', activeInfo);
      loadExcludedFields();
    };
    
    const handleTabUpdate = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, _tab: chrome.tabs.Tab) => {
      // Only reload if the URL changed
      if (changeInfo.url) {
        logger.debug('Tab URL updated:', changeInfo.url);
        loadExcludedFields();
      }
    };
    
    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, []);

  const loadExcludedFields = async () => {
    logger.debug('===== FUNCTION CALLED =====');
    setLoading(true);
    try {
      // Debug: List all storage keys directly
      const allStorage = await chrome.storage.local.get(null);
      logger.debug(' ===== STORAGE DUMP START =====');
      logger.debug(' ALL storage items:', allStorage);
      logger.debug(' All keys:', Object.keys(allStorage));
      
      const excludedKeys = Object.keys(allStorage).filter(key => key.startsWith('excluded_fields_'));
      logger.debug(' Excluded field keys found:', excludedKeys);
      
      // Show each excluded field key and its data
      excludedKeys.forEach(key => {
        logger.debug(` Key: ${key}`);
        logger.debug(` Data:`, allStorage[key]);
      });
      logger.debug(' ===== STORAGE DUMP END =====');
      
      // Try multiple methods to get the current tab
      let tab;
      let tabUrl;
      
      // Method 1: Query for active tab
      [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      logger.debug(' Method 1 - chrome.tabs.query:', tab);
      logger.debug(' Method 1 - tab.url:', tab?.url);
      logger.debug(' Method 1 - tab.pendingUrl:', tab?.pendingUrl);
      logger.debug(' Method 1 - tab keys:', tab ? Object.keys(tab) : 'no tab');
      
      // Method 2: Query for active tab in last focused window
      if (!tab?.url) {
        [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        logger.debug(' Method 2 - lastFocusedWindow:', tab);
        logger.debug(' Method 2 - tab.url:', tab?.url);
        logger.debug(' Method 2 - tab keys:', tab ? Object.keys(tab) : 'no tab');
      }
      
      // Method 3: Use chrome.tabs.getCurrent() 
      if (!tab?.url) {
        try {
          const currentTab = await chrome.tabs.getCurrent();
          logger.debug(' Method 3 - getCurrent:', currentTab);
          if (currentTab) tab = currentTab;
        } catch (e) {
          logger.debug(' getCurrent failed:', e);
        }
      }
      
      // Method 4: Get from window
      if (!tab?.url) {
        try {
          const windows = await chrome.windows.getAll({ populate: true });
          logger.debug(' Method 4 - windows:', windows);
          const currentWindow = windows.find(w => w.focused);
          if (currentWindow?.tabs) {
            tab = currentWindow.tabs.find(t => t.active);
            logger.debug(' Found tab from window:', tab);
          }
        } catch (e) {
          logger.debug(' windows method failed:', e);
        }
      }
      
      tabUrl = tab?.url;
      logger.debug(' Final tab URL:', tabUrl);
      
      if (!tabUrl) {
        logger.debug(' FAILED to get tab URL - showing all excluded fields');
        // Show all excluded fields if we can't determine the URL
        const allFields: ExcludedField[] = [];
        excludedKeys.forEach(key => {
          const fields = allStorage[key];
          if (Array.isArray(fields)) {
            allFields.push(...fields);
          }
        });
        logger.debug(' Showing all fields:', allFields);
        setExcludedFields(allFields);
        setCurrentUrl('(all pages)');
        setLoading(false);
        return;
      }

      setCurrentUrl(tabUrl);
      const expectedKey = `excluded_fields_${tabUrl}`;
      logger.debug(' Requesting excluded fields for URL:', tabUrl);
      logger.debug(' Expected storage key:', expectedKey);
      logger.debug(' Key exists in storage?', excludedKeys.includes(expectedKey));
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_EXCLUDED_FIELDS',
        url: tabUrl,
      });

      logger.debug(' Response:', response);

      if (response.type === 'EXCLUDED_FIELDS_RESPONSE') {
        logger.debug(' Excluded fields from response:', response.fields);
        
        // If no fields found for current URL, show ALL excluded fields as fallback
        if (response.fields.length === 0) {
          logger.debug(' No fields for current URL, checking all URLs...');
          const allFields: ExcludedField[] = [];
          excludedKeys.forEach(key => {
            const fields = allStorage[key];
            if (Array.isArray(fields)) {
              allFields.push(...fields);
            }
          });
          logger.debug(' All excluded fields across all URLs:', allFields);
          
          // Filter to only show fields from current domain
          try {
            const currentDomain = new URL(tabUrl).hostname;
            const domainFields = allFields.filter(field => {
              try {
                const fieldDomain = new URL(field.url).hostname;
                return fieldDomain === currentDomain;
              } catch {
                return false;
              }
            });
            logger.debug(' Fields matching current domain:', domainFields);
            setExcludedFields(domainFields);
          } catch {
            // If URL parsing fails, show all fields
            setExcludedFields(allFields);
          }
        } else {
          setExcludedFields(response.fields);
        }
      }
    } catch (error) {
      logger.error('Failed to load excluded fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (fieldId: string) => {
    logger.debug(' Remove button clicked for:', fieldId);
    try {
      // Find the field to get its actual URL
      const field = excludedFields.find(f => f.fieldId === fieldId);
      if (!field) {
        logger.error(' Field not found:', fieldId);
        return;
      }
      
      logger.debug(' Removing field:', field);
      
      await chrome.runtime.sendMessage({
        type: 'REMOVE_EXCLUDED_FIELD',
        url: field.url, // Use the field's URL, not currentUrl
        fieldId,
      });

      logger.debug(' Field removed, reloading list');
      
      // Reload the list
      await loadExcludedFields();

      // Notify the content script that the field was un-excluded
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && tab.url === field.url) {
        // Only notify if we're on the same page as the excluded field
        logger.debug(' Notifying content script that field was un-excluded:', fieldId);
        chrome.tabs.sendMessage(tab.id, { 
          type: 'FIELD_UNEXCLUDED', 
          fieldId 
        }).catch((error) => {
          logger.debug(' Could not notify content script:', error);
        });
      }
    } catch (error) {
      logger.error('Failed to remove excluded field:', error);
    }
  };

  const handleClearAll = async () => {
    const message = excludedFields.length === 1 
      ? 'Are you sure you want to remove this excluded field?'
      : `Are you sure you want to remove all ${excludedFields.length} excluded fields?`;
      
    if (!confirm(message)) {
      return;
    }

    logger.debug(' Clear all clicked, removing', excludedFields.length, 'fields');
    
    try {
      // Get current tab info for notification
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const fieldIdsToNotify: string[] = [];
      
      // Remove all fields one by one using their actual URLs
      for (const field of excludedFields) {
        logger.debug(' Removing field:', field.fieldId, 'from', field.url);
        await chrome.runtime.sendMessage({
          type: 'REMOVE_EXCLUDED_FIELD',
          url: field.url, // Use each field's URL, not currentUrl
          fieldId: field.fieldId,
        });
        
        // Track fields on current page
        if (tab?.url === field.url) {
          fieldIdsToNotify.push(field.fieldId);
        }
      }

      logger.debug(' All fields removed, reloading list');
      
      // Reload the list
      await loadExcludedFields();

      // Notify the content script about all un-excluded fields on current page
      if (tab?.id && fieldIdsToNotify.length > 0) {
        logger.debug(' Notifying content script about un-excluded fields:', fieldIdsToNotify);
        for (const fieldId of fieldIdsToNotify) {
          chrome.tabs.sendMessage(tab.id, { 
            type: 'FIELD_UNEXCLUDED', 
            fieldId 
          }).catch((error) => {
            logger.debug(' Could not notify content script:', error);
          });
        }
      }
    } catch (error) {
      logger.error('Failed to clear excluded fields:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">{t('fieldsView.loadingExcluded')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <EyeOff className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Excluded Fields</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadExcludedFields}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {excludedFields.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('fieldsView.clearAll')}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Fields you've hidden from showing the assistant button on this page.
        </p>
      </div>

      {/* Excluded fields list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {excludedFields.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <EyeOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="mb-2">{t('fieldsView.noExcludedFields')}</p>
                <p className="text-sm">
                  Click the "Exclude field" button in the inline chat to hide the assistant button for specific fields.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          excludedFields.map((field) => (
            <Card key={field.fieldId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {field.fieldLabel}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {formatTimestamp(field.timestamp)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(field.fieldId)}
                    className="h-8 w-8 p-0"
                    title="Remove from excluded list"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {field.fieldId}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer info */}
      {excludedFields.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{excludedFields.length} {excludedFields.length === 1 ? 'field' : 'fields'} excluded</span>
            <span className="truncate ml-2 max-w-[200px]" title={currentUrl}>
              {formatUrl(currentUrl)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
