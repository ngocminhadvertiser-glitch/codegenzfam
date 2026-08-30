import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

/**
 * High-fidelity Vector Mascot of CODE GenZ (Cute smart journal with heart, code brackets, orbiting ring & smiling bubble)
 */
export const CodeGenzMascot: React.FC<{ size?: number | string; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        {/* Book Cover Gradient */}
        <linearGradient id="bookCoverGrad" x1="40" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Book Border Gradient */}
        <linearGradient id="bookBorderGrad" x1="40" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Heart 3D Gradient */}
        <linearGradient id="mascotHeartGrad" x1="90" y1="65" x2="130" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="45%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Orbit Front Cyan Gradient */}
        <linearGradient id="orbitCyanGrad" x1="20" y1="110" x2="185" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>

        {/* Orbit Back Pink Gradient */}
        <linearGradient id="orbitPinkGrad" x1="20" y1="120" x2="180" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>

        {/* Ring Spine Rings Gradient */}
        <linearGradient id="spineRingsGrad" x1="30" y1="60" x2="70" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Drop shadow */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366F1" floodOpacity="0.3" />
        </filter>
        <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#BE123C" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Orbit Ring (Back part) */}
      <path
        d="M 45 130 C 20 145, 15 158, 30 162 C 55 166, 120 145, 175 100"
        stroke="url(#orbitPinkGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Floating Little Heart Top-Left */}
      <g transform="translate(18, 55) rotate(-15) scale(0.65)" filter="url(#heartShadow)">
        <path
          d="M 20 10 C 20 0, 5 0, 5 15 C 5 28, 20 38, 20 38 C 20 38, 35 28, 35 15 C 35 0, 20 0, 20 10 Z"
          fill="#FB7185"
        />
      </g>

      {/* Sparks Top-Right */}
      <g transform="translate(162, 50)">
        <path d="M 0 0 L 14 -8" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 4 12 L 18 12" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Journal Book Back Shadow & Page Thickness */}
      <g filter="url(#softGlow)">
        {/* Book White Pages Base */}
        <rect
          x="54"
          y="42"
          width="102"
          height="124"
          rx="22"
          transform="rotate(6 105 104)"
          fill="#FFFFFF"
          stroke="#1E1B4B"
          strokeWidth="6"
        />
        {/* Secondary Page Trim */}
        <rect
          x="51"
          y="38"
          width="102"
          height="124"
          rx="22"
          transform="rotate(6 102 100)"
          fill="#E0E7FF"
        />
        {/* Front Book Cover */}
        <rect
          x="46"
          y="32"
          width="104"
          height="126"
          rx="22"
          transform="rotate(6 98 95)"
          fill="url(#bookCoverGrad)"
          stroke="#1E1B4B"
          strokeWidth="6"
        />
      </g>

      {/* Book Spine Rings (Blue Clips) */}
      <g transform="rotate(6 98 95)">
        {/* Ring 1 */}
        <rect x="38" y="52" width="16" height="24" rx="8" fill="url(#spineRingsGrad)" stroke="#1E1B4B" strokeWidth="4" />
        {/* Ring 2 */}
        <rect x="38" y="86" width="16" height="24" rx="8" fill="url(#spineRingsGrad)" stroke="#1E1B4B" strokeWidth="4" />
        {/* Ring 3 */}
        <rect x="38" y="120" width="16" height="24" rx="8" fill="url(#spineRingsGrad)" stroke="#1E1B4B" strokeWidth="4" />
      </g>

      {/* Front Cover Heart */}
      <g transform="translate(108, 92) rotate(6) scale(1.1)" filter="url(#heartShadow)">
        <path
          d="M 0 -10 C 0 -24, -20 -24, -20 -8 C -20 8, 0 20, 0 20 C 0 20, 20 8, 20 -8 C 20 -24, 0 -24, 0 -10 Z"
          fill="url(#mascotHeartGrad)"
        />
      </g>

      {/* Front Cover Code Brackets </> */}
      <g transform="translate(105, 134) rotate(6)" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* < bracket */}
        <path d="M -16 -4 L -24 4 L -16 12" />
        {/* / slash */}
        <path d="M -4 14 L 4 -6" />
        {/* > bracket */}
        <path d="M 16 -4 L 24 4 L 16 12" />
      </g>

      {/* Foreground Orbit Ring (Cyan swoop in front) */}
      <path
        d="M 32 145 C 50 178, 120 180, 168 140 C 190 120, 185 85, 150 78"
        stroke="url(#orbitCyanGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Cheerful Smiling Chat Bubble */}
      <g transform="translate(132, 16)" filter="url(#softGlow)">
        {/* Bubble body */}
        <rect x="0" y="0" width="46" height="34" rx="14" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4.5" />
        {/* Bubble tail */}
        <path d="M 12 30 L 8 42 L 22 32 Z" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="3" strokeLinejoin="round" />
        {/* Fill interior over tail seam */}
        <path d="M 10 26 L 10 33 L 20 28 Z" fill="#FFFFFF" />
        {/* Cute Smiling Face: Eyes & Smile */}
        <path d="M 11 14 C 11 10, 17 10, 17 14" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 29 14 C 29 10, 35 10, 35 14" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 18 20 C 21 24, 25 24, 28 20" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/**
 * Full CODE GenZ Brand Logo (Matching Code.png with exact colors, spherical code 'O', energetic GenZ brush gradient, and sparks)
 */
