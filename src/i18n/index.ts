// Traducciones (i18next). Teoría (La Persona · accesibilidad/inclusión): la app se adapta al idioma del usuario.
// Convención: la CLAVE es el texto en español, así el español no necesita archivo (clave = valor) y el inglés vive en en.json.
// Uso en componentes: `const { t } = useTranslation();` → t('Texto en español'); con variables: t('{{n}} ejercicios', { n }).
// En servicios/almacenes (sin hooks): `import i18n from 'i18next'` → i18n.t('...').
// Idiomas sin traducir (fr, de, it, pt) se muestran en inglés. Para añadir uno: crear su JSON y registrarlo en `resources`.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useSettings } from '../store/settings';
import en from './en.json';

void i18n.use(initReactI18next).init({
  lng: useSettings.getState().language,
  fallbackLng: { fr: ['en'], de: ['en'], it: ['en'], pt: ['en'], default: ['es'] },
  resources: { en: { translation: en } },
  keySeparator: false, // las claves son frases: pueden llevar puntos
  nsSeparator: false, // ...y dos puntos
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

// El ajuste persistido se carga de forma asíncrona: cualquier cambio de idioma (o su hidratación) se aplica al instante.
useSettings.subscribe((s, prev) => {
  if (s.language !== prev.language) void i18n.changeLanguage(s.language);
});

export default i18n;
