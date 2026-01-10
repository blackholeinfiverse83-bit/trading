import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcuts {
  onQuickPredict?: () => void;
  onQuickScan?: () => void;
  onFocusSearch?: () => void;
}

export const useKeyboardShortcuts = ({
  onQuickPredict,
  onQuickScan,
  onFocusSearch
}: KeyboardShortcuts = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            if (onQuickPredict) {
              onQuickPredict();
            } else {
              navigate('/dashboard');
            }
            break;
          case 's':
            event.preventDefault();
            if (onQuickScan) {
              onQuickScan();
            } else {
              navigate('/market-scan');
            }
            break;
          case 'k':
            event.preventDefault();
            if (onFocusSearch) {
              onFocusSearch();
            } else {
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
              }
            }
            break;
        }
      }

      switch (event.key) {
        case '/':
          event.preventDefault();
          if (onFocusSearch) {
            onFocusSearch();
          } else {
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
          break;
        case 'Escape':
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onQuickPredict, onQuickScan, onFocusSearch]);
};