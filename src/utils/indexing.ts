export interface SearchBuildEnvironment {
  SITE_ENV?: string;
  CI?: string;
  CF_PAGES?: string;
  CF_PAGES_BRANCH?: string;
  SITE_PRODUCTION_BRANCH?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  NETLIFY?: string;
  CONTEXT?: string;
}

const publicPagePaths = new Set(['/', '/services', '/solutions', '/blog']);

/** Only the requested public sections are eligible; explicit page-level noindex still wins. */
export function isPublicIndexingPath(pathname: string, base = '/'): boolean {
  const basePath = `/${base.split('/').filter(Boolean).join('/')}`;
  let path = pathname.replace(/\/+$/, '') || '/';

  if (basePath !== '/') {
    if (path === basePath) path = '/';
    else if (path.startsWith(`${basePath}/`)) path = path.slice(basePath.length);
    else return false;
  }

  return publicPagePaths.has(path) || /^\/(?:solutions|blog)\/[^/]+$/.test(path);
}

const hasFlag = (value: string | undefined): boolean => Boolean(value && !['0', 'false'].includes(value.toLowerCase()));

/** Preview contexts always win over an accidentally inherited production opt-in. */
export function isProductionSearchBuild(
  production: boolean,
  mode: string,
  environment: SearchBuildEnvironment
): boolean {
  if (!production || mode !== 'production') return false;
  if (environment.SITE_ENV !== undefined && environment.SITE_ENV !== 'production') return false;
  if (environment.VERCEL_ENV !== undefined && environment.VERCEL_ENV !== 'production') return false;
  if (environment.CONTEXT !== undefined && environment.CONTEXT !== 'production') return false;

  // Cloudflare Pages does not expose the configured production branch. Require it explicitly.
  if (hasFlag(environment.CF_PAGES)) {
    return Boolean(
      environment.SITE_ENV === 'production' &&
      environment.SITE_PRODUCTION_BRANCH &&
      environment.CF_PAGES_BRANCH === environment.SITE_PRODUCTION_BRANCH
    );
  }

  // An unidentified CI/hosting context must not accidentally publish an indexable preview.
  if (hasFlag(environment.CI) || hasFlag(environment.VERCEL) || hasFlag(environment.NETLIFY)) {
    return (
      environment.SITE_ENV === 'production' ||
      environment.VERCEL_ENV === 'production' ||
      environment.CONTEXT === 'production'
    );
  }

  // The existing local release command remains `npm run build`.
  return true;
}
