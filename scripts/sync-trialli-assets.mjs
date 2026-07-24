import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'https://trialli.ru';
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorRoot = join(projectRoot, 'public', 'vendor', 'trialli');
const userAgent = 'Mozilla/5.0 (compatible; TrialliLocalAssets/1.0)';

const sharedStyles = new Set([
  '/bitrix/js/main/core/css/core.css',
  '/local/templates/trialli/components/bitrix/search.title/.default/style.css',
  '/local/templates/trialli/css/main.css',
  '/local/templates/trialli/css/fancybox.css',
  '/local/templates/trialli/css/custom.css',
  '/local/templates/trialli/npm/magnific-popup.css',
  '/local/templates/trialli/npm/swiper-bundle.min.css',
  '/local/templates/trialli/components/bitrix/form.result.new/vin/style.css',
  '/local/templates/trialli/css/template_styles.css',
  '/local/templates/trialli/css/adaptive_new.css',
]);

const sharedScripts = new Set([
  '/bitrix/js/main/core/core.js',
  '/local/templates/trialli/js/vendor/modernizr.js',
  '/local/templates/trialli/npm/jquery.min.js',
  '/local/templates/trialli/npm/jquery.custom-select.js',
  '/local/templates/trialli/npm/jquery.magnific-popup.min.js',
  '/local/templates/trialli/js/owl.min.js',
  '/local/templates/trialli/js/bootstrap.min.js',
  '/local/templates/trialli/npm/swiper-bundle.min.js',
  '/local/templates/trialli/js/custom.js',
  '/local/templates/trialli/js/cart.js',
  '/local/templates/trialli/js/fancybox.umd.js',
  '/local/templates/trialli/components/bitrix/menu/headerMobile/script.js',
  '/bitrix/components/bitrix/search.title/script.js',
]);

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function extractStyles(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];

  return tags
    .filter((tag) => /\brel=["'][^"']*stylesheet/i.test(tag))
    .map((tag) => tag.match(/\bhref=["']([^"']+)["']/i)?.[1])
    .filter(Boolean);
}

function extractScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]);
}

function localAssetPath(remoteUrl) {
  const url = new URL(remoteUrl, origin);

  if (url.origin === origin) {
    return join(vendorRoot, url.pathname);
  }

  return join(vendorRoot, 'external', url.hostname, url.pathname);
}

function publicAssetPath(remoteUrl) {
  const url = new URL(remoteUrl, origin);

  if (url.origin === origin) {
    return `/vendor/trialli${url.pathname}`;
  }

  return `/vendor/trialli/external/${url.hostname}${url.pathname}`;
}

function rewriteCssAndCollectDependencies(css, stylesheetUrl) {
  const dependencies = [];
  const rewritten = css.replace(
    /url\(\s*(?:(["'])(.*?)\1|([^)"']+))\s*\)/gi,
    (fullMatch, quote, quotedValue, bareValue) => {
      const value = (quotedValue ?? bareValue ?? '').trim();

      if (!value || /^(?:data:|blob:|#)/i.test(value)) {
        return fullMatch;
      }

      const dependencyUrl = new URL(value, stylesheetUrl);

      if (dependencyUrl.origin !== origin) {
        return fullMatch;
      }

      dependencyUrl.search = '';
      dependencyUrl.hash = '';
      dependencies.push(dependencyUrl.href);
      return `url("${publicAssetPath(dependencyUrl.href)}")`;
    },
  );

  return { rewritten, dependencies };
}

async function saveAsset(remoteUrl, kind) {
  const normalizedUrl = new URL(remoteUrl, origin);
  const buffer = await fetchBuffer(normalizedUrl);
  const destination = localAssetPath(normalizedUrl);
  let output = buffer;
  let dependencies = [];

  if (kind === 'style') {
    const result = rewriteCssAndCollectDependencies(buffer.toString('utf8'), normalizedUrl);
    output = Buffer.from(result.rewritten);
    dependencies = result.dependencies;
  }

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, output);

  return {
    source: normalizedUrl.href,
    publicPath: publicAssetPath(normalizedUrl.href),
    bytes: output.length,
    sha256: createHash('sha256').update(output).digest('hex'),
    dependencies,
  };
}

async function main() {
  const homeUrl = new URL('/', origin);
  const html = (await fetchBuffer(homeUrl)).toString('utf8');
  const styles = extractStyles(html);
  const scripts = extractScripts(html);
  const manifest = {
    origin,
    sourcePage: homeUrl.href,
    shared: {
      styles: [],
      scripts: [],
    },
    pageSpecific: {
      styles: [],
      scripts: [],
    },
    cssDependencies: [],
  };

  const dependencyUrls = new Set();

  for (const stylesheet of styles) {
    const asset = await saveAsset(stylesheet, 'style');
    const pathname = new URL(stylesheet, origin).pathname;
    const group = sharedStyles.has(pathname) ? manifest.shared.styles : manifest.pageSpecific.styles;
    group.push({ ...asset, dependencies: undefined });
    asset.dependencies.forEach((url) => dependencyUrls.add(url));
    console.log(`style  ${pathname}`);
  }

  for (const script of scripts) {
    const asset = await saveAsset(script, 'script');
    const pathname = new URL(script, origin).pathname;
    const group = sharedScripts.has(pathname) ? manifest.shared.scripts : manifest.pageSpecific.scripts;
    group.push({ ...asset, dependencies: undefined });
    console.log(`script ${new URL(script, origin).href}`);
  }

  for (const dependency of dependencyUrls) {
    const asset = await saveAsset(dependency, 'asset');
    manifest.cssDependencies.push({ ...asset, dependencies: undefined });
    console.log(`asset  ${new URL(dependency).pathname}`);
  }

  await mkdir(vendorRoot, { recursive: true });
  await writeFile(
    join(vendorRoot, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`\nSaved ${styles.length} styles, ${scripts.length} scripts, and ${dependencyUrls.size} CSS dependencies.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
