import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Project, TimerStateUpdater } from '../types/project';
import { Race } from '../types/race';
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

