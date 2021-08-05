// Need "an" import for these declarations to be properly included in the TSC build
// doesn't matter if it's completely not used, just needs an import to be present
import '../App';

declare global {
  interface Window {
    // TODO fill in any extra undefined props here
    value: never;
  }
}
