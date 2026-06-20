import React, { useState } from 'react';
import { MapPin, ArrowRight, Check, Leaf, Sparkles } from 'lucide-react';

interface TransitCalculatorProps {
  onAvoidedCarbonLogged: (kgAvoided: number) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function TransitCalculator({
  onAvoidedCarbonLogged,
  showToast,
}: TransitCalculatorProps) {
  const [distance, setDistance] = useState<string>('15');
  const [avoidedLogs, setAvoidedLogs] = useState<
    Array<{ id: string; mode: string; avoided: number; date: string }>
  >([]);

  const commuteModes = [
    { name: 'Gasoline SUV', factor: 0.22, icon: '🚗' },
    { name: 'Standard Gas Car', factor: 0.18, icon: '🚘' },
    { name: 'Electric Car (Clean Grid)', factor: 0.04, icon: '⚡' },
    { name: 'Public Transit Bus / Rail', factor: 0.05, icon: '🚌' },
    { name: 'Bicycling / E-Bike', factor: 0.0, icon: '🚲' },
    { name: 'Walking / Running', factor: 0.0, icon: '🚶' },
  ];

  const distVal = parseFloat(distance) || 0;

  // Calculate carbon avoids: baseline is driving standard gas car
  const baselineEmissions = distVal * 0.18;

  const logCommuteAction = (modeName: string, modeFactor: number) => {
    if (distVal <= 0) return;

    const emitted = distVal * modeFactor;
    const avoided = baselineEmissions - emitted;

    if (avoided <= 0) {
      if (showToast) {
        showToast(
          "This mode doesn't save additional carbon compared to our base Standard Gas Car. Choose public transit, walking, or biking to avoid footprint!",
          'info'
        );
      } else {
        console.warn(
          "This mode doesn't save additional carbon compared to our base Standard Gas Car."
        );
      }
      return;
    }

    const logEntry = {
      id: `avoid-${Date.now()}`,
      mode: modeName,
      avoided: parseFloat(avoided.toFixed(2)),
      date: new Date().toLocaleDateString(),
    };

    setAvoidedLogs((prev) => [logEntry, ...prev]);
    onAvoidedCarbonLogged(logEntry.avoided);
    if (showToast) {
      showToast(
        `Terrific! Avoiding standard drive by opting for "${commuteModes.find((m) => m.name === modeName)?.icon} ${modeName}" saved ${logEntry.avoided} kg of CO2 equivalent, earning you additional XP!`,
        'success'
      );
    } else {
      console.log(
        `Terrific! Avoiding standard drive saved ${logEntry.avoided} kg of CO2 equivalent.`
      );
    }
  };

  return (
    <div
      id="transit-calculator-panel"
      className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden shadow-xs"
    >
      {/* Upper info */}
      <div className="shrink-0 select-none">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-250 text-emerald-600">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Eco Transit Footprints{' '}
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Compare daily travel methods to find avoided footprint credits
            </p>
          </div>
        </div>

        {/* Input variables */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 text-xs shadow-xs select-none">
          <label className="block text-[10px] font-mono text-emerald-750 uppercase tracking-wider mb-1.5 font-bold">
            Expected Commute Distance (kilometers)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g. 15"
              className="grow bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-355 font-semibold"
              required
            />
            <span className="text-slate-500 font-mono text-xs shrink-0 select-none">
              km one-way
            </span>
          </div>
        </div>
      </div>

      {/* Comparative modes grid */}
      <div className="grow overflow-y-auto space-y-3 pr-1 py-1">
        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1 mb-2 select-none font-semibold">
          Comparative Carbon Emissions
        </h4>

        {commuteModes.map((mode) => {
          const modeEmissions = distVal * mode.factor;
          const diffFromBaseline = baselineEmissions - modeEmissions;
          const isBetter = diffFromBaseline > 0;

          return (
            <div
              key={mode.name}
              className={`flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border transition-all ${
                isBetter ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200'
              } shadow-xs`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none shrink-0">{mode.icon}</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug">{mode.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Emits {modeEmissions.toFixed(2)} kg CO2 total
                  </p>
                </div>
              </div>

              {isBetter ? (
                <button
                  type="button"
                  onClick={() => logCommuteAction(mode.name, mode.factor)}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 animate-bounce-slow" /> Avoid{' '}
                  {diffFromBaseline.toFixed(1)} kg
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  Baseline Mode
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Avoided Logs Track */}
      {avoidedLogs.length > 0 && (
        <div className="shrink-0 max-h-24 overflow-y-auto border-t border-slate-100 pt-3.5 mt-3 select-none">
          <h5 className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider mb-2 font-bold">
            Avoided Travel Credits
          </h5>
          <div className="space-y-1.5">
            {avoidedLogs.slice(0, 3).map((l) => (
              <div
                key={l.id}
                className="text-[10.5px] text-slate-600 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs"
              >
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Commute by {l.mode}
                </span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[10px]">
                  -{l.avoided} kg Avoided
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
