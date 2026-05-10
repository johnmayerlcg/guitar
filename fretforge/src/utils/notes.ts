import type { NoteQuizConfig } from '../types';

export const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function buildNotePool(config: NoteQuizConfig): string[] {
  const pool = new Set<string>();
  if (config.useSharps) SHARP_NOTES.forEach(n => pool.add(n));
  if (config.useFlats) FLAT_NOTES.forEach(n => pool.add(n));
  if (config.useNatural) NATURAL_NOTES.forEach(n => pool.add(n));
  return [...pool];
}

export function pickRandomNote(pool: string[], exclude?: string): string {
  if (pool.length === 0) return '--';
  if (pool.length === 1) return pool[0];
  let note: string;
  do {
    note = pool[Math.floor(Math.random() * pool.length)];
  } while (note === exclude);
  return note;
}
