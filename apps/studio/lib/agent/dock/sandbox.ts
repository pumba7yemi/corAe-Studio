import vm from "node:vm";
import crypto from "node:crypto";

export async function runInSandbox(code: string, api: object) {
  const context: any = { console, crypto, api };
  vm.createContext(context);
  const script = new vm.Script(code);
  return script.runInContext(context, { timeout: 10_000 });
}