// Marginália — melhorias progressivas. Tudo funciona sem este arquivo.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const anunciar = (msg) => {
    const el = $('[data-anuncio]');
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(() => (el.textContent = msg));
  };
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Menu no celular ----------
  function iniciarMenu() {
    const botao = $('.topo__menu');
    const nav = $('#menu-principal');
    if (!botao || !nav) return;
    const fechar = (focar) => {
      botao.setAttribute('aria-expanded', 'false');
      nav.classList.remove('aberto');
      if (focar) botao.focus();
    };
    botao.addEventListener('click', () => {
      const abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      nav.classList.toggle('aberto', abrir);
      if (abrir) $('a', nav)?.focus();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('aberto')) fechar(true);
    });
  }

  // ---------- Entradas discretas ao rolar ----------
  function iniciarEntradas() {
    const alvos = $$('[data-reveal]');
    if (!alvos.length) return;
    if (semMovimento.matches || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('visto'));
      return;
    }
    // Escalonar irmãos que entram juntos (60–90ms)
    const io = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas.filter((e) => e.isIntersecting);
        visiveis.forEach((e, i) => {
          e.target.style.setProperty('--atraso', `${Math.min(i, 6) * 75}ms`);
          e.target.classList.add('visto');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    alvos.forEach((el) => io.observe(el));
  }

  // ---------- Biblioteca: filtro ao vivo ----------
  function iniciarBusca() {
    const form = $('[data-busca]');
    if (!form) return;
    let controle;
    let espera;
    async function atualizar() {
      const params = new URLSearchParams(new FormData(form));
      for (const [k, v] of [...params]) if (!v) params.delete(k);
      const url = '/biblioteca' + (params.toString() ? '?' + params : '');
      const area = $('[data-resultados]');
      controle?.abort();
      controle = new AbortController();
      area?.setAttribute('aria-busy', 'true');
      try {
        const r = await fetch(url, { signal: controle.signal, headers: { Accept: 'text/html' } });
        if (!r.ok) throw new Error(String(r.status));
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        const novo = $('[data-resultados]', doc);
        if (novo && area) {
          area.replaceWith(novo);
          novo.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('visto'));
          history.replaceState(null, '', url);
          anunciar($('[data-contagem]', novo)?.textContent || '');
        }
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          area?.removeAttribute('aria-busy');
          anunciar('Não foi possível atualizar a lista. Use o botão Buscar.');
        }
      }
    }
    form.addEventListener('change', (e) => {
      if (e.target.matches('input[type="radio"]')) atualizar();
    });
    form.addEventListener('input', (e) => {
      if (e.target.matches('input[type="search"]')) {
        clearTimeout(espera);
        espera = setTimeout(atualizar, 260);
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearTimeout(espera);
      atualizar();
    });
  }

  // ---------- Livro: asterisco e leitura ----------
  async function enviar(form, corpo = new URLSearchParams(new FormData(form))) {
    const r = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: corpo,
    });
    if (r.status === 401) {
      location.href = '/entrar?volta=' + encodeURIComponent(location.pathname);
      return null;
    }
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(dados.erro || 'Não foi possível salvar.');
    return dados.estado;
  }

  function iniciarAsterisco() {
    const form = $('[data-asterisco]');
    if (!form) return;
    const botao = $('button', form);
    const campo = $('input[name="valor"]', form);
    const rotulo = $('[data-rotulo]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const marcar = campo.value === '1';
      // Resposta otimista: o botão muda na hora; desfaz se o servidor falhar.
      const aplicar = (on) => {
        botao.setAttribute('aria-pressed', String(on));
        rotulo.textContent = on ? 'Marcado com asterisco' : 'Marcar com asterisco';
        campo.value = on ? '0' : '1';
      };
      // Serializa antes da resposta otimista, que troca o valor do campo escondido.
      const corpo = new URLSearchParams(new FormData(form));
      aplicar(marcar);
      botao.disabled = true;
      try {
        await enviar(form, corpo);
        anunciar(marcar ? 'Livro marcado com asterisco.' : 'Asterisco removido.');
      } catch (erro) {
        aplicar(!marcar);
        anunciar(erro.message);
      } finally {
        botao.disabled = false;
      }
    });
  }

  function iniciarLeitura() {
    const form = $('[data-leitura]');
    if (!form) return;
    const bloco = $('[data-progresso]', form);
    const faixa = $('input[type="range"]', form);
    const saida = $('[data-saida]', form);
    const estado = $('[data-estado]', form);
    const status = () => $('input[name="status"]:checked', form)?.value || '';
    const mostrarProgresso = () => (bloco.hidden = status() !== 'lendo');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'status') mostrarProgresso();
    });
    faixa?.addEventListener('input', () => (saida.textContent = faixa.value + '%'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const botao = $('button[type="submit"]', form);
      botao.disabled = true;
      estado.className = 'leitura__estado';
      estado.textContent = 'Salvando…';
      try {
        const novo = await enviar(form);
        if (!novo) return;
        const nomes = { 'quero-ler': 'Quero ler', lendo: `Lendo · ${novo.progresso}%`, lido: 'Lido' };
        estado.classList.add('ok');
        estado.textContent = novo.status ? `Salvo: ${nomes[novo.status]}.` : 'Registro de leitura removido.';
        if (faixa && novo.status === 'lendo') {
          faixa.value = novo.progresso;
          saida.textContent = novo.progresso + '%';
        }
      } catch (erro) {
        estado.classList.add('erro');
        estado.textContent = erro.message + ' Tente de novo.';
      } finally {
        botao.disabled = false;
      }
    });
  }

  // ---------- Formulários de conta: foco no resumo de erros ----------
  function iniciarErros() {
    const resumo = $('[data-erros]');
    if (resumo) resumo.focus();
  }

  // ---------- Exclusividade dos <details name> em navegadores antigos ----------
  function iniciarPerguntas() {
    const itens = $$('details[name="comeco"]');
    itens.forEach((d) =>
      d.addEventListener('toggle', () => {
        if (d.open) itens.forEach((o) => o !== d && (o.open = false));
      })
    );
  }

  iniciarMenu();
  iniciarEntradas();
  iniciarBusca();
  iniciarAsterisco();
  iniciarLeitura();
  iniciarErros();
  iniciarPerguntas();

  // Filtros recolhíveis: abertos no desktop, fechados no celular (sem JS ficam abertos).
  if (matchMedia('(max-width: 760px)').matches) {
    $$('[data-abrir-desktop]').forEach((d) => {
      if (!d.querySelector('[aria-current]:not([href="/personalidades"])')) d.open = false;
    });
  }
})();
