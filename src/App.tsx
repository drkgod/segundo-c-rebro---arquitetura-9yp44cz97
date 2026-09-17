import { useState } from 'react'

/* ============ DADOS ============ */

const fontes = [
  {
    nome: 'tl;dv',
    icone: '🎥',
    entrega: 'Toda call: vendas, kickoff, consultorias, EBR — transcrição, participantes, data',
    gatilho: 'Nova call de consultor @adapta.org',
    wf: 'WF-A · Calls',
    idempotencia: "(tipo_fonte='tldv', id_externo=meeting_id)",
    correlacao: 'Email do participante → clientes.email_match; órfãs esperam o match retroativo',
    destino: 'fontes_ingestao → chunks · atas_reunioes · decisoes · problemas',
    cor: 'cyan',
  },
  {
    nome: 'Portal Next (Supabase)',
    icone: '🚪',
    entrega: 'Conta criada, etapa da jornada, plano, produto',
    gatilho: 'Cliente pagou → conta criada no portal',
    wf: 'WF-E · Portal',
    idempotencia: "(tipo_fonte='portal', id_externo=portal_user_id)",
    correlacao:
      'portal_user_id + email → dispara match_retroativo(email) que reatribui TODAS as calls órfãs',
    destino: 'clientes · temperatura_historico · notas (00-Geral inicial)',
    cor: 'violet',
  },
  {
    nome: 'WhatsApp (banco dos agentes)',
    icone: '💬',
    entrega:
      'Eventos relevantes: reclamações, urgências, churn-risco, elogios — já registrados pelo fluxo SLA',
    gatilho: 'Evento relevante no SLA existente (lê do banco, não re-ingere)',
    wf: 'WF-B · WhatsApp',
    idempotencia: "(tipo_fonte='whatsapp', id_externo=message_id)",
    correlacao:
      'grupo JID → clientes.whatsapp_grupo; sentimento negativo comprovado derruba temperatura',
    destino: 'chunks · problemas (recorrencia++) · temperatura_historico',
    cor: 'green',
  },
  {
    nome: 'Google Drive',
    icone: '📁',
    entrega: 'Raio-X, escopos, mapeamentos de processo (antes → depois)',
    gatilho: 'Novo doc na pasta do cliente',
    wf: 'WF-C · Docs',
    idempotencia: "(tipo_fonte='drive', id_externo=file_id)",
    correlacao: 'drive_pasta_id → clientes.drive_pasta_id; doc citado vira processo com evidência',
    destino: 'processos (antes/depois/tempo/ganho) · chunks',
    cor: 'amber',
  },
  {
    nome: 'GitHub Elite',
    icone: '🐙',
    entrega: 'Commits nos submódulos = o que foi construído (features, stack, tipo de solução)',
    gatilho: 'Push no repo/submódulo do cliente',
    wf: 'WF-D · GitHub',
    idempotencia: "(tipo_fonte='github', id_externo=commit_sha)",
    correlacao:
      'github_repo → clientes.github_repo; repo principal = contexto, submódulo = construção',
    destino: 'solucoes (tipo/stack/status) · chunks',
    cor: 'slate',
  },
]

