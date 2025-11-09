"use client";

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  duration: number;
}

export default function WaveformVisualizer({ isRecording, duration }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = 40;
      const barWidth = canvas.width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const height = Math.random() * canvas.height * 0.8 + 10;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#1D4ED8');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, height);
      }
      
      if (isRecording) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [isRecording]);

  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Voice Input
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {duration}s
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full h-15 rounded"
      />
    </div>
  );
}