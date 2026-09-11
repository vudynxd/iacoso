import React from 'react';

interface CottaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

export const CottaLogo: React.FC<CottaLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#0a0a0a]';
  const borderColor = isLight ? 'bg-white' : 'bg-[#0a0a0a]';
  const subColor = isLight ? 'text-gray-200' : 'text-[#1a1a1a]';

  const sizeClasses = {
    sm: {
      title: 'text-lg tracking-wider font-black',
      bar: 'h-[2px] mt-0.5 mb-0.5',
      neumaticos: 'text-[9px] tracking-[0.25em]',
      subtitle: 'text-[7px] tracking-wider',
    },
    md: {
      title: 'text-2xl sm:text-3xl tracking-wide font-black',
      bar: 'h-[3px] mt-0.5 mb-0.5',
      neumaticos: 'text-[11px] sm:text-[12px] tracking-[0.28em] font-extrabold',
      subtitle: 'text-[9px] sm:text-[10px] tracking-[0.18em] font-bold',
    },
    lg: {
      title: 'text-3xl sm:text-4xl tracking-tight font-black',
      bar: 'h-[3.5px] mt-0.5 mb-0.5',
      neumaticos: 'text-xs sm:text-sm tracking-[0.32em] font-extrabold',
      subtitle: 'text-[10px] sm:text-[11px] tracking-[0.2em] font-bold',
    },
    xl: {
      title: 'text-4xl sm:text-5xl tracking-tight font-black',
      bar: 'h-[4px] mt-1 mb-1',
      neumaticos: 'text-sm sm:text-base tracking-[0.35em] font-extrabold',
      subtitle: 'text-xs tracking-[0.22em] font-bold',
    },
  }[size];

  return (
    <div className="inline-flex flex-col items-start select-none font-sans">
      {/* Brand Name COTTA with solid black automotive display typography */}
      <div className={`leading-none font-black ${textColor} ${sizeClasses.title}`}>
        COTTA
      </div>

      {/* Signature Underline frame from business card */}
      <div className={`w-full ${borderColor} ${sizeClasses.bar}`} />

      {/* NEUMÁTICOS */}
      <div
        className={`w-full text-center uppercase leading-tight font-bold ${textColor} ${sizeClasses.neumaticos}`}
      >
        NEUMÁTICOS
      </div>

      {/* VENTAS POR MAYOR Y MENOR */}
      {showSubtitle && (
        <div
          className={`w-full text-center uppercase tracking-widest leading-normal mt-0.5 ${subColor} ${sizeClasses.subtitle}`}
        >
          VENTAS POR MAYOR Y MENOR
        </div>
      )}
    </div>
  );
};

export const CottaBrandStrip: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  return (
    <div
      className={`grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 py-2 px-2.5 rounded-none border ${
        isDark
          ? 'bg-[#18191b] border-[#2e3135] text-gray-200'
          : 'bg-[#faf9f6] border-[#cfcbc2] text-[#222222]'
      }`}
    >
      {/* Michelin */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[11px] font-black tracking-wider text-[#1e3a8a] leading-none">
          MICHELIN
        </span>
        <span className="text-[8px] font-semibold text-[#2563eb] tracking-tighter mt-0.5">
          Movilidad Total
        </span>
      </div>

      {/* PACE TYRES */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[11px] font-black tracking-wide text-[#ea580c] leading-none flex items-center gap-0.5">
          PACE <span className="text-[9px] text-[#f97316]">«</span>
        </span>
        <span className="text-[8px] font-bold text-[#c2410c] tracking-widest mt-0.5">
          TYRES
        </span>
      </div>

      {/* BFGoodrich */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[11px] font-black tracking-tighter leading-none">
          <span className="text-[#dc2626]">BF</span>
          <span className="text-[#1e3a8a]">Goodrich</span>
        </span>
        <span className="text-[7.5px] font-medium text-[#4b5563] tracking-wider mt-0.5">
          Tires
        </span>
      </div>

      {/* ZMAX */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <div className="bg-[#111111] text-white px-2 py-0.5 rounded-none border-l-2 border-r-2 border-[#dc2626]">
          <span className="text-[10px] font-black tracking-widest leading-none">
            ZMAX
          </span>
        </div>
      </div>

      {/* ONYX */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[11px] font-black italic tracking-wide text-[#1e40af] leading-none">
          ONYX
        </span>
        <span className="text-[8px] font-bold text-[#3b82f6] tracking-wider mt-0.5">
          TIRES
        </span>
      </div>

      {/* FORTUNE */}
      <div className="flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[11px] font-serif font-black tracking-wider text-[#1e293b] leading-none">
          F★RTUNE
        </span>
        <span className="text-[8px] font-semibold text-[#0284c7] tracking-widest mt-0.5">
          TIRES
        </span>
      </div>
    </div>
  );
};
