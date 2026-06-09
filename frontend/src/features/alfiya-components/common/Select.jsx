import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  icon: Icon, 
  placeholder = "Select option",
  required = false,
  loading = false
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none mb-1">
          {label}
        </label>
      )}
      <div className="relative group cursor-pointer">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-focus-within:text-blue-600 transition-colors">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <select 
          value={value}
          onChange={onChange}
          required={required}
          disabled={loading}
          className={`
            w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pr-12 text-sm font-bold text-slate-700 
            focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all 
            appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-12' : 'pl-5'}
          `}
        >
          {loading ? (
            <option disabled value="">Loading options...</option>
          ) : (
            <>
              {options.length === 0 && <option disabled value="">No options available</option>}
              {options.map((opt) => (
                <option key={opt.value || opt.id} value={opt.value || opt.id}>
                  {opt.label || opt.name}
                </option>
              ))}
            </>
          )}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors pointer-events-none">
          <ChevronDown size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default Select;
