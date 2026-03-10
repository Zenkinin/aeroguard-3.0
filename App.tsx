import React, { useState, useCallback } from 'react';
import { SimulationState, SimulationParams } from './types';
import ControlPanel from './components/ControlPanel';
import DataPanel from './components/DataPanel';
import DroneScene from './components/DroneScene';

const App: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>(SimulationState.IDLE);
  const [isDataPanelVisible, setIsDataPanelVisible] = useState(false);
  const [params, setParams] = useState<SimulationParams>({
    armLength: 150,
    armRadius: 15,
    droneSize: 1.0,
    mass: 250,
    dropHeight: 2,
  });

  // Panel visibility states
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  const handleSimulate = useCallback(() => {
    if (simState === SimulationState.IDLE || simState === SimulationState.RESETTING) {
      setSimState(SimulationState.DROPPING);
      setIsDataPanelVisible(false); // Hide panel on new simulation
    }
  }, [simState]);

  const handleReset = useCallback(() => {
    if (simState === SimulationState.IMPACT) {
      setSimState(SimulationState.RESETTING);
      setIsDataPanelVisible(false); // Hide panel on reset
    }
  }, [simState]);

  const handleImpactComplete = useCallback(() => {
    setSimState(SimulationState.IMPACT);
    // Delay the data panel reveal to simulate computation / suspense
    setTimeout(() => {
      setIsRightOpen(true);       // Always re-open right panel on new impact result
      setIsDataPanelVisible(true);
    }, 1500);
  }, []);

  const handleResetComplete = useCallback(() => {
    setSimState(SimulationState.IDLE);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">

      {/* 1. Fullscreen 3D Background */}
      <div className="absolute inset-0 z-0">
        <DroneScene
          simState={simState}
          params={params}
          onImpact={handleImpactComplete}
          onResetComplete={handleResetComplete}
        />
      </div>

      {/* 2. Top-Left Logo & Status (Floating, Pointer-events none to pass clicks to 3D if needed) */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase opacity-90">
          AeroGuard
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <div className={`w-3 h-3 rounded-full shadow-lg ${simState === SimulationState.IDLE ? 'bg-emerald-500 shadow-emerald-500/50' :
            simState === SimulationState.DROPPING ? 'bg-yellow-500 animate-pulse shadow-yellow-500/50' :
              simState === SimulationState.IMPACT ? 'bg-red-500 shadow-red-500/50' :
                'bg-blue-500 animate-pulse shadow-blue-500/50'
            }`} />
          <span className="text-sm font-mono text-neutral-300 font-bold uppercase tracking-widest">{simState}</span>
        </div>
      </div>

      {/* 3. Left Control Drawer */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 left-8 z-10 w-80 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isLeftOpen ? 'translate-x-0' : '-translate-x-[120%]'
          }`}
      >
        <ControlPanel
          params={params}
          setParams={setParams}
        />
      </div>

      {/* Left Toggle Button */}
      <button
        onClick={() => setIsLeftOpen(!isLeftOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-20 bg-neutral-800/80 backdrop-blur-md border border-neutral-700/50 p-2 rounded-r-xl shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-700/80 ${isLeftOpen ? 'left-[352px]' : 'left-0'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isLeftOpen ? '' : 'rotate-180'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* 4. Bottom Center Action Area */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-96 flex flex-col gap-4">
        {simState === SimulationState.IDLE || simState === SimulationState.DROPPING ? (
          <button
            onClick={handleSimulate}
            disabled={simState !== SimulationState.IDLE}
            className={`w-full py-4 px-6 rounded-full font-black text-lg tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-md border ${simState === SimulationState.IDLE
              ? 'bg-red-600/90 hover:bg-red-500 border-red-500/50 text-white shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-red-600/40 hover:scale-105'
              : 'bg-neutral-800/50 border-neutral-700/50 text-neutral-500 cursor-not-allowed scale-95 opacity-50'
              }`}
          >
            {simState === SimulationState.IDLE ? 'Simulate Impact' : 'Dropping...'}
          </button>
        ) : null}

        {simState === SimulationState.IMPACT || simState === SimulationState.RESETTING ? (
          <button
            onClick={handleReset}
            disabled={simState !== SimulationState.IMPACT}
            className={`w-full py-4 px-6 rounded-full font-black text-lg tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-md border flex items-center justify-center gap-3 ${simState === SimulationState.IMPACT
              ? 'bg-neutral-100/90 hover:bg-white border-white/50 text-neutral-900 shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-white/40 hover:scale-105'
              : 'bg-neutral-800/50 border-neutral-700/50 text-neutral-500 cursor-not-allowed scale-95 opacity-50'
              }`}
          >
            {simState === SimulationState.IMPACT ? 'Heat & Reset' : 'Resetting...'}
          </button>
        ) : null}
      </div>

      {/* 5. Right Data Panel (Delayed Reveal) */}
      <div
        className={`absolute top-8 right-8 bottom-8 z-10 w-[400px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${(isDataPanelVisible && isRightOpen) ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'
          }`}
      >
        <DataPanel simState={simState} params={params} />
      </div>

      {/* Right Toggle Button (Only shows when data panel is supposedly visible) */}
      <button
        onClick={() => setIsRightOpen(!isRightOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-20 bg-neutral-800/80 backdrop-blur-md border border-neutral-700/50 p-2 rounded-l-xl shadow-lg transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-700/80 ${isDataPanelVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${isRightOpen ? 'right-[432px]' : 'right-0'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isRightOpen ? '' : 'rotate-180'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

export default App;