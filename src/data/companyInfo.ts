export interface BranchInfo {
  city: string;
  province: string;
  phoneDisplay: string;
  phoneRaw: string;
  whatsappUrl: string;
}

export interface CompanyInfo {
  name: string;
  legalName: string;
  slogan: string;
  instagram: string;
  facebook: string;
  socialHandle: string;
  branches: {
    santaRosa: BranchInfo;
    america: BranchInfo;
  };
  featuredBrands: {
    name: string;
    tagline?: string;
    textColor: string;
    accentColor: string;
    badgeBg: string;
  }[];
}

export const COMPANY_INFO: CompanyInfo = {
  name: 'COTTA',
  legalName: 'COTTA NEUMÁTICOS',
  slogan: 'VENTAS POR MAYOR Y MENOR',
  instagram: 'https://instagram.com/cotta.neumaticos',
  facebook: 'https://facebook.com/cotta.neumaticos',
  socialHandle: '@cotta.neumaticos',
  branches: {
    santaRosa: {
      city: 'SANTA ROSA',
      province: 'L.P.',
      phoneDisplay: '2954-870047',
      phoneRaw: '5492954870047',
      whatsappUrl: 'https://wa.me/5492954870047',
    },
    america: {
      city: 'AMÉRICA',
      province: 'BS.AS.',
      phoneDisplay: '2392-520200',
      phoneRaw: '5492392520200',
      whatsappUrl: 'https://wa.me/5492392520200',
    },
  },
  featuredBrands: [
    {
      name: 'MICHELIN',
      tagline: 'Movilidad total',
      textColor: '#1e3a8a',
      accentColor: '#2563eb',
      badgeBg: '#eff6ff',
    },
    {
      name: 'PACE TYRES',
      tagline: 'High Performance',
      textColor: '#ea580c',
      accentColor: '#f97316',
      badgeBg: '#fff7ed',
    },
    {
      name: 'BFGoodrich',
      tagline: 'Tires',
      textColor: '#b91c1c',
      accentColor: '#1e3a8a',
      badgeBg: '#fef2f2',
    },
    {
      name: 'ZMAX',
      tagline: 'Radial',
      textColor: '#111827',
      accentColor: '#dc2626',
      badgeBg: '#f3f4f6',
    },
    {
      name: 'ONYX TIRES',
      tagline: 'Heavy Duty',
      textColor: '#1d4ed8',
      accentColor: '#3b82f6',
      badgeBg: '#eff6ff',
    },
    {
      name: 'FORTUNE TIRES',
      tagline: 'Premium',
      textColor: '#1e293b',
      accentColor: '#0284c7',
      badgeBg: '#f8fafc',
    },
  ],
};
