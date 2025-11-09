declare module "adm-zip" {
  export default class AdmZip {
    constructor(file?: string);
    addLocalFile(path: string, zipPath?: string): void;
    addFile(entryName: string, content: Buffer | string, comment?: string): void;
    extractAllTo(targetPath: string, overwrite?: boolean): void;
    toBuffer(): Buffer;
    writeZip(targetFile: string): void;
    getEntries(): Array<{ entryName: string; getData(): Buffer }>;
  }
}
