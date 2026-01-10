import { create } from 'zustand';
import { ReactNode } from 'react';

interface Modal {
  id: string;
  title?: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
}

interface ModalStore {
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],
  
  openModal: (modal) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newModal = { ...modal, id };
    set((state) => ({ modals: [...state.modals, newModal] }));
    return id;
  },
  
  closeModal: (id) => {
    const modal = get().modals.find(m => m.id === id);
    if (modal?.onClose) {
      modal.onClose();
    }
    set((state) => ({ modals: state.modals.filter(m => m.id !== id) }));
  },
  
  closeAllModals: () => {
    const { modals } = get();
    modals.forEach(modal => {
      if (modal.onClose) {
        modal.onClose();
      }
    });
    set({ modals: [] });
  },
}));