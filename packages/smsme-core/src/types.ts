export type SM_Risk = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "DESTRUCTIVE";

export type Field = {
  name: string;
  type: string;            // e.g., "int", "text", "decimal(10,2)", "uuid", "enum:Status"
  nullable?: boolean;      // default false
  default?: string | number | boolean | null;
  mappedName?: string | null; // DB @map compatibility
};

export type Index = {
  name?: string | null;
  fields: string[];        // order matters
  unique?: boolean;
};

export type Unique = {
  name?: string | null;
  fields: string[];
};

export type Model = {
  name: string;
  dbName?: string | null;
  fields: Field[];
  indexes?: Index[];
  uniques?: Unique[];
};

export type EnumDef = {
  name: string;
  values: string[];
};

export type Snapshot = {
  label?: string | null;
  schemaHash: string;      // computed
  createdAt: string;       // iso
  prismaVer?: string | null;
  models: Model[];
  enums?: EnumDef[];
};

export type StepKind =
  | "ADD_MODEL"
  | "DROP_MODEL"
  | "RENAME_MODEL"
  | "ADD_FIELD"
  | "DROP_FIELD"
  | "RENAME_FIELD"
  | "ALTER_FIELD_TYPE"
  | "SET_NOT_NULL"
  | "DROP_NOT_NULL"
  | "ADD_INDEX"
  | "DROP_INDEX"
  | "ADD_UNIQUE"
  | "DROP_UNIQUE"
  | "ADD_ENUM_VALUE"
  | "CUSTOM_SQL"
  | "CREATE_VIEW_SHIM"
  | "DROP_VIEW_SHIM"
  | "BACKFILL";

export type Step = {
  kind: StepKind;
  risk: SM_Risk;
  target?: string;                // e.g. "Item.unit" or "Order"
  payload?: Record<string, any>;  // args for generators
  notes?: string;
  order?: number;
};

export type Plan = {
  id: string;
  fromHash?: string | null;
  toHash: string;
  createdAt: string;
  status: "DRAFT" | "LOCKED" | "APPLIED";
  steps: Step[];
  riskSummary: Record<SM_Risk, number>;
  notes?: string;
};