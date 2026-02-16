declare module "kuromoji" {
  export interface Token {
    surface_form: string;
    reading?: string;
    pronunciation?: string;
  }

  export interface Builder {
    build(callback: (err: Error | null, tokenizer: Tokenizer) => void): void;
  }

  export interface Tokenizer {
    tokenize(text: string): Token[];
  }

  export function builder(options: { dicPath: string }): Builder;
}
