import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import FileUploader from '../FileUploader/FileUploader';
import ProjectCard from './ProjectCard';

export default function ProjectList() {
  const { projects, selectProject, setLanguage, language } = useProject();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
  };

  const handleLanguageChange = (lang: 'ru' | 'en' | 'kk') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
    setIsOpen(false);
  };

  const handleInstruction = () => {
    navigate('/instruction');
    setIsOpen(false);
  };

  // Блокируем скролл и клики когда меню открыто
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      
      if (overlayRef.current && overlayRef.current.contains(target)) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        setTimeout(() => {
          setIsOpen(false);
          setShowLanguageMenu(false);
        }, 0);
        return;
      }
      
      e.stopPropagation();
      e.stopImmediatePropagation();
      setTimeout(() => {
        setIsOpen(false);
        setShowLanguageMenu(false);
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

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleTouchStart, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return;
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsOpen(false);
    setShowLanguageMenu(false);
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return;
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsOpen(false);
    setShowLanguageMenu(false);
  };

  const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (menuRef.current && menuRef.current.contains(target)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return;
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsOpen(false);
    setShowLanguageMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">SO Start Grid</h1>
        
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-gray-600 mb-8 text-center" style={{ marginBottom: '1rem' }}>{t('project.createFirst')}</p>
            <FileUploader />
          </div>
        ) : (
          <>
            <div className="flex justify-end" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
              <FileUploader />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
              {[...projects].sort((a, b) => b.createdAt - a.createdAt).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 text-white rounded-full transition-colors flex items-center justify-center"
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          width: '4rem',
          height: '4rem',
          minWidth: '4rem',
          minHeight: '4rem',
          zIndex: 9999,
          pointerEvents: 'auto',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
          backgroundColor: '#1f2937'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f2937';
        }}
        aria-label="Меню"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem', color: '#ffffff' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Меню */}
      {isOpen && (
        <>
          {createPortal(
            <div 
              ref={overlayRef}
              data-context-menu-overlay="true"
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
                zIndex: 9998,
                pointerEvents: 'auto',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                margin: 0,
                padding: 0,
                opacity: 1,
                visibility: 'visible'
              }}
            />,
            document.body
          )}
          <div 
            ref={menuRef}
            className="fixed bottom-24 right-4 rounded-lg shadow-xl min-w-[200px] border border-gray-700"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            style={{
              position: 'fixed',
              bottom: '6rem',
              right: '1rem',
              zIndex: 9999,
              backgroundColor: '#1f2937',
              color: '#ffffff',
              pointerEvents: 'auto'
            }}
          >
            <div className="py-2">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="w-full text-left transition-colors flex items-center justify-between"
                  style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {t('common.language')}
                  <span className="ml-2" style={{ color: '#ffffff' }}>›</span>
                </button>
                {showLanguageMenu && (
                  <div style={{ borderTop: '1px solid #4b5563', backgroundColor: '#111827' }}>
                    <button
                      onClick={() => handleLanguageChange('ru')}
                      className={`w-full text-left transition-colors ${language === 'ru' ? 'font-semibold' : ''}`}
                      style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Русский
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left transition-colors ${language === 'en' ? 'font-semibold' : ''}`}
                      style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('kk')}
                      className={`w-full text-left transition-colors ${language === 'kk' ? 'font-semibold' : ''}`}
                      style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Қазақша
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleInstruction}
                className="w-full text-left transition-colors"
                style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('instruction.title')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