const tabelas = [
  {
    nome: 'clientes',
    papel: '1 linha por cliente — a âncora de TODAS as correlações',
    campos:
      'id · nome · nicho · segmento · user_goal · email_match · portal_user_id · github_repo · drive_pasta_id · whatsapp_grupo · consultor · csm · temperatura · temperatura_categoria (derivada) · status · produto',
    refs: 'PK id — referenciada por TODAS as outras tabelas via cliente_id',
  },
  {
    nome: 'fontes_ingestao',
    papel: '1 linha por evento bruto — idempotência e rastreabilidade',
    campos:
      'cliente_id (null = órfã) · tipo_fonte · id_externo · url_origem · ocorreu_em · payload (bruto preservado) · status',
    refs: 'UNIQUE(tipo_fonte, id_externo) · FK cliente_id → clientes · FK fonte_id em chunks/atas/problemas/processos/solucoes',
  },
  {
    nome: 'chunks',
    papel: 'A memória bruta vetorizada — pedaços com assunto + embedding 1536d',
    campos:
      'cliente_id (null até match) · fonte_id · conteudo · assunto (IA) · embedding vector(1536) · tokens · metadados',
    refs: 'FK cliente_id · FK fonte_id → fontes_ingestao · índice HNSW cosine',
  },
  {
    nome: 'atas_reunioes',
    papel: '1 ata por call — resumo, sentimentos, temperatura de entrada/saída',
    campos:
      'cliente_id · fonte_id · tipo_call · data_reuniao · resumo · sentimentos · temperatura_entrada · temperatura_saida',
    refs: 'FK fonte_id → fontes_ingestao · FK ata_id em decisoes',
  },
  {
    nome: 'decisoes',
    papel: '1 linha por decisão que impacta o projeto — cronológico',
    campos: 'cliente_id · ata_id · data_decisao · decisao · impacto · contexto',
    refs: 'FK ata_id → atas_reunioes (a decisão sabe EM QUAL call foi tomada)',
  },
  {
    nome: 'problemas',
    papel: 'Dores/reclamações com recorrência — de WhatsApp, calls, projeto',
    campos:
      'cliente_id · fonte_id · origem · descricao · gravidade · status · recorrencia · primeira/ultima_mencao',
    refs: 'FK fonte_id → fontes_ingestao · recorrencia++ a cada nova menção do mesmo tema',
  },
  {
    nome: 'processos',
    papel: 'Mapeamentos do Drive — antes → depois com tempos e ganho',
    campos:
      'cliente_id · fonte_id · nome_processo · descricao_antes · tempo_antes · descricao_depois · tempo_depois · ganho_medido · drive_doc_id',
    refs: 'FK fonte_id → fontes_ingestao · drive_doc_id rastreia o raio-X de origem',
  },
  {
    nome: 'solucoes',
    papel: 'O que foi construído — do GitHub Elite',
    campos:
      'cliente_id · fonte_id · nome_solucao · tipo (rpa/saas_criado/saas_usado/automacao/feature/integracao) · stack · repo · submodulo · status · entregue_em',
    refs: 'FK fonte_id → fontes_ingestao · repo/submodulo → clientes.github_repo',
  },
  {
    nome: 'notas',
    papel: 'As notas atômicas do Obsidian — markdown + frontmatter + embedding da nota inteira',
    campos:
      'cliente_id · tipo_nota · titulo · conteudo_md · frontmatter (jsonb) · versao · embedding vector(1536)',
    refs: 'UNIQUE(cliente_id, tipo_nota) · frontmatter herda campos de clientes · vetorização dupla',
  },
  {
    nome: 'temperatura_historico',
    papel: 'Por que a temperatura mudou — delta + motivo + evidência',
    campos:
      'cliente_id · valor · delta · motivo · evento_tipo (ata/whatsapp/marco/manual) · evento_ref',
    refs: 'FK cliente_id · evento_ref aponta para a ata/fonte que gerou a mudança',
  },
]

const correlacoes = [
  {
    de: 'tl;dv (meeting_id)',
    para: 'fontes_ingestao.id_externo',
    tipo: 'ingestão idempotente',
    como: 'WF-A faz upsert por (tldv, meeting_id); nunca processa 2x a mesma call',
  },
  {
    de: 'Participante com email @adapta.org',
    para: 'clientes.consultor / csm',
    tipo: 'match de carteira',
    como: 'Define qual consultor atendeu; cliente confirmado contra a carteira (HubSpot/Portal)',
  },
  {
    de: 'Email do cliente na call',
    para: 'clientes.email_match',
    tipo: 'correlação primária',
    como: 'Se o cliente ainda não tem conta no portal, a call fica ÓRFÃ (cliente_id null) — vetorizada e aguardando',
  },
  {
    de: 'Conta criada no Portal',
    para: 'match_retroativo(email)',
    tipo: 'reatribuição retroativa',
    como: 'RPC reatribui TODAS as fontes órfãs daquele email + seus chunks e atas — a call de VENDA volta para o cliente',
  },
  {
    de: 'clientes.id',
    para: 'cliente_id em TODAS as tabelas',
    tipo: 'chave universal',
    como: 'chunks, atas, decisoes, problemas, processos, solucoes, notas e temperatura_historico — tudo se une por cliente_id',
  },
  {
    de: 'fontes_ingestao.id',
    para: 'fonte_id em chunks/atas/problemas/processos/solucoes',
    tipo: 'rastreabilidade',
    como: 'Toda informação derivada sabe de qual evento bruto veio (payload preservado para reprocessar)',
  },
  {
    de: 'atas_reunioes.id',
    para: 'decisoes.ata_id',
    tipo: 'contexto da decisão',
    como: 'Cada decisão sabe em qual call foi tomada; a nota 01-Decisões lista por data',
  },
  {
    de: 'WhatsApp grupo JID',
    para: 'clientes.whatsapp_grupo',
    tipo: 'mapeamento de grupo',
    como: 'Eventos relevantes do SLA (reclamação, churn-risco) viram problema + recalculam temperatura com motivo',
  },
  {
    de: 'Drive pasta',
    para: 'clientes.drive_pasta_id',
    tipo: 'mapeamento de pasta',
    como: 'Docs novos na pasta viram processos (antes→depois) com drive_doc_id citado',
  },
  {
    de: 'GitHub repo/submódulo',
    para: 'clientes.github_repo',
    tipo: 'mapeamento de repo',
    como: 'Commits no submódulo viram solucoes com tipo/stack/status; repo principal carrega o contexto',
  },
  {
    de: 'notas.frontmatter',
    para: 'clientes + tabelas derivadas',
    tipo: 'herança de campos',
    como: 'Frontmatter é MONTADO do banco: nicho/temperatura/consultor vêm de clientes; contadores vêm de decisoes/problemas/processos/solucoes',
  },
  {
    de: 'notas.embedding + chunks.embedding',
    para: 'match_notas / match_chunks',
    tipo: 'busca semântica',
    como: 'Vetorização dupla: nota inteira (macro) + seções como chunks (granular). Pergunta em linguagem natural acha a seção exata',
  },
  {
    de: 'temperatura_historico',
    para: 'clientes.temperatura',
    tipo: 'recálculo auditável',
    como: 'Cada mudança tem delta + motivo + evidência; categoria é derivada do número, nunca escrita à mão',
  },
]

