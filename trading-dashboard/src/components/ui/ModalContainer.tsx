import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalStore } from '../../stores/useModalStore';
import { useTheme } from '../../contexts/ThemeContext';

export const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.closable !== false) {
          closeModal(topModal.id);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modals, closeModal]);

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal, index) => {
        const sizeClasses = {
          sm: 'max-w-sm',
          md: 'max-w-md',
          lg: 'max-w-lg',
          xl: 'max-w-xl',
          full: 'max-w-full mx-4',
        };

        return (
          <div
            key={modal.id}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ zIndex: 50 + index }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (modal.closable !== false) {
                  closeModal(modal.id);
                }
              }}
            />
            
            {/* Modal */}
            <div className={`relative w-full ${sizeClasses[modal.size || 'md']} max-h-[90vh] overflow-hidden`}>
              <div className={`rounded-xl shadow-2xl ${
                isLight 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-slate-800 border border-slate-700'
              }`}>
                {/* Header */}
                {(modal.title || modal.closable !== false) && (
                  <div className={`flex items-center justify-between p-4 border-b ${
                    isLight ? 'border-gray-200' : 'border-slate-700'
                  }`}>
                    {modal.title && (
                      <h2 className={`text-lg font-semibold ${
                        isLight ? 'text-gray-900' : 'text-white'
                      }`}>
                        {modal.title}
                      </h2>
                    )}
                    {modal.closable !== false && (
                      <button
                        onClick={() => closeModal(modal.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          isLight 
                            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                            : 'text-gray-500 hover:text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  {modal.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};