import React, { useEffect, useRef, useState } from 'react';

interface VisualSurfaceProps {
  code: string;
  language: string;
}

const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    (async () => {
      try {
        const mermaid = await import('mermaid');
        const mm = mermaid.default;
        mm.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#2563eb',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#93c5fd',
            lineColor: '#64748b',
            secondaryColor: '#dbeafe',
            tertiaryColor: '#f0fdf4',
          },
          fontFamily: 'Inter, system-ui, sans-serif',
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const { svg } = await mm.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError('Pa t kapab trase dyagram nan');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <pre className="p-4 rounded-xl overflow-x-auto my-3 text-sm font-mono"
        style={{ background: '#0f172a', color: '#e2e8f0' }}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div className="my-4 flex justify-center overflow-x-auto">
      <div ref={ref} className="max-w-full" />
    </div>
  );
};

const TableSurface: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.trim().split('\n');
  const headers = lines[0]?.split('|').filter(h => h.trim()).map(h => h.trim()) || [];
  const rows = lines.slice(2).map(line =>
    line.split('|').filter(c => c.trim()).map(c => c.trim())
  ).filter(r => r.length > 0);

  if (headers.length === 0) return null;

  return (
    <div className="my-4 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-container)' }}>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: '1px solid var(--border-color)' }}
              className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-sm" style={{ color: 'var(--text-main)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VisualSurface: React.FC<VisualSurfaceProps> = ({ code, language }) => {
  switch (language) {
    case 'mermaid':
      return <MermaidDiagram code={code} />;
    case 'table':
      return <TableSurface code={code} />;
    default:
      return null;
  }
};

export { MermaidDiagram, TableSurface };
export default VisualSurface;
