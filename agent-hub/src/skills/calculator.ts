/**
 * Calculator Skill
 * Safely evaluates math expressions in the browser.
 */

interface SkillInput {
  expression: string;
}

export async function execute(input: SkillInput): Promise<{ expression: string; result: number | string }> {
  const expr = input.expression;

  // Whitelist only safe characters
  const sanitized = expr.replace(/[^0-9+\-*/().%\s^eEπpi]/gi, '');
  if (sanitized.length === 0) {
    return { expression: expr, result: 'Error: invalid expression' };
  }

  try {
    // Replace common math constants
    const prepared = sanitized
      .replace(/π/gi, String(Math.PI))
      .replace(/\^/g, '**');

    const result = Function(`"use strict"; return (${prepared})`)();
    return {
      expression: expr,
      result: typeof result === 'number' ? Number(result.toFixed(10)) : result,
    };
  } catch (e: any) {
    return { expression: expr, result: `Error: ${e.message}` };
  }
}

export const skillMeta = {
  id: 'calculator',
  name: 'Calculator',
  description: 'Evaluate mathematical expressions safely.',
  category: 'Utility',
  parameters: {
    expression: {
      type: 'string',
      description: 'Math expression to evaluate (e.g. "2 + 3 * 4")',
      required: true,
    },
  },
};
