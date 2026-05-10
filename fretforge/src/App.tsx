import { useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Metronome } from './components/Metronome/Metronome';
import { NoteQuiz } from './components/NoteQuiz/NoteQuiz';
import { useMetronome } from './hooks/useMetronome';
import { useTapTempo } from './hooks/useTapTempo';
import { useNoteQuiz } from './hooks/useNoteQuiz';
import './App.css';

export function App() {
  const metro = useMetronome();
  const { tap } = useTapTempo(metro.setBpm);
  const quiz = useNoteQuiz();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        metro.toggle();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
        e.preventDefault();
        quiz.nextNote();
      }
    },
    [metro.toggle, quiz.nextNote],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app">
      <Header />
      <Metronome
        bpm={metro.bpm}
        isPlaying={metro.isPlaying}
        currentBeat={metro.currentBeat}
        beatsPerMeasure={metro.beatsPerMeasure}
        error={metro.error}
        onSetBpm={metro.setBpm}
        onSetTimeSig={metro.setTimeSig}
        onToggle={metro.toggle}
        onTap={tap}
      />
      <NoteQuiz
        currentNote={quiz.currentNote}
        count={quiz.count}
        countdown={quiz.countdown}
        config={quiz.config}
        onNextNote={quiz.nextNote}
        onUpdateConfig={quiz.updateConfig}
      />
      <Footer />
    </div>
  );
}
