import { useEffect, useRef } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { calculateIntervals, getCurrentRow } from '../../utils/time';

interface TableRow {
  startTime: number;
  persons: any[];
}

interface TimerProps {
  rows: TableRow[];
}

export default function Timer({ rows }: TimerProps) {
  const { currentProject, updateTimerState } = useProject();
  
  // Используем ref для хранения последнего startTime, чтобы отслеживать изменения
  const startTimeRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);

  // Вычисляем интервалы один раз при изменении rows
  useEffect(() => {
    intervalsRef.current = calculateIntervals(rows.map(r => ({ startTime: r.startTime })));
  }, [rows]);

  useEffect(() => {
    if (!currentProject?.timerState.started || !currentProject.timerState.startTime) {
      startTimeRef.current = null;
      return;
    }

    const currentStartTime = currentProject.timerState.startTime;

    // Если startTime изменился, обновляем ref и принудительно перезапускаем интервал
    if (startTimeRef.current !== currentStartTime) {
      startTimeRef.current = currentStartTime;
      // НЕ обновляем состояние здесь, так как оно уже было обновлено в ContextMenu
      // Просто обновляем ref, чтобы использовать новое значение в расчетах
    }

    const interval = setInterval(() => {
      // Используем функцию для получения актуального значения из контекста
      updateTimerState(prevState => {
        if (!prevState?.startTime) return prevState;

        // Используем startTime из ref, если он отличается от prevState
        // Это нужно для того, чтобы не использовать устаревшее значение после сброса
        const effectiveStartTime = startTimeRef.current && startTimeRef.current !== prevState.startTime 
          ? startTimeRef.current 
          : prevState.startTime;

        const now = Date.now();
        const elapsed = now - effectiveStartTime;

        // Используем интервалы из ref
        const calculatedRow = getCurrentRow(elapsed, intervalsRef.current);

        // Обновляем состояние если строка изменилась ИЛИ если startTime изменился
        if (prevState.currentRow !== calculatedRow || effectiveStartTime !== prevState.startTime) {
          return {
            ...prevState,
            startTime: effectiveStartTime,
            currentRow: calculatedRow
          };
        }

        return prevState;
      });
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(interval);
  }, [currentProject?.timerState.started, currentProject?.timerState.startTime, currentProject?.timerState.currentRow, updateTimerState]);

  // Компонент Timer больше не отображает кнопку старта - она в StartGridTable
  return null;
}

