import type { Lang } from "./config";

type NavStrings = {
  about: string;
  blog: string;
  contact: string;
  languageSwitcherLabel: string;
};

type HeroStrings = {
  name: string;
  role: string;
  description: string;
  cta: string;
};

type LatestArticlesStrings = {
  title: string;
  description: string;
  viewAll: string;
  readArticle: string;
};

type BlogListStrings = {
  title: string;
  description: string;
};

type ContactStrings = {
  title: string;
  description: string;
  emailIntro: string;
  emailLinkText: string;
  resumeCta: string;
};

type PostStrings = {
  backToBlog: string;
};

type MetaStrings = {
  brand: string;
  home: string;
  blog: string;
};

type LocaleStrings = {
  date: string;
};

export type UIStrings = {
  meta: MetaStrings;
  nav: NavStrings;
  hero: HeroStrings;
  latestArticles: LatestArticlesStrings;
  blogList: BlogListStrings;
  contact: ContactStrings;
  post: PostStrings;
  locale: LocaleStrings;
};

const ENGLISH_STRINGS: UIStrings = {
  meta: {
    brand: "AlfredoPrograma",
    home: "Portfolio",
    blog: "Blog",
  },
  nav: {
    about: "About",
    blog: "Blog",
    contact: "Contact",
    languageSwitcherLabel: "Language",
  },
  hero: {
    name: "Alfredo Arvelaez",
    role: "Software Developer & Cloud Engineer",
    description:
      "Cloud-focused developer who thrives at the intersection of backend engineering and infrastructure management, transforming business logic into high-performance systems",
    cta: "Get in touch",
  },
  latestArticles: {
    title: "Latest articles",
    description:
      "Thoughts on development, cloud design, and the ever-evolving backend, infrastructure and devops topics",
    viewAll: "View all",
    readArticle: "Read article",
  },
  blogList: {
    title: "WebBlog",
    description:
      "Thoughts on development, cloud design, and the ever-evolving backend, infrastructure and devops topics",
  },
  contact: {
    title: "Let's work together",
    description:
      "I'm always interested in new opportunities and collaborations. Feel free to reach out if you'd like to discuss a project or just say hello",
    emailIntro: "Or send me an email at",
    emailLinkText: "alfredoprograma.dev@gmail.com",
    resumeCta: "Download resume",
  },
  post: {
    backToBlog: "Back to blog",
  },
  locale: {
    date: "en-US",
  },
};

const SPANISH_STRINGS: UIStrings = {
  meta: {
    brand: "AlfredoPrograma",
    home: "Portafolio",
    blog: "Blog",
  },
  nav: {
    about: "Sobre mí",
    blog: "Blog",
    contact: "Contacto",
    languageSwitcherLabel: "Idioma",
  },
  hero: {
    name: "Alfredo Arvelaez",
    role: "Desarrollador de Software y Cloud Engineer",
    description:
      "Desarrollador enfocado en la nube que une backend e infraestructura para convertir la lógica de negocio en sistemas de alto rendimiento",
    cta: "Contáctame",
  },
  latestArticles: {
    title: "Últimos artículos",
    description:
      "Ideas sobre desarrollo, arquitectura en la nube y temas de backend, infraestructura y DevOps",
    viewAll: "Ver todos",
    readArticle: "Leer artículo",
  },
  blogList: {
    title: "Blog",
    description:
      "Ideas sobre desarrollo, arquitectura en la nube y temas de backend, infraestructura y DevOps",
  },
  contact: {
    title: "Trabajemos juntos",
    description:
      "Siempre estoy abierto a nuevas oportunidades y colaboraciones. Escríbeme si quieres conversar sobre un proyecto o simplemente saludar",
    emailIntro: "O envíame un correo a",
    emailLinkText: "alfredoprograma.dev@gmail.com",
    resumeCta: "Descargar CV",
  },
  post: {
    backToBlog: "Volver al blog",
  },
  locale: {
    date: "es-ES",
  },
};

const STRINGS: Record<Lang, UIStrings> = {
  en: ENGLISH_STRINGS,
  es: SPANISH_STRINGS,
};

export function getDictionary(lang: Lang): UIStrings {
  return STRINGS[lang];
}
