import React from 'react';

const NewsCard = ({ data }) => {
  if (!data || !data.articles || data.articles.length === 0) return null;

  return (
    <div className="relative max-w-full group mt-8">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden h-full">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-b from-slate-800/40 to-transparent">
          <h2 className="text-xl font-bold text-white tracking-tight">Local Intelligence</h2>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            {data.isMock ? 'Simulated' : 'Live'}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {data.articles.map((article, idx) => (
            <a 
              key={idx} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30 hover:bg-slate-800/80 transition-colors group/link"
            >
              <h3 className="text-white font-semibold mb-2 group-hover/link:text-purple-300 transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/link:text-purple-400">
                Source: {article.source}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
