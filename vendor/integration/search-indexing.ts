import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from 'astro';

import { isPublicIndexingPath } from '../../src/utils/indexing';

const attribute = (tag: string, name: string): string | undefined =>
  tag
    .match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
    ?.slice(1)
    .find((value) => value !== undefined);

/** Use the emitted HTML, including page/frontmatter overrides, as the sitemap's final authority. */
function hasIndexableRobots(html: string): boolean {
  let explicitlyIndexable = false;
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = attribute(tag, 'name')?.toLowerCase();
    if (!name || !['robots', 'googlebot', 'bingbot', 'baiduspider'].includes(name)) continue;
    const directives = (attribute(tag, 'content') ?? '').toLowerCase().split(/[\s,]+/);
    if (directives.includes('noindex') || directives.includes('none')) return false;
    if (name === 'robots' && directives.includes('index')) explicitlyIndexable = true;
  }
  return explicitlyIndexable;
}

export default function searchIndexing() {
  let config: AstroConfig | undefined;
  const acceptedPages = new Set<string>();

  function canonicalUrl(page: string): URL {
    const url = new URL(page);
    url.search = '';
    url.hash = '';
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    url.pathname = pathname === '/' || config?.trailingSlash !== 'always' ? pathname : `${pathname}/`;
    return url;
  }

  function filterSitemap(page: string): boolean {
    if (!config?.site) return false;
    const url = canonicalUrl(page);
    if (url.origin !== new URL(config.site).origin || !isPublicIndexingPath(url.pathname, config.base)) return false;

    const base = config.base.replace(/\/+$/, '');
    const relative = decodeURIComponent(url.pathname.slice(base.length)).replace(/^\/+|\/+$/g, '');
    if (relative.split('/').some((part) => part === '..' || part === '.')) return false;
    const outputRoot = fileURLToPath(config.outDir);
    const file = relative
      ? config.build.format === 'file'
        ? `${relative}.html`
        : path.join(relative, 'index.html')
      : 'index.html';
    const target = path.resolve(outputRoot, file);
    if (!target.startsWith(`${path.resolve(outputRoot)}${path.sep}`) || !fs.existsSync(target)) return false;
    if (!hasIndexableRobots(fs.readFileSync(target, 'utf8'))) return false;

    acceptedPages.add(url.href);
    return true;
  }

  function serializeSitemap<T extends { url: string }>(item: T): T {
    return { ...item, url: canonicalUrl(item.url).href };
  }

  const integration: AstroIntegration = {
    name: 'site-search-indexing',
    hooks: {
      'astro:build:start': () => {
        acceptedPages.clear();
      },
      'astro:config:done': ({ config: resolvedConfig }) => {
        config = resolvedConfig;
      },
      'astro:build:done': ({ dir, logger }) => {
        if (!config?.site) throw new Error('Search indexing requires a configured site URL.');
        const sitemapIndex = new URL('sitemap-index.xml', dir);
        const hasIndexablePages = acceptedPages.size > 0;
        if (hasIndexablePages && !fs.existsSync(sitemapIndex)) {
          throw new Error('Indexable HTML was generated, but sitemap-index.xml is missing.');
        }

        // A preview build must not retain a sitemap copied from a previous/public build.
        if (!hasIndexablePages) {
          for (const name of fs.readdirSync(dir)) {
            if (/^sitemap(?:-index|-\d+)\.xml$/.test(name)) fs.unlinkSync(new URL(name, dir));
          }
        }

        const sourceRobots = new URL('robots.txt', config.publicDir);
        const source = fs.existsSync(sourceRobots)
          ? fs.readFileSync(sourceRobots, 'utf8')
          : 'User-agent: *\nDisallow:\n';
        const robots = source.replace(/^Sitemap:.*(?:\r?\n|$)/gim, '').trimEnd();
        const sitemapBase = config.base.endsWith('/') ? config.base : `${config.base}/`;
        const sitemapUrl = new URL('sitemap-index.xml', new URL(sitemapBase, config.site));
        // @astrojs/sitemap strips the root slash for trailingSlash: never after serialize().
        // Restore only that root <loc>; non-root URLs keep the existing no-slash policy.
        if (hasIndexablePages) {
          const rootUrl = new URL(sitemapBase, config.site).href;
          const xmlUrl = (url: string) => url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          for (const name of fs.readdirSync(dir)) {
            if (!/^sitemap-\d+\.xml$/.test(name)) continue;
            const file = new URL(name, dir);
            const xml = fs.readFileSync(file, 'utf8');
            const normalized = xml.replaceAll(
              `<loc>${xmlUrl(rootUrl.replace(/\/$/, ''))}</loc>`,
              `<loc>${xmlUrl(rootUrl)}</loc>`
            );
            if (xml !== normalized) fs.writeFileSync(file, normalized);
          }
        }
        fs.writeFileSync(
          new URL('robots.txt', dir),
          `${robots}\n${hasIndexablePages ? `\nSitemap: ${sitemapUrl.href}\n` : ''}`
        );

        const sourceHeaders = new URL('_headers', config.publicDir);
        const headers = fs.existsSync(sourceHeaders) ? fs.readFileSync(sourceHeaders, 'utf8').trimEnd() : '';
        // Supported by static-asset hosts; HTML noindex remains authoritative on other servers.
        const previewHeaders = hasIndexablePages ? '' : '\n\n/*\n  X-Robots-Tag: noindex, nofollow';
        fs.writeFileSync(new URL('_headers', dir), `${headers}${previewHeaders}\n`);
        logger.info(
          `Search indexing: ${acceptedPages.size} indexable URLs; ${hasIndexablePages ? 'production sitemap retained' : 'no sitemap, preview headers enabled'}.`
        );
      },
    },
  };

  return { integration, filterSitemap, serializeSitemap };
}
