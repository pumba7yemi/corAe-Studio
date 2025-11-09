// Minimal prismaToSnapshot shim to allow build-time imports
export function prismaToSnapshot(_schemaText: any, _label?: string) {
  return {} as any;
}

export default prismaToSnapshot;
