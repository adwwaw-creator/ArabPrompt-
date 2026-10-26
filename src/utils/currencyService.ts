/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CurrencyConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  flag: string;
  countryAr: string;
  countryEn: string;
  rate: number; // 1 USD = rate in this currency
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    symbolAr: '$',
    symbolEn: '$',
    flag: '🇺🇸',
    countryAr: 'الولايات المتحدة',
    countryEn: 'United States',
    rate: 1.0,
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    flag: '🇸🇦',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Saudi Arabia',
    rate: 3.75,
    decimals: 2,
  },
  AED: {
    code: 'AED',
    nameAr: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    flag: '🇦🇪',
    countryAr: 'الإمارات العربية المتحدة',
    countryEn: 'United Arab Emirates',
    rate: 3.6725,
    decimals: 2,
  },
  EGP: {
    code: 'EGP',
    nameAr: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    flag: '🇪🇬',
    countryAr: 'جمهورية مصر العربية',
    countryEn: 'Egypt',
    rate: 50.0,
    decimals: 1,
  },
  KWD: {
    code: 'KWD',
    nameAr: 'دينار كويتي',
    nameEn: 'Kuwaiti Dinar',
    symbolAr: 'د.ك',
    symbolEn: 'KWD',
    flag: '🇰🇼',
    countryAr: 'دولة الكويت',
    countryEn: 'Kuwait',
    rate: 0.308,
    decimals: 2,
  },
  QAR: {
    code: 'QAR',
    nameAr: 'ريال قطري',
    nameEn: 'Qatari Riyal',
    symbolAr: 'ر.ق',
    symbolEn: 'QAR',
    flag: '🇶🇦',
    countryAr: 'دولة قطر',
    countryEn: 'Qatar',
    rate: 3.64,
    decimals: 2,
  },
  BHD: {
    code: 'BHD',
    nameAr: 'دينار بحريني',
    nameEn: 'Bahraini Dinar',
    symbolAr: 'د.ب',
    symbolEn: 'BHD',
    flag: '🇧🇭',
    countryAr: 'مملكة البحرين',
    countryEn: 'Bahrain',
    rate: 0.376,
    decimals: 2,
  },
  OMR: {
    code: 'OMR',
    nameAr: 'ريال عماني',
    nameEn: 'Omani Rial',
    symbolAr: 'ر.ع',
    symbolEn: 'OMR',
    flag: '🇴🇲',
    countryAr: 'سلطنة عمان',
    countryEn: 'Oman',
    rate: 0.385,
    decimals: 2,
  },
  JOD: {
    code: 'JOD',
    nameAr: 'دينار أردني',
    nameEn: 'Jordanian Dinar',
    symbolAr: 'د.أ',
    symbolEn: 'JOD',
    flag: '🇯🇴',
    countryAr: 'المملكة الأردنية الهاشمية',
    countryEn: 'Jordan',
    rate: 0.709,
    decimals: 2,
  },
  MAD: {
    code: 'MAD',
    nameAr: 'درهم مغربي',
    nameEn: 'Moroccan Dirham',
    symbolAr: 'د.م',
    symbolEn: 'MAD',
    flag: '🇲🇦',
    countryAr: 'المملكة المغربية',
    countryEn: 'Morocco',
    rate: 10.05,
    decimals: 1,
  },
  DZD: {
    code: 'DZD',
    nameAr: 'دينار جزائري',
    nameEn: 'Algerian Dinar',
    symbolAr: 'د.ج',
    symbolEn: 'DZD',
    flag: '🇩🇿',
    countryAr: 'الجمهورية الجزائرية',
    countryEn: 'Algeria',
    rate: 134.5,
    decimals: 0,
  },
  TND: {
    code: 'TND',
    nameAr: 'دينار تونسي',
    nameEn: 'Tunisian Dinar',
    symbolAr: 'د.ت',
    symbolEn: 'TND',
    flag: '🇹🇳',
    countryAr: 'الجمهورية التونسية',
    countryEn: 'Tunisia',
    rate: 3.12,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    nameAr: 'يورو أوروبي',
    nameEn: 'Euro',
    symbolAr: '€',
    symbolEn: '€',
    flag: '🇪🇺',
    countryAr: 'الاتحاد الأوروبي',
    countryEn: 'European Union',
    rate: 0.92,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    nameAr: 'جنيه إسترليني',
    nameEn: 'British Pound',
    symbolAr: '£',
    symbolEn: '£',
    flag: '🇬🇧',
    countryAr: 'المملكة المتحدة',
    countryEn: 'United Kingdom',
    rate: 0.79,
    decimals: 2,
  },
  TRY: {
    code: 'TRY',
    nameAr: 'ليرة تركية',
    nameEn: 'Turkish Lira',
    symbolAr: '₺',
    symbolEn: 'TRY',
    flag: '🇹🇷',
    countryAr: 'الجمهورية التركية',
    countryEn: 'Turkey',
    rate: 34.2,
    decimals: 1,
  },
  CAD: {
    code: 'CAD',
    nameAr: 'دولار كندي',
    nameEn: 'Canadian Dollar',
    symbolAr: 'C$',
    symbolEn: 'CAD',
    flag: '🇨🇦',
    countryAr: 'كندا',
    countryEn: 'Canada',
    rate: 1.38,
    decimals: 2,
  },
};

