import React, { useState, useEffect } from 'react';

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

// --- i18n dictionary (metadata driven only) ---
const i18n = {
  en: {
    title: 'LLM Clean Text',
    subtitle: 'Clean, Simplify, Make Your Text Compatible.',
    inputLabel: 'Input (Unicode)',
    outputLabel: 'Output (ASCII)',
    chars: 'Characters',
    removed: 'Removed',
    copy: 'Copy',
    download: 'Download',
    clear: 'Clear',
    why: 'Why Use It?',
    whyDesc: 'LLM / web text may contain hidden characters that cause issues. Here is how we help.',
    cards: [
      { icon:'💧', title:'Removes "Watermarks"', body:'Some LLMs add invisible patterns. We strip them for a clean version.' },
      { icon:'🐛', title:'Fixes Layout Bugs', body:'Zero-width & odd spacing chars removed to prevent formatting glitches.' },
      { icon:'🔗', title:'Ensures Compatibility', body:'Legacy systems, DBs, parsers often expect pure ASCII.' },
      { icon:'🧹', title:'Preps the Data', body:'Ready for logging, diffing, analysis, ingestion.' }
    ],
    how: 'How It Works (Interactive)',
    howDesc: 'See each transformation step. Click the steps to preview the change.',
    steps: ['Original','1. Normalize','2. Replace','3. Strip Accents','4. Remove non-ASCII','5. Normalize Spaces','6. Clean'],
    demoStepDesc: [
      'Original sample with accents, special punctuation and non‑Latin.',
      'NFD normalization splits base letters and diacritics (é → e + accent).',
      'Replace special punctuation with ASCII equivalents.',
      'Remove diacritics (leave only base letters).',
      'Remove any non‑ASCII characters (e.g. 中文).',
      'Collapse multiple spaces for clean formatting.',
      'Final clean ASCII-compatible text.'
    ],
    notesTitle: 'Notes',
    notes: [
      'Accented Latin letters → base ASCII; non-Latin removed.',
      'Extend mapping in basicReplacements.',
      'Reusable server-side for pipeline sanitation.'
    ],
    license: 'Released under MIT. No tracking. Just clean text.',
    mode: (dark:boolean)=> `Mode: ${dark? 'Dark (full)': 'Light'}`,
    langToggle: 'IT',
    metaNotice: 'Language chosen from browser settings. Switch if wrong:'
  },
  it: {
    title: 'LLM Clean Text',
    subtitle: 'Pulisci, Semplifica, Rendi Compatibile il Tuo Testo.',
    inputLabel: 'Input (Unicode)',
    outputLabel: 'Output (ASCII)',
    chars: 'Caratteri',
    removed: 'Rimossi',
    copy: 'Copia',
    download: 'Download',
    clear: 'Pulisci',
    why: 'Perché Usarlo?',
    whyDesc: 'Il testo da LLM / web può contenere caratteri nascosti problematici. Ecco come aiutiamo.',
    cards: [
      { icon:'💧', title:'Rimuove "Watermark"', body:'Alcuni LLM inseriscono pattern invisibili. Li eliminiamo.' },
      { icon:'🐛', title:'Risolve Errori di Layout', body:'Caratteri a larghezza zero rimossi: niente glitch.' },
      { icon:'🔗', title:'Garantisce Compatibilità', body:'Sistemi legacy, DB e parser spesso vogliono solo ASCII.' },
      { icon:'🧹', title:'Prepara i Dati', body:'Pronto per logging, diff, analisi, ingestion.' }
    ],
    how: 'Come Funziona (Interattivo)',
    howDesc: 'Osserva ogni passaggio di trasformazione. Clicca per vedere l\'effetto.',
    steps: ['Originale','1. Normalizza','2. Sostituisci','3. Rimuovi Accenti','4. Rimuovi non-ASCII','5. Normalizza Spazi','6. Pulisci'],
    demoStepDesc: [
      'Testo originale con accenti, punteggiatura speciale e caratteri non latini.',
      'Normalizzazione NFD: separa lettere e diacritici (é → e + accent).',
      'Sostituisce punteggiatura speciale con ASCII.',
      'Rimuove i diacritici lasciando solo le lettere base.',
      'Rimuove i caratteri non ASCII (es. 中文).',
      'Comprimi spazi multipli in uno singolo.',
      'Testo finale pulito e compatibile ASCII.'
    ],
    notesTitle: 'Note',
    notes: [
      'Lettere accentate → base ASCII; caratteri non latini eliminati.',
      'Estendi il mapping in basicReplacements.',
      'Riusabile server-side per sanitize pipeline.'
    ],
    license: 'Rilasciato sotto licenza MIT. Nessun tracking. Solo testo pulito.',
    mode: (dark:boolean)=> `Modalità: ${dark? 'Dark (full)': 'Light'}`,
    langToggle: 'EN',
    metaNotice: 'Lingua scelta dai metadata del browser. Cambia se errata:'
  }
};

