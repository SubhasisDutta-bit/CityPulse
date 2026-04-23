import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Activity } from 'lucide-react';

const ChatAssistant = ({ city }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Telemetry linked. How can I analyze the current city for you?' }
  ]);
  
  const bottomRef = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!city) {
      setMessages(prev => [...prev, { role: 'user', text: query }, { role: 'assistant', text: "Please initialize a city scan first in the main dashboard." }]);
      setQuery('');
      return;
    }

    const currentQuery = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: currentQuery }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        city: city,
        query: currentQuery
      });

      const data = response.data;
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer, reason: data.reasoning }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error syncing with Intelligence Layer. Telemetry unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center font-bold"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Solid Clean Chat Panel (No Glassmorphism) */}
      {isOpen && (
        <div className="w-[350px] h-[450px] bg-[#0A0F1C] border border-slate-800 shadow-2xl rounded-lg flex flex-col overflow-hidden transition-all transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#050810] border-b border-slate-800 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold tracking-widest text-xs uppercase">City Assistant {city ? `[${city}]` : ''}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0F1C]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  <p>{msg.text}</p>
                  {msg.reason && (
                    <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-700 pt-1 font-mono">{msg.reason}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded flex space-x-2 items-center">
                  <Activity className="w-4 h-4 text-cyan-500 animate-spin" />
                  <span className="text-xs text-slate-400">Processing...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-[#050810]">
            <form onSubmit={handleSubmit} className="flex relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={city ? `Ask about ${city}...` : "Scan a city first..."}
                disabled={!city || loading}
                className="w-full bg-[#0A0F1C] border border-slate-800 text-white text-sm pl-4 pr-10 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
              />
              <button 
                type="submit" 
                disabled={!city || !query.trim() || loading}
                className="absolute right-2 top-2 bottom-2 p-1 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
