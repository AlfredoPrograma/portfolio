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
    role: "Cloud / DevOps Engineer",
    description:
      "Cloud / DevOps Engineer with over three years of experience operating cloud native systems in production. Specialized in CI/CD, containers, Linux, and AWS infrastructure for scalable web and backend platforms.",
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
        role: "Cloud Engineer / DevOps",
        period: "Nov 2023 - Present",
        highlights: [
          "Initialized and configured optimized Linux servers for production grade web services over HTTP and HTTPS, ensuring reliability, security, and performance.",
          "Designed and implemented CI/CD pipelines to automate test execution, container image builds, and application deployments, improving delivery speed and consistency.",
          "Provisioned, configured, and managed cloud infrastructure across the organization, including compute resources, networking, security configurations, and storage services.",
          "Implemented AWS services to support secure authentication flows and static asset delivery.",
        ],
      },
      {
        company: "Magnet.cl",
        role: "Full Stack Developer",
        period: "Oct 2022 — Nov 2023",
        highlights: [
          "Designed and supported a web based insurance simulator by exposing backend services and APIs that enabled profitability projections across multiple insurance products, collaborating with product teams to align system behavior with business requirements.",
          "Contributed to the development of a product recommendation engine for retail banking users by implementing backend logic and data integrations to match customers with relevant financial products, enhancing customer personalization and platform engagement.",
        ],
      },
      {
        company: "Ingeniust",
        role: "Full Stack Developer",
        period: "Feb 2022 — Oct 2022",
        highlights: [
          "Implemented an inventory management module within a web based ERP system, enhancing transaction traceability and stock control for over 150 products, improving operational efficiency and audit readiness.",
          "Designed and built the backend of a personal finance management platform using Golang and PostgreSQL, implementing complex business logic and transaction processing, and supporting a React based frontend with reliable APIs for financial data analysis and reporting.",
        ],
      },
      {
        company: "Classgap",
        role: "Software Development Tutor",
        period: "Oct 2021 — Feb 2022",
        highlights: [
          "Prepared over 30 students for online university projects and exams, resulting in improved academic performance and successful course completion.",
          "Mentored junior and inexperienced developers by resolving technical questions and accelerating their learning and problem solving skills.",
          "Earned 40 top rated reviews on the platform, demonstrating consistently high learner satisfaction and teaching effectiveness.",
        ],
      },
    ],
  },
  blogList: {
    title: "Blog",
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
    role: "Ingeniero Cloud / DevOps",
    description:
      "Ingeniero Cloud / DevOps con más de tres años de experiencia operando sistemas cloud nativos en producción. Especializado en CI/CD, contenedores, Linux e infraestructura AWS para plataformas web y backend escalables.",
    cta: "Contáctame",
  },
  latestArticles: {
    title: "Últimos artículos",
    description:
      "Ideas sobre desarrollo, diseño en la nube y los temas en constante evolución de backend, infraestructura y DevOps",
    viewAll: "Ver todos",
    readArticle: "Leer artículo",
  },
  experience: {
    title: "Experiencia profesional",
    subtitle:
      "Roles donde mezclo frontend, backend y AWS para lanzar productos financieros confiables",
    positions: [
      {
        company: "Magnet.cl",
        role: "Ingeniero Cloud / DevOps",
        period: "Nov 2023 - Presente",
        highlights: [
          "Inicialicé y configuré servidores Linux optimizados para servicios web en producción sobre HTTP y HTTPS, garantizando confiabilidad, seguridad y rendimiento.",
          "Diseñé e implementé pipelines de CI/CD para automatizar la ejecución de pruebas, la construcción de imágenes de contenedores y los despliegues de aplicaciones, mejorando la velocidad y consistencia de entrega.",
          "Provisioné, configuré y administré infraestructura en la nube para la organización, incluyendo cómputo, redes, configuraciones de seguridad y servicios de almacenamiento.",
          "Implementé servicios de AWS para soportar flujos de autenticación seguros y la entrega de activos estáticos.",
        ],
      },
      {
        company: "Magnet.cl",
        role: "Full Stack Developer",
        period: "Oct 2022 — Nov 2023",
        highlights: [
          "Diseñé y di soporte a un simulador de seguros web exponiendo servicios backend y APIs que permitieron proyectar rentabilidad en múltiples productos, colaborando con producto para alinear el comportamiento con los requisitos de negocio.",
          "Contribuí al desarrollo de un motor de recomendación para usuarios de banca retail implementando lógica backend e integraciones de datos para emparejar clientes con productos financieros relevantes, aumentando la personalización y el engagement de la plataforma.",
        ],
      },
      {
        company: "Ingeniust",
        role: "Full Stack Developer",
        period: "Feb 2022 — Oct 2022",
        highlights: [
          "Implementé un módulo de gestión de inventario dentro de un ERP web, mejorando la trazabilidad de transacciones y el control de stock de más de 150 productos, elevando la eficiencia operativa y la preparación para auditorías.",
          "Diseñé y construí el backend de una plataforma de finanzas personales con Golang y PostgreSQL, implementando lógica de negocio y procesamiento de transacciones complejos, y soportando un frontend en React con APIs confiables para análisis y reportes financieros.",
        ],
      },
      {
        company: "Classgap",
        role: "Tutor de Desarrollo de Software",
        period: "Oct 2021 — Feb 2022",
        highlights: [
          "Preparé a más de 30 estudiantes para proyectos y exámenes universitarios en línea, logrando mejoras de rendimiento y aprobación de cursos.",
          "Guié a desarrolladores junior y con poca experiencia resolviendo dudas técnicas y acelerando su aprendizaje y habilidades de resolución de problemas.",
          "Obtuve 40 reseñas de máxima calificación en la plataforma, demostrando satisfacción constante de los estudiantes y eficacia al enseñar.",
        ],
      },
    ],
  },
  blogList: {
    title: "Blog",
    description:
      "Ideas sobre desarrollo, arquitectura en la nube y los temas en constante evolución de backend, infraestructura y DevOps",
  },
  contact: {
    title: "Trabajemos juntos",
    description:
      "Siempre estoy interesado en nuevas oportunidades y colaboraciones. Escríbeme si quieres conversar sobre un proyecto o simplemente saludar",
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
