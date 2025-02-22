"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface AudioPreview {
  audio_base_64: string;
  generated_voice_id: string;
  media_type: string;
  duration_secs: number;
}

interface AudioPlayerProps {
  previews: AudioPreview[];
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ previews, text }) => {
  const [selectedPreview, setSelectedPreview] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Convert base64 to audio URL
  const getAudioUrl = (base64Audio: string) => {
    return `data:audio/mpeg;base64,${base64Audio}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-foreground">{text}</p>
      </div>

      <div className="space-y-4">
        {previews.map((preview, index) => (
          <div 
            key={preview.generated_voice_id}
            className={`border rounded-lg p-4 ${selectedPreview === index ? 'border-primary' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Voice {index + 1} ({preview.duration_secs.toFixed(2)}s)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ 
                  width: `${(currentTime / preview.duration_secs) * 100}%` 
                }}
              />
            </div>

            <audio
              ref={audioRef}
              src={getAudioUrl(preview.audio_base_64)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioPlayer; 