// Dopamine reward sound engine — generates addictive, satisfying audio feedback
// using Web Audio API synthesis (no external files needed)

type SoundType = 'taskComplete' | 'focusStart' | 'focusEnd' | 'levelUp' | 'streakMilestone' | 'uiClick';

const getVolume = (vol: number) => Math.max(0, Math.min(1, vol / 100));

const createCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSound = (type: SoundType, volume = 70) => {
  try {
    const v = getVolume(volume);
    switch (type) {
      case 'taskComplete': return playTaskComplete(v);
      case 'focusStart': return playFocusStart(v);
      case 'focusEnd': return playFocusEnd(v);
      case 'levelUp': return playLevelUp(v);
      case 'streakMilestone': return playStreakMilestone(v);
      case 'uiClick': return playUIClick(v);
    }
  } catch {
    // silently fail if AudioContext unavailable
  }
};

// ✅ Task complete — satisfying "ding-pop" with harmonic overtone
const playTaskComplete = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;

  // Primary tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now);
  osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
  gain1.gain.setValueAtTime(v * 0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // Harmonic sparkle
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1760, now + 0.05);
  gain2.gain.setValueAtTime(v * 0.08, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.25);

  // Sub-bass thud for satisfaction
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.value = 110;
  gain3.gain.setValueAtTime(v * 0.12, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc3.connect(gain3).connect(ctx.destination);
  osc3.start(now);
  osc3.stop(now + 0.15);

  setTimeout(() => ctx.close(), 500);
};

// 🎯 Focus start — deep, calming tone that rises (anticipation)
const playFocusStart = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(v * 0.1, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);

  // Breath pad
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.value = 330;
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(v * 0.06, now + 0.3);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.9);

  setTimeout(() => ctx.close(), 1200);
};

// 🏁 Focus end — triumphant ascending arpeggio
const playFocusEnd = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(v * 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });

  setTimeout(() => ctx.close(), 1500);
};

// ⬆️ Level up — epic rising chord with shimmer
const playLevelUp = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;

  // Power chord
  [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 2 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.8);
    gain.gain.setValueAtTime(v * 0.06, now);
    gain.gain.linearRampToValueAtTime(v * 0.1, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + 1.0);
  });

  // Shimmer noise
  const bufferSize = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8000;
  noiseGain.gain.setValueAtTime(0.001, now + 0.3);
  noiseGain.gain.linearRampToValueAtTime(v * 0.03, now + 0.5);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(now + 0.3);
  noise.stop(now + 1.0);

  setTimeout(() => ctx.close(), 1500);
};

// 🔥 Streak milestone — warm pulsing glow sound
const playStreakMilestone = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;

  // Warm pad
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(v * 0.08, now + 0.15);
  gain.gain.setValueAtTime(v * 0.08, now + 0.15);
  gain.gain.linearRampToValueAtTime(v * 0.12, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.7);

  // Double tap
  [0, 0.15].forEach((offset) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 1200;
    g.gain.setValueAtTime(v * 0.06, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
    o.connect(g).connect(ctx.destination);
    o.start(now + offset);
    o.stop(now + offset + 0.1);
  });

  setTimeout(() => ctx.close(), 1000);
};

// 👆 UI click — subtle, crisp tap
const playUIClick = (v: number) => {
  const ctx = createCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
  gain.gain.setValueAtTime(v * 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
  setTimeout(() => ctx.close(), 200);
};

// Preview all sounds
export const previewAllSounds = (volume = 70) => {
  const types: SoundType[] = ['uiClick', 'taskComplete', 'focusStart', 'focusEnd', 'streakMilestone', 'levelUp'];
  types.forEach((type, i) => {
    setTimeout(() => playSound(type, volume), i * 800);
  });
};
