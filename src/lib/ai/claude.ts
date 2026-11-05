import Anthropic from '@anthropic-ai/sdk';

// Pin a different model with ANTHROPIC_MODEL if needed.
const DEFAULT_MODEL = 'claude-haiku-5-5';

export function isClaudeConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Asks Claude for the raw JSON text of an answer.
 * The backup for when Gemini cannot answer; the prompts already ask for JSON only.
 */
export async function generateClaudeText({ system, prompt }: { system: string; prompt: string }): Promise<string> {
    const response = await new Anthropic().messages.create({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        system: `${system}\n\nReturn only the JSON object, with no text before or after it.`,
        messages: [{ role: 'user', content: prompt }],
    });

    if (response.stop_reason === 'refusal') throw new Error('Claude declined the request');
    if (response.stop_reason === 'max_tokens') throw new Error('Claude answer was cut off');

    return response.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('');
}
