import { useEffect, useRef } from 'react';
import { Person } from '../../types/race';
import { ParticipantStatusType } from '../../types/participant';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface StatusMenuProps {
  person: Person;
  currentStatus: ParticipantStatusType;
  onClose: () => void;
  onStatusChange: (status: 'late' | 'absent' | 'not_set') => void;
}

export default function StatusMenu({
  person,
  currentStatus,
  onClose,
  onStatusChange
}: StatusMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const fullName = `${person.surname} ${person.name}`;
  const groupName = person.group?.name || 'Не указана';
  const paymentStatus = person.is_paid ? 'Оплачено' : 'Не оплачено';

  // Блокируем скролл и клики вне меню
  useEffect(() => {
    // Блокируем скролл body когда меню открыто
    document.body.style.overflow = 'hidden';

    // Блокируем все клики вне меню, чтобы они не дошли до ячеек
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      
      // Если клик был внутри меню, разрешаем его (не блокируем)
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      
      // Если клик был по overlay или его дочерним элементам (но не внутри меню) - блокируем событие
      // чтобы оно не дошло до элементов под overlay, и закрываем меню
      if (overlayRef.current && overlayRef.current.contains(target)) {
        // Блокируем событие полностью, чтобы оно не дошло до элементов под overlay
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Вызываем onClose асинхронно, чтобы не мешать блокировке события
        setTimeout(() => {
          onClose();
        }, 0);
        return;
      }
      
      // Во всех остальных случаях (клик вне overlay) - блокируем событие и закрываем меню
      e.stopPropagation();
      e.stopImmediatePropagation();
      setTimeout(() => {
        onClose();
      }, 0);
    };

    const handleMouseDown = (e: MouseEvent) => {
      handleClickOutside(e);
    };

    const handleClick = (e: MouseEvent) => {
      handleClickOutside(e);
    };

    const handleTouchStart = (e: TouchEvent) => {
      handleClickOutside(e);
    };

    // Добавляем обработчики с capture фазой, чтобы перехватывать события до других обработчиков
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleTouchStart, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleStatusClick = (status: 'late' | 'absent' | 'not_set') => {
    onStatusChange(status);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Если клик был внутри меню, не закрываем
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      return;
    }
    
    // Во всех остальных случаях - закрываем меню и блокируем всплытие
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onClose();
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Если клик был внутри меню, не закрываем
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return;
    }
    
    // Во всех остальных случаях - закрываем меню и блокируем всплытие
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onClose();
  };

  const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Если касание было внутри меню, не закрываем
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return;
    }
    
    // Во всех остальных случаях - закрываем меню и блокируем всплытие
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onClose();
  };

  if (!document.body) {
    return null;
  }

  return createPortal(
    <div 
      ref={overlayRef}
      data-status-menu-overlay="true"
      onClick={handleOverlayClick}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        handleOverlayMouseDown(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        handleOverlayTouchStart(e);
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        pointerEvents: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        margin: 0,
        padding: 0,
        opacity: 1,
        visibility: 'visible'
      }}
    >
      <div 
        ref={menuRef}
        className="rounded-lg shadow-xl p-6 border-2 border-gray-400"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={{
          backgroundColor: '#f3f4f6',
          border: '2px solid #9ca3af',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          width: '80%',
          maxWidth: '500px',
          zIndex: 100000,
          pointerEvents: 'auto',
          margin: '1rem'
        }}
      >
        <h1 className="text-xl font-bold mb-4 text-gray-900">№ {person.bib}</h1>
        <div className="mb-6 space-y-2 text-base text-gray-800">
          <p><strong className="text-gray-900">ФИО:</strong> {fullName}</p>
          <p><strong className="text-gray-900">Группа:</strong> {groupName}</p>
          <p><strong className="text-gray-900">Оплата:</strong> {paymentStatus}</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => handleStatusClick('late')}
            className="w-full px-6 text-white rounded-lg transition-colors"
            style={{
              backgroundColor: '#eab308',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              minHeight: '4rem',
              marginTop: '1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eab308'}
          >
            {t('status.late')}
          </button>
          <button
            onClick={() => handleStatusClick('absent')}
            className="w-full px-6 text-white rounded-lg transition-colors"
            style={{
              backgroundColor: '#ef4444',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              minHeight: '4rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            {t('status.absent')}
          </button>
          {currentStatus !== 'not_set' && (
            <button
              onClick={() => handleStatusClick('not_set')}
              className="w-full px-6 text-gray-800 rounded-lg transition-colors"
              style={{
                backgroundColor: '#e5e7eb',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                minHeight: '4rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            >
              {t('status.reset')}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            style={{
              paddingTop: '1rem',
              paddingBottom: '1rem',
              minHeight: '4rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