export const POPULAR_CURRENCIES: string[] = ['SAR', 'AED', 'EGP', 'KWD', 'QAR', 'USD', 'EUR'];

const STORAGE_KEY = 'arabprompt_preferred_currency';

/**
 * Detect user's currency based on saved preference, timezone, or browser locale.
 */
export function detectUserCurrency(): { currency: CurrencyConfig; isAutoDetected: boolean } {
  try {
    // 1. Check if user already manually selected a currency
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCode = localStorage.getItem(STORAGE_KEY);
      if (savedCode && SUPPORTED_CURRENCIES[savedCode]) {
        return { currency: SUPPORTED_CURRENCIES[savedCode], isAutoDetected: false };
      }
    }

    // 2. Client-side Timezone auto-detection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = tz.toLowerCase();

    if (tzLower.includes('riyadh') || tzLower.includes('saudi')) {
      return { currency: SUPPORTED_CURRENCIES.SAR, isAutoDetected: true };
    }
    if (tzLower.includes('dubai') || tzLower.includes('uae')) {
      return { currency: SUPPORTED_CURRENCIES.AED, isAutoDetected: true };
    }
    if (tzLower.includes('cairo') || tzLower.includes('egypt')) {
      return { currency: SUPPORTED_CURRENCIES.EGP, isAutoDetected: true };
    }
    if (tzLower.includes('kuwait')) {
      return { currency: SUPPORTED_CURRENCIES.KWD, isAutoDetected: true };
    }
    if (tzLower.includes('qatar')) {
      return { currency: SUPPORTED_CURRENCIES.QAR, isAutoDetected: true };
    }
    if (tzLower.includes('bahrain')) {
      return { currency: SUPPORTED_CURRENCIES.BHD, isAutoDetected: true };
    }
    if (tzLower.includes('muscat')) {
      return { currency: SUPPORTED_CURRENCIES.OMR, isAutoDetected: true };
    }
    if (tzLower.includes('amman')) {
      return { currency: SUPPORTED_CURRENCIES.JOD, isAutoDetected: true };
    }
    if (tzLower.includes('casablanca')) {
      return { currency: SUPPORTED_CURRENCIES.MAD, isAutoDetected: true };
    }
    if (tzLower.includes('algiers')) {
      return { currency: SUPPORTED_CURRENCIES.DZD, isAutoDetected: true };
    }
    if (tzLower.includes('tunis')) {
      return { currency: SUPPORTED_CURRENCIES.TND, isAutoDetected: true };
    }
    if (tzLower.includes('london')) {
      return { currency: SUPPORTED_CURRENCIES.GBP, isAutoDetected: true };
    }
    if (tzLower.includes('paris') || tzLower.includes('berlin') || tzLower.includes('madrid') || tzLower.includes('rome') || tzLower.includes('amsterdam') || tzLower.includes('brussels') || tzLower.includes('vienna')) {
      return { currency: SUPPORTED_CURRENCIES.EUR, isAutoDetected: true };
    }
    if (tzLower.includes('istanbul')) {
      return { currency: SUPPORTED_CURRENCIES.TRY, isAutoDetected: true };
    }
    if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('montreal')) {
      return { currency: SUPPORTED_CURRENCIES.CAD, isAutoDetected: true };
    }

    // 3. Fallback to navigator languages
    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [navigator.language || ''];
      for (const lang of languages) {
        const parts = lang.split('-');
        if (parts.length > 1) {
          const country = parts[1].toUpperCase();
          if (country === 'SA') return { currency: SUPPORTED_CURRENCIES.SAR, isAutoDetected: true };
          if (country === 'AE') return { currency: SUPPORTED_CURRENCIES.AED, isAutoDetected: true };
          if (country === 'EG') return { currency: SUPPORTED_CURRENCIES.EGP, isAutoDetected: true };
          if (country === 'KW') return { currency: SUPPORTED_CURRENCIES.KWD, isAutoDetected: true };
          if (country === 'QA') return { currency: SUPPORTED_CURRENCIES.QAR, isAutoDetected: true };
          if (country === 'BH') return { currency: SUPPORTED_CURRENCIES.BHD, isAutoDetected: true };
          if (country === 'OM') return { currency: SUPPORTED_CURRENCIES.OMR, isAutoDetected: true };
          if (country === 'JO') return { currency: SUPPORTED_CURRENCIES.JOD, isAutoDetected: true };
          if (country === 'MA') return { currency: SUPPORTED_CURRENCIES.MAD, isAutoDetected: true };
          if (country === 'DZ') return { currency: SUPPORTED_CURRENCIES.DZD, isAutoDetected: true };
          if (country === 'TN') return { currency: SUPPORTED_CURRENCIES.TND, isAutoDetected: true };
          if (country === 'GB') return { currency: SUPPORTED_CURRENCIES.GBP, isAutoDetected: true };
          if (country === 'FR' || country === 'DE' || country === 'ES' || country === 'IT' || country === 'NL') {
            return { currency: SUPPORTED_CURRENCIES.EUR, isAutoDetected: true };
          }
        }
      }
    }
  } catch {
    // Ignore detection errors safely
  }

  // Default fallback: SAR for Arabic users or USD
  return { currency: SUPPORTED_CURRENCIES.SAR, isAutoDetected: true };
}

