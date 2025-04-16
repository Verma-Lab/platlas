import React from 'react';

export const OptionBar = ({ idSuffix = '', options = [], selected, handler, disabled = false }) => {
  return (
    <div className="flex rounded-md shadow-sm -space-x-px">
      {options.map((opt, idx) => {
        // Determine if this option should be disabled
        const isOptionDisabled = disabled || (disabled && opt !== 'ALL');
        
        return (
          <button
            key={`${idx}-${idSuffix}`}
            onClick={() => !isOptionDisabled && handler(opt)}
            disabled={isOptionDisabled}
            className={`
              relative
              px-3
              py-1
              text-xs
              font-medium
              ${idx === 0 ? 'rounded-l-md' : ''}
              ${idx === options.length - 1 ? 'rounded-r-md' : ''}
              ${opt === selected 
                ? isOptionDisabled
                  ? 'bg-blue-400 text-white border-blue-200 z-10 cursor-not-allowed'
                  : 'bg-blue-600 text-white border-blue-200 z-10'
                : isOptionDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }
              border
              transition-colors
              duration-150
              focus:outline-none
              focus:ring-1
              focus:ring-blue-500
              focus:z-10
              ${isOptionDisabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
            title={isOptionDisabled ? 'Not available for MR-MEGA study' : undefined}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export default OptionBar;