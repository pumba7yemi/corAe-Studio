export type BrandTheme = {
  name: string;           // "corAe" | "Choice Plus" | etc.
  logoText?: string;      // text mark
  primary: string;        // #hex or hsl()
  surface: string;        // background
  text: string;           // body text color
  muted: string;          // secondary text
  radius?: string;        // e.g., "16px"
};

export type TenantID = string;

export type BrandConfig = {
  tenantId: TenantID;
  theme: BrandTheme;
};
