import React, { useState } from 'react';
import { Sparkles, Leaf, ShieldAlert, Cpu } from 'lucide-react';

export default function EarthSimulator() {
  const [cleanGrid, setCleanGrid] = useState(20);
  const [transitPercent, setTransitPercent] = useState(15);
  const [plantBasedDiet, setPlantBasedDiet] = useState(10);
  const [treePlanting, setTreePlanting] = useState(5);

  // Baseline catastrophic temperature rise: 3.2 °C
  // Calculate reductions based on slider values
  const cleanGridInfluence = (cleanGrid / 100) * 0.6; // max saving of 0.6 C
  const transitInfluence = (transitPercent / 100) * 0.4; // max saving of 0.4 C
  const dietInfluence = (plantBasedDiet / 100) * 0.4; // max saving of 0.4 C
  const forestInfluence = (treePlanting / 100) * 0.3; // max saving of 0.3 C

  const totalReduction = cleanGridInfluence + transitInfluence + dietInfluence + forestInfluence;
  const projectedTemperature = Math.max(1.3, parseFloat((3.2 - totalReduction).toFixed(2)));

  // Decide current outcome feedback
  let alertMode = true;
  let statusText = 'CRITICAL GLOBAL HEATING';
  let statusDesc =
    'Projected temperatures represent massive ecological failures. Sea levels rise by 0.8 meters, displacing millions.';
  let statusColor = 'bg-red-50 border-red-200 text-red-800';

  if (projectedTemperature <= 1.5) {
    alertMode = false;
    statusText = 'ECOLOGICAL HARMONY (SAFE TARGET)';
    statusDesc =
      'Perfect score! We successfully restricted heating below the crucial 1.5°C threshold, securing glacier caps and coral reef survival.';
    statusColor = 'bg-[#EEFDF6] border-[#D1F9E6] text-emerald-800';
  } else if (projectedTemperature <= 2.0) {
    statusText = 'MODERATE WARMING WARNING';
    statusDesc =
      'Substantial steps implemented, but warm weather extremes persist. Glacier caps experience 70% reduction.';
    statusColor = 'bg-[#FFF9EB] border-[#FEEFC6] text-amber-800';
  }

  return (
    <div
      id="earth-simulator-panel"
      className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden shadow-xs"
    >
      {/* Title */}
      <div className="shrink-0 select-none">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-250 text-emerald-600">
            <Cpu className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Earth Climate Simulator{' '}
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Model how structural societal adjustments affect projected 2050 global heating
            </p>
          </div>
        </div>
      </div>

      {/* Main Simulation Output Dashboard */}
      <div className="grow grid grid-cols-2 gap-6 overflow-y-auto pr-1 select-none">
        {/* Sliders Configuration */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1 mb-2">
            Societal Adjustments
          </h4>

          {/* Slider 1 */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Renewable Energy Grid</span>
              <span className="text-emerald-700 font-mono font-bold">{cleanGrid}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={cleanGrid}
              onChange={(e) => setCleanGrid(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 2 */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Public Transit adoption</span>
              <span className="text-emerald-700 font-mono font-bold">{transitPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={transitPercent}
              onChange={(e) => setTransitPercent(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 3 */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Vegetarian / Vegan Diet Conversion</span>
              <span className="text-emerald-700 font-mono font-bold">{plantBasedDiet}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={plantBasedDiet}
              onChange={(e) => setPlantBasedDiet(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 4 */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Tree Planting Afforestation</span>
              <span className="text-emerald-700 font-mono font-bold">{treePlanting}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={treePlanting}
              onChange={(e) => setTreePlanting(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Real-time Display Status */}
        <div className="flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-center py-4">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Projected 2050 Surface Heating
            </p>
            <div className="text-5xl font-extrabold text-slate-900 font-mono flex items-center justify-center gap-1.5 relative">
              <span>+{projectedTemperature}°C</span>
              {projectedTemperature > 1.5 ? (
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 select-none animate-bounce" />
              ) : (
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0 select-none animate-pulse" />
              )}
            </div>
          </div>

          <div className={`p-4 border rounded-xl text-center shadow-xs ${statusColor}`}>
            <h5 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              {statusText}
            </h5>
            <p className="text-[10.5px] leading-relaxed select-text mt-1.5">{statusDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
