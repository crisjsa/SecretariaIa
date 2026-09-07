import { useState, useRef, useEffect } from "react";
import "./index.css";

// ─── CONSTANTES ───────────────────────────────
const PLANS = [
  { id:"basico",   slug:"basic",   label:"Básico",        price:97,  badge:"Starter",      popular:false,
    desc:"Para começar com o essencial.",
    features:[{t:"Atendimento 24h WhatsApp",on:true},{t:"Agendamento automático",on:true},{t:"Lembrete 24h",on:true},{t:"Escalada para humano",on:true},{t:"Lembrete 2h",on:false},{t:"Pós-atendimento",on:false},{t:"Relatório mensal",on:false}]},
  { id:"profissional", slug:"pro", label:"Profissional",  price:197, badge:"Mais Popular",  popular:true,
    desc:"Profissionalismo e confiabilidade.",
    features:[{t:"Tudo do Básico",on:true},{t:"Verificação de disponibilidade",on:true},{t:"Lembrete 2h antes",on:true},{t:"Pós-atendimento automático",on:true},{t:"Suporte WhatsApp",on:true},{t:"Relatório mensal",on:false}]},
  { id:"premium",  slug:"premium", label:"Premium",       price:347, badge:"Completo",      popular:false,
    desc:"Gestão completa da clínica.",
    features:[{t:"Tudo do Profissional",on:true},{t:"Relatório mensal",on:true},{t:"Campanhas reativação",on:true},{t:"2 números WhatsApp",on:true},{t:"Onboarding assistido",on:true}]},
];

const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const FAQS = [
  {q:"Preciso de conhecimento técnico?",       a:"Não! Nosso assistente guia você em menos de 10 minutos."},
  {q:"Quanto tempo leva para funcionar?",      a:"Em até 24 horas úteis após a configuração."},
  {q:"O WhatsApp precisa ficar conectado?",    a:"Sim, o número precisa ter WhatsApp ativo. Funciona com seu número atual."},
  {q:"Posso cancelar a qualquer momento?",     a:"Sim, sem multa. Cancele quando quiser pelo painel."},
  {q:"A IA entende mensagens de voz?",         a:"Áudios são transcritos e respondidos em texto automaticamente."},
];

const DEFAULT_SERVICES = [
  {id:1, name:"Limpeza de pele",       price:"180", duration:"60"},
  {id:2, name:"Design de sobrancelha", price:"80",  duration:"30"},
];

const MOCK_AGENDA = [
  {id:1, cliente:"Ana Souza",      servico:"Limpeza de pele",        data:"2026-06-06", hora:"09:00", status:"confirmado", motivo:""},
  {id:2, cliente:"Juliana Matos",  servico:"Design de sobrancelha",  data:"2026-06-06", hora:"10:30", status:"pendente",   motivo:""},
  {id:3, cliente:"Carla Lima",     servico:"Hidratação facial",       data:"2026-06-07", hora:"14:00", status:"confirmado", motivo:""},
  {id:4, cliente:"Renata Gomes",   servico:"Limpeza de pele",        data:"2026-06-07", hora:"15:30", status:"cancelado",  motivo:"Compromisso imprevisto"},
  {id:5, cliente:"Patrícia Alves", servico:"Microblading",            data:"2026-06-08", hora:"09:00", status:"pendente",   motivo:""},
];

const MOCK_LEADS = [
  {id:1, nome:"Fernanda Costa",   interesse:"Depilação a laser",  contato:"11999990010", msg:"Qual o valor?",              data:"2026-06-05", tag:"interessado"},
  {id:2, nome:"Bianca Torres",    interesse:"Limpeza de pele",    contato:"11999990011", msg:"Que dias vocês atendem?",    data:"2026-06-04", tag:"interessado"},
  {id:3, nome:"Mariana Fonseca",  interesse:"Design sobrancelha", contato:"11999990012", msg:"Ok obrigada",               data:"2026-06-03", tag:"sem_resposta"},
];

// ─── UTILITÁRIOS ──────────────────────────────
function pwStrength(p) {
  if (!p) return { score:0, label:"", color:"transparent" };
  let s = 0;
  if (p.length >= 8)  s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const m = [
    {label:"Muito fraca", color:"#FF3B30"},
    {label:"Fraca",       color:"#FF9500"},
    {label:"Razoável",    color:"#FFCC00"},
    {label:"Boa",         color:"#34C759"},
    {label:"Forte",       color:"#007AFF"},
    {label:"Excelente",   color:"#5856D6"},
  ];
  return { score:s, ...m[Math.min(s, 5)] };
}

