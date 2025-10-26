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

// Fonction utilitaire pour obtenir les codes de langues uniquement
export const getSupportedLanguageCodes = () => {
  return supportedLangs.map((lang) => lang.code);
};

// Fonction utilitaire pour obtenir les informations d'une langue
export const getLanguageInfo = (langCode) => {
  return (
    supportedLangs.find((lang) => lang.code === langCode) || supportedLangs[0]
  );
};

// Fonction utilitaire pour obtenir la direction d'une langue
export const getLanguageDirection = (langCode) => {
  const langInfo = getLanguageInfo(langCode);
  return langInfo.dir;
};
