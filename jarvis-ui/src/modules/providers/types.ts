export type ProviderName = "claude" | "codex" | "gemini";

export type ProviderConfig = {
  enabled: boolean;
  command: string;
  args: string[];
  inputMethod: "stdin";
  credentialEnvVar: string;
  timeoutSeconds: number;
  maxRetries: number;
  maxTokenSafetyLimit: number;
};

export type ProvidersManifest = {
  version: string;
  providers: Record<string, ProviderConfig>;
  fallbackOrder: string[];
  executionLogDir: string;
};
