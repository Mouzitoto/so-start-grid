import { Race } from '../types/race';

/**
 * Безопасный парсинг HTML файла SportOrg для извлечения объекта race
 * Использует регулярные выражения вместо выполнения JavaScript кода
 */
export function parseSportOrgHTML(htmlContent: string): Race | null {
  try {
    // Ищем скрипт блок с переменной race
    const raceMatch = htmlContent.match(/var\s+race\s*=\s*({[\s\S]*?});/);
    
    if (!raceMatch) {
      console.error('Не найдена переменная race в HTML файле');
      return null;
    }

    // Извлекаем JSON объект
    let raceJsonString = raceMatch[1];
    
    // Исправляем возможные проблемы с экранированием
    // Заменяем неэкранированные управляющие символы
    raceJsonString = raceJsonString
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    // Парсим JSON
    const race = JSON.parse(raceJsonString) as Race;

    // Валидация базовой структуры
    if (!race.persons || !Array.isArray(race.persons)) {
      throw new Error('Неверная структура данных: отсутствует массив persons');
    }

    if (!race.groups || !Array.isArray(race.groups)) {
      throw new Error('Неверная структура данных: отсутствует массив groups');
    }

    // Связываем группы и организации с участниками
    race.persons.forEach(person => {
      person.group = race.groups.find(g => g.id === person.group_id);
      if (person.organization_id) {
        person.organization = race.organizations.find(o => o.id === person.organization_id);
      }
    });

    return race;
  } catch (error) {
    console.error('Ошибка парсинга HTML файла:', error);
    return null;
  }
}


