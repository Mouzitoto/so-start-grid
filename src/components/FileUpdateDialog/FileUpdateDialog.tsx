import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface FileUpdateDialogProps {
  onClose: () => void;
  onFileSelected: (file: File) => void;
  error: string | null;
}

export default function FileUpdateDialog({ onClose, onFileSelected, error }: FileUpdateDialogProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.html')) {
      return;
    }
    onFileSelected(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
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
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: '90%',
          width: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#ffffff'
          }}
        >
          {t('common.updateFromFile')}
        </h2>
        
        <div className="w-full flex justify-center">
          <button
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
              }
            `}
            style={{
              width: '100%',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              padding: '2rem'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html"
              onChange={handleFileSelect}
              className="hidden"
            />
            {t('common.selectFile')}
          </button>
        </div>
        
        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#7f1d1d',
              border: '1px solid #ef4444',
              color: '#ffffff',
              borderRadius: '0.25rem'
            }}
          >
            {error}
          </div>
        )}
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
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