/**
 * Save user preferred currency
 */
export function setUserCurrency(currencyCode: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, currencyCode);
      // Dispatch custom event so all open views update seamlessly
      window.dispatchEvent(new CustomEvent('arabprompt_currency_changed', { detail: currencyCode }));
    }
  } catch {
    // Ignore storage errors
  }
}

export interface FormattedPriceResult {
  amount: number;
  formattedAmount: string;
  symbol: string;
  code: string;
  fullFormatted: string;
  isUsd: boolean;
  usdAmount: number;
  usdFormatted: string;
}

/**
 * Convert USD amount to the selected currency and format it cleanly
 */
export function formatCurrencyPrice(
  usdAmount: number,
  currencyCode: string,
  isAr: boolean = true
): FormattedPriceResult {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const isUsd = currency.code === 'USD';

  if (usdAmount === 0) {
    const symbol = isAr ? currency.symbolAr : currency.symbolEn;
    return {
      amount: 0,
      formattedAmount: '0',
      symbol,
      code: currency.code,
      fullFormatted: isAr ? `0 ${symbol}` : `${symbol}0`,
      isUsd,
      usdAmount: 0,
      usdFormatted: '$0',
    };
  }

  const converted = usdAmount * currency.rate;
  
  // Format numbers nicely: if decimals === 0 round to integer, else round to decimals
  let formattedAmount: string;
  if (currency.decimals === 0) {
    formattedAmount = Math.round(converted).toLocaleString('en-US');
  } else {
    // If it has clean decimals like .00 or .50
    const fixed = converted.toFixed(currency.decimals);
    formattedAmount = parseFloat(fixed) % 1 === 0 ? parseFloat(fixed).toString() : fixed;
  }

  const symbol = isAr ? currency.symbolAr : currency.symbolEn;
  const fullFormatted = isAr ? `${formattedAmount} ${symbol}` : `${symbol}${formattedAmount}`;
  const usdFormatted = `$${usdAmount.toFixed(usdAmount % 1 === 0 ? 0 : 2)}`;

  return {
    amount: converted,
    formattedAmount,
    symbol,
    code: currency.code,
    fullFormatted,
    isUsd,
    usdAmount,
    usdFormatted,
  };
}
