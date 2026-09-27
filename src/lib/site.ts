import tagColors from '../data/tag_colors.yml';
import sectionsData from '../data/sections.yml';

export const SITE = {
  title: 'mitorow',
  /** 左上に表示するサイト名 */
  logo: 'mitorow.com',
  description: '個人の活動記録・ブログ・作品置き場',
  github: 'https://github.com/toarutoa',
};

export interface Section {
  slug: string;
  label: string;
  note?: string;
  color?: string;
  /** src/components/Icon.astro のアイコン名。無ければ image が使われる */
  icon?: string;
  image?: string | null;
}

/** Service / Arts / Games の3セクション(src/data/sections.yml で編集) */
export const SECTIONS = sectionsData as Section[];

export interface NavItem {
  href: string;
  label: string;
}

/**
 * サブヘッダーのナビ。並び順はこの配列のとおり。
 * Service / Arts / Games は sections.yml から自動で入ります。
 */
export const NAV: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/blog/', label: 'Blog' },
  ...SECTIONS.map((s) => ({ href: `/${s.slug}/`, label: s.label })),
  { href: '/ai/', label: 'AI' },
];

/**
 * タグの色を決める。
 * src/data/tag_colors.yml に書いてあればその色、なければ名前から自動で割り当てる。
 */
export function tagChip(tag: string): string {
  const fixed = (tagColors as Record<string, string>)[tag];
  return fixed ?? `chip-${[...tag].length % 8}`;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
