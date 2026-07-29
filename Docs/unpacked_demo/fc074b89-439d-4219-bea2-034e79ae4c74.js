/* Portal Ejecutivo BQS — animated walkthrough of the demo.
 * Self-contained: includes a trimmed copy of the timeline engine (Stage/useTime)
 * plus a faithful recreation of the real React UI (tokens from src/index.css,
 * data from DemoDataSeeder.php). Exposed as window.PortalWalkthrough. */

/* ─────────────────────────── Timeline engine ─────────────────────────── */
const Easing = {
  linear: (t) => t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInCubic: (t) => t * t * t,
  easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  easeOutQuad: (t) => t * (2 - t),
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const e = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        return output[i] + (output[i + 1] - output[i]) * e(local);
      }
    }
    return output[output.length - 1];
  };
}
const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

function Stage({ width = 1280, height = 720, duration = 10, background = '#fff', loop = true, autoplay = true, persistKey = 'animstage', children }) {
  const [time, setTime] = React.useState(() => {
    try { const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0'); return isFinite(v) ? clamp(v, 0, duration) : 0; } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  React.useEffect(() => { try { localStorage.setItem(persistKey + ':t', String(time)); } catch {} }, [time, persistKey]);

  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => { const barH = 44; const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height); setScale(Math.max(0.05, s)); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [width, height]);

  React.useEffect(() => {
    if (!playing) { lastTsRef.current = null; return; }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; lastTsRef.current = ts;
      setTime((t) => { let next = t + dt; if (next >= duration) { if (loop) next = next % duration; else { next = duration; setPlaying(false); } } return next; });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [playing, duration, loop]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.code === 'ArrowLeft') setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.code === 'ArrowRight') setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.key === '0' || e.code === 'Home') setTime(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({ time: displayTime, duration, playing }), [displayTime, duration, playing]);

  return (
    <div ref={stageRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ width, height, background, position: 'relative', transform: `scale(${scale})`, transformOrigin: 'center', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          <TimelineContext.Provider value={ctxValue}>{children}</TimelineContext.Provider>
        </div>
      </div>
      <PlaybackBar time={displayTime} duration={duration} playing={playing} onPlayPause={() => setPlaying(p => !p)} onReset={() => setTime(0)} onSeek={setTime} onHover={setHoverTime} />
    </div>
  );
}

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback((e) => { const r = trackRef.current.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * duration; }, [duration]);
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => { if (trackRef.current) onSeek(timeFromEvent(e)); };
    window.addEventListener('mouseup', onUp); window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove); };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => { const tot = Math.max(0, t); const m = Math.floor(tot / 60); const s = Math.floor(tot % 60); const cs = Math.floor((tot * 100) % 100); return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
  const mono = 'ui-monospace, SFMono-Regular, monospace';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(20,20,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 680, borderRadius: 8, color: '#f6f4ef', userSelect: 'none', flexShrink: 0 }}>
      <Ibtn onClick={onReset}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg></Ibtn>
      <Ibtn onClick={onPlayPause}>{playing ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor"/><rect x="8" y="2" width="3" height="10" fill="currentColor"/></svg> : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5V2z" fill="currentColor"/></svg>}</Ibtn>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 60, textAlign: 'right' }}>{fmt(time)}</div>
      <div ref={trackRef} onMouseMove={(e) => dragging ? onSeek(timeFromEvent(e)) : onHover(timeFromEvent(e))} onMouseLeave={() => !dragging && onHover(null)} onMouseDown={(e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); }} style={{ flex: 1, height: 22, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, background: '#0b4f9e', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 12, height: 12, marginLeft: -6, marginTop: -6, background: '#fff', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 60, color: 'rgba(246,244,239,0.55)' }}>{fmt(duration)}</div>
    </div>
  );
}
function Ibtn({ children, onClick }) {
  const [h, setH] = React.useState(false);
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f6f4ef', cursor: 'pointer', padding: 0 }}>{children}</button>;
}

/* ─────────────────────────── Design tokens ─────────────────────────── */
const C = {
  bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#e2e8f0', borderStrong: '#cbd5e1',
  text: '#0f172a', text2: '#334155', muted: '#64748b',
  slate400: '#94a3b8', slate500: '#64748b', slate600: '#475569', slate700: '#334155',
  primary: '#0b4f9e', primaryHover: '#08407f', primarySoft: '#eaf2fb',
  secondary: '#0e9f6e', secondaryStrong: '#0a7d57', secondarySoft: '#e6f6ef',
  successSoft: '#e6f6ef', warning: '#b45309', warningStrong: '#92400e', warningSoft: '#fbf1e5',
  danger: '#b91c1c', dangerSoft: '#fbe9e9',
};
const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ent = new Intl.NumberFormat('es-MX');
const fmtMXN = (n) => pesos.format(n);
const fmtInt = (n) => ent.format(n);

