// Need "an" import for these declarations to be properly included in the TSC build
// doesn't matter if it's completely not used, just needs an import to be present
import '../App';
import * as Cypress from 'cypress';

declare global {
  interface Window {
    Cypress?: Cypress.Cypress;
  }
}
