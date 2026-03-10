import React from 'react';
import { SimulationParams, SimulationState } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
}) => {
  const isLocked = false;
  const NITI_FIXED_LENGTH = 40;

  const handleChange = (key: keyof SimulationParams, value: number) => {
    if (key === 'armLength' && value < NITI_FIXED_LENGTH + 20) {
      return;
    }
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Arm Length */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-base font-bold text-white tracking-wide">Total Arm Length</label>
          <span className="text-lg font-black font-mono text-cyan-400">{params.armLength} <span className="text-xs font-medium text-cyan-600">mm</span></span>
        </div>
        <input
          type="range" min="100" max="300" step="10"
          disabled={isLocked}
          value={params.armLength}
          onChange={(e) => handleChange('armLength', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Arm Radius */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-base font-bold text-white tracking-wide">Arm Radius</label>
          <span className="text-lg font-black font-mono text-cyan-400">{params.armRadius} <span className="text-xs font-medium text-cyan-600">mm</span></span>
        </div>
        <input
          type="range" min="8" max="30" step="1"
          disabled={isLocked}
          value={params.armRadius}
          onChange={(e) => handleChange('armRadius', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Drone Scale */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-base font-bold text-white tracking-wide">Drone Scale</label>
          <span className="text-lg font-black font-mono text-cyan-400">{params.droneSize.toFixed(1)}<span className="text-xs font-medium text-cyan-600">×</span></span>
        </div>
        <input
          type="range" min="0.5" max="2.0" step="0.1"
          disabled={isLocked}
          value={params.droneSize}
          onChange={(e) => handleChange('droneSize', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* System Mass */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-base font-bold text-white tracking-wide">System Mass</label>
          <span className="text-lg font-black font-mono text-cyan-400">{params.mass} <span className="text-xs font-medium text-cyan-600">g</span></span>
        </div>
        <input
          type="range" min="100" max="1000" step="50"
          disabled={isLocked}
          value={params.mass}
          onChange={(e) => handleChange('mass', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Drop Height */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-base font-bold text-white tracking-wide">Drop Height</label>
          <span className="text-lg font-black font-mono text-cyan-400">{params.dropHeight.toFixed(1)} <span className="text-xs font-medium text-cyan-600">m</span></span>
        </div>
        <input
          type="range" min="0.5" max="5.0" step="0.1"
          disabled={isLocked}
          value={params.dropHeight}
          onChange={(e) => handleChange('dropHeight', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
        />
      </div>

    </div>
  );
};

export default ControlPanel;