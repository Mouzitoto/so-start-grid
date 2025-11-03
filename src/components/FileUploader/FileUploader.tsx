import { useState, useRef } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { parseSportOrgHTML } from '../../utils/parser';
import { useTranslation } from 'react-i18next';

export default function FileUploader() {
  const { createNewProject } = useProject();
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.html')) {
      setError('Пожалуйста, выберите HTML файл');
      return;
    }

    setError(null);
    
    try {
      const text = await file.text();
      const raceData = parseSportOrgHTML(text);
      
      if (!raceData) {
        setError('Не удалось распарсить файл. Убедитесь, что файл экспортирован из SportOrg.');
        return;
      }
      
      createNewProject(raceData);
    } catch (err) {
      console.error('Ошибка обработки файла:', err);
      setError('Ошибка при обработке файла. Попробуйте еще раз.');
    }
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

  return (
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
          width: '80%',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937',
          padding: '0.5rem'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html"
          onChange={handleFileSelect}
          className="hidden"
        />
        {t('common.createProject')}
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

