import React, { useState, useEffect, useRef } from 'react';
import { Video, RefreshCw, Maximize2, Minimize2, Thermometer, Droplets, Cloud, Wind, Activity } from 'lucide-react';

export default function CCTVWithSensors() {
  const [streams] = useState([
    { id: 'cctv_1', name: 'CCTV 1', location: '192.168.140.19' },
    { id: 'cctv_2', name: 'CCTV 2', location: '192.168.130.9' }
  ]);
  const [fullscreen, setFullscreen] = useState(null);
  const [streamStates, setStreamStates] = useState({});
  const iframeRefs = useRef({});

  // MQTT Sensor Data
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    rain: null,
    wind: null,
    last_update: null,
    connected: false
  });

  const GO2RTC_URL = 'http://114.9.13.244:1984';

  // MQTT Connection using WebSocket
  useEffect(() => {
    let client = null;
    
    const connectMQTT = async () => {
      try {
        // Import Paho MQTT from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js';
        script.async = true;
        
        script.onload = () => {
          const clientId = 'web_client_' + Math.random().toString(16).substr(2, 8);
          
          // WebSocket connection to HiveMQ Cloud
          client = new window.Paho.MQTT.Client(
            '9390924f12534e95a2c2a456f5e485b0.s1.eu.hivemq.cloud',
            8884, // WebSocket Secure port
            clientId
          );

          client.onConnectionLost = (responseObject) => {
            if (responseObject.errorCode !== 0) {
              console.log('❌ Connection lost:', responseObject.errorMessage);
              setSensorData(prev => ({ ...prev, connected: false }));
              // Try to reconnect after 5 seconds
              setTimeout(connectMQTT, 5000);
            }
          };

          client.onMessageArrived = (message) => {
            try {
              console.log('📨 Raw MQTT message:', message.payloadString);
              const data = JSON.parse(message.payloadString);
              console.log('📊 Parsed data:', data);
              
              // Update sensor data dengan format yang sama seperti Python backend
              setSensorData({
                temperature: data.temperature,
                humidity: data.humidity,
                rain: data.rain,
                wind: data.wind,
                last_update: new Date().toLocaleString('id-ID', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).replace(/\//g, '-'),
                connected: true
              });
              
              console.log('✅ Sensor data updated successfully!');
            } catch (error) {
              console.error('❌ Parse error:', error);
              console.error('Raw payload:', message.payloadString);
            }
          };

          const options = {
            userName: 'kandang',
            password: '@Bismillah2025',
            useSSL: true,
            timeout: 10,
            keepAliveInterval: 60,
            onSuccess: () => {
              console.log('✅ Connected to MQTT Broker');
              setSensorData(prev => ({ ...prev, connected: true }));
              client.subscribe('weather/sensors');
            },
            onFailure: (error) => {
              console.error('❌ Connection failed:', error);
              setSensorData(prev => ({ ...prev, connected: false }));
              setTimeout(connectMQTT, 5000);
            }
          };

          client.connect(options);
        };

        script.onerror = () => {
          console.error('❌ Failed to load MQTT library');
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('❌ MQTT setup error:', error);
      }
    };

    connectMQTT();

    return () => {
      if (client && client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

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

  const SensorCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">
            {value !== null ? `${value}${unit}` : '--'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                CCTV Monitoring System
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Real-time surveillance & weather monitoring</p>
            </div>
          </div>
          
          {/* MQTT Status */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
            <div className={`w-2 h-2 rounded-full ${sensorData.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {sensorData.connected ? 'MQTT Connected' : 'MQTT Disconnected'}
            </span>
          </div>
        </div>

        {/* Sensor Dashboard */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Weather Sensors</h2>
            {sensorData.last_update && (
              <span className="text-xs text-gray-500 ml-auto">
                Last update: {sensorData.last_update}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SensorCard
              icon={Thermometer}
              label="Temperature"
              value={sensorData.temperature}
              unit="°C"
              color="bg-gradient-to-br from-red-500 to-orange-500"
            />
            <SensorCard
              icon={Droplets}
              label="Humidity"
              value={sensorData.humidity}
              unit="%"
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <SensorCard
              icon={Cloud}
              label="Rain"
              value={sensorData.rain}
              unit=""
              color="bg-gradient-to-br from-gray-500 to-slate-600"
            />
            <SensorCard
              icon={Wind}
              label="Wind"
              value={sensorData.wind}
              unit=" m/s"
              color="bg-gradient-to-br from-teal-500 to-emerald-500"
            />
          </div>
        </div>

        {/* CCTV Grid */}
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