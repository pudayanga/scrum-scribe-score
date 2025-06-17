
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, RotateCcw, Upload, Save, Rewind, FastForward } from 'lucide-react';

interface VideoPlayerSectionProps {
  onTimeCapture: (time: number) => void;
}

export const VideoPlayerSection = ({ onTimeCapture }: VideoPlayerSectionProps) => {
  const [video1Src, setVideo1Src] = useState<string>('');
  const [video2Src, setVideo2Src] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((videoNumber: 1 | 2, file: File) => {
    const url = URL.createObjectURL(file);
    if (videoNumber === 1) {
      setVideo1Src(url);
    } else {
      setVideo2Src(url);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, videoNumber: 1 | 2) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      handleFileSelect(videoNumber, files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handlePlay = () => {
    // Play main video (video1) if available, otherwise play video2
    if (video1Src && video1Ref.current) {
      video1Ref.current.play();
      setIsPlaying(true);
    } else if (video2Src && video2Ref.current) {
      video2Ref.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (video1Ref.current) video1Ref.current.pause();
    if (video2Ref.current) video2Ref.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (video1Ref.current) {
      video1Ref.current.pause();
      video1Ref.current.currentTime = 0;
    }
    if (video2Ref.current) {
      video2Ref.current.pause();
      video2Ref.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleReset = () => {
    if (video1Ref.current) video1Ref.current.currentTime = 0;
    if (video2Ref.current) video2Ref.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleRewind = () => {
    const activeVideo = video1Src ? video1Ref.current : video2Ref.current;
    if (activeVideo) {
      activeVideo.currentTime = Math.max(0, activeVideo.currentTime - 10);
      setCurrentTime(activeVideo.currentTime);
    }
  };

  const handleFastForward = () => {
    const activeVideo = video1Src ? video1Ref.current : video2Ref.current;
    if (activeVideo) {
      activeVideo.currentTime = Math.min(activeVideo.duration, activeVideo.currentTime + 10);
      setCurrentTime(activeVideo.currentTime);
    }
  };

  const handleTimeUpdate = () => {
    const activeVideo = video1Src ? video1Ref.current : video2Ref.current;
    if (activeVideo) {
      setCurrentTime(activeVideo.currentTime);
    }
  };

  const handleSaveTime = () => {
    onTimeCapture(currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const hasAnyVideo = video1Src || video2Src;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Video Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Main Video Player */}
            <div className="space-y-2">
              <h3 className="font-semibold">Main Video (Primary)</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 min-h-[200px] flex flex-col justify-center"
                onDrop={(e) => handleDrop(e, 1)}
                onDragOver={handleDragOver}
              >
                {video1Src ? (
                  <video
                    ref={video1Ref}
                    src={video1Src}
                    className="w-full h-auto max-h-64 mx-auto"
                    onTimeUpdate={handleTimeUpdate}
                    controls={false}
                  />
                ) : (
                  <>
                    <p className="text-gray-500 mb-2">Drag and drop video here or</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInput1Ref.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
              <input
                ref={fileInput1Ref}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(1, file);
                }}
              />
            </div>

            {/* Secondary Video Player */}
            <div className="space-y-2">
              <h3 className="font-semibold">Secondary Video (Backup)</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 min-h-[200px] flex flex-col justify-center"
                onDrop={(e) => handleDrop(e, 2)}
                onDragOver={handleDragOver}
              >
                {video2Src ? (
                  <video
                    ref={video2Ref}
                    src={video2Src}
                    className="w-full h-auto max-h-64 mx-auto"
                    onTimeUpdate={handleTimeUpdate}
                    controls={false}
                  />
                ) : (
                  <>
                    <p className="text-gray-500 mb-2">Drag and drop video here or</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInput2Ref.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
              <input
                ref={fileInput2Ref}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(2, file);
                }}
              />
            </div>
          </div>

          {/* Main Controller */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Main Controller</h3>
              <div className="text-lg font-mono font-bold">
                {formatTime(currentTime)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlay}
                disabled={!hasAnyVideo || isPlaying}
                size="sm"
              >
                <Play className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handlePause}
                disabled={!hasAnyVideo || !isPlaying}
                size="sm"
              >
                <Pause className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleStop}
                disabled={!hasAnyVideo}
                size="sm"
              >
                <Square className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleRewind}
                disabled={!hasAnyVideo}
                size="sm"
                variant="outline"
              >
                <Rewind className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleFastForward}
                disabled={!hasAnyVideo}
                size="sm"
                variant="outline"
              >
                <FastForward className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleReset}
                disabled={!hasAnyVideo}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="flex-1" />

              <Button
                onClick={handleSaveTime}
                disabled={!hasAnyVideo}
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
