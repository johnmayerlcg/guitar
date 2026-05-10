import { useState, useRef, useCallback, useEffect } from 'react';
import { createMetronomeAudio, type MetronomeAudio } from '../utils/audio';
import type { TimeSignature } from '../types';

export interface UseMetronomeReturn {
  bpm: number;
  isPlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: TimeSignature;
  error: string | null;
  setBpm: (bpm: number) => void;
  setTimeSig: (beats: TimeSignature) => void;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useMetronome(): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<TimeSignature>(4);
  const [error, setError] = useState<string | null>(null);

  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beatsPerMeasure);
  const beatRef = useRef(0);
  const nextTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engineRef = useRef<MetronomeAudio | null>(null);

  bpmRef.current = bpm;
  beatsRef.current = beatsPerMeasure;

  const scheduler = () => {
    const engine = engineRef.current;
    if (!engine) return;

    const interval = 60 / bpmRef.current;

    while (nextTimeRef.current <= engine.now() + 0.1) {
      const accent = beatRef.current === 0;
      engine.play(accent, nextTimeRef.current);
      setCurrentBeat(beatRef.current);
      beatRef.current = (beatRef.current + 1) % beatsRef.current;
      nextTimeRef.current += interval;
    }

    timerRef.current = setTimeout(
      scheduler,
      Math.max(0, (nextTimeRef.current - engine.now()) * 1000 - 20),
    );
  };

  const schedulerRef = useRef(scheduler);
  schedulerRef.current = scheduler;

  const start = useCallback(() => {
    setError(null);
    setIsPlaying(true);
    setCurrentBeat(0);

    try {
      const engine = createMetronomeAudio();
      engineRef.current = engine;

      const initResult = engine.init();

      const run = () => {
        beatRef.current = 0;
        nextTimeRef.current = engine.now();
        schedulerRef.current();
      };

      const afterInit = () => {
        if (engine.isRunning()) {
          run();
        } else {
          const fallback = setTimeout(run, 600);
          engine.resume().then(() => {
            clearTimeout(fallback);
            run();
          }).catch(() => {
            clearTimeout(fallback);
            run();
          });
        }
      };

      if (initResult && 'then' in initResult) {
        initResult.then(afterInit);
      } else {
        afterInit();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop(); else start();
  }, [isPlaying, start, stop]);

  const setBpm = useCallback((val: number) => {
    setBpmState(Math.max(30, Math.min(260, Math.round(val))));
  }, []);

  const setTimeSig = useCallback((beats: TimeSignature) => {
    setBeatsPerMeasure(beats);
    beatRef.current = 0;
    if (isPlaying && engineRef.current) {
      nextTimeRef.current = engineRef.current.now();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { bpm, isPlaying, currentBeat, beatsPerMeasure, error, setBpm, setTimeSig, start, stop, toggle };
}
