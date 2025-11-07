import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Project, TimerStateUpdater } from '../types/project';
import { Race, Person } from '../types/race';
import { ParticipantStatus } from '../types/participant';
import { 
  getProjects, 
  getCurrentProject, 
  setCurrentProject, 
  createProject, 
  deleteProject as deleteProjectStorage,
  saveProject as saveProjectStorage,
  getStoredData,
  saveSettings
} from '../utils/storage';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  loadProjects: () => void;
  createNewProject: (raceData: Race) => Project;
  selectProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
  updateStatus: (bib: number, status: ParticipantStatus) => void;
  updateTimerState: (timerState: TimerStateUpdater) => void;
  updateSettings: (settings: Partial<Project['settings']>) => void;
  updateProjectFromFile: (raceData: Race) => { success: boolean; error?: string };
  updatePersonStartTime: (bib: number, startTime: number) => void;
  addPersonToNoStartTime: (bib: number) => { success: boolean; error?: string };
  language: 'ru' | 'en' | 'kk';
  setLanguage: (lang: 'ru' | 'en' | 'kk') => void;
  backToProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [language, setLanguageState] = useState<'ru' | 'en' | 'kk'>('ru');

  useEffect(() => {
    loadProjects();
    const data = getStoredData();
    setLanguageState(data.settings.language || 'ru');
    
    // Загружаем текущий проект если есть
    if (data.settings.currentProjectId) {
      const project = getCurrentProject();
      setCurrentProjectState(project);
    }
  }, []);

  const loadProjects = () => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
  };

  const createNewProject = (raceData: Race): Project => {
    const project = createProject(raceData);
    loadProjects();
    setCurrentProjectState(project);
    return project;
  };

  const selectProject = (projectId: string) => {
    const project = getProjects().find(p => p.id === projectId);
    if (project) {
      setCurrentProject(projectId);
      setCurrentProjectState(project);
    }
  };

  const deleteProject = (projectId: string) => {
    // Удаляем проект из хранилища
    deleteProjectStorage(projectId);
    
    // Очищаем currentProjectId в настройках
    setCurrentProject(null);
    
    // Очищаем текущий проект в состоянии - используем функциональное обновление
    setCurrentProjectState(prev => {
      if (prev?.id === projectId) {
        return null;
      }
      return prev;
    });
    
    // Перезагружаем список проектов
    loadProjects();
  };

  const updateProject = (project: Project) => {
    saveProjectStorage(project);
    loadProjects();
    // Используем функциональное обновление чтобы всегда иметь актуальное значение
    setCurrentProjectState(prev => {
      if (prev?.id === project.id) {
        return project;
      }
      return prev;
    });
  };

  const updateStatus = (bib: number, status: ParticipantStatus) => {
    // Используем функциональное обновление для получения актуального currentProject
    setCurrentProjectState(prev => {
      if (!prev) return prev;
      
      // Создаем полностью новый объект statuses
      const newStatuses = { ...prev.statuses };
      newStatuses[`bib_${bib}`] = status;
      
      const updatedProject: Project = {
        ...prev,
        statuses: newStatuses,
        updatedAt: Date.now()
      };
      
      saveProjectStorage(updatedProject);
      loadProjects();
      
      return updatedProject;
    });
  };

  const updateTimerState = (timerStateOrUpdater: TimerStateUpdater) => {
    setCurrentProjectState(prev => {
      if (!prev) {
        return prev;
      }
      
      // Если передан функция-обновление, вызываем её с текущим timerState
      const newTimerState = typeof timerStateOrUpdater === 'function' 
        ? timerStateOrUpdater(prev.timerState)
        : timerStateOrUpdater;
      
      // Проверяем, действительно ли состояние изменилось
      const timerStateChanged = 
        prev.timerState.startTime !== newTimerState.startTime ||
        prev.timerState.currentRow !== newTimerState.currentRow ||
        prev.timerState.started !== newTimerState.started;
      
      if (!timerStateChanged && typeof timerStateOrUpdater !== 'function') {
        // Если передано прямое значение и оно не изменилось, возвращаем тот же объект
        return prev;
      }
      
      const updatedProject: Project = {
        ...prev,
        timerState: newTimerState,
        updatedAt: Date.now()
      };
      
      // Сохраняем в хранилище, но НЕ вызываем loadProjects(), так как это может вызвать лишние ререндеры
      saveProjectStorage(updatedProject);
      
      // Принудительно возвращаем новый объект, чтобы React распознал изменение
      return { ...updatedProject };
    });
    
    // Вызываем loadProjects() после обновления состояния, чтобы обновить список проектов
    // но не внутри setState, чтобы избежать проблем с очередностью обновлений
    setTimeout(() => {
      loadProjects();
    }, 0);
  };

  const updateSettings = (settings: Partial<Project['settings']>) => {
    setCurrentProjectState(prev => {
      if (!prev) return prev;
      
      const updatedProject: Project = {
        ...prev,
        settings: {
          ...prev.settings,
          ...settings
        },
        updatedAt: Date.now()
      };
      
      saveProjectStorage(updatedProject);
      loadProjects();
      
      return updatedProject;
    });
  };

  const updateProjectFromFile = (newRaceData: Race): { success: boolean; error?: string } => {
    const current = getCurrentProject();
    if (!current) {
      return { success: false, error: 'Текущий проект не найден' };
    }

    // Проверяем, что ID совпадают
    if (current.raceData.id !== newRaceData.id) {
      return { success: false, error: 'Новый файл не является корректировкой оригинального файла' };
    }

    // Вычисляем текущее время таймера (если таймер запущен)
    let currentTimerTime: number | null = null;
    if (current.timerState.started && current.timerState.startTime !== null) {
      const now = Date.now();
      const elapsed = now - current.timerState.startTime;
      
      // Группируем участников по времени старта для вычисления текущего времени
      const groupedByTime = current.raceData.persons.reduce((acc, person) => {
        const timeKey = person.start_time.toString();
        if (!acc[timeKey]) {
          acc[timeKey] = [];
        }
        acc[timeKey].push(person);
        return acc;
      }, {} as Record<string, typeof current.raceData.persons>);
      
      const sortedTimes = Object.keys(groupedByTime).sort((a, b) => 
        parseInt(a) - parseInt(b)
      );
      
      const rowsForIntervals = sortedTimes.map(timeKey => ({
        startTime: parseInt(timeKey)
      }));
      
      // Вычисляем интервалы
      const intervals: number[] = [];
      for (let i = 0; i < rowsForIntervals.length - 1; i++) {
        const interval = rowsForIntervals[i + 1].startTime - rowsForIntervals[i].startTime;
        intervals.push(interval);
      }
      if (intervals.length > 0) {
        intervals.push(intervals[intervals.length - 1]);
      }
      
      // Определяем текущую строку
      let sum = 0;
      let currentRow = 0;
      for (let i = 0; i < intervals.length; i++) {
        if (elapsed >= sum + intervals[i]) {
          sum += intervals[i];
          currentRow = i + 1;
        } else {
          break;
        }
      }
      
      // Вычисляем текущее время таймера (время старта для текущей строки)
      if (currentRow < sortedTimes.length) {
        currentTimerTime = parseInt(sortedTimes[currentRow]);
      } else if (sortedTimes.length > 0) {
        // Если таймер прошел все строки, используем время последней строки
        currentTimerTime = parseInt(sortedTimes[sortedTimes.length - 1]);
      }
    }

    // Сохраняем статусы для участников с start_time < текущего времени таймера
    // Обнуляем статусы для участников с start_time >= текущего времени таймера
    const updatedStatuses: Record<string, ParticipantStatus> = {};
    
    if (currentTimerTime !== null) {
      // Таймер запущен - сохраняем статусы только для участников до текущего времени
      Object.entries(current.statuses).forEach(([key, status]) => {
        const bib = parseInt(key.replace('bib_', ''));
        // Находим участника в старых данных
        const oldPerson = current.raceData.persons.find(p => p.bib === bib);
        if (oldPerson && oldPerson.start_time < currentTimerTime!) {
          // Проверяем, что участник есть в новых данных
          const newPerson = newRaceData.persons.find(p => p.bib === bib);
          if (newPerson) {
            updatedStatuses[key] = status;
          }
        }
      });
    } else {
      // Таймер не запущен - сохраняем все статусы
      Object.entries(current.statuses).forEach(([key, status]) => {
        const bib = parseInt(key.replace('bib_', ''));
        const newPerson = newRaceData.persons.find(p => p.bib === bib);
        if (newPerson) {
          updatedStatuses[key] = status;
        }
      });
    }

    // Обновляем список участников без стартового времени при обновлении из файла
    const newNoStartTimeBibs = newRaceData.persons
      .filter(person => person.start_time === 0)
      .map(person => person.bib);
    
    // Объединяем старый и новый списки, чтобы не потерять участников, которым уже установили время
    const mergedNoStartTimeBibs = Array.from(new Set([
      ...(current.noStartTimeBibs || []),
      ...newNoStartTimeBibs
    ]));

    // Обновляем проект с новыми данными
    const updatedProject: Project = {
      ...current,
      raceData: newRaceData,
      statuses: updatedStatuses,
      noStartTimeBibs: mergedNoStartTimeBibs,
      updatedAt: Date.now()
      // timerState не меняем - сохраняем как есть
    };

    saveProjectStorage(updatedProject);
    loadProjects();
    setCurrentProjectState(updatedProject);

    return { success: true };
  };

  const updatePersonStartTime = (bib: number, startTime: number) => {
    setCurrentProjectState(prev => {
      if (!prev) return prev;
      
      // Обновляем start_time для участника в raceData
      const updatedPersons = prev.raceData.persons.map(person => 
        person.bib === bib ? { ...person, start_time: startTime } : person
      );
      
      const updatedProject: Project = {
        ...prev,
        raceData: {
          ...prev.raceData,
          persons: updatedPersons
        },
        updatedAt: Date.now()
      };
      
      saveProjectStorage(updatedProject);
      loadProjects();
      
      return updatedProject;
    });
  };

  const addPersonToNoStartTime = (bib: number): { success: boolean; error?: string } => {
    const current = getCurrentProject();
    if (!current) {
      return { success: false, error: 'Текущий проект не найден' };
    }

    // Проверяем, не существует ли уже участник с таким номером
    const existingPerson = current.raceData.persons.find(p => p.bib === bib);
    if (existingPerson) {
      return { success: false, error: 'Участник с таким номером уже существует' };
    }

    // Создаем нового участника с минимальными данными
    const newPerson: Person = {
      id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bib: bib,
      name: '',
      surname: '',
      birth_date: null,
      card_number: 0,
      comment: '',
      group_id: '', // Без группы
      organization_id: null,
      qual: 0,
      sex: 0,
      start_group: 0,
      start_time: 0, // Без стартового времени
      is_out_of_competition: false,
      is_paid: false,
      is_personal: false,
      is_rented_card: false,
      year: new Date().getFullYear()
    };

    // Не связываем группу с участником - участник без группы

    // Добавляем участника в raceData
    const updatedPersons = [...current.raceData.persons, newPerson];
    
    // Добавляем bib в noStartTimeBibs
    const updatedNoStartTimeBibs = [...(current.noStartTimeBibs || []), bib];

    const updatedProject: Project = {
      ...current,
      raceData: {
        ...current.raceData,
        persons: updatedPersons
      },
      noStartTimeBibs: updatedNoStartTimeBibs,
      updatedAt: Date.now()
    };

    saveProjectStorage(updatedProject);
    loadProjects();
    setCurrentProjectState(updatedProject);

    return { success: true };
  };

  const setLanguage = (lang: 'ru' | 'en' | 'kk') => {
    saveSettings({ language: lang });
    setLanguageState(lang);
  };

  const backToProjects = () => {
    setCurrentProject(null);
    setCurrentProjectState(null);
    // Перезагружаем список проектов, чтобы убедиться, что он актуален
    loadProjects();
  };

  // Создаем новое значение контекста при каждом изменении currentProject
  // Используем ключ для сравнения, чтобы гарантировать обновление при любом изменении
  const currentProjectKey = currentProject 
    ? `${currentProject.id}-${currentProject.timerState.startTime}-${currentProject.timerState.currentRow}-${currentProject.updatedAt}` 
    : null;
  
  const contextValue = useMemo(() => {
    return {
      projects,
      currentProject,
      loadProjects,
      createNewProject,
      selectProject,
      deleteProject,
      updateProject,
      updateStatus,
      updateTimerState,
      updateSettings,
      updateProjectFromFile,
      updatePersonStartTime,
      addPersonToNoStartTime,
      language,
      setLanguage,
      backToProjects
    };
  }, [projects, currentProject, currentProjectKey, language]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

