/**
 * A small generative lo-fi loop built with WebAudio: soft keys, a round bass,
 * a lazy beat and a sparse melody. No audio file is downloaded. It starts only
 * from a user's click, and rests while the tab is hidden.
 */

type Listener = () => void;

const BPM = 74;
const EIGHTH = 60 / BPM / 2;
const LOOKAHEAD = 0.25;
// Am9 · Fmaj7 · Dm9 · Esus4→E7, voiced around middle C (MIDI numbers).
const CHORDS = [
  [57, 60, 64, 67, 71],
  [53, 57, 60, 64, 67],
  [50, 57, 60, 64, 65],
  [52, 56, 59, 62, 64],
];
const SCALE = [69, 72, 74, 76, 79, 81];
const KICK = [1, 0, 0, 0, 0, 1, 0, 0];
const SNARE = [0, 0, 1, 0, 0, 0, 1, 0];

const listeners = new Set<Listener>();
let playing = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let noise: AudioBuffer | null = null;
let timer = 0;
let step = 0;
let nextTime = 0;
let seed = 7;

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const emit = () => listeners.forEach((listener) => listener());

function build() {
  const audio = new AudioContext();
  const out = audio.createGain();
  out.gain.value = 0;
  const warm = audio.createBiquadFilter();
  warm.type = 'lowpass';
  warm.frequency.value = 2600;
  const glue = audio.createDynamicsCompressor();
  glue.threshold.value = -18;
  glue.ratio.value = 3;
  const meter = audio.createAnalyser();
  meter.fftSize = 64;
  meter.smoothingTimeConstant = 0.82;
  out.connect(warm).connect(glue).connect(meter).connect(audio.destination);

  const length = audio.sampleRate;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

  ctx = audio;
  master = out;
  analyser = meter;
  noise = buffer;
}

function voice(freq: number, at: number, length: number, level: number, type: OscillatorType) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const shimmer = ctx.createOscillator();
  const tone = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  shimmer.type = 'sine';
  shimmer.frequency.value = freq * 1.003;
  tone.type = 'lowpass';
  tone.frequency.value = 1500;
  amp.gain.setValueAtTime(0, at);
  amp.gain.linearRampToValueAtTime(level, at + 0.02);
  amp.gain.exponentialRampToValueAtTime(level * 0.35, at + length * 0.5);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(tone);
  shimmer.connect(tone);
  tone.connect(amp).connect(master);
  osc.start(at);
  shimmer.start(at);
  osc.stop(at + length + 0.05);
  shimmer.stop(at + length + 0.05);
}

function kick(at: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.frequency.setValueAtTime(120, at);
  osc.frequency.exponentialRampToValueAtTime(45, at + 0.14);
  amp.gain.setValueAtTime(0.75, at);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
  osc.connect(amp).connect(master);
  osc.start(at);
  osc.stop(at + 0.35);
}

function hiss(at: number, length: number, level: number, type: BiquadFilterType, freq: number) {
  if (!ctx || !master || !noise) return;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = type;
  band.frequency.value = freq;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(level, at);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + length);
  source.connect(band).connect(amp).connect(master);
  source.start(at, random() * 0.5);
  source.stop(at + length + 0.02);
}

function schedule() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    const beat = step % 8;
    const bar = Math.floor(step / 8) % CHORDS.length;
    const chord = CHORDS[bar] ?? CHORDS[0] ?? [];
    // A gentle swing on the off-beats.
    const at = nextTime + (beat % 2 ? EIGHTH * 0.16 : 0);
    if (beat === 0) {
      chord.forEach((note, index) =>
        voice(hz(note), at + index * 0.012, EIGHTH * 7.6, 0.05, 'triangle'),
      );
    }
    if (beat === 0 || beat === 5) voice(hz((chord[0] ?? 57) - 24), at, EIGHTH * 2.6, 0.22, 'sine');
    if (KICK[beat]) kick(at);
    if (SNARE[beat]) hiss(at, 0.18, 0.16, 'bandpass', 1800);
    hiss(at, 0.05, beat % 2 ? 0.035 : 0.05, 'highpass', 7000);
    if (beat !== 0 && random() < 0.3) {
      const note = SCALE[Math.floor(random() * SCALE.length)] ?? 72;
      voice(hz(note), at, EIGHTH * 2.2, 0.035, 'sine');
    }
    step += 1;
    nextTime += EIGHTH;
  }
}

function run() {
  window.clearInterval(timer);
  timer = 0;
  if (!ctx) return;
  if (playing && !document.hidden) {
    void ctx.resume();
    nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
    timer = window.setInterval(schedule, 80);
    schedule();
  } else {
    // Let the fade finish before the context sleeps.
    window.setTimeout(() => {
      if (ctx && (!playing || document.hidden)) void ctx.suspend();
    }, 700);
  }
}

/**
 * iPhones keep Web Audio silent under the ring/silent switch unless the page
 * plays media: ask for a playback session, and play a moment of silence through
 * an <audio> element in the same tap (older Safari).
 */
function unlockPlayback() {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = 'playback';
  const rate = 8000;
  const samples = rate / 10;
  const wav = new DataView(new ArrayBuffer(44 + samples));
  const text = (at: number, value: string) =>
    [...value].forEach((char, i) => wav.setUint8(at + i, char.charCodeAt(0)));
  text(0, 'RIFF');
  wav.setUint32(4, 36 + samples, true);
  text(8, 'WAVEfmt ');
  wav.setUint32(16, 16, true);
  wav.setUint16(20, 1, true);
  wav.setUint16(22, 1, true);
  wav.setUint32(24, rate, true);
  wav.setUint32(28, rate, true);
  wav.setUint16(32, 1, true);
  wav.setUint16(34, 8, true);
  text(36, 'data');
  wav.setUint32(40, samples, true);
  for (let i = 0; i < samples; i += 1) wav.setUint8(44 + i, 128);
  const url = URL.createObjectURL(new Blob([wav.buffer], { type: 'audio/wav' }));
  const silence = new Audio(url);
  silence.setAttribute('playsinline', '');
  void silence
    .play()
    .catch(() => {})
    .finally(() => URL.revokeObjectURL(url));
}

export function toggleMusic() {
  if (!ctx) {
    unlockPlayback();
    build();
    document.addEventListener('visibilitychange', run);
  }
  if (!ctx || !master) return;
  playing = !playing;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(playing ? 0.55 : 0, now + (playing ? 1.4 : 0.6));
  run();
  emit();
}

export function subscribeMusic(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getMusicPlaying = () => playing;
export const getServerMusicPlaying = () => false;

/** Fills `out` with the current spectrum; returns false while silent. */
export function readMusicLevels(out: Uint8Array<ArrayBuffer>) {
  if (!analyser || !playing) return false;
  analyser.getByteFrequencyData(out);
  return true;
}
