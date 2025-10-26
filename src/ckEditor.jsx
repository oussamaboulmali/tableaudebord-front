import { useState, useEffect, useRef, useMemo, useContext } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  PageBreak,
  Paragraph,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo,
  MediaEmbed,
} from "ckeditor5";
import { AuthContexte } from "./Context/AuthContext";
import "ckeditor5/ckeditor5.css";
import "./ckEditor.css";

const LICENSE_KEY = "GPL";

const translationsMap = {
  fr: () => import(/* @vite-ignore */ "ckeditor5/translations/fr.js"),
  ar: () => import(/* @vite-ignore */ "ckeditor5/translations/ar.js"),
  en: () => import(/* @vite-ignore */ "ckeditor5/translations/en.js"),
  es: () => import(/* @vite-ignore */ "ckeditor5/translations/es.js"),
  "tamazight-tif": () =>
    import(/* @vite-ignore */ "ckeditor5/translations/fr.js"),
  "tamazight-tal": () =>
    import(/* @vite-ignore */ "ckeditor5/translations/fr.js"),
  "tamazight-arb": () =>
    import(/* @vite-ignore */ "ckeditor5/translations/ar.js"),
  ru: () => import(/* @vite-ignore */ "ckeditor5/translations/ru.js"),
};

export default function CkEDitor({ initialData, handleChange }) {
  const { lang } = useContext(AuthContexte);
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [editorConfig, setEditorConfig] = useState(null);
  const selectedLanguage = lang || "fr";

  // Fonction pour charger le script Twitter
  const loadTwitterWidgets = () => {
    // Vérifier si le script existe déjà
    if (!document.getElementById("twitter-widgets")) {
      const script = document.createElement("script");
      script.id = "twitter-widgets";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Si le script existe déjà, il faut réinitialiser les widgets
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    }
  };

  useEffect(() => {
    const loadEditorConfig = async () => {
      let loadedTranslations = {};

      try {
        const importTranslation = translationsMap[selectedLanguage];
        if (importTranslation) {
          const translationModule = await importTranslation();
          loadedTranslations = translationModule.default || translationModule;
        }
      } catch (error) {
        console.warn("Erreur lors du chargement de la langue :", error);
      }

      setEditorConfig({
        mediaEmbed: {
          previewsInData: true,
          providers: [
            {
              name: "youtube",
              url: [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/],
              html: (match) =>
                `<iframe width="560" height="315" 
                src="https://www.youtube.com/embed/${match[1]}" 
                frameborder="0" allowfullscreen>
              </iframe>`,
            },
            {
              name: "twitter",
              url: [
                /twitter\.com\/.*\/status\/(\d+)/,
                /x\.com\/.*\/status\/(\d+)/,
              ],
              html: (match) =>
                `<blockquote class="twitter-tweet">
                  <a href="https://twitter.com/i/status/${match[1]}"> ${match[1]}</a>
                </blockquote>
               <script
                async
                src="https://platform.twitter.com/widgets.js"
                charset="utf-8"
              ></script>`,
            },
            {
              name: "facebook",
              url: [/facebook\.com\/([^\/]+)\/posts\/([^\/\?&]+)/],
              html: (match) =>
                `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F${match[1]}%2Fposts%2F${match[2]}" 
                width="500" height="500"
                style="border:none;overflow:hidden," 
                scrolling="no" frameborder="0" allowfullscreen="true">
              </iframe>`,
            },
          ],
        },
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "selectAll",
            "pageBreak",
            "link",
            "blockQuote",
            "|",
            "mediaEmbed",
          ],
          shouldNotGroupWhenFull: true,
        },
        plugins: [
          AccessibilityHelp,
          Alignment,
          AutoImage,
          AutoLink,
          Autosave,
          BlockQuote,
          Bold,
          Code,
          CodeBlock,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          Heading,
          Highlight,
          HorizontalLine,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          PageBreak,
          Paragraph,
          RemoveFormat,
          SelectAll,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Subscript,
          Superscript,
          Underline,
          Undo,
          MediaEmbed,
        ],
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true,
            },
          ],
        },
        initialData: initialData,
        language: {
          ui: selectedLanguage === "tamazight-arb" ? "ar" : selectedLanguage,
          content:
            selectedLanguage === "tamazight-arb" ? "ar" : selectedLanguage,
        },
        licenseKey: LICENSE_KEY,
        placeholder: "Saisir le contenu ici",
        translations: loadedTranslations ? [loadedTranslations] : [],
      });
    };

    if (isLayoutReady) {
      loadEditorConfig();
    }
  }, [selectedLanguage, isLayoutReady, initialData]);

  // Observer les changements dans l'éditeur pour Twitter widgets
  useEffect(() => {
    // Observer les changements dans l'éditeur
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          if (document.querySelector(".twitter-tweet")) {
            loadTwitterWidgets();
          }
        }
      });
    });

    // Cibler le conteneur de l'éditeur
    if (editorContainerRef.current) {
      observer.observe(editorContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [isLayoutReady]);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                data={initialData}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleChange(data);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
