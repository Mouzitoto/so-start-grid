import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../contexts/ProjectContext';
import { Person } from '../../types/race';
import { toHHMMSS } from '../../utils/time';

interface ResetTimerDialogProps {
  onClose: () => void;
  onConfirm: (rowNumber: number) => void;
}

export default function ResetTimerDialog({ onClose, onConfirm }: ResetTimerDialogProps) {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Группируем участников по времени старта (как в StartGridView)
  const groupedByTime = currentProject?.raceData.persons.reduce((acc, person) => {
    const timeKey = person.start_time.toString();
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(person);
    return acc;
  }, {} as Record<string, Person[]>) || {};

  const sortedTimes = Object.keys(groupedByTime).sort((a, b) => 
    parseInt(a) - parseInt(b)
  );

  const handleConfirm = () => {
    if (!selectedTime) return;
    
    // Находим индекс выбранного времени
    const rowNumber = sortedTimes.indexOf(selectedTime);
    if (rowNumber !== -1) {
      onConfirm(rowNumber);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl border-2 border-gray-400"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '80%',
          backgroundColor: '#ffffff',
          border: '2px solid #9ca3af',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '1rem'
        }}
      >
        <h3 className="text-lg font-semibold mb-4">{t('dialogs.resetTimerTitle')}</h3>
        <p className="mb-4 text-gray-700" style={{ marginTop: '1rem' }}>{t('dialogs.resetTimerMessage')}</p>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full border border-gray-300 rounded mb-4"
          style={{ 
            fontSize: '1rem', 
            minHeight: '3rem',
            padding: '0.5rem',
            marginTop: '1rem'
          }}
        >
          <option value="">Выберите время</option>
          {sortedTimes.map((timeKey) => {
            // start_time хранится в миллисекундах, toHHMMSS принимает миллисекунды
            const timeInMs = parseInt(timeKey);
            return (
              <option key={timeKey} value={timeKey}>
                {toHHMMSS(timeInMs)}
              </option>
            );
          })}
        </select>
        <div 
          className="flex"
          style={{
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <button
            onClick={handleConfirm}
            disabled={!selectedTime}
            className="flex-1 text-white rounded transition-colors"
            style={{
              paddingTop: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              backgroundColor: selectedTime ? '#ef4444' : '#d1d5db',
              color: '#ffffff',
              cursor: selectedTime ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (selectedTime) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selectedTime ? '#ef4444' : '#d1d5db';
            }}
          >
            {t('common.confirm')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded transition-colors"
            style={{
              paddingTop: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              backgroundColor: '#d1d5db',
              color: '#1f2937'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d1d5db';
            }}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

