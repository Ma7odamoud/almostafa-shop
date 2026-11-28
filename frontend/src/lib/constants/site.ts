/** Public address of the shop, e.g. https://almostafa.com (no trailing slash). Read at request time. */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
