"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface ImageAnnotatorProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export default function ImageAnnotator({ imageUrl, annotations, onAnnotationsChange }: ImageAnnotatorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentAnnotation({ x, y, width: 0, height: 0 });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCurrentAnnotation(prev => ({
      ...prev,
      width: currentX - (prev?.x || 0),
      height: currentY - (prev?.y || 0)
    }));
  }, [isDrawing, currentAnnotation]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentAnnotation) return;
    
    setIsDrawing(false);
    setShowLabelInput(true);
  }, [isDrawing, currentAnnotation]);

  const saveAnnotation = () => {
    if (!currentAnnotation || !newLabel.trim()) return;
    
    const annotation: Annotation = {
      x: currentAnnotation.x || 0,
      y: currentAnnotation.y || 0,
      width: Math.abs(currentAnnotation.width || 0),
      height: Math.abs(currentAnnotation.height || 0),
      label: newLabel.trim()
    };
    
    onAnnotationsChange([...annotations, annotation]);
    setCurrentAnnotation(null);
    setNewLabel('');
    setShowLabelInput(false);
  };

  const removeAnnotation = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index);
    onAnnotationsChange(newAnnotations);
  };

  return (
    <div className="space-y-3">
      <div 
        ref={containerRef}
        className="relative inline-block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Image
          ref={imageRef}
          src={imageUrl}
          alt="Annotatable content"
          className="max-w-full max-h-64 object-contain"
          draggable={false}
        />
        
        {/* Existing annotations */}
        {annotations.map((annotation, index) => (
          <div
            key={index}
            className="absolute border-2 border-blue-500 bg-blue-500/20"
            style={{
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height
            }}
          >
            <Badge className="absolute -top-6 left-0 bg-blue-500 text-white text-xs">
              {annotation.label}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-5 h-5 p-0"
              onClick={() => removeAnnotation(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Current drawing annotation */}
        {currentAnnotation && (
          <div
            className="absolute border-2 border-red-500 bg-red-500/20"
            style={{
              left: currentAnnotation.x,
              top: currentAnnotation.y,
              width: Math.abs(currentAnnotation.width || 0),
              height: Math.abs(currentAnnotation.height || 0)
            }}
          />
        )}
      </div>
      
      {/* Label input */}
      {showLabelInput && (
        <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter annotation label..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && saveAnnotation()}
          />
          <Button onClick={saveAnnotation} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowLabelInput(false);
              setCurrentAnnotation(null);
              setNewLabel('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {/* Annotation summary */}
      {annotations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {annotations.map((annotation, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {annotation.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}