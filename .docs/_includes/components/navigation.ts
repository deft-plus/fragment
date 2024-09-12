import { html } from '@/includes/helpers/templates.ts';
import { asset } from '@/includes/helpers/asset.ts';

const logo = html`
  <a class="logo" href="${asset('/')}">
    <img src="/favicon.svg" alt="Logo" />
    <p>Fragment</p>
  </a>`;

const link = (href: string, content: string, blank: boolean) =>
  html`<li class="link"><a href="${href}" ${blank ? 'target="_blank"' : ''}>${content}</a></li>`;

const linksContent = [
  {
    href: 'https://jsr.io/@fragment',
    content: html`<img src="${asset('/assets/jsr-logo.svg')}" alt="JSR logo" width="30" />`,
    blank: true,
  },
  {
    href: 'https://github.com/deft-plus/fragment',
    content: html`<img src="${asset('/assets/github-logo.svg')}" alt="Github logo" width="20" />`,
    blank: true,
  },
  // { href: '/changelog', content: 'Changelog', blank: false },
];

const links = html`
  <ul class="links">
    ${linksContent.map(({ href, content, blank }) => link(href, content, blank)).join('')}
  </ul>`;

export const navigation = html`
  <nav class="navigation">
    <div class="container">
      ${logo}
      ${links}
    </div>
  </nav>
  <nav class="navigation offset"></nav>`;
