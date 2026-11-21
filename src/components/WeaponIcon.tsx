import React from 'react';

interface WeaponIconProps {
  weaponId: string;
  className?: string;
}

export const WeaponIcon: React.FC<WeaponIconProps> = ({ weaponId, className = 'w-6 h-6' }) => {
  switch (weaponId) {
    case 'fist':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M8 14V10a2 2 0 014 0v2m0-3a2 2 0 014 0v3m0-2a2 2 0 014 0v3m0-1a2 2 0 014 0v6c0 5-3.5 8-8 8h-2c-4.5 0-8-3-8-7.5V15a2 2 0 012-2h2z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'studded_gloves':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="6" y="10" width="18" height="15" rx="5" stroke="currentColor" strokeWidth="2.2" />
          <path d="M9 25v3h12v-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="10" cy="14" r="1.5" fill="#ef4444" />
          <circle cx="15" cy="14" r="1.5" fill="#ef4444" />
          <circle cx="20" cy="14" r="1.5" fill="#ef4444" />
        </svg>
      );
    case 'brass_knuckles':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="8" cy="13" r="3" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="14" cy="12" r="3" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="20" cy="12" r="3" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="25" cy="14" r="2.7" stroke="currentColor" strokeWidth="2.2" />
          <path d="M7 18c2 4 6 6 10 6s7-2 8-5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'barbed_bat':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 26L11 21L23 6l3 3L11 21"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M17 11l4 4M14 14l4 4M20 8l3 3" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'tactical_knife':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 25l5-5m0 0l12-13c1 4-1 9-6 14l-6-1z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 18l4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="23" cy="9" r="1.4" fill="#ef4444" />
        </svg>
      );
    case 'fire_axe':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M7 26L23 10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M17 6c4 0 8 3 9 8l-7 2-3-5 1-5z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chainsaw':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="13" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="2.2" />
          <path d="M15 16h11a2 2 0 010 4H15" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M7 13v-3h5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 14v2M22 14v2M26 14v2" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'shotgun':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M4 21l6-5h17v-3H11L4 17v4z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M14 16h7v2h-7" stroke="currentColor" strokeWidth="2" />
          <circle cx="28" cy="13" r="1.6" fill="#f97316" />
        </svg>
      );
    case 'plasma_cannon':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2.2" />
          <path d="M22 14h6v4h-6" stroke="#38bdf8" strokeWidth="2.2" />
          <circle cx="13" cy="16" r="2.5" fill="#38bdf8" />
        </svg>
      );
    case 'napalm_flamer':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="14" width="13" height="8" rx="2" stroke="currentColor" strokeWidth="2.2" />
          <path d="M17 17h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M24 17c2-4 5-3 4 1 2 0 1 4-2 4s-3-3-2-5z"
            fill="#fb923c"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'mono_katana':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M5 27l5-5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M9 19l4 4" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M11 21L27 5c-1 4-4 9-12 16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'diamond_ripper':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.2" strokeDasharray="3 2" />
          <circle cx="16" cy="16" r="3.5" fill="#e879f9" />
          <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'gauss_railgun':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M4 13h22M4 19h22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7 13v6M13 13v6M19 13v6" stroke="#22d3ee" strokeWidth="2" />
          <path d="M26 16h3" stroke="#22d3ee" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'boxer_wraps':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M8 14V11a2 2 0 014 0v1m0-3a2 2 0 014 0v3m0-2a2 2 0 014 0v3m0-1a2 2 0 014 0v5c0 4.5-3 7.5-7.5 7.5H13c-4 0-7-3-7-7v-3.5a2 2 0 012-2h2z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 18l14-2M9 22l12-1" stroke="#e4e4e7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'broken_bottle':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 26l5-5M10 22l4-4 1-4 4-4 3-5-4 1-2 4-4 1-4 5 2 6z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 12l5-4M19 16l4-3" stroke="#4ade80" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'steel_crowbar':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 26L20 11c2-2.2 5.5-2.5 7 0l-2.5 2c-1-1-2.5-0.8-3.5 0.3L9 27"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M5 24l3 4" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'spiked_machete':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 26l5-5M11 21L24 5c2.5 2.5 2 8-4 13l-9 3z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 11l3-3M19 14l3-2" stroke="#a3e635" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'taser_baton':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M7 25L21 11" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M21 11l4-4" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M17 6l2 3-3 1 2 3M24 14l3-1-2 3 3 1" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sledgehammer':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M6 26L20 12" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <rect
            x="15"
            y="5"
            width="12"
            height="7"
            rx="1.2"
            transform="rotate(45 21 8.5)"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="2.2"
          />
        </svg>
      );
    case 'nail_gun':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M5 12h16v6H12l-2 8H6l2-8H5z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M21 15h6M16 18l3 6" stroke="#fbbf24" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );
    case 'acid_sprayer':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="13" width="16" height="7" rx="2" stroke="currentColor" strokeWidth="2.1" />
          <path d="M20 16h6M8 20v4h5v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="14" r="1.6" fill="#84cc16" />
          <circle cx="27" cy="19" r="1.4" fill="#a3e635" />
          <circle cx="11" cy="16.5" r="1.8" fill="#84cc16" />
        </svg>
      );
    case 'desert_eagle':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M4 11h22l1 4H14l-3 10H6l3-10H4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 15v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="28" cy="12" r="1.5" fill="#e2e8f0" />
        </svg>
      );
    case 'rocket_launcher':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M3 14h21l4 2-4 2H3z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M8 18v5M15 18v4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M25 14l4 2-4 2z" fill="#f97316" />
        </svg>
      );
    case 'laser_cutter':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="12" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2.1" />
          <path d="M18 16h10" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="28" cy="16" r="2" fill="#f472b6" />
        </svg>
      );
    case 'minigun_rotary':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="12" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="2.1" />
          <path d="M14 13h13M14 16h14M14 19h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 12v8" stroke="#fb923c" strokeWidth="2" />
        </svg>
      );
    case 'cryo_shatter':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="12" width="15" height="8" rx="2" stroke="currentColor" strokeWidth="2.1" />
          <path d="M19 16h5M25 11v10M21 13l8 6M29 13l-8 6" stroke="#67e8f9" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'antimatter_fist':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M8 14V10a2 2 0 014 0v2m0-3a2 2 0 014 0v3m0-2a2 2 0 014 0v3m0-1a2 2 0 014 0v6c0 5-3.5 8-8 8h-2c-4.5 0-8-3-8-7.5V15a2 2 0 012-2h2z"
            stroke="#c084fc"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="20" r="3" fill="#c084fc" opacity="0.85" />
          <circle cx="16" cy="20" r="5.5" stroke="#e9d5ff" strokeWidth="1.1" strokeDasharray="2 2" />
        </svg>
      );
    case 'thermonuke_hammer':
    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M7 26L19 14" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <rect
            x="14"
            y="5"
            width="13"
            height="9"
            rx="2"
            transform="rotate(45 20 9.5)"
            fill="#facc15"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2.2"
          />
        </svg>
      );
  }
};
