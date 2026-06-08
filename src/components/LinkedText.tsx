const EMAIL_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

export function LinkedText({ text }: { text: string }) {
  const parts = text.split(EMAIL_RE);

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(EMAIL_RE)) {
          return (
            <a className="sf-mail-link" href={`mailto:${part}`} key={`${part}-${index}`}>
              {part}
            </a>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}
