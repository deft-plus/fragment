import type { Data } from 'lume/core/file.ts';

import { html } from '@/includes/helpers/templates.ts';
import { resolveStylesheetPath } from '@/includes/helpers/stylesheet_resolver.ts';
import { navigation } from '@/includes/components/navigation.ts';
import { asset } from '@/includes/helpers/asset.ts';

/**
 * Base layout for all pages.
 *
 * @param data - The data for the base layout.
 * @returns The base layout.
 */
function baseLayout(data: Data): string {
  const { title, description, content, page } = data;

  const stylePath = resolveStylesheetPath(page);

  return html`<!DOCTYPE html>

  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <title>${title}</title>
    <meta name="description" content="${description}" />

    <!--Fonts-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

    <!-- Styles -->
    <link href="${asset('/styles/layouts/base.css')}" rel="stylesheet" />
    <link href="${asset(`/styles${stylePath}.css`)}" rel="stylesheet" />
  </head>

  <body class="container">
    ${navigation}
    ${content}
  </body>

  </html>`;
}

export default baseLayout;
