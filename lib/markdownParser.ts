export function extractCodeFromMarkdown(text: string): string | null {
  const codeBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/;
  const match = text.match(codeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}
