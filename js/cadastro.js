/* cadastro.js v2 – mensagens por campo via aria-describedby
   Pré‑requisito: #numero é type="text" (aceita "S/N"). */
(function () {
  const $ = (id) => document.getElementById(id);

  const form = $('signupForm');
  const feedback = $('form-feedback');
  const f = {
    nome: $('nome'),
    email: $('email'),
    cpf: $('cpf'),
    senha: $('senha'),
    confirmacao: $('confirmacao'),
    cep: $('cep'),
    numero: $('numero'),
    logradouro: $('logradouro'),
    bairro: $('bairro'),
    cidade: $('cidade'),
    uf: $('uf'),
    aceite: $('aceite'),
    submitBtn: $('submitBtn'),
  };

  // ========= Utilitários =========
  const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
  const allEqual   = (s) => /^(\d)\1+$/.test(s);

  function attachMsg(el) {
    const id = el.id + '-msg';
    let span = $(id);
    if (!span) {
      span = document.createElement('span');
      span.id = id;
      span.className = 'field-msg';
      span.setAttribute('role', 'status');
      span.setAttribute('aria-live', 'polite');
      span.style.display = 'block';
      span.style.fontSize = '0.85rem';
      span.style.color = '#b00020';
      el.insertAdjacentElement('afterend', span);
    }
    // encadear com hints existentes
    const described = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/).filter(Boolean);
    if (!described.includes(id)) {
      described.push(id);
      el.setAttribute('aria-describedby', described.join(' '));
    }
    return span;
  }

  function setError(el, msg) {
    const span = attachMsg(el);
    el.setCustomValidity(msg || '');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      span.textContent = msg;
    } else {
      el.removeAttribute('aria-invalid');
      span.textContent = '';
    }
  }

  function clearAddressFields() {
    ['logradouro', 'bairro', 'cidade', 'uf'].forEach(k => { if (f[k]) f[k].value = ''; });
  }

  // ========= Regras específicas =========
  function validaCPF(cpf) {
    cpf = onlyDigits(cpf);
    if (cpf.length !== 11 || allEqual(cpf)) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += parseInt(cpf[i], 10) * (10 - i);
    let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0;
    if (d1 !== parseInt(cpf[9], 10)) return false;
    s = 0;
    for (let i = 0; i < 10; i++) s += parseInt(cpf[i], 10) * (11 - i);
    let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0;
    return d2 === parseInt(cpf[10], 10);
  }

  const numeroRegex = /^(\d{1,6}|s\s*\/?\s*n)$/i;

  // ========= Máscaras e normalização =========
  ['input','blur'].forEach(evt => {
    f.cpf.addEventListener(evt, () => { f.cpf.value = onlyDigits(f.cpf.value).slice(0, 11); if (evt==='input') setError(f.cpf,''); });
    f.cep.addEventListener(evt, () => { f.cep.value = onlyDigits(f.cep.value).slice(0, 8); if (evt==='input') { setError(f.cep,''); feedback.textContent=''; } });
  });

  // UF uppercase
  f.uf.addEventListener('input', () => { f.uf.value = f.uf.value.toUpperCase().slice(0, 2); setError(f.uf,''); });

  // Limpa endereço ao digitar CEP
  f.cep.addEventListener('input', clearAddressFields);

  // Consent gate
  const syncConsent = () => { f.submitBtn.disabled = !f.aceite.checked; };
  syncConsent();
  f.aceite.addEventListener('change', () => {
    syncConsent();
    if (f.aceite.checked) f.aceite.setCustomValidity('');
  });

  // ========= Validações por campo =========
  function vNome() {
    if (!f.nome.value.trim()) { setError(f.nome, 'Informe o nome completo.'); return false; }
    setError(f.nome, ''); return true;
  }
  function vEmail() {
    if (!f.email.value.trim()) { setError(f.email, 'Informe o e-mail.'); return false; }
    // Expressão regular simples para validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email.value.trim())) { setError(f.email, 'E-mail inválido.'); return false; }
    setError(f.email, ''); return true;
  }
  function vCPF() {
    const v = onlyDigits(f.cpf.value);
    if (v.length !== 11 || !validaCPF(v)) { setError(f.cpf, 'CPF inválido.'); return false; }
    setError(f.cpf, ''); return true;
  }
  function vSenha() {
    const v = f.senha.value;
    if (v.length < 8) { setError(f.senha, 'Mínimo de 8 caracteres.'); return false; }
    setError(f.senha, ''); return true;
  }
  function vConfirmacao() {
    if (!f.confirmacao.value) { setError(f.confirmacao, 'Confirme a senha.'); return false; }
    if (f.senha.value !== f.confirmacao.value) { setError(f.confirmacao, 'As senhas não conferem.'); return false; }
    setError(f.confirmacao, ''); return true;
  }
  function vCEP() {
    const v = onlyDigits(f.cep.value);
    if (v.length !== 8) { setError(f.cep, 'CEP deve ter 8 dígitos.'); return false; }
    setError(f.cep, ''); return true;
  }
  function vNumero() {
    const v = f.numero.value.trim();
    if (!v) { setError(f.numero, 'Informe o número ou S/N.'); return false; }
    if (!numeroRegex.test(v)) { setError(f.numero, 'Use número (até 6 dígitos) ou S/N.'); return false; }
    setError(f.numero, ''); return true;
  }
  function vLogradouro() {
    if (!f.logradouro.value.trim()) { setError(f.logradouro, 'Informe o logradouro.'); return false; }
    setError(f.logradouro, ''); return true;
  }
  function vBairro() {
    if (!f.bairro.value.trim()) { setError(f.bairro, 'Informe o bairro.'); return false; }
    setError(f.bairro, ''); return true;
  }
  function vCidade() {
    if (!f.cidade.value.trim()) { setError(f.cidade, 'Informe a cidade.'); return false; }
    setError(f.cidade, ''); return true;
  }
  function vUF() {
    const v = f.uf.value.trim();
    if (!/^[A-Za-z]{2}$/.test(v)) { setError(f.uf, 'UF com 2 letras.'); return false; }
    setError(f.uf, ''); return true;
  }
  function vAceite() {
    if (!f.aceite.checked) {
      f.aceite.setCustomValidity('É necessário aceitar os termos.');
      feedback.textContent = 'Marque o checkbox de aceite para prosseguir.';
      return false;
    }
    f.aceite.setCustomValidity(''); return true;
  }

  // Eventos por campo
  f.nome.addEventListener('blur', vNome);
  f.email.addEventListener('blur', vEmail);
  f.cpf.addEventListener('blur', vCPF);
  f.senha.addEventListener('input', () => { vSenha(); vConfirmacao(); });
  f.confirmacao.addEventListener('input', vConfirmacao);
  f.cep.addEventListener('blur', vCEP);
  f.numero.addEventListener('blur', vNumero);
  f.logradouro.addEventListener('blur', vLogradouro);
  f.bairro.addEventListener('blur', vBairro);
  f.cidade.addEventListener('blur', vCidade);
  f.uf.addEventListener('blur', vUF);

  // ========= ViaCEP =========
  f.cep.addEventListener('blur', async () => {
    const cep = onlyDigits(f.cep.value);
    if (cep.length !== 8) { clearAddressFields(); return; }
    try {
      feedback.textContent = 'Consultando CEP...';
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        feedback.textContent = 'CEP não encontrado.';
        clearAddressFields();
        setError(f.cep, 'CEP não encontrado.');
        return;
      }
      // Preenche sempre, sobrescrevendo
      f.logradouro.value = data.logradouro || '';
      f.bairro.value     = data.bairro || '';
      f.cidade.value     = data.localidade || '';
      f.uf.value         = (data.uf || '').toUpperCase();
      // limpa erros dos campos preenchidos
      [f.logradouro, f.bairro, f.cidade, f.uf].forEach(el => setError(el, ''));
      feedback.textContent = '';
    } catch {
      feedback.textContent = 'Falha ao consultar CEP.';
      setError(f.cep, 'Não foi possível consultar o CEP.');
      clearAddressFields();
    }
  });

  // ========= Toggle de visibilidade de senha =========
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const input = $(id);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // ========= Submit guard =========
  function validateAll() {
    const checks = [vNome, vEmail, vCPF, vSenha, vConfirmacao, vCEP, vNumero, vLogradouro, vBairro, vCidade, vUF, vAceite];
    let ok = true;
    for (const fn of checks) { ok = fn() && ok; }
    return ok && form.checkValidity();
  }

  form.addEventListener('submit', (e) => {
    // honeypot
    const hp = $('website');
    if (hp && hp.value) { e.preventDefault(); feedback.textContent = 'Erro de validação.'; return; }

    if (!validateAll()) {
      e.preventDefault();
      // foca no primeiro inválido
      const firstInvalid = form.querySelector('[aria-invalid="true"], :invalid');
      if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
      feedback.textContent = 'Revise os campos destacados.';
      return;
    }
    feedback.textContent = '';
  });
})();
