import { useState, useRef, useEffect } from 'react';
import { Person } from '../../types/race';
import { ParticipantStatusType } from '../../types/participant';
import StatusMenu from '../StatusMenu/StatusMenu';
import clsx from 'clsx';

interface ParticipantCellProps {
  person: Person;
  status: ParticipantStatusType;
  onQuickClick: () => void;
  onStatusChange: (status: 'late' | 'absent' | 'not_set') => void;
  timerStarted: boolean;
}

export default function ParticipantCell({
  person,
  status,
  onQuickClick,
  onStatusChange,
  timerStarted
}: ParticipantCellProps) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const menuJustOpenedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleTouchStart = () => {
    if (!timerStarted) return; // Блокируем, если таймер не запущен
    
    // Проверяем, есть ли overlay в DOM (любой StatusMenu или ContextMenu)
    const statusMenuOverlay = document.querySelector('[data-status-menu-overlay="true"]');
    const contextMenuOverlay = document.querySelector('[data-context-menu-overlay="true"]');
    
    // Если есть overlay - не обрабатываем касание
    if (statusMenuOverlay || contextMenuOverlay) {
      return;
    }
    
    longPressTimer.current = window.setTimeout(() => {
      menuJustOpenedRef.current = true;
      setShowMenu(true);
      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        menuJustOpenedRef.current = false;
      }, 100);
    }, 500); // 500ms для долгого нажатия
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Если меню только что открылось или уже открыто, предотвращаем всплытие события
    if (showMenu || menuJustOpenedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timerStarted) return; // Блокируем, если таймер не запущен
    
    // Проверяем, есть ли overlay в DOM (любой StatusMenu или ContextMenu)
    const statusMenuOverlay = document.querySelector('[data-status-menu-overlay="true"]');
    const contextMenuOverlay = document.querySelector('[data-context-menu-overlay="true"]');
    
    // Если есть overlay - не обрабатываем клик
    if (statusMenuOverlay || contextMenuOverlay) {
      return;
    }
    
    if (e.button === 0) { // Левая кнопка мыши
      longPressTimer.current = window.setTimeout(() => {
        menuJustOpenedRef.current = true;
        setShowMenu(true);
        // Сбрасываем флаг через небольшую задержку
        setTimeout(() => {
          menuJustOpenedRef.current = false;
        }, 100);
      }, 500);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Если меню только что открылось или уже открыто, предотвращаем всплытие события
    if (showMenu || menuJustOpenedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!timerStarted) return; // Блокируем, если таймер не запущен
    
    // Проверяем, есть ли overlay в DOM (любой StatusMenu или ContextMenu)
    const statusMenuOverlay = document.querySelector('[data-status-menu-overlay="true"]');
    const contextMenuOverlay = document.querySelector('[data-context-menu-overlay="true"]');
    
    // Если меню открыто или есть overlay - не обрабатываем клик
    if (showMenu || menuJustOpenedRef.current || statusMenuOverlay || contextMenuOverlay) {
      e.stopPropagation();
      return;
    }
    
    // Быстрое нажатие - только если статус еще не установлен
    if (status === 'not_set') {
      onQuickClick();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'entered':
        return 'bg-green-500 text-white';
      case 'late':
        return 'bg-yellow-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'entered':
        return { backgroundColor: '#10b981', color: '#ffffff' };
      case 'late':
        return { backgroundColor: '#eab308', color: '#ffffff' };
      case 'absent':
        return { backgroundColor: '#ef4444', color: '#ffffff' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#1f2937' };
    }
  };

  return (
    <>
      <div
        ref={cellRef}
        className={clsx(
          'w-full h-12 flex items-center justify-center rounded transition-colors text-sm font-medium',
          getStatusColor(),
          'select-none',
          timerStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
        )}
        style={{
          ...getStatusStyle(),
          touchAction: 'manipulation'
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col items-center justify-center">
          <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{person.bib}</span>
          <span className="opacity-90" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>{person.group?.name || ''}</span>
        </div>
      </div>
      {showMenu && (
        <StatusMenu
          person={person}
          currentStatus={status}
          onClose={() => {
            menuJustOpenedRef.current = false;
            setShowMenu(false);
          }}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
}

