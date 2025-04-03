import React from 'react';

const Logo = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 80, // Position below the top menu
        left: 40,
        width: '50px',
        zIndex: 1000
      }}
    >
      <img 
        src="globnuz.png" 
        alt="GlobNuz Logo" 
        style={{ 
          width: '100%', 
          height: 'auto',
          filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' // Add shadow for better visibility
        }}
      />
    </div>
  );
};

export default Logo;