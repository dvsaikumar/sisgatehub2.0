import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlass,
    CornersOut,
    FileText,
    Gear,
    SquaresFour,
    Users,
    Robot
} from '@phosphor-icons/react';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const navigationItems = [
        { title: 'Dashboard', path: '/dashboard', icon: SquaresFour, section: 'Navigation' },
        { title: 'Library', path: '/library', icon: FileText, section: 'Navigation' },
        { title: 'AI Assistant', path: '/apps/ai', icon: Robot, section: 'AI' },
        { title: 'Create Document', path: '/apps/ai/create-doc', icon: FileText, section: 'AI' },
        { title: 'Contacts', path: '/apps/contacts/contact-cards', icon: Users, section: 'Apps' },
        { title: 'Settings', path: '/settings', icon: Gear, section: 'System' },
    ];

    const filteredItems = navigationItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // Keyboard navigation within list
    useEffect(() => {
        const handleNavigation = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleSelect(filteredItems[selectedIndex].path);
                }
            }
        };

        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, filteredItems, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh] border border-slate-200"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-4 border-b border-slate-100">
                            <MagnifyingGlass size={20} className="text-slate-400 mr-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search pages, apps, and settings..."
                                className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-lg"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                            />
                            <div className="hidden sm:flex items-center gap-1">
                                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">ESC</span>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="overflow-y-auto p-2 scrollbar-hide">
                            {filteredItems.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredItems.map((item, idx) => (
                                        <div
                                            key={item.path}
                                            onClick={() => handleSelect(item.path)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-md mr-3 ${idx === selectedIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                <item.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{item.title}</div>
                                                <div className="text-xs text-slate-400">{item.section}</div>
                                            </div>
                                            {idx === selectedIndex && (
                                                <CornersOut size={16} className="text-indigo-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <p>No results found for "{query}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex gap-4">
                                <span><span className="font-semibold text-slate-500">↑↓</span> to navigate</span>
                                <span><span className="font-semibold text-slate-500">↵</span> to select</span>
                            </div>
                            <div>
                                Sisgate PRO Hub
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
