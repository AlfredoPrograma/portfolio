import { defineCollection, z } from 'astro:content'
import { glob } from "astro/loaders"

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/articles" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
  })
})

export const collections = { articles }