import { useState, useCallback, useRef, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { calculateIntervals } from '../../utils/time';
import ResetTimerDialog from '../ResetTimerDialog/ResetTimerDialog';
import DeleteProjectDialog from '../DeleteProjectDialog/DeleteProjectDialog';
import FileUpdateDialog from '../FileUpdateDialog/FileUpdateDialog';
import AddParticipantDialog from '../AddParticipantDialog/AddParticipantDialog';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { parseSportOrgHTML } from '../../utils/parser';

interface ContextMenuProps {
  onShowReport: () => void;
}

export default function ContextMenu({ onShowReport }: ContextMenuProps) {
  const { 
    currentProject, 
    updateTimerState, 
    updateSettings, 
    updateProject,
    updateProjectFromFile,
    backToProjects,
    deleteProject,
    setLanguage,
    language
  } = useProject();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleDeleteProject = useCallback(() => {
    if (currentProject) {
      const projectId = currentProject.id;
      deleteProject(projectId);
      backToProjects();
      setShowDeleteDialog(false);
      setIsOpen(false);
    }
  }, [currentProject, deleteProject, backToProjects]);

  const handleDialogClose = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleDialogConfirm = useCallback(() => {
    handleDeleteProject();
  }, [handleDeleteProject]);

  // Блокируем скролл и клики когда меню открыто
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

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
        // Вызываем закрытие меню асинхронно, чтобы не мешать блокировке события
        setTimeout(() => {
          setIsOpen(false);
          setShowLanguageMenu(false);
        }, 0);
        return;
      }
      
      // Во всех остальных случаях (клик вне overlay) - блокируем событие и закрываем меню
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
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setIsOpen(false);
    setShowLanguageMenu(false);
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
    setIsOpen(false);
    setShowLanguageMenu(false);
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
    setIsOpen(false);
    setShowLanguageMenu(false);
  };

  if (!currentProject) return null;

  const handleFinish = () => {
    updateTimerState({
      started: false,
      startTime: null,
      currentRow: null
    });
  };

  const handleToggleAutoScroll = () => {
    updateSettings({
      autoScrollEnabled: !currentProject.settings.autoScrollEnabled
    });
  };

  const handleLanguageChange = (lang: 'ru' | 'en' | 'kk') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
    setIsOpen(false);
  };

  const handleFileSelected = async (file: File) => {
    setUpdateError(null);
    
    try {
      const text = await file.text();
      const raceData = parseSportOrgHTML(text);
      
      if (!raceData) {
        setUpdateError(t('project.createFirst'));
        return;
      }
      
      const result = updateProjectFromFile(raceData);
      
      if (!result.success) {
        // Используем локализованную ошибку
        setUpdateError(t('dialogs.updateFromFileError'));
        return;
      }
      
      // Успешно обновлено
      setShowUpdateDialog(false);
      setIsOpen(false);
    } catch (err) {
      console.error('Ошибка обработки файла:', err);
      setUpdateError(t('project.createFirst'));
    }
  };

  if (showResetDialog) {
    return (
      <ResetTimerDialog
        onClose={() => setShowResetDialog(false)}
        onConfirm={(rowNumber) => {
          // Группируем участников по времени старта (как в StartGridView)
          const groupedByTime = currentProject.raceData.persons.reduce((acc, person) => {
            const timeKey = person.start_time.toString();
            if (!acc[timeKey]) {
              acc[timeKey] = [];
            }
            acc[timeKey].push(person);
            return acc;
          }, {} as Record<string, typeof currentProject.raceData.persons>);
          
          const sortedTimes = Object.keys(groupedByTime).sort((a, b) => 
            parseInt(a) - parseInt(b)
          );
          
          // Вычисляем интервалы между строками (нужно для пересчета startTime)
          const rowsForIntervals = sortedTimes.map(timeKey => ({
            startTime: parseInt(timeKey)
          }));
          const intervals = calculateIntervals(rowsForIntervals);
          
          // Вычисляем, сколько времени должно было пройти до rowNumber
          // Интервалы: interval[0] - от строки 0 до строки 1, interval[1] - от строки 1 до строки 2, и т.д.
          // Чтобы дойти до строки rowNumber, нужно просуммировать интервалы от 0 до rowNumber-1
          let elapsedToRow = 0;
          for (let i = 0; i < rowNumber && i < intervals.length; i++) {
            elapsedToRow += intervals[i];
          }
          
          // Пересчитываем startTime так, чтобы текущая строка была rowNumber
          const now = Date.now();
          const newStartTime = now - elapsedToRow;
          
          // Сброс статусов участников после указанной строки
          const updatedStatuses = { ...currentProject.statuses };
          
          // Получаем все строки после rowNumber
          for (let i = rowNumber + 1; i < sortedTimes.length; i++) {
            const timeKey = sortedTimes[i];
            const persons = groupedByTime[timeKey];
            persons.forEach(person => {
              delete updatedStatuses[`bib_${person.bib}`];
            });
          }
          
          // Сброс таймера и статусов - обновляем всё за один раз через updateProject
          const newTimerState = {
            started: true,
            startTime: newStartTime,
            currentRow: rowNumber
          };
          
          // Обновляем проект с новыми timerState и статусами за один раз
          updateProject({
            ...currentProject,
            timerState: newTimerState,
            statuses: updatedStatuses,
            updatedAt: Date.now()
          });
          
          setShowResetDialog(false);
          setIsOpen(false);
        }}
      />
    );
  }

  if (showDeleteDialog) {
    if (!currentProject) {
      setShowDeleteDialog(false);
      return null;
    }
    return (
      <DeleteProjectDialog
        projectName={currentProject.name}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
    );
  }

  if (showUpdateDialog) {
    return (
      <FileUpdateDialog
        onClose={() => {
          setShowUpdateDialog(false);
          setUpdateError(null);
          setIsOpen(false);
        }}
        onFileSelected={handleFileSelected}
        error={updateError}
      />
    );
  }

  if (showAddParticipantDialog) {
    return <AddParticipantDialog onClose={() => setShowAddParticipantDialog(false)} />;
  }

  return (
    <>
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
              left: '1rem',
              zIndex: 9999,
              backgroundColor: '#1f2937',
              color: '#ffffff',
              pointerEvents: 'auto'
            }}
          >
          <div className="py-2">
            {currentProject.timerState.started && (
              <button
                onClick={handleFinish}
                className="w-full text-left transition-colors"
                style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('common.finish')}
              </button>
            )}
            <button
              onClick={() => {
                onShowReport();
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('common.report')}
            </button>
            <button
              onClick={() => {
                navigate('/instruction');
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('instruction.title')}
            </button>
            <button
              onClick={() => {
                setShowUpdateDialog(true);
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('common.updateFromFile')}
            </button>
            <button
              onClick={() => {
                setShowAddParticipantDialog(true);
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('common.addParticipant')}
            </button>
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
            {currentProject.timerState.started && (
              <button
                onClick={handleToggleAutoScroll}
                className="w-full text-left transition-colors flex items-center justify-between"
                style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('menu.autoScroll')}
                <span style={{ fontSize: '1.125rem', color: currentProject.settings.autoScrollEnabled ? '#10b981' : '#9ca3af' }}>
                  {currentProject.settings.autoScrollEnabled ? '✓' : '○'}
                </span>
              </button>
            )}
            {currentProject.timerState.started && (
              <button
                onClick={() => {
                  setShowResetDialog(true);
                  setIsOpen(false);
                }}
                className="w-full text-left transition-colors"
                style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('common.resetTimer')}
              </button>
            )}
            <button
              onClick={() => {
                setShowDeleteDialog(true);
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ef4444', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('common.deleteProject')}
            </button>
            <button
              onClick={() => {
                backToProjects();
                setIsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '3.5rem', fontSize: '1.125rem', color: '#ffffff', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('common.backToProjects')}
            </button>
          </div>
        </div>
        </>
      )}
    </>
  );
}

