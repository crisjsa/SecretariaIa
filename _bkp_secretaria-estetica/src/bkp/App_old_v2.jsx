import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM — Rose Gold + Charcoal
   Fonte: Playfair Display + DM Sans
────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --rose:      #C9847A;
  --rose-light:#F2D4CF;
  --rose-dark: #A05E55;
  --gold:      #D4A853;
  --charcoal:  #1C1C1E;
  --dark:      #2C2C2E;
  --mid:       #48484A;
  --muted:     #8E8E93;
  --light:     #F5F0EE;
  --white:     #FEFEFE;
  --radius:    14px;
  --shadow:    0 8px 32px rgba(28,28,30,.12);
  --shadow-lg: 0 20px 60px rgba(28,28,30,.18);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--white);
  color: var(--charcoal);
  line-height: 1.6;
  overflow-x: hidden;
}

h1,h2,h3,h4 { font-family: 'Playfair Display', serif; line-height: 1.2; }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  background: var(--charcoal);
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.hero::before {
  content:'';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(201,132,122,.18) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 20% 80%, rgba(212,168,83,.10) 0%, transparent 60%);
}
.hero-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 48px; position: relative; z-index: 2;
}
.logo { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--white); letter-spacing: -.3px; }
.logo span { color: var(--rose); }
.nav-cta {
  background: var(--rose); color: var(--white); border: none;
  padding: 10px 24px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s;
}
.nav-cta:hover { background: var(--rose-dark); transform: translateY(-1px); }

.hero-body {
  flex: 1; display: flex; align-items: center;
  padding: 40px 48px 80px; position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto; width: 100%; gap: 80px;
}
.hero-text { flex: 1; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(201,132,122,.15); border: 1px solid rgba(201,132,122,.3);
  color: var(--rose-light); padding: 6px 16px; border-radius: 100px;
  font-size: 13px; font-weight: 500; margin-bottom: 28px;
}
.hero-badge::before { content:'✦'; font-size: 10px; }
.hero-title { font-size: clamp(36px, 5vw, 64px); color: var(--white); margin-bottom: 24px; }
.hero-title em { color: var(--rose); font-style: italic; }
.hero-sub { font-size: 18px; color: rgba(255,255,255,.6); max-width: 480px; margin-bottom: 40px; font-weight: 300; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
.btn-primary {
  background: var(--rose); color: var(--white); border: none;
  padding: 16px 36px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all .25s;
  box-shadow: 0 8px 24px rgba(201,132,122,.4);
}
.btn-primary:hover { background: var(--rose-dark); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,132,122,.5); }
.btn-ghost {
  background: transparent; color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.2);
  padding: 16px 36px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
  font-size: 16px; cursor: pointer; transition: all .2s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,.5); color: var(--white); }

.hero-visual {
  flex: 0 0 360px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px; padding: 28px; backdrop-filter: blur(12px);
}
.chat-bubble {
  border-radius: 16px; padding: 12px 16px; margin-bottom: 10px;
  font-size: 14px; line-height: 1.5; max-width: 85%;
  animation: fadeUp .5s ease both;
}
.chat-bubble.bot { background: rgba(201,132,122,.18); color: var(--rose-light); margin-right: auto; border-bottom-left-radius: 4px; }
.chat-bubble.user { background: rgba(255,255,255,.1); color: rgba(255,255,255,.85); margin-left: auto; border-bottom-right-radius: 4px; }
.chat-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; font-weight: 500; }
.typing { display: flex; gap: 4px; padding: 14px 16px; background: rgba(201,132,122,.1); border-radius: 16px; width: fit-content; margin-bottom: 10px; }
.typing span { width: 6px; height: 6px; background: var(--rose); border-radius: 50%; animation: bounce .8s infinite; }
.typing span:nth-child(2) { animation-delay: .15s; }
.typing span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

/* ── CHAT SLOTS ── */
.chat-slots {
  display: flex; flex-wrap: wrap; gap: 7px;
  margin-bottom: 10px; animation: fadeUp .4s ease both;
}
.slot-btn {
  background: rgba(201,132,122,.13); border: 1px solid rgba(201,132,122,.35);
  color: var(--rose-light); border-radius: 100px; padding: 6px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.slot-btn:hover { background: rgba(201,132,122,.30); border-color: var(--rose); color: #fff; transform: translateY(-1px); }
.slot-btn.picked { background: var(--rose); border-color: var(--rose); color: #fff; }
.slot-btn:disabled { opacity: .4; cursor: default; transform: none; }

/* ── STATS BAR ── */
.stats-bar {
  background: var(--light); border-top: 1px solid rgba(0,0,0,.06);
  padding: 32px 48px; display: flex; gap: 48px; flex-wrap: wrap;
  justify-content: center;
}
.stat { text-align: center; }
.stat-num { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--rose-dark); }
.stat-label { font-size: 13px; color: var(--muted); font-weight: 500; margin-top: 2px; }

/* ── SECTION ── */
.section { padding: 96px 48px; max-width: 1200px; margin: 0 auto; }
.section-tag { font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--rose); margin-bottom: 12px; }
.section-title { font-size: clamp(28px, 4vw, 48px); color: var(--charcoal); margin-bottom: 16px; }
.section-sub { font-size: 17px; color: var(--muted); max-width: 560px; font-weight: 300; }

/* ── HOW IT WORKS ── */
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-top: 56px; }
.step {
  background: var(--white); border: 1px solid rgba(0,0,0,.07);
  border-radius: var(--radius); padding: 32px 28px;
  transition: all .25s; position: relative; overflow: hidden;
}
.step::before {
  content: attr(data-n);
  position: absolute; top: -12px; right: 16px;
  font-family: 'Playfair Display', serif; font-size: 80px;
  color: rgba(201,132,122,.08); line-height: 1; pointer-events: none;
}
.step:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--rose-light); }
.step-icon { font-size: 28px; margin-bottom: 16px; }
.step h3 { font-size: 18px; margin-bottom: 8px; color: var(--charcoal); }
.step p { font-size: 14px; color: var(--muted); line-height: 1.6; }

/* ── PLANOS ── */
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 56px; }
.plan-card {
  border-radius: 20px; padding: 36px 32px; position: relative;
  transition: all .3s; cursor: pointer;
}
.plan-card.basic { background: var(--white); border: 2px solid rgba(0,0,0,.08); }
.plan-card.pro   { background: var(--charcoal); border: 2px solid transparent; color: var(--white); }
.plan-card.premium {
  background: linear-gradient(135deg, var(--rose-dark), var(--rose));
  border: 2px solid transparent; color: var(--white);
}
.plan-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.plan-card.pro:hover { box-shadow: 0 20px 60px rgba(28,28,30,.4); }
.plan-badge {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 20px;
}
.plan-card.basic .plan-badge   { background: var(--light); color: var(--muted); }
.plan-card.pro   .plan-badge   { background: rgba(255,255,255,.12); color: rgba(255,255,255,.7); }
.plan-card.premium .plan-badge { background: rgba(255,255,255,.25); color: var(--white); }
.plan-popular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--gold); color: var(--charcoal); font-size: 11px; font-weight: 700;
  padding: 4px 16px; border-radius: 100px; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap;
}
.plan-price { font-family: 'Playfair Display', serif; font-size: 52px; line-height: 1; margin-bottom: 4px; }
.plan-price span { font-size: 18px; font-family: 'DM Sans', sans-serif; font-weight: 400; vertical-align: top; margin-top: 10px; display: inline-block; }
.plan-period { font-size: 13px; opacity: .6; margin-bottom: 24px; }
.plan-name { font-size: 22px; margin-bottom: 8px; }
.plan-desc { font-size: 14px; opacity: .7; margin-bottom: 28px; line-height: 1.5; }
.plan-features { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
.plan-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.plan-features li::before { content: '✓'; font-weight: 700; flex-shrink: 0; }
.plan-card.basic .plan-features li::before { color: var(--rose); }
.plan-features li.off { opacity: .35; }
.plan-features li.off::before { content: '–'; }
.plan-btn {
  width: 100%; padding: 14px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; border: none;
}
.plan-card.basic   .plan-btn { background: var(--charcoal); color: var(--white); }
.plan-card.pro     .plan-btn { background: var(--white); color: var(--charcoal); }
.plan-card.premium .plan-btn { background: rgba(255,255,255,.25); color: var(--white); border: 1px solid rgba(255,255,255,.4); }
.plan-btn:hover { opacity: .88; transform: scale(.98); }

/* ── TESTIMONIALS ── */
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 56px; }
.testimonial {
  background: var(--white); border: 1px solid rgba(0,0,0,.07);
  border-radius: var(--radius); padding: 28px;
}
.testimonial-stars { color: var(--gold); font-size: 14px; margin-bottom: 12px; }
.testimonial-text { font-size: 15px; color: var(--mid); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-light), var(--rose));
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--white); font-weight: 600; flex-shrink: 0;
}
.testimonial-name { font-size: 14px; font-weight: 600; color: var(--charcoal); }
.testimonial-role { font-size: 12px; color: var(--muted); }

/* ── FAQ ── */
.faq-list { margin-top: 48px; display: flex; flex-direction: column; gap: 4px; }
.faq-item { border: 1px solid rgba(0,0,0,.08); border-radius: var(--radius); overflow: hidden; }
.faq-q {
  width: 100%; background: var(--white); border: none; padding: 20px 24px;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
  color: var(--charcoal); cursor: pointer; text-align: left; transition: background .2s;
}
.faq-q:hover { background: var(--light); }
.faq-q .arrow { font-size: 18px; transition: transform .25s; flex-shrink: 0; margin-left: 16px; color: var(--rose); }
.faq-q.open .arrow { transform: rotate(45deg); }
.faq-a { padding: 0 24px; max-height: 0; overflow: hidden; transition: max-height .3s ease, padding .3s ease; font-size: 14px; color: var(--muted); line-height: 1.8; }
.faq-a.open { max-height: 200px; padding: 0 24px 20px; }

/* ── FOOTER ── */
footer {
  background: var(--charcoal); color: rgba(255,255,255,.5);
  padding: 48px; text-align: center; font-size: 13px;
}
footer .footer-logo { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--white); margin-bottom: 8px; }
footer .footer-logo span { color: var(--rose); }

/* ── WIZARD OVERLAY ── */
.wizard-overlay {
  position: fixed; inset: 0; background: rgba(28,28,30,.85);
  backdrop-filter: blur(8px); z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: fadeIn .25s ease;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.wizard {
  background: var(--white); border-radius: 24px; width: 100%; max-width: 640px;
  max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
  animation: slideUp .3s ease;
}
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.wizard-header {
  padding: 28px 32px 0;
  display: flex; align-items: center; justify-content: space-between;
}
.wizard-close {
  background: var(--light); border: none; width: 36px; height: 36px;
  border-radius: 50%; cursor: pointer; font-size: 18px; color: var(--muted);
  display: flex; align-items: center; justify-content: center; transition: all .2s; flex-shrink: 0;
}
.wizard-close:hover { background: var(--rose-light); color: var(--rose-dark); }
.wizard-steps-bar { display: flex; gap: 6px; padding: 20px 32px 0; }
.wizard-step-dot {
  flex: 1; height: 4px; border-radius: 100px;
  background: var(--light); transition: background .3s;
}
.wizard-step-dot.done { background: var(--rose); }
.wizard-step-dot.active { background: var(--rose-light); }
.wizard-body { padding: 28px 32px 32px; }
.wizard-step-label { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--rose); margin-bottom: 8px; }
.wizard-title { font-size: 26px; color: var(--charcoal); margin-bottom: 6px; }
.wizard-subtitle { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

/* ── FORM ELEMENTS ── */
.field { margin-bottom: 18px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: var(--mid); margin-bottom: 6px; letter-spacing: .3px; }
.field input, .field select, .field textarea {
  width: 100%; padding: 12px 16px; border: 1.5px solid rgba(0,0,0,.12);
  border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px;
  color: var(--charcoal); background: var(--white); transition: border-color .2s;
  outline: none;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--rose); }
.field input.error, .field select.error { border-color: #e74c3c; }
.field textarea { resize: vertical; min-height: 80px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-hint { font-size: 12px; color: var(--muted); margin-top: 5px; }

/* ── PLAN MINI CARDS ── */
.plan-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.plan-mini {
  border: 2px solid rgba(0,0,0,.1); border-radius: 14px; padding: 16px 12px;
  cursor: pointer; transition: all .2s; text-align: center;
}
.plan-mini:hover { border-color: var(--rose-light); }
.plan-mini.selected { border-color: var(--rose); background: rgba(201,132,122,.06); }
.plan-mini .pm-name { font-size: 13px; font-weight: 600; color: var(--charcoal); margin-bottom: 4px; }
.plan-mini .pm-price { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--rose-dark); }
.plan-mini .pm-price span { font-size: 12px; font-family: 'DM Sans', sans-serif; }

/* ── SERVICES LIST ── */
.service-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.service-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  background: var(--light); border-radius: 10px; border: 1.5px solid transparent;
}
.service-item input[type=text], .service-item input[type=number] {
  border: none; background: transparent; padding: 0; font-size: 14px; width: auto; flex: 1;
}
.service-item input[type=number] { width: 80px; text-align: right; flex: 0 0 auto; }
.service-item .remove-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 16px; padding: 0 4px; transition: color .2s; flex-shrink: 0;
}
.service-item .remove-btn:hover { color: #e74c3c; }
.add-service-btn {
  width: 100%; padding: 10px; border: 1.5px dashed rgba(0,0,0,.18);
  border-radius: 10px; background: transparent; font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: var(--muted); cursor: pointer; transition: all .2s;
}
.add-service-btn:hover { border-color: var(--rose); color: var(--rose); }

/* ── ASSISTANT PREVIEW ── */
.assistant-preview {
  background: var(--charcoal); border-radius: 16px; padding: 20px;
  margin-bottom: 24px;
}
.assistant-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.assistant-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-light), var(--rose));
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.assistant-name { font-size: 15px; font-weight: 600; color: var(--white); }
.assistant-status { font-size: 12px; color: var(--rose-light); display: flex; align-items: center; gap: 4px; }
.assistant-status::before { content:''; width:7px; height:7px; background:#4cd964; border-radius:50%; }
.preview-bubble {
  background: rgba(255,255,255,.08); border-radius: 12px 12px 12px 2px;
  padding: 12px 14px; font-size: 13px; color: rgba(255,255,255,.85); line-height: 1.6;
}

/* ── SCHEDULE GRID ── */
.schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 8px; }
.day-btn {
  padding: 8px 4px; border: 1.5px solid rgba(0,0,0,.12); border-radius: 8px;
  background: var(--white); font-family: 'DM Sans', sans-serif; font-size: 12px;
  font-weight: 500; cursor: pointer; transition: all .2s; text-align: center; color: var(--mid);
}
.day-btn.active { background: var(--rose); border-color: var(--rose); color: var(--white); }
.time-range { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; margin-top: 10px; }
.time-range span { text-align: center; font-size: 13px; color: var(--muted); }

/* ── SUCCESS ── */
.success-screen { text-align: center; padding: 16px 0; }
.success-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-light), var(--rose));
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; margin: 0 auto 20px;
}
.success-title { font-size: 28px; color: var(--charcoal); margin-bottom: 8px; }
.success-sub { font-size: 15px; color: var(--muted); margin-bottom: 28px; }
.next-steps { background: var(--light); border-radius: 14px; padding: 20px 24px; text-align: left; }
.next-steps h4 { font-size: 14px; font-weight: 600; margin-bottom: 14px; color: var(--charcoal); }
.next-step-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; color: var(--mid); }
.step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--rose); color: var(--white); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

/* ── WIZARD FOOTER ── */
.wizard-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 20px; border-top: 1px solid rgba(0,0,0,.07); margin-top: 8px;
}
.btn-back {
  background: var(--light); border: none; padding: 12px 24px; border-radius: 100px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; color: var(--mid); transition: all .2s;
}
.btn-back:hover { background: rgba(0,0,0,.08); }
.btn-next {
  background: var(--charcoal); color: var(--white); border: none;
  padding: 12px 32px; border-radius: 100px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.btn-next:hover { background: var(--rose-dark); }
.btn-next.primary { background: var(--rose); box-shadow: 0 6px 20px rgba(201,132,122,.35); }
.btn-next.primary:hover { background: var(--rose-dark); }
.btn-next:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .hero-nav { padding: 20px 24px; }
  .hero-body { flex-direction: column; padding: 24px 24px 60px; gap: 40px; }
  .hero-visual { flex: none; width: 100%; }
  .stats-bar { padding: 28px 24px; gap: 32px; }
  .section { padding: 64px 24px; }
  .plan-mini-grid { grid-template-columns: repeat(3,1fr); }
  .wizard { border-radius: 20px; }
  .wizard-body { padding: 20px 24px 24px; }
  .wizard-header { padding: 22px 24px 0; }
  .wizard-steps-bar { padding: 16px 24px 0; }
  .field-row { grid-template-columns: 1fr; }
  .schedule-grid { grid-template-columns: repeat(4,1fr); }
}
`;

/* ─────────────────────────────────────────────
   DATA
────────────────────────────────────────────── */
const PLANS = [
  {
    id: "basico", slug: "basic", label: "Básico", price: 97,
    desc: "Para começar com o essencial e já transformar o atendimento.",
    badge: "Starter",
    features: [
      { text: "Atendimento 24h pelo WhatsApp", on: true },
      { text: "Agendamento automático", on: true },
      { text: "Lembrete 24h antes", on: true },
      { text: "Escalada para humano", on: true },
      { text: "Lembrete 2h antes", on: false },
      { text: "Pós-atendimento automático", on: false },
      { text: "Relatório mensal", on: false },
    ]
  },
  {
    id: "profissional", slug: "pro", label: "Profissional", price: 197,
    desc: "A escolha de quem quer profissionalismo e nunca perder um horário.",
    badge: "Mais Popular", popular: true,
    features: [
      { text: "Tudo do Básico", on: true },
      { text: "Verificação de disponibilidade", on: true },
      { text: "Lembrete 2h antes", on: true },
      { text: "Pós-atendimento automático", on: true },
      { text: "Prompt personalizado", on: true },
      { text: "Suporte via WhatsApp", on: true },
      { text: "Relatório mensal", on: false },
    ]
  },
  {
    id: "premium", slug: "premium", label: "Premium", price: 347,
    desc: "Gestão completa: sua clínica atendida, organizada e em crescimento.",
    badge: "Completo",
    features: [
      { text: "Tudo do Profissional", on: true },
      { text: "Relatório mensal automático", on: true },
      { text: "Campanhas de reativação", on: true },
      { text: "Até 2 números de WhatsApp", on: true },
      { text: "Onboarding assistido", on: true },
      { text: "Suporte prioritário", on: true },
    ]
  }
];

const FAQS = [
  { q: "Preciso de conhecimento técnico para configurar?", a: "Não! Nosso assistente de configuração guia você passo a passo em menos de 10 minutos. Você preenche as informações da sua clínica e nossa equipe faz o restante." },
  { q: "Quanto tempo leva para a secretária estar funcionando?", a: "Após a configuração, sua secretária fica ativa em até 24 horas úteis. No plano Premium, incluímos uma sessão de onboarding ao vivo para garantir que tudo esteja perfeito." },
  { q: "O WhatsApp da clínica precisa ficar conectado no celular?", a: "Sim, o número precisa ter o WhatsApp ativo. Funciona com seu número atual — não é necessário um número novo. Recomendamos usar um número exclusivo para a clínica." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multa ou fidelidade. Você pode cancelar a qualquer momento pelo painel ou entrando em contato com nossa equipe." },
  { q: "A IA entende mensagens de voz?", a: "No momento a secretária responde mensagens de texto. Áudios são transcritos automaticamente e respondidos em texto. Suporte a respostas em áudio está no nosso roadmap." },
  { q: "Funciona para mais de uma profissional?", a: "Sim! Você pode adicionar múltiplas profissionais e a IA gerencia os horários de cada uma separadamente." },
];

const DEFAULT_SERVICES = [
  { id: 1, name: "Limpeza de pele", price: "180", duration: "60" },
  { id: 2, name: "Design de sobrancelha", price: "80", duration: "30" },
];

const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

/* ─────────────────────────────────────────────
   CHAT DEMO — fluxo original + slots após "Quarta de manhã"
────────────────────────────────────────────── */
const MORNING_SLOTS = [
  { id: "0800", label: "08:00" },
  { id: "1000", label: "10:00" },
  { id: "1100", label: "11:00" },
];

// type: "bot" | "user" | "slots" | "confirm"
const SCRIPT = [
  { id: 0, type: "bot",  text: "Olá! 💆‍♀️ Bem-vinda à Clínica Bella. Sou a Luna, sua assistente. Como posso te ajudar hoje?" },
  { id: 1, type: "user", text: "Oi! Quero agendar uma limpeza de pele" },
  { id: 2, type: "bot",  text: "Perfeito! Tenho horários disponíveis essa semana. Você prefere manhã ou tarde? ☀️" },
  { id: 3, type: "user", text: "Quarta de manhã se tiver" },
  { id: 4, type: "bot",  text: "Ótimo! Esses são os horários disponíveis na quarta de manhã 👇" },
  { id: 5, type: "slots" },   // ← botões aparecem aqui, fluxo para até clicar
  { id: 6, type: "confirm" }, // ← preenchido dinamicamente com o horário escolhido
];

function ChatDemo() {
  const [phase, setPhase]   = useState(0);
  const [typing, setTyping] = useState(false);
  const [chosen, setChosen] = useState(null); // id do slot escolhido
  const [msgs, setMsgs]     = useState([SCRIPT[0]]);
  const bottomRef           = useRef(null);

  // Avança o script automaticamente
  useEffect(() => {
    const next = phase + 1;
    if (next >= SCRIPT.length) return;
    const item = SCRIPT[next];

    // Slots e confirm só avançam por ação do usuário
    if (item.type === "slots" || item.type === "confirm") return;

    const delay = item.type === "bot" ? 1000 : 650;
    setTyping(item.type === "bot");
    const t1 = setTimeout(() => setTyping(false), delay - 200);
    const t2 = setTimeout(() => {
      setMsgs(m => [...m, item]);
      setPhase(next);
    }, delay + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // Quando chega na fase dos slots, exibe-os
  useEffect(() => {
    if (phase === 4) {
      // fase 4 = após a bot dizer "esses são os horários"
      // mostramos os slots logo após
      const t = setTimeout(() => {
        setMsgs(m => [...m, SCRIPT[5]]);
        setPhase(5);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, typing]);

  // Clique num slot
  const pickSlot = (slot) => {
    if (chosen) return;
    setChosen(slot.id);

    // Mensagem do "usuário"
    setTimeout(() => {
      setMsgs(m => [...m, { id: "u_slot", type: "user", text: slot.label }]);
    }, 300);

    // Luna digita...
    setTimeout(() => setTyping(true), 700);

    // Confirmação da Luna
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, {
        id: "confirm",
        type: "bot",
        text: `✅ Agendado! Quarta às ${slot.label} — Limpeza de pele (60min). Vou te lembrar na véspera. Até lá! ✨`
      }]);
      setPhase(6);
    }, 2000);
  };

  return (
    <div className="hero-visual" style={{maxHeight:480, display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{marginBottom:14, display:"flex", alignItems:"center", gap:10, flexShrink:0}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#F2D4CF,#C9847A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💆‍♀️</div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>Luna — Secretária IA</div>
          <div style={{fontSize:11,color:"#C9847A",display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,background:"#4cd964",borderRadius:"50%",display:"inline-block"}}/>
            Online agora
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div style={{overflowY:"auto", flex:1, paddingRight:2}}>
        {msgs.map((m, i) => {
          // Renderiza os botões de horário
          if (m.type === "slots") return (
            <div key="slots" style={{marginBottom:10, animation:"fadeUp .4s ease both"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:7}}>Luna</div>
              <div className="chat-slots">
                {MORNING_SLOTS.map(s => (
                  <button
                    key={s.id}
                    className={`slot-btn${chosen === s.id ? " picked" : ""}`}
                    onClick={() => pickSlot(s)}
                    disabled={!!chosen && chosen !== s.id}
                  >
                    🕐 {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
          return (
            <div key={m.id ?? i}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:3,textAlign:m.type==="user"?"right":"left"}}>
                {m.type==="user" ? "Você" : "Luna"}
              </div>
              <div className={`chat-bubble ${m.type}`} style={{animationDelay:`${i*.04}s`}}>
                {m.text}
              </div>
            </div>
          );
        })}
        {typing && <div className="typing"><span/><span/><span/></div>}
        <div ref={bottomRef}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WIZARD STEPS
────────────────────────────────────────────── */
const TOTAL_STEPS = 6;

function StepPlan({ data, setData }) {
  return (
    <div>
      <div className="plan-mini-grid">
        {PLANS.map(p => (
          <div key={p.id} className={`plan-mini${data.plan === p.id ? " selected" : ""}`} onClick={() => setData(d => ({ ...d, plan: p.id }))}>
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

function StepClinic({ data, setData, errors }) {
  return (
    <div>
      <div className="field">
        <label>Nome da clínica *</label>
        <input type="text" className={errors.nome ? "error":""} placeholder="Ex: Clínica Bella Estética" value={data.nome} onChange={e => setData(d => ({ ...d, nome: e.target.value }))} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>WhatsApp da clínica *</label>
          <input type="text" className={errors.whatsapp?"error":""} placeholder="(11) 99999-9999" value={data.whatsapp} onChange={e => setData(d => ({ ...d, whatsapp: e.target.value }))} />
        </div>
        <div className="field">
          <label>Cidade</label>
          <input type="text" placeholder="São Paulo, SP" value={data.cidade} onChange={e => setData(d => ({ ...d, cidade: e.target.value }))} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nome da responsável *</label>
          <input type="text" className={errors.responsavel?"error":""} placeholder="Seu nome completo" value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))} />
        </div>
        <div className="field">
          <label>E-mail *</label>
          <input type="email" className={errors.email?"error":""} placeholder="seu@email.com" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}

function StepAssistant({ data, setData }) {
  const preview = `Olá! ${data.emoji || "✨"} Bem-vinda à ${data.clinicNome || "sua clínica"}! Sou ${data.nome || "Luna"}, sua assistente virtual. Como posso te ajudar hoje?`;
  return (
    <div>
      <div className="assistant-preview">
        <div className="assistant-header">
          <div className="assistant-avatar">{data.emoji || "💆‍♀️"}</div>
          <div>
            <div className="assistant-name">{data.nome || "Luna"}</div>
            <div className="assistant-status">Online agora</div>
          </div>
        </div>
        <div className="preview-bubble">{preview}</div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nome da assistente</label>
          <input type="text" placeholder="Ex: Luna, Sofia, Bella..." value={data.nome} onChange={e => setData(d => ({ ...d, nome: e.target.value }))} />
        </div>
        <div className="field">
          <label>Emoji da assistente</label>
          <input type="text" placeholder="💆‍♀️" value={data.emoji} onChange={e => setData(d => ({ ...d, emoji: e.target.value }))} />
        </div>
      </div>
      <div className="field">
        <label>Tom de atendimento</label>
        <select value={data.tom} onChange={e => setData(d => ({ ...d, tom: e.target.value }))}>
          <option value="amigavel">Amigável e descontraído 😊</option>
          <option value="profissional">Profissional e elegante 💼</option>
          <option value="carinhoso">Carinhoso e próximo 💕</option>
          <option value="objetivo">Direto e objetivo ⚡</option>
        </select>
      </div>
      <div className="field">
        <label>Mensagem de boas-vindas personalizada</label>
        <textarea placeholder="Deixe em branco para usar a padrão..." value={data.welcome} onChange={e => setData(d => ({ ...d, welcome: e.target.value }))} />
        <div className="field-hint">A assistente usará esse texto ao iniciar uma nova conversa.</div>
      </div>
    </div>
  );
}

function StepServices({ data, setData }) {
  const add = () => setData(d => ({ ...d, services: [...d.services, { id: Date.now(), name: "", price: "", duration: "60" }] }));
  const remove = (id) => setData(d => ({ ...d, services: d.services.filter(s => s.id !== id) }));
  const update = (id, field, val) => setData(d => ({ ...d, services: d.services.map(s => s.id === id ? { ...s, [field]: val } : s) }));
  return (
    <div>
      <div className="service-list">
        {data.services.map(s => (
          <div key={s.id} className="service-item">
            <span style={{fontSize:16}}>✦</span>
            <input type="text" placeholder="Nome do serviço" value={s.name} onChange={e => update(s.id,"name",e.target.value)} />
            <span style={{fontSize:12,color:"var(--muted)",marginRight:2}}>R$</span>
            <input type="number" placeholder="0" value={s.price} onChange={e => update(s.id,"price",e.target.value)} />
            <input type="number" placeholder="min" value={s.duration} onChange={e => update(s.id,"duration",e.target.value)} style={{width:55}} />
            <button className="remove-btn" onClick={() => remove(s.id)}>✕</button>
          </div>
        ))}
      </div>
      <button className="add-service-btn" onClick={add}>+ Adicionar serviço</button>
      <div style={{marginTop:10,fontSize:12,color:"var(--muted)"}}>Os valores e duração serão informados automaticamente pela assistente nas conversas.</div>
    </div>
  );
}

function StepSchedule({ data, setData }) {
  const toggle = (d) => setData(prev => ({
    ...prev,
    days: prev.days.includes(d) ? prev.days.filter(x=>x!==d) : [...prev.days, d]
  }));
  return (
    <div>
      <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:10}}>Dias de atendimento</div>
      <div className="schedule-grid">
        {DAYS.map((d,i) => (
          <button key={d} className={`day-btn${data.days.includes(i)?" active":""}`} onClick={() => toggle(i)}>{d}</button>
        ))}
      </div>
      <div className="time-range">
        <div className="field" style={{margin:0}}>
          <label>Abertura</label>
          <input type="time" value={data.open} onChange={e=>setData(d=>({...d,open:e.target.value}))} />
        </div>
        <span style={{paddingTop:20}}>→</span>
        <div className="field" style={{margin:0}}>
          <label>Fechamento</label>
          <input type="time" value={data.close} onChange={e=>setData(d=>({...d,close:e.target.value}))} />
        </div>
      </div>
      <div className="field" style={{marginTop:18}}>
        <label>Intervalo entre agendamentos</label>
        <select value={data.interval} onChange={e=>setData(d=>({...d,interval:e.target.value}))}>
          <option value="15">15 minutos</option>
          <option value="30">30 minutos</option>
          <option value="60">1 hora</option>
          <option value="90">1h30</option>
        </select>
      </div>
      <div className="field">
        <label>Telefone para escalada (humano)</label>
        <input type="text" placeholder="(11) 99999-9999 — recebe alertas quando a IA não sabe responder" value={data.escalada} onChange={e=>setData(d=>({...d,escalada:e.target.value}))} />
        <div className="field-hint">Você será notificado por WhatsApp quando um cliente precisar de atendimento humano.</div>
      </div>
    </div>
  );
}

function StepSuccess({ clinicData, assistantData, planData }) {
  const plan = PLANS.find(p => p.id === planData.plan);
  return (
    <div className="success-screen">
      <div className="success-icon">🎉</div>
      <h2 className="success-title">Tudo pronto!</h2>
      <p className="success-sub">
        A <strong>{clinicData.nome || "sua clínica"}</strong> está configurada.<br/>
        Sua secretária <strong>{assistantData.nome || "Luna"}</strong> entra em ação em até 24h.
      </p>
      <div style={{background:"linear-gradient(135deg,var(--rose-light),#fff)",borderRadius:14,padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontSize:13,color:"var(--mid)",marginBottom:4}}>Plano contratado</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--charcoal)"}}>{plan?.label}</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"var(--rose-dark)"}}>R$ {plan?.price}<span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>/mês</span></span>
        </div>
      </div>
      <div className="next-steps">
        <h4>Próximos passos</h4>
        {[
          "Você receberá um e-mail com as instruções de conexão do WhatsApp",
          "Nossa equipe fará a configuração técnica em até 24h",
          "Você testará a assistente e aprovará antes de ir ao ar",
          plan?.id === "premium" ? "Agendaremos uma sessão de onboarding ao vivo com você" : null
        ].filter(Boolean).map((s, i) => (
          <div key={i} className="next-step-item">
            <div className="step-num">{i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN WIZARD COMPONENT
────────────────────────────────────────────── */
function Wizard({ defaultPlan, onClose }) {
  const [step, setStep] = useState(1);
  const [planData,      setPlanData]      = useState({ plan: defaultPlan || "profissional" });
  const [clinicData,    setClinicData]    = useState({ nome:"", whatsapp:"", cidade:"", responsavel:"", email:"" });
  const [assistantData, setAssistantData] = useState({ nome:"Luna", emoji:"💆‍♀️", tom:"amigavel", welcome:"", clinicNome:"" });
  const [servicesData,  setServicesData]  = useState({ services: DEFAULT_SERVICES });
  const [scheduleData,  setScheduleData]  = useState({ days:[1,2,3,4,5], open:"09:00", close:"19:00", interval:"30", escalada:"" });
  const [errors, setErrors] = useState({});

  // Sync clinic name into assistant preview
  useEffect(() => {
    setAssistantData(d => ({ ...d, clinicNome: clinicData.nome }));
  }, [clinicData.nome]);

  const validate = () => {
    const e = {};
    if (step === 2) {
      if (!clinicData.nome)       e.nome = true;
      if (!clinicData.whatsapp)   e.whatsapp = true;
      if (!clinicData.responsavel)e.responsavel = true;
      if (!clinicData.email || !clinicData.email.includes("@")) e.email = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const STEP_META = [
    { label: "Plano", title: "Escolha seu plano", subtitle: "Você pode mudar a qualquer momento, sem multa." },
    { label: "Clínica", title: "Dados da clínica", subtitle: "Informações que sua assistente usará no atendimento." },
    { label: "Assistente", title: "Personalize sua assistente", subtitle: "Dê nome, personalidade e voz à sua secretária." },
    { label: "Serviços", title: "Seus serviços", subtitle: "A IA informará preços e durações automaticamente." },
    { label: "Agenda", title: "Horários de atendimento", subtitle: "Quando sua clínica recebe agendamentos?" },
    { label: "Pronto!", title: "Configuração concluída", subtitle: "" },
  ];
  const meta = STEP_META[step - 1];
  const isLast = step === TOTAL_STEPS;

  return (
    <div className="wizard-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wizard">
        <div className="wizard-header">
          <div className="logo">Luna<span>.</span></div>
          <button className="wizard-close" onClick={onClose}>✕</button>
        </div>
        <div className="wizard-steps-bar">
          {Array.from({length: TOTAL_STEPS}).map((_,i) => (
            <div key={i} className={`wizard-step-dot${i+1<step?" done":i+1===step?" active":""}`} />
          ))}
        </div>
        <div className="wizard-body">
          <div className="wizard-step-label">Passo {step} de {TOTAL_STEPS} — {meta.label}</div>
          <h2 className="wizard-title">{meta.title}</h2>
          {meta.subtitle && <p className="wizard-subtitle">{meta.subtitle}</p>}

          {step === 1 && <StepPlan data={planData} setData={setPlanData} />}
          {step === 2 && <StepClinic data={clinicData} setData={setClinicData} errors={errors} />}
          {step === 3 && <StepAssistant data={assistantData} setData={setAssistantData} />}
          {step === 4 && <StepServices data={servicesData} setData={setServicesData} />}
          {step === 5 && <StepSchedule data={scheduleData} setData={setScheduleData} />}
          {step === 6 && <StepSuccess clinicData={clinicData} assistantData={assistantData} planData={planData} />}

          {!isLast && (
            <div className="wizard-footer">
              {step > 1
                ? <button className="btn-back" onClick={back}>← Voltar</button>
                : <div />
              }
              <button className={`btn-next${step >= 5?" primary":""}`} onClick={next}>
                {step === 5 ? "✦ Finalizar configuração" : "Continuar →"}
              </button>
            </div>
          )}
          {isLast && (
            <div className="wizard-footer" style={{justifyContent:"center"}}>
              <button className="btn-next primary" onClick={onClose} style={{padding:"14px 48px"}}>
                Ir para o painel ✦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LANDING PAGE SECTIONS
────────────────────────────────────────────── */
function PlanCard({ plan, onSelect }) {
  return (
    <div className={`plan-card ${plan.slug}`}>
      {plan.popular && <div className="plan-popular">⭐ Mais escolhido</div>}
      <div className="plan-badge">{plan.badge}</div>
      <div className="plan-name">{plan.label}</div>
      <div className="plan-price"><span>R$</span>{plan.price}</div>
      <div className="plan-period">por mês • cancele quando quiser</div>
      <div className="plan-desc">{plan.desc}</div>
      <ul className="plan-features">
        {plan.features.map((f,i) => (
          <li key={i} className={f.on ? "" : "off"}>{f.text}</li>
        ))}
      </ul>
      <button className="plan-btn" onClick={() => onSelect(plan.id)}>
        Começar agora →
      </button>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {FAQS.map((f, i) => (
        <div key={i} className="faq-item">
          <button className={`faq-q${open===i?" open":""}`} onClick={() => setOpen(open===i?null:i)}>
            {f.q}
            <span className="arrow">+</span>
          </button>
          <div className={`faq-a${open===i?" open":""}`}>{f.a}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP
────────────────────────────────────────────── */
export default function App() {
  const [wizard, setWizard] = useState(null); // null | planId

  return (
    <>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <nav className="hero-nav">
          <div className="logo">Luna<span>.</span></div>
          <button className="nav-cta" onClick={() => setWizard("profissional")}>Começar grátis</button>
        </nav>
        <div className="hero-body">
          <div className="hero-text">
            <div className="hero-badge">Secretária de IA para estética</div>
            <h1 className="hero-title">Sua clínica<br/><em>atendendo 24h</em><br/>sem você</h1>
            <p className="hero-sub">A assistente virtual que agenda, lembra, responde dúvidas e nunca deixa uma cliente sem resposta — enquanto você foca no que sabe fazer.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setWizard("profissional")}>Configurar minha secretária</button>
              <button className="btn-ghost" onClick={() => document.getElementById("planos").scrollIntoView({behavior:"smooth"})}>Ver planos</button>
            </div>
          </div>
          <ChatDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-bar">
        {[["24h","Atendimento sem parar"],["2 min","Para configurar"],["97%","Taxa de satisfação"],["R$ 0","Por mensagem enviada"]].map(([n,l])=>(
          <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="section">
        <div className="section-tag">Como funciona</div>
        <h2 className="section-title">Em 3 passos,<br/>sua clínica transformada</h2>
        <div className="steps">
          {[
            ["💳","1. Escolha o plano","Selecione o plano ideal e configure sua secretária em menos de 10 minutos — sem conhecimento técnico.",1],
            ["⚙️","2. Personalize","Defina o nome, tom, serviços e horários da sua assistente. Ela aprende tudo sobre a sua clínica.",2],
            ["✨","3. Ative e relaxe","Em até 24h sua secretária está respondendo clientes, agendando e enviando lembretes automaticamente.",3],
          ].map(([icon,title,desc,n])=>(
            <div className="step" data-n={n} key={n}>
              <div className="step-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLANOS ── */}
      <div style={{background:"var(--light)",padding:"96px 0"}} id="planos">
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Planos</div>
          <h2 className="section-title">Simples, transparente,<br/>sem surpresas</h2>
          <p className="section-sub">Sem taxa de setup. Sem contrato. Cancele quando quiser.</p>
          <div className="plans-grid">
            {PLANS.map(p => <PlanCard key={p.id} plan={p} onSelect={id => setWizard(id)} />)}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="section">
        <div className="section-tag">Depoimentos</div>
        <h2 className="section-title">Clínicas que já<br/>transformaram o atendimento</h2>
        <div className="testimonials-grid">
          {[
            { text: "Antes eu perdia horário toda semana porque não conseguia responder no WhatsApp rápido. Agora a Luna agenda sozinha e eu só chego e atendo.", name: "Fernanda Costa", role: "Esteticista — São Paulo", init: "F" },
            { text: "Achei que seria complicado configurar, mas levei menos de 10 minutos. No primeiro dia já vieram 3 agendamentos novos que eu teria perdido.", name: "Márcia Oliveira", role: "Proprietária — Bella Skin", init: "M" },
            { text: "O relatório mensal me mostrou que minha limpeza de pele é o serviço mais agendado. Aumentei o preço e ainda lotou. Dados que eu nunca tinha antes.", name: "Juliana Pires", role: "Dermato Estética — Curitiba", init: "J" },
          ].map((t,i)=>(
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

      {/* ── FAQ ── */}
      <div style={{background:"var(--light)",padding:"96px 0"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 48px"}}>
          <div className="section-tag">Dúvidas</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <FAQ />
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{background:"var(--charcoal)",padding:"96px 48px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",color:"#fff",marginBottom:16}}>
            Sua clínica merece uma <em style={{color:"var(--rose)"}}>secretária que nunca dorme</em>
          </h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,.55)",marginBottom:40,fontWeight:300}}>Configure em 10 minutos. Sem técnico, sem complicação.</p>
          <button className="btn-primary" style={{fontSize:17,padding:"18px 48px"}} onClick={() => setWizard("profissional")}>
            Começar agora — grátis por 7 dias
          </button>
          <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:14}}>Sem cartão de crédito para testar • Cancele quando quiser</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">Luna<span>.</span></div>
        <p>Secretária de IA para clínicas de estética</p>
        <p style={{marginTop:8}}>© 2026 • Todos os direitos reservados</p>
      </footer>

      {/* ── WIZARD ── */}
      {wizard && <Wizard defaultPlan={wizard} onClose={() => setWizard(null)} />}
    </>
  );
}
