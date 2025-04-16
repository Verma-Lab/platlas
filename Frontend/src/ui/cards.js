import React from 'react';

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white shadow rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardHeader Component
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardTitle Component
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`text-lg leading-6 font-medium text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

// CardContent Component
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
