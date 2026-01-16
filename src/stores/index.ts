/**
 * Zustand Stores Barrel File
 * 
 * Export all stores from a single entry point.
 * Import like: import { useLayoutStore, useModalStore } from '@/stores';
 */

export {
    useLayoutStore,
    selectSidebarCollapsed,
    selectSidebarHovered,
    selectTopNavCollapsed,
    selectMobileMenuOpen
} from './layout-store';

export {
    useModalStore,
    selectActiveModal,
    selectModalData
} from './modal-store';
