// Logo.jsx
import React from 'react';

const Logo = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 20,
        left: 40,
        width: '50px',
        zIndex: 1000
      }}
    >
      <img 
        src="globnuz.png" 
        alt="GlobNuz Logo" 
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default Logo;