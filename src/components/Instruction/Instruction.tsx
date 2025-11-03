import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { createPortal } from 'react-dom';

export default function Instruction() {
  const { t, i18n } = useTranslation();
  const { setLanguage, language, backToProjects } = useProject();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: 'ru' | 'en' | 'kk') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
    setIsOpen(false);
  };

  const handleBackToProjects = () => {
    backToProjects();
    navigate('/');
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

  // Функция для выделения названий кнопок жирным текстом
  const highlightButtons = (text: string | undefined) => {
    if (!text) return '';
    
    // Список кнопок для всех языков
    const buttonNames = [
      'Сбросить таймер на N строку',
      'Добавить на главный экран',
      'Установить приложение',
      'Add to Home Screen',
      'Авто скроллинг',
      'Создать проект',
      'На экран «Домой»',
      'Не пришел',
      'Поделиться',
      'Опоздал',
      'Зашел',
      'Установить',
      'Завершить',
      'Добавить',
      'Отчет',
      'Экспорт',
      'Старт',
      // English
      'Create Project',
      'Start',
      'Finish',
      'Auto scroll',
      'Reset Timer to Row N',
      'Report',
      'Export',
      'Absent',
      'Late',
      'Entered',
      'Install app',
      'Add to home screen',
      'Install',
      'Share',
      'Add to Home Screen',
      'Add',
      // Kazakh
      'Жоба жасау',
      'Бастау',
      'Аяқтау',
      'Авто айналдыру',
      'Таймерді N жолға қалпына келтіру',
      'Есеп',
      'Экспорт',
      'Келмеді',
      'Кешікті',
      'Кірді',
      'Қолданбаны орнату',
      'Басты экранға қосу',
      'Орнату',
      'Бөлісу',
      'Басты экранға қосу',
      'Қосу'
    ];

    let result = text;
    
    // Обрабатываем варианты с кавычками
    buttonNames.forEach(buttonName => {
      const escapedName = buttonName.replace(/[.*+?^${}()|[\]\\«»]/g, '\\$&');
      const regexWithQuotes = new RegExp(`"${escapedName}"`, 'g');
      result = result.replace(regexWithQuotes, `<strong>"${buttonName}"</strong>`);
    });
    
    // Обрабатываем варианты без кавычек (простая замена, чтобы избежать проблем с совместимостью)
    buttonNames.forEach(buttonName => {
      const escapedName = buttonName.replace(/[.*+?^${}()|[\]\\«»]/g, '\\$&');
      // Ищем слова целиком
      const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        // Если уже внутри тега strong, не заменяем
        const index = result.indexOf(match);
        const beforeMatch = result.substring(0, index);
        const lastStrongOpen = beforeMatch.lastIndexOf('<strong>');
        const lastStrongClose = beforeMatch.lastIndexOf('</strong>');
        
        if (lastStrongOpen > lastStrongClose) {
          return match; // Уже внутри тега
        }
        return `<strong>${match}</strong>`;
      });
    });

    return result;
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50" style={{ padding: '2rem' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg" style={{ padding: '2rem' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{t('instruction.title')}</h1>
        </div>

        <div className="space-y-6 text-gray-800" style={{ lineHeight: '1.8' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-3">{t('instruction.overview.title')}</h2>
            <p className="mb-3">{t('instruction.overview.text')}</p>
            <p className="text-gray-700 italic">
              {(() => {
                const offlineNote = t('instruction.overview.offlineNote') || '';
                
                // Проверяем русский
                if (offlineNote.includes('"Установка на телефон"')) {
                  const parts = offlineNote.split('"Установка на телефон"');
                  return (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[0]) }} />
                      {' '}
                      <a href="#installation" className="text-blue-600 underline hover:text-blue-800">"Установка на телефон"</a>
                      {parts[1] && <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[1]) }} />}
                    </>
                  );
                }
                // Проверяем английский
                else if (offlineNote.includes('"Phone Installation"')) {
                  const parts = offlineNote.split('"Phone Installation"');
                  return (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[0]) }} />
                      {' '}
                      <a href="#installation" className="text-blue-600 underline hover:text-blue-800">"Phone Installation"</a>
                      {parts[1] && <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[1]) }} />}
                    </>
                  );
                }
                // Проверяем казахский
                else if (offlineNote.includes('"Телефонға орнату"')) {
                  const parts = offlineNote.split('"Телефонға орнату"');
                  return (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[0]) }} />
                      {' '}
                      <a href="#installation" className="text-blue-600 underline hover:text-blue-800">"Телефонға орнату"</a>
                      {parts[1] && <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[1]) }} />}
                    </>
                  );
                }
                
                // Если ссылка не найдена, просто показываем текст
                return <span dangerouslySetInnerHTML={{ __html: highlightButtons(offlineNote) }} />;
              })()}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">{t('instruction.functions.title')}</h2>
            <ul className="list-disc list-outside space-y-3 ml-6" style={{ paddingLeft: '1.5rem' }}>
              <li>{t('instruction.functions.projects')}</li>
              <li>
                <strong>{t('instruction.functions.grid.title')}</strong>
                <ul className="list-disc list-outside space-y-2 ml-6 mt-2" style={{ paddingLeft: '1.5rem' }}>
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.info')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.statuses')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.timer')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.autoscroll')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.reset')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.functions.grid.pause')) }} />
                </ul>
              </li>
              <li>{t('instruction.functions.report')}</li>
              <li>{t('instruction.functions.language')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">{t('instruction.usage.title')}</h2>
            <ol className="list-decimal list-outside space-y-4 ml-6" style={{ paddingLeft: '1.5rem' }}>
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step1')) }} />
              <li>
                {(() => {
                  const step2Text = t('instruction.usage.step2') || '';
                  const parts = step2Text.split('"Установка на телефон"');
                  if (parts.length === 2) {
                    return (
                      <>
                        <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[0]) }} />
                        {' '}
                        <a href="#installation" className="text-blue-600 underline hover:text-blue-800">"Установка на телефон"</a>
                        {' '}
                        <span dangerouslySetInnerHTML={{ __html: highlightButtons(parts[1]) }} />
                      </>
                    );
                  }
                  // Если нет фразы "Установка на телефон", просто показываем весь текст
                  return <span dangerouslySetInnerHTML={{ __html: highlightButtons(step2Text) }} />;
                })()}
              </li>
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step3')) }} />
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step4')) }} />
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step5')) }} />
              <li>
                <span dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step6')) }} />
                <ul className="list-disc list-outside space-y-2 ml-6 mt-2" style={{ paddingLeft: '1.5rem' }}>
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step6a')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step6b')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step6c')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step6d')) }} />
                </ul>
              </li>
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step7')) }} />
              <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.usage.step8')) }} />
            </ol>
          </section>

          <section id="installation">
            <h2 className="text-2xl font-semibold mb-3">{t('instruction.installation.title')}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">{t('instruction.installation.android.title')}</h3>
                <p className="mb-3 text-gray-700">{t('instruction.installation.android.text')}</p>
                <ol className="list-decimal list-outside space-y-2 ml-6" style={{ paddingLeft: '1.5rem' }}>
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step1')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step2')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step3')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step4')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step5')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.android.step6')) }} />
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">{t('instruction.installation.ios.title')}</h3>
                <p className="mb-3 text-gray-700">{t('instruction.installation.ios.text')}</p>
                <ol className="list-decimal list-outside space-y-2 ml-6" style={{ paddingLeft: '1.5rem' }}>
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step1')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step2')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step3')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step4')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step5')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step6')) }} />
                  <li dangerouslySetInnerHTML={{ __html: highlightButtons(t('instruction.installation.ios.step7')) }} />
                </ol>
              </div>
            </div>
          </section>
        </div>
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
                onClick={handleBackToProjects}
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
    </div>
  );
}


