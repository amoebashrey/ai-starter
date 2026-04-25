import { describe, it, expect } from 'vitest';
import { buildSocraticPrompt, parseSocraticResponse } from '../promptBuilder';
import type { PromptInput } from '../promptBuilder';
import type { Concept, DialogueTurn } from '../../../types/mirror';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const concept: Concept = {
  id: 'llm-evals',
  label: 'LLM Evals',
  description: 'How you measure whether an LLM is actually working correctly', oneLineProvocation: 'Are you measuring preference or correctness?',
};

const firstUserMessage = "I think LLM evals are basically user testing for prompts.";

// ─── buildSocraticPrompt ──────────────────────────────────────────────────────

describe('buildSocraticPrompt', () => {
  it('returns a non-empty system instruction', () => {
    const input: PromptInput = {
      concept,
      userMessage: firstUserMessage,
      history: [],
      currentStatus: 'cracked',
    };
    const { systemInstruction } = buildSocraticPrompt(input);
    expect(systemInstruction.length).toBeGreaterThan(50);
    expect(systemInstruction).toContain('Socratic');
  });

  it('prepends concept context to the first user message', () => {
    const input: PromptInput = {
      concept,
      userMessage: firstUserMessage,
      history: [],
      currentStatus: 'cracked',
    };
    const { userMessage } = buildSocraticPrompt(input);
    expect(userMessage).toContain('LLM Evals');
    expect(userMessage).toContain(firstUserMessage);
  });

  it('does NOT prepend context again on subsequent turns', () => {
    const history: DialogueTurn[] = [
      { role: 'user', content: firstUserMessage, timestamp: 1 },
      { role: 'assistant', content: 'Which one ships?', timestamp: 2 },
    ];
    const input: PromptInput = {
      concept,
      userMessage: 'I would ship Prompt B.',
      history,
      currentStatus: 'shaky',
    };
    const { userMessage } = buildSocraticPrompt(input);
    // On turn 2, the raw user message should NOT have the context prefix
    expect(userMessage).toBe('I would ship Prompt B.');
  });

  it('maps history turns to correct Gemini roles', () => {
    const history: DialogueTurn[] = [
      { role: 'user', content: firstUserMessage, timestamp: 1 },
      { role: 'assistant', content: 'Which one ships?', timestamp: 2 },
    ];
    const input: PromptInput = { concept, userMessage: 'Prompt B.', history, currentStatus: 'shaky' };
    const { history: geminiHistory } = buildSocraticPrompt(input);

    expect(geminiHistory[0].role).toBe('user');
    expect(geminiHistory[1].role).toBe('model');
  });
});

// ─── parseSocraticResponse ────────────────────────────────────────────────────

describe('parseSocraticResponse', () => {
  it('parses a valid JSON response correctly', () => {
    const raw = JSON.stringify({
      message: 'Which metric are you optimising for?',
      updatedStatus: 'shaky',
      conceptComplete: false,
    });
    const result = parseSocraticResponse(raw);
    expect(result.message).toBe('Which metric are you optimising for?');
    expect(result.updatedStatus).toBe('shaky');
    expect(result.conceptComplete).toBe(false);
  });

  it('extracts keySynthesis when concept is complete', () => {
    const raw = JSON.stringify({
      message: 'Right — user feedback and offline evals measure different things.',
      updatedStatus: 'solid',
      conceptComplete: true,
      keySynthesis: 'LLM evals are not one thing.',
    });
    const result = parseSocraticResponse(raw);
    expect(result.conceptComplete).toBe(true);
    expect(result.keySynthesis).toBe('LLM evals are not one thing.');
  });

  it('strips markdown code fences from model output', () => {
    const raw = '```json\n{"message":"test","updatedStatus":"solid","conceptComplete":false}\n```';
    const result = parseSocraticResponse(raw);
    expect(result.message).toBe('test');
    expect(result.updatedStatus).toBe('solid');
  });

  it('falls back gracefully on malformed JSON', () => {
    const result = parseSocraticResponse('not json at all {{');
    expect(result.message).toBeTruthy();
    expect(result.updatedStatus).toBe('cracked');
    expect(result.conceptComplete).toBe(false);
  });

  it('falls back on invalid status value', () => {
    const raw = JSON.stringify({
      message: 'Test',
      updatedStatus: 'INVALID_STATE',
      conceptComplete: false,
    });
    const result = parseSocraticResponse(raw);
    expect(result.updatedStatus).toBe('cracked');
  });

  it('does not include keySynthesis when conceptComplete is false', () => {
    const raw = JSON.stringify({
      message: 'Test',
      updatedStatus: 'shaky',
      conceptComplete: false,
      keySynthesis: 'Should be ignored',
    });
    const result = parseSocraticResponse(raw);
    expect(result.keySynthesis).toBeUndefined();
  });
});
