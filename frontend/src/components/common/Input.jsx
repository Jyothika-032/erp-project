import React from 'react';

const Input = ({ label, error, helperText, icon: Icon, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-slate-700 ml-1 leading-none uppercase tracking-widest text-[10px]">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <input 
          className={`
            block w-full border-2 border-slate-100 rounded-2xl py-3 px-4 
            text-sm font-medium text-slate-700 placeholder:text-slate-400
            transition-all duration-200 outline-none
            focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white
            disabled:bg-slate-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:ring-red-100' : ''}
          `}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`text-[11px] font-bold ml-1 ${error ? 'text-red-500' : 'text-slate-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export { Input }; export default Input;
