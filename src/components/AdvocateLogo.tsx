import React from 'react';

export type AdvocateLogoVariant = 'official' | 'royal' | 'bands' | 'court' | 'tricolor' | 'auto';

interface AdvocateLogoProps {
  className?: string;
  size?: number;
  variant?: AdvocateLogoVariant;
  customSrc?: string;
  alt?: string;
}

export const AdvocateLogo: React.FC<AdvocateLogoProps> = ({
  className = 'w-10 h-10',
  size,
  variant = 'bands',
  customSrc,
  alt = 'Bar Council Advocate Band Emblem'
}) => {
  // If a custom image is provided or stored, render it directly
  const activeCustomSrc = customSrc || (typeof window !== 'undefined' ? localStorage.getItem('nyaay_custom_logo_data') : null);
  const activeVariant = (typeof window !== 'undefined' ? (localStorage.getItem('nyaay_icon_preset') as AdvocateLogoVariant) : null) || 'bands';

  if (activeCustomSrc && (variant === 'auto' || activeVariant === 'auto')) {
    return (
      <img
        src={activeCustomSrc}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain rounded-full shadow-md ${className}`}
      />
    );
  }

  const chosenVariant = variant === 'auto' ? (activeVariant || 'bands') : variant;

  // 0. Authentic Nyaay Sahayogi Supreme 3D Gold Emblem (Twin Lions, Laurel Wreath, Scales & 'यतो धर्मस्ततो जयः')
  if (chosenVariant === 'official') {
    return (
      <img
        src="/assets/aistudio/IMG-20261015-WA5879_d8e26e79.jpg"
        alt={alt}
        width={size}
        height={size}
        className={`object-cover rounded-full shadow-md ${className}`}
      />
    );
  }

  // 1. Classic Advocate White Neckbands (Bar Council of India Heritage)
  if (chosenVariant === 'bands') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="Advocate Bar Association Neckbands Seal"
      >
        <circle cx="256" cy="256" r="250" fill="#090E1F" stroke="#D4AF37" strokeWidth="8" />
        <circle cx="256" cy="256" r="234" fill="none" stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />
        <circle cx="256" cy="256" r="222" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 6" />

        {/* Advocate Wing Collar */}
        <path
          d="M 256 138 
             L 164 88 
             L 138 198 
             L 208 166 
             L 256 166 
             L 304 166 
             L 374 198 
             L 348 88 
             Z"
          fill="#FFFFFF"
        />

        {/* Left Band */}
        <polygon points="208,166 248,166 218,422 142,422" fill="#FFFFFF" />
        {/* Right Band */}
        <polygon points="264,166 304,166 370,422 294,422" fill="#FFFFFF" />

        {/* Outer Top Ring Text */}
        <path id="bandsTopArc" d="M 90,256 A 166,166 0 0,1 422,256" fill="none" />
        <text fill="#F59E0B" fontSize="19" fontFamily="serif" fontWeight="bold" letterSpacing="3">
          <textPath href="#bandsTopArc" startOffset="50%" textAnchor="middle">
            ADVOCATE BAR ASSOCIATION
          </textPath>
        </text>
      </svg>
    );
  }

  // 2. High Court & Colonnade Pillar of Justice
  if (chosenVariant === 'court') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="High Court & Judicial Pillars Emblem"
      >
        <defs>
          <linearGradient id="courtGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="50%" stopColor="#D49A24" />
            <stop offset="100%" stopColor="#8C590E" />
          </linearGradient>
        </defs>
        <circle cx="256" cy="256" r="250" fill="#0A1128" stroke="url(#courtGold)" strokeWidth="10" />
        <circle cx="256" cy="256" r="232" fill="none" stroke="url(#courtGold)" strokeWidth="3" strokeDasharray="8 6" />

        {/* Court Pediment (Triangle Top) */}
        <polygon points="256,100 130,165 382,165" fill="url(#courtGold)" />
        <rect x="140" y="165" width="232" height="14" fill="#FFF2A3" rx="2" />

        {/* 4 Pillars */}
        <rect x="156" y="185" width="26" height="150" fill="url(#courtGold)" rx="3" />
        <rect x="212" y="185" width="26" height="150" fill="url(#courtGold)" rx="3" />
        <rect x="274" y="185" width="26" height="150" fill="url(#courtGold)" rx="3" />
        <rect x="330" y="185" width="26" height="150" fill="url(#courtGold)" rx="3" />

        {/* Center Golden Scales Overlaid */}
        <circle cx="256" cy="230" r="14" fill="#0A1128" stroke="url(#courtGold)" strokeWidth="3" />
        <path d="M 180,240 Q 256,234 332,240" stroke="#FFF2A3" strokeWidth="5" fill="none" strokeLinecap="round" />
        <line x1="180" y1="240" x2="160" y2="280" stroke="#FFF2A3" strokeWidth="2" />
        <line x1="180" y1="240" x2="200" y2="280" stroke="#FFF2A3" strokeWidth="2" />
        <path d="M 152,280 C 152,298 208,298 208,280 Z" fill="url(#courtGold)" />

        <line x1="332" y1="240" x2="312" y2="280" stroke="#FFF2A3" strokeWidth="2" />
        <line x1="332" y1="240" x2="352" y2="280" stroke="#FFF2A3" strokeWidth="2" />
        <path d="M 304,280 C 304,298 360,298 360,280 Z" fill="url(#courtGold)" />

        {/* Base Steps */}
        <rect x="120" y="340" width="272" height="18" fill="url(#courtGold)" rx="3" />
        <rect x="100" y="362" width="312" height="24" fill="#FFF2A3" rx="4" />
        <text x="256" y="379" textAnchor="middle" fontSize="13" fontFamily="serif" fontWeight="900" fill="#0A1128" letterSpacing="2">
          JUSTITIA OMNIBUS
        </text>
      </svg>
    );
  }

  // 3. Tricolor & Satyameva Jayate Supreme Shield
  if (chosenVariant === 'tricolor') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="Tricolor Judicial Shield Emblem"
      >
        <defs>
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#E67300" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#138808" />
            <stop offset="100%" stopColor="#0B5505" />
          </linearGradient>
          <linearGradient id="triGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#CC8800" />
          </linearGradient>
        </defs>
        <circle cx="256" cy="256" r="250" fill="#0A1128" stroke="url(#triGold)" strokeWidth="10" />

        {/* Saffron Top Sector */}
        <path d="M 50,195 A 220,220 0 0,1 462,195 L 442,235 L 70,235 Z" fill="url(#saffronGrad)" opacity="0.9" />
        {/* White Middle Band */}
        <rect x="68" y="235" width="376" height="45" fill="#FFFFFF" />
        {/* Green Bottom Sector */}
        <path d="M 70,280 L 442,280 L 412,320 A 220,220 0 0,1 100,320 Z" fill="url(#greenGrad)" opacity="0.9" />

        {/* 24-spoke Ashoka Navy Chakra */}
        <circle cx="256" cy="257" r="22" fill="#FFFFFF" stroke="#000080" strokeWidth="2.5" />
        <circle cx="256" cy="257" r="4" fill="#000080" />

        {/* Golden Central Scales of Justice Overlay */}
        <path d="M 180,180 Q 256,170 332,180" stroke="url(#triGold)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="252" y="150" width="8" height="150" fill="url(#triGold)" rx="2" />
        <circle cx="256" cy="142" r="8" fill="url(#triGold)" />
        
        {/* Left and Right Pans */}
        <path d="M 155,215 C 155,232 205,232 205,215 Z" fill="url(#triGold)" />
        <path d="M 307,215 C 307,232 357,232 357,215 Z" fill="url(#triGold)" />

        {/* Plinth */}
        <rect x="180" y="340" width="152" height="20" fill="url(#triGold)" rx="4" />
        <text x="256" y="355" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="900" fill="#0A1128" letterSpacing="1.5">
          सत्यमेव जयते
        </text>
      </svg>
    );
  }

  // 4. Default Master Royal Gold Judicial Emblem (Scales + Ashoka Chakra + Law Codex + Advocate Bands)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Nyaay Sahayogi Royal Judicial Seal"
    >
      <defs>
        <linearGradient id="rGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7CD" />
          <stop offset="25%" stopColor="#F5BD47" />
          <stop offset="50%" stopColor="#D49A24" />
          <stop offset="75%" stopColor="#9A690B" />
          <stop offset="100%" stopColor="#FDE882" />
        </linearGradient>

        <linearGradient id="rGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF2" />
          <stop offset="35%" stopColor="#FCD34D" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <radialGradient id="rBg" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#1E2A4A" />
          <stop offset="55%" stopColor="#090E1F" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <path id="rArcTop" d="M 72,256 A 184,184 0 0,1 440,256" fill="none" />
        <path id="rArcBottom" d="M 440,256 A 184,184 0 0,1 72,256" fill="none" />
      </defs>

      {/* Rounded squircle background */}
      <rect width="512" height="512" rx="112" fill="url(#rBg)" />
      
      {/* Outer Luxury Rim */}
      <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="url(#rGold)" strokeWidth="7" opacity="0.95" />
      <rect x="26" y="26" width="460" height="460" rx="90" fill="none" stroke="#F5BD47" strokeWidth="1.8" strokeDasharray="7,5" opacity="0.65" />

      {/* Inner Shield */}
      <circle cx="256" cy="256" r="218" fill="#0A1128" stroke="url(#rGold)" strokeWidth="8" />
      <circle cx="256" cy="256" r="202" fill="none" stroke="url(#rGold)" strokeWidth="2.5" strokeDasharray="7,5" opacity="0.85" />
      <circle cx="256" cy="256" r="150" fill="#050B1A" stroke="url(#rGold)" strokeWidth="4.5" />

      {/* Inscription */}
      <text fill="url(#rGoldLight)" fontSize="22" fontFamily="'Cinzel', Georgia, serif" fontWeight="900" letterSpacing="5">
        <textPath href="#rArcTop" startOffset="50%" textAnchor="middle">
          NYAAY SAHAYOGI
        </textPath>
      </text>

      <text fill="#F1F5F9" fontSize="16.5" fontFamily="'Cinzel', Georgia, serif" fontWeight="700" letterSpacing="3.5">
        <textPath href="#rArcBottom" startOffset="50%" textAnchor="middle">
          ADVOCATE &amp; BAR PORTAL
        </textPath>
      </text>

      {/* Stars */}
      <polygon points="66,256 70,263 78,263 72,268 74,276 66,271 58,276 60,268 54,263 62,263" fill="url(#rGoldLight)" />
      <polygon points="446,256 450,263 458,263 452,268 454,276 446,271 438,276 440,268 434,263 442,263" fill="url(#rGoldLight)" />

      {/* Central Crest */}
      <g transform="translate(256, 252)">
        {/* Central Spire */}
        <rect x="-5" y="-76" width="10" height="120" fill="url(#rGold)" rx="3" />
        <circle cx="0" cy="-88" r="9.5" fill="url(#rGoldLight)" />
        <polygon points="-15,-76 15,-76 10,-85 -10,-85" fill="url(#rGold)" />

        {/* Ashoka Chakra */}
        <circle cx="0" cy="-38" r="16" fill="#0A1128" stroke="url(#rGoldLight)" strokeWidth="2.5" />
        <circle cx="0" cy="-38" r="3.5" fill="url(#rGoldLight)" />
        <path d="M 0,-54 L 0,-22 M -16,-38 L 16,-38 M -11.3,-49.3 L 11.3,-26.7 M -11.3,-26.7 L 11.3,-49.3" stroke="url(#rGoldLight)" strokeWidth="1.3" opacity="0.9" />

        {/* Balance Beam */}
        <path d="M -94 -42 Q 0 -47 94 -42" stroke="url(#rGoldLight)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <circle cx="-94" cy="-42" r="5.5" fill="url(#rGoldLight)" />
        <circle cx="94" cy="-42" r="5.5" fill="url(#rGoldLight)" />

        {/* Pans */}
        <g>
          <line x1="-94" y1="-42" x2="-116" y2="10" stroke="url(#rGold)" strokeWidth="2" />
          <line x1="-94" y1="-42" x2="-72" y2="10" stroke="url(#rGold)" strokeWidth="2" />
          <path d="M -124,10 C -124,30 -64,30 -64,10 Z" fill="url(#rGoldLight)" />
        </g>
        <g>
          <line x1="94" y1="-42" x2="72" y2="10" stroke="url(#rGold)" strokeWidth="2" />
          <line x1="94" y1="-42" x2="116" y2="10" stroke="url(#rGold)" strokeWidth="2" />
          <path d="M 64,10 C 64,30 124,30 124,10 Z" fill="url(#rGoldLight)" />
        </g>

        {/* Advocate White Bands */}
        <g transform="translate(0, -6)">
          <polygon points="0,-10 -26,-2 -22,26 0,22 22,26 26,-2" fill="#020617" stroke="url(#rGold)" strokeWidth="1.5" />
          <path d="M 0,-8 L -14,-16 L -20,-3 L -11,-1 L 0,0 L 11,-1 L 20,-3 L 14,-16 Z" fill="#FFFFFF" />
          <polygon points="-9,-1 -2,-1 -5,34 -15,34" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <polygon points="2,-1 9,-1 15,34 5,34" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
        </g>

        {/* Law Codex Plinth */}
        <g transform="translate(0, 36)">
          <path d="M -48,0 C -24,4 -5,8 0,4 C 5,8 24,4 48,0 L 52,18 C 26,22 6,24 0,20 C -6,24 -26,22 -52,18 Z" fill="#F8FAFC" stroke="url(#rGold)" strokeWidth="1.5" />
          <line x1="0" y1="4" x2="0" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="-56" y="18" width="112" height="10" rx="3" fill="url(#rGold)" />
          <rect x="-68" y="28" width="136" height="14" rx="4" fill="url(#rGoldLight)" />
          <text x="0" y="38" textAnchor="middle" fontSize="8.5" fontFamily="serif" fontWeight="900" fill="#0F172A" letterSpacing="1.2">
            SATYAMEVA JAYATE
          </text>
        </g>
      </g>
    </svg>
  );
};
