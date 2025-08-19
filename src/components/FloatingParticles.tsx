import React from 'react';

export const FloatingParticles: React.FC = () => {
  return (
    <div className="particles-container">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            width: `${20 + Math.random() * 80}px`,
            height: `${20 + Math.random() * 80}px`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${20 + Math.random() * 20}s`
          }}
        />
      ))}
    </div>
  );
};