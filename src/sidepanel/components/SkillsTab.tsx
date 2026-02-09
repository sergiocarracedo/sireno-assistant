import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../shared/i18n';
import type { Skill } from '../../shared/types';
import { skillMatchesDomain, getSkillDomainMatch, getSkillIntentTriggers } from '../../shared/skill-utils';
import SkillCard from './SkillCard';
import SkillEditor from './SkillEditor';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search, Filter, Upload, Target } from 'lucide-react';
import { readMarkdownFile } from '../../shared/skill-markdown';

type FilterType = 'all' | 'active' | 'inactive';

export default function SkillsTab() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [disabledSkills, setDisabledSkills] = useState<string[]>([]);
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSkills();
    loadCurrentDomain();
    loadDisabledSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SKILLS' });
      if (response.type === 'SKILLS_RESPONSE') {
        setSkills(response.skills);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisabledSkills = async () => {
    try {
      const allItems = await chrome.storage.local.get(null);
      const disabledIds: string[] = [];
      
      for (const key in allItems) {
        if (key.startsWith('skill_disabled_') && allItems[key] === true) {
          const skillId = key.replace('skill_disabled_', '');
          disabledIds.push(skillId);
        }
      }
      
      setDisabledSkills(disabledIds);
    } catch (error) {
      console.error('Failed to load disabled skills:', error);
    }
  };

  const loadCurrentDomain = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url) {
        const url = new URL(tab.url);
        setCurrentDomain(url.hostname);
        
        // Determine which skills are active for this domain
        const active = skills.filter(skill => skillMatchesDomain(skill, url.hostname, tab.url!));
        setActiveSkills(active.map(s => s.id));
      }
    } catch (error) {
      console.error('Failed to get current domain:', error);
    }
  };

  const handleSave = async (skill: Skill) => {
    try {
      await chrome.runtime.sendMessage({ type: 'SAVE_SKILL', skill });
      await loadSkills();
      setEditingSkill(null);
      setIsCreating(false);
    } catch (error) {
      alert(`Failed to save skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_SKILL', skillId });
      await loadSkills();
    } catch (error) {
      alert(`Failed to delete skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggle = async (skillId: string, disabled: boolean) => {
    try {
      const key = `skill_disabled_${skillId}`;
      if (disabled) {
        await chrome.storage.local.set({ [key]: true });
      } else {
        await chrome.storage.local.remove(key);
      }
      await loadDisabledSkills();
      await loadCurrentDomain(); // Refresh active skills
    } catch (error) {
      console.error('Failed to toggle skill:', error);
      alert(`Failed to ${disabled ? 'disable' : 'enable'} skill`);
    }
  };

  const handleImportMarkdown = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const skill = await readMarkdownFile(file);
      // Generate new ID to avoid conflicts
      skill.id = `skill-${Date.now()}`;
      await handleSave(skill);
    } catch (error) {
      alert(`Failed to import skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reload active skills when skills change or domain changes
  useEffect(() => {
    if (currentDomain && skills.length > 0) {
      const active = skills.filter(skill => {
        try {
          const mockUrl = `https://${currentDomain}/`;
          return skillMatchesDomain(skill, currentDomain, mockUrl);
        } catch {
          return false;
        }
      });
      setActiveSkills(active.map(s => s.id));
    }
  }, [skills, currentDomain]);

  // Filter and search skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      // Apply filter
      const isActive = activeSkills.includes(skill.id);
      if (filterType === 'active' && !isActive) return false;
      if (filterType === 'inactive' && isActive) return false;

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const domainMatch = getSkillDomainMatch(skill);
        const triggers = getSkillIntentTriggers(skill);
        return (
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          domainMatch.pattern.toLowerCase().includes(query) ||
          skill.instructions.toLowerCase().includes(query) ||
          triggers.some((trigger: string) => trigger.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [skills, activeSkills, filterType, searchQuery]);

  if (loading) {
    return <div className="py-8 text-center text-gray-400">Loading...</div>;
  }

  if (editingSkill || isCreating) {
    return (
      <SkillEditor
        skill={editingSkill}
        onSave={handleSave}
        onCancel={() => {
          setEditingSkill(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          Current domain: <strong className="text-gray-900 dark:text-gray-100">{currentDomain || 'Unknown'}</strong>
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
          {activeSkills.length} skill{activeSkills.length !== 1 ? 's' : ''} active on this page
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {t('skills.import')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleImportMarkdown}
          className="hidden"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setFilterType('all')}
            className="flex-1"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {t('skills.allCount', { count: skills.length })}
          </Button>
          <Button
            variant={filterType === 'active' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setFilterType('active')}
            className="flex-1"
          >
            {t('skills.activeCount', { count: activeSkills.length })}
          </Button>
          <Button
            variant={filterType === 'inactive' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setFilterType('inactive')}
            className="flex-1"
          >
            {t('skills.inactiveCount', { count: skills.length - activeSkills.length })}
          </Button>
        </div>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSkills.length === 0 && skills.length > 0 && (
          <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
            <Search className="h-16 w-16 mb-3 mx-auto" />
            <div className="text-sm">
              {t('skills.noSkillsMatch')}
            </div>
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
            <Target className="h-20 w-20 mb-4 mx-auto" />
            <div className="text-base mb-2">{t('skills.noSkillsYet')}</div>
            <div className="text-sm mb-4">
              {t('skills.createFirstDescription')}
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('skills.createYourFirstSkill')}
            </Button>
          </div>
        )}

        {filteredSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isActive={activeSkills.includes(skill.id)}
            isDisabled={disabledSkills.includes(skill.id)}
            onEdit={setEditingSkill}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
