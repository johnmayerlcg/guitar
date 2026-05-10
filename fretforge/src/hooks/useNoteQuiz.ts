import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { NoteQuizConfig } from '../types';
import { buildNotePool, pickRandomNote } from '../utils/notes';

const DEFAULT_CONFIG: NoteQuizConfig = {
  useSharps: true,
  useFlats: false,
  useNatural: true,
  autoAdvance: false,
  autoInterval: 3,
};

export interface UseNoteQuizReturn {
  currentNote: string;
  count: number;
  countdown: number | null;
  config: NoteQuizConfig;
  nextNote: () => void;
  updateConfig: (partial: Partial<NoteQuizConfig>) => void;
}

export function useNoteQuiz(): UseNoteQuizReturn {
  const [config, setConfig] = useState<NoteQuizConfig>(DEFAULT_CONFIG);
  const [currentNote, setCurrentNote] = useState('--');
  const [count, setCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poolRef = useRef<string[]>([]);
  const currentNoteRef = useRef(currentNote);
  const intervalRef = useRef(config.autoInterval);

  const pool = useMemo(() => buildNotePool(config), [config]);
  poolRef.current = pool;
  currentNoteRef.current = currentNote;
  intervalRef.current = config.autoInterval;

  const nextNote = useCallback(() => {
    const note = pickRandomNote(poolRef.current, currentNoteRef.current);
    setCurrentNote(note);
    setCount((c) => c + 1);
  }, []);

  const updateConfig = useCallback((partial: Partial<NoteQuizConfig>) => {
    setConfig((c) => ({ ...c, ...partial }));
  }, []);

  useEffect(() => {
    if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null; }
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current = null; }

    if (config.autoAdvance && pool.length > 0) {
      setCountdown(config.autoInterval);

      cdTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) return intervalRef.current;
          return prev - 1;
        });
      }, 1000);

      autoTimerRef.current = setInterval(() => {
        setCurrentNote((prev) => pickRandomNote(poolRef.current, prev));
        setCount((c) => c + 1);
        setCountdown(intervalRef.current);
      }, config.autoInterval * 1000);
    } else {
      setCountdown(null);
    }

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    };
  }, [config.autoAdvance, config.autoInterval, pool]);

  return { currentNote, count, countdown, config, nextNote, updateConfig };
}
