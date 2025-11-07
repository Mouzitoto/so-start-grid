import { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface AddParticipantDialogProps {
  onClose: () => void;
}

export default function AddParticipantDialog({ onClose }: AddParticipantDialogProps) {
  const { addPersonToNoStartTime } = useProject();
  const { t } = useTranslation();
  const [newBib, setNewBib] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddPerson = () => {
    const bibNumber = parseInt(newBib.trim());
    if (isNaN(bibNumber) || bibNumber <= 0) {
      setAddError(t('dialogs.invalidParticipantNumber'));
      return;
    }

    const result = addPersonToNoStartTime(bibNumber);
    if (result.success) {
      setNewBib('');
      setAddError(null);
      onClose();
    } else {
      setAddError(result.error || t('dialogs.addParticipantError'));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          borderRadius: '0.5rem',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ffffff'
            }}
          >
            {t('dialogs.addParticipantTitle')}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#374151',
              border: '2px solid #6b7280',
              color: '#ffffff',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              lineHeight: '1',
              borderRadius: '0.375rem',
              minWidth: '2.5rem',
              minHeight: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.borderColor = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            color: '#d1d5db', 
            marginBottom: '0.5rem' 
          }}>
            {t('dialogs.participantNumber')}
          </label>
          <input
            type="number"
            value={newBib}
            onChange={(e) => {
              setNewBib(e.target.value);
              setAddError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPerson();
              }
            }}
            style={{
              width: '100%',
              fontSize: '1rem',
              padding: '0.75rem',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: '1px solid #4b5563',
              borderRadius: '0.25rem',
              outline: 'none'
            }}
            placeholder={t('dialogs.enterParticipantNumber')}
            autoFocus
          />
          {addError && (
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#ef4444', 
              fontSize: '0.875rem' 
            }}>
              {addError}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAddPerson}
            style={{
              flex: 1,
              backgroundColor: '#10b981',
              color: '#ffffff',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            {t('common.save')}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: '#6b7280',
              color: '#ffffff',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

