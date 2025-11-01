import React, { useState, useEffect, useRef } from 'react';
import { Video, RefreshCw, Maximize2, AlertCircle, Minimize2 } from 'lucide-react';

export default function CCTVViewer() {
  const [streams] = useState([
    { id: 'cctv_1', name: 'CCTV 1', location: '192.168.140.19' },
    { id: 'cctv_2', name: 'CCTV 2', location: '192.168.130.9' }
  ]);
  const [fullscreen, setFullscreen] = useState(null);
  const [streamStates, setStreamStates] = useState({});
  const iframeRefs = useRef({});

  const GO2RTC_URL = 'http://114.9.13.244:1984';

  const reloadStream = (streamId) => {
    setStreamStates(prev => ({ ...prev, [streamId]: 'loading' }));
    if (iframeRefs.current[streamId]) {
      const currentSrc = iframeRefs.current[streamId].src;
      iframeRefs.current[streamId].src = '';
      setTimeout(() => {
        iframeRefs.current[streamId].src = currentSrc;
      }, 100);
    }
  };

  const handleFullscreen = (streamId) => {
    setFullscreen(fullscreen === streamId ? null : streamId);
  };

  const handleIframeLoad = (streamId) => {
    setTimeout(() => {
      setStreamStates(prev => ({ ...prev, [streamId]: 'loaded' }));
    }, 1000);
  };

  useEffect(() => {
    // Initialize loading state
    streams.forEach(stream => {
      setStreamStates(prev => ({ ...prev, [stream.id]: 'loading' }));
    });
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [fullscreen]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'loaded': return 'bg-emerald-500 animate-pulse';
      case 'loading': return 'bg-amber-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'loaded': return 'Live';
      case 'loading': return 'Loading...';
      default: return 'Idle';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                CCTV Monitoring
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Real-time surveillance system</p>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className={`grid gap-6 ${fullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {streams.map((stream) => {
            if (fullscreen && fullscreen !== stream.id) return null;
            
            const status = streamStates[stream.id] || 'loading';
            const streamUrl = `${GO2RTC_URL}/stream.html?src=${stream.id}`;
            
            return (
              <div 
                key={stream.id} 
                className={`bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 transition-all ${
                  fullscreen === stream.id ? 'fixed inset-4 z-50' : ''
                }`}
              >
                {/* Stream Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} shadow-md`} />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{stream.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{getStatusText(status)} • {stream.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => reloadStream(stream.id)}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200"
                      title="Reload Stream"
                    >
                      <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors ${status === 'loading' ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleFullscreen(stream.id)}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200"
                      title={fullscreen === stream.id ? "Exit Fullscreen (ESC)" : "Fullscreen"}
                    >
                      {fullscreen === stream.id ? (
                        <Minimize2 className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                      ) : (
                        <Maximize2 className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Stream Container */}
                <div className={`relative bg-gradient-to-br from-gray-900 to-black ${
                  fullscreen === stream.id ? 'h-[calc(100vh-8rem)]' : 'aspect-video'
                }`}>
                  {status === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-50 z-10">
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg mb-4 inline-block">
                          <RefreshCw className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <p className="text-gray-700 font-semibold">Connecting to stream...</p>
                        <p className="text-gray-400 text-sm mt-2">{stream.id}</p>
                      </div>
                    </div>
                  )}
                  
                  <iframe
                    ref={(el) => iframeRefs.current[stream.id] = el}
                    src={streamUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; camera; microphone; display-capture"
                    allowFullScreen
                    onLoad={() => handleIframeLoad(stream.id)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Stream Info Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 text-xs text-gray-500 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-medium">WebRTC Mode</span>
                  <a 
                    href={streamUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
                  >
                    Open in new tab
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}