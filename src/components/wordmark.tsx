/**
 * Two-tone wordmark that matches the logo (last portion in the brand color).
 *  - Multi-word names ("Get Stack Wise") color the final word.
 *  - camelCase names ("StackWise") split at the second capital.
 *  - Anything else renders as plain bold text.
 */
export function Wordmark({ name }: { name: string }) {
  const trimmed = name.trim();

  // Multi-word: highlight the last word.
  if (trimmed.includes(' ')) {
    const idx = trimmed.lastIndexOf(' ');
    const head = trimmed.slice(0, idx);
    const tail = trimmed.slice(idx + 1);
    return (
      <span className="font-bold tracking-tight">
        <span className="text-foreground">{head} </span>
        <span className="text-primary">{tail}</span>
      </span>
    );
  }

  // camelCase: split at the second capital letter.
  const match = /^([A-Z][a-z0-9]*)([A-Z].*)$/.exec(trimmed);
  if (match) {
    const [, first, second] = match;
    return (
      <span className="font-bold tracking-tight">
        <span className="text-foreground">{first}</span>
        <span className="text-primary">{second}</span>
      </span>
    );
  }

  return <span className="font-bold">{trimmed}</span>;
}
