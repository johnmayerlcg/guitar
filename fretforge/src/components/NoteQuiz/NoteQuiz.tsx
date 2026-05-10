import type { NoteQuizConfig } from '../../types';
import './NoteQuiz.css';

interface NoteQuizProps {
  currentNote: string;
  count: number;
  countdown: number | null;
  config: NoteQuizConfig;
  onNextNote: () => void;
  onUpdateConfig: (partial: Partial<NoteQuizConfig>) => void;
}

export function NoteQuiz({
  currentNote,
  count,
  countdown,
  config,
  onNextNote,
  onUpdateConfig,
}: NoteQuizProps) {
  return (
    <div className="card">
      <h2 className="card-title">
        <span className="card-icon">&#x1F3B8;</span> 音名训练
      </h2>

      <div className="quiz-note" key={currentNote + count}>
        {currentNote}
      </div>

      <div className="quiz-config">
        <label className="quiz-check">
          <input
            type="checkbox"
            checked={config.useSharps}
            onChange={(e) => onUpdateConfig({ useSharps: e.target.checked })}
          />
          升号 (#)
        </label>
        <label className="quiz-check">
          <input
            type="checkbox"
            checked={config.useFlats}
            onChange={(e) => onUpdateConfig({ useFlats: e.target.checked })}
          />
          降号 (&#x266D;)
        </label>
        <label className="quiz-check">
          <input
            type="checkbox"
            checked={config.useNatural}
            onChange={(e) => onUpdateConfig({ useNatural: e.target.checked })}
          />
          自然音
        </label>
      </div>

      <div className="quiz-auto-row">
        <label className="quiz-auto-label">自动切换间隔:</label>
        <input
          type="number"
          className="quiz-auto-input"
          value={config.autoInterval}
          min={1}
          max={30}
          onChange={(e) => onUpdateConfig({ autoInterval: Number(e.target.value) || 3 })}
        />
        <span className="quiz-auto-unit">秒</span>
        <label className="quiz-check" style={{ marginLeft: 12 }}>
          <input
            type="checkbox"
            checked={config.autoAdvance}
            onChange={(e) => onUpdateConfig({ autoAdvance: e.target.checked })}
          />
          自动
        </label>
      </div>

      <button className="quiz-next-btn" onClick={onNextNote}>
        下一个音名
      </button>

      <div className="quiz-status">
        <span>已练习: {count} 次</span>
        {countdown !== null && <span>下次: {countdown}s</span>}
      </div>
    </div>
  );
}
