import React from 'react';

export const Logo3D = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#10a37f', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0f766e', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#115e59', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <path d="M50 20 L85 40 L50 60 L15 40 Z" fill="url(#grad1)" stroke="#ccfbf1" strokeWidth="2"/>
    <path d="M15 40 L50 60 V90 L15 70 Z" fill="url(#grad2)" stroke="#115e59" strokeWidth="2"/>
    <path d="M85 40 L85 70 L50 90 V60 Z" fill="#134e4a" stroke="#115e59" strokeWidth="2"/>
    <path d="M50 20 L85 40 L50 60 L15 40 Z" fill="white" fillOpacity="0.1" />
  </svg>
);

export type MascotPose = 'idle' | 'confident' | 'thinking' | 'happy' | 'smart';

export const MascotAvatar = ({ size = 40, pose = 'idle', className = '' }: { size?: number, pose?: MascotPose, className?: string }) => {
  // Colors based on the mascot image provided
  const skinColor = "#4ade80"; // Bright Green
  const skinShadow = "#22c55e"; // Darker Green
  const suitColor = "#4c1d95"; // Deep Purple (from image)
  const tieColor = "#f97316"; // Orange tie
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="mascotShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
        <linearGradient id="suitGrad" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stopColor="#5b21b6" />
           <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0.5" y1="0" x2="0.5" y2="1">
           <stop offset="0%" stopColor="#86efac" />
           <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Body/Suit */}
      <g transform="translate(0, 10)">
        {/* Shoulders */}
        <path d="M20 100 C20 80 30 70 50 70 C70 70 80 80 80 100" fill="url(#suitGrad)" />
        {/* Shirt Collar */}
        <path d="M42 70 L50 80 L58 70 L50 65 Z" fill="white" />
        {/* Tie */}
        <path d="M50 70 L46 72 L50 90 L54 72 Z" fill={tieColor} />
      </g>

      {/* Head */}
      <g transform={pose === 'thinking' ? "rotate(-5 50 50) translate(0, -2)" : ""}>
        {/* Face Shape (Bald, Green) */}
        <rect x="30" y="20" width="40" height="50" rx="16" fill="url(#skinGrad)" filter="url(#mascotShadow)" />
        
        {/* Ears */}
        <path d="M28 45 C25 45 25 35 30 35" fill={skinShadow} />
        <path d="M72 45 C75 45 75 35 70 35" fill={skinShadow} />

        {/* Glasses */}
        <g transform="translate(0, 2)">
           {/* Frame */}
           <path d="M32 38 H48 M52 38 H68" stroke="black" strokeWidth="3" strokeLinecap="round"/>
           <rect x="32" y="32" width="16" height="12" rx="3" stroke="black" strokeWidth="3" fill="white" fillOpacity="0.2"/>
           <rect x="52" y="32" width="16" height="12" rx="3" stroke="black" strokeWidth="3" fill="white" fillOpacity="0.2"/>
           {/* Bridge */}
           <line x1="48" y1="38" x2="52" y2="38" stroke="black" strokeWidth="3" />
        </g>

        {/* Mouth */}
        {pose === 'happy' && <path d="M42 60 Q50 65 58 60" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />}
        {pose === 'confident' && <path d="M45 60 Q50 62 55 60" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />}
        {(pose === 'thinking' || pose === 'smart') && <line x1="45" y1="60" x2="55" y2="60" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />}
        {pose === 'idle' && <path d="M45 60 H55" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />}

        {/* Eyebrows */}
        <g transform="translate(0, -2)">
          {pose === 'confident' && (
             <>
               <path d="M35 28 L45 28" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
               <path d="M55 28 L65 25" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
             </>
          )}
          {pose === 'thinking' && (
             <>
               <path d="M35 25 L45 28" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
               <path d="M55 28 L65 25" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
             </>
          )}
          {(pose === 'idle' || pose === 'happy') && (
             <>
               <path d="M35 28 Q40 26 45 28" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
               <path d="M55 28 Q60 26 65 28" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
             </>
          )}
        </g>
      </g>

      {/* Hand Gestures based on pose */}
      {pose === 'thinking' && (
         <circle cx="70" cy="70" r="8" fill={skinColor} />
      )}
      {pose === 'confident' && (
         <g>
           <circle cx="30" cy="80" r="8" fill={skinColor} />
           <circle cx="70" cy="80" r="8" fill={skinColor} />
         </g>
      )}

    </svg>
  );
};

