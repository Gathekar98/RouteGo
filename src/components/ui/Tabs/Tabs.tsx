import { useId, useState, type ReactNode, type KeyboardEvent } from 'react';
import styles from './Tabs.module.scss';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
}

export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? tabs[0]?.id);
  const baseId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = tabs[(index + 1) % tabs.length];
      setActiveTabId(next.id);
      document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = tabs[(index - 1 + tabs.length) % tabs.length];
      setActiveTabId(prev.id);
      document.getElementById(`${baseId}-tab-${prev.id}`)?.focus();
    }
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div>
      <div role="tablist" className={styles.tablist} aria-label="Bus details sections">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${baseId}-tab-${tab.id}`}
            role="tab"
            aria-selected={tab.id === activeTabId}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={tab.id === activeTabId ? 0 : -1}
            className={[styles.tab, tab.id === activeTabId && styles.activeTab]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveTabId(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab && (
        <div
          id={`${baseId}-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          tabIndex={0}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}