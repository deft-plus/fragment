import lume from 'lume/mod.ts';
import robots from 'lume/plugins/robots.ts';
import sass from 'lume/plugins/sass.ts';
import terser from 'lume/plugins/terser.ts';
import minifyHTML from 'lume/plugins/minify_html.ts';
import lightningCss from 'lume/plugins/lightningcss.ts';
import sitemap from 'lume/plugins/sitemap.ts';
import multilanguage from 'lume/plugins/multilanguage.ts';
import favicon from 'lume/plugins/favicon.ts';
import basePath from 'lume/plugins/base_path.ts';

const site = lume({
  cwd: new URL('.', import.meta.url).pathname,
  ...(Deno.env.get('ENV') === 'prod' &&
    { location: new URL('https://deft-plus.github.io/fragment') }),
});

if (Deno.env.get('ENV') === 'prod') {
  site.use(basePath());
}

site
  .ignore('README.md')
  .copy('assets')
  .use(multilanguage({
    languages: ['en'],
    defaultLanguage: 'en',
  }))
  .use(favicon())
  .use(robots())
  .use(sitemap())
  .use(sass({
    format: 'compressed',
  }))
  .use(terser({
    options: {
      compress: true,
      mangle: true,
    },
  }))
  .use(minifyHTML({
    options: {
      keep_closing_tags: true,
      minify_css: true,
      minify_js: true,
    },
  }))
  .use(lightningCss({
    options: {
      minify: true,
    },
  }));

export default site;
