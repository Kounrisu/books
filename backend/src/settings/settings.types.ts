export interface UserSettingsRow {
  visibleColumns: string[] | null;
  visibleFilters: string[] | null;
}

export interface UpdateUserSettingsInput {
  visibleColumns?: string[];
  visibleFilters?: string[];
}
