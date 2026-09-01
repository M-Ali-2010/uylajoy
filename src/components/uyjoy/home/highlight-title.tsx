import type { ReactNode } from "react";

/**
 * Renders a headline with one word picked out, without hard-coding word order.
 * Each language supplies the full sentence plus the word to accent, so grammar
 * stays intact when the locale changes.
 */
export function HighlightTitle({
  text,
  highlight,
  className,
  accentClassName = "text-primary-bright",
}: {
  text: string;
  highlight: string;
  className?: string;
  accentClassName?: string;
}) {
  const at = highlight ? text.toLowerCase().indexOf(highlight.toLowerCase()) : -1;

  let content: ReactNode = text;
  if (at !== -1) {
    content = (
      <>
        {text.slice(0, at)}
        <span className={accentClassName}>{text.slice(at, at + highlight.length)}</span>
        {text.slice(at + highlight.length)}
      </>
    );
  }

  return <h1 className={className}>{content}</h1>;
}
