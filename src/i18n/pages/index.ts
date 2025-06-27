import type { Language } from "@i18n/utils";

export const translations = {
  en: {
    "navbar.about": "About",
    "navbar.projects": "Projects",
    "navbar.contact": "Contact", 

    "hero.career": "Software Developer & Cloud Engineer",
    "hero.tagline": "Cloud focused developer who thrives at the intersection of backend development and infrastructure management — turning business logic into performant systems and automating the path from commit to production.",
    "hero.view-my-work": "View my work",
    "hero.get-in-touch": "Get in touch",

    "projects.title": "Featured projects",
    "projects.diployable.title": "Diployable: Static web hosting service application",
    "projects.diployable.description": "Static web hosting service solution built with React, and Golang. Features include user authentication, sites and environments deploying and previewing.",
    "projects.view-code": "View code",
    "projects.go-to-app": "Go to app",

    "contact.title": "Let's work together",
    "contact.description": "I'm always interested in new opportunities and collaborations. Feel free to reach out if you'd like to discuss a project or just say hello.",
    "contact.download-resume": "Download resume",

    "footer.all-rights-reserved": "All rights reserved"
  },
  es: {
    "navbar.about": "Sobre mi",
    "navbar.projects": "Proyectos",
    "navbar.contact": "Contacto", 

    "hero.career": "Desarollador de Software e Ingeniero Cloud",
    "hero.tagline": "Desarrollador con enfoque en la nube, especializado en backend e infraestructura — dedicado al diseño de soluciones escalables y resilientes, automatización de pipelines CI/CD y optimización del ciclo completo de entrega, desde el primer commit hasta el despliegue.",
    "hero.view-my-work": "Ver proyectos",
    "hero.get-in-touch": "Contáctame",

    "projects.title": "Proyectos destacados",
    "projects.diployable.title": "Diployable: Hosting y despliegue de sitios web estáticos",
    "projects.diployable.description": "Solución de servicio de alojamiento web estático construido con React, y Golang. Las características incluyen la autenticación de usuarios, sitios y entornos de despliegue y vista previa.",
    "projects.view-code": "Ver código",
    "projects.go-to-app": "Ir a la aplicación",

    "contact.title": "Trabajemos juntos",
    "contact.description": "Siempre estoy abierto a nuevas oportunidades y colaboraciones. No dudes en contactarme si quieres conversar sobre un proyecto o simplemente saludar.",
    "contact.download-resume": "Descargar CV",


    "footer.all-rights-reserved": "Todos los derechos reservados"
  },
} as const

export function translate(lang: Language) {
  return function t(key: keyof typeof translations[typeof lang]) {
    return translations[lang][key]
  }
}