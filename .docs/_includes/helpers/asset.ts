/**
 * Returns the URL of the asset based off if is a prod (Github pages) or dev (local) environment.
 *
 * @param url - The URL of the asset
 * @returns The URL of the asset
 */
export function asset(url: string): string {
  const isLocal = Deno.env.get('ENV') === 'dev';

  return isLocal ? url : `/fragment${url}`;
}
