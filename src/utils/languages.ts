export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  region: string;
  regionalAssistantNames: {
    female: string;
    male: string;
  };
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    speechCode: 'en-US',
    region: 'Global / US / UK',
    regionalAssistantNames: { female: 'Seraphina', male: 'Julian' },
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🌴',
    speechCode: 'ml-IN',
    region: 'Kerala, India',
    regionalAssistantNames: { female: 'Malavika', male: 'Aromal' },
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechCode: 'hi-IN',
    region: 'India',
    regionalAssistantNames: { female: 'Aarohi', male: 'Aarav' },
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechCode: 'es-ES',
    region: 'Spain & Latin America',
    regionalAssistantNames: { female: 'Valentina', male: 'Mateo' },
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
    region: 'France',
    regionalAssistantNames: { female: 'Amélie', male: 'Julien' },
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechCode: 'de-DE',
    region: 'Germany',
    regionalAssistantNames: { female: 'Hannah', male: 'Lukas' },
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    speechCode: 'it-IT',
    region: 'Italy',
    regionalAssistantNames: { female: 'Chiara', male: 'Matteo' },
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    speechCode: 'pt-BR',
    region: 'Brazil & Portugal',
    regionalAssistantNames: { female: 'Larissa', male: 'Thiago' },
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
    region: 'Japan',
    regionalAssistantNames: { female: 'Yuki', male: 'Haruto' },
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    speechCode: 'ko-KR',
    region: 'South Korea',
    regionalAssistantNames: { female: 'Minji', male: 'Jiho' },
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    speechCode: 'ar-SA',
    region: 'Middle East',
    regionalAssistantNames: { female: 'Nour', male: 'Zayd' },
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    speechCode: 'zh-CN',
    region: 'China',
    regionalAssistantNames: { female: 'Mei', male: 'Chen' },
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechCode: 'ru-RU',
    region: 'Eastern Europe',
    regionalAssistantNames: { female: 'Anastasia', male: 'Dmitri' },
  },
];

export const getLanguageByCode = (code: string): LanguageOption => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
};

export const getRegionalAssistantName = (
  langCode: string,
  gender: 'female' | 'male' = 'female'
): string => {
  const lang = getLanguageByCode(langCode);
  return lang.regionalAssistantNames[gender] || lang.regionalAssistantNames.female;
};

export const getAssistantNameForRegion = (
  regionalPlace: string,
  gender: 'female' | 'male' = 'female',
  fallbackLangCode: string = 'en'
): string => {
  if (!regionalPlace || !regionalPlace.trim()) {
    return getRegionalAssistantName(fallbackLangCode, gender);
  }

  const query = regionalPlace.toLowerCase().trim();

  // Malayalam / Kerala region detection
  if (
    query.includes('kerala') ||
    query.includes('malayalam') ||
    query.includes('kochi') ||
    query.includes('cochin') ||
    query.includes('trivandrum') ||
    query.includes('thiruvananthapuram') ||
    query.includes('calicut') ||
    query.includes('kozhikode') ||
    query.includes('thrissur') ||
    query.includes('kannur') ||
    query.includes('kollam') ||
    query.includes('alappuzha') ||
    query.includes('palakkad') ||
    query.includes('malappuram') ||
    query.includes('wayanad') ||
    query.includes('kottayam') ||
    query.includes('gods own country')
  ) {
    return gender === 'male' ? 'Aromal' : 'Malavika';
  }

  // India / Hindi detection
  if (
    query.includes('india') ||
    query.includes('delhi') ||
    query.includes('mumbai') ||
    query.includes('bangalore') ||
    query.includes('bengaluru') ||
    query.includes('hyderabad') ||
    query.includes('chennai') ||
    query.includes('kolkata') ||
    query.includes('pune') ||
    query.includes('jaipur') ||
    query.includes('hindi')
  ) {
    return gender === 'male' ? 'Aarav' : 'Aarohi';
  }

  // Japan
  if (query.includes('japan') || query.includes('tokyo') || query.includes('osaka') || query.includes('kyoto')) {
    return gender === 'male' ? 'Haruto' : 'Yuki';
  }

  // France
  if (query.includes('france') || query.includes('paris') || query.includes('lyon') || query.includes('marseille')) {
    return gender === 'male' ? 'Julien' : 'Amélie';
  }

  // Spain / Latin America
  if (
    query.includes('spain') ||
    query.includes('madrid') ||
    query.includes('barcelona') ||
    query.includes('mexico') ||
    query.includes('colombia') ||
    query.includes('argentina') ||
    query.includes('spanish')
  ) {
    return gender === 'male' ? 'Mateo' : 'Valentina';
  }

  // Germany
  if (query.includes('germany') || query.includes('berlin') || query.includes('munich') || query.includes('frankfurt')) {
    return gender === 'male' ? 'Lukas' : 'Hannah';
  }

  // Italy
  if (query.includes('italy') || query.includes('rome') || query.includes('milan') || query.includes('florence') || query.includes('venice')) {
    return gender === 'male' ? 'Matteo' : 'Chiara';
  }

  // Brazil / Portugal
  if (query.includes('brazil') || query.includes('portugal') || query.includes('rio') || query.includes('sao paulo') || query.includes('lisbon')) {
    return gender === 'male' ? 'Thiago' : 'Larissa';
  }

  // Korea
  if (query.includes('korea') || query.includes('seoul') || query.includes('busan')) {
    return gender === 'male' ? 'Jiho' : 'Minji';
  }

  // Arab / Middle East
  if (
    query.includes('uae') ||
    query.includes('dubai') ||
    query.includes('abu dhabi') ||
    query.includes('saudi') ||
    query.includes('riyadh') ||
    query.includes('cairo') ||
    query.includes('egypt') ||
    query.includes('qatar') ||
    query.includes('doha') ||
    query.includes('arabic')
  ) {
    return gender === 'male' ? 'Zayd' : 'Nour';
  }

  // China
  if (query.includes('china') || query.includes('beijing') || query.includes('shanghai') || query.includes('guangzhou')) {
    return gender === 'male' ? 'Chen' : 'Mei';
  }

  // Russia
  if (query.includes('russia') || query.includes('moscow') || query.includes('saint petersburg')) {
    return gender === 'male' ? 'Dmitri' : 'Anastasia';
  }

  // Default / USA / UK
  if (query.includes('uk') || query.includes('london') || query.includes('england') || query.includes('britain')) {
    return gender === 'male' ? 'Oliver' : 'Sophia';
  }

  if (query.includes('usa') || query.includes('america') || query.includes('california') || query.includes('new york') || query.includes('texas')) {
    return gender === 'male' ? 'Julian' : 'Seraphina';
  }

  // Try matching against any supported language name or region
  const match = SUPPORTED_LANGUAGES.find(
    (l) =>
      query.includes(l.name.toLowerCase()) ||
      query.includes(l.nativeName.toLowerCase()) ||
      l.region.toLowerCase().split(/[ ,/]+/).some((word) => word.length > 2 && query.includes(word))
  );

  if (match) {
    return match.regionalAssistantNames[gender] || match.regionalAssistantNames.female;
  }

  return getRegionalAssistantName(fallbackLangCode, gender);
};
