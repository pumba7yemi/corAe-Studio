declare module "next" {
  /** Minimal ambient types to keep Next-specific imports happy during studio builds. */
  export type Metadata = any;
  export type LinkProps = any;
  export type ImageProps = any;
  export type Viewport = any;

  // default export placeholder
  const _next: any;
  export default _next;
}
