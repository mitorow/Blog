import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import yaml from '@rollup/plugin-yaml';

/**
 * 画像にキャプションを付けるための変換。
 *
 *   ![代替テキスト](/assets/img/foo.jpg "ここがキャプション")
 *
 * と書くと <figure><img><figcaption>キャプション</figcaption></figure> になります。
 * キャプションを書かなかった画像はこれまで通り <img> のままです。
 */
const imageCaptionPlugin = {
  name: 'image-caption',
  element: {
    // 画像だけが入った段落を探す(Markdown は単独画像を <p> で包むため)
    filter: ['p'],
    visit(node) {
      const kids = (node.children ?? []).filter(
        (c) => !(c.type === 'text' && c.value.trim() === '')
      );
      if (kids.length !== 1) return;

      const img = kids[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;

      const caption = img.properties?.title;
      if (!caption) return;

      // ホバー時のツールチップとしては出したくないので title は落とす
      const properties = { ...img.properties };
      delete properties.title;

      return {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          { type: 'element', tagName: 'img', properties, children: [] },
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: String(caption) }],
          },
        ],
      };
    },
  },
};

export default defineConfig({
  site: 'https://mitorow.com',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [imageCaptionPlugin] }),
  },
  vite: {
    // src/data/*.yml を import できるようにする
    plugins: [yaml()],
  },
});