const tiposNota = [
  {
    nome: '00-Geral',
    granularidade: '1 por cliente',
    responde: 'Como está o cliente?',
    mutavel: 'Regenerada a cada evento',
    especificos:
      'user_goal · data_inicio · resumo · principais_problemas · solucoes_construidas · proximos_passos · linha do tempo · tabela de temperatura',
    corpo:
      'Resumo 2-3 linhas no topo → Quem é → Objetivo → Temperatura (tabela delta/motivo/evidência) → Problemas top 3 → Soluções → Próximos passos → Linha do tempo',
  },
  {
    nome: '01-Decisões',
    granularidade: '1 por cliente',
    responde: 'O que foi decidido (e quando)?',
    mutavel: 'Regenerada a cada decisão',
    especificos: 'total_decisoes · ultima_decisao_em',
    corpo:
      'Cronológico inverso; cada decisão = data + decisão + impacto + contexto + evidência (ata/meeting_id)',
  },
  {
    nome: '02-Problemas',
    granularidade: '1 por cliente',
    responde: 'O que ele mais reclamou?',
    mutavel: 'Regenerada a cada problema',
    especificos: 'abertos · resolvidos · mais_recorrente · gravidade_max',
    corpo:
      'Agrupado por tema; cada problema = gravidade + status + recorrência + último trecho citado + ação em curso',
  },
  {
    nome: '03-Processos',
    granularidade: '1 por cliente',
    responde: 'Quanto o processo melhorou?',
    mutavel: 'Regenerada a cada mapeamento',
    especificos: 'total_processos · ganho_medio',
    corpo:
      'Por processo: antes (descrição + tempo) → depois (descrição + tempo) → ganho medido → fonte no Drive → status do ganho (projetado/medido)',
  },
  {
    nome: '04-Soluções',
    granularidade: '1 por cliente',
    responde: 'O que foi construído?',
    mutavel: 'Regenerada a cada commit',
    especificos: 'total_solucoes · tipos · stack_principal',
    corpo:
      'Por solução: o que faz + tipo (rpa/saas/automacao/feature) + stack + repo/submódulo + fonte (commits/escopo)',
  },
  {
    nome: 'Ata',
    granularidade: '1 por reunião',
    responde: 'O que aconteceu naquela call?',
    mutavel: 'Imutável após gerada (v1)',
    especificos:
      'data · tipo_call · temperatura_entrada/saída · decisoes_na_call · problemas_na_call · meeting_id · participantes',
    corpo:
      'Resumo 3-6 linhas → Decisões → Problemas → Próximos passos (com dono) → Citações-chave → Temperatura (entrada→saída + motivo)',
  },
  {
    nome: 'MOC',
    granularidade: '1 por filtro',
    responde: 'Visões: por nicho, consultor, risco',
    mutavel: 'Gerada (Dataview/SQL)',
    especificos: 'escopo (nicho/consultor/status_projeto) · valor',
    corpo:
      'Lista de clientes com link para 00-Geral + temperatura + status_projeto. Padrão: MOC Nicho, MOC Consultor, MOC Clientes em Risco',
  },
]