type Lang = keyof typeof i18n;

const sampleDemo = `Français naïve – “Ciao mondo!” — 25°...\nAltri simboli: © 中文`;

const buildStepFn = (lang: Lang) => {
  return i18n[lang].demoStepDesc.map((desc, idx) => (s: string) => {
    switch(idx){
      case 0: return { text: s, desc };
      case 1: return { text: s.normalize('NFD'), desc };
      case 2: return { text: s.normalize('NFD').replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch=>basicReplacements[ch]||''), desc };
      case 3: return { text: s.normalize('NFD').replace(/[“”„«»‘’‚′″–—‐‑‒…•·×÷°€£¥¢©®™]/g, ch=>basicReplacements[ch]||'').replace(combiningMarks,''), desc };
      case 4: return { text: transliterateToASCII(s).replace(/[ \t]+/g,' ').replace(/\r\n?/g,'\n').split('\n').map(l=>l.trimEnd()).join('\n').trim(), desc };
      case 5: return { text: transliterateToASCII(s).replace(/\r\n?/g,'\n').split('\n').map(l=>l.trimEnd()).join('\n').trim(), desc };
      case 6: return { text: transliterateToASCII(s), desc };
      default: return { text: s, desc };
    }
  });
};

const initialText = `Paste or type here…\nFrançais naïve façade – “quotes” — dashes…\nSymbols: © 2025 — 45° €100 ™\n中文, русский, عربى will be removed.`;

