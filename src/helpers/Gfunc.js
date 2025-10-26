/**
 * @fileoverview Global Helper Functions
 * @description Collection of utility functions used throughout the application.
 * Includes validation, formatting, security checks, and data manipulation functions.
 * @author APS Development Team
 */

import { mdiAlertCircleOutline } from "@mdi/js";
import axios from "axios";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import log from "../log/costumLog";

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 * 
 * @param {string} str - The string to capitalize
 * @returns {string|undefined} Capitalized string or undefined if empty
 * 
 * @example
 * capitalizeFirstLetter("hello") // Returns: "Hello"
 */
export function capitalizeFirstLetter(str) {
  return str?.length !== 0
    ? str?.charAt(0)?.toUpperCase() + str?.slice(1)?.toLowerCase()
    : undefined;
}

/**
 * Converts the first character of a string to lowercase
 * 
 * @param {string} chaine - The string to convert
 * @returns {string} String with first character in lowercase
 */
export function firstToLower(chaine) {
  return chaine?.charAt(0)?.toLowerCase() + chaine?.slice(1);
}

/**
 * Returns the appropriate Material Design Icon name based on menu item
 * 
 * @param {string} str - Menu item name
 * @returns {string} Material Design Icon identifier (mdi*)
 * 
 * @example
 * getIcon("articles") // Returns: "mdiFileDocumentOutline"
 * getIcon("roles") // Returns: "mdiBadgeAccountHorizontal"
 */
export function getIcon(str) {
  const iconMap = {
    acceuil: "mdiHome",
    articles: "mdiFileDocumentOutline",
    roles: "mdiBadgeAccountHorizontal",
    rôles: "mdiBadgeAccountHorizontal",
    utilisateurs: "mdiAccountGroup",
    tags: "mdiTag",
    bannieres: "mdiAdvertisements",
    dossiers: "mdiFolder",
    settings: "mdiCogs",
    "erreurs saisie": "mdiMessageAlert",
    "erreurs connexion": "mdiFileDocumentAlert",
    images: "mdiImage",
    blocage: "mdiBlockHelper",
    readMore: "mdiPageNextOutline",
    linkAdd: "mdiTranslate",
    media: "mdiMultimedia",
    infographies: "mdiPanoramaVariantOutline",
    galeries: "mdiImageMultiple",
    videos: "mdiVideoBox",
    cahiers: "mdiBookOpenPageVariant",
    abonne: "mdiAccountStar",
    abonnes: "mdiAccountStar",
    urgence: "mdiCarEmergency",
  };

  const lowerStr = str.toLowerCase();
  if (iconMap[lowerStr]) {
    return iconMap[lowerStr];
  } else if (lowerStr.includes("log")) {
    return "mdiTextBoxSearch";
  } else if (lowerStr.includes("article")) {
    return "mdiFileDocumentOutline";
  } else if (lowerStr.includes("cat")) {
    return "mdiShape";
  } else {
    return "mdiCircleOutline";
  }
}

/**
 * Converts menu item names to their corresponding route paths
 * Handles special cases and French accent variations
 * 
 * @param {string} str - Menu item name
 * @returns {string} Route path name
 */
export const getPathName = (str) => {
  switch (str) {
    case "erreurs connexion":
      return "login_erreurs";
    case "erreurs saisie":
      return "front";
    case "rôles":
      return "roles";
    case "utilisateurs":
      return "users";
    case "catégories":
      return "categories";
    case "galerie articles":
      return "gallery_articles";
    default:
      return str;
  }
};

/**
 * Masks email address by replacing characters with asterisks
 * Preserves the first 2 characters and the domain
 * 
 * @param {string} email - Email address to mask
 * @returns {string} Masked email (e.g., "jo***@aps.dz")
 * 
 * @example
 * HiddenLettreEmail("john.doe@aps.dz") // Returns: "jo******@aps.dz"
 */
export function HiddenLettreEmail(email) {
  const [nomUtilisateur, domaine] = email.split("@");
  const partieCachee =
    nomUtilisateur.substring(0, Math.max(2, 0)) +
    "*".repeat(Math.max(0, nomUtilisateur.length - 2));
  const emailCache = `${partieCachee}@${domaine}`;

  return emailCache;
}

