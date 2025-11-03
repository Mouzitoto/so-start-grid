import { Person } from '../../types/race';
import { ParticipantStatusType } from '../../types/participant';
import { useTranslation } from 'react-i18next';

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

  const fullName = `${person.surname} ${person.name}`;
  const groupName = person.group?.name || 'Не указана';
  const paymentStatus = person.is_paid ? 'Оплачено' : 'Не оплачено';

  const handleStatusClick = (status: 'late' | 'absent' | 'not_set') => {
    onStatusChange(status);
    onClose();
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
        zIndex: 50
      }}
    >
      <div 
        className="rounded-lg shadow-xl p-6 border-2 border-gray-400"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#f3f4f6',
          border: '2px solid #9ca3af',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          width: '80%',
          maxWidth: '500px'
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
    </div>
  );
}

