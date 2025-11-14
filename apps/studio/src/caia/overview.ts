import fs from "fs";
import path from "path";

export type CAIAPillar = {
  id: string;
  title: string;
  path: string;
};

const readAtlas = () => {
  const atlasPath = path.join(process.cwd(), ".corae", "caia.atlas.json");
  try {
    const txt = fs.readFileSync(atlasPath, "utf8");
    const parsed = JSON.parse(txt) as { pillars: CAIAPillar[] };
    return parsed;
  } catch (e) {
    return { pillars: [] as CAIAPillar[] };
  }
};

export const getAtlas = () => readAtlas();
export const getPillars = (): CAIAPillar[] => readAtlas().pillars;
export const getPillar = (id: string): CAIAPillar | undefined =>
  readAtlas().pillars.find((p: CAIAPillar) => p.id === id);
