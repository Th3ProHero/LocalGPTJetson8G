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
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-[11px] font-sans mb-1.5">
        <span className="text-text-secondary font-medium tracking-wide">{label}</span>
        <span className="text-text-primary font-mono">{value.toFixed(1)}%</span>
      </div>
      {/* Soft rounded progress bar */}
      <div className="h-1.5 bg-border w-full rounded-full overflow-hidden">
        <div 
          className="h-full bg-text-primary transition-all duration-500 ease-out rounded-full" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-bg-surface border-t border-border w-full flex flex-col gap-4 shrink-0 transition-opacity duration-300">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-status-error' : 'bg-text-primary'}`} />
          <span className="text-xs font-sans text-text-primary font-semibold tracking-wide">
            Telemetry
          </span>
        </div>
        
        {/* Temperatures */}
        {stats && !error && (
          <div className="text-[11px] font-mono text-text-secondary flex gap-2 bg-bg-base px-2 py-0.5 rounded border border-border">
            <span>{stats.temp_cpu?.toFixed(0)}°C</span>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="text-xs font-sans text-status-error py-2 flex items-center gap-2 bg-status-error-bg px-3 rounded border border-status-error/20">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Offline
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-1">
          {renderBar('CPU', stats.cpu_percent ?? 0)}
          {renderBar('RAM', stats.ram_percent ?? 0)}
          {renderBar('GPU', stats.gpu_percent ?? 0)}
        </div>
      ) : (
        <div className="text-xs font-sans text-text-muted py-2 animate-pulse flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-border border-t-text-primary animate-spin" />
          Connecting...
        </div>
      )}

      {/* Acciones de Hardware */}
      <div className="pt-3 border-t border-border mt-1">
        <button
          onClick={handleRestart}
          disabled={isRestarting || error}
          className={`
            w-full py-2 px-3 rounded-lg flex justify-center items-center gap-2
            text-xs font-sans font-medium
            transition-all duration-300
            border
            ${isRestarting 
              ? 'bg-bg-base border-border text-text-secondary cursor-wait' 
              : 'bg-bg-base border-border text-text-secondary hover:bg-bg-surface-hover hover:border-border-hover hover:text-text-primary'
            }
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
          `}
        >
          {isRestarting ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-border border-t-text-primary animate-spin" />
              Purging VRAM...
            </>
          ) : (
            'Purge VRAM / Restart'
          )}
        </button>
      </div>
    </div>
  );
}