/* ─────────────────────────── Icons (lucide-style) ─────────────────────────── */
function Ic({ d, size = 24, color = 'currentColor', sw = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      {children || (Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />)}
    </svg>
  );
}
const IconResumen = (p) => <Ic {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Ic>;
const IconPorFacturar = (p) => <Ic {...p}><circle cx="12" cy="12" r="9" strokeDasharray="4 3" /></Ic>;
const IconWallet = (p) => <Ic {...p} d={["M21 12V7H5a2 2 0 0 1 0-4h14v4", "M3 5v14a2 2 0 0 0 2 2h16v-5", "M18 12a2 2 0 0 0 0 4h4v-4Z"]} />;
const IconUsers = (p) => <Ic {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ic>;
const IconCotizaciones = (p) => <Ic {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M8 13h2M14 13h2M8 17h2M14 17h2" /></Ic>;
const IconDevengado = (p) => <Ic {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></Ic>;
const IconFacturas = (p) => <Ic {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M16 13H8M16 17H8M10 9H8" /></Ic>;
const IconWhitelist = (p) => <Ic {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" /><path d="m9 12 2 2 4-4" /></Ic>;
const IconUpload = (p) => <Ic {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></Ic>;
const IconSearch = (p) => <Ic {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Ic>;
const IconPlus = (p) => <Ic {...p}><path d="M5 12h14M12 5v14" /></Ic>;
const IconLock = (p) => <Ic {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Ic>;
const IconTrendingUp = (p) => <Ic {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></Ic>;
const IconCheck = (p) => <Ic {...p}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Ic>;
const IconAlert = (p) => <Ic {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></Ic>;
const IconArrowLeft = (p) => <Ic {...p}><path d="m12 19-7-7 7-7M19 12H5" /></Ic>;
const IconX = (p) => <Ic {...p}><path d="M18 6 6 18M6 6l12 12" /></Ic>;

/* ─────────────────────────── Shared UI primitives ─────────────────────────── */
function StatusBadge({ estado }) {
  const cfg = {
    vigente: { label: 'Vigente', bg: C.primarySoft, fg: C.primary, Icon: IconFacturas },
    vencida: { label: 'Vencida', bg: C.warningSoft, fg: C.warningStrong, Icon: IconAlert },
    pagada: { label: 'Pagada', bg: C.successSoft, fg: C.secondaryStrong, Icon: IconCheck },
    pendiente: { label: 'Por facturar', bg: C.surface2, fg: C.warningStrong, Icon: IconPorFacturar },
    facturado: { label: 'Facturado', bg: C.successSoft, fg: C.secondaryStrong, Icon: IconCheck },
  }[estado];
  const { Icon } = cfg;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 500, background: cfg.bg, color: cfg.fg }}>
      <Icon size={14} sw={2.2} /> {cfg.label}
    </span>
  );
}
function EstatusPill({ estatus }) {
  const activo = estatus === 'Activo';
  return <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 500, background: activo ? C.successSoft : C.surface2, color: activo ? C.secondaryStrong : C.slate600 }}>{estatus}</span>;
}
function KpiCard({ label, value, note, accent, icon, big }) {
  const bar = { primary: C.primary, secondary: C.secondary, warning: C.warning, danger: C.danger }[accent];
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, padding: big ? 24 : 18, boxShadow: '0 1px 2px 0 rgba(15,23,42,0.05)' }}>
      <span style={{ position: 'absolute', insetBlock: 0, left: 0, width: 4, background: bar }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted }}>
        <span style={{ color: C.muted, display: 'flex' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</h2>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: big ? 40 : 30, fontWeight: 700, lineHeight: 1, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {note ? <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted }}>{note}</p> : null}
    </div>
  );
}
function Card({ children, style }) {
  return <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, boxShadow: '0 1px 2px 0 rgba(15,23,42,0.05)', ...style }}>{children}</div>;
}
function PageHeader({ title, description, action }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.15, color: C.text }}>{title}</h1>
        {description ? <p style={{ margin: '6px 0 0', fontSize: 14, color: C.muted }}>{description}</p> : null}
      </div>
      {action || null}
    </header>
  );
}
function Btn({ children, variant = 'primary', icon }) {
  const styles = {
    primary: { background: C.primary, color: '#fff' },
    secondary: { background: C.secondary, color: '#fff' },
    ghost: { background: 'transparent', color: C.primary },
  }[variant];
  return <button style={{ display: 'inline-flex', height: 44, alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, padding: '0 16px', fontSize: 14, fontWeight: 600, border: 'none', ...styles }}>{icon}{children && <span>{children}</span>}</button>;
}
function DataTable({ columns, rows }) {
  const alignOf = (c) => (c.align === 'right' || c.num) ? 'right' : c.align === 'center' ? 'center' : 'left';
  return (
    <div style={{ overflow: 'hidden', borderRadius: 12, border: `1px solid ${C.border}` }}>
      <table style={{ minWidth: '100%', width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead style={{ background: C.surface2 }}>
          <tr style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.slate700 }}>
            {columns.map((c) => <th key={c.key} style={{ padding: '12px 16px', textAlign: alignOf(c), width: c.width }}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '12px 16px', textAlign: alignOf(c), color: c.mono ? C.slate700 : C.text, fontFamily: c.mono ? MONO : FONT, fontVariantNumeric: c.num ? 'tabular-nums' : 'normal' }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function FilterBar({ children }) {
  return <Card style={{ padding: 16 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>{children}</div></Card>;
}
function SearchInput({ value, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.slate400, display: 'flex' }}><IconSearch size={16} /></span>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: '#fff', paddingLeft: 36, paddingRight: 12, fontSize: 16, color: value ? C.text : C.slate400 }}>{value || placeholder}</div>
    </div>
  );
}
function SelectBox({ value }) {
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: '#fff', padding: '0 12px', fontSize: 15, color: C.text2 }}>
      <span>{value}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.slate400} strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  );
}
function TextInput({ value, placeholder }) {
  return <div style={{ height: 44, display: 'flex', alignItems: 'center', borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: '#fff', padding: '0 14px', fontSize: 15, color: value ? C.text : C.slate400 }}>{value || placeholder}</div>;
}

