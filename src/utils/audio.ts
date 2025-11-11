let audioCtx: AudioContext | null = null;

/**
 * Plays a short countdown tick sound for the provided duration.
 * Uses the Web Audio API to avoid relying on static audio assets.
 */
export async function playCountdownSound(durationSec: number = 10): Promise<void> {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return;
  }

  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const baseTime = audioCtx.currentTime;

    for (let i = 0; i < durationSec; i += 1) {
      const startTime = baseTime + i;
      const frequency = i === durationSec - 1 ? 880 : 660;

      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.25, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

      oscillator.connect(gainNode).connect(audioCtx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  } catch (error) {
    console.warn('Unable to play countdown sound', error);
  }
}


