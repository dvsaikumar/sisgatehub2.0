import { useState, useEffect } from 'react';

/**
 * A custom hook to manage tab state synchronized with the URL hash.
 * 
 * @param {string} defaultTab - The default tab activeKey.
 * @param {string[]} validTabs - Array of valid tab keys to allow.
 * @returns {Array} - [activeTab, handleTabSelect] use this array to destructure the activeTab state and the tab selection handler
 */
const useHashTab = (defaultTab, validTabs = []) => {
    // Helper to get tab from hash
    const getTabFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        return validTabs.includes(hash) ? hash : defaultTab;
    };

    const [activeTab, setActiveTab] = useState(getTabFromHash());

    // Update state when hash changes (e.g., Back button)
    useEffect(() => {
        const handleHashChange = () => {
            setActiveTab(getTabFromHash());
        };

        window.addEventListener('hashchange', handleHashChange);

        // Set initial hash if needed (optional, avoids empty hash)
        if (!window.location.hash && defaultTab) {
            window.location.hash = defaultTab;
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [defaultTab, validTabs]);

    // Handler for updating tab and hash
    const handleTabSelect = (key) => {
        setActiveTab(key);
        window.location.hash = key;
    };

    return [activeTab, handleTabSelect];
};

export default useHashTab;