const fmComum = [
  {
    campo: 'cliente',
    tipo: 'texto',
    origem: 'clientes.nome',
    uso: 'Busca por nome; título da nota',
  },
  {
    campo: 'cliente_id',
    tipo: 'uuid',
    origem: 'clientes.id',
    uso: 'Chave universal de correlação no Supabase',
  },
  {
    campo: 'aliases',
    tipo: 'lista',
    origem: 'Editável (banco)',
    uso: 'Nomes coloquiais — calibra o match por título de call',
  },
  { campo: 'tipo', tipo: 'enum', origem: 'Gerador da nota', uso: 'Filtra por tipo de nota' },
  {
    campo: 'produto',
    tipo: 'enum',
    origem: 'Portal/HubSpot',
    uso: 'native | pass | elite — separa universos',
  },
  {
    campo: 'nicho',
    tipo: 'lista controlada',
    origem: 'IA infere + editável',
    uso: "Pergunta-chefe: 'quais clientes agro...?'",
  },
  {
    campo: 'segmento',
    tipo: 'texto',
    origem: 'IA infere + editável',
    uso: 'Subdivisão do nicho (ex: fertilizantes especiais)',
  },
  {
    campo: 'status',
    tipo: 'enum',
    origem: 'Portal/HubSpot',
    uso: 'ativo | pausado | churn | finalizado',
  },
  {
    campo: 'status_projeto',
    tipo: 'enum',
    origem: 'Portal (jornada)',
    uso: 'sem_plano | discovery | construcao | integracao | finalizado',
  },
  {
    campo: 'temperatura',
    tipo: '0-100',
    origem: 'Recálculo por evento',
    uso: 'Número vivo; alimenta a categoria',
  },
  {
    campo: 'temperatura_categoria',
    tipo: 'derivada',
    origem: 'Gerada do número',
    uso: 'quente≥75 | morno≥50 | frio≥25 | risco<25 — nunca escrita à mão',
  },
  {
    campo: 'tendencia_temperatura',
    tipo: 'derivada',
    origem: 'Últimos deltas',
    uso: 'subindo | estável | caindo',
  },
  {
    campo: 'consultor / csm',
    tipo: 'texto',
    origem: 'Carteira (HubSpot)',
    uso: 'MOC por consultor; atribuição de responsabilidade',
  },
  {
    campo: 'tags',
    tipo: 'lista (máx 7)',
    origem: 'IA classificadora',
    uso: 'Temas do conteúdo — nunca nomes de cliente',
  },
  {
    campo: 'versao / atualizado_em',
    tipo: 'int / data',
    origem: 'Regeneração',
    uso: 'Auditoria de atualização',
  },
]

const temperaturas = [
  { evento: 'Elogio / marco positivo / entrega em produção', delta: '+5 a +10' },
  { evento: 'Call produtiva (decisões tomadas, próximos passos claros)', delta: '+5' },
  { evento: 'Reclamação (problema novo)', delta: '−5 a −10' },
  {
    evento: 'Cliente puto no WhatsApp (sentimento negativo comprovado semanticamente)',
    delta: '−10 a −20',
  },
  { evento: 'Churn-risco semântico (nunca por palavra-chave isolada)', delta: '−20' },
  { evento: 'Silêncio prolongado (>30 dias sem call/mensagem)', delta: '−10' },
  { evento: 'Problema crítico aberto >7 dias', delta: '−5/semana' },
]

const fases = [
  {
    fase: 'F0',
    nome: 'Banco',
    oque: 'Criar projeto Supabase novo + rodar schema',
    aceite: '10 tabelas + 3 RPCs + pgvector ativos; anon 403',
  },
  {
    fase: 'F1',
    nome: 'Calls (piloto)',
    oque: 'WF-A: tl;dv → IA chunk/ata/decisões/problemas + temperatura',
    aceite: '1 cliente piloto com histórico completo ingerido e notas geradas',
  },
  {
    fase: 'F2',
    nome: 'Portal + backfill',
    oque: 'WF-E: conta → match_retroativo; backfill de TODOS os Native',
    aceite: '100% dos Native com nota 00-Geral; calls órfãs atribuídas',
  },
  {
    fase: 'F3',
    nome: 'WhatsApp',
    oque: 'WF-B: eventos relevantes do SLA → chunk/problema/temperatura',
    aceite: 'Eventos virando temperatura com motivo em tempo quase real',
  },
  {
    fase: 'F4',
    nome: 'Drive + GitHub',
    oque: 'WF-C: docs → processos; WF-D: commits → soluções',
    aceite: 'Processos e soluções populados para o piloto',
  },
  {
    fase: 'F5',
    nome: 'Busca',
    oque: 'RPC match_notas + MOCs/Dataview (Obsidian via API)',
    aceite: 'Perguntas dos chefes respondidas em <30s no piloto',
  },
]

