/** URL of a file in public/, wherever the site is served from (e.g. /portfolio/). */
export const asset = (path: string) => import.meta.env.BASE_URL + path
