import { useState } from 'react';

export const useTabs = (defaultValue) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const isActive = (value) => activeTab === value;

  const setTab = (value) => setActiveTab(value);

  return {
    activeTab,
    setTab,
    isActive
  };
};
