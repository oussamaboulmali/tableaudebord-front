//Fonctions globals
import { mdiAlertCircleOutline } from "@mdi/js";
import axios from "axios";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import log from "../log/costumLog";

//fonction qui permet de convertir le premier lettre d'un menu item en majuscule
export function capitalizeFirstLetter(str) {
  return str?.length !== 0
    ? str?.charAt(0)?.toUpperCase() + str?.slice(1)?.toLowerCase()
    : undefined;
}

export function firstToLower(chaine) {
  return chaine?.charAt(0)?.toLowerCase() + chaine?.slice(1);
}

//fonction qui return les nom des icons selons le menu item cliquer
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

//
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

//un fonction qui permet de cacher les lettre d'email
export function HiddenLettreEmail(email) {
  const [nomUtilisateur, domaine] = email.split("@");
  const partieCachee =
    nomUtilisateur.substring(0, Math.max(2, 0)) +
    "*".repeat(Math.max(0, nomUtilisateur.length - 2));
  const emailCache = `${partieCachee}@${domaine}`;

  return emailCache;
}

//une fonction local pour la deconnexion .
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

    //localStorage.clear();
    sessionStorage.clear();
    removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
    window.location.replace("/" + import.meta.env.VITE_LAN + "/login");
  } catch (error) {
    //localStorage.clear();
    removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
    sessionStorage.clear();
    window.location.replace("/" + import.meta.env.VITE_LAN + "/login");

    /*  log.error("Ceci est un message d'erreur.");
    log.info("Ceci est un message d'information."); */
  }
};

//une fonction pour traiter si l'utilisateur n'a pas session
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

//formater une date vers une format lisible (chaine de caractere)
export function addTimestamp(date) {
  const timestamp = date.toISOString();
  return timestamp;
}

//formater la date en format francais
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

//formater la date en format arabe
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

// Supprimer un élément d'un tableau d'objets en utilisant son ID
export function DeleteElementfromArray(array, idElement, idName) {
  const newTable = array.filter((element) => element[idName] !== idElement);
  return newTable;
}

//verifier si un username saisie est valide
export function isValidUsername(username) {
  // Expression régulière pour valider un username
  const rgx = /^[a-zA-Z_.-]+$/;
  // Vérifie si la chaîne ne contient  que des lettres,et _, -, .
  return rgx.test(username);
}

//verifier sin yn email est valide
export function isValidEmail(email) {
  // Vérifier si l'adresse e-mail se termine par "@aps.dz"
  const rgx = /@aps\.dz$/;
  return rgx.test(email);
}

//verifier si un mot de passe respecte les régles imposés.
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

//verifier si un numero de telephone respecte les régles.
export const validatePhoneNumber = (phoneNumber) => {
  // Expression régulière pour vérifier si le numéro de téléphone contient uniquement des chiffres et a une longueur de 10 caractères
  const phoneNumberRegex = /^[0-9]{10}$/;
  return phoneNumberRegex.test(phoneNumber);
};

//verifier si deux chaine de caractere sont equivalante
export const TwoEqualeString = (str1, str2) => {
  if (str1.localeCompare(str2) === 0) {
    return true;
  } else {
    return false;
  }
};

//transformer une date de chaine de caractere a yne formats date
export const stringToDate = (dateString) => {
  const formattedDateString = dateString.slice(0, -4);
  const [year, month, day] = formattedDateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().split("T")[0];
};

//extraire la partie @ ipv4 d'une @ ipv6
export function ipv6ToIpv4(ipv6) {
  if (ipv6.includes("::ffff:")) {
    const ipv4Part = ipv6.split("::ffff:")[1];
    return ipv4Part;
  } else {
    return ipv6;
  }
}

//comparer deux tableau
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

//comparer deux tableau selon une condtion
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

//le différence entre deux tableaux
export function compareArraysAndFindDifference(array1, array2) {
  const missingElements = array2.filter((item) => !array1.includes(item));
  const extraElements = array1.filter((item) => !array2.includes(item));

  return {
    missingElements,
    extraElements,
  };
}

export function sortedAscendingArray(array, att) {
  return array.sort((a, b) => (a[att] > b[att] ? 1 : b[att] > a[att] ? -1 : 0));
}

export const checkXssSQL = (input) => {
  const cleanInput = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)|(--|;|\/\*|\*\/)/i;

  const isSqlInjection = sqlInjectionPattern.test(input);
  const isXssInjection = cleanInput !== input;

  /*  if (isSqlInjection && isXssInjection) {
    return { isInjection: true, type: "XSS et SQL injection" };
  } else if (isSqlInjection) {
    return { isInjection: true, type: "SQL Injection" };
  } else if (isXssInjection) {
    return { isInjection: true, type: "XSS Injection" };
  } else {
    return { isInjection: false, type: null };
  } */
  (isSqlInjection || isXssInjection) &&
    log.error(
      "L'utilisateur a saisi des balises HTML : " + input,
      "blocage",
      "Html Tags",
      220
    );
  return { isInjection: false, type: null };
};

//fonction pour bloquer un utilisateur en cas de violation des donnés
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

    //localStorage.clear();
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

export const splitContent = (content, separator) => {
  const parts = content.split(separator);
  const introtext = parts[0] || "";
  const fulltext = parts.slice(1).join(separator) || "";
  return { introtext, fulltext };
};

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

//une fonction pour convertir la date aux format adequate a l'apis
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

//tester si un adte est sup a celle d'ajourd'hui
export function isDateInFuture(dateString) {
  const givenDate = new Date(dateString);
  const currentDate = new Date();

  // Comparer les deux dates
  return givenDate > currentDate;
}

//tester si un array de type formData contient des les elements autre que att
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

export const cleanValidationError = (message) => {
  const prefix = "Input validation error";
  if (typeof message === "string" && message.startsWith(prefix)) {
    return message.slice(prefix.length).trim();
  }
  return message;
};

export function validateAndCleanString(input) {
  // Supprimer les tags HTML
  const cleanedString = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Définir un regex pour les caractères spéciaux
  const specialCharsRegex = /[./_\-]/;

  // Vérifier si le string nettoyé contient des caractères spéciaux
  const isValid = !specialCharsRegex.test(cleanedString);

  return { isValid, cleanedString };
}

//Clear localstorage seulement pour le ce site
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
