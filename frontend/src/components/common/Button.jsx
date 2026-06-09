import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold',
    lg: 'px-7 py-3.5 text-base font-extrabold',
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

export { Button }; export default Button;
