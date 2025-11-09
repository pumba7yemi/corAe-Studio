export const RAM = {
  async get(id: string, key: string) { return null },
  async set(id: string, key: string, value: any) { return { ok: true } },
  async del(id: string, key: string) { return { ok: true } }
};

export async function recall() { return [] }
export async function remember() { return { ok: true } }