export const CodeGenzLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const sizeMap = {
    xs: { h: 28, textC: 'text-lg', textG: 'text-xl' },
    sm: { h: 36, textC: 'text-2xl', textG: 'text-2xl' },
    md: { h: 46, textC: 'text-3xl', textG: 'text-3xl' },
    lg: { h: 58, textC: 'text-4xl', textG: 'text-4xl' },
    xl: { h: 72, textC: 'text-5xl', textG: 'text-5xl' },
  };

  const curr = sizeMap[size];

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* CODE Text with stylized 'O' */}
        <div className="flex items-center tracking-tight font-black font-sans text-[#152C70]">
          {/* C */}
          <span className={`${curr.textC} font-black leading-none`}>C</span>

          {/* Spherical Glowing Gradient 'O' with white </> inside */}
          <div className="relative inline-flex items-center justify-center shrink-0 mx-0.5 shadow-sm rounded-full overflow-hidden"
            style={{
              width: size === 'xs' ? 22 : size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 44 : 54,
              height: size === 'xs' ? 22 : size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 44 : 54,
              background: 'linear-gradient(135deg, #00D2FF 0%, #3B82F6 40%, #A855F7 70%, #EC4899 100%)',
            }}
          >
            <span className="text-white font-mono font-black tracking-tighter"
              style={{
                fontSize: size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 15 : size === 'lg' ? 18 : 22,
                transform: 'scale(1.05)',
              }}
            >
              &lt;/&gt;
            </span>
          </div>

          {/* D */}
          <span className={`${curr.textC} font-black leading-none`}>D</span>

          {/* E */}
          <span className={`${curr.textC} font-black leading-none`}>E</span>
        </div>

        {/* GenZ Energetic Brush Script with Pink/Purple/Cyan Gradient & Top Sparks */}
        <div className="relative inline-flex items-center pl-0.5">
          <span
            className={`${curr.textG} font-black tracking-normal leading-none font-sans italic`}
            style={{
              background: 'linear-gradient(90deg, #7C3AED 0%, #C026D3 35%, #EC4899 70%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0px 1px 1px rgba(124, 58, 237, 0.2))',
              transform: 'skewX(-6deg)',
            }}
          >
            GenZ
          </span>

          {/* Playful Top Sparks (Yellow, Cyan, Hot Pink) */}
          <div className="absolute -top-2 -right-3 flex items-center gap-0.5 pointer-events-none">
            <span className="w-1.5 h-2.5 bg-[#FBBF24] rounded-full rotate-12 inline-block"></span>
            <span className="w-1.5 h-3 bg-[#06B6D4] rounded-full rotate-45 inline-block"></span>
            <span className="w-2 h-1.5 bg-[#EC4899] rounded-full -rotate-12 inline-block"></span>
          </div>
        </div>
      </div>

      {showTagline && (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6366F1] mt-0.5">
          <span>Connect</span>
          <span className="text-[#EC4899]">•</span>
          <span>Open</span>
          <span className="text-[#06B6D4]">•</span>
          <span>Develop</span>
          <span className="text-[#F59E0B]">•</span>
          <span>Empathy</span>
        </div>
      )}
    </div>
  );
};
