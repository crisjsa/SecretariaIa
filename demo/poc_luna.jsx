import { useState, useRef, useEffect } from "react";

// ─── ESTILOS INLINE ───────────────────────────────────────────
const injectCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--rose:#C9847A;--rose-light:#F2D4CF;--rose-dark:#A05E55;--gold:#D4A853;--charcoal:#1C1C1E;--mid:#48484A;--muted:#8E8E93;--light:#F5F0EE;--white:#FEFEFE;--green:#34C759;--red:#FF3B30;--blue:#007AFF}
body{font-family:'DM Sans',sans-serif;background:var(--white);color:var(--charcoal)}
h1,h2,h3{font-family:'Playfair Display',serif;line-height:1.2}
@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`;

// ─── DADOS DA CLÍNICA BELLA ───────────────────────────────────
const CLINICA = {
  nome: "Clínica Bella Estética",
  assistente: "Sofia",
  emoji: "💆‍♀️",
  cidade: "Belo Horizonte, MG",
  wpp: "(31) 99999-0000",
  plano: "Profissional",
};

const SERVICOS = [
  { id:1, nome:"Limpeza de pele",       preco:"R$ 180", duracao:"60min" },
  { id:2, nome:"Design de sobrancelha", preco:"R$ 80",  duracao:"30min" },
  { id:3, nome:"Hidratação facial",     preco:"R$ 150", duracao:"45min" },
  { id:4, nome:"Peeling químico",       preco:"R$ 220", duracao:"60min" },
  { id:5, nome:"Microblading",          preco:"R$ 350", duracao:"90min" },
];

const AGENDA = [
  { id:1, cliente:"Ana Souza",      servico:"Limpeza de pele",       data:"06/08/2026", hora:"09:00", status:"confirmado", tel:"31999990001" },
  { id:2, cliente:"Juliana Matos",  servico:"Design de sobrancelha", data:"06/08/2026", hora:"10:30", status:"pendente",   tel:"31999990002" },
  { id:3, cliente:"Carla Lima",     servico:"Hidratação facial",      data:"07/08/2026", hora:"14:00", status:"confirmado", tel:"31999990003" },
  { id:4, cliente:"Renata Gomes",   servico:"Limpeza de pele",       data:"07/08/2026", hora:"15:30", status:"cancelado",  tel:"31999990004", motivo:"Compromisso imprevisto" },
  { id:5, cliente:"Patrícia Alves", servico:"Microblading",           data:"08/08/2026", hora:"09:00", status:"pendente",   tel:"31999990005" },
];

const LEADS = [
  { id:1, nome:"Fernanda Costa",  interesse:"Depilação a laser",  msg:"Qual o valor?",           data:"05/08", tag:"interessado" },
  { id:2, nome:"Bianca Torres",   interesse:"Limpeza de pele",    msg:"Que dias vocês atendem?", data:"04/08", tag:"interessado" },
  { id:3, nome:"Mariana Fonseca", interesse:"Design sobrancelha", msg:"Ok obrigada",             data:"03/08", tag:"sem_resposta" },
];

// ─── COMPONENTES BASE ─────────────────────────────────────────
function S({ children, ...props }) {
  return <style {...props}>{children}</style>;
}

function Badge({ status }) {
  const map = {
    confirmado: { bg:"rgba(52,199,89,.12)", color:"#1a8a3c", dot:"#34C759" },
    pendente:   { bg:"rgba(212,168,83,.15)", color:"#8a6520", dot:"#D4A853" },
    cancelado:  { bg:"rgba(255,59,48,.10)", color:"#c0392b", dot:"#FF3B30" },
  };
  const s = map[status] || map.pendente;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:100, fontSize:12, fontWeight:600, background:s.bg, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {status}
    </span>
  );
}

// ─── CHAT DEMO ────────────────────────────────────────────────
const SLOTS = [
  { id:"0800", label:"08:00" },
  { id:"1000", label:"10:00" },
  { id:"1100", label:"11:00" },
];

const SCRIPT = [
  { id:0, role:"bot",  text:`Olá! ${CLINICA.emoji} Bem-vinda à ${CLINICA.nome}. Sou ${CLINICA.assistente}, sua assistente. Como posso te ajudar hoje? Posso agendar um serviço, tirar dúvidas ou te conectar com nossa atendente. 😊` },
  { id:1, role:"user", text:"Oi! Quero agendar uma limpeza de pele" },
  { id:2, role:"bot",  text:"Perfeito! Limpeza de Pele — R$ 180 | 60min ✨\nQual dia e horário você prefere?" },
  { id:3, role:"user", text:"Quarta de manhã se tiver" },
  { id:4, role:"bot",  text:"Ótimo! Horários disponíveis na quarta de manhã 👇" },
  { id:5, role:"slots" },
  { id:6, role:"confirm" },
];

function ChatDemo() {
  const [msgs,   setMsgs]   = useState([SCRIPT[0]]);
  const [phase,  setPhase]  = useState(0);
  const [typing, setTyping] = useState(false);
  const [chosen, setChosen] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const next = phase + 1;
    if (next >= SCRIPT.length) return;
    const item = SCRIPT[next];
    if (item.role === "slots" || item.role === "confirm") return;
    const delay = item.role === "bot" ? 1000 : 700;
    setTyping(item.role === "bot");
    const t1 = setTimeout(() => setTyping(false), delay - 200);
    const t2 = setTimeout(() => { setMsgs(m => [...m, item]); setPhase(next); }, delay + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  useEffect(() => {
    if (phase === 4) {
      const t = setTimeout(() => { setMsgs(m => [...m, SCRIPT[5]]); setPhase(5); }, 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }, [msgs, typing]);

  function pickSlot(slot) {
    if (chosen) return;
    setChosen(slot.id);
    setTimeout(() => setMsgs(m => [...m, { id:"u", role:"user", text:slot.label }]), 300);
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id:"c", role:"bot",
        text:`✅ Agendado! Quarta às ${slot.label}\n✨ Limpeza de Pele (60min)\n💰 R$ 180,00\n\nVou te lembrar na véspera. Até lá! 💆‍♀️` }]);
    }, 2000);
  }

  return (
    <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
      borderRadius:20, padding:24, width:340, flexShrink:0, display:"flex", flexDirection:"column", maxHeight:480 }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexShrink:0 }}>
        <div style={{ width:38, height:38, borderRadius:"50%",
          background:"linear-gradient(135deg,#F2D4CF,#C9847A)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💆‍♀️</div>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{CLINICA.assistente} — Secretária IA</div>
          <div style={{ fontSize:11, color:"#C9847A", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:6, height:6, background:"#4cd964", borderRadius:"50%", display:"inline-block" }}/>
            Online agora
          </div>
        </div>
      </div>
      {/* messages */}
      <div style={{ overflowY:"auto", flex:1 }}>
        {msgs.map((m, i) => {
          if (m.role === "slots") return (
            <div key="slots" style={{ marginBottom:10, animation:"fadeUp .4s ease both" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginBottom:7 }}>{CLINICA.assistente}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {SLOTS.map(s => (
                  <button key={s.id} onClick={() => pickSlot(s)} disabled={!!chosen && chosen !== s.id}
                    style={{ background: chosen===s.id ? "var(--rose)" : "rgba(201,132,122,.13)",
                      border:`1px solid ${chosen===s.id ? "var(--rose)" : "rgba(201,132,122,.35)"}`,
                      color: chosen===s.id ? "#fff" : "var(--rose-light)",
                      borderRadius:100, padding:"6px 14px", fontSize:13, fontWeight:500,
                      cursor: chosen && chosen!==s.id ? "default" : "pointer",
                      opacity: chosen && chosen!==s.id ? .4 : 1,
                      fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
                    🕐 {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
          return (
            <div key={m.id ?? i}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginBottom:3,
                textAlign: m.role==="user" ? "right" : "left" }}>
                {m.role==="user" ? "Você" : CLINICA.assistente}
              </div>
              <div style={{
                borderRadius:14, padding:"10px 14px", marginBottom:10,
                fontSize:13, lineHeight:1.6, maxWidth:"85%", whiteSpace:"pre-line",
                background: m.role==="user" ? "rgba(255,255,255,.1)" : "rgba(201,132,122,.18)",
                color: m.role==="user" ? "rgba(255,255,255,.85)" : "var(--rose-light)",
                marginLeft: m.role==="user" ? "auto" : 0,
                marginRight: m.role==="user" ? 0 : "auto",
                borderBottomLeftRadius: m.role==="bot" ? 4 : 14,
                borderBottomRightRadius: m.role==="user" ? 4 : 14,
              }}>{m.text}</div>
            </div>
          );
        })}
        {typing && (
          <div style={{ display:"flex", gap:4, padding:"12px 14px", background:"rgba(201,132,122,.1)",
            borderRadius:14, width:"fit-content", marginBottom:10 }}>
            {[0,.15,.3].map((d,i) => (
              <span key={i} style={{ width:6, height:6, background:"var(--rose)", borderRadius:"50%",
                display:"block", animation:`bounce .8s ${d}s infinite` }}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
    </div>
  );
}

// ─── MODAL GENÉRICO ───────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(28,28,30,.85)",
        backdropFilter:"blur(8px)", zIndex:100, display:"flex",
        alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .2s ease" }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.2)",
        animation:"slideUp .25s ease" }}>
        <div style={{ padding:"24px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ background:"#F5F0EE", border:"none", width:34, height:34,
            borderRadius:"50%", cursor:"pointer", fontSize:16, color:"#8E8E93",
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"20px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#48484A", marginBottom:6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:12, color:"#8E8E93", marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function Input(props) {
  return (
    <input {...props} style={{ width:"100%", padding:"11px 14px", border:"1.5px solid rgba(0,0,0,.12)",
      borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none",
      color:"#1C1C1E", background:"#fff", transition:"border-color .2s", ...props.style }}
      onFocus={e => e.target.style.borderColor="#C9847A"}
      onBlur={e => e.target.style.borderColor="rgba(0,0,0,.12)"}/>
  );
}

function Textarea(props) {
  return (
    <textarea {...props} style={{ width:"100%", padding:"11px 14px", border:"1.5px solid rgba(0,0,0,.12)",
      borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none",
      color:"#1C1C1E", background:"#fff", resize:"vertical", minHeight:80,
      transition:"border-color .2s", ...props.style }}
      onFocus={e => e.target.style.borderColor="#C9847A"}
      onBlur={e => e.target.style.borderColor="rgba(0,0,0,.12)"}/>
  );
}

function Btn({ children, variant="primary", onClick, disabled, style={} }) {
  const styles = {
    primary:   { background:"#C9847A", color:"#fff", border:"none" },
    secondary: { background:"#F5F0EE", color:"#48484A", border:"none" },
    danger:    { background:"none", color:"#FF3B30", border:"1px solid #FF3B30" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding:"10px 24px", borderRadius:100,
        fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .4 : 1,
        transition:"all .2s", ...style }}>
      {children}
    </button>
  );
}

// ─── MODAL CANCELAR/REAGENDAR ─────────────────────────────────
function CancelModal({ ag, onConfirm, onClose }) {
  const [modo,   setModo]   = useState("cancelar");
  const [motivo, setMotivo] = useState("");
  const [data,   setData]   = useState("");
  const [hora,   setHora]   = useState("");

  return (
    <Modal title={modo==="reagendar" ? "Reagendar Atendimento" : "Cancelar Atendimento"} onClose={onClose}>
      <div style={{ background:"#F5F0EE", borderRadius:10, padding:"12px 14px", marginBottom:16,
        fontSize:14, color:"#48484A" }}>
        <strong>{ag.cliente}</strong> — {ag.servico}<br/>
        <span style={{ fontSize:13, color:"#8E8E93" }}>{ag.data} às {ag.hora}</span>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["cancelar","reagendar"].map(m => (
          <button key={m} onClick={() => setModo(m)}
            style={{ flex:1, padding:"9px", borderRadius:8, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
              border:`2px solid ${modo===m ? (m==="cancelar" ? "#FF3B30" : "#C9847A") : "rgba(0,0,0,.1)"}`,
              background: modo===m ? (m==="cancelar" ? "rgba(255,59,48,.06)" : "rgba(201,132,122,.08)") : "transparent",
              color: modo===m ? (m==="cancelar" ? "#FF3B30" : "#A05E55") : "#8E8E93" }}>
            {m==="cancelar" ? "✕ Cancelar" : "📅 Reagendar"}
          </button>
        ))}
      </div>
      {modo==="reagendar" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <Field label="Nova data"><Input type="date" value={data} onChange={e=>setData(e.target.value)}/></Field>
          <Field label="Novo horário"><Input type="time" value={hora} onChange={e=>setHora(e.target.value)}/></Field>
        </div>
      )}
      <Field label="Motivo *" hint="A cliente será notificada pelo WhatsApp.">
        <Textarea placeholder="Ex: Compromisso imprevisto..." value={motivo} onChange={e=>setMotivo(e.target.value)}/>
      </Field>
      <Btn onClick={() => motivo && onConfirm({ modo, motivo, data, hora })} disabled={!motivo} style={{ width:"100%", padding:"12px" }}>
        {modo==="reagendar" ? "Confirmar Reagendamento" : "Confirmar Cancelamento"}
      </Btn>
    </Modal>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [page,        setPage]        = useState("inicio");
  const [agenda,      setAgenda]      = useState(AGENDA);
  const [cancelModal, setCancelModal] = useState(null);
  const [editSvc,     setEditSvc]     = useState(false);
  const [editAsst,    setEditAsst]    = useState(false);
  const [saved,       setSaved]       = useState("");
  const [asstNome,    setAsstNome]    = useState(CLINICA.assistente);
  const [asstTom,     setAsstTom]     = useState("amigavel");
  const [servicos,    setServicos]    = useState(SERVICOS);

  const conf = agenda.filter(a => a.status==="confirmado").length;
  const pend = agenda.filter(a => a.status==="pendente").length;
  const canc = agenda.filter(a => a.status==="cancelado").length;

  function handleCancel(ag, r) {
    setAgenda(prev => prev.map(a => {
      if (a.id !== ag.id) return a;
      if (r.modo==="reagendar") return { ...a, data:r.data||a.data, hora:r.hora||a.hora, status:"pendente", motivo:r.motivo };
      return { ...a, status:"cancelado", motivo:r.motivo };
    }));
    setCancelModal(null);
  }

  function saveMsg(lbl) { setSaved(lbl); setTimeout(() => setSaved(""), 3000); }

  const NAV = [
    { id:"inicio",     icon:"🏠", label:"Início" },
    { id:"secretaria", icon:"🤖", label:"Minha Secretária" },
    { id:"agenda",     icon:"📅", label:"Agenda" },
    { id:"leads",      icon:"💬", label:"Leads" },
    { id:"config",     icon:"⚙️", label:"Configurações" },
  ];

  const sidebarStyle = {
    width:220, background:"#1C1C1E", flexShrink:0,
    display:"flex", flexDirection:"column", padding:"24px 0",
    position:"sticky", top:0, height:"100vh", overflowY:"auto"
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F5F0EE" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,.08)",
          fontFamily:"'Playfair Display',serif", fontSize:20, color:"#fff" }}>
          Luna<span style={{ color:"#C9847A" }}>.</span>
        </div>
        <div style={{ flex:1, padding:"12px 10px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                borderRadius:10, fontSize:14, cursor:"pointer", width:"100%",
                textAlign:"left", fontFamily:"'DM Sans',sans-serif", marginBottom:2,
                border:"none", transition:"all .2s",
                background: page===n.id ? "rgba(201,132,122,.2)" : "none",
                color: page===n.id ? "#F2D4CF" : "rgba(255,255,255,.6)" }}>
              <span style={{ fontSize:17 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.08)",
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%",
            background:"linear-gradient(135deg,#F2D4CF,#C9847A)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, color:"#fff", fontWeight:600, flexShrink:0 }}>
            {user?.nome?.[0]||"P"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.nome||"Priscilla"}</div>
            <div style={{ fontSize:11, color:"#8E8E93" }}>Profissional</div>
          </div>
          <button onClick={onLogout} title="Sair"
            style={{ background:"none", border:"none", color:"#8E8E93", cursor:"pointer", fontSize:16 }}>↩</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:28, overflowY:"auto" }}>

        {/* ── INÍCIO ── */}
        {page==="inicio" && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:26, color:"#1C1C1E" }}>Bom dia! 👋</h1>
                <p style={{ fontSize:14, color:"#8E8E93", marginTop:2 }}>Resumo da {CLINICA.nome} hoje.</p>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {[
                { icon:"📅", val:conf, lbl:"Confirmados",    hi:true  },
                { icon:"⏳", val:pend, lbl:"Pendentes",       hi:false },
                { icon:"💬", val:LEADS.length, lbl:"Leads",  hi:false },
                { icon:"❌", val:canc, lbl:"Cancelamentos",  hi:false },
              ].map(c => (
                <div key={c.lbl} style={{ background: c.hi ? "linear-gradient(135deg,#A05E55,#C9847A)" : "#fff",
                  border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:"18px 16px" }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30,
                    color: c.hi ? "#fff" : "#1C1C1E" }}>{c.val}</div>
                  <div style={{ fontSize:13, color: c.hi ? "rgba(255,255,255,.8)" : "#8E8E93", marginTop:2 }}>{c.lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:22 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <span style={{ fontSize:16, fontWeight:600 }}>Próximos agendamentos</span>
                <button onClick={() => setPage("agenda")}
                  style={{ background:"none", border:"1px solid rgba(0,0,0,.12)", borderRadius:8,
                    padding:"5px 14px", fontSize:12, fontWeight:500, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", color:"#48484A" }}>
                  Ver todos
                </button>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>{["Cliente","Serviço","Data","Hora","Status"].map(h => (
                    <th key={h} style={{ fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase",
                      letterSpacing:.5, padding:"0 0 10px", textAlign:"left",
                      borderBottom:"1px solid rgba(0,0,0,.06)" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {agenda.filter(a => a.status!=="cancelado").slice(0,4).map(a => (
                    <tr key={a.id}>
                      <td style={{ padding:"11px 0", fontSize:14, fontWeight:500,
                        borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.cliente}</td>
                      <td style={{ padding:"11px 0", fontSize:14, color:"#48484A",
                        borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.servico}</td>
                      <td style={{ padding:"11px 0", fontSize:14, color:"#48484A",
                        borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.data}</td>
                      <td style={{ padding:"11px 0", fontSize:14, color:"#48484A",
                        borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.hora}</td>
                      <td style={{ padding:"11px 0", borderBottom:"1px solid rgba(0,0,0,.04)" }}>
                        <Badge status={a.status}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── MINHA SECRETÁRIA ── */}
        {page==="secretaria" && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:26, color:"#1C1C1E" }}>Minha Secretária</h1>
                <p style={{ fontSize:14, color:"#8E8E93", marginTop:2 }}>Configuração ativa da {CLINICA.nome}.</p>
              </div>
              {saved && <div style={{ background:"rgba(52,199,89,.12)", border:"1px solid rgba(52,199,89,.3)",
                borderRadius:100, padding:"7px 16px", fontSize:13, color:"#1a8a3c", fontWeight:600 }}>
                ✓ {saved} salvo!
              </div>}
            </div>

            {/* Preview assistente */}
            <div style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:22, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:16, fontWeight:600 }}>Preview da assistente</span>
                <button onClick={() => { setEditAsst(e=>!e); setEditSvc(false); }}
                  style={{ background: editAsst ? "#F5F0EE" : "#C9847A", color: editAsst ? "#48484A" : "#fff",
                    border:"none", borderRadius:100, padding:"7px 18px", fontSize:13,
                    fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {editAsst ? "✕ Fechar" : "✏️ Editar"}
                </button>
              </div>
              <div style={{ background:"#1C1C1E", borderRadius:14, padding:18, marginBottom: editAsst ? 16 : 0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%",
                    background:"linear-gradient(135deg,#F2D4CF,#C9847A)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💆‍♀️</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{asstNome}</div>
                    <div style={{ fontSize:11, color:"#C9847A", display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:6, height:6, background:"#4cd964", borderRadius:"50%", display:"inline-block" }}/>
                      Ativa e respondendo
                    </div>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"10px 10px 10px 2px",
                  padding:"10px 14px", fontSize:13, color:"rgba(255,255,255,.85)", lineHeight:1.6 }}>
                  Olá! 💆‍♀️ Bem-vinda à {CLINICA.nome}! Sou {asstNome}, sua assistente. Posso agendar serviços, tirar dúvidas ou te conectar com nossa atendente. 😊
                </div>
              </div>
              {editAsst && (
                <div style={{ borderTop:"1px solid rgba(0,0,0,.07)", paddingTop:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Field label="Nome da assistente">
                      <Input value={asstNome} onChange={e => setAsstNome(e.target.value)}/>
                    </Field>
                    <Field label="Tom de atendimento">
                      <select value={asstTom} onChange={e => setAsstTom(e.target.value)}
                        style={{ width:"100%", padding:"11px 14px", border:"1.5px solid rgba(0,0,0,.12)",
                          borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }}>
                        <option value="amigavel">Amigável 😊</option>
                        <option value="profissional">Profissional 💼</option>
                        <option value="carinhoso">Carinhoso 💕</option>
                        <option value="objetivo">Objetivo ⚡</option>
                      </select>
                    </Field>
                  </div>
                  <div style={{ display:"flex", gap:10, marginTop:8 }}>
                    <Btn onClick={() => { setEditAsst(false); saveMsg("Assistente"); }}>Salvar</Btn>
                    <Btn variant="secondary" onClick={() => setEditAsst(false)}>Cancelar</Btn>
                  </div>
                </div>
              )}
            </div>

            {/* Serviços */}
            <div style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:22 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:16, fontWeight:600 }}>Serviços cadastrados</span>
                <button onClick={() => { setEditSvc(e=>!e); setEditAsst(false); }}
                  style={{ background: editSvc ? "#F5F0EE" : "#C9847A", color: editSvc ? "#48484A" : "#fff",
                    border:"none", borderRadius:100, padding:"7px 18px", fontSize:13,
                    fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {editSvc ? "✕ Fechar" : "✏️ Editar"}
                </button>
              </div>
              {!editSvc ? (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px",
                    gap:8, padding:"0 0 8px", borderBottom:"1px solid rgba(0,0,0,.06)", marginBottom:8 }}>
                    {["Tipo de Serviço","Valor","Duração"].map((h,i) => (
                      <span key={h} style={{ fontSize:11, fontWeight:700, color:"#8E8E93",
                        textTransform:"uppercase", letterSpacing:.5,
                        textAlign: i>0 ? "right" : "left" }}>{h}</span>
                    ))}
                  </div>
                  {servicos.map(s => (
                    <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px",
                      gap:8, padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.04)",
                      fontSize:14, color:"#48484A" }}>
                      <span style={{ fontWeight:500, color:"#1C1C1E" }}>{s.nome}</span>
                      <span style={{ textAlign:"right" }}>{s.preco}</span>
                      <span style={{ textAlign:"right" }}>{s.duracao}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {servicos.map(s => (
                    <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 32px",
                      gap:8, marginBottom:8, alignItems:"center",
                      background:"#F5F0EE", borderRadius:10, padding:"10px 12px" }}>
                      <input value={s.nome} onChange={e => setServicos(sv => sv.map(x => x.id===s.id ? {...x,nome:e.target.value} : x))}
                        style={{ border:"none", background:"transparent", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
                      <input value={s.preco} onChange={e => setServicos(sv => sv.map(x => x.id===s.id ? {...x,preco:e.target.value} : x))}
                        style={{ border:"none", background:"transparent", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", textAlign:"right" }}/>
                      <input value={s.duracao} onChange={e => setServicos(sv => sv.map(x => x.id===s.id ? {...x,duracao:e.target.value} : x))}
                        style={{ border:"none", background:"transparent", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", textAlign:"right" }}/>
                      <button onClick={() => setServicos(sv => sv.filter(x => x.id!==s.id))}
                        style={{ background:"none", border:"none", color:"#8E8E93", cursor:"pointer", fontSize:15 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setServicos(sv => [...sv, { id:Date.now(), nome:"", preco:"R$ 0", duracao:"60min" }])}
                    style={{ width:"100%", padding:10, border:"1.5px dashed rgba(0,0,0,.15)", borderRadius:10,
                      background:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:14,
                      color:"#8E8E93", cursor:"pointer", marginBottom:14 }}>
                    + Adicionar serviço
                  </button>
                  <div style={{ display:"flex", gap:10 }}>
                    <Btn onClick={() => { setEditSvc(false); saveMsg("Serviços"); }}>Salvar</Btn>
                    <Btn variant="secondary" onClick={() => setEditSvc(false)}>Cancelar</Btn>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── AGENDA ── */}
        {page==="agenda" && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:26, color:"#1C1C1E" }}>Agenda</h1>
              <p style={{ fontSize:14, color:"#8E8E93", marginTop:2 }}>Gerencie todos os agendamentos da clínica.</p>
            </div>
            {["confirmado","pendente","cancelado"].map(status => {
              const items = agenda.filter(a => a.status===status);
              if (!items.length) return null;
              const labels = { confirmado:"Confirmados", pendente:"Pendentes", cancelado:"Cancelados" };
              return (
                <div key={status} style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)",
                  borderRadius:14, padding:22, marginBottom:14 }}>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>
                    {labels[status]} <span style={{ fontSize:13, color:"#8E8E93", fontWeight:400 }}>({items.length})</span>
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["Cliente","Serviço","Data","Hora","Status","Motivo","Ações"].map(h => (
                        <th key={h} style={{ fontSize:11, fontWeight:700, color:"#8E8E93",
                          textTransform:"uppercase", letterSpacing:.5,
                          padding:"0 0 10px", textAlign:"left",
                          borderBottom:"1px solid rgba(0,0,0,.06)" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {items.map(a => (
                        <tr key={a.id}>
                          <td style={{ padding:"11px 0", fontSize:14, fontWeight:500, borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.cliente}</td>
                          <td style={{ padding:"11px 0", fontSize:13, color:"#48484A", borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.servico}</td>
                          <td style={{ padding:"11px 0", fontSize:13, color:"#48484A", borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.data}</td>
                          <td style={{ padding:"11px 0", fontSize:13, color:"#48484A", borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.hora}</td>
                          <td style={{ padding:"11px 0", borderBottom:"1px solid rgba(0,0,0,.04)" }}><Badge status={a.status}/></td>
                          <td style={{ padding:"11px 0", fontSize:12, color:"#8E8E93", borderBottom:"1px solid rgba(0,0,0,.04)" }}>{a.motivo||"—"}</td>
                          <td style={{ padding:"11px 0", borderBottom:"1px solid rgba(0,0,0,.04)" }}>
                            {status!=="cancelado" && (
                              <button onClick={() => setCancelModal(a)}
                                style={{ background:"none", border:"1px solid rgba(0,0,0,.12)", borderRadius:8,
                                  padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer",
                                  fontFamily:"'DM Sans',sans-serif", color:"#48484A" }}>
                                Cancelar/Reagendar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </>
        )}

        {/* ── LEADS ── */}
        {page==="leads" && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:26, color:"#1C1C1E" }}>Leads</h1>
              <p style={{ fontSize:14, color:"#8E8E93", marginTop:2 }}>Contatos que não agendaram ainda.</p>
            </div>
            <div style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)", borderRadius:14, padding:22 }}>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>
                Em aberto <span style={{ fontSize:13, color:"#8E8E93", fontWeight:400 }}>({LEADS.length})</span>
              </div>
              {LEADS.map(l => (
                <div key={l.id} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"12px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#F5F0EE",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, flexShrink:0 }}>👤</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:"#1C1C1E" }}>{l.nome}</div>
                    <div style={{ fontSize:12, color:"#8E8E93" }}>
                      Interesse: {l.interesse} · "{l.msg}" · {l.data}
                    </div>
                  </div>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100,
                    background: l.tag==="interessado" ? "rgba(0,122,255,.1)" : "rgba(0,0,0,.06)",
                    color: l.tag==="interessado" ? "#007AFF" : "#8E8E93"
                  }}>
                    {l.tag==="interessado" ? "Interessado" : "Sem resposta"}
                  </span>
                  <button style={{ background:"none", border:"1px solid rgba(0,0,0,.12)", borderRadius:8,
                    padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", color:"#48484A" }}>
                    Retomar
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CONFIGURAÇÕES ── */}
        {page==="config" && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:26, color:"#1C1C1E" }}>Configurações</h1>
                <p style={{ fontSize:14, color:"#8E8E93", marginTop:2 }}>Dados da conta e da secretária.</p>
              </div>
              {saved && <div style={{ background:"rgba(52,199,89,.12)", border:"1px solid rgba(52,199,89,.3)",
                borderRadius:100, padding:"7px 16px", fontSize:13, color:"#1a8a3c", fontWeight:600 }}>
                ✓ {saved} salvo!
              </div>}
            </div>
            {[
              { title:"Dados da clínica", items:[
                ["Nome", CLINICA.nome], ["WhatsApp", CLINICA.wpp],
                ["Cidade", CLINICA.cidade], ["E-mail","bella@clinica.com.br"]
              ]},
              { title:"Assistente virtual", items:[
                ["Nome", asstNome], ["Tom","Amigável 😊"],
                ["Falar com humano","Sempre disponível"]
              ]},
              { title:"Plano e cobrança", items:[
                ["Plano atual","Profissional — R$ 197/mês"],
                ["Próxima cobrança","01/09/2026"],
                ["Cartão","•••• •••• •••• 4242"]
              ]},
            ].map(sec => (
              <div key={sec.title} style={{ background:"#fff", border:"1px solid rgba(0,0,0,.07)",
                borderRadius:14, padding:22, marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <span style={{ fontSize:15, fontWeight:600 }}>{sec.title}</span>
                  <button onClick={() => saveMsg(sec.title)}
                    style={{ background:"#C9847A", color:"#fff", border:"none", borderRadius:100,
                      padding:"6px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif" }}>✏️ Editar</button>
                </div>
                {sec.items.map(([l,v]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"12px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                    <span style={{ fontSize:14, fontWeight:500, color:"#1C1C1E" }}>{l}</span>
                    <span style={{ fontSize:14, color:"#8E8E93" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

      </div>
      {cancelModal && <CancelModal ag={cancelModal} onConfirm={r => handleCancel(cancelModal, r)} onClose={() => setCancelModal(null)}/>}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────
function Landing({ onLogin, onWizard }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const FAQS = [
    { q:"Preciso de conhecimento técnico?", a:"Não! O assistente guia você em menos de 10 minutos, sem precisar de programação." },
    { q:"Quanto tempo leva para funcionar?", a:"Em até 24h úteis após a configuração sua secretária já está respondendo clientes." },
    { q:"O WhatsApp precisa ficar conectado?", a:"Sim, o número precisa ter WhatsApp ativo. Funciona com seu número atual." },
    { q:"Posso cancelar a qualquer momento?", a:"Sim, sem multa ou fidelidade. Cancele quando quiser pelo painel." },
  ];
  return (
    <div>
      {/* HERO */}
      <div style={{ background:"#1C1C1E", minHeight:"100vh", display:"flex",
        flexDirection:"column", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(201,132,122,.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(212,168,83,.10) 0%, transparent 60%)" }}/>
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"22px 48px", position:"relative", zIndex:2 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#fff" }}>
            Luna<span style={{ color:"#C9847A" }}>.</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onLogin}
              style={{ background:"transparent", color:"rgba(255,255,255,.7)",
                border:"1px solid rgba(255,255,255,.2)", padding:"9px 20px",
                borderRadius:100, fontFamily:"'DM Sans',sans-serif", fontSize:14, cursor:"pointer" }}>
              Entrar
            </button>
            <button onClick={onLogin}
              style={{ background:"#C9847A", color:"#fff", border:"none",
                padding:"9px 22px", borderRadius:100, fontFamily:"'DM Sans',sans-serif",
                fontSize:14, fontWeight:500, cursor:"pointer" }}>
              Primeiro acesso
            </button>
          </div>
        </nav>
        <div style={{ flex:1, display:"flex", alignItems:"center", padding:"32px 48px 72px",
          maxWidth:1100, margin:"0 auto", width:"100%", gap:72, position:"relative", zIndex:2 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(201,132,122,.15)", border:"1px solid rgba(201,132,122,.3)",
              color:"#F2D4CF", padding:"6px 16px", borderRadius:100, fontSize:13,
              fontWeight:500, marginBottom:24 }}>
              ✦ Secretária de IA para estética
            </div>
            <h1 style={{ fontSize:56, color:"#fff", marginBottom:20, lineHeight:1.15 }}>
              Sua clínica<br/>
              <em style={{ color:"#C9847A", fontStyle:"italic" }}>atendendo 24h</em><br/>
              sem você
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,.55)", maxWidth:440,
              marginBottom:36, fontWeight:300, lineHeight:1.7 }}>
              A assistente virtual que agenda, lembra e nunca deixa uma cliente sem resposta — enquanto você foca no que sabe fazer.
            </p>
            <div style={{ display:"flex", gap:14 }}>
              <button onClick={onWizard}
                style={{ background:"#C9847A", color:"#fff", border:"none",
                  padding:"15px 34px", borderRadius:100, fontSize:16, fontWeight:600,
                  cursor:"pointer", boxShadow:"0 8px 24px rgba(201,132,122,.4)",
                  fontFamily:"'DM Sans',sans-serif" }}>
                Configurar minha secretária
              </button>
              <button onClick={() => document.getElementById("planos")?.scrollIntoView({behavior:"smooth"})}
                style={{ background:"transparent", color:"rgba(255,255,255,.65)",
                  border:"1px solid rgba(255,255,255,.2)", padding:"15px 34px",
                  borderRadius:100, fontSize:16, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif" }}>
                Ver planos
              </button>
            </div>
          </div>
          <ChatDemo/>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:"#F5F0EE", borderTop:"1px solid rgba(0,0,0,.06)",
        padding:"28px 48px", display:"flex", gap:48, flexWrap:"wrap", justifyContent:"center" }}>
        {[["24h","Atendimento"],["14 dias","Teste grátis"],["97%","Satisfação"],["R$ 0","Por mensagem"]].map(([n,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:34, color:"#A05E55" }}>{n}</div>
            <div style={{ fontSize:13, color:"#8E8E93", fontWeight:500, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* PLANOS */}
      <div style={{ background:"#F5F0EE", padding:"80px 48px" }} id="planos">
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
            color:"#C9847A", marginBottom:10 }}>Planos</div>
          <h2 style={{ fontSize:40, color:"#1C1C1E", marginBottom:8 }}>Simples e transparente</h2>
          <p style={{ fontSize:16, color:"#8E8E93", fontWeight:300, marginBottom:48 }}>14 dias grátis. Sem contrato. Cancele quando quiser.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[
              { slug:"basic",   label:"Básico",       price:97,  badge:"Starter",     popular:false,
                desc:"Para começar com o essencial.",
                feats:["Atendimento 24h WhatsApp","Agendamento automático","Lembrete 24h","Escalada para humano"],
                off:["Lembrete 2h","Relatório mensal"] },
              { slug:"pro",     label:"Profissional", price:197, badge:"Mais Popular", popular:true,
                desc:"Profissionalismo e confiabilidade.",
                feats:["Tudo do Básico","Lembrete 2h antes","Pós-atendimento automático","Pacotes de serviços","Suporte WhatsApp"],
                off:["Relatório mensal"] },
              { slug:"premium", label:"Premium",      price:347, badge:"Completo",     popular:false,
                desc:"Gestão completa da clínica.",
                feats:["Tudo do Profissional","Relatório mensal automático","Campanhas de reativação","2 números WhatsApp","Onboarding assistido"],
                off:[] },
            ].map(p => (
              <div key={p.slug} style={{ borderRadius:20, padding:"32px 28px", position:"relative",
                background: p.slug==="basic" ? "#fff" : p.slug==="pro" ? "#1C1C1E" : "linear-gradient(135deg,#A05E55,#C9847A)",
                border: p.slug==="basic" ? "2px solid rgba(0,0,0,.08)" : "2px solid transparent",
                color: p.slug==="basic" ? "#1C1C1E" : "#fff" }}>
                {p.popular && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                    background:"#D4A853", color:"#1C1C1E", fontSize:11, fontWeight:700,
                    padding:"4px 16px", borderRadius:100, letterSpacing:1,
                    textTransform:"uppercase", whiteSpace:"nowrap" }}>⭐ Mais escolhido</div>
                )}
                <div style={{ display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:1.5,
                  textTransform:"uppercase", padding:"4px 12px", borderRadius:100, marginBottom:18,
                  background: p.slug==="basic" ? "#F5F0EE" : "rgba(255,255,255,.15)",
                  color: p.slug==="basic" ? "#8E8E93" : "rgba(255,255,255,.8)" }}>{p.badge}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, marginBottom:4 }}>{p.label}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:48, lineHeight:1, marginBottom:4 }}>
                  <span style={{ fontSize:18, fontFamily:"'DM Sans',sans-serif", fontWeight:400,
                    verticalAlign:"top", marginTop:10, display:"inline-block" }}>R$</span>
                  {p.price}
                </div>
                <div style={{ fontSize:13, opacity:.6, marginBottom:20 }}>por mês</div>
                <div style={{ fontSize:14, opacity:.7, marginBottom:24, lineHeight:1.5 }}>{p.desc}</div>
                <ul style={{ listStyle:"none", marginBottom:28, display:"flex", flexDirection:"column", gap:8 }}>
                  {p.feats.map(f => (
                    <li key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14 }}>
                      <span style={{ color: p.slug==="basic" ? "#C9847A" : "#fff", fontWeight:700 }}>✓</span>{f}
                    </li>
                  ))}
                  {p.off.map(f => (
                    <li key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, opacity:.35 }}>
                      <span>–</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={onWizard}
                  style={{ width:"100%", padding:13, borderRadius:100,
                    fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600,
                    cursor:"pointer", border:"none", transition:"all .2s",
                    background: p.slug==="basic" ? "#1C1C1E" : p.slug==="pro" ? "#fff" : "rgba(255,255,255,.25)",
                    color: p.slug==="basic" ? "#fff" : p.slug==="pro" ? "#1C1C1E" : "#fff",
                    ...(p.slug==="premium" ? { border:"1px solid rgba(255,255,255,.4)" } : {}) }}>
                  Começar agora →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding:"80px 48px", maxWidth:800, margin:"0 auto" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
          color:"#C9847A", marginBottom:10 }}>Dúvidas</div>
        <h2 style={{ fontSize:36, color:"#1C1C1E", marginBottom:40 }}>Perguntas frequentes</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {FAQS.map((f,i) => (
            <div key={i} style={{ border:"1px solid rgba(0,0,0,.08)", borderRadius:12, overflow:"hidden" }}>
              <button onClick={() => setFaqOpen(faqOpen===i ? null : i)}
                style={{ width:"100%", background:"#fff", border:"none", padding:"18px 22px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500,
                  color:"#1C1C1E", cursor:"pointer", textAlign:"left" }}>
                {f.q}
                <span style={{ fontSize:18, color:"#C9847A",
                  transform: faqOpen===i ? "rotate(45deg)" : "none",
                  transition:"transform .25s", flexShrink:0, marginLeft:12 }}>+</span>
              </button>
              {faqOpen===i && (
                <div style={{ padding:"0 22px 18px", fontSize:14, color:"#8E8E93",
                  lineHeight:1.8, background:"#fff" }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:"#1C1C1E", padding:"80px 48px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, color:"#fff", marginBottom:14 }}>
          Sua clínica merece uma{" "}
          <em style={{ color:"#C9847A" }}>secretária que nunca dorme</em>
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.5)", marginBottom:36, fontWeight:300 }}>
          Configure em 10 minutos. 14 dias grátis.
        </p>
        <button onClick={onWizard}
          style={{ background:"#C9847A", color:"#fff", border:"none",
            padding:"16px 48px", borderRadius:100, fontSize:17, fontWeight:600,
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            boxShadow:"0 8px 24px rgba(201,132,122,.4)" }}>
          Começar agora
        </button>
        <p style={{ fontSize:12, color:"rgba(255,255,255,.25)", marginTop:12 }}>
          Sem cartão para testar · Cancele quando quiser
        </p>
      </div>

      <footer style={{ background:"#1C1C1E", borderTop:"1px solid rgba(255,255,255,.06)",
        padding:"36px 48px", textAlign:"center", color:"rgba(255,255,255,.4)", fontSize:13 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#fff", marginBottom:6 }}>
          Luna<span style={{ color:"#C9847A" }}>.</span>
        </div>
        <p>Secretária de IA para clínicas de estética</p>
        <p style={{ marginTop:6 }}>© 2026 · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("bella@clinica.com.br");
  const [pass,  setPass]  = useState("Bella@2026");
  const [show,  setShow]  = useState(false);
  const [load,  setLoad]  = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoad(true);
    await new Promise(r => setTimeout(r, 900));
    setLoad(false);
    onLogin({ nome:"Priscilla", email });
  }

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(28,28,30,.85)",
        backdropFilter:"blur(8px)", zIndex:100, display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:22, width:"100%", maxWidth:420,
        boxShadow:"0 20px 60px rgba(0,0,0,.2)", animation:"slideUp .25s ease" }}>
        <div style={{ padding:"24px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#1C1C1E" }}>
            Luna<span style={{ color:"#C9847A" }}>.</span>
          </div>
          <button onClick={onClose} style={{ background:"#F5F0EE", border:"none", width:34, height:34,
            borderRadius:"50%", cursor:"pointer", fontSize:16, color:"#8E8E93",
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"20px 28px 28px" }}>
          <h2 style={{ fontSize:22, marginBottom:4 }}>Bem-vinda de volta</h2>
          <p style={{ fontSize:14, color:"#8E8E93", marginBottom:20 }}>Acesse sua conta para gerenciar a secretária.</p>
          {/* Google btn */}
          <button onClick={() => onLogin({ nome:"Priscilla", email:"bella@gmail.com", google:true })}
            style={{ width:"100%", padding:"11px", border:"1.5px solid rgba(0,0,0,.12)",
              borderRadius:10, background:"#fff", fontFamily:"'DM Sans',sans-serif",
              fontSize:14, fontWeight:500, cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(0,0,0,.1)" }}/>
            <span style={{ fontSize:13, color:"#8E8E93" }}>ou</span>
            <div style={{ flex:1, height:1, background:"rgba(0,0,0,.1)" }}/>
          </div>
          <form onSubmit={submit}>
            <Field label="E-mail">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"/>
            </Field>
            <Field label="Senha">
              <div style={{ position:"relative" }}>
                <Input type={show?"text":"password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ paddingRight:42 }}/>
                <button type="button" onClick={() => setShow(s=>!s)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#8E8E93" }}>
                  {show?"🙈":"👁"}
                </button>
              </div>
            </Field>
            <div style={{ fontSize:13, color:"#C9847A", textAlign:"right", marginTop:-8, marginBottom:16, cursor:"pointer" }}>
              Esqueci minha senha
            </div>
            <button type="submit" disabled={load}
              style={{ width:"100%", padding:"12px", background:"#C9847A", color:"#fff",
                border:"none", borderRadius:100, fontFamily:"'DM Sans',sans-serif",
                fontSize:15, fontWeight:600, cursor: load ? "not-allowed" : "pointer",
                opacity: load ? .7 : 1, transition:"all .2s" }}>
              {load ? "Entrando..." : "Entrar →"}
            </button>
          </form>
          <p style={{ textAlign:"center", fontSize:14, color:"#8E8E93", marginTop:14 }}>
            Não tem conta?{" "}
            <span onClick={() => onLogin({ nome:"Priscilla", email })}
              style={{ color:"#C9847A", cursor:"pointer", fontWeight:600 }}>
              Criar conta
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
export default function App() {
  const [view,      setView]      = useState("landing"); // landing | dashboard
  const [user,      setUser]      = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  function handleLogin(u) {
    setUser(u);
    setShowLogin(false);
    setView("dashboard");
  }

  return (
    <>
      <style>{injectCSS}</style>
      {view === "dashboard" ? (
        <Dashboard user={user} onLogout={() => { setUser(null); setView("landing"); }}/>
      ) : (
        <Landing
          onLogin={() => setShowLogin(true)}
          onWizard={() => setShowLogin(true)}
        />
      )}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin}/>
      )}
    </>
  );
}
