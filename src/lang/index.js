/**
 * @fileoverview Multi-Language Configuration
 * @description Configuration for supported languages in the APS editorial system.
 * Includes language codes, display names, and text direction (LTR/RTL).
 */

/**
 * Supported languages configuration
 * Each language object contains:
 * @property {string} code - Language code (ISO 639-1 or custom)
 * @property {string} name - Display name in native language
 * @property {string} dir - Text direction: 'ltr' (left-to-right) or 'rtl' (right-to-left)
 * 
 * Supported languages:
 * - French (fr) - Default language
 * - Arabic (ar) - RTL
 * - English (en)
 * - Spanish (es)
 * - Russian (ru)
 * - Chinese (cn)
 * - Tamazight variants (arb, tal, tif) - Berber languages
 */
export const supportedLangs = [
  {
    code: "fr",
    name: "Français",
    dir: "ltr",
  },
  {
    code: "cn",
    name: "Chinoise",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "العربية",
    dir: "rtl",
  },
  {
    code: "en",
    name: "English",
    dir: "ltr",
  },
  {
    code: "es",
    name: "Español",
    dir: "ltr",
  },
  {
    code: "ru",
    name: "Русский",
    dir: "ltr",
  },
  {
    code: "tamazight-arb",
    name: "ⵜⴰⵎⴰⵣⵉⵖⵜ ",
    dir: "rtl",
  },
  {
    code: "tamazight-tal",
    name: "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    dir: "ltr",
  },
  {
    code: "tamazight-tif",
    name: "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    dir: "ltr",
  },
];

/**
 * Returns array of supported language codes only
 * 
 * @returns {Array<string>} Array of language codes
 * @example
 * getSupportedLanguageCodes() // Returns: ["fr", "cn", "ar", "en", ...]
 */
export const getSupportedLanguageCodes = () => {
  return supportedLangs.map((lang) => lang.code);
};

/**
 * Gets complete language information object by language code
 * 
 * @param {string} langCode - Language code to look up
 * @returns {Object} Language object with code, name, and dir properties
 * @default Returns French (fr) if language not found
 * 
 * @example
 * getLanguageInfo("ar") // Returns: { code: "ar", name: "العربية", dir: "rtl" }
 */
export const getLanguageInfo = (langCode) => {
  return (
    supportedLangs.find((lang) => lang.code === langCode) || supportedLangs[0]
  );
};

/**
 * Gets text direction for a specific language
 * 
 * @param {string} langCode - Language code
 * @returns {string} Text direction: "ltr" or "rtl"
 * @default Returns "ltr" if language not found
 * 
 * @example
 * getLanguageDirection("ar") // Returns: "rtl"
 * getLanguageDirection("fr") // Returns: "ltr"
 */
export const getLanguageDirection = (langCode) => {
  const langInfo = getLanguageInfo(langCode);
  return langInfo.dir;
};
