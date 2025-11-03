/**
 * Преобразование миллисекунд в формат HH:MM:SS
 */
export function toHHMMSS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Преобразование миллисекунд в минуты (округление)
 */
export function msToMinutes(ms: number): number {
  return Math.floor(ms / 60000);
}

/**
 * Вычисление интервалов между строками на основе времени старта участников
 * @param rows Массив объектов с временем старта (в миллисекундах)
 * @returns Массив интервалов между строками (в миллисекундах)
 */
export function calculateIntervals(rows: { startTime: number }[]): number[] {
  const intervals: number[] = [];
  
  for (let i = 0; i < rows.length - 1; i++) {
    const interval = rows[i + 1].startTime - rows[i].startTime;
    intervals.push(interval);
  }
  
  // Для последней строки используем последний известный интервал
  if (intervals.length > 0) {
    intervals.push(intervals[intervals.length - 1]);
  }
  
  return intervals;
}

/**
 * Определение текущей строки на основе прошедшего времени и интервалов
 * @param elapsedTime Прошедшее время в миллисекундах
 * @param intervals Массив интервалов между строками
 * @returns Индекс текущей строки
 */
export function getCurrentRow(elapsedTime: number, intervals: number[]): number {
  let sum = 0;
  let currentRow = 0;
  
  for (let i = 0; i < intervals.length; i++) {
    if (elapsedTime >= sum + intervals[i]) {
      sum += intervals[i];
      currentRow = i + 1;
    } else {
      break;
    }
  }
  
  return currentRow;
}

/**
 * Форматирование даты для имени проекта
 */
export function formatDateForProjectName(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

