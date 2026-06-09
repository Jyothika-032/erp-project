import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    warning: <AlertTriangle className="text-amber-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
  };

  const colors = {
    success: 'border-emerald-100 bg-emerald-50/90 shadow-emerald-500/10',
    error: 'border-rose-100 bg-rose-50/90 shadow-rose-500/10',
    warning: 'border-amber-100 bg-amber-50/90 shadow-amber-500/10',
    info: 'border-blue-100 bg-blue-50/90 shadow-blue-500/10',
  };

  return (
    <div className={`
      pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border-2 backdrop-blur-md shadow-2xl 
      animate-in slide-in-from-right-full fade-in duration-300 min-w-[320px] max-w-[450px]
      ${colors[type]}
    `}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-black text-slate-700 tracking-tight leading-tight">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg text-slate-400 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
