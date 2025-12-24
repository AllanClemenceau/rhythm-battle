'use client';

import { useState, useCallback } from 'react';
import { useAudioContext } from '@/hooks/useAudioContext';
import { analyzeAudioBuffer, findBestSegment } from '@/lib/audio/analyzer';
import { generateBeatmap } from '@/lib/audio/beatmap';
import type { Beatmap } from '@project/shared/types';
import type { AudioAnalysis } from '@/lib/audio/analyzer';

interface AudioFileLoaderProps {
  onBeatmapGenerated: (beatmap: Beatmap, analysis: AudioAnalysis, audioBuffer: AudioBuffer) => void;
}

export default function AudioFileLoader({ onBeatmapGenerated }: AudioFileLoaderProps) {
  const { loadAudio, isLoading: audioLoading } = useAudioContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProgress('Loading audio file...');
      const audioData = await loadAudio(file);
      if (!audioData) {
        setProgress('Failed to load audio');
        return;
      }

      setProgress('Analyzing audio (this may take a few seconds)...');
      setIsAnalyzing(true);

      // Analyser l'audio dans un setTimeout pour ne pas bloquer l'UI
      setTimeout(async () => {
        try {
          const analysis = await analyzeAudioBuffer(audioData.audioBuffer);

          setProgress('Finding best 60s segment...');
          const segment = findBestSegment(analysis, 60000);

          setProgress('Generating beatmap...');
          const beatmap = generateBeatmap(analysis, {
            difficulty,
            useOnsets: true,
            startTime: segment.startTime,
            duration: 60000,
          });

          setProgress(`Done! Found ${beatmap.notes.length} notes at ${Math.round(analysis.bpm)} BPM`);
          setIsAnalyzing(false);

          onBeatmapGenerated(beatmap, analysis, audioData.audioBuffer);
        } catch (error) {
          console.error('Analysis error:', error);
          setProgress('Failed to analyze audio');
          setIsAnalyzing(false);
        }
      }, 100);
    } catch (error) {
      console.error('Load error:', error);
      setProgress('Failed to load audio file');
    }
  }, [loadAudio, difficulty, onBeatmapGenerated]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">Load Your Own Music</h3>

      <div className="space-y-4">
        {/* Difficulty selector */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  difficulty === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* File input */}
        <div>
          <label
            htmlFor="audio-file"
            className="block w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg cursor-pointer text-center transition-colors"
          >
            {audioLoading || isAnalyzing ? 'Processing...' : 'Choose Audio File'}
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={audioLoading || isAnalyzing}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supports MP3, WAV, OGG, and other audio formats
          </p>
        </div>

        {/* Progress */}
        {progress && (
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-300">{progress}</p>
            {isAnalyzing && (
              <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 animate-pulse" style={{ width: '100%' }} />
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>How it works:</strong> The game will analyze your audio file, detect the beats,
            and automatically generate a playable beatmap. It will select the best 60-second segment!
          </p>
        </div>
      </div>
    </div>
  );
}
