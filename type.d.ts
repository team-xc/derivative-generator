declare interface TemplateConfig {
  input: Input[];
  replace: Replace[];
}

declare interface Input {
  key: string;
  default: string;
}

declare interface Replace {
  source: string;
  target: string;
}

declare interface ReplaceOptions {
  environmentMap: Map<string, string>
  replaceMap: Map<string, string>
}