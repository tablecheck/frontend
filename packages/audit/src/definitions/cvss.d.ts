declare module '@turingpointde/cvss.js' {
  import { CVSS } from '@turingpointde/cvss.js/dist/cvss';
  export default CVSS;
}

declare module '@turingpointde/cvss.js/lib/util' {
  export function findMetric(abbr: string): {
    metrics: { abbr: string; numerical: number }[];
  };
}
