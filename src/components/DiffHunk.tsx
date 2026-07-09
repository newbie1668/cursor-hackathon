import "./DiffHunk.css";

interface DiffHunkProps {
  hunk: string;
}

export function DiffHunk({ hunk }: DiffHunkProps) {
  const lines = hunk.split("\n");

  return (
    <pre className="diff-block" aria-label="Diff hunk">
      {lines.map((line, i) => {
        let kind = "ctx";
        if (line.startsWith("+++") || line.startsWith("---")) kind = "meta";
        else if (line.startsWith("@@")) kind = "range";
        else if (line.startsWith("+")) kind = "add";
        else if (line.startsWith("-")) kind = "del";

        return (
          <div key={i} className={`diff-line diff-${kind}`}>
            <span className="diff-gutter" aria-hidden>
              {kind === "add" ? "+" : kind === "del" ? "−" : " "}
            </span>
            <span className="diff-text">{line || " "}</span>
          </div>
        );
      })}
    </pre>
  );
}
