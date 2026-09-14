import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate(): boolean | Promise<boolean>;
}

/** Applied to routes whose component can have an editor open with unsaved
 * changes — prompts before navigating away instead of silently discarding
 * an in-progress edit. */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) =>
  component.canDeactivate();
