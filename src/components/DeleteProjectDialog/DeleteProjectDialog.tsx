import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface DeleteProjectDialogProps {
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProjectDialog({ projectName, onClose, onConfirm }: DeleteProjectDialogProps) {
  const { t } = useTranslation();

  return createPortal(
    <div 
      style={{ 
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        margin: 0,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        style={{ 
          zIndex: 10001,
          position: 'relative',
          backgroundColor: '#ffffff',
          padding: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">{t('dialogs.deleteProjectTitle')}</h3>
        <p className="mb-4 text-gray-700">
          {t('dialogs.deleteProjectMessage', { name: projectName })}
        </p>
        <div 
          className="flex"
          style={{
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <button
            onClick={onConfirm}
            className="flex-1 text-white rounded transition-colors"
            style={{
              paddingTop: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              backgroundColor: '#ef4444',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            {t('common.delete')}
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
    </div>,
    document.body
  );
}

