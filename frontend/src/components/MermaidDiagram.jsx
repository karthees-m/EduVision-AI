import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#f3e8ff",
    primaryTextColor: "#4c1d95",
    primaryBorderColor: "#9333ea",
    lineColor: "#a855f7",
    fontFamily: "inherit",
  },
});

let diagramCounter = 0;

const MermaidDiagram = ({ code, title }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    diagramCounter += 1;
    const id = `mermaid-diagram-${diagramCounter}`;

    const render = async () => {
      try {
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled) setError(true);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) return null; 

  return (
    <div className="diagram-box">
      {title && <h5 className="diagram-title">{title}</h5>}
      <div className="mermaid-render" ref={containerRef} />
    </div>
  );
};

export default MermaidDiagram;
