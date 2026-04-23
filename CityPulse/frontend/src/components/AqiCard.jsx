import React from 'react';

const AqiCard = ({ data }) => {
  if (!data) return null;

  // Determine color based on AQI level (1-5)
  const getAqiColor = (aqi) => {
    switch (aqi) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-500';
      case 5: return 'text-purple-500';
      default: return 'text-slate-400';
    }
  };

  const getAqiLabel = (aqi) => {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  };

  return (
    <div className="relative max-w-full group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden h-full">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-b from-slate-800/40 to-transparent">
          <h2 className="text-xl font-bold text-white tracking-tight">Air Quality Index</h2>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            {data.isMock ? 'Simulated' : 'Live'}
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className={`text-6xl font-black ${getAqiColor(data.aqi)} tracking-tighter drop-shadow-md`}>
              {data.aqi}
            </div>
            <div>
              <p className={`text-2xl font-bold ${getAqiColor(data.aqi)}`}>{getAqiLabel(data.aqi)}</p>
              <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">General Condition</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">PM 2.5</span>
              <span className="text-xl font-bold text-white">{data.pm2_5} <span className="text-xs text-teal-400">µg/m³</span></span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">PM 10</span>
              <span className="text-xl font-bold text-white">{data.pm10} <span className="text-xs text-teal-400">µg/m³</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AqiCard;
