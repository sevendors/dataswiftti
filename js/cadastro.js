(function () {
  const form = document.getElementById('signupForm');
  const feedback = document.getElementById('form-feedback');
  const cpfEl = document.getElementById('cpf');
  const cepEl = document.getElementById('cep');
  const ufEl = document.getElementById('uf');
  const senhaEl = document.getElementById('senha');
  const confEl = document.getElementById('confirmacao');
  const aceiteEl = document.getElementById('aceite');
  const submitBtn = document.getElementById('submitBtn');

  // helpers
  const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
  const allEqual = (s) => /^(\d)\1+$/.test(s);
  const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const clearAddressFields = () => {
    setValue('logradouro','');
    setValue('bairro','');
    setValue('cidade','');
    setValue('uf','');
  };

  // enforce digits and length on cpf/cep
  ['input','blur'].forEach(evt => {
    cpfEl.addEventListener(evt, () => { cpfEl.value = onlyDigits(cpfEl.value).slice(0, 11); });
    cepEl.addEventListener(evt, () => { cepEl.value = onlyDigits(cepEl.value).slice(0, 8); });
  });

  // limpar endereço sempre que CEP for editado
  cepEl.addEventListener('input', () => { clearAddressFields(); feedback.textContent = ''; });

  // UF uppercase
  ufEl.addEventListener('input', () => { ufEl.value = ufEl.value.toUpperCase().slice(0, 2); });

  // consent gate
  const syncConsent = () => { submitBtn.disabled = !aceiteEl.checked; };
  syncConsent(); aceiteEl.addEventListener('change', syncConsent);

  // password match
  function validatePasswords() {
    if (confEl.value && senhaEl.value !== confEl.value) confEl.setCustomValidity('As senhas não conferem.');
    else confEl.setCustomValidity('');
  }
  senhaEl.addEventListener('input', validatePasswords);
  confEl.addEventListener('input', validatePasswords);

  // CPF validation
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
  cpfEl.addEventListener('blur', () => {
    const v = onlyDigits(cpfEl.value);
    if (!v) return;
    cpfEl.setCustomValidity(validaCPF(v) ? '' : 'CPF inválido.');
    if (!cpfEl.checkValidity()) cpfEl.reportValidity();
  });

  // ViaCEP autofill
  cepEl.addEventListener('blur', async () => {
    const cep = onlyDigits(cepEl.value);
    if (cep.length !== 8) { clearAddressFields(); feedback.textContent = ''; return; }
    try {
      feedback.textContent = 'Consultando CEP...';
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { feedback.textContent = 'CEP não encontrado.'; clearAddressFields(); return; }
      setValue('logradouro', data.logradouro);
      setValue('bairro', data.bairro);
      setValue('cidade', data.localidade);
      setValue('uf', (data.uf || '').toUpperCase());
      feedback.textContent = '';
    } catch {
      feedback.textContent = 'Falha ao consultar CEP.'; clearAddressFields();
    }
  });

  // password visibility toggle
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const input = document.getElementById(id);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // submit guards
  form.addEventListener('submit', (e) => {
    if (document.getElementById('website').value) { e.preventDefault(); feedback.textContent = 'Erro de validação.'; return; }
    if (!validaCPF(cpfEl.value)) { e.preventDefault(); cpfEl.setCustomValidity('CPF inválido.'); cpfEl.reportValidity(); }
  });
})();
