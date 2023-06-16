declare module '@turingpointde/cvss.js' {
  declare interface VectorMetric {
    fullName: string;
    value: string;
    abbr: string;
    valueAbbr: string;
  }
  declare interface VectorObject {
    CVSS: string;
  }
  declare interface DetailedVectorObject extends VectorObject {
    metrics: Record<'C' | 'V' | 'S', VectorMetric>;
  }
  export default function CVSS(vector: string): {
    vector: string;
    getScore: () => number;
    getTemporalScore: () => number;
    getEnvironmentalScore: () => number;
    getRating: () => string;
    getTemporalRating: () => string;
    getEnvironmentalRating: () => string;
    getVectorObject: () => VectorObject;
    getDetailedVectorObject: () => DetailedVectorObject;
    getVersion: () => string;
    getCleanVectorString: () => string;
    updateVectorValue: (metric: string, value: string) => string;
    isValid: true;
  };
}
