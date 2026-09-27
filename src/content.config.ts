import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ブログ記事: src/content/blog/*.md
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string().optional(),
  }),
});

// Works / Arts / Games / AI は同じ形なので schema を共有する
const itemSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  links: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .default([]),
  images: z.array(z.string()).default([]),
});

const itemCollection = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }),
    schema: itemSchema,
  });

export const collections = {
  blog,
  works: itemCollection('works'),
  arts: itemCollection('arts'),
  games: itemCollection('games'),
  ai: itemCollection('ai'),
};