const App: React.FC = () => {
  // Language detection strictly from metadata (navigator.language + Accept-Language approximation) or stored pref
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('uct_lang');
      if (stored === 'it' || stored === 'en') return stored;
      const nav = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();
      if (nav.startsWith('it')) return 'it';
      // Heuristic: timeZone or Intl locale list
      if (Intl && (Intl as any).DateTimeFormat) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (/rome|vatican|san_marino|europe\/rome/i.test(tz)) return 'it';
      }
    }
    return 'en';
  });

  const [input, setInput] = useState(initialText);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ inChars: 0, outChars: 0, removed: 0 });
  const [demoStep, setDemoStep] = useState(0);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('uct_theme');
      if (saved === 'dark') return true; if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [stepFns, setStepFns] = useState(() => buildStepFn(lang));
  const [demoResult, setDemoResult] = useState(() => stepFns[0](sampleDemo));
  const D = i18n[lang];

  const convert = (text: string) => {
    const ascii = transliterateToASCII(text);
    setOutput(ascii);
    setStats({ inChars: text.length, outChars: ascii.length, removed: text.length - ascii.length });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    convert(val);
  };

  const handleCopy = async () => { if (!output) return; try { await navigator.clipboard.writeText(output); } catch {} };
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'llm-clean-text-output.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const handleClear = () => { setInput(''); setOutput(''); setStats({ inChars:0,outChars:0,removed:0 }); };
  const selectStep = (idx:number) => { setDemoStep(idx); setDemoResult(stepFns[idx](sampleDemo)); };

  useEffect(()=>{ convert(input); }, []); // init
  useEffect(()=>{ if (typeof window!== 'undefined') window.localStorage.setItem('uct_theme', dark? 'dark':'light'); },[dark]);
  useEffect(()=>{ if (typeof window!== 'undefined') window.localStorage.setItem('uct_lang', lang); },[lang]);

  // When language manually changed, rebuild steps
  useEffect(()=>{ const fns = buildStepFn(lang); setStepFns(fns); setDemoResult(fns[demoStep](sampleDemo)); /* eslint-disable-next-line */ },[lang]);
  useEffect(()=>{ setDemoResult(stepFns[demoStep](sampleDemo)); /* eslint-disable-next-line */ },[demoStep]);

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
    <div className={`min-h-screen ${outerBg} px-4 py-10 md:py-14 transition-colors`}>
      <div className={`max-w-7xl mx-auto transition-colors rounded-3xl ${contentBase} ${containerRing} shadow-xl px-6 md:px-10 pb-14 pt-10 flex flex-col gap-16`}>
        {/* Header */}
        <header className="text-center relative flex flex-col items-center">
          <h1 className={`text-4xl md:text-5xl font-bold ${heading}`}>{D.title}</h1>
          <p className={`mt-2 text-lg ${subheading}`}>{D.subtitle}</p>
          <div className="absolute right-0 top-0 flex gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow ${dark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-50' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'}`}
              aria-label="Toggle dark mode"
            >{dark ? '🌞' : '🌙'} {dark ? 'Light' : 'Dark'}</button>
            <button
              onClick={() => { const next = lang === 'it'? 'en':'it'; setLang(next); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow ${dark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-50' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'}`}
              aria-label="Toggle language"
            >{i18n[lang].langToggle}</button>
          </div>
          <div className={`mt-10 text-xs ${subheading}`}>{D.metaNotice} <span className="font-semibold">{lang.toUpperCase()}</span></div>
        </header>

        {/* Converter Section */}
        <section id="converter" className={`${panel} p-6 md:p-8 rounded-2xl border transition-colors`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className={`font-semibold mb-2 ${subheading}`} htmlFor="input-text">{D.inputLabel}</label>
              <textarea
                id="input-text"
                className={`flex-1 w-full rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[260px] border ${textIn}`}
                value={input}
                onChange={handleChange}
                placeholder={lang==='it'? 'Incolla il tuo testo qui...':'Paste your text here...'}
              />
              <div className={`mt-2 text-xs ${subtle}`}>{D.chars}: {stats.inChars}</div>
            </div>
            <div className="flex flex-col">
              <label className={`font-semibold mb-2 ${subheading}`} htmlFor="output-text">{D.outputLabel}</label>
              <textarea
                id="output-text"
                className={`flex-1 w-full rounded-xl p-4 font-mono text-sm focus:outline-none min-h-[260px] border ${textOut}`}
                readOnly
                value={output}
              />
              <div className={`mt-2 flex items-center gap-4 text-xs ${subtle}`}>
                <span>{D.chars}: {stats.outChars}</span>
                <span className="text-red-500">{D.removed}: {stats.removed}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
            <button onClick={handleCopy} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 active:scale-[.98] transition-transform">{D.copy}</button>
            <button onClick={handleDownload} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 active:scale-[.98] transition-transform">{D.download}</button>
            <button onClick={handleClear} className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 active:scale-[.98] transition-transform">{D.clear}</button>
          </div>
        </section>

        {/* Why Use It */}
        <section id="why-use-it" className="mt-2">
          <h2 className={`text-3xl font-bold text-center ${heading}`}>💡 {D.why}</h2>
          <p className={`text-center mt-2 max-w-3xl mx-auto ${subheading}`}>{D.whyDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {D.cards.map(card => (
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
          <h2 className={`text-3xl font-bold text-center ${heading}`}>⚙️ {D.how}</h2>
          <p className={`text-center mt-2 max-w-3xl mx-auto ${subheading}`}>{D.howDesc}</p>
          <div className={`${panel} p-6 mt-8 rounded-2xl border transition-colors`}>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {D.steps.map((lbl,i)=>{
                const active = demoStep===i; return (
                  <button key={i} onClick={()=>selectStep(i)} className={`text-sm px-3 py-1.5 border rounded-full transition-all ${active? 'bg-blue-600 text-white border-blue-600':'border-slate-400 hover:border-blue-400 hover:text-blue-500'} ${dark && !active? 'bg-slate-700/40 text-slate-300':''}`}>{lbl}</button>
                );
              })}
            </div>
            {/* Demo text and description */}
            <DemoContent lang={lang} step={demoStep} demoResult={demoResult} demoBg={demoBg} subheading={subheading} />
          </div>
        </section>

        {/* Notes */}
        <section className="text-xs space-y-1">
          <h2 className={`font-semibold ${subheading}`}>{D.notesTitle}</h2>
          <ul className="list-disc list-inside space-y-1">
            {D.notes.map(n => <li key={n}>{n}</li>)}
          </ul>
        </section>

        <footer className={`text-center mt-4 text-sm ${subtle}`}>
          <p>{D.license}</p>
          <p className="mt-1 opacity-70">{D.mode(dark)}</p>
        </footer>
      </div>
    </div>
  );
};

// Split out demo content for clarity
const DemoContent: React.FC<{lang:Lang; step:number; demoResult:{text:string;desc:string}; demoBg:string; subheading:string;}> = ({ demoResult, demoBg, subheading }) => {
  return (
    <div>
      <div className={`p-4 rounded-lg font-mono text-sm min-h-[110px] whitespace-pre-wrap break-words ${demoBg}`}>{demoResult.text}</div>
      <p className={`text-xs mt-2 text-center ${subheading}`}>{demoResult.desc}</p>
    </div>
  );
};

export default App;
