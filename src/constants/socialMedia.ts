export type SocialMediaOption = 'Linkedin' | 'Github' | 'Gmail' | 'Resume';

export interface SocialMedia {
    text: string;
    href: string;
    icon: {
        pack: string
        name: string
    }
}

export const socialMedia: Record<SocialMediaOption, SocialMedia> = {
    Linkedin: {
        text: 'Linkedin',
        href: 'https://linkedin.com/in/alfredoprograma',
        icon: {
            pack: 'mdi',
            name: 'linkedin'
        },
    },
    Github: {
        text: 'Github',
        href: 'https://github.com/alfredoprograma',
        icon: {
            pack: 'mdi',
            name: 'github'
        }
    },
    Gmail: {
        text: 'Gmail',
        href: 'mailto:alfredoprograma.dev@gmail.com',
        icon: {
            pack: 'mdi',
            name: 'gmail'
        }
    },
    Resume: {
        text: 'Resume',
        // TODO: add resume link for download
        href: '#resume',
        icon: {
            pack: 'mdi',
            name: 'file'
        }
    }
}