const perguntas = [
  {
    p: 'Quais clientes agro estão em risco?',
    resolve: 'frontmatter: nicho=agro + temperatura_categoria=risco (qualquer nota)',
  },
  { p: 'Como está o Cleiton?', resolve: 'nota 00-Geral: resumo + temperatura + próximos passos' },
  { p: 'Por que esfriou?', resolve: 'temperatura_historico: delta + motivo + evidência' },
  {
    p: 'O que foi decidido com ele?',
    resolve: 'nota 01-Decisões (cronológica, com ata de origem)',
  },
  { p: 'O que ele mais reclamou?', resolve: 'nota 02-Problemas: mais_recorrente + recorrência' },
  {
    p: 'Quanto o processo melhorou?',
    resolve: 'nota 03-Processos: tempo_antes vs tempo_depois + ganho',
  },
  { p: 'O que já foi construído?', resolve: 'nota 04-Soluções: tipos + stack + repo' },
  { p: 'O que aconteceu na call de 15/09?', resolve: 'Ata: data=2026-09-15 + meeting_id (tl;dv)' },
  { p: 'Quais clientes do Navaar estão parados?', resolve: 'MOC por consultor + status_projeto' },
  {
    p: "Busca livre: 'clientes com problema de API'",
    resolve: 'match_notas (embedding) filtrando tags',
  },
]

/* ============ ESTILOS ============ */
const corBorda: Record<string, string> = {
  cyan: 'border-cyan-400/40 bg-cyan-400/5',
  violet: 'border-violet-400/40 bg-violet-400/5',
  green: 'border-emerald-400/40 bg-emerald-400/5',
  amber: 'border-amber-400/40 bg-amber-400/5',
  slate: 'border-slate-400/40 bg-slate-400/5',
}

