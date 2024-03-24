import { z, defineCollection } from "astro:content"

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.string().transform(value => new Date(value)),
    description: z.string(),
  })
})

export const collections = {
  projects: projectsCollection 
}