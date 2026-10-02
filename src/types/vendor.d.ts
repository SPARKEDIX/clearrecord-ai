/**
 * Ambient declarations for dependencies that ship without (or with
 * incomplete) TypeScript types.
 */

// pdfmake 0.2.x has no bundled types. Only the bits this app uses are typed.
declare module "pdfmake/build/pdfmake" {
  const pdfMake: {
    vfs?: Record<string, string>;
    createPdf(docDefinition: unknown): {
      download(filename?: string): void;
      open(): void;
      print(): void;
    };
  };
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  export const pdfMake: { vfs: Record<string, string> };
}

declare module "pdfmake/interfaces" {
  export interface TDocumentDefinitions {
    content?: unknown;
    styles?: Record<string, Record<string, unknown>>;
    defaultStyle?: Record<string, unknown>;
  }
}

declare module "*.svg" {
  const content: string;
  export default content;
}