export const UploadIcon3D = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stopColor="#ffffff" />
         <stop offset="100%" stopColor="#e2e8f0" />
       </linearGradient>
       <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
         <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
       </filter>
     </defs>
     <path d="M25 60 C15 60 10 50 15 40 C18 30 30 30 35 35 C38 20 60 15 65 30 C75 25 85 35 80 50 C85 60 75 70 65 70 L30 70 C20 70 25 60 25 60" fill="url(#cloudGrad)" filter="url(#shadow)"/>
     <path d="M50 45 L50 65 M50 45 L40 55 M50 45 L60 55" stroke="#10a37f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Helper to get color based on domain
const getDomainColors = (domain?: string) => {
  switch(domain) {
    case 'Executing': return ['#c084fc', '#7e22ce']; // Purple
    case 'Influencing': return ['#fb923c', '#c2410c']; // Orange
    case 'Relationship Building': return ['#60a5fa', '#2563eb']; // Blue
    case 'Strategic Thinking': return ['#4ade80', '#16a34a']; // Green
    default: return ['#94a3b8', '#475569'];
  }
};

export const DomainIcon3D = ({ domain, size = 24 }: { domain?: string, size?: number }) => {
  const [c1, c2] = getDomainColors(domain);
  const id = `d-${domain?.replace(/\s/g, '') || 'def'}`;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      {/* A simple 3D sphere/gem representation */}
      <circle cx="50" cy="50" r="45" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="45" fill="black" fillOpacity="0.1" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
      <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" fillOpacity="0.4" transform="rotate(-45 35 35)"/>
    </svg>
  );
};

// --- New Decorative 3D Shapes ---

export const ShapeSphere3D = ({ size = 100, color = "#10a37f", delay = "0s" }: { size?: number, color?: string, delay?: string }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ animationDelay: delay }}>
        <defs>
            <radialGradient id={`sphereGrad-${color}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
                <stop offset="50%" stopColor={color} />
                <stop offset="100%" stopColor="black" stopOpacity="0.6"/>
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#sphereGrad-${color})`} />
    </svg>
);

export const ShapeCube3D = ({ size = 100, color = "#6366f1", delay = "0s" }: { size?: number, color?: string, delay?: string }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ animationDelay: delay }}>
         <path d="M50 5 L90 25 L50 45 L10 25 Z" fill={color} fillOpacity="0.8" stroke="white" strokeWidth="1"/>
         <path d="M10 25 L50 45 V90 L10 70 Z" fill={color} fillOpacity="0.6" stroke="white" strokeWidth="1"/>
         <path d="M90 25 L50 45 V90 L90 70 Z" fill={color} fillOpacity="0.4" stroke="white" strokeWidth="1"/>
    </svg>
);

export const ShapeTorus3D = ({ size = 100, color = "#facc15", delay = "0s" }: { size?: number, color?: string, delay?: string }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ animationDelay: delay }}>
        <defs>
             <linearGradient id={`torus-${color}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="1"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
             </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="35" stroke={`url(#torus-${color})`} strokeWidth="20" fill="none" />
        <ellipse cx="50" cy="50" rx="35" ry="35" stroke="white" strokeWidth="2" strokeOpacity="0.2" transform="rotate(45 50 50)"/>
    </svg>
);

// --- Missing Icons ---

export const AbstractShape = ({ size = 300, color = "#10a37f" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
      <defs>
          <linearGradient id="absGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
      </defs>
      <path d="M40.2,27.3c23.6-18.7,58.9-15.5,77.7,8.2s15.5,58.9-8.2,77.7s-58.9,15.5-77.7-8.2C-6.7,81.4-3.5,46.1,20.2,27.3z" transform="translate(40 40) scale(0.6)" fill="url(#absGrad)"/>
      <path d="M100 10 L190 50 L150 150 L50 150 L10 50 Z" stroke={color} strokeWidth="1" strokeOpacity="0.1" fill="none" />
      <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1" strokeOpacity="0.1" strokeDasharray="5 5" />
  </svg>
);

export const PrismLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <linearGradient id="prismGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
      </defs>
      <path d="M50 10 L90 80 H10 L50 10 Z" fill="url(#prismGradient)" stroke="#ccfbf1" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M50 10 L90 80 H50 V10 Z" fill="black" fillOpacity="0.2" />
  </svg>
);