/* ============ APP ============ */
export default function App() {
  const [tab, setTab] = useState('visao')
  const tabs = [
    { id: 'visao', label: 'Visão Geral' },
    { id: 'fontes', label: 'Fontes & Ingestão' },
    { id: 'banco', label: 'Banco de Dados' },
    { id: 'correlacoes', label: 'Correlações' },
    { id: 'notas', label: 'Notas & Templates' },
    { id: 'frontmatter', label: 'Frontmatter' },
    { id: 'temperatura', label: 'Temperatura' },
    { id: 'execucao', label: 'Execução' },
  ]

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-200">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-[#0d1219] px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Segundo Cérebro <span className="text-cyan-400">(Elite)</span>
              </h1>
              <p className="text-sm text-slate-400">
                Arquitetura completa · fontes → ingestão → banco → notas · v1.0 · 17/09/2026
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-300">
                Supabase novo + pgvector 1536d
              </span>
              <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-violet-300">
                Obsidian via API
              </span>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                5 workflows n8n
              </span>
            </div>
          </div>
          {/* PIPELINE RESUMO */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            {['tl;dv', 'Portal', 'WhatsApp', 'Drive', 'GitHub'].map((f) => (
              <span
                key={f}
                className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-slate-300"
              >
                {f}
              </span>
            ))}
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-300">
              n8n · IA leve (assuntos/chunks/atas)
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-violet-500/50 bg-violet-500/10 px-2.5 py-1.5 text-violet-300">
              Supabase · 10 tabelas · vetorizado
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-300">
              Notas atômicas + frontmatter
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-amber-300">
              Equipe · Chefes · Agentes IA
            </span>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className="sticky top-0 z-10 border-b border-slate-800 bg-[#0b0f14]/95 px-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm transition ${
                tab === t.id
                  ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ============ VISÃO GERAL ============ */}
        {tab === 'visao' && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-1 text-lg font-semibold text-white">
                A jornada do dado — de ponta a ponta
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                O Cleiton entra por uma call de vendas no tl;dv antes mesmo de existir como cliente.
                A call é vetorizada como órfã; quando ele paga e a conta é criada no Portal, o match
                retroativo por email traz TUDO de volta para ele.
              </p>
              <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
                <div className="space-y-3 text-sm">
                  {[
                    {
                      n: '1',
                      t: 'Call de vendas (tl;dv)',
                      d: 'WF-A ingesta e vetoriza. Cliente ainda não tem conta → call fica ÓRFÃ (cliente_id null), já pesquisável por embedding.',
                    },
                    {
                      n: '2',
                      t: 'Pagou → conta no Portal',
                      d: 'WF-E cria o cliente no banco novo e dispara match_retroativo(email): todas as calls órfãs daquele email são reatribuídas — inclusive a de vendas.',
                    },
                    {
                      n: '3',
                      t: 'IA leve processa',
                      d: '4o-mini/DeepSeek define assuntos, divide em chunks, gera a ata, extrai decisões e problemas, recalcula a temperatura com motivo.',
                    },
                    {
                      n: '4',
                      t: 'Notas são geradas/regeneradas',
                      d: '00-Geral, 01-Decisões, 02-Problemas + a Ata da reunião. Frontmatter montado do banco (nicho, temperatura, consultor).',
                    },
                    {
                      n: '5',
                      t: 'Eventos contínuos atualizam',
                      d: 'WhatsApp (reclamação derruba temperatura com motivo) · Drive (processo antes→depois) · GitHub (solução construída) · nova call (nova ata + decisões).',
                    },
                    {
                      n: '6',
                      t: 'Consumo',
                      d: 'Equipe lê antes da call · chefes buscam por nicho/temperatura/pergunta livre (match_notas) · agentes de IA usam como contexto.',
                    },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300 ring-1 ring-cyan-500/40">
                        {s.n}
                      </span>
                      <div>
                        <span className="font-medium text-white">{s.t}</span>
                        <span className="text-slate-400"> — {s.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">
                Perguntas dos chefes → onde o sistema responde
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/60 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Pergunta</th>
                      <th className="px-4 py-2.5 font-medium">Resolve com</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perguntas.map((q) => (
                      <tr key={q.p} className="border-t border-slate-800/70">
                        <td className="px-4 py-2.5 text-slate-200">"{q.p}"</td>
                        <td className="px-4 py-2.5 text-cyan-300/90">{q.resolve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                {
                  t: 'Idempotente',
                  d: 'fontes_ingestao com UNIQUE(tipo_fonte, id_externo) — nenhuma call/mensagem/commit é processada 2x. Payload bruto preservado para reprocessar.',
                },
                {
                  t: 'Rastreável',
                  d: 'Toda decisão, problema, processo e solução sabe de qual evento veio (fonte_id → url_origem/meeting_id/commit). Sem evidência citada, não entra na nota.',
                },
                {
                  t: 'Auditável',
                  d: 'Temperatura nunca muda sem motivo: cada delta tem evidência e evento de origem. Notas são regeneradas do banco; versão incrementa a cada regeneração.',
                },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-slate-800 bg-[#0d1219] p-4">
                  <h3 className="mb-1.5 font-semibold text-cyan-300">{c.t}</h3>
                  <p className="text-sm text-slate-400">{c.d}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ============ FONTES ============ */}
        {tab === 'fontes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              As 5 fontes → de onde cada dado é puxado
            </h2>
            <p className="text-sm text-slate-400">
              Cada fonte tem seu workflow n8n, sua chave de idempotência e seu campo de correlação
              com o cliente.
            </p>
            {fontes.map((f) => (
              <div key={f.nome} className={`rounded-xl border p-5 ${corBorda[f.cor]}`}>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-2xl">{f.icone}</span>
                  <h3 className="text-base font-semibold text-white">{f.nome}</h3>
                  <span className="rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-0.5 text-xs text-slate-300">
                    {f.wf}
                  </span>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium text-slate-300">Entrega:</span>{' '}
                    <span className="text-slate-400">{f.entrega}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Gatilho:</span>{' '}
                    <span className="text-slate-400">{f.gatilho}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Idempotência:</span>{' '}
                    <span className="font-mono text-xs text-cyan-300/80">{f.idempotencia}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Correlação:</span>{' '}
                    <span className="text-slate-400">{f.correlacao}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-slate-300">Escreve em:</span>{' '}
                    <span className="font-mono text-xs text-violet-300/80">{f.destino}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ BANCO ============ */}
        {tab === 'banco' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Banco novo (Supabase + pgvector) — 10 tabelas
            </h2>
            <p className="text-sm text-slate-400">
              <span className="font-mono text-cyan-300">clientes.id</span> é a chave universal:
              todas as outras tabelas se ligam por{' '}
              <span className="font-mono text-cyan-300">cliente_id</span>.{' '}
              <span className="font-mono text-cyan-300">fontes_ingestao.id</span> é a
              rastreabilidade: tudo que é derivado sabe de qual evento bruto veio. RLS deny-all para
              anon; só service_role (n8n) escreve.
            </p>
            {tabelas.map((t) => (
              <div key={t.nome} className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h3 className="font-mono text-base font-semibold text-violet-300">{t.nome}</h3>
                  <span className="text-sm text-slate-400">{t.papel}</span>
                </div>
                <p className="mb-2 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Campos:</span>{' '}
                  <span className="font-mono text-xs text-slate-400">{t.campos}</span>
                </p>
                <p className="text-sm text-cyan-300/80">
                  <span className="font-medium text-slate-300">Relações:</span> {t.refs}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ============ CORRELAÇÕES ============ */}
        {tab === 'correlacoes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Todas as correlações — quem liga a quem, e como
            </h2>
            <p className="text-sm text-slate-400">
              A tabela abaixo é o mapa completo de onde cada dado é puxado e como se une no banco.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">De</th>
                    <th className="px-4 py-2.5 font-medium">Para</th>
                    <th className="px-4 py-2.5 font-medium">Tipo</th>
                    <th className="px-4 py-2.5 font-medium">Como funciona</th>
                  </tr>
                </thead>
                <tbody>
                  {correlacoes.map((c, i) => (
                    <tr key={i} className="border-t border-slate-800/70 align-top">
                      <td className="px-4 py-2.5 font-mono text-xs text-cyan-300/90">{c.de}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-violet-300/90">{c.para}</td>
                      <td className="px-4 py-2.5 text-slate-300">{c.tipo}</td>
                      <td className="px-4 py-2.5 text-slate-400">{c.como}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-sm text-slate-300">
              <strong className="text-cyan-300">O fluxo-coração:</strong> call de vendas órfã →
              conta no Portal → <span className="font-mono text-xs">match_retroativo(email)</span> →
              todas as fontes órfãs daquele email (e seus chunks/atas) voltam para o cliente → notas
              geradas com o histórico INTEIRO, desde antes de ele pagar.
            </div>
          </div>
        )}

        {/* ============ NOTAS ============ */}
        {tab === 'notas' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Os 7 tipos de nota — atômicas, com frontmatter comum herdado
            </h2>
            <p className="text-sm text-slate-400">
              Toda nota carrega o bloco comum do cliente (nicho, temperatura, consultor...) — a
              pergunta dos chefes filtra em QUALQUER nota. Notas são regeneradas do banco; o humano
              edita campos no banco (nicho, segmento) e a nota herda.
            </p>
            {tiposNota.map((n) => (
              <div key={n.nome} className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-emerald-300">{n.nome}</h3>
                  <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-xs text-slate-300">
                    {n.granularidade}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-xs text-slate-300">
                    {n.mutavel}
                  </span>
                </div>
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-medium text-white">Responde:</span> {n.responde}
                </p>
                <p className="mb-2 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Frontmatter específico:</span>{' '}
                  <span className="font-mono text-xs text-cyan-300/80">{n.especificos}</span>
                </p>
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Corpo:</span> {n.corpo}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
              <h3 className="mb-2 text-base font-semibold text-white">
                Estrutura de pastas (quando o Obsidian entrar)
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-slate-300">{`Segundo Cérebro/
├── Clientes/
│   └── Cleiton Fertilizantes/
│       ├── 00-Geral — Cleiton Fertilizantes.md
│       ├── 01-Decisões — Cleiton Fertilizantes.md
│       ├── 02-Problemas — Cleiton Fertilizantes.md
│       ├── 03-Processos — Cleiton Fertilizantes.md
│       ├── 04-Soluções — Cleiton Fertilizantes.md
│       └── Atas/
│           └── 2026-09-15 — 1ª Consultoria.md
└── MOCs/
    ├── MOC — Nicho Agro.md
    ├── MOC — Consultor Navaar.md
    └── MOC — Clientes em Risco.md`}</pre>
              <p className="mt-2 text-sm text-slate-400">
                Até lá, as notas vivem só no Supabase (
                <span className="font-mono text-xs">notas.conteudo_md + frontmatter</span>) e toda
                busca é SQL/RPC.
              </p>
            </div>
          </div>
        )}

        {/* ============ FRONTMATTER ============ */}
        {tab === 'frontmatter' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Frontmatter — o contrato de busca</h2>
            <p className="text-sm text-slate-400">
              Todo campo existe porque uma pergunta real depende dele. Flat (só escalares e listas)
              para Dataview/SQL lerem fácil.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Campo</th>
                    <th className="px-4 py-2.5 font-medium">Tipo</th>
                    <th className="px-4 py-2.5 font-medium">Origem</th>
                    <th className="px-4 py-2.5 font-medium">Para que serve</th>
                  </tr>
                </thead>
                <tbody>
                  {fmComum.map((f) => (
                    <tr key={f.campo} className="border-t border-slate-800/70">
                      <td className="px-4 py-2.5 font-mono text-xs text-cyan-300/90">{f.campo}</td>
                      <td className="px-4 py-2.5 text-slate-400">{f.tipo}</td>
                      <td className="px-4 py-2.5 text-slate-400">{f.origem}</td>
                      <td className="px-4 py-2.5 text-slate-300">{f.uso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
              <h3 className="mb-2 text-base font-semibold text-white">
                Exemplo real — bloco comum (toda nota carrega)
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-slate-300">{`cliente: "Cleiton Fertilizantes"
cliente_id: "a1b2c3d4"
aliases: ["Cleiton", "Cleiton ME"]
tipo: geral
produto: native
nicho: agro
segmento: "fertilizantes especiais"
status: ativo
status_projeto: construcao
temperatura: 72
temperatura_categoria: quente
tendencia_temperatura: subindo
consultor: "Felipe Navaar"
csm: "Izabel"
tags: [escopo, api, prazo]
versao: 14
atualizado_em: 2026-09-17`}</pre>
            </div>
          </div>
        )}

        {/* ============ TEMPERATURA ============ */}
        {tab === 'temperatura' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Temperatura — dinâmica, com motivo e evidência
            </h2>
            <p className="text-sm text-slate-400">
              Base 50 no cadastro · range 0–100 · recalculada a cada ata e a cada evento relevante
              de WhatsApp. A categoria é derivada do número, nunca escrita à mão.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Evento</th>
                    <th className="px-4 py-2.5 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {temperaturas.map((t) => (
                    <tr key={t.evento} className="border-t border-slate-800/70">
                      <td className="px-4 py-2.5 text-slate-300">{t.evento}</td>
                      <td
                        className={`px-4 py-2.5 font-mono text-xs ${t.delta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {t.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-slate-300">
                <strong className="text-rose-300">Regra de segurança:</strong> mudança de
                temperatura exige evidência citada (trecho da call/mensagem). IA nunca eleva/baixa
                por termo isolado — mesma régua semântica do WhatsApp SLA.
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-4 text-sm text-slate-300">
                <strong className="text-cyan-300">Categorias:</strong> quente ≥75 · morno ≥50 · frio
                ≥25 · risco &lt;25. Toda mudança vira linha em{' '}
                <span className="font-mono text-xs">temperatura_historico</span> com delta, motivo e
                evento de origem — é o que responde "por que esfriou?".
              </div>
            </div>
          </div>
        )}

        {/* ============ EXECUÇÃO ============ */}
        {tab === 'execucao' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Fases de execução — nada roda antes do escopo aprovado
            </h2>
            <div className="space-y-3">
              {fases.map((f) => (
                <div
                  key={f.fase}
                  className="flex gap-4 rounded-xl border border-slate-800 bg-[#0d1219] p-4"
                >
                  <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/40">
                    {f.fase}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{f.nome}</h3>
                    <p className="text-sm text-slate-400">{f.oque}</p>
                    <p className="mt-1 text-sm text-emerald-300/90">
                      <span className="font-medium">Aceite:</span> {f.aciete}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-slate-300">
              <strong className="text-amber-300">Fora do escopo (v1):</strong> sync bidirecional
              Obsidian→banco · notas de prospects que não pagaram (calls ficam vetorizadas, mas sem
              notas) · dashboard web · clientes Pass/Elite (o campo produto já suporta quando
              expandir).
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-4 text-sm text-slate-400">
              <strong className="text-slate-200">Artefatos-fonte:</strong>{' '}
              <span className="font-mono text-xs">artifacts/escopo-segundo-cerebro.md</span> (escopo
              11 seções) ·{' '}
              <span className="font-mono text-xs">artifacts/segundo-cerebro-schema.sql</span> (banco
              completo) ·{' '}
              <span className="font-mono text-xs">
                artifacts/notas-templates-segundo-cerebro.md
              </span>{' '}
              (7 templates) ·{' '}
              <span className="font-mono text-xs">artifacts/segundo-cerebro-pipeline.md</span>{' '}
              (workflows).
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Segundo Cérebro (Elite) · Adapta · escopo v1.0 — 17/09/2026 · aguardando validação do
        Rodrigo
      </footer>
    </div>
  )
}
