import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function CCTVViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streamKey, setStreamKey] = useState(0);
  
  const cameras = [
    { name: 'CCTV 1', stream: 'cctv_1' },
    { name: 'CCTV 2', stream: 'cctv_2' }
  ];

  const GO2RTC_URL = 'http://114.9.13.244:1984';

  // Force refresh stream when camera changes
  useEffect(() => {
    setStreamKey(prev => prev + 1);
  }, [currentIndex]);

  const nextCamera = () => {
    setCurrentIndex((prev) => (prev + 1) % cameras.length);
  };

  const prevCamera = () => {
    setCurrentIndex((prev) => (prev - 1 + cameras.length) % cameras.length);
  };

  const currentCamera = cameras[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Camera className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">CCTV Monitoring</h1>
          </div>
          <p className="text-slate-400">Live Camera Feed</p>
        </div>

        {/* Main Viewer */}
        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Camera Info Bar */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{currentCamera.name}</h2>
              <p className="text-sm text-slate-400">Stream: {currentCamera.stream}</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300 font-medium">LIVE</span>
            </div>
          </div>

          {/* Video Display */}
          <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
            <img
              key={`${currentCamera.stream}-${streamKey}`}
              src={`${GO2RTC_URL}/api/stream.mjpeg?src=${currentCamera.stream}`}
              alt={currentCamera.name}
              className="absolute top-0 left-0 w-full h-full object-contain"
              onError={() => {
                console.error('Stream error for', currentCamera.stream);
              }}
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevCamera}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={nextCamera}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Camera Selection Dots */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-center gap-3">
            {cameras.map((cam, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all ${
                  idx === currentIndex
                    ? 'w-12 h-3 bg-blue-500'
                    : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
                } rounded-full`}
              />
            ))}
          </div>
        </div>

        {/* Camera Grid Thumbnails */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {cameras.map((cam, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative bg-slate-800 rounded-lg overflow-hidden transition-all ${
                idx === currentIndex
                  ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50'
                  : 'hover:ring-2 hover:ring-slate-600'
              }`}
            >
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <img
                  src={`${GO2RTC_URL}/api/frame.jpeg?src=${cam.stream}`}
                  alt={cam.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-3 w-full">
                    <p className="text-white font-semibold">{cam.name}</p>
                    <p className="text-xs text-slate-300">{cam.stream}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}