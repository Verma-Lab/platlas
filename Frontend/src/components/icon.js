import React from 'react';

const PenguinIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* DNA Double Helix Background */}
    <path 
      d="M4 4C4 4 8 8 4 12C0 16 4 20 4 20" 
      stroke="#86efac" 
      strokeWidth="0.5" 
      opacity="0.3"
    />
    <path 
      d="M20 4C20 4 16 8 20 12C24 16 20 20 20 20" 
      stroke="#86efac" 
      strokeWidth="0.5" 
      opacity="0.3"
    />

    {/* Main Body */}
    <path 
      d="M12 6C9 6 7 8 7 11C7 14 9 17 12 17.5C15 17 17 14 17 11C17 8 15 6 12 6Z" 
      fill="#f97316"  // Orange brown color
      stroke="#92400e"
      strokeWidth="0.5"
    />

    {/* Duck Bill */}
    <path 
      d="M10 11.5C10 11.5 12 13.5 14 11.5" 
      fill="#0ea5e9"
      stroke="#0ea5e9" 
      strokeWidth="1"
    />
    <path 
      d="M9.5 11C9.5 11 12 12.5 14.5 11" 
      fill="#0ea5e9"
      stroke="#0ea5e9" 
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Eyes */}
    <circle cx="10" cy="9" r="1.2" fill="#1e40af"/>
    <circle cx="14" cy="9" r="1.2" fill="#1e40af"/>
    <circle cx="9.7" cy="8.7" r="0.4" fill="white"/>
    <circle cx="13.7" cy="8.7" r="0.4" fill="white"/>

    {/* Tail */}
    <path 
      d="M12 17C12 17 13 18 14 18.5C15 19 15.5 19 15.5 19" 
      stroke="#92400e"
      strokeWidth="1.5"
      fill="#f97316"
    />

    {/* Sparkles */}
    <circle cx="6" cy="8" r="0.2" fill="#86efac"/>
    <circle cx="18" cy="8" r="0.2" fill="#86efac"/>
    <circle cx="17" cy="15" r="0.2" fill="#86efac"/>
    <circle cx="7" cy="15" r="0.2" fill="#86efac"/>
  </svg>
);


export default PenguinIcon;