export type FieldType =
  | 'text'
  | 'textarea'
  | 'html'
  | 'number'
  | 'boolean'
  | 'select'
  | 'image'
  | 'datetime';

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  default?: unknown;
  /** Folder/purpose used to name uploaded images descriptively. */
  uploadPurpose?: string;
  /** Hide this column in the list table. */
  hideInList?: boolean;
  /** Show in list table but never render as an editable form field or save it. */
  displayOnly?: boolean;
}

export interface CrudRow {
  id: string;
  [key: string]: unknown;
}
