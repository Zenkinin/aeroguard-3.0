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
  // Use a softer internal state for disabled feel if needed, but since it's just params, 
  // we can keep them enabled or disable based on a prop if passed later. 
  // For now, always enabled to allow pre-flight adjustments.
  const isLocked = false;

  const NITI_FIXED_LENGTH = 40; // Fixed manufacturing param

  const handleChange = (key: keyof SimulationParams, value: number) => {
    // Basic validation constraints
    if (key === 'armLength' && value < NITI_FIXED_LENGTH + 20) {
      // Don't allow total length to be smaller than niti + buffer
      return;
    }
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Arm Length Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-300 font-medium">Total Arm Length</label>
          <span className="text-cyan-400 font-mono">{params.armLength} mm</span>
        </div>
        <input
          type="range"
          min="100"
          max="300"
          step="10"
          disabled={isLocked}
          value={params.armLength}
          onChange={(e) => handleChange('armLength', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 disabled:opacity-50"
        />
      </div>

      {/* Arm Radius Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-300 font-medium">Arm Radius</label>
          <span className="text-purple-400 font-mono">{params.armRadius} mm</span>
        </div>
        <input
          type="range"
          min="8"
          max="30"
          step="1"
          disabled={isLocked}
          value={params.armRadius}
          onChange={(e) => handleChange('armRadius', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 disabled:opacity-50"
        />
      </div>

      {/* Drone Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-300 font-medium">Drone Scale</label>
          <span className="text-emerald-400 font-mono">{params.droneSize.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          disabled={isLocked}
          value={params.droneSize}
          onChange={(e) => handleChange('droneSize', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 disabled:opacity-50"
        />
      </div>

      {/* Mass Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-300 font-medium">System Mass</label>
          <span className="text-cyan-400 font-mono">{params.mass} g</span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          disabled={isLocked}
          value={params.mass}
          onChange={(e) => handleChange('mass', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 disabled:opacity-50"
        />
      </div>

      {/* Drop Height Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-300 font-medium">Drop Height</label>
          <span className="text-cyan-400 font-mono">{params.dropHeight.toFixed(1)} m</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.0"
          step="0.1"
          disabled={isLocked}
          value={params.dropHeight}
          onChange={(e) => handleChange('dropHeight', Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default ControlPanel;