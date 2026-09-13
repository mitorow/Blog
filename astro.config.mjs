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
const isCaptionedImage = (node) =>
  node.type === 'element' && node.tagName === 'img' && node.properties?.title;

const toFigure = (img) => {
  // ホバー時のツールチップとしては出したくないので title は落とす
  const properties = { ...img.properties };
  const caption = String(properties.title);
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
        children: [{ type: 'text', value: caption }],
      },
    ],
  };
};

const imageCaptionPlugin = {
  name: 'image-caption',
  element: {
    // Markdown は画像を <p> の中に置くため、段落を見て回る
    filter: ['p'],
    visit(node) {
      const children = node.children ?? [];
      if (!children.some(isCaptionedImage)) return;

      // 画像の前後に文章があっても拾えるように、段落を分割しながら組み直す。
      // (画像の直前に空行が無いと、文章と画像が同じ段落になるため)
      const parts = [];
      let buffer = [];

      const flush = () => {
        const hasContent = buffer.some(
          (c) => !(c.type === 'text' && c.value.trim() === '')
        );
        if (hasContent) {
          parts.push({ type: 'element', tagName: 'p', properties: {}, children: buffer });
        }
        buffer = [];
      };

      for (const child of children) {
        if (isCaptionedImage(child)) {
          flush();
          parts.push(toFigure(child));
        } else {
          buffer.push(child);
        }
      }
      flush();

      if (parts.length === 1) return parts[0];

      // 複数に分かれたときだけ包む。display:contents なので見た目には影響しない
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['md-split'] },
        children: parts,
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
