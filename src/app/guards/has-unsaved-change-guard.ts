import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasChanges(): boolean;
}

// canDeactivate : s'exécute quand on QUITTE la page. false = on reste, true = on part
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasChanges() ||
  confirm('Vous avez des modifications non enregistrées. Quitter la page quand même ?');