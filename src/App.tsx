import React, { useState, useCallback, useEffect } from 'react';

// --- Core Transliteration Logic ---
const basicReplacements: Record<string, string> = {
  '“': '"', '”': '"', '„': '"', '«': '"', '»': '"', '‘': "'", '’': "'", '‚': "'", '′': "'", '″': '"',
  '–': '-', '—': '-', '‐': '-', '‑': '-', '‒': '-',
  '…': '...',
  '•': '*', '·': '.', '×': 'x', '÷': '/', '°': ' deg ', '€': 'EUR', '£': 'GBP', '¥': 'YEN', '¢': 'c', '©': '(c)', '®': '(R)', '™': '(TM)'
};
const combiningMarks = /[\u0300-\u036f]/g;

function transliterateToASCII(input: string): string {
  if (!input) return '';
  let s = input.normalize('NFD');
  s = s.replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch => basicReplacements[ch] || '');
  s = s.replace(combiningMarks, '');
  s = s.replace(/[^\x00-\x7F]/g, '');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\r\n?/g, '\n');
  s = s.split('\n').map(l => l.trimEnd()).join('\n');
  return s.trim();
}

// --- Interactive Step Demo Logic ---
interface StepResult { text: string; desc: string; }
const sampleDemo = `Français naïve – “Ciao mondo!” — 25°...\nAltri simboli: © 中文`;

function buildSteps(): ((s: string) => StepResult)[] {
  return [
    (s) => ({ text: s, desc: 'Testo originale con accenti, punteggiatura speciale e caratteri non latini.' }),
    (s) => ({ text: s.normalize('NFD'), desc: 'Normalizzazione NFD: separa lettere e diacritici (é → e + accent).' }),
    (s) => ({ text: s.normalize('NFD').replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch => basicReplacements[ch] || ''), desc: 'Sostituzione punteggiatura speciale con ASCII.' }),
    (s) => ({ text: s.normalize('NFD').replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch => basicReplacements[ch] || '').replace(combiningMarks, ''), desc: 'Rimozione diacritici: restano solo lettere base.' }),
    (s) => ({ text: transliterateToASCII(s).replace(/[ \t]+/g, ' ').replace(/\r\n?/g, '\n').split('\n').map(l => l.trimEnd()).join('\n').trim(), desc: 'Eliminazione caratteri non ASCII (e.g. 中文).' }),
    (s) => ({ text: transliterateToASCII(s).replace(/\r\n?/g, '\n').split('\n').map(l => l.trimEnd()).join('\n').trim(), desc: 'Normalizzazione spazi multipli.' }),
    (s) => ({ text: transliterateToASCII(s), desc: 'Risultato finale pulito e compatibile ASCII.' })
  ];
}

const stepFns = buildSteps();

const initialText = `Paste or type here…\nFrançais naïve façade – “quotes” — dashes…\nSymbols: © 2025 — 45° €100 ™\n中文, русский, عربى will be removed.`;

