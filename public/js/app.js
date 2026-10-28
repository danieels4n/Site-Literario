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
  const celular = matchMedia('(max-width: 760px)');
  const compacto = matchMedia('(max-width: 980px)');
  // Camadas de tela cheia no celular: trava a rolagem do fundo e mantém o Tab dentro da camada.
  const travar = (sim) => document.documentElement.classList.toggle('travado', sim);
  const prenderFoco = (camada, ativo) => camada.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !ativo()) return;
    const f = $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]', camada).filter((el) => el.getClientRects().length);
    if (!f.length) return;
    const [primeiro, ultimo] = [f[0], f[f.length - 1]];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });

  // ---------- Menu no celular ----------
  function iniciarMenu() {
    const botao = $('.topo__menu');
    const nav = $('#menu-principal');
    if (!botao || !nav) return;
    const fechar = (focar) => {
      botao.setAttribute('aria-expanded', 'false');
      nav.classList.remove('aberto');
      travar(false);
      if (focar) botao.focus();
    };
    botao.addEventListener('click', () => {
      const abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      nav.classList.toggle('aberto', abrir);
      travar(abrir && celular.matches);
      if (abrir) $('.topo__links a', nav)?.focus();
    });
    $('[data-fechar-menu]', nav)?.addEventListener('click', () => fechar(true));
    prenderFoco(nav, () => celular.matches && nav.classList.contains('aberto'));
    celular.addEventListener('change', () => { if (nav.classList.contains('aberto')) travar(celular.matches); });
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
          const chips = $('.disponibilidade', doc);
          if (chips) $('.disponibilidade')?.replaceWith(chips);
          anunciar($('[data-contagem]', novo)?.textContent || '');
          document.dispatchEvent(new CustomEvent('marginalia:resultados', { detail: { contagem: $('[data-contagem]', novo)?.textContent || '' } }));
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

  // ---------- Celular: só age em telas estreitas; no desktop nada disto roda ----------

  // Filtros da biblioteca em painel recolhível
  (function filtrosRecolhiveis() {
    const form = $('[data-busca]');
    const alternar = $('[data-alternar-filtros]');
    const mostrar = $('[data-mostrar-resultados]');
    if (!form || !alternar) return;
    const folha = $('#filtros-biblioteca');
    const abrir = (aberto) => {
      form.classList.toggle('busca--fechada', !aberto);
      alternar.setAttribute('aria-expanded', String(aberto));
      travar(aberto && celular.matches);
    };
    const fecharFolha = () => { abrir(false); alternar.focus({ preventScroll: true }); };
    $('[data-fechar-filtros]', form)?.addEventListener('click', fecharFolha);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && celular.matches && alternar.getAttribute('aria-expanded') === 'true') fecharFolha();
    });
    if (folha) prenderFoco(folha, () => celular.matches && alternar.getAttribute('aria-expanded') === 'true');
    const contarFiltros = () => $$('.busca__filtros input[type="radio"]:checked', form).filter((i) => i.value).length;
    const atualizarRotulo = () => {
      const n = contarFiltros();
      const alvo = $('[data-nfiltros]', alternar);
      if (alvo) alvo.textContent = n ? ` · ${n} ${n === 1 ? 'ativo' : 'ativos'}` : '';
    };
    if (celular.matches) abrir(false);
    celular.addEventListener('change', (e) => abrir(!e.matches));
    alternar.addEventListener('click', () => {
      const aberto = alternar.getAttribute('aria-expanded') !== 'true';
      abrir(aberto);
      if (aberto && celular.matches) $('[data-fechar-filtros]', form)?.focus();
    });
    form.addEventListener('change', atualizarRotulo);
    document.addEventListener('marginalia:resultados', (e) => {
      if (mostrar) mostrar.textContent = `Mostrar ${e.detail.contagem}`;
    });
    mostrar?.addEventListener('click', () => {
      abrir(false);
      alternar.focus({ preventScroll: true });
      $('#resultados')?.scrollIntoView({ behavior: semMovimento.matches ? 'auto' : 'smooth', block: 'start' });
    });
  })();

  // Atalho "Buscar" do cabeçalho: leva à biblioteca com o campo em foco
  (function atalhoBusca() {
    const focar = () => { if (compacto.matches && location.hash === '#q') $('#q')?.focus(); };
    focar();
    window.addEventListener('hashchange', focar);
  })();

  // Cabeçalho que some ao rolar para baixo e volta ao rolar para cima
  (function cabecalhoCompacto() {
    const topo = $('.topo');
    if (!topo) return;
    let ultimo = scrollY;
    let pedido = false;
    const menuAberto = () => $('.topo__menu')?.getAttribute('aria-expanded') === 'true';
    const atualizar = () => {
      pedido = false;
      const y = scrollY;
      if (!compacto.matches || menuAberto() || y < 120 || topo.contains(document.activeElement)) {
        topo.classList.remove('topo--oculto');
      } else if (y > ultimo + 6) {
        topo.classList.add('topo--oculto');
      } else if (y < ultimo - 6) {
        topo.classList.remove('topo--oculto');
      }
      ultimo = y;
    };
    window.addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    topo.addEventListener('focusin', () => topo.classList.remove('topo--oculto'));
  })();

  // Carrossel editorial da home (só no celular)
  (function carrosselHome() {
    const raiz = $('[data-carrossel]');
    if (!raiz) return;
    const trilho = $('[data-trilho]', raiz);
    const laminas = $$('[data-lamina]', raiz);
    const pontos = $$('[data-ir]', raiz);
    const pausa = $('[data-pausa]', raiz);
    const INTERVALO = 6000;
    let atual = 0;
    let relogio = null;
    let parado = false; // pausado pelo botão
    let tocando = false;
    let focado = false;
    let sobre = false;
    let visivel = true;

    const largura = () => trilho.clientWidth || 1;
    // Carrega as imagens da lâmina seguinte só quando ela está para entrar.
    const preparar = (i) => $$('img[loading="lazy"]', laminas[i] || raiz).forEach((img) => (img.loading = 'eager'));
    const marcar = (i) => {
      atual = i;
      pontos.forEach((p, j) => p.setAttribute('aria-current', String(j === i)));
      preparar((i + 1) % laminas.length);
    };
    let garantia;
    const ir = (i) => {
      preparar(i);
      const alvo = i * largura();
      trilho.scrollTo({ left: alvo, behavior: semMovimento.matches ? 'auto' : 'smooth' });
      // Se a rolagem suave for interrompida ou não animar, posiciona direto.
      clearTimeout(garantia);
      garantia = setTimeout(() => { if (!tocando && Math.abs(trilho.scrollLeft - alvo) > 2) trilho.scrollLeft = alvo; }, 800);
      marcar(i);
    };
    const automatico = () => celular.matches && !semMovimento.matches && !parado;
    const agendar = () => {
      clearTimeout(relogio);
      relogio = null;
      // Região viva só anuncia quando a troca não é automática.
      trilho.setAttribute('aria-live', automatico() && !focado ? 'off' : 'polite');
      if (!automatico() || tocando || focado || sobre || !visivel || document.hidden) return;
      relogio = setTimeout(() => { ir((atual + 1) % laminas.length); agendar(); }, INTERVALO);
    };
    const atualizarPausa = () => {
      pausa.hidden = semMovimento.matches;
      pausa.setAttribute('aria-pressed', String(parado));
      pausa.setAttribute('aria-label', parado ? 'Retomar a passagem automática' : 'Pausar a passagem automática');
    };

    let espera;
    trilho.addEventListener('scroll', () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        const i = Math.min(laminas.length - 1, Math.max(0, Math.round(trilho.scrollLeft / largura())));
        if (i !== atual) marcar(i);
      }, 90);
    }, { passive: true });
    pontos.forEach((p) => p.addEventListener('click', () => { ir(Number(p.dataset.ir)); agendar(); }));
    pausa.addEventListener('click', () => { parado = !parado; atualizarPausa(); agendar(); });
    trilho.addEventListener('pointerdown', () => { tocando = true; agendar(); });
    window.addEventListener('pointerup', () => { if (tocando) { tocando = false; agendar(); } });
    window.addEventListener('pointercancel', () => { if (tocando) { tocando = false; agendar(); } });
    raiz.addEventListener('mouseenter', () => { sobre = true; agendar(); });
    raiz.addEventListener('mouseleave', () => { sobre = false; agendar(); });
    raiz.addEventListener('focusin', (e) => {
      focado = true;
      const l = e.target.closest('[data-lamina]');
      if (l) { const i = laminas.indexOf(l); if (i !== atual) ir(i); }
      agendar();
    });
    raiz.addEventListener('focusout', (e) => { if (!raiz.contains(e.relatedTarget)) { focado = false; agendar(); } });
    raiz.addEventListener('keydown', (e) => {
      if (!e.target.closest('.carrossel__pontos')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const i = (atual + (e.key === 'ArrowRight' ? 1 : laminas.length - 1)) % laminas.length;
        ir(i);
        pontos[i].focus();
      }
    });
    document.addEventListener('visibilitychange', agendar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visivel = e.isIntersecting; agendar(); }, { threshold: 0.4 }).observe(raiz);
    }
    window.addEventListener('resize', () => trilho.scrollTo({ left: atual * largura(), behavior: 'auto' }));
    semMovimento.addEventListener('change', () => { atualizarPausa(); agendar(); });
    celular.addEventListener('change', agendar);
    atualizarPausa();
    agendar();
  })();

  // Eixos das personalidades: no celular ficam abertos, numa linha que rola na horizontal,
  // com o eixo escolhido à vista.
  (function eixoAVista() {
    const a = $('.filtro-eixos [aria-current]');
    const lista = a?.closest('ul');
    if (!celular.matches || !lista) return;
    lista.scrollLeft = a.offsetLeft - (lista.clientWidth - a.offsetWidth) / 2;
  })();
})();
