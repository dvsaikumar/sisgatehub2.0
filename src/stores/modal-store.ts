import { create } from 'zustand';

/**
 * Modal Store
 * 
 * Per God Mode Protocol:
 * - Client UI state only
 * - Manages all modal states centrally
 * - Prevents modal stacking issues
 */

type ModalType =
    | 'create-document'
    | 'edit-document'
    | 'delete-confirm'
    | 'create-reminder'
    | 'edit-reminder'
    | 'user-profile'
    | 'settings'
    | 'invite-user'
    | null;

interface ModalData {
    // Generic payload for modal-specific data
    [key: string]: unknown;
}

interface ModalState {
    activeModal: ModalType;
    modalData: ModalData | null;

    // Actions
    openModal: (modal: ModalType, data?: ModalData) => void;
    closeModal: () => void;
    isOpen: (modal: ModalType) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
    activeModal: null,
    modalData: null,

    openModal: (modal, data) => set({
        activeModal: modal,
        modalData: data ?? null
    }),

    closeModal: () => set({
        activeModal: null,
        modalData: null
    }),

    isOpen: (modal) => get().activeModal === modal,
}));

/**
 * Selectors
 */
export const selectActiveModal = (state: ModalState) => state.activeModal;
export const selectModalData = (state: ModalState) => state.modalData;
