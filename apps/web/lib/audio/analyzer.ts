export interface AudioAnalysis {
  bpm: number;
  beats: number[]; // Timestamps des beats en ms
  onsets: number[]; // Timestamps des onsets en ms
  energy: number[]; // Courbe d'énergie
  duration: number; // Durée totale en ms
}

/**
 * Analyse un AudioBuffer et détecte les beats/onsets
 */
export async function analyzeAudioBuffer(
  audioBuffer: AudioBuffer
): Promise<AudioAnalysis> {
  // Convertir en mono
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration * 1000; // en ms

  // Paramètres d'analyse
  const hopSize = 512; // Taille du saut entre fenêtres
  const frameSize = 2048; // Taille de la fenêtre d'analyse

  // Calculer l'énergie par frame
  const energyValues: number[] = [];
  for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
    const frame = channelData.slice(i, i + frameSize);
    const energy = calculateEnergy(frame);
    energyValues.push(energy);
  }

  // Détecter les onsets (pics d'énergie)
  const onsets = detectOnsets(energyValues, hopSize, sampleRate);

  // Estimer le BPM à partir des onsets
  const bpm = estimateBPM(onsets);

  // Générer des beats réguliers basés sur le BPM
  const beats = generateBeats(bpm, duration);

  return {
    bpm,
    beats,
    onsets,
    energy: energyValues,
    duration,
  };
}

/**
 * Calcule l'énergie d'une frame audio
 */
function calculateEnergy(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += frame[i] * frame[i];
  }
  return sum / frame.length;
}

/**
 * Détecte les onsets (pics d'énergie)
 */
function detectOnsets(
  energyValues: number[],
  hopSize: number,
  sampleRate: number
): number[] {
  const onsets: number[] = [];

  // Calculer le seuil dynamique
  const meanEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
  const threshold = meanEnergy * 1.5; // 1.5x la moyenne

  // Détecter les pics
  for (let i = 1; i < energyValues.length - 1; i++) {
    const current = energyValues[i];
    const prev = energyValues[i - 1];
    const next = energyValues[i + 1];

    // Pic local au-dessus du seuil
    if (current > threshold && current > prev && current > next) {
      const timeMs = (i * hopSize / sampleRate) * 1000;

      // Éviter les onsets trop rapprochés (minimum 100ms)
      if (onsets.length === 0 || timeMs - onsets[onsets.length - 1] > 100) {
        onsets.push(timeMs);
      }
    }
  }

  return onsets;
}

/**
 * Estime le BPM à partir des onsets détectés
 */
function estimateBPM(onsets: number[]): number {
  if (onsets.length < 2) return 120; // BPM par défaut

  // Calculer les intervalles entre onsets
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i - 1]);
  }

  // Trouver l'intervalle médian (plus robuste que la moyenne)
  intervals.sort((a, b) => a - b);
  const medianInterval = intervals[Math.floor(intervals.length / 2)];

  // Convertir en BPM (60000ms / intervalle en ms)
  let bpm = 60000 / medianInterval;

  // Normaliser dans une plage raisonnable (60-180 BPM)
  while (bpm < 60) bpm *= 2;
  while (bpm > 180) bpm /= 2;

  return Math.round(bpm);
}

/**
 * Génère des beats réguliers basés sur le BPM
 */
function generateBeats(bpm: number, durationMs: number): number[] {
  const beatInterval = 60000 / bpm; // ms par beat
  const beats: number[] = [];

  for (let time = 0; time < durationMs; time += beatInterval) {
    beats.push(time);
  }

  return beats;
}

/**
 * Trouve le meilleur segment de durée donnée dans l'audio
 */
export function findBestSegment(
  analysis: AudioAnalysis,
  segmentDuration: number = 60000,
  preferredStart?: number
): { startTime: number; endTime: number; score: number } {
  if (preferredStart !== undefined) {
    return {
      startTime: preferredStart,
      endTime: Math.min(preferredStart + segmentDuration, analysis.duration),
      score: 1,
    };
  }

  // Trouver le segment avec le plus d'énergie moyenne
  const windowSize = Math.floor((segmentDuration / analysis.duration) * analysis.energy.length);

  let bestStart = 0;
  let bestScore = 0;

  for (let i = 0; i <= analysis.energy.length - windowSize; i++) {
    const segment = analysis.energy.slice(i, i + windowSize);
    const avgEnergy = segment.reduce((a, b) => a + b, 0) / segment.length;

    // Compter les onsets dans ce segment
    const startTimeMs = (i / analysis.energy.length) * analysis.duration;
    const endTimeMs = startTimeMs + segmentDuration;
    const onsetCount = analysis.onsets.filter(
      o => o >= startTimeMs && o <= endTimeMs
    ).length;

    // Score = énergie moyenne + densité d'onsets
    const score = avgEnergy * 0.5 + (onsetCount / 100) * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestStart = startTimeMs;
    }
  }

  return {
    startTime: Math.floor(bestStart),
    endTime: Math.floor(Math.min(bestStart + segmentDuration, analysis.duration)),
    score: bestScore,
  };
}