/* ─────────────────────────── Demo data (DemoDataSeeder.php) ─────────────────────────── */
const CLIENTES = [
  ['CLI-001', 'NIDEC Mobility', 'NIDEC Mobility Mexico S.A. de C.V.', 'NMO140101AA1', 'Activo'],
  ['CLI-002', 'Bocar', 'Bocar Group S.A. de C.V.', 'BGR990817AB2', 'Activo'],
  ['CLI-003', 'Nemak', 'Nemak S.A.B. de C.V.', 'NEM790521C34', 'Activo'],
  ['CLI-004', 'Metalsa', 'Metalsa S.A. de C.V.', 'MET850612D58', 'Activo'],
  ['CLI-005', 'Rassini', 'Rassini S.A.B. de C.V.', 'RAS760310E21', 'Activo'],
  ['CLI-006', 'Kostal', 'Kostal Mexicana S.A. de C.V.', 'KME031118F09', 'Activo'],
  ['CLI-007', 'GIS', 'Grupo Industrial Saltillo S.A.B. de C.V.', 'GIS680425G77', 'Activo'],
  ['CLI-008', 'Katcon', 'Katcon Global S.A. de C.V.', 'KAT930204H45', 'Inactivo'],
];
const COTIZACIONES = [
  ['COT-0001', 'CLI-001', 'PO-NIDEC-1001', 100000, 'Aprobada'],
  ['COT-0002', 'CLI-001', 'PO-NIDEC-1002', 150000, 'Aprobada'],
  ['COT-0003', 'CLI-002', 'PO-BOCAR-2001', 320000, 'Aprobada'],
  ['COT-0004', 'CLI-002', 'PO-BOCAR-2002', 90000, 'Pendiente PO'],
  ['COT-0005', 'CLI-003', 'PO-NEMAK-3001', 540000, 'Aprobada'],
  ['COT-0006', 'CLI-003', 'PO-NEMAK-3002', 210000, 'Cerrada'],
  ['COT-0007', 'CLI-004', 'PO-METAL-4001', 410000, 'Aprobada'],
  ['COT-0008', 'CLI-005', 'PO-RASS-5001', 175000, 'Aprobada'],
  ['COT-0009', 'CLI-005', 'PO-RASS-5002', 60000, 'Pendiente PO'],
  ['COT-0010', 'CLI-006', 'PO-KOST-6001', 280000, 'Aprobada'],
  ['COT-0011', 'CLI-007', 'PO-GIS-7001', 720000, 'Aprobada'],
  ['COT-0012', 'CLI-007', 'PO-GIS-7002', 130000, 'Cerrada'],
  ['COT-0013', 'CLI-008', 'PO-KAT-8001', 95000, 'Cerrada'],
];
const FACTURAS = [
  ['FAC-2026-0001', 'CLI-001', '31 may 2026', '30 jun 2026', 116000, 'vigente'],
  ['FAC-2026-0002', 'CLI-002', '16 may 2026', '15 jun 2026', 208800, 'vencida'],
  ['FAC-2026-0003', 'CLI-003', '30 abr 2026', '30 may 2026', 348000, 'pagada'],
  ['FAC-2026-0004', 'CLI-003', '31 mar 2026', '30 abr 2026', 243600, 'pagada'],
  ['FAC-2026-0005', 'CLI-004', '31 may 2026', '30 jun 2026', 255200, 'vigente'],
  ['FAC-2026-0006', 'CLI-007', '11 may 2026', '10 jun 2026', 464000, 'vencida'],
  ['FAC-2026-0007', 'CLI-005', '01 jun 2026', '01 jul 2026', 104400, 'vigente'],
];
const DESGLOSE = [
  ['COT-0001', 'NIDEC Mobility', 1, 30000],
  ['COT-0002', 'NIDEC Mobility', 1, 45000],
  ['COT-0003', 'Bocar', 1, 90000],
  ['COT-0005', 'Nemak', 1, 150000],
  ['COT-0007', 'Metalsa', 1, 95000],
  ['COT-0011', 'GIS', 1, 180000],
];
const DEV_COT1 = [
  ['BIT-0001', '10 may 2026', 120, 2000, 40000, 'facturado'],
  ['BIT-0002', '25 may 2026', 90, 1500, 30000, 'pendiente'],
];
const POR_COBRAR = [
  { id: 'CLI-001', nombre: 'NIDEC Mobility', saldo: 66000, facturas: [['FAC-2026-0001', '31 may 2026', '30 jun 2026', 'vigente', 116000, 50000, 66000]] },
  { id: 'CLI-002', nombre: 'Bocar', saldo: 108800, facturas: [['FAC-2026-0002', '16 may 2026', '15 jun 2026', 'vencida', 208800, 100000, 108800]] },
  { id: 'CLI-007', nombre: 'GIS', saldo: 464000, facturas: [['FAC-2026-0006', '11 may 2026', '10 jun 2026', 'vencida', 464000, 0, 464000]] },
];
const PORFAC = [
  ['COT-0001', 'NIDEC Mobility', 'PO-NIDEC-1001', 1, 30000],
  ['COT-0002', 'NIDEC Mobility', 'PO-NIDEC-1002', 1, 45000],
  ['COT-0003', 'Bocar', 'PO-BOCAR-2001', 1, 90000],
  ['COT-0005', 'Nemak', 'PO-NEMAK-3001', 1, 150000],
  ['COT-0007', 'Metalsa', 'PO-METAL-4001', 1, 95000],
  ['COT-0011', 'GIS', 'PO-GIS-7001', 1, 180000],
];
const WHITELIST = [
  ['eric@bestqualitysolutions.com', true],
  ['admin@bestqualitysolutions.com', true],
  ['facturacion@bestqualitysolutions.com', true],
  ['capturista@bestqualitysolutions.com', true],
  ['intruso@competidor.com', false],
];
const FAC_DET = { folio: 'FAC-2026-0001', cliente: 'CLI-001', emision: '31 may 2026', vence: '30 jun 2026', estado: 'vigente', total: 116000, pagado: 50000, saldo: 66000, pagos: [['PAG-0003', '10 jun 2026', 'Abono parcial 1/2', 50000]] };

