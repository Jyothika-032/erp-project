import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standardized input field for the ERP frontend.
 * Provides consistent labeling and error messaging.
 */
export const Input = ({ 
  label, 
  error, 
  className, 
  ...props 
}) => {
  const baseInputStyles = "block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all duration-200 outline-none hover:bg-white focus:bg-white placeholder:text-gray-400 text-gray-900 font-medium";
  const errorInputStyles = "border-red-200 text-red-900 placeholder-red-300 focus:ring-red-500/10 focus:border-red-500 bg-red-50/30";
  
  return (
    <div className={twMerge("space-y-2 mb-4", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={twMerge(baseInputStyles, error && errorInputStyles)}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">
          {error}
        </p>
      )}
    </div>
  );
};
