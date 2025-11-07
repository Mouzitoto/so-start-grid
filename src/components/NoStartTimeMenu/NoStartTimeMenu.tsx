import { useState, useEffect, useRef } from 'react';
import { Person } from '../../types/race';
import { ParticipantStatusType } from '../../types/participant';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../contexts/ProjectContext';
import { toHHMMSS } from '../../utils/time';

interface NoStartTimeMenuProps {
  person: Person;
  currentStatus: ParticipantStatusType;
  onClose: () => void;
  onStatusChange: (status: 'late' | 'absent' | 'not_set') => void;
  onStartTimeChange: (startTime: number) => void;
}

export default function NoStartTimeMenu({
  person,
  currentStatus,
  onClose,
  onStatusChange,
  onStartTimeChange
}: NoStartTimeMenuProps) {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Получаем все доступные времена старта из шахматки
  const groupedByTime = currentProject?.raceData.persons.reduce((acc, p) => {
    if (p.start_time > 0) { // Только ненулевые времена
      const timeKey = p.start_time.toString();
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(p);
    }
    return acc;
  }, {} as Record<string, Person[]>) || {};

  const sortedTimes = Object.keys(groupedByTime).sort((a, b) => 
    parseInt(a) - parseInt(b)
  );

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Небольшая задержка, чтобы не закрыть меню сразу после открытия
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  const handleStatusClick = (status: 'late' | 'absent' | 'not_set') => {
    onStatusChange(status);
    onClose();
  };

  const handleStartTimeSelect = () => {
    if (selectedTime) {
      const timeInMs = parseInt(selectedTime);
      onStartTimeChange(timeInMs);
      onClose();
    }
  };

  return (
    <div 
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: '#1f2937',
        borderRadius: '0.25rem',
        padding: '1rem',
        marginTop: '0.5rem',
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      {currentStatus !== 'not_set' && (
        <button
          onClick={() => handleStatusClick('not_set')}
          style={{
            backgroundColor: '#e5e7eb',
            color: '#1f2937',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            minHeight: '3rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
        >
          {t('status.reset')}
        </button>
      )}
      <button
        onClick={() => handleStatusClick('absent')}
        style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          minHeight: '3rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
          flex: '1',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
      >
        {t('status.absent')}
      </button>
      <div style={{ flex: '1', minWidth: '150px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          color: '#d1d5db', 
          marginBottom: '0.5rem' 
        }}>
          {t('dialogs.startTime')}
        </label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={{ 
            width: '100%',
            fontSize: '1rem', 
            minHeight: '3rem',
            padding: '0.5rem',
            backgroundColor: '#374151',
            color: '#ffffff',
            border: '1px solid #4b5563',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          <option value="">{t('dialogs.selectTime')}</option>
          {sortedTimes.map((timeKey) => {
            const timeInMs = parseInt(timeKey);
            return (
              <option key={timeKey} value={timeKey} style={{ backgroundColor: '#1f2937' }}>
                {toHHMMSS(timeInMs)}
              </option>
            );
          })}
        </select>
        {selectedTime && (
          <button
            onClick={handleStartTimeSelect}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              minHeight: '3rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            {t('common.confirm')}
          </button>
        )}
      </div>
    </div>
  );
}

