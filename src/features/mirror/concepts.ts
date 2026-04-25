import type { Concept } from '../../types/mirror';

export const CONCEPTS: Concept[] = [
  {
    id: 'llm-evals',
    label: 'LLM Evals',
    description: 'How you measure whether an LLM is actually working correctly',
    oneLineProvocation: 'Are you measuring preference or correctness?',
  },
  {
    id: 'prompts-as-product',
    label: 'Prompts as Product',
    description: 'Prompts are versioned product surfaces, not strings',
    oneLineProvocation: 'When did you last A/B test a prompt change?',
  },
  {
    id: 'hallucinations',
    label: 'Hallucinations & Reliability',
    description: 'How you ship with non-deterministic output',
    oneLineProvocation: 'Whose problem is a confident wrong answer?',
  },
  {
    id: 'agentic-systems',
    label: 'Agentic Systems',
    description: 'Multi-step LLM workflows that take actions',
    oneLineProvocation: 'What can your agent do that you would not let an intern do?',
  },
  {
    id: 'rag',
    label: 'RAG',
    description: 'Retrieval-augmented generation — grounding LLMs in your data',
    oneLineProvocation: 'Is the failure mode wrong retrieval or wrong synthesis?',
  },
  {
    id: 'model-selection',
    label: 'Model Selection',
    description: 'Choosing the right model for the job',
    oneLineProvocation: 'Why is GPT-5 not always the answer?',
  },
  {
    id: 'latency-cost',
    label: 'Latency vs Cost',
    description: 'The trade-off triangle: latency, cost, quality',
    oneLineProvocation: 'Which axis is your user willing to sacrifice?',
  },
];

export const CONCEPTS_BY_ID = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c])
) as Record<string, Concept>;