function maskCard(v)   { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
function maskExpiry(v) { let d=v.replace(/\D/g,"").slice(0,4); if(d.length>2) d=d.slice(0,2)+"/"+d.slice(2); return d; }

// ─── ÍCONE GOOGLE ─────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── CHAT DEMO ────────────────────────────────
const SLOTS_MANHA = [
  {id:"0800", label:"08:00"},
  {id:"1000", label:"10:00"},
  {id:"1100", label:"11:00"},
];

function ChatDemo() {
  const [msgs, setMsgs]     = useState([{id:0, role:"bot", text:"Olá! 💆‍♀️ Bem-vinda à Clínica Bella. Sou a Luna. Como posso te ajudar hoje?"}]);
  const [phase, setPhase]   = useState(0);
  const [typing, setTyping] = useState(false);
  const [chosen, setChosen] = useState(null);
  const bottomRef = useRef(null);

  const SCRIPT = [
    {role:"user", text:"Oi! Quero agendar uma limpeza de pele"},
    {role:"bot",  text:"Perfeito! Você prefere manhã ou tarde? ☀️"},
    {role:"user", text:"Quarta de manhã se tiver"},
    {role:"bot",  text:"Ótimo! Horários disponíveis na quarta de manhã 👇"},
    {role:"slots"},
  ];

  useEffect(() => {
    if (phase >= SCRIPT.length) return;
    const item = SCRIPT[phase];
    if (item.role === "slots") return;
    const delay = item.role === "bot" ? 1000 : 700;
    setTyping(item.role === "bot");
    const t1 = setTimeout(() => setTyping(false), delay - 200);
    const t2 = setTimeout(() => {
      setMsgs(m => [...m, {id: Date.now(), ...item}]);
      setPhase(p => p + 1);
    }, delay + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  useEffect(() => {
    if (phase === 4) {
      const t = setTimeout(() => {
        setMsgs(m => [...m, {id:"slots", role:"slots"}]);
        setPhase(5);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:"smooth", block:"nearest"});
  }, [msgs, typing]);

  function pickSlot(slot) {
    if (chosen) return;
    setChosen(slot.id);
    setTimeout(() => setMsgs(m => [...m, {id:"u_pick", role:"user", text:slot.label}]), 300);
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, {id:"confirm", role:"bot", text:`✅ Agendado! Quarta às ${slot.label} — Limpeza de pele (60min). Te lembro na véspera! ✨`}]);
    }, 2000);
  }

  return (
    <div className="chat-demo">
      <div className="chat-header">
        <div className="chat-avatar">💆‍♀️</div>
        <div>
          <div className="chat-name">Luna — Secretária IA</div>
          <div className="chat-online"><span className="dot-green"/>Online agora</div>
        </div>
      </div>
      <div className="chat-messages">
        {msgs.map((m, i) => {
          if (m.role === "slots") return (
            <div key="slots" className="slots-wrap">
              <div className="chat-label">Luna</div>
              <div className="slots-row">
                {SLOTS_MANHA.map(s => (
                  <button key={s.id}
                    className={"slot-btn" + (chosen === s.id ? " picked" : "")}
                    onClick={() => pickSlot(s)}
                    disabled={!!chosen && chosen !== s.id}>
                    🕐 {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
          return (
            <div key={m.id ?? i}>
              <div className="chat-label" style={{textAlign: m.role==="user" ? "right" : "left"}}>
                {m.role === "user" ? "Você" : "Luna"}
              </div>
              <div className={"bubble " + m.role}>{m.text}</div>
            </div>
          );
        })}
        {typing && <div className="typing"><span/><span/><span/></div>}
        <div ref={bottomRef}/>
      </div>
    </div>
  );
}

// ─── AUTH MODALS ──────────────────────────────
function LoginModal({onClose, onLogin, onForgot, onFirst}) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [show,    setShow]    = useState(false);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!email || !pass) { setErr("Preencha todos os campos."); return; }
    if (!email.includes("@")) { setErr("E-mail inválido."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onLogin({email, nome:"Usuária"});
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="logo-sm">Luna<span>.</span></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <h2 className="modal-title">Bem-vinda de volta</h2>
          <p className="modal-sub">Acesse sua conta para gerenciar sua secretária.</p>
          <button className="google-btn" onClick={() => onLogin({email:"user@gmail.com", nome:"Usuária", google:true})}>
            <GoogleIcon/> Continuar com Google
          </button>
          <div className="divider"><span>ou</span></div>
          <form onSubmit={submit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="input-wrap">
                <input type={show ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}/>
                <button type="button" className="eye-btn" onClick={() => setShow(s => !s)}>{show ? "🙈" : "👁"}</button>
              </div>
            </div>
            <button type="button" className="link-btn" onClick={onForgot}>Esqueci minha senha</button>
            {err && <div className="field-err">⚠️ {err}</div>}
            <button type="submit" className="btn-primary full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar →"}
            </button>
          </form>
          <p className="switch-txt">Primeiro acesso? <button className="link-btn" onClick={onFirst}>Criar conta</button></p>
        </div>
      </div>
    </div>
  );
}

function ForgotModal({onClose, onBack}) {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="logo-sm">Luna<span>.</span></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!sent ? (
            <>
              <h2 className="modal-title">Recuperar senha</h2>
              <p className="modal-sub">Enviaremos um link seguro para o seu e-mail.</p>
              <form onSubmit={submit}>
                <div className="field">
                  <label>E-mail cadastrado</label>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
                <button type="submit" className="btn-primary full" disabled={loading || !email}>
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
              <p className="switch-txt"><button className="link-btn" onClick={onBack}>← Voltar para o login</button></p>
            </>
          ) : (
            <div style={{textAlign:"center", padding:"16px 0"}}>
              <div style={{fontSize:48, marginBottom:16}}>📧</div>
              <h2 className="modal-title">E-mail enviado!</h2>
              <p className="modal-sub">Enviamos o link para <strong>{email}</strong>. Verifique também a pasta spam.</p>
              <div className="sec-badge" style={{margin:"16px 0"}}>🔒 Link expira em 30 minutos por segurança.</div>
              <button className="btn-primary full" onClick={onClose}>Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WIZARD ───────────────────────────────────
function WizardPlan({data, setData}) {
  return (
    <div>
      <div className="plan-mini-grid">
        {PLANS.map(p => (
          <div key={p.id} className={"plan-mini" + (data.plan === p.id ? " sel" : "")}
            onClick={() => setData(d => ({...d, plan:p.id}))}>
            <div className="pm-name">{p.label}</div>
            <div className="pm-price"><span>R$</span>{p.price}</div>
            <div className="pm-mo">/mês</div>
          </div>
        ))}
      </div>
      <div className="plan-feat-box">
        {PLANS.find(p => p.id === data.plan)?.features.filter(f => f.on).map((f,i) => (
          <div key={i} className="feat-row"><span className="chk">✓</span>{f.t}</div>
        ))}
      </div>
    </div>
  );
}

function WizardClinic({data, setData, errs}) {
  function f(k) { return errs[k] ? "error" : ""; }
  return (
    <div>
      <div className="field">
        <label>Nome da clínica *</label>
        <input className={f("nome")} type="text" placeholder="Ex: Clínica Bella Estética"
          value={data.nome} onChange={e => setData(d => ({...d, nome:e.target.value}))}/>
      </div>
      <div className="field-row">
        <div className="field">
          <label>WhatsApp *</label>
          <input className={f("wpp")} type="text" placeholder="(11) 99999-9999"
            value={data.wpp} onChange={e => setData(d => ({...d, wpp:e.target.value}))}/>
        </div>
        <div className="field">
          <label>Cidade</label>
          <input type="text" placeholder="São Paulo, SP"
            value={data.cidade} onChange={e => setData(d => ({...d, cidade:e.target.value}))}/>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Responsável *</label>
          <input className={f("resp")} type="text" placeholder="Seu nome completo"
            value={data.resp} onChange={e => setData(d => ({...d, resp:e.target.value}))}/>
        </div>
        <div className="field">
          <label>E-mail *</label>
          <input className={f("email")} type="email" placeholder="seu@email.com"
            value={data.email} onChange={e => setData(d => ({...d, email:e.target.value}))}/>
        </div>
      </div>
    </div>
  );
}

function WizardAssistant({data, setData}) {
  const prev = `Olá! ${data.emoji||"✨"} Bem-vinda à ${data.clinicNome||"sua clínica"}! Sou ${data.nome||"Luna"}. Posso agendar, tirar dúvidas ou te conectar com nossa atendente. 😊`;
  return (
    <div>
      <div className="asst-preview">
        <div className="asst-head">
          <div className="asst-avatar">{data.emoji||"💆‍♀️"}</div>
          <div>
            <div className="asst-name">{data.nome||"Luna"}</div>
            <div className="asst-status"><span className="dot-green"/>Online agora</div>
          </div>
        </div>
        <div className="asst-bubble">{prev}</div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nome da assistente</label>
          <input type="text" placeholder="Ex: Luna, Sofia..." value={data.nome}
            onChange={e => setData(d => ({...d, nome:e.target.value}))}/>
        </div>
        <div className="field">
          <label>Emoji</label>
          <input type="text" placeholder="💆‍♀️" value={data.emoji}
            onChange={e => setData(d => ({...d, emoji:e.target.value}))}/>
        </div>
      </div>
      <div className="field">
        <label>Tom de atendimento</label>
        <select value={data.tom} onChange={e => setData(d => ({...d, tom:e.target.value}))}>
          <option value="amigavel">Amigável e descontraído 😊</option>
          <option value="profissional">Profissional e elegante 💼</option>
          <option value="carinhoso">Carinhoso e próximo 💕</option>
          <option value="objetivo">Direto e objetivo ⚡</option>
        </select>
      </div>
      <div className="field">
        <label>Mensagem de boas-vindas</label>
        <textarea placeholder="Deixe em branco para usar a padrão..." value={data.welcome}
          onChange={e => setData(d => ({...d, welcome:e.target.value}))}/>
        <div className="field-hint">A opção de falar com atendente é sempre incluída automaticamente.</div>
      </div>
    </div>
  );
}

function WizardServices({data, setData}) {
  const tab = data.tab || "avulso";
  const pkgs = data.packages || [];

  function addSvc()            { setData(d => ({...d, services:[...d.services, {id:Date.now(), name:"", price:"", duration:"60"}]})); }
  function rmSvc(id)           { setData(d => ({...d, services:d.services.filter(s => s.id !== id)})); }
  function updSvc(id,k,v)      { setData(d => ({...d, services:d.services.map(s => s.id===id ? {...s,[k]:v} : s)})); }
  function addPkg()            { setData(d => ({...d, packages:[...pkgs, {id:Date.now(), name:"", price:"", val:"90", items:[{id:Date.now()+1,svc:"",qty:""}]}]})); }
  function rmPkg(id)           { setData(d => ({...d, packages:pkgs.filter(p => p.id!==id)})); }
  function updPkg(id,k,v)      { setData(d => ({...d, packages:pkgs.map(p => p.id===id ? {...p,[k]:v} : p)})); }
  function addItem(pid)        { setData(d => ({...d, packages:pkgs.map(p => p.id===pid ? {...p,items:[...p.items,{id:Date.now(),svc:"",qty:""}]} : p)})); }
  function rmItem(pid,iid)     { setData(d => ({...d, packages:pkgs.map(p => p.id===pid ? {...p,items:p.items.filter(i=>i.id!==iid)} : p)})); }
  function updItem(pid,iid,k,v){ setData(d => ({...d, packages:pkgs.map(p => p.id===pid ? {...p,items:p.items.map(i=>i.id===iid?{...i,[k]:v}:i)} : p)})); }

  return (
    <div>
      <div className="tab-row">
        {[{id:"avulso",l:"🔹 Avulsos"},{id:"pacote",l:"📦 Pacotes"}].map(t => (
          <button key={t.id} className={"tab-btn" + (tab===t.id ? " active" : "")}
            onClick={() => setData(d => ({...d, tab:t.id}))}>{t.l}</button>
        ))}
      </div>

      {tab === "avulso" && (
        <>
          <div className="svc-head">
            <span>Tipo de Serviço</span><span>Valor (R$)</span><span>Duração</span><span/>
          </div>
          {data.services.map(s => (
            <div key={s.id} className="svc-row">
              <input type="text" placeholder="Ex: Limpeza de pele" value={s.name}
                onChange={e => updSvc(s.id,"name",e.target.value)}/>
              <div className="num-cell">
                <span>R$</span>
                <input type="number" placeholder="0" value={s.price}
                  onChange={e => updSvc(s.id,"price",e.target.value)}/>
              </div>
              <div className="num-cell">
                <input type="number" placeholder="60" value={s.duration}
                  onChange={e => updSvc(s.id,"duration",e.target.value)}/>
                <span>min</span>
              </div>
              <button className="x-sm" onClick={() => rmSvc(s.id)}>✕</button>
            </div>
          ))}
          <button className="add-btn" onClick={addSvc}>+ Adicionar serviço</button>
        </>
      )}

      {tab === "pacote" && (
        <>
          {pkgs.map(pkg => (
            <div key={pkg.id} className="pkg-card">
              <div className="pkg-head-row">
                <div className="field" style={{flex:2, margin:0}}>
                  <label>Nome do Pacote</label>
                  <input type="text" placeholder="Ex: Pacote Pele Radiante" value={pkg.name}
                    onChange={e => updPkg(pkg.id,"name",e.target.value)}/>
                </div>
                <div className="field" style={{flex:1, margin:0}}>
                  <label>Valor (R$)</label>
                  <input type="number" placeholder="0" value={pkg.price}
                    onChange={e => updPkg(pkg.id,"price",e.target.value)}/>
                </div>
                <div className="field" style={{flex:1, margin:0}}>
                  <label>Validade</label>
                  <select value={pkg.val} onChange={e => updPkg(pkg.id,"val",e.target.value)}>
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                    <option value="180">6 meses</option>
                    <option value="365">1 ano</option>
                  </select>
                </div>
                <button className="x-sm" style={{marginTop:22}} onClick={() => rmPkg(pkg.id)}>✕</button>
              </div>
              <div className="pkg-items-label">Serviços incluídos</div>
              {pkg.items.map(item => (
                <div key={item.id} className="pkg-item-row">
                  <input type="text" placeholder="Ex: Limpeza de pele" value={item.svc}
                    onChange={e => updItem(pkg.id,item.id,"svc",e.target.value)}/>
                  <input type="number" placeholder="Qtd" min="1" value={item.qty}
                    onChange={e => updItem(pkg.id,item.id,"qty",e.target.value)}/>
                  <button className="x-sm" onClick={() => rmItem(pkg.id,item.id)}>✕</button>
                </div>
              ))}
              <button className="add-btn" style={{marginTop:6}} onClick={() => addItem(pkg.id)}>+ Serviço no pacote</button>
            </div>
          ))}
          <button className="add-btn" onClick={addPkg}>+ Criar pacote</button>
          <p className="field-hint">A IA verifica sessões usadas e avisa quando o pacote esgotar.</p>
        </>
      )}
    </div>
  );
}

function WizardSchedule({data, setData}) {
  function toggleDay(i) {
    setData(d => {
      const on = d.days.includes(i);
      const days = on ? d.days.filter(x=>x!==i) : [...d.days,i].sort((a,b)=>a-b);
      const slots = {...d.slots};
      if (!on && !slots[i]) slots[i] = [{id:Date.now(), open:"09:00", close:"18:00"}];
      return {...d, days, slots};
    });
  }
  function addSlot(di)        { setData(d => ({...d, slots:{...d.slots,[di]:[...(d.slots[di]||[]),{id:Date.now(),open:"09:00",close:"18:00"}]}})); }
  function rmSlot(di,id)      { setData(d => ({...d, slots:{...d.slots,[di]:(d.slots[di]||[]).filter(s=>s.id!==id)}})); }
  function updSlot(di,id,k,v) { setData(d => ({...d, slots:{...d.slots,[di]:(d.slots[di]||[]).map(s=>s.id===id?{...s,[k]:v}:s)}})); }

  return (
    <div>
      <div className="period-box">
        <div className="period-label">📅 Período de funcionamento</div>
        <div className="field-row">
          <div className="field" style={{margin:0}}>
            <label>Data de início</label>
            <input type="date" value={data.date_start||""}
              onChange={e => setData(d => ({...d, date_start:e.target.value}))}/>
            <div className="field-hint">Vazio = iniciar imediatamente.</div>
          </div>
          <div className="field" style={{margin:0}}>
            <label>Data de encerramento</label>
            <input type="date" value={data.date_end||""}
              onChange={e => setData(d => ({...d, date_end:e.target.value}))}/>
            <div className="field-hint">Vazio = sem prazo.</div>
          </div>
        </div>
      </div>

      <div className="sched-label">Dias e horários de atendimento</div>
      <div className="days-grid">
        {DAYS.map((d,i) => (
          <button key={d} className={"day-btn" + (data.days.includes(i) ? " active" : "")}
            onClick={() => toggleDay(i)}>{d}</button>
        ))}
      </div>

      {data.days.map(di => (
        <div key={di} className="day-slots">
          <div className="day-slots-title">{DAYS[di]}</div>
          {(data.slots[di]||[]).map(slot => (
            <div key={slot.id} className="slot-row">
              <input type="time" value={slot.open}  onChange={e => updSlot(di,slot.id,"open",e.target.value)}/>
              <span>→</span>
              <input type="time" value={slot.close} onChange={e => updSlot(di,slot.id,"close",e.target.value)}/>
              {(data.slots[di]||[]).length > 1 && (
                <button className="x-sm" onClick={() => rmSlot(di,slot.id)}>✕</button>
              )}
            </div>
          ))}
          <button className="add-slot" onClick={() => addSlot(di)}>+ Turno</button>
        </div>
      ))}

      <div className="field" style={{marginTop:16}}>
        <label>Intervalo entre agendamentos (minutos)</label>
        <input type="number" min="5" max="120" step="5" placeholder="Ex: 30"
          value={data.interval||"30"} onChange={e => setData(d => ({...d, interval:e.target.value}))}/>
        <div className="field-hint">Tempo mínimo entre um atendimento e o próximo.</div>
      </div>
      <div className="field">
        <label>Telefone para escalada (atendimento humano)</label>
        <input type="text" placeholder="(11) 99999-9999" value={data.escalada||""}
          onChange={e => setData(d => ({...d, escalada:e.target.value}))}/>
      </div>
    </div>
  );
}

function WizardPayment({planId}) {
  const [num,  setNum]  = useState("");
  const [name, setName] = useState("");
  const [exp,  setExp]  = useState("");
  const [cvv,  setCvv]  = useState("");
  const [show, setShow] = useState(false);
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  const last4 = num.replace(/\s/g,"").slice(-4) || "••••";

  return (
    <div>
      <div className="trial-box">
        <div className="trial-title">🎁 14 dias grátis — sem cobrar agora</div>
        <div className="trial-txt">Após o teste, você será cobrado <strong>R$ {plan.price}/mês</strong>. Cancele antes e não pagará nada.</div>
      </div>
      <div className="card-preview">
        <div className="card-chip"/>
        <div className="card-num">{num || "•••• •••• •••• ••••"}</div>
        <div className="card-foot">
          <div><div className="card-lbl">TITULAR</div>{name.toUpperCase() || "SEU NOME"}</div>
          <div><div className="card-lbl">VALIDADE</div>{exp || "MM/AA"}</div>
          <div><div className="card-lbl">FINAL</div>{last4}</div>
        </div>
      </div>
      <div className="field">
        <label>Número do cartão</label>
        <input type="text" placeholder="0000 0000 0000 0000" value={num} maxLength={19}
          inputMode="numeric" onChange={e => setNum(maskCard(e.target.value))}/>
      </div>
      <div className="field">
        <label>Nome no cartão</label>
        <input type="text" placeholder="Como aparece no cartão" value={name}
          onChange={e => setName(e.target.value.toUpperCase())}/>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Validade</label>
          <input type="text" placeholder="MM/AA" value={exp} maxLength={5}
            inputMode="numeric" onChange={e => setExp(maskExpiry(e.target.value))}/>
        </div>
        <div className="field">
          <label>CVV</label>
          <div className="input-wrap">
            <input type={show ? "text" : "password"} placeholder="•••" value={cvv} maxLength={4}
              inputMode="numeric" onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}/>
            <button type="button" className="eye-btn" onClick={() => setShow(s=>!s)}>{show?"🙈":"👁"}</button>
          </div>
        </div>
      </div>
      <div className="pci-row">
        <span className="pci-badge">🔒 SSL 256-bit</span>
        <span className="pci-badge">✅ PCI DSS</span>
        <span className="pci-badge">🛡 Tokenizado</span>
      </div>
    </div>
  );
}

function WizardAccount({email, onGoogle, googleOk}) {
  const [pass,  setPass]  = useState("");
  const [conf,  setConf]  = useState("");
  const [show,  setShow]  = useState(false);
  const st = pwStrength(pass);
  const noMatch = conf && pass !== conf;

  return (
    <div>
      <div className="info-box">
        <div style={{fontWeight:600, marginBottom:4}}>Crie sua conta para acessar o painel</div>
        <div style={{fontSize:13, color:"var(--muted)"}}>Você gerenciará sua secretária, agenda e clientes por aqui.</div>
      </div>
      <button className="google-btn" onClick={onGoogle}>
        <GoogleIcon/> {googleOk ? "✓ Conta Google conectada" : "Criar conta com Google"}
      </button>
      <div className="divider"><span>ou crie com e-mail e senha</span></div>
      <div className="field">
        <label>E-mail</label>
        <input type="email" value={email||""} disabled style={{opacity:.6}}/>
        <div className="field-hint">E-mail informado nos dados da clínica.</div>
      </div>
      <div className="field">
        <label>Senha *</label>
        <div className="input-wrap">
          <input type={show ? "text" : "password"} placeholder="Mínimo 8 caracteres"
            value={pass} onChange={e => setPass(e.target.value)}/>
          <button type="button" className="eye-btn" onClick={() => setShow(s=>!s)}>{show?"🙈":"👁"}</button>
        </div>
        {pass && (
          <>
            <div className="strength-bar" style={{width:`${(st.score/5)*100}%`, background:st.color}}/>
            <div className="strength-lbl" style={{color:st.color}}>{st.label}</div>
          </>
        )}
      </div>
      <div className="field">
        <label>Confirmar senha *</label>
        <input type="password" placeholder="Repita a senha" value={conf}
          className={noMatch ? "error" : ""}
          onChange={e => setConf(e.target.value)}/>
        {noMatch && <div className="field-err">As senhas não coincidem.</div>}
      </div>
      <div className="sec-badge">🔒 Senhas armazenadas com bcrypt — nunca em texto puro.</div>
    </div>
  );
}

function WizardSuccess({clinicName, asstName, planId}) {
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  return (
    <div style={{textAlign:"center", padding:"8px 0"}}>
      <div className="success-ico">🎉</div>
      <h2 className="success-title">Conta criada!</h2>
      <p className="success-sub"><strong>{clinicName||"Sua clínica"}</strong> está configurada.<br/>Sua secretária <strong>{asstName||"Luna"}</strong> entra em ação em até 24h.</p>
      <div className="plan-confirm">
        <div className="plan-confirm-lbl">Plano contratado</div>
        <div className="plan-confirm-row">
          <span className="plan-confirm-name">{plan.label}</span>
          <span className="plan-confirm-price">R$ {plan.price}<span>/mês após 14 dias</span></span>
        </div>
      </div>
      <div className="next-steps">
        <div className="next-steps-title">Próximos passos</div>
        {["Verifique seu e-mail de confirmação","Configuração técnica em até 24h","Aprovação da assistente antes de ir ao ar","Acesse o painel para ver agenda e leads"].map((s,i) => (
          <div key={i} className="next-item"><div className="next-num">{i+1}</div><span>{s}</span></div>
        ))}
      </div>
    </div>
  );
}

function Wizard({defaultPlan, onClose, onComplete}) {
  const STEPS = 8;
  const [step, setStep]         = useState(1);
  const [planD, setPlanD]       = useState({plan: defaultPlan || "profissional"});
  const [clinicD, setClinicD]   = useState({nome:"", wpp:"", cidade:"", resp:"", email:""});
  const [asstD, setAsstD]       = useState({nome:"Luna", emoji:"💆‍♀️", tom:"amigavel", welcome:"", clinicNome:""});
  const [svcD, setSvcD]         = useState({services:[...DEFAULT_SERVICES], packages:[], tab:"avulso"});
  const [schedD, setSchedD]     = useState({
    days:[1,2,3,4,5],
    slots:{1:[{id:1,open:"09:00",close:"18:00"}],2:[{id:2,open:"09:00",close:"18:00"}],3:[{id:3,open:"09:00",close:"18:00"}],4:[{id:4,open:"09:00",close:"18:00"}],5:[{id:5,open:"09:00",close:"18:00"}]},
    date_start:"", date_end:"", interval:"30", escalada:""
  });
  const [googleOk, setGoogleOk] = useState(false);
  const [errs, setErrs]         = useState({});

  useEffect(() => { setAsstD(d => ({...d, clinicNome:clinicD.nome})); }, [clinicD.nome]);

  function validate() {
    const e = {};
    if (step === 2) {
      if (!clinicD.nome)  e.nome  = true;
      if (!clinicD.wpp)   e.wpp   = true;
      if (!clinicD.resp)  e.resp  = true;
      if (!clinicD.email || !clinicD.email.includes("@")) e.email = true;
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function next() { if (validate()) setStep(s => Math.min(s+1, STEPS)); }
  function back() { setStep(s => Math.max(s-1, 1)); }

  const LABELS = ["Plano","Clínica","Assistente","Serviços","Agenda","Pagamento","Conta","Pronto!"];
  const TITLES = [
    "Escolha seu plano", "Dados da clínica", "Personalize a assistente",
    "Seus serviços", "Horários de atendimento", "Método de pagamento",
    "Crie sua conta", "Configuração concluída"
  ];
  const SUBS = [
    "Mude a qualquer momento, sem multa.",
    "Informações para sua assistente usar.",
    "Nome, personalidade e tom de voz.",
    "A IA informa preços automaticamente.",
    "Quando sua clínica recebe agendamentos?",
    "14 dias grátis. Sem cobrar agora.",
    "Acesso seguro ao painel.",
    ""
  ];

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wizard">
        <div className="wiz-head">
          <div className="logo-sm">Luna<span>.</span></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="wiz-bar">
          {Array.from({length:STEPS}).map((_,i) => (
            <div key={i} className={"wiz-dot" + (i+1<step?" done":i+1===step?" active":"")}/>
          ))}
        </div>
        <div className="wiz-body">
          <div className="wiz-lbl">Passo {step} de {STEPS} — {LABELS[step-1]}</div>
          <h2 className="wiz-title">{TITLES[step-1]}</h2>
          {SUBS[step-1] && <p className="wiz-sub">{SUBS[step-1]}</p>}

          {step===1 && <WizardPlan      data={planD}    setData={setPlanD}/>}
          {step===2 && <WizardClinic    data={clinicD}  setData={setClinicD} errs={errs}/>}
          {step===3 && <WizardAssistant data={asstD}    setData={setAsstD}/>}
          {step===4 && <WizardServices  data={svcD}     setData={setSvcD}/>}
          {step===5 && <WizardSchedule  data={schedD}   setData={setSchedD}/>}
          {step===6 && <WizardPayment   planId={planD.plan}/>}
          {step===7 && <WizardAccount   email={clinicD.email} onGoogle={() => setGoogleOk(true)} googleOk={googleOk}/>}
          {step===8 && <WizardSuccess   clinicName={clinicD.nome} asstName={asstD.nome} planId={planD.plan}/>}

          {step < STEPS && (
            <div className="wiz-foot">
              {step > 1 ? <button className="btn-back" onClick={back}>← Voltar</button> : <div/>}
              <button className={"btn-next" + (step >= 6 ? " primary" : "")} onClick={next}>
                {step === 7 ? "✦ Finalizar e Ativar" : "Continuar →"}
              </button>
            </div>
          )}
          {step === STEPS && (
            <div className="wiz-foot" style={{justifyContent:"center"}}>
              <button className="btn-next primary" style={{padding:"14px 48px"}}
                onClick={() => { onComplete && onComplete(); onClose(); }}>
                Acessar Painel ✦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────
function CancelModal({ag, onConfirm, onClose}) {
  const [motivo,    setMotivo]    = useState("");
  const [reagendar, setReagendar] = useState(false);
  const [novaData,  setNovaData]  = useState("");
  const [novaHora,  setNovaHora]  = useState("");

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div style={{fontWeight:600, fontSize:16}}>{reagendar ? "Reagendar" : "Cancelar"} Atendimento</div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="ag-info">
            <strong>{ag.cliente}</strong> — {ag.servico}<br/>
            <span className="ag-dt">{ag.data} às {ag.hora}</span>
          </div>
          <div className="toggle-row">
            <button className={"toggle-btn danger" + (!reagendar ? " sel" : "")} onClick={() => setReagendar(false)}>✕ Cancelar</button>
            <button className={"toggle-btn" + (reagendar ? " sel" : "")} onClick={() => setReagendar(true)}>📅 Reagendar</button>
          </div>
          {reagendar && (
            <div className="field-row">
              <div className="field"><label>Nova data</label><input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}/></div>
              <div className="field"><label>Novo horário</label><input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)}/></div>
            </div>
          )}
          <div className="field">
            <label>Motivo *</label>
            <textarea placeholder="Ex: Compromisso imprevisto..." value={motivo} onChange={e => setMotivo(e.target.value)}/>
            <div className="field-hint">O cliente será notificado pelo WhatsApp.</div>
          </div>
          <button className="btn-next primary" style={{width:"100%", padding:"12px"}}
            disabled={!motivo}
            onClick={() => motivo && onConfirm({reagendar, motivo, novaData, novaHora})}>
            {reagendar ? "Confirmar Reagendamento" : "Confirmar Cancelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SecretariaPage() {
  const [editSec,  setEditSec]  = useState(false);
  const [editSvc,  setEditSvc]  = useState(false);
  const [saved,    setSaved]    = useState("");
  const [nome,     setNome]     = useState("Luna");
  const [emoji,    setEmoji]    = useState("💆‍♀️");
  const [tom,      setTom]      = useState("amigavel");
  const [welcome,  setWelcome]  = useState("");
  const [services, setServices] = useState([...DEFAULT_SERVICES]);

  function addSvc()       { setServices(s => [...s, {id:Date.now(), name:"", price:"", duration:"60"}]); }
  function rmSvc(id)      { setServices(s => s.filter(x => x.id !== id)); }
  function updSvc(id,k,v) { setServices(s => s.map(x => x.id===id ? {...x,[k]:v} : x)); }

  function save(lbl) {
    setSaved(lbl);
    setEditSec(false);
    setEditSvc(false);
    setTimeout(() => setSaved(""), 3000);
  }

  const prev = `Olá! ${emoji} Bem-vinda à Clínica Bella. Sou ${nome}. Posso agendar, tirar dúvidas ou te conectar com nossa atendente. 😊`;
  const tomMap = {amigavel:"Amigável 😊", profissional:"Profissional 💼", carinhoso:"Carinhoso 💕", objetivo:"Objetivo ⚡"};

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">Minha Secretária</h1>
          <p className="dash-sub">Configuração ativa da sua assistente virtual.</p>
        </div>
        {saved && <div className="saved-badge">✓ {saved} salvo!</div>}
      </div>

      <div className="dash-section">
        <div className="dash-sec-head">
          <span className="dash-sec-title">Preview da assistente</span>
          <button className="edit-btn" onClick={() => { setEditSec(e=>!e); setEditSvc(false); }}>
            {editSec ? "✕ Fechar" : "✏️ Editar"}
          </button>
        </div>
        <div className="asst-preview">
          <div className="asst-head">
            <div className="asst-avatar">{emoji}</div>
            <div>
              <div className="asst-name">{nome}</div>
              <div className="asst-status"><span className="dot-green"/>Ativa e respondendo</div>
            </div>
          </div>
          <div className="asst-bubble">{prev}</div>
        </div>
        {editSec && (
          <div className="edit-panel">
            <div className="field-row">
              <div className="field"><label>Nome</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)}/></div>
              <div className="field"><label>Emoji</label><input type="text" value={emoji} onChange={e=>setEmoji(e.target.value)}/></div>
            </div>
            <div className="field">
              <label>Tom</label>
              <select value={tom} onChange={e=>setTom(e.target.value)}>
                <option value="amigavel">Amigável e descontraído 😊</option>
                <option value="profissional">Profissional e elegante 💼</option>
                <option value="carinhoso">Carinhoso e próximo 💕</option>
                <option value="objetivo">Direto e objetivo ⚡</option>
              </select>
            </div>
            <div className="field">
              <label>Mensagem de boas-vindas</label>
              <textarea value={welcome} onChange={e=>setWelcome(e.target.value)} placeholder="Deixe em branco para usar a padrão..."/>
            </div>
            <div className="btn-row">
              <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>save("Assistente")}>Salvar</button>
              <button className="btn-back" onClick={()=>setEditSec(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-sec-head">
          <span className="dash-sec-title">Serviços cadastrados</span>
          <button className="edit-btn" onClick={() => { setEditSvc(e=>!e); setEditSec(false); }}>
            {editSvc ? "✕ Fechar" : "✏️ Editar"}
          </button>
        </div>
        {!editSvc ? (
          <>
            <div className="svc-view-head">
              <span>Tipo de Serviço</span><span>Valor</span><span>Duração</span>
            </div>
            {services.map(s => (
              <div key={s.id} className="svc-view-row">
                <span>{s.name||"—"}</span>
                <span>R$ {s.price||"0"}</span>
                <span>{s.duration||"60"} min</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="svc-head"><span>Tipo de Serviço</span><span>Valor (R$)</span><span>Duração</span><span/></div>
            {services.map(s => (
              <div key={s.id} className="svc-row">
                <input type="text" placeholder="Nome" value={s.name} onChange={e=>updSvc(s.id,"name",e.target.value)}/>
                <div className="num-cell"><span>R$</span><input type="number" value={s.price} onChange={e=>updSvc(s.id,"price",e.target.value)}/></div>
                <div className="num-cell"><input type="number" value={s.duration} onChange={e=>updSvc(s.id,"duration",e.target.value)}/><span>min</span></div>
                <button className="x-sm" onClick={()=>rmSvc(s.id)}>✕</button>
              </div>
            ))}
            <button className="add-btn" onClick={addSvc}>+ Adicionar serviço</button>
            <div className="btn-row" style={{marginTop:16}}>
              <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>save("Serviços")}>Salvar</button>
              <button className="btn-back" onClick={()=>setEditSvc(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-sec-title" style={{marginBottom:12}}>Resumo da configuração</div>
        {[["Plano","Profissional — R$ 197/mês"],["Tom",tomMap[tom]],["Horário","Seg–Sex | 09:00–18:00"],["WhatsApp","(11) 99999-0000"],["Falar com humano","Sempre disponível"]].map(([l,v]) => (
          <div key={l} className="cfg-row"><span className="cfg-lbl">{l}</span><span className="cfg-val">{v}</span></div>
        ))}
      </div>
    </>
  );
}

function ConfigPage() {
  const [editing, setEditing] = useState(null);
  const [saved,   setSaved]   = useState("");

  const [cNome,  setCNome]  = useState("Clínica Bella Estética");
  const [cWpp,   setCWpp]   = useState("(11) 99999-0000");
  const [cCid,   setCCid]   = useState("São Paulo, SP");
  const [cEmail, setCEmail] = useState("bella@clinica.com.br");

  const [aNome, setANome] = useState("Luna");
  const [aTom,  setATom]  = useState("amigavel");

  const [sAtual, setSAtual] = useState("");
  const [sNova,  setSNova]  = useState("");
  const [sConf,  setSConf]  = useState("");
  const [sShow,  setSShow]  = useState(false);
  const stSenha = pwStrength(sNova);

  function save(lbl) { setSaved(lbl); setEditing(null); setTimeout(()=>setSaved(""),3000); }
  function toggle(k) { setEditing(e => e===k ? null : k); }

  const tomLabels = {amigavel:"Amigável 😊", profissional:"Profissional 💼", carinhoso:"Carinhoso 💕", objetivo:"Objetivo ⚡"};

  return (
    <>
      <div className="dash-topbar">
        <div><h1 className="dash-title">Configurações</h1><p className="dash-sub">Gerencie dados da conta e secretária.</p></div>
        {saved && <div className="saved-badge">✓ {saved} salvo!</div>}
      </div>

      {/* Dados da clínica */}
      <div className="dash-section" style={{marginBottom:16}}>
        <div className="dash-sec-head">
          <span className="dash-sec-title">Dados da clínica</span>
          <button className="edit-btn" onClick={()=>toggle("clinica")}>{editing==="clinica"?"✕ Fechar":"✏️ Editar"}</button>
        </div>
        {editing !== "clinica" ? (
          <>{[["Nome",cNome],["WhatsApp",cWpp],["Cidade",cCid],["E-mail",cEmail]].map(([l,v])=>(
            <div key={l} className="cfg-row"><span className="cfg-lbl">{l}</span><span className="cfg-val">{v}</span></div>
          ))}</>
        ) : (
          <>
            <div className="field"><label>Nome da clínica</label><input type="text" value={cNome} onChange={e=>setCNome(e.target.value)}/></div>
            <div className="field-row">
              <div className="field"><label>WhatsApp</label><input type="text" value={cWpp} onChange={e=>setCWpp(e.target.value)}/></div>
              <div className="field"><label>Cidade</label><input type="text" value={cCid} onChange={e=>setCCid(e.target.value)}/></div>
            </div>
            <div className="field"><label>E-mail</label><input type="email" value={cEmail} onChange={e=>setCEmail(e.target.value)}/></div>
            <div className="btn-row">
              <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>save("Dados da clínica")}>Salvar</button>
              <button className="btn-back" onClick={()=>setEditing(null)}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      {/* Assistente */}
      <div className="dash-section" style={{marginBottom:16}}>
        <div className="dash-sec-head">
          <span className="dash-sec-title">Assistente virtual</span>
          <button className="edit-btn" onClick={()=>toggle("asst")}>{editing==="asst"?"✕ Fechar":"✏️ Editar"}</button>
        </div>
        {editing !== "asst" ? (
          <>{[["Nome",aNome],["Tom",tomLabels[aTom]],["Falar com humano","Sempre disponível"]].map(([l,v])=>(
            <div key={l} className="cfg-row"><span className="cfg-lbl">{l}</span><span className="cfg-val">{v}</span></div>
          ))}</>
        ) : (
          <>
            <div className="field"><label>Nome</label><input type="text" value={aNome} onChange={e=>setANome(e.target.value)}/></div>
            <div className="field">
              <label>Tom de atendimento</label>
              <select value={aTom} onChange={e=>setATom(e.target.value)}>
                <option value="amigavel">Amigável e descontraído 😊</option>
                <option value="profissional">Profissional e elegante 💼</option>
                <option value="carinhoso">Carinhoso e próximo 💕</option>
                <option value="objetivo">Direto e objetivo ⚡</option>
              </select>
            </div>
            <div className="btn-row">
              <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>save("Assistente")}>Salvar</button>
              <button className="btn-back" onClick={()=>setEditing(null)}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      {/* Senha */}
      <div className="dash-section" style={{marginBottom:16}}>
        <div className="dash-sec-head">
          <span className="dash-sec-title">Segurança — Alterar senha</span>
          <button className="edit-btn" onClick={()=>toggle("senha")}>{editing==="senha"?"✕ Fechar":"✏️ Alterar"}</button>
        </div>
        {editing !== "senha" ? (
          <div className="cfg-row"><span className="cfg-lbl">Senha</span><span className="cfg-val">••••••••</span></div>
        ) : (
          <>
            <div className="field">
              <label>Senha atual</label>
              <div className="input-wrap">
                <input type={sShow?"text":"password"} value={sAtual} onChange={e=>setSAtual(e.target.value)} placeholder="••••••••"/>
                <button type="button" className="eye-btn" onClick={()=>setSShow(s=>!s)}>{sShow?"🙈":"👁"}</button>
              </div>
            </div>
            <div className="field">
              <label>Nova senha</label>
              <input type="password" value={sNova} onChange={e=>setSNova(e.target.value)} placeholder="Mínimo 8 caracteres"/>
              {sNova && (
                <>
                  <div className="strength-bar" style={{width:`${(stSenha.score/5)*100}%`, background:stSenha.color}}/>
                  <div className="strength-lbl" style={{color:stSenha.color}}>{stSenha.label}</div>
                </>
              )}
            </div>
            <div className="field">
              <label>Confirmar nova senha</label>
              <input type="password" value={sConf} className={sConf&&sNova!==sConf?"error":""}
                onChange={e=>setSConf(e.target.value)} placeholder="Repita a senha"/>
              {sConf && sNova !== sConf && <div className="field-err">As senhas não coincidem.</div>}
            </div>
            <div className="sec-badge">🔒 Armazenada com bcrypt — nunca em texto puro.</div>
            <div className="btn-row" style={{marginTop:14}}>
              <button className="btn-next primary" style={{padding:"10px 28px"}}
                disabled={!sAtual || !sNova || sNova!==sConf || stSenha.score < 2}
                onClick={()=>{setSAtual("");setSNova("");setSConf("");save("Senha");}}>
                Salvar senha
              </button>
              <button className="btn-back" onClick={()=>setEditing(null)}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      {/* Plano */}
      <div className="dash-section" style={{marginBottom:16}}>
        <div className="dash-sec-head">
          <span className="dash-sec-title">Plano e cobrança</span>
          <button className="edit-btn" onClick={()=>toggle("plano")}>{editing==="plano"?"✕ Fechar":"✏️ Editar cartão"}</button>
        </div>
        {[["Plano atual","Profissional — R$ 197/mês"],["Próxima cobrança","06/07/2026"],["Cartão","•••• •••• •••• 4242"]].map(([l,v])=>(
          <div key={l} className="cfg-row"><span className="cfg-lbl">{l}</span><span className="cfg-val">{v}</span></div>
        ))}
        {editing === "plano" && (
          <div className="edit-panel">
            <div className="field"><label>Novo número do cartão</label><input type="text" placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric"/></div>
            <div className="field-row">
              <div className="field"><label>Validade</label><input type="text" placeholder="MM/AA" maxLength={5} inputMode="numeric"/></div>
              <div className="field"><label>CVV</label><input type="password" placeholder="•••" maxLength={4} inputMode="numeric"/></div>
            </div>
            <div className="pci-row" style={{marginBottom:14}}>
              <span className="pci-badge">🔒 SSL 256-bit</span>
              <span className="pci-badge">✅ PCI DSS</span>
              <span className="pci-badge">🛡 Tokenizado</span>
            </div>
            <div className="btn-row">
              <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>save("Cartão")}>Salvar cartão</button>
              <button className="btn-back" onClick={()=>setEditing(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Zona de risco */}
      <div className="dash-section danger-zone">
        <div className="dash-sec-title" style={{color:"var(--red)", marginBottom:8}}>Zona de risco</div>
        <p style={{fontSize:14, color:"var(--muted)", marginBottom:14}}>
          Cancelar o plano encerrará os serviços ao fim do período pago.
        </p>
        <button className="danger-btn"
          onClick={() => { if(window.confirm("Tem certeza que deseja cancelar o plano?")) window.alert("Plano cancelado. Acesso até 06/07/2026."); }}>
          Cancelar plano
        </button>
      </div>
    </>
  );
}

function Dashboard({user, onLogout}) {
  const [page,         setPage]         = useState("inicio");
  const [agenda,       setAgenda]       = useState([...MOCK_AGENDA]);
  const [cancelModal,  setCancelModal]  = useState(null);
  const [editSched,    setEditSched]    = useState(false);
  const [conflict,     setConflict]     = useState(false);
  const [schedD,       setSchedD]       = useState({
    days:[1,2,3,4,5],
    slots:{1:[{id:1,open:"09:00",close:"18:00"}],2:[{id:2,open:"09:00",close:"18:00"}],3:[{id:3,open:"09:00",close:"18:00"}],4:[{id:4,open:"09:00",close:"18:00"}],5:[{id:5,open:"09:00",close:"18:00"}]},
    date_start:"", date_end:"", interval:"30", escalada:""
  });

  const conf  = agenda.filter(a => a.status === "confirmado").length;
  const pend  = agenda.filter(a => a.status === "pendente").length;
  const canc  = agenda.filter(a => a.status === "cancelado").length;

  function handleCancel(ag, r) {
    setAgenda(prev => prev.map(a => {
      if (a.id !== ag.id) return a;
      if (r.reagendar) return {...a, data:r.novaData||a.data, hora:r.novaHora||a.hora, status:"pendente", motivo:r.motivo};
      return {...a, status:"cancelado", motivo:r.motivo};
    }));
    setCancelModal(null);
  }

  const NAV = [
    {id:"inicio",     icon:"🏠", label:"Início"},
    {id:"secretaria", icon:"🤖", label:"Minha Secretária"},
    {id:"agenda",     icon:"📅", label:"Agenda"},
    {id:"leads",      icon:"💬", label:"Leads"},
    {id:"config",     icon:"⚙️", label:"Configurações"},
  ];

  return (
    <div className="dash-layout">
      <div className="dash-sidebar">
        <div className="logo" style={{padding:"0 24px 24px"}}>Luna<span>.</span></div>
        <div className="dash-nav">
          {NAV.map(n => (
            <button key={n.id} className={"dash-nav-item" + (page===n.id ? " active" : "")} onClick={() => setPage(n.id)}>
              <span style={{fontSize:17}}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div className="dash-user">
          <div className="dash-avatar">{user?.nome?.[0]||"U"}</div>
          <div>
            <div className="dash-user-name">{user?.nome||"Usuária"}</div>
            <div className="dash-user-plan">Plano Profissional</div>
          </div>
        </div>
      </div>

      <div className="dash-main">

        {page === "inicio" && (
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Bom dia! 👋</h1><p className="dash-sub">Resumo da sua secretária hoje.</p></div>
              <button className="logout-btn" onClick={onLogout}>Sair</button>
            </div>
            <div className="dash-cards">
              <div className="dash-card hi"><div>📅</div><div className="card-val">{conf}</div><div className="card-lbl2">Confirmados</div></div>
              <div className="dash-card"><div>⏳</div><div className="card-val">{pend}</div><div className="card-lbl2">Pendentes</div></div>
              <div className="dash-card"><div>💬</div><div className="card-val">{MOCK_LEADS.length}</div><div className="card-lbl2">Leads</div></div>
              <div className="dash-card"><div>❌</div><div className="card-val">{canc}</div><div className="card-lbl2">Cancelamentos</div></div>
            </div>
            <div className="dash-section">
              <div className="dash-sec-head">
                <span className="dash-sec-title">Próximos agendamentos</span>
                <button className="action-btn" onClick={() => setPage("agenda")}>Ver todos</button>
              </div>
              <table className="dash-table">
                <thead><tr><th>Cliente</th><th>Serviço</th><th>Data/Hora</th><th>Status</th></tr></thead>
                <tbody>
                  {agenda.filter(a => a.status !== "cancelado").slice(0,3).map(a => (
                    <tr key={a.id}>
                      <td style={{fontWeight:500}}>{a.cliente}</td>
                      <td>{a.servico}</td>
                      <td>{a.data} {a.hora}</td>
                      <td><span className={"badge " + a.status}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {page === "secretaria" && <SecretariaPage/>}

        {page === "agenda" && (
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Agenda</h1><p className="dash-sub">Gerencie todos os agendamentos.</p></div>
              <button className="edit-btn" onClick={() => { setEditSched(e=>!e); setConflict(true); }}>
                {editSched ? "✕ Fechar" : "⚙️ Editar Horários"}
              </button>
            </div>
            {editSched && (
              <div className="dash-section" style={{marginBottom:16}}>
                {conflict && (
                  <div className="conflict-alert">
                    <strong>⚠️ Conflito detectado!</strong> 2 agendamentos existentes estão fora do novo horário proposto (Ana Souza — 06/06 09:00, Juliana Matos — 06/06 10:30). Você precisará reagendá-los antes de salvar.
                  </div>
                )}
                <WizardSchedule data={schedD} setData={setSchedD}/>
                <div className="btn-row" style={{marginTop:16}}>
                  <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={() => { setEditSched(false); setConflict(false); }}>Salvar horários</button>
                  <button className="btn-back" onClick={() => { setEditSched(false); setConflict(false); }}>Cancelar</button>
                </div>
              </div>
            )}
            {["confirmado","pendente","cancelado"].map(status => {
              const items = agenda.filter(a => a.status === status);
              if (!items.length) return null;
              const labels = {confirmado:"Confirmados", pendente:"Pendentes", cancelado:"Cancelados"};
              return (
                <div key={status} className="dash-section" style={{marginBottom:16}}>
                  <div className="dash-sec-head">
                    <span className="dash-sec-title">{labels[status]} ({items.length})</span>
                  </div>
                  <table className="dash-table">
                    <thead><tr><th>Cliente</th><th>Serviço</th><th>Data/Hora</th><th>Motivo</th><th>Ações</th></tr></thead>
                    <tbody>
                      {items.map(a => (
                        <tr key={a.id}>
                          <td style={{fontWeight:500}}>{a.cliente}</td>
                          <td>{a.servico}</td>
                          <td>{a.data} {a.hora}</td>
                          <td style={{fontSize:13,color:"var(--muted)"}}>{a.motivo||"—"}</td>
                          <td>
                            {status !== "cancelado" && (
                              <button className="action-btn" onClick={() => setCancelModal(a)}>Cancelar/Reagendar</button>
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

        {page === "leads" && (
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Leads</h1><p className="dash-sub">Contatos que não agendaram.</p></div>
            </div>
            <div className="dash-section">
              <div className="dash-sec-head">
                <span className="dash-sec-title">Em aberto ({MOCK_LEADS.length})</span>
              </div>
              {MOCK_LEADS.map(l => (
                <div key={l.id} className="lead-row">
                  <div className="lead-avatar">👤</div>
                  <div className="lead-info">
                    <div className="lead-name">{l.nome}</div>
                    <div className="lead-det">Interesse: {l.interesse} · {l.msg} · {l.data}</div>
                  </div>
                  <span className={"lead-tag " + l.tag}>{l.tag === "interessado" ? "Interessado" : "Sem resposta"}</span>
                  <button className="action-btn" style={{marginLeft:8}}>Retomar</button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "config" && <ConfigPage/>}

      </div>

      {cancelModal && (
        <CancelModal ag={cancelModal} onConfirm={r => handleCancel(cancelModal, r)} onClose={() => setCancelModal(null)}/>
      )}
    </div>
  );
}

// ─── LANDING ──────────────────────────────────
function PlanCard({plan, onSelect}) {
  return (
    <div className={"plan-card " + plan.slug}>
      {plan.popular && <div className="plan-popular">⭐ Mais escolhido</div>}
      <div className="plan-badge">{plan.badge}</div>
      <div className="plan-name">{plan.label}</div>
      <div className="plan-price"><span>R$</span>{plan.price}</div>
      <div className="plan-period">por mês · cancele quando quiser</div>
      <div className="plan-desc">{plan.desc}</div>
      <ul className="plan-features">
        {plan.features.map((f,i) => <li key={i} className={f.on?"":"off"}>{f.t}</li>)}
      </ul>
      <button className="plan-btn" onClick={() => onSelect(plan.id)}>Começar agora →</button>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {FAQS.map((f,i) => (
        <div key={i} className="faq-item">
          <button className={"faq-q" + (open===i?" open":"")} onClick={() => setOpen(open===i?null:i)}>
            {f.q}<span className="arrow">+</span>
          </button>
          <div className={"faq-a" + (open===i?" open":"")}>{f.a}</div>
        </div>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────
export default function App() {
  const [wizard,    setWizard]    = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [user,      setUser]      = useState(null);

  function handleLogin(u) { setUser(u); setAuthModal(null); }

  if (user) return <Dashboard user={user} onLogout={() => setUser(null)}/>;

  return (
    <>
      <section className="hero">
        <nav className="hero-nav">
          <div className="logo">Luna<span>.</span></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button className="nav-ghost" onClick={() => setAuthModal("login")}>Entrar</button>
            <button className="nav-cta"   onClick={() => setAuthModal("login")}>Primeiro acesso</button>
          </div>
        </nav>
        <div className="hero-body">
          <div className="hero-text">
            <div className="hero-badge">Secretária de IA para estética</div>
            <h1 className="hero-title">Sua clínica<br/><em>atendendo 24h</em><br/>sem você</h1>
            <p className="hero-sub">A assistente virtual que agenda, lembra e nunca deixa uma cliente sem resposta.</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <button className="btn-primary" onClick={() => setWizard("profissional")}>Configurar minha secretária</button>
              <button className="btn-ghost"   onClick={() => document.getElementById("planos")?.scrollIntoView({behavior:"smooth"})}>Ver planos</button>
            </div>
          </div>
          <ChatDemo/>
        </div>
      </section>

      <div className="stats-bar">
        {[["24h","Atendimento"],["14 dias","Teste grátis"],["97%","Satisfação"],["R$ 0","Por mensagem"]].map(([n,l]) => (
          <div key={l} className="stat"><div className="stat-num">{n}</div><div className="stat-lbl">{l}</div></div>
        ))}
      </div>

      <div className="section">
        <div className="section-tag">Como funciona</div>
        <h2 className="section-title">Em 3 passos,<br/>sua clínica transformada</h2>
        <div className="steps">
          {[["💳","1. Escolha o plano","Selecione e configure em menos de 10 minutos.",1],
            ["⚙️","2. Personalize","Nome, tom, serviços e horários.",2],
            ["✨","3. Ative","Em até 24h sua secretária está respondendo.",3]].map(([ic,t,d,n]) => (
            <div key={n} className="step" data-n={n}>
              <div className="step-icon">{ic}</div><h3>{t}</h3><p>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"var(--light)",padding:"96px 0"}} id="planos">
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Planos</div>
          <h2 className="section-title">Simples e transparente</h2>
          <p style={{fontSize:17,color:"var(--muted)",fontWeight:300,marginBottom:0}}>14 dias grátis. Sem contrato. Cancele quando quiser.</p>
          <div className="plans-grid">
            {PLANS.map(p => <PlanCard key={p.id} plan={p} onSelect={id => setWizard(id)}/>)}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-tag">Depoimentos</div>
        <h2 className="section-title">Clínicas que já transformaram o atendimento</h2>
        <div className="testimonials-grid">
          {[{t:"Antes eu perdia horário toda semana. Agora a Luna agenda sozinha.",n:"Fernanda Costa",r:"Esteticista — São Paulo",i:"F"},
            {t:"Menos de 10 minutos para configurar. No primeiro dia vieram 3 agendamentos novos.",n:"Márcia Oliveira",r:"Bella Skin",i:"M"},
            {t:"O relatório mostrou meu serviço mais agendado. Aumentei o preço e ainda lotou!",n:"Juliana Pires",r:"Dermato Estética — Curitiba",i:"J"}].map((t,i) => (
            <div key={i} className="testimonial">
              <div className="t-stars">★★★★★</div>
              <p className="t-text">"{t.t}"</p>
              <div className="t-author">
                <div className="t-avatar">{t.i}</div>
                <div><div className="t-name">{t.n}</div><div className="t-role">{t.r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"var(--light)",padding:"96px 0"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Dúvidas</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <FAQ/>
        </div>
      </div>

      <div style={{background:"var(--charcoal)",padding:"96px 48px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",color:"#fff",marginBottom:16}}>
            Sua clínica merece uma <em style={{color:"var(--rose)"}}>secretária que nunca dorme</em>
          </h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,.55)",marginBottom:40,fontWeight:300}}>Configure em 10 minutos. 14 dias grátis.</p>
          <button className="btn-primary" style={{fontSize:17,padding:"18px 48px"}} onClick={() => setWizard("profissional")}>
            Começar agora
          </button>
          <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:14}}>Sem cartão para testar · Cancele quando quiser</p>
        </div>
      </div>

      <footer>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#fff",marginBottom:8}}>Luna<span style={{color:"var(--rose)"}}>.</span></div>
        <p>Secretária de IA para clínicas de estética</p>
        <p style={{marginTop:8}}>© 2026 · Todos os direitos reservados</p>
      </footer>

      {wizard    && <Wizard defaultPlan={wizard} onClose={() => setWizard(null)} onComplete={() => setUser({nome:"Usuária",email:""})}/>}
      {authModal === "login"  && <LoginModal  onClose={() => setAuthModal(null)} onLogin={handleLogin} onForgot={() => setAuthModal("forgot")} onFirst={() => { setAuthModal(null); setWizard("profissional"); }}/>}
      {authModal === "forgot" && <ForgotModal onClose={() => setAuthModal(null)} onBack={() => setAuthModal("login")}/>}
    </>
  );
}
