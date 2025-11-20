import logger from "../utils/loggerUtils";

type CountryCurrencyMap = Record<string, string>;

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const COUNTRY_CURRENCY_MAP: CountryCurrencyMap = {
  US: "usd",
  CA: "cad",
  MX: "mxn",
  BR: "brl",
  AR: "ars",
  CL: "clp",
  CO: "cop",
  PE: "pen",
  GB: "gbp",
  IE: "eur",
  FR: "eur",
  DE: "eur",
  NL: "eur",
  BE: "eur",
  ES: "eur",
  PT: "eur",
  IT: "eur",
  AT: "eur",
  SE: "sek",
  NO: "nok",
  DK: "dkk",
  FI: "eur",
  CH: "chf",
  PL: "pln",
  CZ: "czk",
  HU: "huf",
  RO: "ron",
  BG: "bgn",
  GR: "eur",
  HR: "eur",
  SK: "eur",
  SI: "eur",
  AU: "aud",
  NZ: "nzd",
  JP: "jpy",
  SG: "sgd",
  HK: "hkd",
  CN: "cny",
  TW: "twd",
  KR: "krw",
  IN: "inr",
  PK: "pkr",
  BD: "bdt",
  LK: "lkr",
  TH: "thb",
  MY: "myr",
  ID: "idr",
  PH: "php",
  VN: "vnd",
  AE: "aed",
  SA: "sar",
  QA: "qar",
  KW: "kwd",
  BH: "bhd",
  OM: "omr",
  IL: "ils",
  TR: "try",
  ZA: "zar",
  NG: "ngn",
  KE: "kes",
  EG: "egp",
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  UNITED_STATES: "US",
  USA: "US",
  UNITED_STATES_OF_AMERICA: "US",
  CANADA: "CA",
  MEXICO: "MX",
  BRAZIL: "BR",
  ARGENTINA: "AR",
  CHILE: "CL",
  COLOMBIA: "CO",
  PERU: "PE",
  UNITED_KINGDOM: "GB",
  GREAT_BRITAIN: "GB",
  ENGLAND: "GB",
  IRELAND: "IE",
  FRANCE: "FR",
  GERMANY: "DE",
  NETHERLANDS: "NL",
  BELGIUM: "BE",
  SPAIN: "ES",
  PORTUGAL: "PT",
  ITALY: "IT",
  AUSTRIA: "AT",
  SWEDEN: "SE",
  NORWAY: "NO",
  DENMARK: "DK",
  FINLAND: "FI",
  SWITZERLAND: "CH",
  POLAND: "PL",
  CZECH_REPUBLIC: "CZ",
  HUNGARY: "HU",
  ROMANIA: "RO",
  BULGARIA: "BG",
  GREECE: "GR",
  CROATIA: "HR",
  SLOVAKIA: "SK",
  SLOVENIA: "SI",
  AUSTRALIA: "AU",
  NEW_ZEALAND: "NZ",
  JAPAN: "JP",
  SINGAPORE: "SG",
  HONG_KONG: "HK",
  CHINA: "CN",
  TAIWAN: "TW",
  KOREA: "KR",
  SOUTH_KOREA: "KR",
  INDIA: "IN",
  PAKISTAN: "PK",
  BANGLADESH: "BD",
  SRI_LANKA: "LK",
  THAILAND: "TH",
  MALAYSIA: "MY",
  INDONESIA: "ID",
  PHILIPPINES: "PH",
  VIETNAM: "VN",
  UNITED_ARAB_EMIRATES: "AE",
  UAE: "AE",
  SAUDI_ARABIA: "SA",
  QATAR: "QA",
  KUWAIT: "KW",
  BAHRAIN: "BH",
  OMAN: "OM",
  ISRAEL: "IL",
  TURKEY: "TR",
  SOUTH_AFRICA: "ZA",
  NIGERIA: "NG",
  KENYA: "KE",
  EGYPT: "EG",
};

const LOCAL_IPS = new Set(["127.0.0.1", "::1"]);

const normalizeCurrency = (currency?: string): string | undefined =>
  currency?.trim().toLowerCase();

const normalizeCountryCode = (country?: string | null): string | null => {
  if (!country) {
    return null;
  }

  const trimmed = country.trim();
  if (!trimmed) {
    return null;
  }

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const normalizedKey = trimmed.replace(/\s+/g, "_").toUpperCase();
  return COUNTRY_NAME_TO_CODE[normalizedKey] || null;
};

export class CurrencyDetectionService {
  static getCurrencyForCountry(country?: string | null): string {
    const countryCode = normalizeCountryCode(country);
    if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
      return COUNTRY_CURRENCY_MAP[countryCode];
    }
    return "usd";
  }

  static async getCountryFromIP(
    ipAddress?: string | null,
  ): Promise<string | null> {
    if (!ipAddress) {
      return null;
    }

    const sanitizedIp = ipAddress.replace("::ffff:", "");
    if (LOCAL_IPS.has(sanitizedIp)) {
      return null;
    }

    try {
      const response = await fetch(`https://ipapi.co/${sanitizedIp}/json/`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        logger.warn("CurrencyDetectionService: GeoIP lookup failed", {
          ipAddress: sanitizedIp,
          status: response.status,
        });
        return null;
      }

      const data = (await response.json()) as { country_code?: string };
      return data.country_code ?? null;
    } catch (error) {
      logger.warn("CurrencyDetectionService: GeoIP lookup error", {
        ipAddress: sanitizedIp,
        error,
      });
      return null;
    }
  }

  static async getCurrencyFromIP(ipAddress?: string | null): Promise<string> {
    const country = await this.getCountryFromIP(ipAddress);
    return this.getCurrencyForCountry(country);
  }

  static convertToMinorUnits(amount: number, currency: string): number {
    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a finite number");
    }
    const normalizedCurrency = normalizeCurrency(currency);
    if (!normalizedCurrency) {
      throw new Error("Currency code is required");
    }

    if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
      return Math.round(amount);
    }

    return Math.round(amount * 100);
  }

  static convertFromMinorUnits(amount: number, currency: string): number {
    const normalizedCurrency = normalizeCurrency(currency);
    if (!normalizedCurrency) {
      throw new Error("Currency code is required");
    }

    if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
      return amount;
    }

    return amount / 100;
  }

  static isZeroDecimal(currency: string): boolean {
    const normalizedCurrency = normalizeCurrency(currency);
    if (!normalizedCurrency) {
      return false;
    }
    return ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency);
  }

  static normalizeCurrency(currency?: string | null): string | null {
    return normalizeCurrency(currency ?? undefined) ?? null;
  }

  static normalizeCountry(country?: string | null): string | null {
    return normalizeCountryCode(country);
  }
}

export default CurrencyDetectionService;