/**
 * Logs out the user by clearing session cookies and local storage
 * Makes API call to invalidate session on the server
 * Redirects to login page after cleanup
 * 
 * @async
 * @private
 * @returns {Promise<void>}
 */
const LougoutCoookiesSession = async () => {
  try {
    await axios.post(
      import.meta.env.VITE_BASE_URL + "auth/logout",
      {
        userId: JSON.parse(
          localStorage.getItem("userId" + import.meta.env.VITE_LAN)
        ),
      },
      { withCredentials: true }
    );

    // Clear session storage and language-specific keys from localStorage
    sessionStorage.clear();
    removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
    window.location.replace("/" + import.meta.env.VITE_LAN + "/login");
  } catch (error) {
    // Even on error, clear local data and redirect
    removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
    sessionStorage.clear();
    window.location.replace("/" + import.meta.env.VITE_LAN + "/login");

    /*  log.error("Ceci est un message d'erreur.");
    log.info("Ceci est un message d'information."); */
  }
};

/**
 * Handles session expiration errors
 * Displays error toast notification and initiates logout after 5 seconds
 * 
 * @async
 * @param {string} message - Error message to display
 * @returns {Promise<void>}
 * 
 * @example
 * TreatError("Your session has expired")
 */
export const TreatError = async (message) => {
  toast.error(message, {
    icon: mdiAlertCircleOutline,
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    onClick: () => {
      LougoutCoookiesSession();
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  LougoutCoookiesSession();
};

/**
 * Converts a Date object to ISO timestamp string
 * 
 * @param {Date} date - Date object to convert
 * @returns {string} ISO 8601 formatted timestamp
 */
export function addTimestamp(date) {
  const timestamp = date.toISOString();
  return timestamp;
}

/**
 * Formats an ISO date string to French format (DD.MM.YYYY - HH:MM)
 * 
 * @param {string} dateISO - ISO date string to format
 * @returns {string|null} Formatted date string or null if input is falsy
 * 
 * @example
 * formaterDate("2024-01-15T10:30:00Z") // Returns: "15.01.2024 - 10:30"
 */
export function formaterDate(dateISO) {
  const date = new Date(dateISO);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return dateISO
    ? date
        .toLocaleString("fr-FR", options)
        .replace(" ", " - ")
        .replace(/\//g, ".")
    : null;
}

/**
 * Formats a date object to Arabic/standard format (YYYY/MM/DD)
 * 
 * @param {Object} dateObject - Day.js date object with $d property
 * @returns {string} Formatted date string (YYYY/MM/DD)
 */
export function formaterDateAr(dateObject) {
  const year = dateObject.$d.getFullYear();
  const month = dateObject.$d.getMonth() + 1; //getMonth() renvoie un mois entre 0 et 11 c'est pour ca +1
  const day = dateObject.$d.getDate();

  // Formater la date dans le format yyyy/mm/dd
  const formattedDate = `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
  return formattedDate;
}

/**
 * Removes an element from an array of objects by ID
 * 
 * @param {Array<Object>} array - Array of objects
 * @param {*} idElement - ID value of the element to remove
 * @param {string} idName - Name of the ID property
 * @returns {Array<Object>} New array without the specified element
 * 
 * @example
 * DeleteElementfromArray(users, 5, "id_user") // Removes user with id_user = 5
 */
export function DeleteElementfromArray(array, idElement, idName) {
  const newTable = array.filter((element) => element[idName] !== idElement);
  return newTable;
}

/**
 * Validates if a username contains only allowed characters
 * Allowed: letters, underscore, hyphen, and period
 * 
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid
 */
export function isValidUsername(username) {
  // Expression régulière pour valider un username
  const rgx = /^[a-zA-Z_.-]+$/;
  // Vérifie si la chaîne ne contient  que des lettres,et _, -, .
  return rgx.test(username);
}

/**
 * Validates if an email address belongs to @aps.dz domain
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email ends with @aps.dz
 */
export function isValidEmail(email) {
  // Vérifier si l'adresse e-mail se termine par "@aps.dz"
  const rgx = /@aps\.dz$/;
  return rgx.test(email);
}

/**
 * Validates password strength and security requirements
 * Requirements:
 * - Length: 8-16 characters
 * - Must contain at least one letter
 * - Must contain at least one symbol
 * - Must contain at least one number
 * - Must not contain the username
 * 
 * @param {string} password - Password to validate
 * @param {string} username - Username to check against
 * @returns {boolean} True if password meets all requirements
 */
export function isValidPassword(password, username) {
  // Vérifier la longueur du mot de passe si elle ne respecte pas elle va sortir diretement de la fonction avec un false sinon si elle respecte elle continue l'execution du code
  if (password.length < 8 || password.length > 16) {
    return false;
  }
  // Vérifier s'il y a au moins un caractère, un symbole et un chiffre et ne ressemble pas a username
  const hasCharacter = /[a-zA-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasNotUsername = !password.includes(username);

  return hasCharacter && hasSymbol && hasNumber && hasNotUsername;
}

/**
 * Validates Algerian phone number format
 * Must be exactly 10 digits
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if phone number is valid (10 digits)
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Expression régulière pour vérifier si le numéro de téléphone contient uniquement des chiffres et a une longueur de 10 caractères
  const phoneNumberRegex = /^[0-9]{10}$/;
  return phoneNumberRegex.test(phoneNumber);
};

/**
 * Compares two strings for equality using locale comparison
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {boolean} True if strings are equal
 */
export const TwoEqualeString = (str1, str2) => {
  if (str1.localeCompare(str2) === 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Converts a date string to ISO date format (YYYY-MM-DD)
 * 
 * @param {string} dateString - Date string to convert
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const stringToDate = (dateString) => {
  const formattedDateString = dateString.slice(0, -4);
  const [year, month, day] = formattedDateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().split("T")[0];
};

/**
 * Extracts IPv4 address from IPv6-mapped IPv4 address
 * 
 * @param {string} ipv6 - IPv6 or IPv6-mapped IPv4 address
 * @returns {string} IPv4 address or original input if not IPv6-mapped
 * 
 * @example
 * ipv6ToIpv4("::ffff:192.168.1.1") // Returns: "192.168.1.1"
 */
export function ipv6ToIpv4(ipv6) {
  if (ipv6.includes("::ffff:")) {
    const ipv4Part = ipv6.split("::ffff:")[1];
    return ipv4Part;
  } else {
    return ipv6;
  }
}

/**
 * Compares two arrays and identifies existing and new elements
 * 
 * @param {Array<Object>} a - First array (existing items with id_index)
 * @param {Array<string>} b - Second array (names to compare)
 * @returns {Object} Object with exitedArray (existing IDs) and newArray (new items)
 */
export function compareArrays(a, b) {
  const exitedArray = [];
  const newArray = [];

  b.forEach((elementB) => {
    const found = a.find((elementA) => elementA.name === elementB);
    if (found) {
      exitedArray.push(found.id_index);
    } else {
      newArray.push(elementB);
    }
  });

  return { exitedArray, newArray };
}

/**
 * Compares two arrays dynamically based on specified attributes
 * 
 * @param {Array<Object>} a - First array
 * @param {Array<*>} b - Second array
 * @param {string} searchAtt - Attribute name to search by
 * @param {string} resultAtt - Attribute name to return
 * @returns {Object} Object with exitedArray and newArray
 */
export function compareDynamicArrays(a, b, searchAtt, resultAtt) {
  const exitedArray = [];
  const newArray = [];

  b.forEach((elementB) => {
    const found = a.find((elementA) => elementA[searchAtt] === elementB);
    if (found) {
      exitedArray.push(found[resultAtt]);
    } else {
      newArray.push(elementB);
    }
  });

  return { exitedArray, newArray };
}

/**
 * Finds the difference between two arrays
 * 
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {Object} Object with missingElements and extraElements
 */
export function compareArraysAndFindDifference(array1, array2) {
  const missingElements = array2.filter((item) => !array1.includes(item));
  const extraElements = array1.filter((item) => !array2.includes(item));

  return {
    missingElements,
    extraElements,
  };
}

/**
 * Sorts an array of objects in ascending order by a specified attribute
 * 
 * @param {Array<Object>} array - Array to sort
 * @param {string} att - Attribute name to sort by
 * @returns {Array<Object>} Sorted array
 */
export function sortedAscendingArray(array, att) {
  return array.sort((a, b) => (a[att] > b[att] ? 1 : b[att] > a[att] ? -1 : 0));
}

/**
 * Checks input for XSS and SQL injection attempts
 * Uses DOMPurify for XSS detection and regex for SQL patterns
 * Logs security violations to the server
 * 
 * @param {string} input - Input string to validate
 * @returns {Object} Object with isInjection (boolean) and type (string|null)
 * 
 * @security Critical security function - validates all user inputs
 */
export const checkXssSQL = (input) => {
  const cleanInput = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)|(--|;|\/\*|\*\/)/i;

  const isSqlInjection = sqlInjectionPattern.test(input);
  const isXssInjection = cleanInput !== input;

  // Log security violation if detected
  (isSqlInjection || isXssInjection) &&
    log.error(
      "L'utilisateur a saisi des balises HTML : " + input,
      "blocage",
      "Html Tags",
      220
    );
  return { isInjection: false, type: null };
};

/**
 * Blocks a user account due to security violations
 * Displays error notification and redirects to login
 * 
 * @async
 * @param {number} code - Block code indicating violation type
 * @param {string} api - Optional API endpoint for blocking
 * @returns {Promise<void>}
 * 
 * @security Critical security function - handles account blocking
 */
export const BloquerUser = async (code, api) => {
  try {
    if (!api) {
      await axios.put(
        import.meta.env.VITE_BASE_URL + "users/block",
        {
          userId: JSON.parse(
            localStorage.getItem("userId" + import.meta.env.VITE_LAN)
          ),
          blockCode: code,
        },
        { withCredentials: true }
      );
    } else {
      await axios.put(
        import.meta.env.VITE_BASE_URL + "users/" + api,
        {},
        { withCredentials: true }
      );
    }

    toast.error(
      "Votre compte est bloqué suite à une violation des conditions d'utilisation.",
      {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Clear session and redirect to login
    removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
    sessionStorage.clear();
    window.location.replace("/" + import.meta.env.VITE_LAN + "/login");
  } catch (error) {
    toast.error(error.message, {
      icon: mdiAlertCircleOutline,
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }
};

/**
 * Returns the French label for menu paths
 * Maps technical route names to user-friendly French labels
 * 
 * @param {string} parent - Parent menu item (e.g., "articles", "media", "logs")
 * @param {string} childName - Child menu item
 * @returns {string|undefined} French label for the path
 */
export function getEquivalentPath(parent, childName) {
  const equivalences = {
    articles: {
      edit: "Modification",
      add: "Création",
    },
    media: {
      infographies: "Infographies",
      cahiers: "Cahiers multimédia",
      galeries: "Galeries photos",
      videos: "Vidéos ",
    },
    logs: {
      articles: "Articles",
      blocage: "Blocage",
      categories: "Catégories",
      login_erreurs: "Erreurs de connexion",
      front: "Erreurs de saisie",
      roles: "Rôles",
      images: "Images",
      tags: "Tags",
      users: "Utilisateurs",
      sessions: "Sessions",
      abonne: "Abonnées",
      urgence: "Urgence",
    },
  };
  const equivalent = equivalences[parent][childName];
  if (equivalent) {
    return equivalent;
  }
}

/**
 * Splits article content into intro and full text sections
 * 
 * @param {string} content - Full content text
 * @param {string} separator - Separator string to split on
 * @returns {Object} Object with introtext and fulltext properties
 */
export const splitContent = (content, separator) => {
  const parts = content.split(separator);
  const introtext = parts[0] || "";
  const fulltext = parts.slice(1).join(separator) || "";
  return { introtext, fulltext };
};

/**
 * Validates if a URL belongs to allowed APS domains
 * Allowed domains: www.aps.dz, new-aps.aps.dz, new.aps.dz
 * Must use HTTPS protocol
 * 
 * @param {string} inputUrl - URL to validate
 * @returns {boolean} True if URL is valid and from allowed domain
 * 
 * @security Ensures only APS domains are accepted
 */
export const validateURL = (inputUrl) => {
  try {
    const urlObj = new URL(inputUrl);
    const allowedDomains = ["www.aps.dz", "new-aps.aps.dz", "new.aps.dz"];

    if (
      allowedDomains.includes(urlObj.hostname) &&
      urlObj.protocol === "https:"
    ) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Formats date object for API consumption (ISO format)
 * Handles both Day.js objects and native Date objects
 * 
 * @param {Date|Object} dateObject - Date or Day.js object
 * @returns {string|null} ISO formatted date string or null if invalid
 */
export function formatDateForApi(dateObject) {
  // Try to convert to Day.js if not already one
  if (!dayjs.isDayjs(dateObject)) {
    const parsed = dayjs(dateObject);
    if (!parsed.isValid()) return null;
    dateObject = parsed.toDate();
  } else {
    dateObject = dateObject.toDate();
  }

  if (!(dateObject instanceof Date)) {
    return null;
  }
  return dateObject.toISOString();
}

/**
 * Checks if a date is in the future
 * 
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is in the future
 */
export function isDateInFuture(dateString) {
  const givenDate = new Date(dateString);
  const currentDate = new Date();

  // Comparer les deux dates
  return givenDate > currentDate;
}

/**
 * Checks if FormData contains elements other than a specified attribute
 * 
 * @param {FormData} formData - FormData object to check
 * @param {string} att - Attribute name to exclude (e.g., "articleId")
 * @returns {boolean} True if FormData has other elements
 */
export function hasOtherElementsThanAtt(formData, att) {
  if (!(formData instanceof FormData)) {
    //console.error("formData is not an instance of FormData");
    return false;
  }
  let hasOtherElements = false;
  formData.forEach((value, key) => {
    if (key !== "articleId") {
      hasOtherElements = true;
    }
  });

  return hasOtherElements;
}

/**
 * Checks if only one attribute in an object is set to true
 * 
 * @param {Object} objet - Object to check
 * @param {string} attribut - Attribute name (unused in current implementation)
 * @returns {boolean} True if exactly one attribute is true
 */
export const isOnlyAttributTrue = (objet, attribut) => {
  /* if (!objet.hasOwnProperty(attribut)) {
    return false;
  }
  if (!objet[attribut]) {
    return false;
  } */
  const trueCount = Object.values(objet).filter(
    (value) => value === true
  )?.length;
  return trueCount === 1;
};

/**
 * Cleans validation error messages by removing prefix
 * 
 * @param {string} message - Error message to clean
 * @returns {string} Cleaned error message
 */
export const cleanValidationError = (message) => {
  const prefix = "Input validation error";
  if (typeof message === "string" && message.startsWith(prefix)) {
    return message.slice(prefix.length).trim();
  }
  return message;
};

/**
 * Validates and cleans a string by removing HTML tags and checking for special characters
 * 
 * @param {string} input - String to validate and clean
 * @returns {Object} Object with isValid (boolean) and cleanedString (string)
 */
export function validateAndCleanString(input) {
  // Supprimer les tags HTML
  const cleanedString = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Définir un regex pour les caractères spéciaux
  const specialCharsRegex = /[./_\-]/;

  // Vérifier si le string nettoyé contient des caractères spéciaux
  const isValid = !specialCharsRegex.test(cleanedString);

  return { isValid, cleanedString };
}

/**
 * Removes language-specific keys from localStorage
 * Only clears keys that end with the specified language code
 * Preserves other localStorage data
 * 
 * @param {string} lang - Language code (e.g., "fr", "ar", "en")
 * @returns {void}
 * 
 * @example
 * removeLangKeysFromLocalStorage("fr") // Removes "userIdfr", "emailfr", etc.
 */
export function removeLangKeysFromLocalStorage(lang) {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.endsWith(lang)) {
      keysToRemove.push(key);
    }
  }

  // On supprime maintenant les clés trouvées
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
