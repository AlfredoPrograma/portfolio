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

type ExperienceItemStrings = {
  company: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
};

type ExperienceStrings = {
  title: string;
  subtitle: string;
  positions: ExperienceItemStrings[];
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
  experience: ExperienceStrings;
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
  experience: {
    title: "Professional experience",
    subtitle:
      "Roles where I blend frontend craftsmanship, backend systems, and AWS to launch dependable financial products",
    positions: [
      {
        company: "Magnet.cl",
        role: "Semi Senior Software Developer",
        period: "Oct 2022 — Present",
        description:
          "Delivering end-to-end insurance and banking experiences for Chilean financial institutions alongside product and data teams",
        highlights: [
          "Designed and shipped a responsive insurance profitability simulator with React, TypeScript, and SASS to help business teams forecast performance.",
          "Led the UI build for a retail banking recommendation engine, collaborating with data engineers to boost platform engagement by 10%.",
          "Implemented AWS Rekognition facial authentication and orchestrated S3 + CloudFront delivery for a secure onboarding flow.",
        ],
      },
      {
        company: "Ingeniust C.A",
        role: "Junior Software Developer",
        period: "Feb 2022 — Oct 2022",
        description:
          "Supported multiple greenfield initiatives by building modular interfaces and data services for fintech and ERP clients",
        highlights: [
          "Implemented an ERP inventory management module improving traceability and stock control for 150+ products.",
          "Built a personal finance platform with a React frontend and Laravel/PostgreSQL backend, enabling responsive dashboards for transaction insights.",
        ],
      },
    ],
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
  experience: {
    title: "Experiencia profesional",
    subtitle:
      "Roles donde combino frontend, backend y AWS para lanzar productos financieros confiables",
    positions: [
      {
        company: "Magnet.cl",
        role: "Semi Senior Software Developer",
        period: "Oct 2022 — Presente",
        description:
          "Entrego experiencias de seguros y banca de manera integral para instituciones financieras chilenas, trabajando junto a equipos de producto y datos",
        highlights: [
          "Diseñé y lancé un simulador de rentabilidad de seguros con React, TypeScript y SASS para ayudar al negocio a proyectar resultados.",
          "Lideré la interfaz de un motor de recomendaciones bancarias, colaborando con data engineers para subir el uso de la plataforma en 10%.",
          "Implementé autenticación facial con AWS Rekognition y coordiné la entrega con S3 + CloudFront para un onboarding seguro.",
        ],
      },
      {
        company: "Ingeniust C.A",
        role: "Junior Software Developer",
        period: "Feb 2022 — Oct 2022",
        description:
          "Di soporte a iniciativas greenfield desarrollando interfaces modulares y servicios de datos para clientes fintech y ERP",
        highlights: [
          "Implementé un módulo de inventario para un ERP web que mejoró la trazabilidad y control de stock de más de 150 productos.",
          "Construí una plataforma de finanzas personales con frontend en React y backend en Laravel/PostgreSQL, ofreciendo dashboards responsivos para analizar transacciones.",
        ],
      },
    ],
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
