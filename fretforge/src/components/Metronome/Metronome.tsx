import type { TimeSignature } from '../../types';
import './Metronome.css';

interface MetronomeProps {
  bpm: number;
  isPlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: TimeSignature;
  error: string | null;
  onSetBpm: (bpm: number) => void;
  onSetTimeSig: (beats: TimeSignature) => void;
  onToggle: () => void;
  onTap: () => void;
}

const PRESETS = [60, 80, 100, 120, 140, 160];

export function Metronome({
  bpm,
  isPlaying,
  currentBeat,
  beatsPerMeasure,
  error,
  onSetBpm,
  onSetTimeSig,
  onToggle,
  onTap,
}: MetronomeProps) {
  return (
    <div className="card">
      <h2 className="card-title">
        <span className="card-icon">&#x1F3B5;</span> 节拍器
      </h2>

      <div className="metro-bpm">{bpm}</div>
      <div className="metro-bpm-label">BPM</div>

      <div className="metro-slider-row">
        <input
          type="range"
          className="metro-slider"
          min={30}
          max={260}
          value={bpm}
          onChange={(e) => onSetBpm(Number(e.target.value))}
        />
        <span className="metro-slider-val">{bpm}</span>
      </div>

      <div className="metro-presets">
        {PRESETS.map((p) => (
          <button key={p} className="metro-preset-btn" onClick={() => onSetBpm(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="metro-controls">
        <select
          className="metro-time-sig"
          value={beatsPerMeasure}
          onChange={(e) => onSetTimeSig(Number(e.target.value) as TimeSignature)}
        >
          <option value={2}>2/4</option>
          <option value={3}>3/4</option>
          <option value={4}>4/4</option>
          <option value={6}>6/8</option>
        </select>

        <button className="metro-tap-btn" onClick={onTap}>
          Tap
        </button>

        <button
          className={`metro-play-btn${isPlaying ? ' playing' : ''}`}
          onClick={onToggle}
        >
          {isPlaying ? '停止' : '启动'}
        </button>
      </div>

      <div className="metro-beats">
        {Array.from({ length: beatsPerMeasure }, (_, i) => (
          <div
            key={i}
            className={`metro-beat-dot${i === 0 ? ' accent' : ''}${i === currentBeat ? ' active' : ''}`}
          />
        ))}
      </div>

      {error && <div className="metro-error">{error}</div>}
    </div>
  );
}
