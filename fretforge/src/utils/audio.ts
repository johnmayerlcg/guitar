// ---------- Web Audio engine (preferred, precise timing) ----------

let audioCtx: AudioContext | null = null;

function hasWebAudio(): boolean {
  return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}

function createWebAudioCtx(): AudioContext {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AC();
}

function webAudioPlay(ctx: AudioContext, frequency: number, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = 'triangle';
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.start(time);
  osc.stop(time + 0.1);
}

// ---------- HTML5 Audio engine (fallback for browsers w/o Web Audio) ----------

function buildClickWavUri(frequency: number): string {
  const sampleRate = 44100;
  const duration = 0.08;
  const numSamples = Math.floor(sampleRate * duration);
  const buf = new ArrayBuffer(44 + numSamples * 2);
  const v = new DataView(buf);

  const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  ws(0, 'RIFF');
  v.setUint32(4, 36 + numSamples * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ws(36, 'data');
  v.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.max(0, 1 - t / duration);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    v.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

let htmlAccentAudio: HTMLAudioElement | null = null;
let htmlRegularAudio: HTMLAudioElement | null = null;

function htmlAudioPlay(accent: boolean): void {
  if (!htmlAccentAudio) htmlAccentAudio = new Audio(buildClickWavUri(1000));
  if (!htmlRegularAudio) htmlRegularAudio = new Audio(buildClickWavUri(800));

  const el = accent ? htmlAccentAudio : htmlRegularAudio;
  el.currentTime = 0;
  el.play().catch(() => { /* ignore */ });
}

// ---------- Unified public API ----------

export interface MetronomeAudio {
  /** Call once before playing any sounds; returns a Promise if async unlock is needed. */
  init(): Promise<void> | void;
  /** Current time in seconds (monotonic clock used for scheduling). */
  now(): number;
  /** Schedule a click at the given time. */
  play(accent: boolean, time: number): void;
  /** State of the underlying context (for resume logic). */
  isRunning(): boolean;
  /** Resume the underlying context if suspended. */
  resume(): Promise<void>;
}

export function createMetronomeAudio(): MetronomeAudio {
  if (hasWebAudio()) return createWebAudioEngine();
  return createHtml5Engine();
}

// ---- Web Audio engine ----

function createWebAudioEngine(): MetronomeAudio {
  return {
    init() {
      if (!audioCtx) audioCtx = createWebAudioCtx();
      if (audioCtx.state === 'suspended') {
        return audioCtx.resume().then(() => {});
      }
    },
    now(): number {
      return audioCtx!.currentTime;
    },
    play(accent: boolean, time: number): void {
      webAudioPlay(audioCtx!, accent ? 1000 : 800, time);
    },
    isRunning(): boolean {
      return audioCtx!.state === 'running';
    },
    resume(): Promise<void> {
      return audioCtx!.resume().then(() => {});
    },
  };
}

// ---- HTML5 Audio engine ----

function createHtml5Engine(): MetronomeAudio {
  let startTime = 0;
  return {
    init() {
      // Pre-build both audio elements; actual play will happen on first click
      if (!htmlAccentAudio) htmlAccentAudio = new Audio(buildClickWavUri(1000));
      if (!htmlRegularAudio) htmlRegularAudio = new Audio(buildClickWavUri(800));
      startTime = performance.now() / 1000;
    },
    now(): number {
      // Use performance.now() as the clock, offset to init time
      return performance.now() / 1000 - startTime;
    },
    play(accent: boolean, _time: number): void {
      // time parameter ignored — HTML5 Audio plays immediately
      htmlAudioPlay(accent);
    },
    isRunning(): boolean {
      return true; // HTML5 Audio is always "running" after init
    },
    resume(): Promise<void> {
      return Promise.resolve(); // No resume needed
    },
  };
}
