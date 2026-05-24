import React, { useState } from 'react';

interface DishImageProps {
  imageUrl?: string;
  category: string;
  name: string;
  style?: React.CSSProperties;
}

export const DishImage: React.FC<DishImageProps> = ({ imageUrl, category, name, style }) => {
  const [hasError, setHasError] = useState(false);
  const [hasFallbackError, setHasFallbackError] = useState(false);

  // High-definition photographic fallbacks curated from premium Unsplash food assets
  const photoFallbacks: Record<string, string> = {
    jeon: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?auto=format&fit=crop&w=600&q=80',
    jeok: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    namul: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tang: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80',
    fruit: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80'
  };

  const isDefault = !imageUrl || ['jeon', 'jeok', 'namul', 'tang', 'fruit'].includes(imageUrl);

  // Select primary image target: either custom URL or matching photographic fallback
  const targetUrl = isDefault ? (photoFallbacks[category] || photoFallbacks.jeon) : imageUrl;

  // Render the vector SVGs ONLY in the absolute worst-case scenario (e.g. offline, completely failed image CDN loading)
  if (hasFallbackError) {
    switch (category) {
      case 'jeon':
        return (
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', ...style }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="basket-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E6C594" />
                <stop offset="70%" stopColor="#CDA36B" />
                <stop offset="100%" stopColor="#A27843" />
              </radialGradient>
              <linearGradient id="jeon-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="60%" stopColor="#F5C024" />
                <stop offset="100%" stopColor="#D99E0F" />
              </linearGradient>
              <linearGradient id="jeon-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFEC99" />
                <stop offset="70%" stopColor="#E9B646" />
                <stop offset="100%" stopColor="#C68A1B" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="200" height="150" fill="#FAF8F5" rx="12" />
            <ellipse cx="100" cy="80" rx="75" ry="50" fill="url(#basket-grad)" filter="url(#shadow)" />
            <ellipse cx="100" cy="80" rx="68" ry="43" fill="none" stroke="#875E29" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <ellipse cx="100" cy="80" rx="58" ry="34" fill="none" stroke="#875E29" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <ellipse cx="100" cy="80" rx="45" ry="24" fill="none" stroke="#875E29" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
            <ellipse cx="100" cy="80" rx="74" ry="49" fill="none" stroke="#704D1E" strokeWidth="2.5" />
            <ellipse cx="100" cy="80" rx="72" ry="47" fill="none" stroke="#B88A4F" strokeWidth="1" />
            <g transform="translate(60, 75)" filter="url(#shadow)">
              <ellipse cx="0" cy="0" rx="22" ry="16" fill="url(#jeon-grad-1)" />
              <ellipse cx="0" cy="0" rx="24" ry="17" fill="none" stroke="#E5A91E" strokeWidth="1.5" strokeDasharray="5 12" />
              <path d="M-8,-4 Q-12,-8 -6,-10 Q-3,-8 -6,-4 Q-6,-2 -1,0 Q3,2 0,6 Q-3,5 -4,2 Z" fill="#2B6B38" />
              <circle cx="8" cy="-2" r="4" fill="#C0392B" />
              <circle cx="8" cy="-2" r="1.5" fill="#FFE066" />
            </g>
            <g transform="translate(138, 80)" filter="url(#shadow)">
              <ellipse cx="0" cy="0" rx="20" ry="15" fill="url(#jeon-grad-2)" />
              <ellipse cx="0" cy="0" rx="22" ry="16" fill="none" stroke="#D99E10" strokeWidth="1" strokeDasharray="6 10" />
              <circle cx="-5" cy="2" r="3.5" fill="#27AE60" />
              <circle cx="-5" cy="2" r="1.2" fill="#E8F8F5" />
              <path d="M4,-4 Q9,-8 10,-3 Q7,-1 4,-4" fill="#E74C3C" />
            </g>
            <g transform="translate(100, 88)" filter="url(#shadow)">
              <rect x="-24" y="-16" width="48" height="32" rx="4" fill="url(#jeon-grad-1)" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="#E67E22" strokeWidth="1.5" />
              <rect x="-20" y="-12" width="8" height="24" fill="#2B6B38" rx="1" />
              <rect x="-11" y="-12" width="7" height="24" fill="#F39C12" rx="1" />
              <rect x="-3" y="-12" width="7" height="24" fill="#E74C3C" rx="1" />
              <rect x="5" y="-12" width="7" height="24" fill="#FAF0D7" rx="1" />
              <rect x="13" y="-12" width="8" height="24" fill="#C0392B" rx="1" />
              <rect x="-22" y="-14" width="44" height="28" fill="rgba(255, 236, 153, 0.35)" rx="3" stroke="#F1C40F" strokeWidth="0.8" />
            </g>
          </svg>
        );

      case 'jeok':
        return (
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', ...style }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="plate-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3A3D40" />
                <stop offset="100%" stopColor="#1E2022" />
              </linearGradient>
              <linearGradient id="beef-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6E2B1F" />
                <stop offset="50%" stopColor="#541B12" />
                <stop offset="100%" stopColor="#3C1009" />
              </linearGradient>
              <linearGradient id="fish-grad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FFF2D6" />
                <stop offset="60%" stopColor="#E5C384" />
                <stop offset="100%" stopColor="#B38E46" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="200" height="150" fill="#FAF8F5" rx="12" />
            <rect x="25" y="40" width="150" height="80" rx="16" fill="url(#plate-grad)" filter="url(#shadow)" stroke="#1A1C1D" strokeWidth="2" />
            <rect x="33" y="47" width="134" height="66" rx="10" fill="none" stroke="#525659" strokeWidth="1" opacity="0.4" />
            <g transform="translate(50, 60)" filter="url(#shadow)">
              <rect x="0" y="0" width="100" height="24" rx="4" fill="url(#beef-grad)" />
              <line x1="15" y1="0" x2="25" y2="24" stroke="#220905" strokeWidth="2" opacity="0.7" />
              <line x1="35" y1="0" x2="45" y2="24" stroke="#220905" strokeWidth="2" opacity="0.7" />
              <line x1="55" y1="0" x2="65" y2="24" stroke="#220905" strokeWidth="2" opacity="0.7" />
              <line x1="75" y1="0" x2="85" y2="24" stroke="#220905" strokeWidth="2" opacity="0.7" />
              <path d="M 5,4 Q 50,8 95,4" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
              <circle cx="30" cy="12" r="1.5" fill="#2ECC71" />
              <circle cx="33" cy="10" r="1" fill="#FFFFFF" />
              <circle cx="50" cy="8" r="1.5" fill="#E67E22" />
              <circle cx="68" cy="15" r="1.5" fill="#2ECC71" />
              <circle cx="71" cy="13" r="1" fill="#FFFFFF" />
            </g>
            <g transform="translate(42, 80)" filter="url(#shadow)">
              <path d="M 10,12 C 30,0 90,0 110,12 C 100,24 30,24 10,12" fill="url(#fish-grad)" />
              <path d="M 10,12 L -6,3 L -2,12 L -6,21 Z" fill="#B38E46" stroke="#947333" strokeWidth="1" />
              <path d="M 50,4 Q 60,-4 70,2" stroke="#947333" strokeWidth="1.5" fill="none" />
              <path d="M 55,20 Q 62,26 70,22" stroke="#947333" strokeWidth="1.5" fill="none" />
              <path d="M 96,6 Q 92,12 96,18" stroke="#8A6724" strokeWidth="1.8" fill="none" />
              <circle cx="102" cy="10" r="2.5" fill="#111" />
              <circle cx="103" cy="9" r="0.8" fill="#FFF" />
              <line x1="40" y1="7" x2="48" y2="17" stroke="#806229" strokeWidth="2" opacity="0.6" />
              <line x1="55" y1="7" x2="63" y2="17" stroke="#806229" strokeWidth="2" opacity="0.6" />
              <line x1="70" y1="7" x2="78" y2="17" stroke="#806229" strokeWidth="2" opacity="0.6" />
              <circle cx="60" cy="12" r="1.2" fill="#FAF0D7" />
              <circle cx="64" cy="11" r="1.2" fill="#FAF0D7" />
              <circle cx="48" cy="13" r="1.2" fill="#FAF0D7" />
            </g>
          </svg>
        );

      case 'namul':
        return (
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', ...style }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ceramic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F5F3EE" />
                <stop offset="100%" stopColor="#E3DFD5" />
              </linearGradient>
              <linearGradient id="spinach-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <linearGradient id="doraji-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="100%" stopColor="#ECE5D3" />
              </linearGradient>
              <linearGradient id="gosari-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#795548" />
                <stop offset="100%" stopColor="#4E342E" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="200" height="150" fill="#FAF8F5" rx="12" />
            <circle cx="100" cy="80" r="58" fill="url(#ceramic-grad)" filter="url(#shadow)" stroke="#D4CFBF" strokeWidth="1.5" />
            <circle cx="100" cy="80" r="48" fill="none" stroke="#ECE9DE" strokeWidth="1.2" />
            <g transform="translate(80, 68)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="18" fill="url(#spinach-grad)" />
              <path d="M-10,-5 Q-5,-12 5,-8" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
              <path d="M-12,5 Q0,-8 10,2" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
              <path d="M-2,12 Q8,4 12,-4" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
              <circle cx="-3" cy="-4" r="1" fill="#FFEAA7" />
              <circle cx="5" cy="5" r="1" fill="#FFEAA7" />
            </g>
            <g transform="translate(122, 74)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="18" fill="url(#gosari-grad)" />
              <path d="M-12,-4 Q-6,8 8,2" stroke="#8D6E63" strokeWidth="1.5" fill="none" />
              <path d="M-8,-10 Q4,2 10,-8" stroke="#8D6E63" strokeWidth="1.5" fill="none" />
              <path d="M-4,11 Q8,-4 5,-12" stroke="#8D6E63" strokeWidth="1.5" fill="none" />
              <circle cx="2" cy="-2" r="1" fill="#FFEAA7" />
              <circle cx="-5" cy="4" r="1" fill="#FFEAA7" />
            </g>
            <g transform="translate(100, 94)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="19" fill="url(#doraji-grad)" stroke="#DFD7C2" strokeWidth="0.5" />
              <path d="M-13,-3 Q-3,-9 10,-5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
              <path d="M-11,5 Q0,-5 12,0" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
              <path d="M-5,11 Q5,1 7,-10" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
              <circle cx="0" cy="2" r="1" fill="#E67E22" opacity="0.8" />
              <circle cx="4" cy="-3" r="1" fill="#FFEAA7" />
            </g>
            <path d="M 74,60 C 90,52 110,54 126,62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'tang':
        return (
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', ...style }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFECA9" />
                <stop offset="40%" stopColor="#DFB76C" />
                <stop offset="80%" stopColor="#B68E43" />
                <stop offset="100%" stopColor="#8A6724" />
              </linearGradient>
              <linearGradient id="soup-grad" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F5EFE0" />
                <stop offset="80%" stopColor="#E2D4BE" />
                <stop offset="100%" stopColor="#C4B094" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="200" height="150" fill="#FAF8F5" rx="12" />
            <path d="M 85,25 Q 90,10 85,0" stroke="#EAE5DC" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M 100,28 Q 105,12 100,2" stroke="#EAE5DC" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 115,26 Q 110,11 115,1" stroke="#EAE5DC" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
            <g filter="url(#shadow)" transform="translate(100, 85)">
              <path d="M -54,-15 C -54,35 54,35 54,-15 Z" fill="url(#brass-grad)" />
              <rect x="-24" y="23" width="48" height="8" fill="#8A6724" rx="2" />
              <rect x="-22" y="23" width="44" height="2" fill="#DFB76C" />
              <ellipse cx="0" cy="-15" rx="54" ry="16" fill="url(#brass-grad)" stroke="#8A6724" strokeWidth="1" />
              <ellipse cx="0" cy="-15" rx="49" ry="13" fill="url(#soup-grad)" />
              <rect x="-28" y="-22" width="16" height="10" transform="rotate(-12, -20, -17)" fill="#FFF" stroke="#E0D7C5" strokeWidth="0.8" rx="1" opacity="0.9" />
              <rect x="10" y="-24" width="20" height="12" transform="rotate(8, 20, -18)" fill="#FDFEFE" stroke="#ECE9DE" strokeWidth="0.8" rx="1.5" />
              <line x1="14" y1="-21" x2="26" y2="-19" stroke="#EBE7DB" strokeWidth="1" />
              <line x1="13" y1="-18" x2="25" y2="-16" stroke="#EBE7DB" strokeWidth="1" />
              <path d="M-8,-23 Q-3,-25 2,-21 Q4,-16 -1,-13 Q-8,-14 -8,-23" fill="#582319" stroke="#3D120B" strokeWidth="0.5" />
              <path d="M-6,-15 Q-1,-18 3,-14 Q4,-10 0,-7 Q-6,-8 -6,-15" fill="#4B1E15" stroke="#3D120B" strokeWidth="0.5" />
              <circle cx="-25" cy="-12" r="2" fill="none" stroke="#F1C40F" strokeWidth="0.8" opacity="0.6" />
              <circle cx="15" cy="-10" r="1.5" fill="none" stroke="#F1C40F" strokeWidth="0.8" opacity="0.6" />
              <circle cx="3" cy="-15" r="3" fill="none" stroke="#F1C40F" strokeWidth="0.8" opacity="0.5" />
            </g>
          </svg>
        );

      case 'fruit':
        return (
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', ...style }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wood-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8E4A23" />
                <stop offset="50%" stopColor="#6E3311" />
                <stop offset="100%" stopColor="#4E1F05" />
              </linearGradient>
              <linearGradient id="apple-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EC4C3C" />
                <stop offset="60%" stopColor="#C0392B" />
                <stop offset="100%" stopColor="#87170C" />
              </linearGradient>
              <linearGradient id="pear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5D77F" />
                <stop offset="60%" stopColor="#E1BA54" />
                <stop offset="100%" stopColor="#AD8D30" />
              </linearGradient>
              <linearGradient id="yakgwa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D38C3B" />
                <stop offset="100%" stopColor="#965612" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="200" height="150" fill="#FAF8F5" rx="12" />
            <g filter="url(#shadow)" transform="translate(100, 95)">
              <path d="M-36,5 L-24,24 L24,24 L36,5 Z" fill="#6E3311" stroke="#4E1F05" strokeWidth="1" />
              <rect x="-14" y="14" width="28" height="10" fill="#4E1F05" />
              <ellipse cx="0" cy="5" rx="66" ry="14" fill="url(#wood-grad)" stroke="#4E1F05" strokeWidth="2" />
              <ellipse cx="0" cy="5" rx="60" ry="10" fill="none" stroke="#A96438" strokeWidth="1" opacity="0.5" />
            </g>
            <g transform="translate(125, 76)" filter="url(#shadow)">
              <path d="M-18,6 C-22,-14 -5,-26 0,-26 C5,-26 22,-14 18,6 C14,18 -14,18 -18,6" fill="url(#pear-grad)" />
              <ellipse cx="0" cy="-24" rx="9" ry="2.5" fill="#FAF3D3" stroke="#D3B151" strokeWidth="0.8" />
              <circle cx="0" cy="-24" r="1" fill="#B38E46" />
              <circle cx="-8" cy="-5" r="0.6" fill="#C69E35" opacity="0.7" />
              <circle cx="8" cy="-8" r="0.6" fill="#C69E35" opacity="0.7" />
              <circle cx="-4" cy="5" r="0.6" fill="#C69E35" opacity="0.7" />
            </g>
            <g transform="translate(75, 78)" filter="url(#shadow)">
              <path d="M-18,4 C-20,-16 -4,-24 0,-24 C4,-24 20,-16 18,4 C15,16 -15,16 -18,4" fill="url(#apple-grad)" />
              <ellipse cx="0" cy="-22" rx="9" ry="2.5" fill="#FAF5E3" stroke="#C0392B" strokeWidth="0.8" />
              <circle cx="0" cy="-22" r="1.2" fill="#5D261E" />
              <path d="M -12,-8 Q -14,4 -8,10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g transform="translate(100, 94)" filter="url(#shadow)">
              <path d="M 0,-10 
                C -3,-10 -5,-7 -6,-8 
                C -7,-9 -10,-7 -9,-5 
                C -10,-4 -7,-2 -8,0 
                C -9,1 -7,4 -5,3 
                C -4,4 -3,7 0,6 
                C 3,7 4,4 5,3 
                C 7,4 9,1 8,0 
                C 7,-2 10,-4 9,-5 
                C 10,-7 7,-9 6,-8 
                C 5,-7 3,-10 0,-10 Z" fill="url(#yakgwa-grad)" stroke="#733B05" strokeWidth="1" />
              <circle cx="0" cy="-2" r="2.5" fill="none" stroke="#FAF0D7" strokeWidth="1.2" opacity="0.7" />
              <path d="M-4,-4 Q0,-1 4,-4" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" fill="none" />
            </g>
          </svg>
        );

      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FAF8F5',
              color: 'var(--color-primary)',
              fontWeight: 800,
              fontSize: '1rem',
              ...style
            }}
          >
            {name}
          </div>
        );
    }
  }

  // Load Photographic Target Image (from custom URL or high-quality photographic default matching category)
  // If this photographic image fails to load, fall back to the vector SVG by setting hasFallbackError = true.
  return (
    <img
      src={targetUrl}
      alt={name}
      onError={() => {
        if (!isDefault && !hasError) {
          // Custom URL failed, fall back to default photographic category fallback
          setHasError(true);
        } else {
          // Both custom URL and photographic fallback failed (offline or CDN blocked), fall back to beautiful vector SVGs
          setHasFallbackError(true);
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style
      }}
    />
  );
};
