// ============================================================================
// MODEL CONFIGURATION — single source of truth for all models.
// Add new models here; the adapter and UI will pick them up automatically.
// ============================================================================

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  available: boolean;
  url?: string; // optional direct endpoint override
}

export const models: ModelConfig[] = [
  {
    id: "fable",
    name: "Fable",
    description: "General-purpose conversational model",
    available: true,
  },
  {
    id: "gpt-6",
    name: "GPT-6",
    description: "Advanced reasoning and writing model",
    available: false, // Coming soon — no backend configured
  },
];

export function getModel(id: string): ModelConfig | undefined {
  return models.find((m) => m.id === id);
}

export function allAvailable(): ModelConfig[] {
  return models.filter((m) => m.available);
}
