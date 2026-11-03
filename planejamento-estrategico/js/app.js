/* Motor comum do site: salvar, progresso, imprimir, WhatsApp, backup, listas, cronômetros */
(function () {
  'use strict';
  var PFX = 'pe:';
  var S = null, mem = {};
  try { S = window.localStorage; S.setItem(PFX + '_t', '1'); S.removeItem(PFX + '_t'); } catch (e) { S = null; }

  function rawGet(k) { if (S) { try { var v = S.getItem(PFX + k); return v; } catch (e) {} } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }
  function rawSet(k, v) { if (S) { try { S.setItem(PFX + k, v); return; } catch (e) {} } mem[k] = v; }
  function rawDel(k) { if (S) { try { S.removeItem(PFX + k); } catch (e) {} } delete mem[k]; }
  function rawKeys() {
    var out = [], i;
    if (S) { try { for (i = 0; i < S.length; i++) { var k = S.key(i); if (k && k.indexOf(PFX) === 0) out.push(k.slice(PFX.length)); } return out; } catch (e) {} }
    for (var m in mem) out.push(m);
    return out;
  }

  var body = document.body;
  var PE = window.PE = {};
  PE.page = body.getAttribute('data-page') || '';
  PE.base = body.getAttribute('data-base') || '';
  PE.cfg = {};
  var ouvintes = [];

  /* ---------- páginas do site ---------- */
  PE.PAGES = [
    { id: 'diag', t: 1, f: 'trilha1/00-autoavaliacao.html', ic: '📝', nome: 'Autoavaliação diagnóstica', desc: 'Teste inicial dos seus conhecimentos (com gabarito).', cor: 'verde' },
    { id: 'exp', t: 1, f: 'trilha1/01-expectativas.html', ic: '🙋', nome: 'Expectativas', desc: 'O que espero destes encontros e o que quero aprender.', cor: 'azul' },
    { id: 'placar', t: 1, f: 'trilha1/02-placar.html', ic: '🧱', nome: 'Quadros Coloridos – Placar', desc: 'Planejar, executar e comparar previsto × realizado.', cor: 'laranja' },
    { id: 'arvore', t: 1, f: 'trilha1/03-arvore.html', ic: '🌳', nome: 'Árvore dos Sonhos', desc: 'O grande sonho da empresa e as aspirações (folhas).', cor: 'verde' },
    { id: 'pest', t: 1, f: 'trilha1/04-pest.html', ic: '🌎', nome: 'Análise PEST', desc: 'Fatores políticos, econômicos, sociais e tecnológicos.', cor: 'roxo' },
    { id: 'setorial', t: 1, f: 'trilha1/05-setorial.html', ic: '🏭', nome: 'Análise Setorial', desc: 'Clientes, concorrentes, fornecedores e mais.', cor: 'azul' },
    { id: 'interna', t: 1, f: 'trilha1/06-interna.html', ic: '🔍', nome: 'Análise Interna', desc: 'O que fazemos bem e o que precisa melhorar.', cor: 'laranja' },
    { id: 'fofa', t: 1, f: 'trilha1/07-fofa-gut.html', ic: '🎯', nome: 'Matriz FOFA com GUT', desc: 'Forças, Oportunidades, Fraquezas e Ameaças com pontuação.', cor: 'vermelho' },
    { id: 'cruzada', t: 1, f: 'trilha1/08-fofa-cruzada.html', ic: '✖️', nome: 'FOFA Cruzada', desc: 'A postura estratégica recomendada, calculada sozinha.', cor: 'roxo', auto: true },
    { id: 'smart', t: 1, f: 'trilha1/09-smart.html', ic: '🏁', nome: 'Metas SMART', desc: 'Metas claras: específicas, mensuráveis e com prazo.', cor: 'verde' },
    { id: 'plano', t: 1, f: 'trilha1/10-plano-5w2h.html', ic: '🛠️', nome: 'Plano de Ação 5W2H', desc: 'Quem faz o quê, quando, como e quanto custa.', cor: 'laranja' },
    { id: 'ind', t: 1, f: 'trilha1/11-indicadores.html', ic: '📊', nome: 'Indicadores', desc: 'Como vou saber se estou chegando lá.', cor: 'roxo' },
    { id: 'resumo', t: 1, f: 'trilha1/12-resumo.html', ic: '📘', nome: 'Meu Plano Estratégico', desc: 'Resumo final de tudo, pronto para PDF e WhatsApp.', cor: 'azul', auto: true },
    { id: 't2d1', t: 2, f: 'trilha2/dia1.html', ic: '🚀', nome: 'Dia 1 – Fundação e Diagnóstico', desc: 'Identidade, papéis e FOFA da empresa simulada.', cor: 'azul' },
    { id: 't2d2', t: 2, f: 'trilha2/dia2.html', ic: '⚖️', nome: 'Dia 2 – Estratégia e Metas', desc: 'Qualidade × custo e metas SMART do 1º ano.', cor: 'verde' },
    { id: 't2d3', t: 2, f: 'trilha2/dia3.html', ic: '💰', nome: 'Dia 3 – Recursos e Orçamento', desc: 'Orçamento de R$ 100.000 e saldo de segurança.', cor: 'laranja' },
    { id: 't2d4', t: 2, f: 'trilha2/dia4.html', ic: '📋', nome: 'Dia 4 – Plano de Ação e KPIs', desc: '5W2H da meta prioritária e indicadores.', cor: 'roxo' },
    { id: 't2res', t: 2, f: 'trilha2/resultado.html', ic: '🏆', nome: 'Painel e Apresentação', desc: 'Pitch de 5 telas da sua empresa.', cor: 'vermelho', auto: true }
  ];

  var cont = { 1: 0, 2: 0 };
  PE.PAGES.forEach(function (p) { p.n = ++cont[p.t]; });

  /* ---------- utilitários ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  PE.el = el; PE.esc = esc;
  function fk(k) { return k.indexOf('.') >= 0 ? k : PE.page + '.' + k; }

  PE.get = function (k, def) { var v = rawGet(fk(k)); return v == null ? (def == null ? '' : def) : v; };
  PE.set = function (k, v) { rawSet(fk(k), v); };
  PE.getJSON = function (k, def) { var v = rawGet(fk(k)); if (v == null) return def; try { return JSON.parse(v); } catch (e) { return def; } };
  PE.setJSON = function (k, v) { rawSet(fk(k), JSON.stringify(v)); };
  PE.copia = function (o) { return JSON.parse(JSON.stringify(o)); };

  PE.num = function (s) {
    s = String(s == null ? '' : s).replace(/R\$|\s/g, '');
    if (!s) return 0;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  PE.brl = function (n) {
    n = Math.round((n || 0) * 100) / 100;
    var neg = n < 0; n = Math.abs(n);
    var p = n.toFixed(2).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + 'R$ ' + p[0] + ',' + p[1];
  };
  PE.onChange = function (fn) { ouvintes.push(fn); };
  function fire() { ouvintes.forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } }); progresso(); }
  PE.fire = fire;

  PE.aviso = function (msg) {
    var t = el('div', 'toast'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  };

  var salvoT;
  function piscaSalvo() {
    var s = document.querySelector('.salvo'); if (!s) return;
    s.classList.add('pisca'); clearTimeout(salvoT);
    salvoT = setTimeout(function () { s.classList.remove('pisca'); }, 900);
  }

  function autosize(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }
  PE.autosize = autosize;

  /* ---------- GUT / FOFA ---------- */
  PE.gut = function (r) {
    var g = +r.g, u = +r.u, t = +r.t;
    return (g && u && t) ? g * u * t : 0;
  };
  PE.somaGut = function (q) {
    var rows = PE.getJSON('fofa.' + q, []), s = 0;
    rows.forEach(function (r) { s += PE.gut(r); });
    return s;
  };
  PE.POSTURAS = [
    { id: 'des', nome: 'Desenvolvimento', cor: '#2E7D32', a: 'F', b: 'O', ab: 'Forças + Oportunidades', q: 'Como as forças podem alavancar as oportunidades?', d: 'Postura voltada ao crescimento da empresa. É o quadro mais favorável: forças e oportunidades são mais relevantes. Como as oportunidades estão favorecendo as forças, pense em estratégias para manter o ritmo e aproveitar o melhor potencial do mercado.' },
    { id: 'man', nome: 'Manutenção', cor: '#1565C0', a: 'F', b: 'A', ab: 'Forças + Ameaças', q: 'Como as forças podem amenizar as ameaças?', d: 'Postura voltada ao fortalecimento do posicionamento da empresa. Forças e ameaças são mais relevantes: é um quadro de alerta. As ameaças estão desfavorecendo as forças; pense em estratégias para minimizar o impacto das ameaças sobre as forças.' },
    { id: 'cre', nome: 'Crescimento', cor: '#E65100', a: 'Fr', b: 'O', ab: 'Fraquezas + Oportunidades', q: 'Como evitar que uma fraqueza impeça a busca pela oportunidade?', d: 'Postura voltada ao desenvolvimento interno da empresa. Fraquezas e oportunidades são mais relevantes: momento de pensar em crescimento. As oportunidades são favoráveis e as fraquezas são fatores internos que a empresa controla. Pense em estratégias para neutralizar as fraquezas e aproveitar melhor as oportunidades.' },
    { id: 'sob', nome: 'Sobrevivência', cor: '#C62828', a: 'Fr', b: 'A', ab: 'Fraquezas + Ameaças', q: 'Como evitar que uma fraqueza potencialize uma ameaça?', d: 'Postura voltada ao reposicionamento da empresa. Fraquezas e ameaças são mais relevantes: quadro pouco favorável. As fraquezas estão potencializadas pelas ameaças; é o momento de traçar boas estratégias e mudar essa situação.' }
  ];
  PE.posturas = function () {
    var s = { F: PE.somaGut('F'), O: PE.somaGut('O'), Fr: PE.somaGut('Fr'), A: PE.somaGut('A') };
    var res = PE.POSTURAS.map(function (p) { return { id: p.id, nome: p.nome, cor: p.cor, ab: p.ab, q: p.q, d: p.d, soma: s[p.a] + s[p.b] }; });
    var max = Math.max.apply(null, res.map(function (r) { return r.soma; }));
    res.forEach(function (r) { r.venc = max > 0 && r.soma === max; });
    return { soma: s, res: res, max: max };
  };

  /* ---------- orçamento (Trilha 2, Dia 3) ---------- */
  PE.RESP = ['Financeiro', 'Operações', 'RH', 'Marketing'];
  PE.ORC = {
    orc: '100000',
    impl: [
      { item: 'Aluguel (caução + 1º mês)', valor: '10000', resp: 'Financeiro' },
      { item: 'Equipamentos (2 caixas, balcão refrigerado)', valor: '30000', resp: 'Operações' },
      { item: 'Legalização / Licenças', valor: '5000', resp: 'Financeiro' }
    ],
    mes1: [
      { item: 'Salários 1º mês (4 colaboradores + pró-labore do CEO)', valor: '18000', resp: 'RH' },
      { item: 'Compra de estoque inicial', valor: '15000', resp: 'Operações' },
      { item: 'Marketing de lançamento', valor: '5000', resp: 'Marketing' }
    ]
  };
  PE.orcamento = function () {
    var orc = PE.num(PE.get('t2d3.orc', PE.ORC.orc));
    var impl = PE.getJSON('t2d3.impl', PE.ORC.impl), mes1 = PE.getJSON('t2d3.mes1', PE.ORC.mes1);
    function soma(a) { var s = 0; a.forEach(function (r) { s += PE.num(r.valor); }); return s; }
    var si = soma(impl), sm = soma(mes1), total = si + sm;
    return { orc: orc, impl: impl, mes1: mes1, si: si, sm: sm, total: total, saldo: orc - total };
  };

  /* ---------- progresso ---------- */
  function temConteudo(v) {
    if (v == null) return false;
    v = String(v);
    if (v.charAt(0) === '[') {
      try { return JSON.parse(v).some(function (r) { return Object.keys(r).some(function (k) { return k.charAt(0) !== '_' && String(r[k] == null ? '' : r[k]).trim() !== ''; }); }); } catch (e) { return false; }
    }
    return v.trim() !== '';
  }
  function feito(p) {
    if (p.auto) return rawGet(p.id + '.visto') === '1';
    var ks = rawKeys();
    for (var i = 0; i < ks.length; i++) { if (ks[i].indexOf(p.id + '.') === 0 && temConteudo(rawGet(ks[i]))) return true; }
    return false;
  }
  PE.feito = feito;
  function conta() {
    var r = { total: 0, feitos: 0, t: { 1: [0, 0], 2: [0, 0] } };
    PE.PAGES.forEach(function (p) {
      var f = feito(p); r.total++; r.t[p.t][1]++; if (f) { r.feitos++; r.t[p.t][0]++; }
    });
    return r;
  }
  PE.conta = conta;
  function progresso() {
    var r = conta();
    var i = document.querySelector('.topo .barra>i');
    if (i) { i.style.width = Math.round(100 * r.feitos / r.total) + '%'; document.querySelector('.topo .prog-txt').textContent = r.feitos + ' de ' + r.total + ' páginas'; }
    if (PE.cfg.progressoHome) PE.cfg.progressoHome(r);
  }

  /* ---------- campos fixos (data-k) ---------- */
  PE.bind = function (root) {
    root = root || document;
    var els = root.querySelectorAll('[data-k]');
    Array.prototype.forEach.call(els, function (e) {
      if (e._pe) return; e._pe = 1;
      var key = fk(e.getAttribute('data-k'));
      var chk = e.type === 'checkbox';
      var v = rawGet(key);
      if (v != null) { if (chk) e.checked = v === '1'; else e.value = v; }
      if (e.tagName === 'TEXTAREA') autosize(e);
      var h = function () {
        var val = chk ? (e.checked ? '1' : '') : e.value;
        if (val === '') rawDel(key); else rawSet(key, val);
        if (e.tagName === 'TEXTAREA') autosize(e);
        piscaSalvo(); fire();
      };
      e.addEventListener('input', h); e.addEventListener('change', h);
    });
  };
  PE.valor = function (k) { var e = document.querySelector('[data-k="' + k + '"]'); return e ? (e.type === 'checkbox' ? (e.checked ? '1' : '') : e.value) : PE.get(k); };

  /* ---------- listas dinâmicas ---------- */
  PE.listas = {};
  PE.lista = function (sel, name, cols, o) {
    o = o || {};
    var box = typeof sel === 'string' ? document.querySelector(sel) : sel;
    var key = fk(name);
    var rows = PE.getJSON(key, null);
    if (!rows) rows = PE.copia(o.def || []);
    while (rows.length < (o.min || 0)) rows.push({});
    var L = { rows: rows, els: [], key: key, cols: cols };
    PE.listas[name] = L;
    if (o.simples) box.classList.add('simples');

    function persist() { PE.setJSON(key, L.rows); piscaSalvo(); }
    function calc() {
      L.els.forEach(function (d, i) {
        cols.forEach(function (c, ci) {
          if (c.tipo !== 'calc') return;
          var out = d.querySelectorAll('output')[0 + calcIdx(c)];
          if (!out) return;
          out.textContent = c.fn(L.rows[i], L.rows);
          out.className = 'calc ' + (c.cls ? (c.cls(L.rows[i]) || '') : '');
        });
        if (o.linha) o.linha(d, L.rows[i], i, L);
      });
      if (o.aposMudar) o.aposMudar(L);
    }
    function calcIdx(c) { var n = 0; for (var i = 0; i < cols.length; i++) { if (cols[i] === c) return n; if (cols[i].tipo === 'calc') n++; } return 0; }
    function mudou() { persist(); calc(); fire(); }
    L.mudou = mudou;

    function opcoes(c) { return (c.opcoes || []).map(function (op) { return Array.isArray(op) ? op : [op, op]; }); }

    function criaLinha(row, idx) {
      var d = el('div', 'linha');
      cols.forEach(function (c) {
        var w = el('div', 'campo'); w.style.setProperty('--w', c.w || 12);
        var lab = el('label', null, esc(c.rot || ''));
        if (c.dica) { var b = el('button', 'dica-btn'); b.type = 'button'; b.setAttribute('data-dica', c.dica); b.textContent = '💡 Ver dica'; lab.appendChild(b); }
        if (c.rot || c.dica) w.appendChild(lab);
        var ctl;
        if (c.tipo === 'calc') { ctl = el('output', 'calc'); }
        else if (c.tipo === 'area') { ctl = el('textarea'); ctl.rows = c.linhas || 2; }
        else if (c.tipo === 'sel') {
          ctl = el('select');
          var o0 = el('option'); o0.value = ''; o0.textContent = c.vazio || 'Escolha…'; ctl.appendChild(o0);
          opcoes(c).forEach(function (op) { var oo = el('option'); oo.value = op[0]; oo.textContent = op[1]; ctl.appendChild(oo); });
        }
        else if (c.tipo === 'check') { ctl = el('input'); ctl.type = 'checkbox'; }
        else { ctl = el('input'); ctl.type = c.tipo === 'date' ? 'date' : 'text'; if (c.tipo === 'num') { ctl.inputMode = 'decimal'; } }
        if (c.ph && ctl.placeholder !== undefined) ctl.placeholder = c.ph;
        if (c.tipo !== 'calc') {
          var v = row[c.k];
          if (c.tipo === 'check') ctl.checked = v === '1'; else if (v != null) ctl.value = v;
          var h = function () {
            row[c.k] = c.tipo === 'check' ? (ctl.checked ? '1' : '') : ctl.value;
            if (ctl.tagName === 'TEXTAREA') autosize(ctl);
            mudou();
          };
          ctl.addEventListener('input', h); ctl.addEventListener('change', h);
          ctl.setAttribute('aria-label', c.rot || c.k);
        }
        w.appendChild(ctl);
        if (c.guia) w.appendChild(el('div', 'guia', esc(c.guia)));
        d.appendChild(w);
      });
      if (o.selo) { var s = el('span', 'selo-top', '🏆 Prioridade'); d.firstChild.firstChild && d.firstChild.firstChild.appendChild(s); }
      if (o.removivel !== false) {
        var rm = el('div', 'remover'); var bx = el('button', 'btn-x'); bx.type = 'button'; bx.textContent = '✕'; bx.title = 'Remover esta linha'; bx.setAttribute('aria-label', 'Remover esta linha');
        bx.addEventListener('click', function () {
          var tem = Object.keys(row).some(function (k) { return String(row[k] || '').trim() !== ''; });
          if (tem && !confirm('Remover esta linha?')) return;
          var i = L.rows.indexOf(row); L.rows.splice(i, 1);
          while (L.rows.length < (o.min || 0)) L.rows.push({});
          render(); mudou();
        });
        rm.appendChild(bx); d.appendChild(rm);
      }
      return d;
    }

    function render() {
      box.innerHTML = '';
      var wrap = el('div', 'itens'); box.appendChild(wrap);
      L.els = L.rows.map(function (r, i) { var d = criaLinha(r, i); wrap.appendChild(d); return d; });
      if (!o.max || L.rows.length < o.max) {
        var b = el('button', 'btn claro add'); b.type = 'button'; b.textContent = o.addRot || '+ Adicionar linha';
        b.addEventListener('click', function () { L.add(); });
        box.appendChild(b);
      }
      Array.prototype.forEach.call(box.querySelectorAll('textarea'), autosize);
      calc();
    }
    L.render = render;
    L.add = function (valores) {
      if (o.max && L.rows.length >= o.max) return null;
      var r = valores || {}; L.rows.push(r); render(); persist(); fire();
      var ult = L.els[L.els.length - 1]; var inp = ult && ult.querySelector('input,textarea,select'); if (inp && !valores) inp.focus();
      return r;
    };
    L.setRows = function (arr) { L.rows = arr; render(); persist(); fire(); };
    render();
    return L;
  };

  /* ---------- gerador de campo (HTML) ---------- */
  PE.campo = function (c) {
    var h = '<div class="campo"><label' + (c.id ? ' for="' + c.id + '"' : '') + '>' + c.rot;
    if (c.dica) h += ' <button type="button" class="dica-btn" data-dica="' + esc(c.dica) + '">💡 Ver dica</button>';
    h += '</label>';
    var a = ' data-k="' + c.k + '"' + (c.id ? ' id="' + c.id + '"' : '') + ' placeholder="' + esc(c.ph || '') + '"';
    if (c.tipo === 'text') h += '<input type="text"' + a + '>';
    else if (c.tipo === 'date') h += '<input type="date"' + a + '>';
    else h += '<textarea rows="' + (c.linhas || 3) + '"' + a + '></textarea>';
    if (c.guia) h += '<div class="guia">' + esc(c.guia) + '</div>';
    return h + '</div>';
  };

  /* ---------- dicas (delegação) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dica-btn'); if (!b) return;
    var lab = b.parentNode, nx = lab.nextElementSibling;
    if (nx && nx.classList.contains('dica-box')) { nx.remove(); return; }
    var box = el('div', 'dica-box'); box.textContent = '💡 ' + b.getAttribute('data-dica');
    lab.parentNode.insertBefore(box, lab.nextSibling);
  });

  /* ---------- cronômetro ---------- */
  var audioCtx = null;
  function bip() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      for (var i = 0; i < 4; i++) {
        (function (i) {
          var o = audioCtx.createOscillator(), g = audioCtx.createGain();
          o.type = 'square'; o.frequency.value = i % 2 ? 660 : 880; g.gain.value = 0.15;
          o.connect(g); g.connect(audioCtx.destination);
          var t = audioCtx.currentTime + i * 0.35; o.start(t); o.stop(t + 0.25);
        })(i);
      }
    } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); } catch (e) {}
  }
  function mmss(s) { s = Math.max(0, s); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  PE.cronometro = function (box, seg, rot) {
    var restante = seg, id = null, fim = null;
    var c = el('div', 'crono');
    c.innerHTML = '<div class="rot">' + esc(rot || '') + '</div><div class="tempo">' + mmss(seg) + '</div><div class="btns"><button type="button" class="btn verde peq ini">▶ Iniciar</button><button type="button" class="btn claro peq rei">↺ Zerar</button></div>';
    box.appendChild(c);
    var t = c.querySelector('.tempo'), bi = c.querySelector('.ini');
    function pinta() { t.textContent = mmss(restante); }
    function para() { clearInterval(id); id = null; bi.textContent = '▶ Iniciar'; }
    bi.addEventListener('click', function () {
      if (id) { para(); bi.textContent = '▶ Continuar'; return; }
      if (restante <= 0) restante = seg;
      c.classList.remove('fim');
      try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.resume) audioCtx.resume(); } catch (e) {}
      fim = Date.now() + restante * 1000; bi.textContent = '⏸ Pausar';
      id = setInterval(function () {
        restante = Math.round((fim - Date.now()) / 1000); pinta();
        if (restante <= 0) { restante = 0; pinta(); para(); c.classList.add('fim'); bip(); }
      }, 250);
    });
    c.querySelector('.rei').addEventListener('click', function () { para(); restante = seg; c.classList.remove('fim'); pinta(); });
    return c;
  };

  /* ---------- resumo para WhatsApp (genérico) ---------- */
  function valorDe(f) {
    if (f.type === 'checkbox') return f.checked ? '✔' : '';
    if (f.tagName === 'SELECT') return f.value ? f.options[f.selectedIndex].text : '';
    return (f.value || '').trim();
  }
  function rotuloDe(c) {
    var l = c.querySelector('label,.rot'); if (!l) return '';
    var cl = l.cloneNode(true); Array.prototype.forEach.call(cl.querySelectorAll('button,.selo-top'), function (b) { b.remove(); });
    return cl.textContent.trim();
  }
  PE.resumoPadrao = function () {
    var main = document.querySelector('main'), out = [];
    var ns = main.querySelectorAll('h2,h3,.campo,.linha');
    Array.prototype.forEach.call(ns, function (n) {
      if (n.closest('.no-resumo,.modal-fundo,.crono')) return;
      var tag = n.tagName;
      if (tag === 'H2') { if (!n.closest('.titulo-pg')) out.push('\n*' + n.textContent.replace(/\s+/g, ' ').trim() + '*'); return; }
      if (tag === 'H3') { out.push('_' + n.textContent.trim() + '_'); return; }
      if (n.classList.contains('linha')) {
        var partes = [];
        Array.prototype.forEach.call(n.querySelectorAll('.campo'), function (c) {
          var f = c.querySelector('input,textarea,select'); if (!f) { var o = c.querySelector('output'); if (o && o.textContent.trim() && o.textContent.trim() !== '—' ) partes.push(rotuloDe(c) + ': ' + o.textContent.trim()); return; }
          var v = valorDe(f); if (v) partes.push((rotuloDe(c) ? rotuloDe(c) + ': ' : '') + v);
        });
        if (partes.length) out.push('• ' + partes.join(' | '));
        return;
      }
      if (n.closest('.linha')) return;
      var f = n.querySelector('input,textarea,select'); if (!f) return;
      var v = valorDe(f); if (!v) return;
      out.push((f.type === 'checkbox' ? '✔ ' + rotuloDe(n) : rotuloDe(n) + ': ' + v));
    });
    return out.join('\n');
  };
  PE.textoWhats = function () {
    var titulo = (document.querySelector('.titulo-pg h1') || document.querySelector('h1') || {}).textContent || document.title;
    var g = PE.get('perfil.grupo'), n = PE.get('perfil.nome');
    var cab = '*' + titulo.trim() + '*' + (g ? '\nGrupo/Empresa: ' + g : '') + (n ? '\nParticipante: ' + n : '');
    var corpo = PE.cfg.resumo ? PE.cfg.resumo(PE.resumoPadrao) : PE.resumoPadrao();
    return cab + '\n' + corpo + '\n\n_Material de apoio – PHCommerce Consultoria_';
  };
  PE.copiar = function (txt) {
    function fallback() {
      var t = el('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = 0; document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} t.remove(); PE.aviso(ok ? '✔ Resumo copiado! Cole no WhatsApp.' : 'Não consegui copiar. Tente de novo.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { PE.aviso('✔ Resumo copiado! Cole no WhatsApp.'); }, fallback);
    else fallback();
  };

  /* ---------- backup ---------- */
  PE.exportar = function () {
    var d = {}; rawKeys().forEach(function (k) { d[k] = rawGet(k); });
    var g = (PE.get('perfil.grupo') || 'meu-plano').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'meu-plano';
    var blob = new Blob([JSON.stringify({ versao: 1, criado: new Date().toISOString(), dados: d }, null, 1)], { type: 'application/json' });
    var a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'backup-planejamento-' + g + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    PE.aviso('✔ Backup baixado.');
  };
  PE.importar = function (arquivo) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var o = JSON.parse(r.result); if (!o || !o.dados) throw 0;
        if (!confirm('Isso vai SUBSTITUIR tudo o que está preenchido neste aparelho pelo conteúdo do backup. Continuar?')) return;
        rawKeys().forEach(rawDel);
        Object.keys(o.dados).forEach(function (k) { rawSet(k, o.dados[k]); });
        location.reload();
      } catch (e) { alert('Esse arquivo não parece ser um backup deste site.'); }
    };
    r.readAsText(arquivo);
  };
  PE.limparPagina = function () {
    if (!confirm('Apagar TUDO o que você escreveu nesta página? Não dá para desfazer.')) return;
    rawKeys().forEach(function (k) { if (k.indexOf(PE.page + '.') === 0) rawDel(k); });
    location.reload();
  };
  PE.limparTudo = function () {
    if (!confirm('Apagar TUDO de TODAS as páginas deste aparelho? Baixe o backup antes se quiser guardar.')) return;
    rawKeys().forEach(rawDel); location.reload();
  };

  /* ---------- exemplo preenchido ---------- */
  PE.abrirExemplo = function (html) {
    var f = el('div', 'modal-fundo');
    f.innerHTML = '<div class="modal"><header><b>💡 Exemplo preenchido – empresa de confecção</b><button type="button" class="btn claro peq">Fechar ✕</button></header><div class="corpo">' + html + '<p class="legenda">Este é só um exemplo. O que você escreveu na página não foi alterado.</p></div></div>';
    f.addEventListener('click', function (e) { if (e.target === f || e.target.closest('header .btn')) f.remove(); });
    document.body.appendChild(f);
  };

  /* ---------- estrutura comum das páginas ---------- */
  PE.pagina = function (cfg) { PE.cfg = cfg || {}; };

  function shell() {
    var main = document.querySelector('main'); if (!main) return;
    var idx = -1, info = null;
    PE.PAGES.forEach(function (p, i) { if (p.id === PE.page) { idx = i; info = p; } });
    var g = PE.get('perfil.grupo');
    var h = el('header', 'topo');
    h.innerHTML = '<div class="topo-in"><a class="voltar" href="' + PE.base + 'index.html">← Voltar ao início</a>' +
      '<div class="grupo-nome">' + (g ? '👥 ' + esc(g) : '<a href="' + PE.base + 'index.html">Informe o nome do grupo na página inicial</a>') + '</div>' +
      '<div class="salvo">✔ Salvo automaticamente</div>' +
      (info ? '<div class="prog"><div class="barra"><i style="width:0"></i></div><span class="prog-txt"></span></div>' : '') + '</div>';
    document.body.insertBefore(h, main);

    var imp = el('div', 'so-impressao');
    imp.innerHTML = '<p><b>Curso Sebrae "Alcance resultados no seu negócio com planejamento estratégico"</b><br>' + (g ? 'Grupo/Empresa: ' + esc(g) + ' · ' : '') + (PE.get('perfil.nome') ? 'Participante: ' + esc(PE.get('perfil.nome')) + ' · ' : '') + new Date().toLocaleDateString('pt-BR') + '</p>';
    main.insertBefore(imp, main.firstChild);

    if (PE.cfg.exemplo) {
      var tp = main.querySelector('.titulo-pg');
      if (tp) { var be = el('button', 'btn claro peq nao-imprimir'); be.type = 'button'; be.style.marginTop = '8px'; be.textContent = '👀 Ver exemplo preenchido'; be.addEventListener('click', function () { PE.abrirExemplo(PE.cfg.exemplo); }); tp.appendChild(be); }
    }

    if (!PE.cfg.semAcoes) {
      var ac = el('div', 'acoes');
      ac.innerHTML = '<button type="button" class="btn azul b-print">🖨️ Imprimir / Salvar PDF</button><button type="button" class="btn verde b-zap">📲 Copiar resumo para WhatsApp</button>' + (PE.cfg.semLimpar ? '' : '<button type="button" class="btn claro b-limpa">🗑️ Limpar esta página</button>');
      main.appendChild(ac);
      ac.querySelector('.b-print').onclick = function () { window.print(); };
      ac.querySelector('.b-zap').onclick = function () { PE.copiar(PE.textoWhats()); };
      var bl = ac.querySelector('.b-limpa'); if (bl) bl.onclick = PE.limparPagina;
    }

    if (info) {
      var mesma = PE.PAGES.filter(function (p) { return p.t === info.t; });
      var k = mesma.indexOf(info), nv = el('div', 'nav');
      var ant = mesma[k - 1], prox = mesma[k + 1];
      nv.innerHTML = (ant ? '<a class="btn claro" href="' + PE.base + ant.f + '">← Anterior</a>' : '<a class="btn claro" href="' + PE.base + 'index.html">← Início</a>') +
        (prox ? '<a class="btn" href="' + PE.base + prox.f + '">Próximo →</a>' : '<a class="btn verde" href="' + PE.base + 'index.html">Concluir ✔</a>');
      main.appendChild(nv);
    }
    var rp = el('div', 'rodape', 'Material de apoio – PHCommerce Consultoria · Baseado no curso Sebrae "Alcance resultados no seu negócio com planejamento estratégico"');
    main.appendChild(rp);
  }

  function init() {
    if (PE.page !== 'perfil') shell();
    PE.bind(document);
    if (info_auto()) rawSet(PE.page + '.visto', '1');
    if (PE.cfg.pronto) PE.cfg.pronto();
    fire();
  }
  function info_auto() { return PE.PAGES.some(function (p) { return p.id === PE.page && p.auto; }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
