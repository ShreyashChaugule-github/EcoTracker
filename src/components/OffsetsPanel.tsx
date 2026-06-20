import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Landmark, Globe, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { OffsetLog } from '../types';

interface OffsetsPanelProps {
  userId: string;
  onOffsetFunded: (co2OffsetAmount: number) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function OffsetsPanel({ userId, onOffsetFunded, showToast }: OffsetsPanelProps) {
  const [offsets, setOffsets] = useState<OffsetLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState('Amazon Reforestation Initiative');
  const [fundingAmount, setFundingAmount] = useState('25');

  const projects = [
    {
      name: 'Amazon Reforestation Initiative',
      costPerTon: 15,
      rating: 'Gold Standard',
      loc: 'Brazil',
    },
    {
      name: 'High-Efficiency Kenya Cookstoves',
      costPerTon: 10,
      rating: 'Verra Certified',
      loc: 'Kenya',
    },
    { name: 'Ocean Carbon-Trap Seawalls', costPerTon: 25, rating: 'Gold Standard', loc: 'Fiji' },
    {
      name: 'Saharan Solar Array Grid Integration',
      costPerTon: 12,
      rating: 'Verra Certified',
      loc: 'Morocco',
    },
  ];

  useEffect(() => {
    loadOffsets();
  }, [userId]);

  const loadOffsets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/offsets/${userId}`);
      setOffsets(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load historical offsets from database.');
    } finally {
      setLoading(false);
    }
  };

  const executeOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    const dollars = parseFloat(fundingAmount);
    if (isNaN(dollars) || dollars <= 0) {
      if (showToast) {
        showToast('Please enter a valid donation value.', 'error');
      } else {
        console.warn('Please enter a valid donation value.');
      }
      return;
    }

    const proj = projects.find((p) => p.name === selectedProject);
    if (!proj) return;

    // Standard formula: tons offset = dollars / cost_per_ton. Convert to kilograms (* 1000)
    const tonsOffset = dollars / proj.costPerTon;
    const kgOffset = parseFloat((tonsOffset * 1000).toFixed(1));

    try {
      const res = await axios.post('/api/offsets', {
        userId,
        projectName: selectedProject,
        amountPaid: dollars,
        co2Offset: kgOffset,
      });

      if (res.data) {
        setOffsets((prev) => [res.data, ...prev]);
        onOffsetFunded(kgOffset);
        setFundingAmount('25');
        if (showToast) {
          showToast(
            `Excellent stewardship! You funded "${selectedProject}" with $${dollars}, mitigating ${kgOffset} kg of CO2 equivalent from the global atmosphere.`,
            'success'
          );
        } else {
          console.log(
            `Excellent stewardship! You funded "${selectedProject}" with $${dollars}, mitigating ${kgOffset} kg of CO2 equivalent from global atmosphere.`
          );
        }
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Failed to submit offset payment transaction.', 'error');
      } else {
        console.error('Failed to submit offset payment transaction.');
      }
    }
  };

  return (
    <div
      id="offsets-panel-container"
      className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden shadow-xs"
    >
      {/* Title */}
      <div className="shrink-0 select-none">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-250 text-emerald-600">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Carbon Offset Projects{' '}
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-500">
              Fund global certified ecological restorations to zero out your net footprint
            </p>
          </div>
        </div>

        {/* Action contributor form */}
        <form
          onSubmit={executeOffset}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 select-none"
        >
          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-emerald-700 uppercase tracking-widest mb-1.5 font-semibold">
                Ecological Restoration Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 outline-none shadow-xs font-semibold"
              >
                {projects.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} (${p.costPerTon}/ton)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-emerald-700 uppercase tracking-widest mb-1.5 font-semibold">
                Contribution Amount ($ USD)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="25"
                    className="w-full bg-white border border-slate-200 pl-8 pr-3 py-2.5 rounded-xl text-xs text-slate-800 outline-none shadow-xs font-semibold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Fund
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Projects overview & Past transactions */}
      <div className="grow overflow-y-auto space-y-4 pr-1 py-1">
        {/* Projects cards list */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1 select-none font-semibold">
            Active Certified Programs
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {projects.map((p) => (
              <div
                key={p.name}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all select-none shadow-xs"
              >
                <h5 className="text-[11.5px] font-bold text-slate-900 leading-snug">{p.name}</h5>
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-700 mt-2">
                  <span className="bg-emerald-50 border border-emerald-250 rounded px-1.5 py-0.5 font-bold">
                    {p.rating}
                  </span>
                  <span className="text-slate-500">{p.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2 pt-2 border-t border-slate-100 select-none">
          <h4 className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider pl-1 font-bold">
            Contribution History Ledger
          </h4>

          {loading ? (
            <p className="text-[10px] text-slate-400 font-mono text-center">
              Loading historic records from FireStore...
            </p>
          ) : error ? (
            <div className="text-red-500 text-[10px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          ) : offsets.length === 0 ? (
            <p className="text-[10.5px] text-slate-500 font-mono italic pl-1">
              Funding ledger was clean. Ready to purchase first offsets!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {offsets.map((o) => (
                <div
                  key={o.id}
                  className="text-[10.5px] text-slate-605 flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-xs"
                >
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600" /> {o.projectName}
                  </span>
                  <span className="font-mono text-emerald-700 font-bold ml-2 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[10px]">
                    ${o.amountPaid} &rarr; -{o.co2Offset} kg CO2
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
