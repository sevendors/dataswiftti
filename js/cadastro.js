/* cadastro.js v3 – enxuto, acessível, sem dependência de classes CSS */
(() => {
  const $ = (id) => document.getElementById(id);
  const form = $('signupForm'); if (!form) return;

  const f = {
    nome: $('nome'), email: $('email'), cpf: $('cpf'),
    senha: $('senha'), confirmacao: $('confirmacao'),
    cep: $('cep'), numero: $('numero'),
    logradouro: $('logradouro'), bairro: $('bairro'),
    cidade: $('cidade'), uf: $('uf'),
    aceite: $('aceite'), submitBtn: $('submitBtn'),
    hp: $('website'), feedback: $('form-feedback')
  };

  // Utils
  const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
  const allEqual = (s) => /^(\d)\1{10}$/.test(s);
  const numeroRx = /^(\d{1,6}|s\s*\/?\s*n)$/i;

  function attachMsg(el) {
    const id = el.id + '-msg';
    let n = $(id);
    if (!n) {
      n = document.createElement('span');
      n.id = id;
      n.setAttribute('role', 'status');
      n.setAttribute('aria-live', 'polite');
      n.hidden = true;
      el.insertAdjacentElement('afterend', n);
    }
    const ds = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!ds.includes(id)) { ds.push(id); el.setAttribute('aria-describedby', ds.join(' ')); }
    return n;
  }
  function setError(el, msg) {
    if (!el) return;
    const n = attachMsg(el);
    el.setCustomValidity(msg || '');
    if (msg) { el.setAttribute('aria-invalid', 'true'); n.textContent = msg; n.hidden = false; }
    else { el.removeAttribute('aria-invalid'); n.textContent = ''; n.hidden = true; }
  }
  function validaCPF(v) {
    v = onlyDigits(v);
    if (v.length !== 11 || allEqual(v)) return false;
    let s = 0; for (let i = 0; i < 9; i++) s += +v[i] * (10 - i);
    let d = (s * 10) % 11; if (d === 10) d = 0; if (d !== +v[9]) return false;
    s = 0; for (let i = 0; i < 10; i++) s += +v[i] * (11 - i);
    d = (s * 10) % 11; if (d === 10) d = 0; return d === +v[10];
  }

  // Normalização
  if (f.cpf) ['input','blur'].forEach(evt => f.cpf.addEventListener(evt, () => {
    f.cpf.value = onlyDigits(f.cpf.value).slice(0, 11); if (evt === 'input') setError(f.cpf, '');
  }));
  if (f.cep) ['input','blur'].forEach(evt => f.cep.addEventListener(evt, () => {
    f.cep.value = onlyDigits(f.cep.value).slice(0, 8); if (evt === 'input') setError(f.cep, '');
  }));
  if (f.uf) f.uf.addEventListener('input', () => {
    f.uf.value = (f.uf.value || '').toUpperCase().slice(0, 2); setError(f.uf, '');
  });

  // Consent
  function syncConsent() { if (f.submitBtn && f.aceite) f.submitBtn.disabled = !f.aceite.checked; }
  syncConsent();
  if (f.aceite) f.aceite.addEventListener('change', () => { syncConsent(); f.aceite.setCustomValidity(''); });

  // Regras
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rules = {
    nome: v => v.trim() ? '' : 'Informe o nome completo.',
    email: v => !v.trim() ? 'Informe o e-mail.' : (emailRx.test(v.trim()) ? '' : 'E-mail inválido.'),
    cpf: v => validaCPF(v) ? '' : 'CPF inválido.',
    senha: v => v.length >= 8 ? '' : 'Mínimo de 8 caracteres.',
    confirmacao: () => !f.confirmacao.value ? 'Confirme a senha.' :
                     (f.senha.value === f.confirmacao.value ? '' : 'As senhas não conferem.'),
    cep: v => onlyDigits(v).length === 8 ? '' : 'CEP deve ter 8 dígitos.',
    numero: v => v.trim() ? (numeroRx.test(v.trim()) ? '' : 'Use número (até 6 dígitos) ou S/N.') : 'Informe o número ou S/N.',
    logradouro: v => v.trim() ? '' : 'Informe o logradouro.',
    bairro: v => v.trim() ? '' : 'Informe o bairro.',
    cidade: v => v.trim() ? '' : 'Informe a cidade.',
    uf: v => /^[A-Za-z]{2}$/.test(v.trim()) ? '' : 'UF com 2 letras.',
    aceite: () => f.aceite && f.aceite.checked ? '' : 'É necessário aceitar os termos.'
  };

  function bindValidation(id, evt = 'blur') {
    const el = f[id]; if (!el) return;
    el.addEventListener(evt, () => setError(el, rules[id](el.value)));
    if (id === 'senha') el.addEventListener('input', () => { setError(el, rules[id](el.value)); if (f.confirmacao) setError(f.confirmacao, rules.confirmacao()); });
    if (id === 'confirmacao') el.addEventListener('input', () => setError(el, rules.confirmacao()));
  }
  ['nome','email','cpf','senha','confirmacao','cep','numero','logradouro','bairro','cidade','uf'].forEach(id => bindValidation(id));
  if (f.aceite) f.aceite.addEventListener('change', () => { const m = rules.aceite(); if (m && f.feedback) f.feedback.textContent = 'Marque o checkbox de aceite para prosseguir.'; });

  // ViaCEP
  function clearAddress() { ['logradouro','bairro','cidade','uf'].forEach(k => { if (f[k]) f[k].value = ''; }); }
  if (f.cep) f.cep.addEventListener('blur', async () => {
    const cep = onlyDigits(f.cep.value);
    if (cep.length !== 8) { clearAddress(); return; }
    try {
      if (f.feedback) f.feedback.textContent = 'Consultando CEP...';
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) { if (f.feedback) f.feedback.textContent = 'CEP não encontrado.'; clearAddress(); setError(f.cep, 'CEP não encontrado.'); return; }
      if (f.logradouro) f.logradouro.value = d.logradouro || '';
      if (f.bairro) f.bairro.value = d.bairro || '';
      if (f.cidade) f.cidade.value = d.localidade || '';
      if (f.uf) f.uf.value = (d.uf || '').toUpperCase();
      ['logradouro','bairro','cidade','uf'].forEach(k => setError(f[k], ''));
      if (f.feedback) f.feedback.textContent = '';
    } catch {
      if (f.feedback) f.feedback.textContent = 'Falha ao consultar CEP.'; setError(f.cep, 'Não foi possível consultar o CEP.'); clearAddress();
    }
  });

  // Toggle de senha via atributo ARIA (sem classes)
  form.addEventListener('click', (e) => {
    const btn = e.target.closest('button[type="button"][aria-controls]');
    if (!btn) return;
    const target = $(btn.getAttribute('aria-controls'));
    if (target && (target.type === 'password' || target.type === 'text')) {
      target.type = target.type === 'password' ? 'text' : 'password';
    }
  });

  // Submit
  form.addEventListener('submit', (e) => {
    if (f.hp && f.hp.value) { e.preventDefault(); if (f.feedback) f.feedback.textContent = 'Erro de validação.'; return; }
    let ok = true;
    for (const [k, fn] of Object.entries(rules)) {
      if (k !== 'aceite' && !f[k]) continue;
      const el = k === 'aceite' ? f.aceite : f[k];
      const msg = fn(k === 'aceite' ? '' : el.value);
      setError(el, msg);
      ok = ok && !msg;
    }
    if (!form.checkValidity() || !ok) {
      e.preventDefault();
      const first = form.querySelector('[aria-invalid="true"], :invalid');
      if (first && typeof first.focus === 'function') first.focus();
      if (f.feedback) f.feedback.textContent = 'Revise os campos destacados.';
    } else if (f.feedback) f.feedback.textContent = '';
  });
})();