/* ─────────────────────────── Chrome: sidebar + topbar ─────────────────────────── */
const NAV = [
  { titulo: 'Dirección', items: [
    { route: 'resumen', label: 'Resumen', Icon: IconResumen },
    { route: 'porfacturar', label: 'Por facturar', Icon: IconPorFacturar },
    { route: 'porcobrar', label: 'Por cobrar', Icon: IconWallet },
  ]},
  { titulo: 'Operación', items: [
    { route: 'clientes', label: 'Clientes', Icon: IconUsers },
    { route: 'cotizaciones', label: 'Cotizaciones', Icon: IconCotizaciones },
    { route: 'devengado', label: 'Devengado', Icon: IconDevengado },
    { route: 'facturas', label: 'Facturas', Icon: IconFacturas },
  ]},
  { titulo: 'Administración', items: [
    { route: 'whitelist', label: 'Whitelist', Icon: IconWhitelist },
    { route: 'import', label: 'Importación', Icon: IconUpload },
  ]},
];
function Sidebar({ active }) {
  return (
    <aside style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}`, background: C.surface, height: '100%' }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}`, padding: '0 16px', flexShrink: 0 }}>
        <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>BQS</span>
        <div style={{ lineHeight: 1.2 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>Portal Ejecutivo</p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>by Dataholics</p>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', overflow: 'hidden' }}>
        {NAV.map((g) => (
          <div key={g.titulo} style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', padding: '0 12px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.slate400 }}>{g.titulo}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map(({ route, label, Icon }) => {
                const on = route === active;
                return (
                  <li key={route}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 500, background: on ? C.primarySoft : 'transparent', color: on ? C.primary : C.slate600 }}>
                      <Icon size={20} color={on ? C.primary : C.slate400} />
                      {label}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <p style={{ margin: 0, borderTop: `1px solid ${C.border}`, padding: '12px 16px', fontSize: 12, color: C.slate400, flexShrink: 0 }}>Best Quality Solutions · Dataholics</p>
    </aside>
  );
}
function Topbar() {
  return (
    <header style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.95)', padding: '0 24px' }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8 }}>
        <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, background: C.primary, color: '#fff', fontSize: 12, fontWeight: 600 }}>AD</span>
        <span style={{ lineHeight: 1.2 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: C.text }}>Administrador</span>
          <span style={{ display: 'block', fontSize: 12, color: C.muted }}>admin@bestqualitysolutions.com</span>
        </span>
      </div>
    </header>
  );
}
function PortalFrame({ active, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', background: C.bg, fontFamily: FONT }}>
      <Sidebar active={active} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <div style={{ flex: 1, overflow: 'hidden', padding: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Pages ─────────────────────────── */
function DashboardPage() {
  return (
    <React.Fragment>
      <PageHeader title="Resumen ejecutivo" description="Periodo 2026-06 · MXN · actualizado 23 jun 2026, 9:00" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <KpiCard big label="¿Qué ya se facturó?" value={fmtMXN(104400)} note="Mes en curso" accent="secondary" icon={<IconTrendingUp size={20} />} />
        <KpiCard big label="¿Qué falta por facturar?" value={fmtMXN(590000)} note="Devengado pendiente · ver desglose" accent="warning" icon={<IconPorFacturar size={20} />} />
        <KpiCard big label="¿Cuánto te deben?" value={fmtMXN(998400)} note="Neto de abonos · ver desglose" accent="primary" icon={<IconWallet size={20} />} />
      </div>
      <Card>
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>Por facturar — desglose por cotización</h2>
          <p style={{ margin: '2px 0 0', fontSize: 14, color: C.muted }}>Devengado ejecutado aún no facturado</p>
        </div>
        <div style={{ padding: 16 }}>
          <DataTable
            columns={[
              { key: 'cot', header: 'Cotización', mono: true, render: (r) => r[0] },
              { key: 'cli', header: 'Cliente', render: (r) => r[1] },
              { key: 'cap', header: 'Capturas', num: true, render: (r) => fmtInt(r[2]) },
              { key: 'monto', header: 'Pendiente', num: true, render: (r) => fmtMXN(r[3]) },
            ]}
            rows={DESGLOSE}
          />
        </div>
      </Card>
    </React.Fragment>
  );
}
function ClientesPage() {
  return (
    <React.Fragment>
      <PageHeader title="Clientes" description="Catálogo maestro con ID único (consolida nombres variantes)." action={<Btn icon={<IconPlus size={16} color="#fff" />}>Nuevo cliente</Btn>} />
      <FilterBar><SearchInput placeholder="Buscar por nombre, RFC o ID…" /><SelectBox value="Todos los estatus" /></FilterBar>
      <DataTable
        columns={[
          { key: 'id', header: 'ID', mono: true, render: (r) => r[0] },
          { key: 'com', header: 'Comercial', render: (r) => r[1] },
          { key: 'fis', header: 'Razón social', render: (r) => r[2] },
          { key: 'rfc', header: 'RFC', mono: true, render: (r) => r[3] },
          { key: 'est', header: 'Estatus', render: (r) => <EstatusPill estatus={r[4]} /> },
          { key: 'acc', header: '', align: 'right', width: 130, render: () => <span style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}><span style={{ borderRadius: 6, border: `1px solid ${C.borderStrong}`, padding: '4px 10px', fontSize: 12, fontWeight: 500, color: C.slate600 }}>Editar</span></span> },
        ]}
        rows={CLIENTES}
      />
    </React.Fragment>
  );
}
function CotizacionesPage() {
  return (
    <React.Fragment>
      <PageHeader title="Cotizaciones" description="Montos y piezas autorizadas por cliente; base del consumo devengado." action={<Btn icon={<IconPlus size={16} color="#fff" />}>Nueva cotización</Btn>} />
      <FilterBar><SearchInput placeholder="Filtrar por ID_Cliente (CLI-001)…" /><SelectBox value="Todos los estatus" /></FilterBar>
      <DataTable
        columns={[
          { key: 'cot', header: 'Cotización', mono: true, render: (r) => r[0] },
          { key: 'cli', header: 'Cliente', mono: true, render: (r) => r[1] },
          { key: 'po', header: 'PO', render: (r) => r[2] },
          { key: 'aut', header: 'Autorizado', num: true, render: (r) => fmtMXN(r[3]) },
          { key: 'est', header: 'Estatus', render: (r) => r[4] },
        ]}
        rows={COTIZACIONES}
      />
    </React.Fragment>
  );
}
function DevengadoPage() {
  return (
    <React.Fragment>
      <PageHeader title="Captura de devengado" description="Trabajo de inspección/sorteo ejecutado, pendiente de facturar." />
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1 }}><SearchInput value="COT-0001" placeholder="ID de cotización (COT-0001)…" /></div>
          <Btn>Abrir</Btn>
          <Btn variant="secondary" icon={<IconPlus size={16} color="#fff" />}>Devengado</Btn>
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Autorizado" value={fmtMXN(100000)} accent="primary" icon={<span style={{ fontSize: 18 }}>Σ</span>} />
        <KpiCard label="Devengado" value={fmtMXN(70000)} accent="secondary" icon={<span style={{ fontSize: 18 }}>✓</span>} />
        <KpiCard label="Por facturar" value={fmtMXN(30000)} accent="warning" icon={<span style={{ fontSize: 18 }}>•</span>} />
        <KpiCard label="Disponible" value={fmtMXN(30000)} accent="primary" icon={<span style={{ fontSize: 18 }}>=</span>} />
      </div>
      <Card>
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>Capturas de COT-0001</h2></div>
        <div style={{ padding: 16 }}>
          <DataTable
            columns={[
              { key: 'cap', header: 'Captura', mono: true, render: (r) => r[0] },
              { key: 'fec', header: 'Fecha', render: (r) => r[1] },
              { key: 'hrs', header: 'Horas', num: true, render: (r) => fmtInt(r[2]) },
              { key: 'pza', header: 'Piezas', num: true, render: (r) => fmtInt(r[3]) },
              { key: 'dev', header: 'Devengado', num: true, render: (r) => fmtMXN(r[4]) },
              { key: 'est', header: 'Facturación', render: (r) => <StatusBadge estado={r[5]} /> },
            ]}
            rows={DEV_COT1}
          />
        </div>
      </Card>
    </React.Fragment>
  );
}
function FacturasPage() {
  return (
    <React.Fragment>
      <PageHeader title="Facturas" description="Emisión desde devengado y seguimiento de saldo por factura." action={<Btn icon={<IconPlus size={16} color="#fff" />}>Emitir factura</Btn>} />
      <FilterBar><SearchInput placeholder="Filtrar por ID_Cliente (CLI-001)…" /><SelectBox value="Todos los estatus" /></FilterBar>
      <DataTable
        columns={[
          { key: 'fol', header: 'Folio', mono: true, render: (r) => r[0] },
          { key: 'cli', header: 'Cliente', mono: true, render: (r) => r[1] },
          { key: 'emi', header: 'Emisión', render: (r) => r[2] },
          { key: 'ven', header: 'Vence', render: (r) => r[3] },
          { key: 'tot', header: 'Total', num: true, render: (r) => fmtMXN(r[4]) },
          { key: 'est', header: 'Estado', render: (r) => <StatusBadge estado={r[5]} /> },
        ]}
        rows={FACTURAS}
      />
    </React.Fragment>
  );
}
function PorCobrarPage() {
  return (
    <React.Fragment>
      <PageHeader title="Por cobrar" description="Saldo de cuentas por cobrar, neto de abonos, por cliente." />
      <div style={{ maxWidth: 360 }}>
        <KpiCard label="Total por cobrar" value={fmtMXN(998400)} note="Suma de saldos activos" accent="primary" icon={<IconWallet size={20} />} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {POR_COBRAR.map((c) => (
          <Card key={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>{c.nombre}</h2>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: C.muted }}>{c.id}</p>
              </div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{fmtMXN(c.saldo)}</p>
            </div>
            <div style={{ padding: 16 }}>
              <DataTable
                columns={[
                  { key: 'fol', header: 'Folio', mono: true, render: (r) => r[0] },
                  { key: 'emi', header: 'Emisión', render: (r) => r[1] },
                  { key: 'ven', header: 'Vence', render: (r) => r[2] },
                  { key: 'est', header: 'Estado', render: (r) => <StatusBadge estado={r[3]} /> },
                  { key: 'tot', header: 'Total', num: true, render: (r) => fmtMXN(r[4]) },
                  { key: 'pag', header: 'Pagado', num: true, render: (r) => fmtMXN(r[5]) },
                  { key: 'sal', header: 'Saldo', num: true, render: (r) => <strong>{fmtMXN(r[6])}</strong> },
                ]}
                rows={c.facturas}
              />
            </div>
          </Card>
        ))}
      </div>
    </React.Fragment>
  );
}
function ImportPage() {
  return (
    <React.Fragment>
      <PageHeader title="Importación inicial" description="Carga el padrón de clientes y cotizaciones (CSV/XLSX); el procesamiento es asíncrono." />
      <Card style={{ padding: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: C.text2 }}>El sistema consolida los clientes variantes a un único ID y sanea los montos. La cola ejecuta el trabajo y aquí verás el estado.</p>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: C.slate700 }}>Archivo (.csv, .xlsx)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: C.slate600 }}>
              <span style={{ borderRadius: 6, background: C.primary, color: '#fff', padding: '8px 16px', fontWeight: 600 }}>Elegir archivo</span>
              <span>padron_clientes_2026.xlsx</span>
            </div>
          </div>
          <div style={{ maxWidth: 420 }}>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: C.slate700 }}>Entidad</span>
            <SelectBox value="Detectar por hojas (XLSX: Clientes/Cotizaciones)" />
          </div>
          <Btn icon={<IconUpload size={16} color="#fff" />}>Importar</Btn>
        </div>
      </Card>
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>Job #128</h2>
          <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 500, background: C.successSoft, color: C.secondaryStrong }}>Completado</span>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 8, fontSize: 14 }}>
            <dt style={{ color: C.muted }}>Tipo</dt><dd style={{ margin: 0, color: C.text2 }}>import_xlsx</dd>
            <dt style={{ color: C.muted }}>Intentos</dt><dd style={{ margin: 0, color: C.text2 }}>1 / 3</dd>
          </dl>
          <div style={{ marginTop: 16 }}><Btn variant="secondary">Ver clientes consolidados</Btn></div>
        </div>
      </Card>
    </React.Fragment>
  );
}
function PorFacturarPage() {
  return (
    <React.Fragment>
      <PageHeader title="Por facturar" description="Devengado ejecutado aún no facturado, por cotización." />
      <div style={{ maxWidth: 360 }}>
        <KpiCard label="Total por facturar" value={fmtMXN(590000)} note="Suma del devengado pendiente" accent="warning" icon={<IconPorFacturar size={20} />} />
      </div>
      <DataTable
        columns={[
          { key: 'cot', header: 'Cotización', mono: true, render: (r) => r[0] },
          { key: 'cli', header: 'Cliente', render: (r) => r[1] },
          { key: 'po', header: 'PO', mono: true, render: (r) => r[2] },
          { key: 'cap', header: 'Capturas', num: true, render: (r) => fmtInt(r[3]) },
          { key: 'mon', header: 'Pendiente', num: true, render: (r) => fmtMXN(r[4]) },
        ]}
        rows={PORFAC}
      />
    </React.Fragment>
  );
}
function ChipActivo() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 500, background: C.successSoft, color: C.secondaryStrong }}><IconCheck size={14} sw={2.2} /> Activo</span>;
}
function ChipRevocado() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 500, background: C.surface2, color: C.slate500 }}><IconX size={14} sw={2.2} /> Revocado</span>;
}
function WhitelistPage() {
  return (
    <React.Fragment>
      <PageHeader title="Whitelist de acceso" description="Correos autorizados a iniciar sesión; segunda barrera además de credenciales." />
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: C.slate700 }}>Autorizar correo</span>
            <TextInput placeholder="correo@empresa.com" />
          </div>
          <Btn icon={<IconPlus size={16} color="#fff" />}>Agregar</Btn>
        </div>
      </Card>
      <DataTable
        columns={[
          { key: 'correo', header: 'Correo', render: (r) => r[0] },
          { key: 'estado', header: 'Estado', render: (r) => (r[1] ? <ChipActivo /> : <ChipRevocado />) },
          { key: 'acc', header: '', align: 'right', width: 120, render: (r) => (r[1] ? <span style={{ borderRadius: 6, border: `1px solid ${C.danger}55`, padding: '4px 10px', fontSize: 12, fontWeight: 500, color: C.danger }}>Revocar</span> : null) },
        ]}
        rows={WHITELIST}
      />
    </React.Fragment>
  );
}
function FacturaDetallePage() {
  const f = FAC_DET;
  return (
    <React.Fragment>
      <PageHeader title="Factura" description={f.folio} action={<Btn variant="ghost" icon={<IconArrowLeft size={16} color={C.primary} />}>Facturas</Btn>} />
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: C.muted }}>{f.folio}</p>
            <p style={{ margin: '2px 0 0', fontFamily: MONO, fontSize: 14, color: C.primary }}>{f.cliente}</p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: C.text2 }}>Emisión {f.emision} · Vence {f.vence}</p>
          </div>
          <StatusBadge estado={f.estado} />
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <KpiCard label="Total" value={fmtMXN(f.total)} accent="primary" icon={<span style={{ fontSize: 18 }}>Σ</span>} />
        <KpiCard label="Pagado" value={fmtMXN(f.pagado)} accent="secondary" icon={<span style={{ fontSize: 18 }}>✓</span>} />
        <KpiCard label="Saldo por cobrar" value={fmtMXN(f.saldo)} accent="warning" icon={<span style={{ fontSize: 18 }}>•</span>} />
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${C.border}`, padding: '14px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>Abonos registrados</h2>
          <Btn variant="secondary" icon={<IconPlus size={16} color="#fff" />}>Registrar pago</Btn>
        </div>
        <div style={{ padding: 16 }}>
          <DataTable
            columns={[
              { key: 'pago', header: 'Pago', mono: true, render: (r) => r[0] },
              { key: 'fec', header: 'Fecha', render: (r) => r[1] },
              { key: 'ref', header: 'Referencia', render: (r) => r[2] },
              { key: 'mon', header: 'Monto', num: true, render: (r) => fmtMXN(r[3]) },
            ]}
            rows={f.pagos}
          />
        </div>
      </Card>
    </React.Fragment>
  );
}
const PAGES = { resumen: DashboardPage, porfacturar: PorFacturarPage, clientes: ClientesPage, cotizaciones: CotizacionesPage, devengado: DevengadoPage, facturas: FacturasPage, facturadetalle: FacturaDetallePage, porcobrar: PorCobrarPage, whitelist: WhitelistPage, import: ImportPage };

/* ─────────────────────────── Login screen ─────────────────────────── */
function LoginScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: FONT }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: C.primary, padding: 56, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 700 }}>BQS</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Portal Ejecutivo · Dataholics</span>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 42, fontWeight: 700, lineHeight: 1.12, maxWidth: 560 }}>Cuentas por cobrar y facturación, en un vistazo.</h2>
          <p style={{ margin: '18px 0 0', maxWidth: 520, fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>Las tres preguntas del negocio —qué se facturó, qué falta por facturar y cuánto deben— calculadas en el servidor.</p>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Best Quality Solutions México</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 48 }}>
        <div style={{ width: 380 }}>
          <header style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: C.text }}>Iniciar sesión</h1>
            <p style={{ margin: '6px 0 0', fontSize: 15, color: C.muted }}>Acceso a cuentas por cobrar y facturación</p>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: C.slate700 }}>Correo</label>
              <div style={{ height: 48, display: 'flex', alignItems: 'center', borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: '#fff', padding: '0 14px', fontSize: 15, color: C.text }}>admin@bestqualitysolutions.com</div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: C.slate700 }}>Contraseña</label>
              <div style={{ height: 48, display: 'flex', alignItems: 'center', borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: '#fff', padding: '0 14px', fontSize: 18, letterSpacing: 4, color: C.text2 }}>••••••••••</div>
            </div>
            <button id="login-btn" style={{ width: '100%', height: 48, borderRadius: 8, border: 'none', background: C.primary, color: '#fff', fontSize: 15, fontWeight: 600 }}>Iniciar sesión</button>
          </div>
          <p style={{ margin: '28px 0 0', textAlign: 'center', fontSize: 12, color: C.slate400 }}>Best Quality Solutions · desarrollado por Dataholics</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Closing slide ─────────────────────────── */
function CyclePill({ label, sub, color, soft }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 230, padding: '26px 20px', borderRadius: 16, background: soft, border: `2px solid ${color}`, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{label}</p>
      </div>
      <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{sub}</p>
    </div>
  );
}
function ClosingSlide() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.primary, color: '#fff', fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>EL CICLO DE COBRO</span>
        <h2 style={{ margin: '12px 0 0', fontSize: 48, fontWeight: 700 }}>Un flujo, de principio a fin</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <CyclePill label="Devengado" sub="trabajo ejecutado" color="#ffffff" soft="rgba(255,255,255,0.10)" />
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><path d="M4 20h52M44 8l14 12-14 12" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <CyclePill label="Factura" sub="emisión · IVA 16%" color="#ffffff" soft="rgba(255,255,255,0.10)" />
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><path d="M4 20h52M44 8l14 12-14 12" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <CyclePill label="Pago" sub="abonos · saldo" color="#ffffff" soft="rgba(255,255,255,0.10)" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.15)', fontSize: 16, fontWeight: 700 }}>BQS</span>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Portal Ejecutivo BQS · by Dataholics</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Cursor + caption ─────────────────────────── */
function Cursor({ x, y, click }) {
  const scale = 1 + click * 0.0; // size constant; click handled by ring
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-3px,-2px) scale(${scale})`, pointerEvents: 'none', zIndex: 50, willChange: 'left, top' }}>
      {click > 0 ? <span style={{ position: 'absolute', left: 2, top: 2, width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: 9999, border: `3px solid ${C.primary}`, opacity: (1 - click) * 0.9, transform: `scale(${0.4 + click * 1.1})` }} /> : null}
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}>
        <path d="M5 3l14 7-6 1.6 3.2 6.4-2.6 1.2-3.2-6.4L7 17V3z" fill="#0f172a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function Caption({ kicker, title, desc, opacity }) {
  return (
    <div style={{ position: 'absolute', left: 56, bottom: 56, maxWidth: 720, opacity, transition: 'none', zIndex: 40 }}>
      <div style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(6px)', borderRadius: 16, padding: '22px 28px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', borderLeft: `4px solid ${C.primary}` }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: '#7fb0e8' }}>{kicker}</p>
        <h3 style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1.15 }}>{title}</h3>
        <p style={{ margin: '10px 0 0', fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Scene direction ─────────────────────────── */
const SCENES = [
  { id: 'login', t0: 0, t1: 7, route: 'resumen',
    kicker: 'PORTAL EJECUTIVO BQS', title: 'Cobranza y facturación, en un vistazo', desc: 'Acceso con doble barrera: credenciales válidas + correo en la whitelist.' },

  { id: 'resumen', t0: 7, t1: 30, route: 'resumen', cursor: { x: 132, y: 122 }, cam: { s: 1.15, fx: 1080, fy: 300, pan: { fx: 760, fy: 560 } },
    kicker: 'DIRECCIÓN · RESUMEN', title: 'Las tres preguntas del negocio', desc: 'Qué ya se facturó, qué falta por facturar y cuánto te deben — calculado en el servidor.',
    b: { title: 'Y su desglose', desc: 'Cada KPI enlaza a su detalle: aquí, el devengado pendiente por cotización.' } },

  { id: 'porfacturar', t0: 30, t1: 50, route: 'porfacturar', cursor: { x: 132, y: 158 }, cam: { s: 1.13, fx: 740, fy: 360, pan: { fx: 820, fy: 540 } },
    kicker: 'DIRECCIÓN · POR FACTURAR', title: 'Lo ejecutado que aún no cobras', desc: '$590,000 de trabajo devengado todavía sin factura emitida.',
    b: { title: 'Por cotización y PO', desc: 'Identifica con qué orden de compra debe emitirse cada factura.' } },

  { id: 'porcobrar', t0: 50, t1: 73, route: 'porcobrar', cursor: { x: 132, y: 196 }, cam: { s: 1.12, fx: 880, fy: 340, pan: { fx: 880, fy: 640 } },
    kicker: 'DIRECCIÓN · POR COBRAR', title: 'Cuánto te deben, por cliente', desc: 'Saldo neto de abonos, agrupado por cliente.',
    b: { title: 'Factura por factura', desc: 'Total, pagado y saldo de cada folio; un clic abre la factura.' } },

  { id: 'clientes', t0: 73, t1: 98, route: 'clientes', cursor: { x: 132, y: 276 }, cam: { s: 1.12, fx: 760, fy: 330, pan: { fx: 820, fy: 600 } },
    kicker: 'OPERACIÓN · CLIENTES', title: 'Catálogo maestro de clientes', desc: 'Un ID único consolida los nombres variantes: NIDEC Mobility y Nidec México son un solo CLI-001.',
    b: { title: 'Alta, edición y baja lógica', desc: 'El admin gestiona el catálogo; la baja es lógica (Inactivo), nunca física.' } },

  { id: 'cotizaciones', t0: 98, t1: 123, route: 'cotizaciones', cursor: { x: 132, y: 314 }, cam: { s: 1.1, fx: 820, fy: 330, pan: { fx: 820, fy: 680 } },
    kicker: 'OPERACIÓN · COTIZACIONES', title: 'Montos y piezas autorizadas', desc: 'La base contra la que se mide el consumo devengado de cada cliente.',
    b: { title: '13 cotizaciones, 8 clientes', desc: 'Estatus Aprobada, Pendiente PO o Cerrada — el tope de lo facturable.' } },

  { id: 'devengado', t0: 123, t1: 148, route: 'devengado', cursor: { x: 132, y: 352 }, cam: { s: 1.13, fx: 1080, fy: 360, pan: { fx: 760, fy: 560 } },
    kicker: 'OPERACIÓN · DEVENGADO', title: 'Trabajo ejecutado, aún sin facturar', desc: 'Cada captura de sorteo suma al devengado y descuenta lo disponible de la cotización.',
    b: { title: 'Autorizado − Devengado = Disponible', desc: 'El servidor impide devengar más de lo autorizado.' } },

  { id: 'facturas', t0: 148, t1: 171, route: 'facturas', cursor: { x: 132, y: 390 }, cam: { s: 1.12, fx: 880, fy: 340, pan: { fx: 880, fy: 540 } },
    kicker: 'OPERACIÓN · FACTURAS', title: 'Emisión desde el devengado', desc: 'Se factura el devengado pendiente; IVA 16% y fecha de vencimiento.',
    b: { title: 'Estado custodiado en servidor', desc: 'El cron marca Vencida; un pago total marca Pagada — nadie lo fuerza a mano.' } },

  { id: 'facturadetalle', t0: 171, t1: 194, route: 'facturas', page: 'facturadetalle', cursor: { x: 1430, y: 466 }, cam: { s: 1.1, fx: 920, fy: 380, pan: { fx: 780, fy: 560 } },
    kicker: 'FACTURAS · DETALLE', title: 'Total, pagado y saldo', desc: 'Cada factura rastrea sus abonos hasta quedar saldada.',
    b: { title: 'Registrar pago', desc: 'Se valida sobrepago y facturas ya pagadas; el abono entra en una transacción ACID.' } },

  { id: 'whitelist', t0: 194, t1: 216, route: 'whitelist', cursor: { x: 132, y: 470 }, cam: { s: 1.13, fx: 760, fy: 360, pan: { fx: 760, fy: 520 } },
    kicker: 'ADMINISTRACIÓN · WHITELIST', title: 'Segunda barrera de acceso', desc: 'Además de las credenciales, el correo debe estar autorizado para poder entrar.',
    b: { title: 'Caso QA-5', desc: 'intruso@competidor.com tiene contraseña válida, pero su acceso está revocado.' } },

  { id: 'import', t0: 216, t1: 238, route: 'import', cursor: { x: 132, y: 508 }, cam: { s: 1.12, fx: 780, fy: 360, pan: { fx: 780, fy: 520 } },
    kicker: 'ADMINISTRACIÓN · IMPORTACIÓN', title: 'Carga inicial del padrón', desc: 'Sube clientes y cotizaciones en CSV o XLSX.',
    b: { title: 'Cola asíncrona', desc: 'Consolida los alias y sanea los montos sin bloquear la interfaz; el job reporta su estado.' } },

  { id: 'cierre', t0: 238, t1: 248, route: 'import' },
];
const DURATION = 248;

function sceneAt(t) {
  for (let i = 0; i < SCENES.length; i++) { if (t >= SCENES[i].t0 && t < SCENES[i].t1) return i; }
  return SCENES.length - 1;
}

function SceneDirector() {
  const t = useTime();
  const idx = sceneAt(t);
  const sc = SCENES[idx];
  const prev = SCENES[Math.max(0, idx - 1)];
  const local = t - sc.t0;
  const dur = sc.t1 - sc.t0;

  // Camera: push into the scene's focus over the first third, then slowly pan.
  let camS = 1, camFx = 960, camFy = 540;
  if (sc.cam) {
    const pushP = Easing.easeInOutCubic(clamp(local / (dur * 0.36), 0, 1));
    camS = 1 + (sc.cam.s - 1) * pushP;
    camFx = 960 + (sc.cam.fx - 960) * pushP;
    camFy = 540 + (sc.cam.fy - 540) * pushP;
    if (sc.cam.pan) {
      const panP = Easing.easeInOutCubic(clamp((local - dur * 0.45) / (dur * 0.5), 0, 1));
      camFx += (sc.cam.pan.fx - sc.cam.fx) * panP;
      camFy += (sc.cam.pan.fy - sc.cam.fy) * panP;
    }
  }
  const tx = 960 - camFx * camS;
  const ty = 540 - camFy * camS;

  // Cursor: glide from previous target to this scene's target, then click pulse.
  const fromCur = prev.cursor || { x: 1280, y: 600 };
  const toCur = sc.cursor || prev.cursor || { x: 1280, y: 600 };
  const moveP = Easing.easeOutCubic(clamp(local / 0.85, 0, 1));
  const curX = fromCur.x + (toCur.x - fromCur.x) * moveP;
  const curY = fromCur.y + (toCur.y - fromCur.y) * moveP;
  // click ring 0..1 fired right as the cursor lands
  let click = 0;
  const clickStart = 0.9, clickDur = 0.5;
  if (sc.cursor && local >= clickStart && local <= clickStart + clickDur) click = (local - clickStart) / clickDur;

  const showLogin = sc.id === 'login';
  const showClosing = sc.id === 'cierre';
  const Page = PAGES[sc.page || sc.route] || DashboardPage;

  // fades
  const portalOpacity = showLogin ? clamp((local - (dur - 0.5)) / 0.5, 0, 1) : 1; // portal pre-renders under login at very end
  const loginOpacity = showLogin ? clamp(1 - Math.max(0, (local - (dur - 0.6)) / 0.6), 0, 1) : 0;
  const contentFade = clamp(local / 0.45, 0, 1);
  const closingOpacity = showClosing ? clamp(local / 0.6, 0, 1) : 0;
  // Two-beat captions: swap text at mid-scene behind an opacity dip.
  const switchAt = dur * 0.52;
  const beat = (sc.b && local >= switchAt) ? sc.b : null;
  const capTitle = beat ? beat.title : sc.title;
  const capDesc = beat ? beat.desc : sc.desc;
  let captionOpacity;
  if (showLogin) {
    captionOpacity = clamp(local / 0.6, 0, 1) * clamp(1 - Math.max(0, (local - (dur - 0.6)) / 0.6), 0, 1);
  } else if (showClosing) {
    captionOpacity = 0;
  } else {
    captionOpacity = Math.min(clamp(local / 0.5, 0, 1), clamp((dur - local) / 0.5, 0, 1));
    if (sc.b) captionOpacity = Math.min(captionOpacity, clamp(Math.abs(local - switchAt) / 0.35, 0, 1));
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg }}>
      {/* Camera-transformed screen */}
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${camS})`, willChange: 'transform' }}>
        {/* Portal (always mounted except pure login hold) */}
        {!showClosing && (
          <div style={{ position: 'absolute', inset: 0, opacity: showLogin ? portalOpacity : 1 }}>
            <PortalFrame active={sc.route}>
              <div key={sc.id} style={{ opacity: showLogin ? 1 : contentFade, transform: showLogin ? 'none' : `translateY(${(1 - contentFade) * 10}px)`, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Page />
              </div>
            </PortalFrame>
          </div>
        )}
        {/* Login overlay */}
        {showLogin && loginOpacity > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: loginOpacity }}><LoginScreen /></div>
        )}
        {/* Cursor (not during login form-less hold? keep it) */}
        {!showClosing && <Cursor x={showLogin ? 1300 : curX} y={showLogin ? 612 : curY} click={showLogin ? (local >= 4.6 && local <= 5.1 ? (local - 4.6) / 0.5 : 0) : click} />}
      </div>

      {/* Closing slide (outside camera) */}
      {showClosing && <div style={{ position: 'absolute', inset: 0, opacity: closingOpacity }}><ClosingSlide /></div>}

      {/* Caption (fixed, crisp) */}
      {!showClosing && <Caption kicker={sc.kicker} title={capTitle} desc={capDesc} opacity={captionOpacity} />}
    </div>
  );
}

function PortalWalkthrough() {
  return (
    <Stage width={1920} height={1080} duration={DURATION} background={C.bg} persistKey="bqs-walkthrough">
      <SceneDirector />
    </Stage>
  );
}

window.PortalWalkthrough = PortalWalkthrough;
window.PortalWalkthroughTokens = { C, FONT };
