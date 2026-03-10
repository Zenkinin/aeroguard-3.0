import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { SimulationState, SimulationParams, ChartDataPoint } from '../types';

interface DataPanelProps {
  simState: SimulationState;
  params: SimulationParams;
}

const DataPanel: React.FC<DataPanelProps> = ({ simState, params }) => {
  // Generate dummy physics data based on input parameters
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const data: ChartDataPoint[] = [];
    const points = 50;

    // Impact physics approximation
    // Higher drop height = higher peak
    // Higher mass = higher peak
    const peakBase = (params.dropHeight * 9.8) * (params.mass / 100);

    for (let i = 0; i < points; i++) {
      const t = i / 10; // Time in ms (scaled)

      // Carbon Fiber: Sharp Gaussian (Brittle, high peak)
      const cfPeak = peakBase * 3.5; // Increased to 3.5x for sharper spike
      const cfWidth = 0.3; // Narrower peak
      const cfCenter = 1.2;
      const accelCF = cfPeak * Math.exp(-Math.pow(t - cfCenter, 2) / (2 * Math.pow(cfWidth, 2)));

      // NiTi: Lower, broader plateau (Energy absorption)
      const nitiPeak = cfPeak * 0.3; // ~70% reduction as requested
      const nitiWidth = 1.8; // Broader energy dissipation
      const nitiCenter = 1.8;
      // Use a modified super-gaussian to simulate plateau effect
      const accelNiTi = nitiPeak * Math.exp(-Math.pow(t - nitiCenter, 4) / (2 * Math.pow(nitiWidth, 4)));

      data.push({
        time: t,
        accelCF: Math.max(0, accelCF),
        accelNiTi: Math.max(0, accelNiTi)
      });
    }
    return data;
  }, [params]);

  const showChart = simState === SimulationState.IMPACT || simState === SimulationState.RESETTING;

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 backdrop-blur-2xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
        <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Impact Analytics
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto overflow-x-hidden pr-4 -mr-2">

        {/* Chart Section */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Acceleration vs Time (g-force)
          </h3>
          <div className="h-48 w-full">
            {showChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="time"
                    stroke="#737373"
                    tick={{ fontSize: 12, fill: '#a3a3a3', fontWeight: 600 }}
                    label={{ value: 'ms', position: 'insideBottomRight', offset: -5, fill: '#737373' }}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fontSize: 12, fill: '#a3a3a3', fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '14px', fontWeight: 'bold' }}
                    itemStyle={{ padding: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accelCF"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    name="Standard CF (Brittle)"
                    animationDuration={1000}
                  />
                  <Line
                    type="monotone"
                    dataKey="accelNiTi"
                    stroke="#d4d4d8"
                    strokeWidth={4}
                    dot={false}
                    name="AeroGuard NiTi (Damping)"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 text-sm font-medium tracking-widest uppercase">
                Awaiting impact data...
              </div>
            )}
          </div>
          {showChart && (
            <div className="flex gap-6 mt-4 justify-center">
              <div className="flex items-center text-sm font-bold text-red-500 uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                CF (Brittle)
              </div>
              <div className="flex items-center text-sm font-bold text-neutral-300 uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full bg-neutral-300 mr-2 shadow-[0_0_10px_rgba(212,212,216,0.5)]"></span>
                NiTi (Damping)
              </div>
            </div>
          )}
        </div>

        {/* Manufacturing Specs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-[0.15em]">
            Manufacturing Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
              <div className="text-xs font-bold text-neutral-500 uppercase">Laser Power</div>
              <div className="font-mono text-white text-lg font-bold mt-1">185 W</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
              <div className="text-xs font-bold text-neutral-500 uppercase">Scan Speed</div>
              <div className="font-mono text-white text-lg font-bold mt-1">900 mm/s</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
              <div className="text-xs font-bold text-neutral-500 uppercase">Hatch Spacing</div>
              <div className="font-mono text-white text-lg font-bold mt-1">0.08 mm</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
              <div className="text-xs font-bold text-neutral-500 uppercase">Layer Thickness</div>
              <div className="font-mono text-white text-lg font-bold mt-1">30 µm</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 col-span-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-white"></div>
              <div className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-3">Optimized Ni-Ti Root Length</div>
              <div className="font-mono text-white text-2xl font-black ml-3">40.0 mm</div>
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 mt-2">
            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Post-Process Heat Treatment</div>
            <div className="font-mono text-neutral-200 text-base font-bold">
              500°C / 1.0h <span className="text-neutral-500 px-2">→</span> Furnace Cool
            </div>
            <p className="text-xs text-neutral-500 mt-3 font-medium leading-relaxed">
              *Optimized for Superelasticity (Af &lt; RT). Critical for maximizing damping capacity ($\tan \delta$).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataPanel;