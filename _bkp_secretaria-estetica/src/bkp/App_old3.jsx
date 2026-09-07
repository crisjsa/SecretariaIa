import { useState, useEffect, useRef } from "react";
import "./styles.css";

/* ══════════════════════════════════════════════
   DADOS ESTÁTICOS
══════════════════════════════════════════════ */
const PLANS = [
  { id:"basico",slug:"basic",label:"Básico",price:97,badge:"Starter",desc:"Para começar com o essencial.",
    features:[{text:"Atendimento 24h WhatsApp",on:true},{text:"Agendamento automático",on:true},{text:"Lembrete 24h antes",on:true},{text:"Escalada para humano",on:true},{text:"Lembrete 2h antes",on:false},{text:"Pós-atendimento",on:false},{text:"Relatório mensal",on:false}]},
  { id:"profissional",slug:"pro",label:"Profissional",price:197,badge:"Mais Popular",popular:true,desc:"Profissionalismo e confiabilidade.",
    features:[{text:"Tudo do Básico",on:true},{text:"Verificação de disponibilidade",on:true},{text:"Lembrete 2h antes",on:true},{text:"Pós-atendimento automático",on:true},{text:"Prompt personalizado",on:true},{text:"Suporte WhatsApp",on:true},{text:"Relatório mensal",on:false}]},
  { id:"premium",slug:"premium",label:"Premium",price:347,badge:"Completo",desc:"Gestão completa da clínica.",
    features:[{text:"Tudo do Profissional",on:true},{text:"Relatório mensal automático",on:true},{text:"Campanhas de reativação",on:true},{text:"Até 2 números WhatsApp",on:true},{text:"Onboarding assistido",on:true},{text:"Suporte prioritário",on:true}]},
];
const DAYS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const FAQS=[
  {q:"Preciso de conhecimento técnico para configurar?",a:"Não! Nosso assistente guia você passo a passo em menos de 10 minutos."},
  {q:"Quanto tempo leva para funcionar?",a:"Após a configuração, sua secretária fica ativa em até 24 horas úteis."},
  {q:"O WhatsApp precisa ficar conectado?",a:"Sim, o número precisa ter o WhatsApp ativo. Funciona com seu número atual."},
  {q:"Posso cancelar a qualquer momento?",a:"Sim, sem multa ou fidelidade. Cancele quando quiser pelo painel."},
  {q:"A IA entende mensagens de voz?",a:"Áudios são transcritos automaticamente e respondidos em texto."},
];
const DEFAULT_SERVICES=[{id:1,name:"Limpeza de pele",price:"180",duration:"60"},{id:2,name:"Design de sobrancelha",price:"80",duration:"30"}];

/* ══════════════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════════════ */
function passwordStrength(p){
  if(!p)return{score:0,label:"",color:"transparent"};
  let s=0;
  if(p.length>=8)s++;if(p.length>=12)s++;
  if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;
  const map=[{label:"Muito fraca",color:"#FF3B30"},{label:"Fraca",color:"#FF9500"},{label:"Razoável",color:"#FFCC00"},{label:"Boa",color:"#34C759"},{label:"Forte",color:"#007AFF"},{label:"Excelente",color:"#5856D6"}];
  return{score:s,label:map[Math.min(s,5)].label,color:map[Math.min(s,5)].color};
}
function maskCard(v){return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();}
function maskExpiry(v){let d=v.replace(/\D/g,"").slice(0,4);if(d.length>2)d=d.slice(0,2)+"/"+d.slice(2);return d;}
function maskCVV(v){return v.replace(/\D/g,"").slice(0,4);}

/* ══════════════════════════════════════════════
   CHAT DEMO (hero)
══════════════════════════════════════════════ */
const MORNING_SLOTS=[{id:"0800",label:"08:00"},{id:"1000",label:"10:00"},{id:"1100",label:"11:00"}];
const SCRIPT=[
  {id:0,type:"bot",text:"Olá! 💆‍♀️ Bem-vinda à Clínica Bella. Sou a Luna, sua assistente. Como posso te ajudar hoje?"},
  {id:1,type:"user",text:"Oi! Quero agendar uma limpeza de pele"},
  {id:2,type:"bot",text:"Perfeito! Você prefere manhã ou tarde? ☀️"},
  {id:3,type:"user",text:"Quarta de manhã se tiver"},
  {id:4,type:"bot",text:"Ótimo! Horários disponíveis na quarta de manhã 👇"},
  {id:5,type:"slots"},
  {id:6,type:"confirm"},
];
function ChatDemo(){
  const[phase,setPhase]=useState(0);
  const[typing,setTyping]=useState(false);
  const[chosen,setChosen]=useState(null);
  const[msgs,setMsgs]=useState([SCRIPT[0]]);
  const bottomRef=useRef(null);
  useEffect(()=>{
    const next=phase+1;if(next>=SCRIPT.length)return;
    const item=SCRIPT[next];
    if(item.type==="slots"||item.type==="confirm")return;
    const delay=item.type==="bot"?1000:650;
    setTyping(item.type==="bot");
    const t1=setTimeout(()=>setTyping(false),delay-200);
    const t2=setTimeout(()=>{setMsgs(m=>[...m,item]);setPhase(next);},delay+300);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[phase]);
  useEffect(()=>{if(phase===4){const t=setTimeout(()=>{setMsgs(m=>[...m,SCRIPT[5]]);setPhase(5);},500);return()=>clearTimeout(t);};},[phase]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[msgs,typing]);
  const pickSlot=(slot)=>{
    if(chosen)return;setChosen(slot.id);
    setTimeout(()=>setMsgs(m=>[...m,{id:"u_slot",type:"user",text:slot.label}]),300);
    setTimeout(()=>setTyping(true),700);
    setTimeout(()=>{setTyping(false);setMsgs(m=>[...m,{id:"confirm",type:"bot",text:`✅ Agendado! Quarta às ${slot.label} — Limpeza de pele (60min). Vou te lembrar na véspera. Até lá! ✨`}]);setPhase(6);},2000);
  };
  return(
    <div className="hero-visual" style={{maxHeight:480,display:"flex",flexDirection:"column"}}>
      <div style={{marginBottom:14,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#F2D4CF,#C9847A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💆‍♀️</div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>Luna — Secretária IA</div>
          <div style={{fontSize:11,color:"#C9847A",display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,background:"#4cd964",borderRadius:"50%",display:"inline-block"}}/>Online agora
          </div>
        </div>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingRight:2}}>
        {msgs.map((m,i)=>{
          if(m.type==="slots")return(
            <div key="slots" style={{marginBottom:10,animation:"fadeUp .4s ease both"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:7}}>Luna</div>
              <div className="chat-slots">
                {MORNING_SLOTS.map(s=>(
                  <button key={s.id} className={`slot-btn${chosen===s.id?" picked":""}`} onClick={()=>pickSlot(s)} disabled={!!chosen&&chosen!==s.id}>🕐 {s.label}</button>
                ))}
              </div>
            </div>
          );
          return(
            <div key={m.id??i}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:3,textAlign:m.type==="user"?"right":"left"}}>{m.type==="user"?"Você":"Luna"}</div>
              <div className={`chat-bubble ${m.type}`}>{m.text}</div>
            </div>
          );
        })}
        {typing&&<div className="typing"><span/><span/><span/></div>}
        <div ref={bottomRef}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   AUTH MODALS
══════════════════════════════════════════════ */
function GoogleIcon(){
  return(
    <svg className="google-icon" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginModal({onClose,onLogin,onForgot,onFirst}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[show,setShow]=useState(false);
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const submit=async(e)=>{
    e.preventDefault();setErr("");
    if(!email||!pass){setErr("Preencha todos os campos.");return;}
    if(!email.includes("@")){setErr("E-mail inválido.");return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false);
    onLogin({email,nome:"Usuária"});
  };
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="auth-logo"><span className="logo">Luna<span>.</span></span></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <h2 style={{fontSize:22,marginBottom:4}}>Bem-vinda de volta</h2>
          <p style={{fontSize:14,color:"var(--muted)",marginBottom:20}}>Acesse sua conta para gerenciar sua secretária.</p>
          <button className="google-btn" onClick={()=>onLogin({email:"user@gmail.com",nome:"Usuária",google:true})}>
            <GoogleIcon/> Continuar com Google
          </button>
          <div className="auth-divider"><span>ou</span></div>
          <form onSubmit={submit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} className={err&&!email?"error":""}/>
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="input-icon">
                <input type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} className={err&&!pass?"error":""}/>
                <span className="icon" onClick={()=>setShow(s=>!s)}>{show?"🙈":"👁"}</span>
              </div>
            </div>
            <span className="forgot-link" onClick={onForgot}>Esqueci minha senha</span>
            {err&&<div className="field-error" style={{marginBottom:12}}>⚠️ {err}</div>}
            <button type="submit" className="btn-next primary" style={{width:"100%",padding:"13px"}} disabled={loading}>
              {loading?"Entrando...":"Entrar →"}
            </button>
          </form>
          <div className="auth-switch">Primeiro acesso? <a onClick={onFirst}>Criar conta</a></div>
        </div>
      </div>
    </div>
  );
}

function ForgotModal({onClose,onBack}){
  const[email,setEmail]=useState("");
  const[sent,setSent]=useState(false);
  const[loading,setLoading]=useState(false);
  const submit=async(e)=>{
    e.preventDefault();setLoading(true);
    await new Promise(r=>setTimeout(r,1400));
    setLoading(false);setSent(true);
  };
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="auth-logo"><span className="logo">Luna<span>.</span></span></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!sent?(
            <>
              <h2 style={{fontSize:22,marginBottom:4}}>Recuperar senha</h2>
              <p style={{fontSize:14,color:"var(--muted)",marginBottom:20}}>Informe seu e-mail e enviaremos um link seguro para redefinir sua senha.</p>
              <form onSubmit={submit}>
                <div className="field">
                  <label>E-mail cadastrado</label>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                </div>
                <button type="submit" className="btn-next primary" style={{width:"100%",padding:"13px"}} disabled={loading||!email}>
                  {loading?"Enviando...":"Enviar link de recuperação"}
                </button>
              </form>
              <div className="auth-switch"><a onClick={onBack}>← Voltar para o login</a></div>
            </>
          ):(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h2 style={{fontSize:22,marginBottom:8}}>E-mail enviado!</h2>
              <p style={{fontSize:14,color:"var(--muted)",marginBottom:24}}>Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada (e a pasta spam).</p>
              <div className="security-badge"><span>🔒</span> Link expira em 30 minutos por segurança.</div>
              <div style={{marginTop:20}}><a className="auth-switch" onClick={onClose} style={{color:"var(--rose)",cursor:"pointer",fontWeight:600}}>Fechar</a></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   WIZARD STEPS
══════════════════════════════════════════════ */
function StepPlan({data,setData}){
  return(
    <div>
      <div className="plan-mini-grid">
        {PLANS.map(p=>(
          <div key={p.id} className={`plan-mini${data.plan===p.id?" selected":""}`} onClick={()=>setData(d=>({...d,plan:p.id}))}>
            <div className="pm-name">{p.label}</div>
            <div className="pm-price"><span>R$</span>{p.price}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>/mês</div>
          </div>
        ))}
      </div>
      <div style={{background:"var(--light)",borderRadius:12,padding:"16px 18px",fontSize:14,color:"var(--mid)"}}>
        {PLANS.find(p=>p.id===data.plan)?.features.filter(f=>f.on).map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{color:"var(--rose)",fontWeight:700}}>✓</span> {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepClinic({data,setData,errors}){
  return(
    <div>
      <div className="field">
        <label>Nome da clínica *</label>
        <input type="text" className={errors.nome?"error":""} placeholder="Ex: Clínica Bella Estética" value={data.nome} onChange={e=>setData(d=>({...d,nome:e.target.value}))}/>
      </div>
      <div className="field-row">
        <div className="field">
          <label>WhatsApp *</label>
          <input type="text" className={errors.whatsapp?"error":""} placeholder="(11) 99999-9999" value={data.whatsapp} onChange={e=>setData(d=>({...d,whatsapp:e.target.value}))}/>
        </div>
        <div className="field">
          <label>Cidade</label>
          <input type="text" placeholder="São Paulo, SP" value={data.cidade} onChange={e=>setData(d=>({...d,cidade:e.target.value}))}/>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nome da responsável *</label>
          <input type="text" className={errors.responsavel?"error":""} placeholder="Seu nome completo" value={data.responsavel} onChange={e=>setData(d=>({...d,responsavel:e.target.value}))}/>
        </div>
        <div className="field">
          <label>E-mail *</label>
          <input type="email" className={errors.email?"error":""} placeholder="seu@email.com" value={data.email} onChange={e=>setData(d=>({...d,email:e.target.value}))}/>
        </div>
      </div>
    </div>
  );
}

function StepAssistant({data,setData}){
  const preview=`Olá! ${data.emoji||"✨"} Bem-vinda à ${data.clinicNome||"sua clínica"}! Sou ${data.nome||"Luna"}, sua assistente. Como posso te ajudar? Posso te ajudar a agendar um serviço, tirar dúvidas ou falar com nossa atendente. 😊`;
  return(
    <div>
      <div className="assistant-preview">
        <div className="assistant-header">
          <div className="assistant-avatar">{data.emoji||"💆‍♀️"}</div>
          <div><div className="assistant-name">{data.nome||"Luna"}</div><div className="assistant-status">Online agora</div></div>
        </div>
        <div className="preview-bubble">{preview}</div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nome da assistente</label>
          <input type="text" placeholder="Ex: Luna, Sofia, Bella..." value={data.nome} onChange={e=>setData(d=>({...d,nome:e.target.value}))}/>
        </div>
        <div className="field">
          <label>Emoji</label>
          <input type="text" placeholder="💆‍♀️" value={data.emoji} onChange={e=>setData(d=>({...d,emoji:e.target.value}))}/>
        </div>
      </div>
      <div className="field">
        <label>Tom de atendimento</label>
        <select value={data.tom} onChange={e=>setData(d=>({...d,tom:e.target.value}))}>
          <option value="amigavel">Amigável e descontraído 😊</option>
          <option value="profissional">Profissional e elegante 💼</option>
          <option value="carinhoso">Carinhoso e próximo 💕</option>
          <option value="objetivo">Direto e objetivo ⚡</option>
        </select>
      </div>
      <div className="field">
        <label>Mensagem de boas-vindas</label>
        <textarea placeholder="Deixe em branco para usar a padrão..." value={data.welcome} onChange={e=>setData(d=>({...d,welcome:e.target.value}))}/>
        <div className="field-hint">Sempre incluiremos a opção de falar com a atendente automaticamente.</div>
      </div>
    </div>
  );
}

function StepServices({data,setData}){
  const addSvc=()=>setData(d=>({...d,services:[...d.services,{id:Date.now(),name:"",price:"",duration:"60"}]}));
  const rmSvc=(id)=>setData(d=>({...d,services:d.services.filter(s=>s.id!==id)}));
  const updSvc=(id,f,v)=>setData(d=>({...d,services:d.services.map(s=>s.id===id?{...s,[f]:v}:s)}));
  const addPkg=()=>setData(d=>({...d,packages:[...(d.packages||[]),{id:Date.now(),name:"",price:"",validity_days:"90",items:[{id:Date.now()+1,service_name:"",qty:""}]}]}));
  const rmPkg=(id)=>setData(d=>({...d,packages:(d.packages||[]).filter(p=>p.id!==id)}));
  const updPkg=(id,f,v)=>setData(d=>({...d,packages:(d.packages||[]).map(p=>p.id===id?{...p,[f]:v}:p)}));
  const addItem=(pid)=>setData(d=>({...d,packages:(d.packages||[]).map(p=>p.id===pid?{...p,items:[...p.items,{id:Date.now(),service_name:"",qty:""}]}:p)}));
  const rmItem=(pid,iid)=>setData(d=>({...d,packages:(d.packages||[]).map(p=>p.id===pid?{...p,items:p.items.filter(i=>i.id!==iid)}:p)}));
  const updItem=(pid,iid,f,v)=>setData(d=>({...d,packages:(d.packages||[]).map(p=>p.id===pid?{...p,items:p.items.map(i=>i.id===iid?{...i,[f]:v}:i)}:p)}));
  const tab=data.serviceTab||"avulso";
  const pkgs=data.packages||[];
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{id:"avulso",label:"🔹 Serviços Avulsos"},{id:"pacote",label:"📦 Pacotes"}].map(t=>(
          <button key={t.id} onClick={()=>setData(d=>({...d,serviceTab:t.id}))}
            style={{flex:1,padding:"10px 0",borderRadius:10,border:`2px solid ${tab===t.id?"var(--rose)":"rgba(0,0,0,.1)"}`,
              background:tab===t.id?"rgba(201,132,122,.08)":"transparent",color:tab===t.id?"var(--rose-dark)":"var(--muted)",
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab==="avulso"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 100px 80px 32px",gap:8,padding:"0 14px 6px"}}>
            {["Tipo de Serviço","Valor (R$)","Duração",""].map((h,i)=>(
              <span key={i} style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:.5,textTransform:"uppercase",textAlign:i>0?"right":"left"}}>{h}</span>
            ))}
          </div>
          <div className="service-list">
            {data.services.map(s=>(
              <div key={s.id} className="service-item" style={{gridTemplateColumns:"1fr 100px 80px 32px"}}>
                <input type="text" placeholder="Ex: Limpeza de pele" value={s.name} onChange={e=>updSvc(s.id,"name",e.target.value)} style={{minWidth:0}}/>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <span style={{fontSize:11,color:"var(--muted)",flexShrink:0}}>R$</span>
                  <input type="number" placeholder="0" value={s.price} onChange={e=>updSvc(s.id,"price",e.target.value)} style={{width:"100%",textAlign:"right"}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <input type="number" placeholder="60" value={s.duration} onChange={e=>updSvc(s.id,"duration",e.target.value)} style={{width:"100%",textAlign:"right"}}/>
                  <span style={{fontSize:11,color:"var(--muted)",flexShrink:0}}>min</span>
                </div>
                <button className="remove-btn" onClick={()=>rmSvc(s.id)}>✕</button>
              </div>
            ))}
          </div>
          <button className="add-service-btn" onClick={addSvc}>+ Adicionar serviço</button>
        </>
      )}
      {tab==="pacote"&&(
        <>
          {pkgs.map(pkg=>(
            <div key={pkg.id} style={{border:"1.5px solid rgba(0,0,0,.1)",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 28px",gap:10,marginBottom:14,alignItems:"end"}}>
                <div className="field" style={{margin:0}}>
                  <label>Nome do Pacote</label>
                  <input type="text" placeholder="Ex: Pacote Pele Radiante" value={pkg.name} onChange={e=>updPkg(pkg.id,"name",e.target.value)}/>
                </div>
                <div className="field" style={{margin:0}}>
                  <label>Valor (R$)</label>
                  <input type="number" placeholder="0" value={pkg.price} onChange={e=>updPkg(pkg.id,"price",e.target.value)} style={{textAlign:"right"}}/>
                </div>
                <div className="field" style={{margin:0}}>
                  <label>Validade</label>
                  <select value={pkg.validity_days} onChange={e=>updPkg(pkg.id,"validity_days",e.target.value)}>
                    <option value="30">30 dias</option><option value="60">60 dias</option><option value="90">90 dias</option>
                    <option value="180">6 meses</option><option value="365">1 ano</option>
                  </select>
                </div>
                <button onClick={()=>rmPkg(pkg.id)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:18,paddingBottom:2}}>✕</button>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--mid)",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Serviços incluídos</div>
              {pkg.items.map(item=>(
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 90px 28px",gap:8,marginBottom:8,alignItems:"center"}}>
                  <input type="text" placeholder="Ex: Limpeza de pele" value={item.service_name} onChange={e=>updItem(pkg.id,item.id,"service_name",e.target.value)}
                    style={{padding:"8px 12px",border:"1.5px solid rgba(0,0,0,.1)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
                  <input type="number" placeholder="Qtd" min="1" value={item.qty} onChange={e=>updItem(pkg.id,item.id,"qty",e.target.value)}
                    style={{padding:"8px 10px",border:"1.5px solid rgba(0,0,0,.1)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:13,textAlign:"center",outline:"none"}}/>
                  <button onClick={()=>rmItem(pkg.id,item.id)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:15}}>✕</button>
                </div>
              ))}
              <button onClick={()=>addItem(pkg.id)} style={{width:"100%",padding:"8px",border:"1.5px dashed rgba(0,0,0,.15)",borderRadius:8,background:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",cursor:"pointer"}}>
                + Adicionar serviço ao pacote
              </button>
            </div>
          ))}
          <button className="add-service-btn" onClick={addPkg}>+ Criar novo pacote</button>
          <div style={{marginTop:8,fontSize:12,color:"var(--muted)"}}>A IA verifica sessões usadas e avisa quando o pacote esgotar.</div>
        </>
      )}
    </div>
  );
}

function StepSchedule({data,setData}){
  const toggleDay=(i)=>setData(d=>{
    const on=d.days.includes(i);
    const days=on?d.days.filter(x=>x!==i):[...d.days,i].sort((a,b)=>a-b);
    const slots={...d.slots};
    if(!on&&!slots[i])slots[i]=[{id:Date.now(),open:"09:00",close:"18:00"}];
    return{...d,days,slots};
  });
  const addSlot=(day)=>setData(d=>({...d,slots:{...d.slots,[day]:[...(d.slots[day]||[]),{id:Date.now(),open:"09:00",close:"18:00"}]}}));
  const rmSlot=(day,id)=>setData(d=>({...d,slots:{...d.slots,[day]:(d.slots[day]||[]).filter(s=>s.id!==id)}}));
  const updSlot=(day,id,f,v)=>setData(d=>({...d,slots:{...d.slots,[day]:(d.slots[day]||[]).map(s=>s.id===id?{...s,[f]:v}:s)}}));
  return(
    <div>
      <div style={{background:"rgba(201,132,122,.06)",border:"1.5px solid var(--rose-light)",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--rose-dark)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>📅 Período de funcionamento</div>
        <div className="field-row" style={{marginBottom:0}}>
          <div className="field" style={{margin:0}}>
            <label>Data de início</label>
            <input type="date" value={data.date_start||""} onChange={e=>setData(d=>({...d,date_start:e.target.value}))}/>
            <div className="field-hint">Deixe vazio para iniciar imediatamente.</div>
          </div>
          <div className="field" style={{margin:0}}>
            <label>Data de encerramento</label>
            <input type="date" value={data.date_end||""} onChange={e=>setData(d=>({...d,date_end:e.target.value}))}/>
            <div className="field-hint">Deixe vazio para sem prazo definido.</div>
          </div>
        </div>
      </div>
      <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:10}}>Dias e horários de atendimento</div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Selecione os dias e configure os horários de cada um. Você pode ter mais de um turno por dia.</div>
      <div className="schedule-grid" style={{marginBottom:16}}>
        {DAYS.map((d,i)=>(
          <button key={d} className={`day-btn${data.days.includes(i)?" active":""}`} onClick={()=>toggleDay(i)}>{d}</button>
        ))}
      </div>
      {data.days.sort((a,b)=>a-b).map(di=>(
        <div key={di} className="day-slots" style={{marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--charcoal)",marginBottom:10}}>{DAYS[di]}</div>
          {(data.slots[di]||[]).map((slot,si)=>(
            <div key={slot.id} className="time-slot-row">
              <input type="time" value={slot.open} onChange={e=>updSlot(di,slot.id,"open",e.target.value)}
                style={{padding:"8px 10px",border:"1.5px solid rgba(0,0,0,.12)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",width:"100%"}}/>
              <span>→</span>
              <input type="time" value={slot.close} onChange={e=>updSlot(di,slot.id,"close",e.target.value)}
                style={{padding:"8px 10px",border:"1.5px solid rgba(0,0,0,.12)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",width:"100%"}}/>
              <button onClick={()=>rmSlot(di,slot.id)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:15,padding:"0 4px"}}>{(data.slots[di]||[]).length>1?"✕":""}</button>
            </div>
          ))}
          <button className="add-slot-btn" onClick={()=>addSlot(di)}>+ Turno</button>
        </div>
      ))}
      <div className="field" style={{marginTop:16}}>
        <label>Intervalo entre agendamentos (minutos)</label>
        <input type="number" min="5" max="120" step="5" placeholder="Ex: 30" value={data.interval||"30"} onChange={e=>setData(d=>({...d,interval:e.target.value}))}/>
        <div className="field-hint">Tempo mínimo entre um atendimento e o próximo.</div>
      </div>
      <div className="field">
        <label>Telefone para escalada</label>
        <input type="text" placeholder="(11) 99999-9999" value={data.escalada||""} onChange={e=>setData(d=>({...d,escalada:e.target.value}))}/>
        <div className="field-hint">Você recebe alerta quando um cliente pede atendimento humano.</div>
      </div>
    </div>
  );
}

function StepPayment({data,setData}){
  const[num,setNum]=useState("");
  const[name,setName]=useState("");
  const[exp,setExp]=useState("");
  const[cvv,setCvv]=useState("");
  const[showCvv,setShowCvv]=useState(false);
  const last4=num.replace(/\s/g,"").slice(-4)||"••••";
  const displayName=name||"SEU NOME";
  const displayExp=exp||"MM/AA";
  return(
    <div>
      <div className="trial-banner">
        <h4>🎁 14 dias grátis, sem cobrar nada agora</h4>
        <p>Após o período de teste, você será cobrado <strong>R$ {PLANS.find(p=>p.id===(data.plan||"profissional"))?.price}/mês</strong>. Cancele antes e não pagará nada. O cartão é necessário apenas para ativar a conta.</p>
      </div>
      <div className="card-preview">
        <div className="card-chip"/>
        <div className="card-number">{num||"•••• •••• •••• ••••"}</div>
        <div className="card-info">
          <div><div style={{fontSize:10,opacity:.5,marginBottom:2}}>TITULAR</div>{displayName.toUpperCase()}</div>
          <div><div style={{fontSize:10,opacity:.5,marginBottom:2}}>VALIDADE</div>{displayExp}</div>
          <div><div style={{fontSize:10,opacity:.5,marginBottom:2}}>FINAL</div>{last4}</div>
        </div>
      </div>
      <div className="field">
        <label>Número do cartão</label>
        <input type="text" placeholder="0000 0000 0000 0000" value={num} maxLength={19} onChange={e=>setNum(maskCard(e.target.value))} inputMode="numeric"/>
      </div>
      <div className="field">
        <label>Nome no cartão</label>
        <input type="text" placeholder="Como aparece no cartão" value={name} onChange={e=>setName(e.target.value.toUpperCase())}/>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Validade</label>
          <input type="text" placeholder="MM/AA" value={exp} maxLength={5} onChange={e=>setExp(maskExpiry(e.target.value))} inputMode="numeric"/>
        </div>
        <div className="field">
          <label>CVV</label>
          <div className="input-icon">
            <input type={showCvv?"text":"password"} placeholder="•••" value={cvv} maxLength={4} onChange={e=>setCvv(maskCVV(e.target.value))} inputMode="numeric"/>
            <span className="icon" onClick={()=>setShowCvv(s=>!s)}>{showCvv?"🙈":"👁"}</span>
          </div>
        </div>
      </div>
      <div className="pci-badges">
        <div className="pci-badge">🔒 SSL 256-bit</div>
        <div className="pci-badge">✅ PCI DSS</div>
        <div className="pci-badge">🛡 Dados tokenizados</div>
      </div>
      <div style={{fontSize:12,color:"var(--muted)",marginTop:12,lineHeight:1.6}}>
        Seus dados são criptografados e nunca armazenados em nossos servidores. Processamento via Stripe/Pagar.me com conformidade PCI DSS nível 1.
      </div>
    </div>
  );
}

function StepAccount({data,setData,isGoogle,onGoogle}){
  const[pass,setPass]=useState("");
  const[confirm,setConfirm]=useState("");
  const[show,setShow]=useState(false);
  const st=passwordStrength(pass);
  const match=confirm&&pass!==confirm;
  return(
    <div>
      <div style={{background:"var(--light)",borderRadius:14,padding:"16px 18px",marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:600,color:"var(--charcoal)",marginBottom:4}}>Quase lá! Crie sua conta para acessar o painel.</div>
        <div style={{fontSize:13,color:"var(--muted)"}}>Você usará este acesso para gerenciar sua secretária, ver a agenda e os clientes.</div>
      </div>
      <button className="google-btn" onClick={onGoogle} style={{marginBottom:20}}>
        <GoogleIcon/> {isGoogle?"✓ Conectado com Google":"Criar conta com Google"}
      </button>
      <div className="auth-divider"><span>ou crie com e-mail e senha</span></div>
      <div className="field">
        <label>E-mail</label>
        <input type="email" placeholder="seu@email.com" value={data.email||""} disabled style={{opacity:.6,cursor:"not-allowed"}}/>
        <div className="field-hint">E-mail informado na etapa de dados da clínica.</div>
      </div>
      <div className="field">
        <label>Senha *</label>
        <div className="input-icon">
          <input type={show?"text":"password"} placeholder="Mínimo 8 caracteres" value={pass} onChange={e=>{setPass(e.target.value);setData(d=>({...d,password:e.target.value}));}}/>
          <span className="icon" onClick={()=>setShow(s=>!s)}>{show?"🙈":"👁"}</span>
        </div>
        {pass&&<>
          <div className="strength-bar" style={{width:`${(st.score/5)*100}%`,background:st.color}}/>
          <div className="strength-label" style={{color:st.color}}>{st.label}</div>
        </>}
        <div className="field-hint">Use letras maiúsculas, números e símbolos para uma senha forte.</div>
      </div>
      <div className="field">
        <label>Confirmar senha *</label>
        <input type="password" placeholder="Repita a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} className={match?"error":""}/>
        {match&&<div className="field-error">As senhas não coincidem.</div>}
      </div>
      <div className="security-badge"><span>🔒</span> Senhas armazenadas com hash bcrypt — nunca em texto puro.</div>
    </div>
  );
}

function StepSuccess({clinicData,assistantData,planData}){
  const plan=PLANS.find(p=>p.id===planData.plan);
  return(
    <div className="success-screen">
      <div className="success-icon">🎉</div>
      <h2 className="success-title">Conta criada!</h2>
      <p className="success-sub"><strong>{clinicData.nome||"Sua clínica"}</strong> está configurada.<br/>Sua secretária <strong>{assistantData.nome||"Luna"}</strong> entra em ação em até 24h.</p>
      <div style={{background:"linear-gradient(135deg,var(--rose-light),#fff)",borderRadius:14,padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontSize:13,color:"var(--mid)",marginBottom:4}}>Plano</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>{plan?.label}</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"var(--rose-dark)"}}>R$ {plan?.price}<span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>/mês após 14 dias</span></span>
        </div>
      </div>
      <div className="next-steps">
        <h4>Próximos passos</h4>
        {["Você receberá um e-mail de confirmação","Nossa equipe fará a configuração técnica em até 24h","Você aprovará a assistente antes de ir ao ar","Acesse o painel para ver sua agenda e leads"].map((s,i)=>(
          <div key={i} className="next-step-item"><div className="step-num">{i+1}</div><span>{s}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
const TOTAL_STEPS=8;
function Wizard({defaultPlan,onClose,onComplete}){
  const[step,setStep]=useState(1);
  const[planData,setPlanData]=useState({plan:defaultPlan||"profissional"});
  const[clinicData,setClinicData]=useState({nome:"",whatsapp:"",cidade:"",responsavel:"",email:""});
  const[assistantData,setAssistantData]=useState({nome:"Luna",emoji:"💆‍♀️",tom:"amigavel",welcome:"",clinicNome:""});
  const[servicesData,setServicesData]=useState({services:DEFAULT_SERVICES,packages:[],serviceTab:"avulso"});
  const[scheduleData,setScheduleData]=useState({days:[1,2,3,4,5],slots:{1:[{id:1,open:"09:00",close:"18:00"}],2:[{id:2,open:"09:00",close:"18:00"}],3:[{id:3,open:"09:00",close:"18:00"}],4:[{id:4,open:"09:00",close:"18:00"}],5:[{id:5,open:"09:00",close:"18:00"}]},date_start:"",date_end:"",interval:"30",escalada:""});
  const[accountData,setAccountData]=useState({password:"",google:false});
  const[errors,setErrors]=useState({});
  const[isGoogle,setIsGoogle]=useState(false);
  useEffect(()=>setAssistantData(d=>({...d,clinicNome:clinicData.nome})),[clinicData.nome]);
  const STEP_META=[
    {label:"Plano",title:"Escolha seu plano",subtitle:"Mude a qualquer momento, sem multa."},
    {label:"Clínica",title:"Dados da clínica",subtitle:"Informações para sua assistente usar no atendimento."},
    {label:"Assistente",title:"Personalize a assistente",subtitle:"Nome, personalidade e tom de voz da sua secretária."},
    {label:"Serviços",title:"Seus serviços",subtitle:"A IA informa preços e durações automaticamente."},
    {label:"Agenda",title:"Horários de atendimento",subtitle:"Quando sua clínica recebe agendamentos?"},
    {label:"Pagamento",title:"Método de pagamento",subtitle:"14 dias grátis. Sem cobrar agora."},
    {label:"Conta",title:"Crie sua conta",subtitle:"Acesso seguro ao painel de gerenciamento."},
    {label:"Pronto!",title:"Configuração concluída",subtitle:""},
  ];
  const validate=()=>{
    const e={};
    if(step===2){
      if(!clinicData.nome)e.nome=true;
      if(!clinicData.whatsapp)e.whatsapp=true;
      if(!clinicData.responsavel)e.responsavel=true;
      if(!clinicData.email||!clinicData.email.includes("@"))e.email=true;
    }
    setErrors(e);return Object.keys(e).length===0;
  };
  const next=()=>{if(validate())setStep(s=>Math.min(s+1,TOTAL_STEPS));};
  const back=()=>setStep(s=>Math.max(s-1,1));
  const isLast=step===TOTAL_STEPS;
  const meta=STEP_META[step-1];
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="wizard">
        <div className="wizard-header">
          <div className="logo">Luna<span>.</span></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wizard-steps-bar">
          {Array.from({length:TOTAL_STEPS}).map((_,i)=>(
            <div key={i} className={`wizard-step-dot${i+1<step?" done":i+1===step?" active":""}`}/>
          ))}
        </div>
        <div className="wizard-body">
          <div className="wizard-step-label">Passo {step} de {TOTAL_STEPS} — {meta.label}</div>
          <h2 className="wizard-title">{meta.title}</h2>
          {meta.subtitle&&<p className="wizard-subtitle">{meta.subtitle}</p>}
          {step===1&&<StepPlan data={planData} setData={setPlanData}/>}
          {step===2&&<StepClinic data={clinicData} setData={setClinicData} errors={errors}/>}
          {step===3&&<StepAssistant data={assistantData} setData={setAssistantData}/>}
          {step===4&&<StepServices data={servicesData} setData={setServicesData}/>}
          {step===5&&<StepSchedule data={scheduleData} setData={setScheduleData}/>}
          {step===6&&<StepPayment data={planData} setData={setPlanData}/>}
          {step===7&&<StepAccount data={clinicData} setData={setClinicData} isGoogle={isGoogle} onGoogle={()=>{setIsGoogle(true);setAccountData(d=>({...d,google:true}));}}/>}
          {step===8&&<StepSuccess clinicData={clinicData} assistantData={assistantData} planData={planData}/>}
          {!isLast&&(
            <div className="wizard-footer">
              {step>1?<button className="btn-back" onClick={back}>← Voltar</button>:<div/>}
              <button className={`btn-next${step>=6?" primary":""}`} onClick={next}>
                {step===7?"✦ Finalizar e Ativar":"Continuar →"}
              </button>
            </div>
          )}
          {isLast&&(
            <div className="wizard-footer" style={{justifyContent:"center"}}>
              <button className="btn-next primary" onClick={()=>{onComplete&&onComplete();onClose();}} style={{padding:"14px 48px"}}>Acessar Painel ✦</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
const MOCK_AGENDA=[
  {id:1,cliente:"Ana Souza",servico:"Limpeza de pele",data:"2026-06-06",hora:"09:00",status:"confirmado",tel:"11999990001"},
  {id:2,cliente:"Juliana Matos",servico:"Design de sobrancelha",data:"2026-06-06",hora:"10:30",status:"pendente",tel:"11999990002"},
  {id:3,cliente:"Carla Lima",servico:"Hidratação facial",data:"2026-06-07",hora:"14:00",status:"confirmado",tel:"11999990003"},
  {id:4,cliente:"Renata Gomes",servico:"Limpeza de pele",data:"2026-06-07",hora:"15:30",status:"cancelado",tel:"11999990004",motivo:"Compromisso imprevisto"},
  {id:5,cliente:"Patrícia Alves",servico:"Microblading",data:"2026-06-08",hora:"09:00",status:"pendente",tel:"11999990005"},
];
const MOCK_LEADS=[
  {id:1,nome:"Fernanda Costa",servico_interesse:"Depilação a laser",contato:"11999990010",ultima_mensagem:"Qual o valor?",data:"2026-06-05",tag:"interessado"},
  {id:2,nome:"Bianca Torres",servico_interesse:"Limpeza de pele",contato:"11999990011",ultima_mensagem:"Que dias vocês atendem?",data:"2026-06-04",tag:"interessado"},
  {id:3,nome:"Mariana Fonseca",servico_interesse:"Design sobrancelha",contato:"11999990012",ultima_mensagem:"Ok obrigada",data:"2026-06-03",tag:"sem_resposta"},
];

function CancelModal({agendamento,onConfirm,onClose}){
  const[motivo,setMotivo]=useState("");
  const[reagendar,setReagendar]=useState(false);
  const[novaData,setNovaData]=useState("");
  const[novaHora,setNovaHora]=useState("");
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,fontWeight:600}}>{reagendar?"Reagendar Atendimento":"Cancelar Atendimento"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{background:"var(--light)",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:14,color:"var(--mid)"}}>
            <strong>{agendamento.cliente}</strong> — {agendamento.servico}<br/>
            <span style={{fontSize:13,color:"var(--muted)"}}>{agendamento.data} às {agendamento.hora}</span>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button onClick={()=>setReagendar(false)} style={{flex:1,padding:"9px",borderRadius:8,border:`2px solid ${!reagendar?"var(--red)":"rgba(0,0,0,.1)"}`,background:!reagendar?"rgba(255,59,48,.06)":"transparent",color:!reagendar?"var(--red)":"var(--muted)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              ✕ Cancelar
            </button>
            <button onClick={()=>setReagendar(true)} style={{flex:1,padding:"9px",borderRadius:8,border:`2px solid ${reagendar?"var(--rose)":"rgba(0,0,0,.1)"}`,background:reagendar?"rgba(201,132,122,.08)":"transparent",color:reagendar?"var(--rose-dark)":"var(--muted)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              📅 Reagendar
            </button>
          </div>
          {reagendar&&(
            <div className="field-row">
              <div className="field"><label>Nova data</label><input type="date" value={novaData} onChange={e=>setNovaData(e.target.value)}/></div>
              <div className="field"><label>Novo horário</label><input type="time" value={novaHora} onChange={e=>setNovaHora(e.target.value)}/></div>
            </div>
          )}
          <div className="field">
            <label>Motivo {reagendar?"do reagendamento":"do cancelamento"} *</label>
            <textarea placeholder="Ex: Compromisso imprevisto, emergência familiar..." value={motivo} onChange={e=>setMotivo(e.target.value)}/>
            <div className="field-hint">O cliente será notificado pelo WhatsApp.</div>
          </div>
          <button className="btn-next primary" style={{width:"100%",padding:"12px"}} onClick={()=>motivo&&onConfirm({reagendar,motivo,novaData,novaHora})} disabled={!motivo}>
            {reagendar?"Confirmar Reagendamento":"Confirmar Cancelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({user,onLogout}){
  const[page,setPage]=useState("inicio");
  const[agenda,setAgenda]=useState(MOCK_AGENDA);
  const[cancelModal,setCancelModal]=useState(null);
  const[sidebarOpen,setSidebarOpen]=useState(false);
  const[editingSchedule,setEditingSchedule]=useState(false);
  const[conflictWarning,setConflictWarning]=useState(false);
  const[scheduleData,setScheduleData]=useState({days:[1,2,3,4,5],slots:{1:[{id:1,open:"09:00",close:"18:00"}],2:[{id:2,open:"09:00",close:"18:00"}],3:[{id:3,open:"09:00",close:"18:00"}],4:[{id:4,open:"09:00",close:"18:00"}],5:[{id:5,open:"09:00",close:"18:00"}]},date_start:"",date_end:"",interval:"30",escalada:""});

  const confirmados=agenda.filter(a=>a.status==="confirmado").length;
  const pendentes=agenda.filter(a=>a.status==="pendente").length;
  const cancelados=agenda.filter(a=>a.status==="cancelado").length;

  const handleCancel=(ag,result)=>{
    if(result.reagendar){
      setAgenda(prev=>prev.map(a=>a.id===ag.id?{...a,data:result.novaData||a.data,hora:result.novaHora||a.hora,status:"pendente",motivo_reagendamento:result.motivo}:a));
    }else{
      setAgenda(prev=>prev.map(a=>a.id===ag.id?{...a,status:"cancelado",motivo:result.motivo}:a));
    }
    setCancelModal(null);
  };

  const checkConflict=()=>{
    // Simula verificação de conflito ao editar agenda
    setConflictWarning(true);
    setEditingSchedule(true);
  };

  const navItems=[
    {id:"inicio",icon:"🏠",label:"Início"},
    {id:"secretaria",icon:"🤖",label:"Minha Secretária"},
    {id:"agenda",icon:"📅",label:"Agenda"},
    {id:"leads",icon:"💬",label:"Leads"},
    {id:"config",icon:"⚙️",label:"Configurações"},
  ];

  const Sidebar=()=>(
    <div className="dash-sidebar">
      <div className="logo" style={{padding:"0 24px 24px"}}>Luna<span>.</span></div>
      <div className="dash-nav">
        {navItems.map(item=>(
          <button key={item.id} className={`dash-nav-item${page===item.id?" active":""}`} onClick={()=>{setPage(item.id);setSidebarOpen(false);}}>
            <span className="nav-icon">{item.icon}</span>{item.label}
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
  );

  return(
    <div className="dash-layout">
      <Sidebar/>
      {/* Mobile header */}
      <div className="dash-mobile-header">
        <button className="hamburger" onClick={()=>setSidebarOpen(s=>!s)}>☰</button>
        <span className="logo">Luna<span>.</span></span>
        <button onClick={onLogout} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer"}}>Sair</button>
      </div>
      {sidebarOpen&&<div style={{position:"fixed",inset:0,zIndex:49,background:"rgba(0,0,0,.5)"}} onClick={()=>setSidebarOpen(false)}/>}

      <div className="dash-main">
        {/* ── INÍCIO ── */}
        {page==="inicio"&&(
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Bom dia! 👋</h1><p className="dash-subtitle">Aqui está o resumo da sua secretária hoje.</p></div>
              <button onClick={onLogout} style={{background:"none",border:"1px solid rgba(0,0,0,.12)",borderRadius:100,padding:"8px 18px",fontSize:13,cursor:"pointer",color:"var(--muted)",fontFamily:"'DM Sans',sans-serif"}}>Sair</button>
            </div>
            <div className="dash-cards">
              <div className="dash-card highlight"><div className="dash-card-icon">📅</div><div className="dash-card-val">{confirmados}</div><div className="dash-card-label">Confirmados hoje</div></div>
              <div className="dash-card"><div className="dash-card-icon">⏳</div><div className="dash-card-val">{pendentes}</div><div className="dash-card-label">Aguardando confirmação</div></div>
              <div className="dash-card"><div className="dash-card-icon">💬</div><div className="dash-card-val">{MOCK_LEADS.length}</div><div className="dash-card-label">Leads esta semana</div></div>
              <div className="dash-card"><div className="dash-card-icon">❌</div><div className="dash-card-val">{cancelados}</div><div className="dash-card-label">Cancelamentos</div></div>
            </div>
            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-title">Próximos agendamentos</span>
                <button className="action-btn" onClick={()=>setPage("agenda")}>Ver todos</button>
              </div>
              <table className="dash-table">
                <thead><tr><th>Cliente</th><th>Serviço</th><th>Data/Hora</th><th>Status</th></tr></thead>
                <tbody>
                  {agenda.filter(a=>a.status!=="cancelado").slice(0,3).map(a=>(
                    <tr key={a.id}>
                      <td style={{fontWeight:500}}>{a.cliente}</td>
                      <td>{a.servico}</td>
                      <td>{a.data} {a.hora}</td>
                      <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── MINHA SECRETÁRIA ── */}
        {page==="secretaria"&&(
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Minha Secretária</h1><p className="dash-subtitle">Configuração atual da sua assistente virtual.</p></div>
              <button className="dash-edit-btn" onClick={()=>setPage("config")}>✏️ Editar</button>
            </div>
            <div className="dash-section">
              <div className="assistant-preview" style={{marginBottom:0}}>
                <div className="assistant-header">
                  <div className="assistant-avatar">💆‍♀️</div>
                  <div><div className="assistant-name">Luna</div><div className="assistant-status">Ativa e respondendo</div></div>
                </div>
                <div className="preview-bubble">Olá! 💆‍♀️ Bem-vinda à Clínica Bella. Sou a Luna. Posso ajudar com agendamentos, dúvidas sobre serviços ou te conectar com nossa atendente. 😊</div>
              </div>
            </div>
            <div className="dash-section">
              <div className="dash-section-title" style={{marginBottom:16}}>Detalhes da configuração</div>
              {[["Nome da assistente","Luna"],["Tom de atendimento","Amigável e descontraído"],["Plano ativo","Profissional — R$ 197/mês"],["Serviços cadastrados","Limpeza de pele, Design de sobrancelha (+2)"],["Horário","Seg–Sex | 09:00–18:00"],["WhatsApp","(11) 99999-0000"]].map(([l,v])=>(
                <div key={l} className="config-row"><span className="config-label">{l}</span><span className="config-value">{v}</span></div>
              ))}
            </div>
          </>
        )}

        {/* ── AGENDA ── */}
        {page==="agenda"&&(
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Agenda</h1><p className="dash-subtitle">Gerencie todos os agendamentos da clínica.</p></div>
              <button className="dash-edit-btn" onClick={checkConflict}>⚙️ Editar Horários</button>
            </div>
            {editingSchedule&&(
              <div style={{background:"var(--white)",border:"1px solid rgba(0,0,0,.08)",borderRadius:14,padding:24,marginBottom:20}}>
                {conflictWarning&&(
                  <div className="conflict-alert">
                    <strong>⚠️ Atenção: conflito detectado</strong>
                    2 agendamentos existentes estão fora do novo horário proposto (Ana Souza — 06/06 09:00, Juliana Matos — 06/06 10:30). Você precisará reagendá-los antes de salvar.
                  </div>
                )}
                <StepSchedule data={scheduleData} setData={setScheduleData}/>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button className="btn-next primary" style={{padding:"10px 28px"}} onClick={()=>{setEditingSchedule(false);setConflictWarning(false);}}>Salvar horários</button>
                  <button className="btn-back" onClick={()=>{setEditingSchedule(false);setConflictWarning(false);}}>Cancelar</button>
                </div>
              </div>
            )}
            {[{label:"Confirmados",status:"confirmado"},{label:"Pendentes",status:"pendente"},{label:"Cancelados",status:"cancelado"}].map(group=>{
              const items=agenda.filter(a=>a.status===group.status);
              if(!items.length)return null;
              return(
                <div key={group.status} className="dash-section" style={{marginBottom:16}}>
                  <div className="dash-section-header">
                    <span className="dash-section-title">{group.label} ({items.length})</span>
                  </div>
                  <table className="dash-table">
                    <thead><tr><th>Cliente</th><th>Serviço</th><th>Data/Hora</th><th>Motivo</th><th>Ações</th></tr></thead>
                    <tbody>
                      {items.map(a=>(
                        <tr key={a.id}>
                          <td style={{fontWeight:500}}>{a.cliente}</td>
                          <td>{a.servico}</td>
                          <td>{a.data} {a.hora}</td>
                          <td style={{fontSize:13,color:"var(--muted)"}}>{a.motivo||"—"}</td>
                          <td>
                            {a.status!=="cancelado"&&(
                              <div style={{display:"flex",gap:6}}>
                                <button className="action-btn" onClick={()=>setCancelModal(a)}>Cancelar/Reagendar</button>
                              </div>
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
        {page==="leads"&&(
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Leads</h1><p className="dash-subtitle">Pessoas que entraram em contato mas não agendaram.</p></div>
            </div>
            <div className="dash-section">
              <div className="dash-section-header">
                <span className="dash-section-title">Contatos em aberto ({MOCK_LEADS.length})</span>
              </div>
              {MOCK_LEADS.map(lead=>(
                <div key={lead.id} className="lead-row">
                  <div className="lead-avatar">👤</div>
                  <div className="lead-info">
                    <div className="lead-name">{lead.nome}</div>
                    <div className="lead-detail">Interesse: {lead.servico_interesse} · {lead.ultima_mensagem} · {lead.data}</div>
                  </div>
                  <span className={`lead-tag ${lead.tag}`}>{lead.tag==="interessado"?"Interessado":"Sem resposta"}</span>
                  <button className="action-btn" style={{marginLeft:8}}>Retomar</button>
                </div>
              ))}
            </div>
            <div className="dash-section">
              <div className="dash-section-title" style={{marginBottom:8}}>Como converter leads</div>
              <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7}}>Sua assistente tenta reativar leads automaticamente após 48h sem resposta no plano Profissional e Premium. Você pode também clicar em "Retomar" para retomar a conversa manualmente via WhatsApp.</p>
            </div>
          </>
        )}

        {/* ── CONFIG ── */}
        {page==="config"&&(
          <>
            <div className="dash-topbar">
              <div><h1 className="dash-title">Configurações</h1><p className="dash-subtitle">Ajuste as configurações da sua conta e secretária.</p></div>
            </div>
            {[{title:"Dados da clínica",items:[["Nome","Clínica Bella Estética"],["WhatsApp","(11) 99999-0000"],["Cidade","São Paulo, SP"],["E-mail","bella@clinica.com.br"]]},
              {title:"Assistente",items:[["Nome","Luna"],["Tom","Amigável"],["Falar com humano","Sempre disponível nas conversas"]]},
              {title:"Plano e cobrança",items:[["Plano atual","Profissional — R$ 197/mês"],["Próxima cobrança","06/07/2026"],["Cartão","•••• •••• •••• 4242"]]},
            ].map(section=>(
              <div key={section.title} className="dash-section" style={{marginBottom:16}}>
                <div className="dash-section-header">
                  <span className="dash-section-title">{section.title}</span>
                  <button className="dash-edit-btn">Editar</button>
                </div>
                {section.items.map(([l,v])=>(
                  <div key={l} className="config-row"><span className="config-label">{l}</span><span className="config-value">{v}</span></div>
                ))}
              </div>
            ))}
            <div className="dash-section" style={{borderColor:"rgba(255,59,48,.2)"}}>
              <div className="dash-section-title" style={{color:"var(--red)",marginBottom:8}}>Zona de risco</div>
              <p style={{fontSize:14,color:"var(--muted)",marginBottom:14}}>Cancelar o plano encerrará os serviços da secretária ao fim do período pago.</p>
              <button style={{background:"none",border:"1px solid var(--red)",color:"var(--red)",borderRadius:100,padding:"8px 20px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Cancelar plano</button>
            </div>
          </>
        )}
      </div>
      {cancelModal&&<CancelModal agendamento={cancelModal} onConfirm={r=>handleCancel(cancelModal,r)} onClose={()=>setCancelModal(null)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════ */
function PlanCard({plan,onSelect}){
  return(
    <div className={`plan-card ${plan.slug}`}>
      {plan.popular&&<div className="plan-popular">⭐ Mais escolhido</div>}
      <div className="plan-badge">{plan.badge}</div>
      <div className="plan-name">{plan.label}</div>
      <div className="plan-price"><span>R$</span>{plan.price}</div>
      <div className="plan-period">por mês · cancele quando quiser</div>
      <div className="plan-desc">{plan.desc}</div>
      <ul className="plan-features">
        {plan.features.map((f,i)=><li key={i} className={f.on?"":"off"}>{f.text}</li>)}
      </ul>
      <button className="plan-btn" onClick={()=>onSelect(plan.id)}>Começar agora →</button>
    </div>
  );
}
function FAQ(){
  const[open,setOpen]=useState(null);
  return(
    <div className="faq-list">
      {FAQS.map((f,i)=>(
        <div key={i} className="faq-item">
          <button className={`faq-q${open===i?" open":""}`} onClick={()=>setOpen(open===i?null:i)}>
            {f.q}<span className="arrow">+</span>
          </button>
          <div className={`faq-a${open===i?" open":""}`}>{f.a}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════ */
export default function App(){
  const[wizard,setWizard]=useState(null);
  const[authModal,setAuthModal]=useState(null); // "login"|"forgot"
  const[user,setUser]=useState(null);

  const handleLogin=(u)=>{setUser(u);setAuthModal(null);};

  if(user){
    return<Dashboard user={user} onLogout={()=>setUser(null)}/>;
  }

  return(
    <>
      {/* HERO */}
      <section className="hero">
        <nav className="hero-nav">
          <div className="logo">Luna<span>.</span></div>
          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={()=>setAuthModal("login")}>Entrar</button>
            <button className="nav-cta" onClick={()=>setAuthModal("login")}>Primeiro acesso</button>
          </div>
        </nav>
        <div className="hero-body">
          <div className="hero-text">
            <div className="hero-badge">Secretária de IA para estética</div>
            <h1 className="hero-title">Sua clínica<br/><em>atendendo 24h</em><br/>sem você</h1>
            <p className="hero-sub">A assistente virtual que agenda, lembra, responde dúvidas e nunca deixa uma cliente sem resposta.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={()=>setWizard("profissional")}>Configurar minha secretária</button>
              <button className="btn-ghost" onClick={()=>document.getElementById("planos")?.scrollIntoView({behavior:"smooth"})}>Ver planos</button>
            </div>
          </div>
          <ChatDemo/>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[["24h","Atendimento sem parar"],["14 dias","Teste gratuito"],["97%","Taxa de satisfação"],["R$ 0","Por mensagem enviada"]].map(([n,l])=>(
          <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>

      {/* HOW */}
      <div className="section">
        <div className="section-tag">Como funciona</div>
        <h2 className="section-title">Em 3 passos,<br/>sua clínica transformada</h2>
        <div className="steps">
          {[["💳","1. Escolha o plano","Selecione o plano e configure em menos de 10 minutos — sem conhecimento técnico.",1],
            ["⚙️","2. Personalize","Nome, tom, serviços e horários. Ela aprende tudo sobre a sua clínica.",2],
            ["✨","3. Ative e relaxe","Em até 24h sua secretária responde clientes e agenda automaticamente.",3]].map(([ic,t,d,n])=>(
            <div className="step" data-n={n} key={n}><div className="step-icon">{ic}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </div>

      {/* PLANOS */}
      <div style={{background:"var(--light)",padding:"96px 0"}} id="planos">
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Planos</div>
          <h2 className="section-title">Simples, transparente,<br/>sem surpresas</h2>
          <p className="section-sub">14 dias grátis. Sem contrato. Cancele quando quiser.</p>
          <div className="plans-grid">
            {PLANS.map(p=><PlanCard key={p.id} plan={p} onSelect={id=>setWizard(id)}/>)}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="section">
        <div className="section-tag">Depoimentos</div>
        <h2 className="section-title">Clínicas que já<br/>transformaram o atendimento</h2>
        <div className="testimonials-grid">
          {[{text:"Antes eu perdia horário toda semana. Agora a Luna agenda sozinha.",name:"Fernanda Costa",role:"Esteticista — São Paulo",init:"F"},
            {text:"Levei menos de 10 minutos para configurar. No primeiro dia vieram 3 agendamentos novos.",name:"Márcia Oliveira",role:"Bella Skin",init:"M"},
            {text:"O relatório mostrou meu serviço mais agendado. Aumentei o preço e ainda lotou.",name:"Juliana Pires",role:"Dermato Estética — Curitiba",init:"J"}].map((t,i)=>(
            <div className="testimonial" key={i}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.init}</div>
                <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{background:"var(--light)",padding:"96px 0"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Dúvidas</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <FAQ/>
        </div>
      </div>

      {/* CTA */}
      <div style={{background:"var(--charcoal)",padding:"96px 48px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",color:"#fff",marginBottom:16}}>
            Sua clínica merece uma <em style={{color:"var(--rose)"}}>secretária que nunca dorme</em>
          </h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,.55)",marginBottom:40,fontWeight:300}}>Configure em 10 minutos. 14 dias grátis.</p>
          <button className="btn-primary" style={{fontSize:17,padding:"18px 48px"}} onClick={()=>setWizard("profissional")}>
            Começar agora — grátis
          </button>
          <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:14}}>Sem cartão para testar · Cancele quando quiser</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Luna<span>.</span></div>
        <p>Secretária de IA para clínicas de estética</p>
        <p style={{marginTop:8}}>© 2026 · Todos os direitos reservados</p>
      </footer>

      {/* MODAIS */}
      {wizard&&<Wizard defaultPlan={wizard} onClose={()=>setWizard(null)} onComplete={()=>setUser({nome:"Usuária",email:""})}/>}
      {authModal==="login"&&<LoginModal onClose={()=>setAuthModal(null)} onLogin={handleLogin} onForgot={()=>setAuthModal("forgot")} onFirst={()=>setWizard("profissional")}/>}
      {authModal==="forgot"&&<ForgotModal onClose={()=>setAuthModal(null)} onBack={()=>setAuthModal("login")}/>}
    </>
  );
}
