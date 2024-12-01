declare module "marked" {
  export interface MarkedOptions {
    gfm?: boolean;
    breaks?: boolean;
    sanitize?: boolean;
  }

  export function marked(text: string, options?: MarkedOptions): string;
  export function setOptions(options: MarkedOptions): void;
  export function parse(text: string, options?: MarkedOptions): string;
}
