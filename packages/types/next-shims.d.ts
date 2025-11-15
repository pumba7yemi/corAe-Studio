// packages/types/next-shims.d.ts
// Temporary shims for Next.js subpath modules used by legacy Studio code.
// These provide minimal any-typed exports so the TypeScript build can proceed.

declare module "next/document" {
  import * as React from "react";

  export default class Document extends React.Component<any> {
    static getInitialProps: any;
  }

  export class Html extends React.Component<any> {}
  export class Head extends React.Component<any> {}
  export class Main extends React.Component<any> {}
  export class NextScript extends React.Component<any> {}
}

declare module "next/headers" {
  export function cookies(): any;
  export function headers(): any;
}

declare module "next/font/google" {
  export function __unsafeCreateFont<T = any>(config: T): any;
  export function Inter(config: any): any;
  export function Roboto(config: any): any;
}

declare module "next/dynamic" {
  const dynamic: any;
  export default dynamic;
}

declare module "next/image" {
  const Image: any;
  export default Image;
}

declare module "next/cache" {
  export const revalidateTag: any;
  export const revalidatePath: any;
}

// Shims for some workspace-local path imports that occasionally fail
declare module "@/src/caia/modules" {
  export const HOME_CORE: any;
  export const WORK_CORE: any;
  export const BUSINESS_CORE: any;
  export const BUSINESS_FRONT: any;
  const whatever: any;
  export default whatever;
}
