'use client';

import { useState, useEffect } from 'react';

interface TelemetryData {
  cpu?: number;
  ram?: number;
  gpu?: number;
  // Aceptamos variaciones comunes de nombres en el JSON
  cpu_percent?: number;
  memory_percent?: number;
  gpu_percent?: number;
  [key: string]: any;
}

export default function HardwareDashboard() {
  const [stats, setStats] = useState<TelemetryData | null>(null);
  const [error, setError] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/hardware');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      }
    };

    fetchStats(); // Fetch inicial
    const interval = setInterval(fetchStats, 3000); // Polling cada 3s
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    if (isRestarting) return;
    setIsRestarting(true);
    try {
      await fetch('/api/hardware/restart', { method: 'POST' });
      // Esperamos unos segundos extra a que reinicie ollama y limpie RAM
      setTimeout(() => setIsRestarting(false), 8000);
    } catch (e) {
      console.error(e);
      setIsRestarting(false);
    }
  };

  const renderBar = (label: string, value: number = 0) => (
    <div className="mb-2.5 last:mb-0">
      <div className="flex justify-between text-[10px] font-mono mb-1">
        <span className="text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-neon-green">{value.toFixed(1)}%</span>
      </div>
      {/* Barra estricta sin bordes redondeados (sharp edges) */}
      <div className="h-1 bg-carbon-border w-full overflow-hidden">
        <div 
          className="h-full bg-neon-green transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-void-black border-t border-carbon-border w-full flex flex-col gap-3 animate-matrix-fade-in shrink-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 ${error ? 'bg-red-500' : 'bg-neon-green animate-pulse-dot'}`} />
          <span className="text-xs font-mono text-terminal-green tracking-widest uppercase">
            SYS_TELEMETRY
          </span>
        </div>
        
        {/* Temperatures */}
        {stats && !error && (
          <div className="text-[10px] font-mono text-cyber-purple flex gap-2">
            <span>{stats.temp_cpu?.toFixed(0)}°C</span>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="text-[10px] font-mono text-red-500 py-2">
          [ERR_LINK_OFFLINE]
        </div>
      ) : stats ? (
        <div className="flex flex-col">
          {renderBar('CPU', stats.cpu_percent ?? 0)}
          {renderBar('RAM', stats.ram_percent ?? 0)}
          {renderBar('GPU', stats.gpu_percent ?? 0)}
        </div>
      ) : (
        <div className="text-[10px] font-mono text-text-muted py-2 animate-pulse">
          AWAITING_SIGNAL...
        </div>
      )}

      {/* Acciones de Hardware */}
      <div className="mt-2 pt-2 border-t border-carbon-border">
        <button
          onClick={handleRestart}
          disabled={isRestarting || error}
          className={`
            w-full py-1.5 px-2 rounded
            text-[10px] font-mono tracking-widest uppercase
            transition-all duration-300
            border border-dashed
            ${isRestarting 
              ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple animate-pulse' 
              : 'border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.4)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRestarting ? '[ PURGING VRAM... ]' : '[ PURGE VRAM / RESTART ]'}
        </button>
      </div>
    </div>
  );
}
