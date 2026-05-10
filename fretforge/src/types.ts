export type TimeSignature = 2 | 3 | 4 | 6;

export interface NoteQuizConfig {
  useSharps: boolean;
  useFlats: boolean;
  useNatural: boolean;
  autoAdvance: boolean;
  autoInterval: number;
}
