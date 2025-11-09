import { exec as _exec } from "child_process";
import { promisify } from "util";
const exec = promisify(_exec);

export async function migrate(name = "agent_change") {
  return exec(`npx prisma migrate dev --schema=prisma/schema.prisma --name ${name}`);
}
