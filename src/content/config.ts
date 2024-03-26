import { z, defineCollection, reference } from "astro:content"

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    repoUrl: z.string().optional(),
    thumbnail: z.object({
      src: z.string(),
      alt: z.string(),
      figcaption: z.string().optional()
    }),
    publishedAt: z.date(),
    description: z.string(),
    tags: z.array(reference('tags'))
  })
})

const tags = defineCollection({
  type: 'data',
  schema: z.object({
    label: z.string(),
    color: z.string()
  })
})

export const collections = {
  projects,
  tags
} 