const App: React.FC = () => {
  const [input, setInput] = useState(initialText);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ inChars: 0, outChars: 0, removed: 0 });
  const [demoStep, setDemoStep] = useState(0);
  const [demoResult, setDemoResult] = useState<StepResult>(stepFns[0](sampleDemo));
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

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
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llm-clean-text-output.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStats({ inChars: 0, outChars: 0, removed: 0 });
  };

  const selectStep = (idx: number) => {
    setDemoStep(idx);
    setDemoResult(stepFns[idx](sampleDemo));
  };

  useEffect(() => { convert(input); }, []); // init

  // Dark mode now applies to the entire page background when active
  const outerBg = dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800';
  const containerRing = dark ? 'ring-1 ring-slate-700/40' : 'ring-1 ring-transparent';
  const contentBase = dark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800';
  const heading = dark ? 'text-slate-50' : 'text-slate-900';
  const subheading = dark ? 'text-slate-400' : 'text-slate-600';
  const subtle = dark ? 'text-slate-500' : 'text-slate-500';
  const panel = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textIn = dark ? 'bg-slate-900 text-slate-100 border-slate-600 placeholder-slate-500' : 'bg-white text-slate-800 border-slate-300';
  const textOut = dark ? 'bg-slate-900 text-slate-100 border-slate-600' : 'bg-slate-50 text-slate-700 border-slate-300';
  const cardBase = dark ? 'bg-slate-800 border-slate-700 hover:shadow-md' : 'bg-white border-slate-200 hover:shadow-md';
  const demoBg = dark ? 'bg-slate-900' : 'bg-slate-100';

  return (
    <div className={`min-h-screen ${outerBg} px-4 py-10 md:py-14`}>      
      <div className={`max-w-7xl mx-auto transition-colors rounded-3xl ${contentBase} ${containerRing} shadow-xl px-6 md:px-10 pb-14 pt-10 flex flex-col gap-16`}>      
        {/* Header */}
        <header className="text-center relative">
          <h1 className={`text-4xl md:text-5xl font-bold ${heading}`}>LLM Clean Text</h1>
          <p className={`mt-2 text-lg ${subheading}`}>Pulisci, Semplifica, Rendi Compatibile il Tuo Testo.</p>
          <button
            onClick={() => setDark(d => !d)}
            className={`absolute right-0 top-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow ${dark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-50' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'}`}
            aria-label="Toggle dark mode"
          >{dark ? '🌞 Light' : '🌙 Dark'}</button>
        </header>

        {/* Converter Section */}
        <section id="converter" className={`${panel} p-6 md:p-8 rounded-2xl border transition-colors`}>        
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={`font-semibold mb-2 ${subheading}`} htmlFor="input-text">Input (Unicode)</label>
              <textarea
                id="input-text"
                className={`flex-1 w-full rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[260px] border ${textIn}`}
                value={input}
                onChange={handleChange}
                placeholder="Incolla il tuo testo qui..."
              />
              <div className={`mt-2 text-xs ${subtle}`}>Caratteri: {stats.inChars}</div>
            </div>
            <div className="flex flex-col">
              <label className={`font-semibold mb-2 ${subheading}`} htmlFor="output-text">Output (ASCII)</label>
              <textarea
                id="output-text"
                className={`flex-1 w-full rounded-xl p-4 font-mono text-sm focus:outline-none min-h-[260px] border ${textOut}`}
                readOnly
                value={output}
              />
              <div className={`mt-2 flex items-center gap-4 text-xs ${subtle}`}>
                <span>Caratteri: {stats.outChars}</span>
                <span className="text-red-500">Rimossi: {stats.removed}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
            <button onClick={handleCopy} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 active:scale-[.98] transition-transform">📋 Copia</button>
            <button onClick={handleDownload} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 active:scale-[.98] transition-transform">💾 Download</button>
            <button onClick={handleClear} className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 active:scale-[.98] transition-transform">🗑️ Pulisci</button>
          </div>
        </section>

        {/* Why Use It */}
        <section id="why-use-it" className="mt-2">
          <h2 className={`text-3xl font-bold text-center ${heading}`}>💡 Perché Usarlo?</h2>
          <p className={`text-center mt-2 max-w-3xl mx-auto ${subheading}`}>Il testo generato da LLM o copiato dal web può contenere caratteri nascosti che creano problemi. Ecco come ti aiutiamo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[{
              icon:'💧', title:'Rimuove "Watermark"', body:'Alcuni LLM inseriscono pattern invisibili. Li eliminiamo per una versione pulita.'
            },{
              icon:'🐛', title:'Risolve Errori di Layout', body:'Spazi a larghezza zero & co. rimossi per evitare glitch di formattazione.'
            },{
              icon:'🔗', title:'Garantisce Compatibilità', body:'Per sistemi legacy, DB e pipeline che richiedono solo ASCII.'
            },{
              icon:'🧹', title:'Prepara i Dati', body:'Testo pronto per logging, analisi, diff, ingestione ETL.'
            }].map(card => (
              <div key={card.title} className={`${cardBase} p-6 rounded-xl border transition-shadow`}>                
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-lg">{card.title}</h3>
                <p className={`text-sm ${subheading} mt-1`}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section id="how-it-works" className="mt-4">
          <h2 className={`text-3xl font-bold text-center ${heading}`}>⚙️ Come Funziona (Interattivo)</h2>
          <p className={`text-center mt-2 max-w-3xl mx-auto ${subheading}`}>Guarda come trasformiamo il testo passo dopo passo. Clicca sui passaggi per vedere la trasformazione.</p>
          <div className={`${panel} p-6 mt-8 rounded-2xl border transition-colors`}>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {['Originale','1. Normalizza','2. Sostituisci','3. Rimuovi Accenti','4. Rimuovi non-ASCII','5. Normalizza Spazi','6. Pulisci'].map((lbl,i)=>{
                const active = demoStep===i;
                return (
                  <button key={i} onClick={()=>selectStep(i)} className={`text-sm px-3 py-1.5 border rounded-full transition-all ${active? 'bg-blue-600 text-white border-blue-600':'border-slate-400 hover:border-blue-400 hover:text-blue-500'} ${dark && !active? 'bg-slate-700/40 text-slate-300':''}`}>{lbl}</button>
                );
              })}
            </div>
            <div className={`p-4 rounded-lg font-mono text-sm min-h-[110px] whitespace-pre-wrap break-words ${demoBg}`}>{demoResult.text}</div>
            <p className={`text-xs mt-2 text-center ${subheading}`}>{demoResult.desc}</p>
          </div>
        </section>

        {/* Notes */}
        <section className="text-xs space-y-1">
          <h2 className={`font-semibold ${subheading}`}>Note</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Lettere accentate → base ASCII; caratteri non latini eliminati.</li>
              <li>Estendi il mapping in <code>basicReplacements</code>.</li>
              <li>Riusabile server-side per sanitize pipeline.</li>
            </ul>
        </section>

        <footer className={`text-center mt-4 text-sm ${subtle}`}>
          <p>Rilasciato sotto licenza MIT. Nessun tracking. Solo testo pulito.</p>
          <p className="mt-1 opacity-70">Modalità: {dark ? 'Dark (full)' : 'Light'}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
