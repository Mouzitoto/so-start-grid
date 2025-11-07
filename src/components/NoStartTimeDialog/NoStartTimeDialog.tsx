import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Person } from '../../types/race';
import { ParticipantStatusType } from '../../types/participant';
import NoStartTimeMenu from '../NoStartTimeMenu/NoStartTimeMenu';
import { toHHMMSS } from '../../utils/time';

interface NoStartTimeDialogProps {
  onClose: () => void;
}

export default function NoStartTimeDialog({ onClose }: NoStartTimeDialogProps) {
  const { currentProject, updateStatus, updatePersonStartTime, addPersonToNoStartTime } = useProject();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState<number | null>(null); // bib участника, для которого открыто меню
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBib, setNewBib] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const cellRefs = useRef<Map<number, HTMLElement>>(new Map());

  if (!currentProject) return null;

  // Показываем участников, у которых изначально было start_time === 0
  // (независимо от того, установили ли им время позже)
  const noStartTimeBibsSet = new Set(currentProject.noStartTimeBibs || []);
  const noStartTimePersons = currentProject.raceData.persons.filter(
    person => noStartTimeBibsSet.has(person.bib)
  );

  const handlePersonClick = (bib: number) => {
    updateStatus(bib, {
      status: 'entered',
      timestamp: Date.now()
    });
  };

  const handleTouchStart = (person: Person) => {
    longPressTimer.current = window.setTimeout(() => {
      setShowMenu(person.bib);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = (person: Person, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    longPressTimer.current = window.setTimeout(() => {
      setShowMenu(person.bib);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleStatusChange = (bib: number, status: 'late' | 'absent' | 'not_set') => {
    updateStatus(bib, {
      status,
      timestamp: Date.now()
    });
    
    // Если устанавливаем статус "не пришел", очищаем стартовое время (если оно было установлено)
    if (status === 'absent') {
      const person = currentProject.raceData.persons.find(p => p.bib === bib);
      if (person && person.start_time > 0) {
        updatePersonStartTime(bib, 0);
      }
    }
  };

  const handleStartTimeChange = (bib: number, startTime: number) => {
    updatePersonStartTime(bib, startTime);
  };

  const handleAddPerson = () => {
    const bibNumber = parseInt(newBib.trim());
    if (isNaN(bibNumber) || bibNumber <= 0) {
      setAddError(t('dialogs.invalidParticipantNumber'));
      return;
    }

    const result = addPersonToNoStartTime(bibNumber);
    if (result.success) {
      setNewBib('');
      setShowAddForm(false);
      setAddError(null);
    } else {
      setAddError(result.error || t('dialogs.addParticipantError'));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

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
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ffffff'
            }}
          >
            Участники без стартового времени
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

        {noStartTimePersons.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
            Нет участников без стартового времени
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {noStartTimePersons.map((person) => {
              const statusKey = `bib_${person.bib}`;
              const status = currentProject.statuses[statusKey];
              const statusValue = status?.status || 'not_set';
              const isEntered = statusValue === 'entered';
              const isAbsent = statusValue === 'absent';
              const isMenuOpen = showMenu === person.bib;
              const hasStartTime = person.start_time > 0;

              // Определяем цвет фона в зависимости от статуса
              const getBackgroundColor = () => {
                if (isEntered) return '#10b981';
                if (isAbsent) return '#ef4444';
                return '#374151'; // серый для not_set
              };

              const getBorderColor = () => {
                if (isEntered) return '#059669';
                if (isAbsent) return '#dc2626';
                return 'transparent';
              };

              const getHoverColor = () => {
                if (isEntered) return '#10b981';
                if (isAbsent) return '#dc2626';
                return '#4b5563';
              };

              return (
                <div key={person.id}>
                  <div
                    ref={(el) => {
                      if (el) {
                        cellRefs.current.set(person.bib, el);
                      } else {
                        cellRefs.current.delete(person.bib);
                      }
                    }}
                    onClick={() => {
                      if (!isMenuOpen) {
                        handlePersonClick(person.bib);
                      }
                    }}
                    onTouchStart={() => handleTouchStart(person)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    onMouseDown={(e) => handleMouseDown(person, e)}
                    onMouseUp={handleMouseUp}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 2fr',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: getBackgroundColor(),
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      border: `2px solid ${getBorderColor()}`
                    }}
                    onMouseEnter={(e) => {
                      if (!isEntered && !isAbsent) {
                        e.currentTarget.style.backgroundColor = getHoverColor();
                      }
                    }}
                    onMouseLeave={(e) => {
                      handleMouseLeave();
                      if (!isEntered && !isAbsent) {
                        e.currentTarget.style.backgroundColor = getBackgroundColor();
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                      {person.bib}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: isEntered || isAbsent ? 'rgba(255, 255, 255, 0.9)' : '#d1d5db' }}>
                      {person.group?.name || '—'}
                    </div>
                    <div style={{ fontSize: '1rem', color: isEntered || isAbsent ? '#ffffff' : '#ffffff' }}>
                      <div>{person.surname} {person.name}</div>
                      {hasStartTime && (
                        <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
                          {toHHMMSS(person.start_time)}
                        </div>
                      )}
                    </div>
                  </div>
                  {isMenuOpen && (
                    <NoStartTimeMenu
                      person={person}
                      currentStatus={statusValue as ParticipantStatusType}
                      onClose={() => setShowMenu(null)}
                      onStatusChange={(status) => {
                        handleStatusChange(person.bib, status);
                        setShowMenu(null);
                      }}
                      onStartTimeChange={(startTime) => {
                        handleStartTimeChange(person.bib, startTime);
                        setShowMenu(null);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #374151' }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              {t('common.add')}
            </button>
          ) : (
            <div
              style={{
                backgroundColor: '#1f2937',
                borderRadius: '0.375rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
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
                  onClick={() => {
                    setShowAddForm(false);
                    setNewBib('');
                    setAddError(null);
                  }}
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
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

