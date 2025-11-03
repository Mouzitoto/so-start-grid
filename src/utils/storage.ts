import { Project, StoredData } from '../types/project';
import { Race } from '../types/race';

const STORAGE_KEY = 'so-start-grid-data';

/**
 * Получить все данные из LocalStorage
 */
export function getStoredData(): StoredData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as StoredData;
    }
  } catch (error) {
    console.error('Ошибка чтения из LocalStorage:', error);
  }
  
  // Возвращаем дефолтные значения
  return {
    projects: [],
    settings: {
      language: 'ru',
      currentProjectId: null
    }
  };
}

/**
 * Сохранить данные в LocalStorage
 */
export function saveStoredData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка сохранения в LocalStorage:', error);
  }
}

/**
 * Получить все проекты
 */
export function getProjects(): Project[] {
  const data = getStoredData();
  return data.projects;
}

/**
 * Получить конкретный проект по ID
 */
export function getProject(projectId: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === projectId) || null;
}

/**
 * Сохранить проект (создать новый или обновить существующий)
 */
export function saveProject(project: Project): void {
  const data = getStoredData();
  const existingIndex = data.projects.findIndex(p => p.id === project.id);
  
  project.updatedAt = Date.now();
  
  if (existingIndex >= 0) {
    data.projects[existingIndex] = project;
  } else {
    data.projects.push(project);
  }
  
  saveStoredData(data);
}

/**
 * Создать новый проект из данных соревнования
 */
export function createProject(raceData: Race): Project {
  const now = Date.now();
  const dateStr = new Date().toLocaleDateString('ru-RU');
  const projectName = `${raceData.data.title} - ${dateStr}`;
  
  const project: Project = {
    id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
    name: projectName,
    createdAt: now,
    updatedAt: now,
    raceData,
    statuses: {},
    timerState: {
      started: false,
      startTime: null,
      currentRow: null
    },
    settings: {
      autoScrollEnabled: true
    }
  };
  
  // Сохраняем проект
  saveProject(project);
  
  // Получаем свежие данные и устанавливаем проект как текущий
  const data = getStoredData();
  data.settings.currentProjectId = project.id;
  saveStoredData(data);
  
  return project;
}

/**
 * Удалить проект
 */
export function deleteProject(projectId: string): void {
  const data = getStoredData();
  data.projects = data.projects.filter(p => p.id !== projectId);
  
  // Если удаляемый проект был текущим, сбрасываем currentProjectId
  if (data.settings.currentProjectId === projectId) {
    data.settings.currentProjectId = null;
  }
  
  saveStoredData(data);
}

/**
 * Получить текущий проект
 */
export function getCurrentProject(): Project | null {
  const data = getStoredData();
  if (!data.settings.currentProjectId) {
    return null;
  }
  return getProject(data.settings.currentProjectId);
}

/**
 * Установить текущий проект
 */
export function setCurrentProject(projectId: string | null): void {
  const data = getStoredData();
  data.settings.currentProjectId = projectId;
  saveStoredData(data);
}

/**
 * Сохранить настройки
 */
export function saveSettings(settings: Partial<StoredData['settings']>): void {
  const data = getStoredData();
  data.settings = { ...data.settings, ...settings };
  saveStoredData(data);
}

/**
 * Автоматическое сохранение проекта при изменении
 */
export function autoSaveProject(project: Project): void {
  saveProject(project);
}

