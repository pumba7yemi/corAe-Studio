// apps/studio/src/config/demo.ts
export type DemoFlagsShape = {
  DEMO_MODE?: boolean;
  DEMO_SANDBOX?: boolean;
  DEMO_AUTOPILOT?: boolean;
};

export const DemoFlags = {
  DEMO_MODE: process.env.DEMO_MODE === "1",
  DEMO_SANDBOX: process.env.DEMO_SANDBOX === "1",
  DEMO_AUTOPILOT: process.env.DEMO_AUTOPILOT === "1",
} as const;

export default DemoFlags;

export function assertDemo() {
  if (!(DemoFlags.DEMO_MODE && DemoFlags.DEMO_SANDBOX)) {
    throw new Error("Demo-only route");
  }
}
