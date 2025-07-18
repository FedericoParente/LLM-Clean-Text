import React, { useState, useCallback } from 'react';

// Simple transliteration + sanitization map for common Unicode punctuation & Latin accents
const basicReplacements: Record<string, string> = {
  // Quotes
  '“': '"', '”': '"', '„': '"', '«': '"', '»': '"', '‘': "'", '’': "'", '‚': "'", '′': "'", '″': '"',
  // Dashes & hyphens
  '–': '-', '—': '-', '‐': '-', '‑': '-', '‒': '-',
  // Ellipsis
  '…': '...',
  // Misc
  '•': '*', '·': '.', '×': 'x', '÷': '/', '°': ' deg ', '€': 'EUR', '£': 'GBP', '¥': 'YEN', '¢': 'c', '©': '(c)', '®': '(R)', '™': '(TM)',
};

// Precompiled regex for performance
const combiningMarks = /[\u0300-\u036f]/g; // accents after NFD

function transliterateToASCII(input: string): string {
  // 1. Normalize to NFD (decompose accents)
  let s = input.normalize('NFD');
  // 2. Replace common punctuation & symbols first
  s = s.replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch => basicReplacements[ch] || '');
  // 3. Strip combining marks
  s = s.replace(combiningMarks, '');
  // 4. Replace any remaining non-ASCII chars with '' (drop)
  s = s.replace(/[^\x00-\x7F]/g, '');
  // 5. Collapse excessive whitespace
  s = s.replace(/[ \t]+/g, ' ');
  // 6. Normalize newlines (keep multiline structure)
  s = s.replace(/\r\n?/g, '\n');
  // 7. Trim trailing spaces on lines
  s = s.split('\n').map(line => line.trimEnd()).join('\n');
  return s.trim();
}

const sampleText = `Paste or type here…
Français naïve façade – “quotes” — dashes…
Symbols: © 2025 — 45° €100 ™
中文, русский, عربى will be removed.`;

const App: React.FC = () => {
  const [input, setInput] = useState(sampleText);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ inChars: 0, outChars: 0, removed: 0 });

  const convert = useCallback((text: string) => {
    const ascii = transliterateToASCII(text);
    setOutput(ascii);
    setStats({ inChars: text.length, outChars: ascii.length, removed: text.length - ascii.length });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    convert(val);
  };

  const handleCopy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii_output.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => { convert(input); }, []); // eslint-disable-line

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Unicode → ASCII Converter</h1>
        <p className="text-sm text-gray-600">Removes / transliterates common Unicode punctuation & accents; drops other non-ASCII chars.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col">
          <label className="font-semibold mb-2" htmlFor="input">Input (Unicode)</label>
          <textarea
            id="input"
            className="flex-1 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm focus:outline-none focus:ring"
            value={input}
            onChange={handleChange}
            placeholder="Paste your text here"
          />
          <div className="mt-2 text-xs text-gray-500">Characters: {stats.inChars}</div>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-2" htmlFor="output">Output (ASCII)</label>
          <textarea
            id="output"
            className="flex-1 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm bg-white"
            value={output}
            readOnly
          />
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>Characters: {stats.outChars}</span>
            <span>Removed: {stats.removed}</span>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleCopy} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 active:scale-[.98]">Copy</button>
            <button onClick={handleDownload} className="px-4 py-2 rounded-xl bg-gray-800 text-white font-semibold shadow hover:bg-black active:scale-[.98]">Download</button>
            <button onClick={() => { setInput(''); setOutput(''); setStats({ inChars: 0, outChars: 0, removed: 0 }); }} className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-700 active:scale-[.98]">Clear</button>
          </div>
        </div>
      </div>

      <section className="text-xs text-gray-500 space-y-1">
        <h2 className="font-semibold text-gray-600">Notes</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Accented Latin letters are decomposed and stripped to base ASCII (é → e, ß → ss via decomposition + drop, adjust manually if needed).</li>
          <li>Unmapped non-ASCII characters (e.g. CJK, Cyrillic) are removed entirely.</li>
          <li>Extend <code>basicReplacements</code> to add more mappings.</li>
          <li>Logic kept in <code>transliterateToASCII()</code> for easy reuse (e.g. server-side).</li>
        </ul>
      </section>
    </div>
  );
};

export default App;