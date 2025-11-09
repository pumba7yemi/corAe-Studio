// FILE: prisma.config.ts
// WHY: Removes the deprecation warning for `package.json#prisma`.

import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
});
