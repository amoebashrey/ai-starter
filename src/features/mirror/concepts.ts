import type { Concept } from '../../types/mirror';

export const AI_PM_CONCEPTS: Concept[] = [
  {
    id: 'llm-evals',
    label: 'LLM Evals',
    description: 'How you measure whether an LLM is actually working correctly',
  },
  {
    id: 'prompts-as-product',
    label: 'Prompts as Product',
    description: 'Why prompts are a product surface, not just developer config',
  },
  {
    id: 'hallucinations',
    label: 'Hallucinations & Reliability',
    description: 'What hallucinations are and how PMs think about them in product decisions',
  },
  {
    id: 'agentic-systems',
    label: 'Agentic Systems',
    description: 'How AI agents differ from chatbots and what that means for product',
  },
  {
    id: 'rag',
    label: 'RAG',
    description: 'How retrieval-augmented generation works and when PMs need to care',
  },
  {
    id: 'model-selection',
    label: 'Model Selection',
    description: 'How to choose between models — and what trade-offs you own as PM',
  },
  {
    id: 'latency-vs-cost',
    label: 'Latency vs. Cost',
    description: 'The real trade-off loop PMs navigate when shipping AI features',
  },
];

/** O(1) lookup by id */
export const CONCEPT_MAP: Record<string, Concept> = Object.fromEntries(
  AI_PM_CONCEPTS.map((c) => [c.id, c]),
);
