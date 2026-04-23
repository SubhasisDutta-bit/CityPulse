import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Lock, Mail, Activity } from 'lucide-react';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mouse tracking state for the AI sensor
  const [sensorPosition, setSensorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || isSuccess) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized direction (-1 to 1) 
      // but constrain movement strictly to remain professional and subtle
      const deltaX = (e.clientX - centerX) / window.innerWidth;
      const deltaY = (e.clientY - centerY) / window.innerHeight;
      
      setSensorPosition({ x: deltaX * 15, y: deltaY * 15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('All fields required');

    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsSuccess(true); // Trigger success animation
      setLoading(false);

      setTimeout(() => {
        onLoginSuccess(response.data.user);
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Make sure backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Geometric Modal Container - NO GLASSMORPHISM, STRICT SOLID COLORS */}
      <div 
        ref={containerRef}
        className="w-full max-w-4xl max-h-[600px] h-[80vh] mx-4 bg-[#0A0F1C] border border-slate-800 rounded-lg shadow-2xl flex overflow-hidden relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDE: Interactive AI Node */}
        <div className="hidden md:flex w-1/2 bg-[#050810] border-r border-slate-800 flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative text-center z-10 w-full flex flex-col items-center">
            {/* SVG AI Core Sensor */}
            <div className={`w-48 h-48 relative transition-all duration-[2000ms] ease-out ${isSuccess ? 'scale-110 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#1e293b" strokeWidth="2" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#0f172a" strokeWidth="6" />
                {/* Orbital Ring - spins continuously */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="10 10" className="animate-[spin_20s_linear_infinite]" />
                
                {/* Tracker Node Group - follows mouse */}
                <g style={{ transform: `translate(${sensorPosition.x}px, ${sensorPosition.y}px)`, transition: 'transform 0.1s linear' }}>
                  <circle cx="50" cy="50" r="20" fill="#1e293b" />
                  <circle cx="50" cy="50" r="14" fill="#0f172a" className={isTyping && !isSuccess ? "animate-pulse" : ""} />
                  {/* The exact sensor eye */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="6" 
                    fill={isSuccess ? "#10b981" : (isTyping ? "#3b82f6" : "#475569")} 
                    className="transition-colors duration-500"
                  />
                </g>

                {/* Success Signal Wave */}
                {isSuccess && (
                  <circle cx="50" cy="50" r="25" fill="none" stroke="#10b981" strokeWidth="2" className="animate-ping opacity-75" />
                )}
              </svg>
            </div>
            
            <div className="mt-8 space-y-2">
              <h3 className="text-white font-mono text-sm tracking-widest uppercase">System Core</h3>
              <p className="text-slate-500 font-mono text-xs">
                {isSuccess ? 'Authorization Verified.' : 'Awaiting input sequence...'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative bg-[#0A0F1C]">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Access System' : 'Initialize Account'}</h2>
            <p className="text-sm font-medium text-slate-500 mb-8">
              {isLogin ? 'Enter your credentials to continue.' : 'Register to cache global telemetry.'}
            </p>

            {error && (
              <div className="bg-red-900/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Identity</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="w-full bg-[#050810] border border-slate-700 text-white pl-11 pr-4 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 shadow-sm"
                    placeholder="agent@citypulse.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="w-full bg-[#050810] border border-slate-700 text-white pl-11 pr-4 py-3 rounded focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || isSuccess}
                className={`w-full py-3 rounded font-bold text-sm tracking-wide transition-all uppercase flex justify-center items-center ${
                  isSuccess 
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {loading ? <Activity className="w-5 h-5 animate-spin" /> : (isSuccess ? 'Authorized' : (isLogin ? 'Login' : 'Sign Up'))}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {isLogin ? 'No registration? Initialize here.' : 'Already initialized? Login here.'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
