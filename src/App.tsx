import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Clock3,
  Code2,
  Database,
  FileText,
  FolderGit2,
  FolderOpen,
  Gauge,
  Github,
  HardDrive,
  KeyRound,
  Layers3,
  Link2,
  ListChecks,
  MessageCircle,
  Network,
  PanelTop,
  Quote,
  Rocket,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  Video,
  Waypoints,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

const sourceCards = [
  {
    id: 'tldv',
    label: 'Conversas',
    source: 'tl;dv',
    icon: Video,
    tone: 'cyan',
    description: 'Vendas, kickoff, consultorias e encerramentos.',
    input: 'Transcrição, participantes e data',
    output: 'Ata, decisões, problemas e memória pesquisável',
    link: 'O email do cliente reconhece de quem é a conversa.',
  },
  {
    id: 'portal',
    label: 'Portal',
    source: 'Portal Next',
    icon: PanelTop,
    tone: 'violet',
    description: 'O cadastro e a jornada oficial do cliente.',
    input: 'Conta criada, etapa e plano',
    output: 'Ficha do cliente e ligação com o histórico anterior',
    link: 'Quando ele paga, tudo que estava esperando volta para ele.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    source: 'Grupos do cliente',
    icon: MessageCircle,
    tone: 'green',
    description: 'O que ele pede, reclama, elogia ou sinaliza.',
    input: 'Mensagens já registradas pelo controle de SLA',
    output: 'Problemas, mudanças de temperatura e memória',
    link: 'O grupo já está ligado à ficha daquele cliente.',
  },
  {
    id: 'drive',
    label: 'Processos',
    source: 'Google Drive',
    icon: FolderOpen,
    tone: 'amber',
    description: 'O processo antes, durante e depois do projeto.',
    input: 'Mapeamentos e documentos do cliente',
    output: 'Processos com tempo antes, tempo depois e ganho',
    link: 'A pasta do Drive aponta para o cliente certo.',
  },
  {
    id: 'github',
    label: 'Construção',
    source: 'GitHub Elite',
    icon: Github,
    tone: 'slate',
    description: 'O que foi construído de verdade.',
    input: 'Projeto principal, submódulo e alterações',
    output: 'Soluções, funcionalidades, tecnologias e status',
    link: 'O projeto principal é do Elite. O submódulo mostra o cliente.',
  },
]

const databaseBlocks = [
  {
    name: 'clientes',
    title: 'Ficha de cada cliente',
    icon: CircleUserRound,
    tone: 'cyan',
    copy: 'É o centro. Nome, email, nicho, consultor, contas ligadas e temperatura.',
  },
  {
    name: 'fontes_ingestao',
    title: 'Caixa de entrada',
    icon: DownloadIcon,
    tone: 'slate',
    copy: 'Guarda o original de cada conversa, mensagem, documento ou alteração.',
  },
  {
    name: 'chunks',
    title: 'Memória pesquisável',
    icon: ScanSearch,
    tone: 'violet',
    copy: 'Pedaços de informação organizados por assunto para a busca encontrar o trecho certo.',
  },
  {
    name: 'atas_reunioes',
    title: 'Atas',
    icon: CalendarDays,
    tone: 'cyan',
    copy: 'Uma visão curta de cada reunião, com clima, resumo e próximos passos.',
  },
  {
    name: 'decisoes',
    title: 'Decisões',
    icon: CheckCircle2,
    tone: 'green',
    copy: 'O que foi combinado, o impacto e em qual conversa isso aconteceu.',
  },
  {
    name: 'problemas',
    title: 'Problemas',
    icon: CircleAlert,
    tone: 'red',
    copy: 'Dores, reclamações, gravidade, recorrência e se já foram resolvidas.',
  },
  {
    name: 'processos',
    title: 'Processos',
    icon: Workflow,
    tone: 'amber',
    copy: 'Antes e depois do processo, com tempo e ganho comprovado ou projetado.',
  },
  {
    name: 'solucoes',
    title: 'Soluções',
    icon: Rocket,
    tone: 'violet',
    copy: 'O que foi construído, para que serve, com qual tecnologia e em que pé está.',
  },
  {
    name: 'notas',
    title: 'Notas prontas',
    icon: BookOpen,
    tone: 'green',
    copy: 'O conteúdo que a equipe lê. Texto, etiquetas, versão e busca por significado.',
  },
  {
    name: 'temperatura_historico',
    title: 'Histórico do humor',
    icon: Gauge,
    tone: 'red',
    copy: 'Cada subida ou queda com seu motivo e a frase que comprova.',
  },
]

const noteCards = [
  {
    id: 'geral',
    number: '00',
    name: 'Geral',
    question: 'Como está esse cliente?',
    icon: CircleUserRound,
    tone: 'cyan',
    preview:
      'Cleiton está construindo a primeira versão do sistema. Está participativo, cobra clareza e o próximo passo é integrar os dados reais.',
    fields: ['nicho', 'fase do projeto', 'temperatura', 'próximos passos'],
    section: 'Quem ele é, o que quer, como está o relacionamento e o que precisa acontecer agora.',
  },
  {
    id: 'decisoes',
    number: '01',
    name: 'Decisões',
    question: 'O que foi combinado?',
    icon: CheckCircle2,
    tone: 'green',
    preview:
      '15/09. O piloto vai começar pela prospecção B2B. A parte financeira fica para uma etapa posterior.',
    fields: ['data', 'decisão', 'impacto', 'origem'],
    section: 'Uma sequência simples das decisões que mudaram o caminho do projeto.',
  },
  {
    id: 'problemas',
    number: '02',
    name: 'Problemas',
    question: 'O que mais incomoda?',
    icon: CircleAlert,
    tone: 'red',
    preview:
      'Demora no retorno. Quatro menções no WhatsApp. Continua aberto e está ligado ao cuidado com os próximos prazos.',
    fields: ['gravidade', 'recorrência', 'status', 'última menção'],
    section: 'As dores agrupadas por assunto, sem transformar cada mensagem em um problema novo.',
  },
  {
    id: 'processos',
    number: '03',
    name: 'Processos',
    question: 'Quanto melhorou?',
    icon: Workflow,
    tone: 'amber',
    preview:
      'Montar uma lista de 50 empresas levava dois dias. Com o novo fluxo, a fila inicial fica pronta em cerca de 15 minutos.',
    fields: ['antes', 'depois', 'ganho', 'fonte'],
    section:
      'A história do processo antes e depois, com o número separado do que ainda é expectativa.',
  },
  {
    id: 'solucoes',
    number: '04',
    name: 'Soluções',
    question: 'O que foi construído?',
    icon: Rocket,
    tone: 'violet',
    preview:
      'Radar Primitivo. Fila priorizada de empresas, ficha do lead e justificativa para cada prioridade.',
    fields: ['o que faz', 'tipo', 'tecnologia', 'status'],
    section: 'Tudo que foi criado ou conectado para resolver o problema do cliente.',
  },
  {
    id: 'ata',
    number: 'A',
    name: 'Ata',
    question: 'O que aconteceu na reunião?',
    icon: Video,
    tone: 'slate',
    preview:
      'A conversa foi produtiva. O escopo ficou mais estreito, três decisões foram tomadas e uma dependência foi aberta.',
    fields: ['data', 'participantes', 'decisões', 'próximos passos'],
    section: 'Uma memória daquela reunião, com contexto suficiente para quem não estava presente.',
  },
]

const timeline = [
  {
    date: '15 set',
    label: 'Consultoria',
    copy: 'Escopo ficou mais claro e três decisões foram tomadas.',
    tone: 'cyan',
    icon: Video,
  },
  {
    date: '09 set',
    label: 'Kickoff',
    copy: 'O objetivo e as pessoas que participam do projeto foram confirmados.',
    tone: 'violet',
    icon: Users,
  },
  {
    date: '02 set',
    label: 'WhatsApp',
    copy: 'Cliente pediu retorno sobre uma dependência. Problema ficou registrado.',
    tone: 'red',
    icon: MessageCircle,
  },
  {
    date: '22 ago',
    label: 'Processo',
    copy: 'O fluxo atual de prospecção foi mapeado no Drive.',
    tone: 'amber',
    icon: FolderOpen,
  },
]

const relationships = [
  {
    from: 'Conversa de vendas',
    to: 'Ficha do cliente',
    label: 'começa a história',
    copy: 'A conversa fica guardada mesmo antes do pagamento.',
  },
  {
    from: 'Conta criada no portal',
    to: 'Histórico inteiro',
    label: 'junta o passado',
    copy: 'O email liga as conversas anteriores ao cadastro novo.',
  },
  {
    from: 'Mensagem no WhatsApp',
    to: 'Problema e temperatura',
    label: 'mostra o momento',
    copy: 'O contexto da fala importa. Uma palavra isolada nunca decide.',
  },
  {
    from: 'Documento do Drive',
    to: 'Processo',
    label: 'mostra a mudança',
    copy: 'O antes e o depois ficam ligados à fonte.',
  },
  {
    from: 'Submódulo no GitHub',
    to: 'Solução',
    label: 'mostra a construção',
    copy: 'A entrega registrada vira uma memória do projeto.',
  },
]

const frontmatterFields = [
  {
    field: 'cliente',
    value: 'Cleiton Fertilizantes',
    source: 'Ficha do cliente',
    reason: 'Para toda nota saber de quem está falando.',
  },
  {
    field: 'apelidos',
    value: 'Cleiton, Cleiton ME',
    source: 'Ajuste humano',
    reason: 'Para reconhecer o mesmo cliente quando ele aparece com outro nome.',
  },
  {
    field: 'nicho',
    value: 'agro',
    source: 'Sugestão da IA, confirmação humana',
    reason: 'Para perguntar quais clientes de agro estão em risco.',
  },
  {
    field: 'fase_do_projeto',
    value: 'em construção',
    source: 'Jornada do portal',
    reason: 'Para entender onde o cliente está sem ler tudo.',
  },
  {
    field: 'temperatura',
    value: '72 · quente · subindo',
    source: 'Reuniões e WhatsApp',
    reason: 'Para saber o estado atual e o caminho que ele está fazendo.',
  },
  {
    field: 'consultor',
    value: 'Felipe Navaar',
    source: 'Carteira do cliente',
    reason: 'Para criar visões por consultor e dar contexto antes da call.',
  },
  {
    field: 'tags',
    value: 'escopo, API, prazo',
    source: 'Assuntos encontrados',
    reason: 'Para agrupar notas que falam de coisas parecidas.',
  },
  {
    field: 'atualizada_em',
    value: '17/09/2026',
    source: 'Automático',
    reason: 'Para saber se a leitura está atual.',
  },
]

const temperatureEvents = [
  {
    label: 'Call produtiva',
    value: '+5',
    detail: 'Decisões tomadas e próximos passos claros.',
    tone: 'up',
  },
  {
    label: 'Entrega importante',
    value: '+5 a +10',
    detail: 'Algo que o cliente esperava entrou em produção.',
    tone: 'up',
  },
  {
    label: 'Reclamação nova',
    value: '-5 a -10',
    detail: 'Uma dor nova aparece e ainda precisa de resposta.',
    tone: 'down',
  },
  {
    label: 'Cliente muito irritado',
    value: '-10 a -20',
    detail: 'O contexto da mensagem mostra irritação real.',
    tone: 'down',
  },
]

const phases = [
  {
    code: 'F0',
    title: 'Criar o banco',
    copy: 'A casa onde tudo vai viver.',
    done: true,
    icon: Database,
  },
  {
    code: 'F1',
    title: 'Testar com um cliente',
    copy: 'Uma história inteira, do começo ao fim.',
    done: false,
    icon: CircleUserRound,
  },
  {
    code: 'F2',
    title: 'Trazer todos os Native',
    copy: 'Nenhum histórico importante fica de fora.',
    done: false,
    icon: Users,
  },
  {
    code: 'F3',
    title: 'Ligar o WhatsApp',
    copy: 'O momento do cliente chega vivo.',
    done: false,
    icon: MessageCircle,
  },
  {
    code: 'F4',
    title: 'Ler Drive e GitHub',
    copy: 'Processos e construções entram na história.',
    done: false,
    icon: Layers3,
  },
  {
    code: 'F5',
    title: 'Abrir a busca',
    copy: 'Perguntas em português, respostas com contexto.',
    done: false,
    icon: Search,
  },
]

const toneMap: Record<
  string,
  { border: string; bg: string; text: string; soft: string; dot: string }
> = {
  cyan: {
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-300',
    soft: 'bg-cyan-400/5',
    dot: 'bg-cyan-400',
  },
  violet: {
    border: 'border-violet-400/30',
    bg: 'bg-violet-400/10',
    text: 'text-violet-300',
    soft: 'bg-violet-400/5',
    dot: 'bg-violet-400',
  },
  green: {
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-300',
    soft: 'bg-emerald-400/5',
    dot: 'bg-emerald-400',
  },
  amber: {
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/10',
    text: 'text-amber-300',
    soft: 'bg-amber-400/5',
    dot: 'bg-amber-400',
  },
  red: {
    border: 'border-rose-400/30',
    bg: 'bg-rose-400/10',
    text: 'text-rose-300',
    soft: 'bg-rose-400/5',
    dot: 'bg-rose-400',
  },
  slate: {
    border: 'border-slate-400/20',
    bg: 'bg-slate-400/10',
    text: 'text-slate-200',
    soft: 'bg-slate-400/5',
    dot: 'bg-slate-300',
  },
}

const navItems = [
  { id: 'visao', label: 'Visão geral', icon: BrainCircuit, helper: 'A história inteira' },
  { id: 'fontes', label: 'De onde vem', icon: Network, helper: 'As cinco fontes' },
  { id: 'banco', label: 'Como guarda', icon: Database, helper: 'As partes da memória' },
  { id: 'correlacoes', label: 'Como se liga', icon: Link2, helper: 'O caminho dos dados' },
  { id: 'notas', label: 'As notas', icon: BookOpen, helper: 'Exemplos de leitura' },
  { id: 'frontmatter', label: 'Etiquetas', icon: Tag, helper: 'Como encontrar depois' },
  { id: 'temperatura', label: 'Temperatura', icon: Gauge, helper: 'O momento do cliente' },
  { id: 'execucao', label: 'Por onde começa', icon: Rocket, helper: 'A ordem do trabalho' },
]

function DownloadIcon(props: { size?: number; strokeWidth?: number }) {
  return <ArrowUpRight {...props} />
}

function ToneIcon({ icon: Icon, tone, size = 18 }: { icon: any; tone: string; size?: number }) {
  const colors = toneMap[tone] || toneMap.slate
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colors.border} ${colors.bg} ${colors.text}`}
    >
      <Icon size={size} strokeWidth={1.8} />
    </span>
  )
}

function SectionHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string
  title: string
  copy: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/70">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          {eyebrow}
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{copy}</p>
      </div>
      {action}
    </div>
  )
}

function MiniBadge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  const colors = toneMap[tone] || toneMap.slate
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${colors.border} ${colors.bg} ${colors.text}`}
    >
      {children}
    </span>
  )
}

function SourcePill({ item }: { item: (typeof sourceCards)[number] }) {
  const Icon = item.icon
  const colors = toneMap[item.tone]
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs shadow-xl backdrop-blur-xl ${colors.border} ${colors.bg} ${colors.text}`}
    >
      <Icon size={14} />
      <span className="font-medium text-slate-200">{item.label}</span>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('visao')
  const [activeNote, setActiveNote] = useState('geral')
  const [activeTable, setActiveTable] = useState('clientes')
  const [mobileNav, setMobileNav] = useState(false)

  const selectedNote = noteCards.find((note) => note.id === activeNote) || noteCards[0]
  const SelectedNoteIcon = selectedNote.icon
  const selectedTable =
    databaseBlocks.find((table) => table.name === activeTable) || databaseBlocks[0]
  const SelectedTableIcon = selectedTable.icon

  const go = (next: string) => {
    setTab(next)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-200 selection:bg-cyan-400/20 selection:text-cyan-100">
      <style>{`
        :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        .font-display { font-family: 'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif; }
        .grid-surface { background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 52px 52px; }
        .hero-glow { background: radial-gradient(circle at 72% 30%, rgba(41,219,255,.16), transparent 25%), radial-gradient(circle at 90% 80%, rgba(139,92,246,.15), transparent 30%); }
        .text-glow { text-shadow: 0 0 24px rgba(41,219,255,.26); }
        .soft-glow { box-shadow: 0 0 80px rgba(41,219,255,.08); }
        .lift { animation: rise .65s cubic-bezier(.2,.8,.2,1) both; }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .pulse-dot { animation: pulseDot 2.3s ease-in-out infinite; }
        .shimmer-line { background: linear-gradient(90deg, rgba(255,255,255,.04), rgba(41,219,255,.5), rgba(255,255,255,.04)); background-size: 200% 100%; animation: shimmer 3.2s linear infinite; }
        @keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes pulseDot { 0%,100% { box-shadow: 0 0 0 0 rgba(41,219,255,.35); } 50% { box-shadow: 0 0 0 8px rgba(41,219,255,0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; } }
      `}</style>

      <div className="flex min-h-screen">
        <aside className="hidden w-[258px] shrink-0 border-r border-white/[0.07] bg-[#090c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.07] px-5 py-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10 text-cyan-300 shadow-[0_0_28px_rgba(41,219,255,.12)]">
                <BrainCircuit size={21} />
                <span className="pulse-dot absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">Segundo Cérebro</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Arquitetura Elite
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Visão do projeto
                </span>
                <MiniBadge tone="green">Em desenho</MiniBadge>
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Uma memória viva para cada cliente, com contexto desde a primeira conversa.
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600">
              Mapa do sistema
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-cyan-400/15 text-cyan-300' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-300'}`}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{item.label}</span>
                    <span
                      className={`block truncate text-[10px] ${active ? 'text-cyan-300/60' : 'text-slate-600'}`}
                    >
                      {item.helper}
                    </span>
                  </span>
                  {active && <ChevronRight size={14} className="text-cyan-300" />}
                </button>
              )
            })}
          </nav>
          <div className="border-t border-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck size={14} className="text-emerald-400" />
              Escopo visual antes da execução
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
            </div>
            <p className="mt-2 text-[10px] text-slate-600">28% da definição consolidada</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#07090d]/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
              <button
                type="button"
                className="flex items-center gap-2 lg:hidden"
                onClick={() => setMobileNav(!mobileNav)}
              >
                <BrainCircuit size={19} className="text-cyan-300" />
                <span className="font-display text-sm font-bold text-white">Segundo Cérebro</span>
              </button>
              <div className="hidden items-center gap-3 text-xs text-slate-500 lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Mapa visual da arquitetura <span className="text-slate-700">/</span>{' '}
                <span className="text-slate-400">exemplo ilustrativo</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <MiniBadge tone="cyan">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  Supabase novo
                </MiniBadge>
                <span className="hidden text-[10px] text-slate-600 sm:inline">
                  v1.0 · 17/09/2026
                </span>
              </div>
            </div>
            {mobileNav && (
              <div className="border-t border-white/[0.07] bg-[#090c11] p-3 lg:hidden">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => go(item.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs ${tab === item.id ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200' : 'border-white/[0.07] text-slate-400'}`}
                      >
                        <Icon size={14} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </header>

          <main className="grid-surface min-h-[calc(100vh-57px)]">
            <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
              {tab === 'visao' && (
                <>
                  <section className="hero-glow relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#0c121a] p-6 shadow-2xl shadow-cyan-950/20 sm:p-10 lg:p-12">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(41,219,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(41,219,255,.08) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
                      }}
                    />
                    <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
                      <div className="lift">
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                          <MiniBadge tone="cyan">MAPA VISUAL DO SISTEMA</MiniBadge>
                          <MiniBadge tone="violet">ANTES DE CONSTRUIR</MiniBadge>
                        </div>
                        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-white sm:text-6xl">
                          A história do cliente começa antes dele virar cliente.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                          A conversa de vendas fica guardada. Quando ele paga, ela se junta ao
                          cadastro. Depois, cada reunião, mensagem, processo e entrega alimenta uma
                          memória que qualquer pessoa consegue consultar.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => go('correlacoes')}
                            className="group inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#061016] transition hover:bg-cyan-200"
                          >
                            Ver o caminho da informação{' '}
                            <ArrowRight
                              size={16}
                              className="transition group-hover:translate-x-1"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => go('notas')}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                          >
                            <BookOpen size={16} />
                            Ver exemplos de notas
                          </button>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-500">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            Tudo com origem
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            Nada duplicado
                          </span>
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            Texto humano
                          </span>
                        </div>
                      </div>
                      <div className="relative mx-auto h-[350px] w-full max-w-[470px] sm:h-[390px]">
                        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] shadow-[0_0_100px_rgba(41,219,255,.11)]" />
                        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15" />
                        <div className="float-slow absolute left-1/2 top-1/2 z-10 w-[215px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/15 bg-[#101a24]/95 p-4 shadow-2xl backdrop-blur-xl">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-lg font-black text-[#061016]">
                              CF
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Cleiton Fertilizantes</p>
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                Exemplo de ficha viva
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-end justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                Momento
                              </p>
                              <p className="mt-1 text-3xl font-bold text-cyan-300">72</p>
                            </div>
                            <div className="text-right">
                              <MiniBadge tone="cyan">quente</MiniBadge>
                              <p className="mt-1 text-[10px] text-emerald-400">subindo ↗</p>
                            </div>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300" />
                          </div>
                          <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-3 text-[10px] text-slate-400">
                            <Activity size={12} className="text-cyan-300" />
                            Última novidade: call produtiva
                          </div>
                        </div>
                        <div className="absolute left-0 top-10">
                          <SourcePill item={sourceCards[0]} />
                        </div>
                        <div className="absolute right-0 top-12">
                          <SourcePill item={sourceCards[1]} />
                        </div>
                        <div className="absolute bottom-12 left-2">
                          <SourcePill item={sourceCards[2]} />
                        </div>
                        <div className="absolute bottom-7 right-1">
                          <SourcePill item={sourceCards[3]} />
                        </div>
                        <div className="absolute left-1/2 top-0 -translate-x-1/2">
                          <SourcePill item={sourceCards[4]} />
                        </div>
                        <div className="absolute left-[14%] top-[32%] h-px w-[25%] rotate-[18deg] bg-gradient-to-r from-cyan-300/0 via-cyan-300/30 to-cyan-300/0" />
                        <div className="absolute right-[14%] top-[33%] h-px w-[25%] -rotate-[18deg] bg-gradient-to-r from-violet-300/0 via-violet-300/30 to-violet-300/0" />
                      </div>
                    </div>
                  </section>

                  <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricCard
                      value="5"
                      label="fontes de vida real"
                      detail="conversas, portal, WhatsApp, Drive e GitHub"
                      tone="cyan"
                      icon={Network}
                    />
                    <MetricCard
                      value="10"
                      label="partes da memória"
                      detail="cada uma guarda um pedaço diferente da história"
                      tone="violet"
                      icon={Database}
                    />
                    <MetricCard
                      value="7"
                      label="tipos de nota"
                      detail="cada nota responde uma pergunta diferente"
                      tone="green"
                      icon={BookOpen}
                    />
                    <MetricCard
                      value="1"
                      label="chave para juntar tudo"
                      detail="a ficha do cliente liga o passado ao presente"
                      tone="amber"
                      icon={KeyRound}
                    />
                  </section>

                  <section className="mt-14">
                    <SectionHeader
                      eyebrow="A história acontecendo"
                      title="Como uma informação vira memória"
                      copy="Uma informação não cai direto em uma nota. Ela passa por uma sequência simples, para ficar guardada com contexto e com a origem visível."
                      action={
                        <button
                          type="button"
                          onClick={() => go('fontes')}
                          className="hidden items-center gap-2 text-xs font-semibold text-cyan-300 sm:flex"
                        >
                          Ver todas as fontes <ArrowUpRight size={14} />
                        </button>
                      }
                    />
                    <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
                      <ProcessCard
                        step="01"
                        title="Acontece"
                        copy="Uma call, uma mensagem, um documento ou uma entrega aparece."
                        icon={Zap}
                        tone="cyan"
                      />
                      <FlowArrow />
                      <ProcessCard
                        step="02"
                        title="Ganha contexto"
                        copy="A informação recebe assunto, cliente, data e origem. A IA ajuda a organizar, não inventa."
                        icon={Sparkles}
                        tone="violet"
                      />
                      <FlowArrow />
                      <ProcessCard
                        step="03"
                        title="Vira algo útil"
                        copy="Entra na memória certa: ata, decisão, problema, processo ou solução."
                        icon={BookOpen}
                        tone="green"
                      />
                    </div>
                  </section>

                  <section className="mt-14 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
                    <div>
                      <SectionHeader
                        eyebrow="Exemplo de leitura"
                        title="Uma nota que já responde sem você garimpar"
                        copy="O visual final precisa parecer uma boa ficha de cliente. A pessoa bate o olho e entende o momento antes de abrir os detalhes."
                      />
                      <NotePreview note={noteCards[0]} />
                    </div>
                    <div>
                      <div className="mb-6 flex items-end justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300/70">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                            Linha do tempo
                          </div>
                          <h3 className="font-display text-2xl font-semibold text-white">
                            O que foi mudando
                          </h3>
                        </div>
                        <MiniBadge tone="violet">4 sinais</MiniBadge>
                      </div>
                      <div className="relative space-y-3 pl-5 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-gradient-to-b before:from-cyan-300/50 via-violet-300/30 to-transparent">
                        {timeline.map((event) => {
                          const Icon = event.icon
                          const colors = toneMap[event.tone]
                          return (
                            <div
                              key={event.date}
                              className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-white/15"
                            >
                              <span
                                className={`absolute -left-[24px] top-5 h-3.5 w-3.5 rounded-full border-4 border-[#07090d] ${colors.dot}`}
                              />
                              <div className="flex items-start gap-3">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
                                >
                                  <Icon size={15} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-white">{event.label}</p>
                                    <span className="text-[10px] text-slate-600">{event.date}</span>
                                  </div>
                                  <p className="mt-1 text-xs leading-5 text-slate-400">
                                    {event.copy}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </section>

                  <section className="mt-14">
                    <SectionHeader
                      eyebrow="Memórias atômicas"
                      title="Cada tipo de nota tem uma função"
                      copy="Não é uma nota gigante com tudo misturado. São memórias pequenas, conectadas e fáceis de consultar."
                      action={
                        <button
                          type="button"
                          onClick={() => go('notas')}
                          className="hidden items-center gap-2 text-xs font-semibold text-cyan-300 sm:flex"
                        >
                          Abrir exemplos <ArrowRight size={14} />
                        </button>
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {noteCards.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onClick={() => {
                            setActiveNote(note.id)
                            go('notas')
                          }}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="mt-14 rounded-3xl border border-white/[0.08] bg-gradient-to-r from-cyan-400/[0.08] via-white/[0.03] to-violet-400/[0.08] p-6 sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <MiniBadge tone="cyan">A pergunta que guia tudo</MiniBadge>
                        <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                          Onde está a resposta quando alguém pergunta sobre um cliente?
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                          Ela não fica escondida em um lugar só. A ficha mostra o momento atual. As
                          notas mostram a história. A busca encontra o trecho. E a origem prova de
                          onde aquilo saiu.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => go('correlacoes')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/20"
                      >
                        Ver mapa completo <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                </>
              )}

              {tab === 'fontes' && <SourcesView onGo={go} />}
              {tab === 'banco' && (
                <DatabaseView
                  activeTable={activeTable}
                  setActiveTable={setActiveTable}
                  selectedTable={selectedTable}
                  SelectedTableIcon={SelectedTableIcon}
                />
              )}
              {tab === 'correlacoes' && <CorrelationsView onGo={go} />}
              {tab === 'notas' && (
                <NotesView
                  activeNote={activeNote}
                  setActiveNote={setActiveNote}
                  selectedNote={selectedNote}
                  SelectedNoteIcon={SelectedNoteIcon}
                />
              )}
              {tab === 'frontmatter' && <FrontmatterView />}
              {tab === 'temperatura' && <TemperatureView />}
              {tab === 'execucao' && <ExecutionView />}
            </div>
          </main>
          <footer className="border-t border-white/[0.07] bg-[#07090d] px-6 py-5 text-center text-[10px] text-slate-600">
            Segundo Cérebro · mapa visual antes da execução · linguagem feita para gente
          </footer>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  value,
  label,
  detail,
  tone,
  icon: Icon,
}: {
  value: string
  label: string
  detail: string
  tone: string
  icon: any
}) {
  const colors = toneMap[tone]
  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.soft} p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.04]`}
    >
      <div className="flex items-start justify-between">
        <p className={`font-display text-3xl font-bold ${colors.text}`}>{value}</p>
        <Icon size={17} className={colors.text} strokeWidth={1.7} />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-200">{label}</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p>
    </div>
  )
}

function ProcessCard({
  step,
  title,
  copy,
  icon: Icon,
  tone,
}: {
  step: string
  title: string
  copy: string
  icon: any
  tone: string
}) {
  const colors = toneMap[tone]
  return (
    <div className={`relative rounded-2xl border ${colors.border} ${colors.soft} p-5`}>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] font-bold tracking-[0.2em] ${colors.text}`}>
          {step}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
        >
          <Icon size={17} />
        </span>
      </div>
      <h3 className="mt-6 font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center text-slate-700 lg:flex">
      <ArrowRight size={21} />
    </div>
  )
}

function NotePreview({ note }: { note: (typeof noteCards)[number] }) {
  const colors = toneMap[note.tone]
  const Icon = note.icon
  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0e141d] shadow-2xl shadow-black/20">
      <div className="border-b border-white/[0.08] bg-white/[0.025] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <MiniBadge tone="cyan">NOTA GERADA</MiniBadge>
          <span className="text-[10px] text-slate-600">atualizada agora</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">
              00 Geral · Cleiton Fertilizantes
            </p>
            <p className="text-xs text-slate-500">
              A visão que você abre antes de perguntar qualquer coisa
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <MiniBadge tone="cyan">agro</MiniBadge>
          <MiniBadge tone="violet">em construção</MiniBadge>
          <MiniBadge tone="green">Felipe Navaar</MiniBadge>
          <MiniBadge tone="amber">escopo</MiniBadge>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-300">{note.preview}</p>
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Temperatura</p>
              <p className="mt-1 font-display text-3xl font-bold text-cyan-300">72</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-cyan-200">Quente</p>
              <p className="mt-1 text-[10px] text-emerald-400">subindo nos últimos sinais</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
            <span>frio</span>
            <span>morno</span>
            <span>quente</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            'Problemas em aberto: 3',
            'Decisões recentes: 14',
            'Processos mapeados: 4',
            'Próximo passo: integração',
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-400"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NoteCard({ note, onClick }: { note: (typeof noteCards)[number]; onClick: () => void }) {
  const colors = toneMap[note.tone]
  const Icon = note.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-2xl border ${colors.border} ${colors.soft} p-4 transition hover:-translate-y-1 hover:bg-white/[0.05]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
          >
            <Icon size={17} />
          </span>
          <div>
            <p className={`font-mono text-[10px] font-bold ${colors.text}`}>{note.number}</p>
            <h3 className="text-sm font-bold text-white">{note.name}</h3>
          </div>
        </div>
        <ArrowUpRight size={15} className="text-slate-600 transition group-hover:text-white" />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-300">{note.question}</p>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{note.section}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {note.fields.map((field) => (
          <span
            key={field}
            className="rounded-md bg-white/[0.06] px-2 py-1 text-[9px] text-slate-500"
          >
            {field}
          </span>
        ))}
      </div>
    </button>
  )
}

function SourcesView({ onGo }: { onGo: (next: string) => void }) {
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="Cinco pontos de entrada"
        title="De onde vem cada parte da história"
        copy="Cada fonte tem uma função. O sistema não tenta misturar tudo de uma vez. Ele reconhece o lugar, entende o que aquele lugar sabe e entrega para a memória certa."
        action={<MiniBadge tone="cyan">5 fontes conectadas</MiniBadge>}
      />
      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {sourceCards.map((item, index) => {
          const Icon = item.icon
          const colors = toneMap[item.tone]
          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.soft} p-4`}
            >
              <div className={`absolute right-3 top-3 text-4xl font-black opacity-[0.06]`}>
                0{index + 1}
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
              >
                <Icon size={19} />
              </span>
              <p className="mt-5 text-xs font-bold text-white">{item.label}</p>
              <p className="mt-1 text-[10px] text-slate-600">{item.source}</p>
            </div>
          )
        })}
      </div>
      <div className="space-y-3">
        {sourceCards.map((item, index) => {
          const Icon = item.icon
          const colors = toneMap[item.tone]
          return (
            <div
              key={item.id}
              className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/15"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_1fr_1fr_1fr] lg:items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={22} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Entrada {String(index + 1).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <InfoBlock title="O que chega" text={item.input} />
                <InfoBlock title="O que vira" text={item.output} />
                <InfoBlock title="Como reconhece" text={item.link} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Callout
          icon={KeyRound}
          tone="violet"
          title="O ponto mais importante"
          copy="A conversa de vendas pode chegar antes do cadastro. Ela não é descartada. Fica esperando o email do cliente aparecer no portal."
        />
        <Callout
          icon={ShieldCheck}
          tone="green"
          title="A regra de cuidado"
          copy="O sistema guarda a fonte original. Se uma interpretação da IA não fizer sentido, existe um caminho claro para conferir e refazer."
        />
      </div>
      <button
        type="button"
        onClick={() => onGo('correlacoes')}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
      >
        Agora veja como tudo se liga <ArrowRight size={15} />
      </button>
    </div>
  )
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {title}
      </p>
      <p className="text-sm leading-6 text-slate-400">{text}</p>
    </div>
  )
}

function Callout({
  icon: Icon,
  tone,
  title,
  copy,
}: {
  icon: any
  tone: string
  title: string
  copy: string
}) {
  const colors = toneMap[tone]
  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.soft} p-5`}>
      <div className="flex gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
        >
          <Icon size={17} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
        </div>
      </div>
    </div>
  )
}

function DatabaseView({
  activeTable,
  setActiveTable,
  selectedTable,
  SelectedTableIcon,
}: {
  activeTable: string
  setActiveTable: (id: string) => void
  selectedTable: (typeof databaseBlocks)[number]
  SelectedTableIcon: any
}) {
  const colors = toneMap[selectedTable.tone]
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="A casa da memória"
        title="Como tudo é guardado"
        copy="A ficha do cliente é o centro. Ao redor dela ficam as memórias específicas. Cada parte tem uma função, mas nenhuma perde a ligação com a origem."
        action={<MiniBadge tone="violet">10 blocos de memória</MiniBadge>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {databaseBlocks.map((item) => {
            const Icon = item.icon
            const itemColors = toneMap[item.tone]
            const active = item.name === activeTable
            return (
              <button
                type="button"
                key={item.name}
                onClick={() => setActiveTable(item.name)}
                className={`group rounded-2xl border p-4 text-left transition ${active ? `${itemColors.border} ${itemColors.soft} shadow-[0_0_30px_rgba(41,219,255,.05)]` : 'border-white/[0.08] bg-white/[0.025] hover:border-white/15'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${itemColors.bg} ${itemColors.text}`}
                  >
                    <Icon size={17} />
                  </span>
                  <ChevronRight size={15} className={active ? itemColors.text : 'text-slate-700'} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-[10px] text-slate-600">{item.name}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{item.copy}</p>
              </button>
            )
          })}
        </div>
        <div className="h-fit rounded-3xl border border-white/[0.1] bg-[#0e141d] p-5 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}
            >
              <SelectedTableIcon size={21} />
            </span>
            <MiniBadge tone={selectedTable.tone}>selecionado</MiniBadge>
          </div>
          <h3 className="mt-5 font-display text-xl font-semibold text-white">
            {selectedTable.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] text-slate-600">{selectedTable.name}</p>
          <p className="mt-5 text-sm leading-6 text-slate-400">{selectedTable.copy}</p>
          <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4">
            <DetailRow
              label="Entra"
              value={selectedTable.name === 'clientes' ? 'Portal e carteira' : 'Eventos das fontes'}
            />
            <DetailRow
              label="Se liga por"
              value={selectedTable.name === 'clientes' ? 'email e contas' : 'cliente + origem'}
            />
            <DetailRow
              label="Ajuda a responder"
              value={
                selectedTable.name === 'notas'
                  ? 'qualquer pergunta da equipe'
                  : 'uma parte da história'
              }
            />
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-100/70">
            Tudo aqui é conectado pela ficha do cliente. O nome muda conforme a parte, mas a
            história continua sendo uma só.
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-600">{label}</span>
      <span className="text-right text-slate-300">{value}</span>
    </div>
  )
}

function CorrelationsView({ onGo }: { onGo: (next: string) => void }) {
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="O fio que junta tudo"
        title="Como uma coisa encontra a outra"
        copy="O cliente é a âncora. Cada fonte chega por um caminho diferente, mas todas terminam na mesma ficha e nas notas que contam a história."
        action={<MiniBadge tone="cyan">13 ligações principais</MiniBadge>}
      />
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b1219] p-5 sm:p-8">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(41,219,255,.18), transparent 24%), linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 38px 38px, 38px 38px',
          }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
          <div className="space-y-3">
            {sourceCards.slice(0, 3).map((item) => {
              const Icon = item.icon
              const colors = toneMap[item.tone]
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border ${colors.border} ${colors.soft} p-3`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">entra com contexto</p>
                  </div>
                  <ArrowRight size={15} className="ml-auto text-slate-700" />
                </div>
              )
            })}
          </div>
          <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
            <div className="absolute inset-5 rounded-full border border-violet-300/20" />
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 p-[1px] shadow-[0_0_70px_rgba(41,219,255,.22)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0b1219] text-center">
                <BrainCircuit size={26} className="text-cyan-300" />
                <p className="mt-2 text-sm font-bold text-white">Ficha do cliente</p>
                <p className="mt-1 text-[10px] text-slate-500">a âncora da história</p>
              </div>
            </div>
            <div className="absolute -bottom-4 rounded-full border border-cyan-300/20 bg-[#0b1219] px-3 py-1.5 text-[10px] text-cyan-200">
              Cleiton · 72 · quente
            </div>
          </div>
          <div className="space-y-3">
            {sourceCards.slice(3).map((item) => {
              const Icon = item.icon
              const colors = toneMap[item.tone]
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border ${colors.border} ${colors.soft} p-3`}
                >
                  <ArrowRight size={15} className="text-slate-700" />
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">vira memória útil</p>
                  </div>
                </div>
              )
            })}
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <BookOpen size={15} />
                <span className="text-xs font-bold">Notas prontas</span>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                A equipe lê. A busca encontra. A origem comprova.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {relationships.map((item, index) => (
          <div
            key={item.from}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              <span className="text-cyan-300">0{index + 1}</span>
              {item.label}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1.5 text-cyan-200">
                {item.from}
              </span>
              <ArrowRight size={14} className="text-slate-600" />
              <span className="rounded-lg bg-violet-400/10 px-2.5 py-1.5 text-violet-200">
                {item.to}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{item.copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="flex items-start gap-3">
          <KeyRound size={17} className="mt-0.5 text-cyan-300" />
          <p className="text-sm leading-6 text-cyan-100/75">
            <strong className="text-cyan-200">O ponto mais importante:</strong> a conversa de vendas
            pode chegar antes da conta. Quando o email aparece no portal, o sistema junta o passado
            ao presente. A memória começa na primeira conversa.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onGo('notas')}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
      >
        Agora veja o resultado nas notas <ArrowRight size={15} />
      </button>
    </div>
  )
}

function NotesView({
  activeNote,
  setActiveNote,
  selectedNote,
  SelectedNoteIcon,
}: {
  activeNote: string
  setActiveNote: (id: string) => void
  selectedNote: (typeof noteCards)[number]
  SelectedNoteIcon: any
}) {
  const colors = toneMap[selectedNote.tone]
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="O que a equipe vai ler"
        title="Notas que parecem feitas para humanos"
        copy="Cada nota tem uma pergunta clara. O topo responde rápido. O restante guarda o contexto, sem transformar tudo em um texto gigante."
        action={<MiniBadge tone="green">6 exemplos de nota</MiniBadge>}
      />
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {noteCards.map((note) => {
            const Icon = note.icon
            const itemColors = toneMap[note.tone]
            const active = note.id === activeNote
            return (
              <button
                type="button"
                key={note.id}
                onClick={() => setActiveNote(note.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? `${itemColors.border} ${itemColors.soft}` : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]'}`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${itemColors.bg} ${itemColors.text}`}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-white">
                    {note.number} · {note.name}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-slate-500">
                    {note.question}
                  </span>
                </span>
                <ChevronRight size={15} className={active ? itemColors.text : 'text-slate-700'} />
              </button>
            )
          })}
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <FolderOpen size={15} className="text-amber-300" />
              Pasta do cliente
            </div>
            <div className="mt-3 space-y-2 border-l border-white/10 pl-3 text-[10px] text-slate-500">
              <p className="text-slate-300">Cleiton Fertilizantes</p>
              <p>00 Geral</p>
              <p>01 Decisões</p>
              <p>02 Problemas</p>
              <p>03 Processos</p>
              <p>04 Soluções</p>
              <p>Atas por reunião</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0e141d] shadow-2xl">
          <div className="border-b border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}
                >
                  <SelectedNoteIcon size={22} />
                </span>
                <div>
                  <p className={`font-mono text-[10px] font-bold tracking-[0.2em] ${colors.text}`}>
                    {selectedNote.number} · NOTA ATÔMICA
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                    {selectedNote.name} · Cleiton Fertilizantes
                  </h3>
                </div>
              </div>
              <MiniBadge tone="green">gerada do banco</MiniBadge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <MiniBadge tone="cyan">agro</MiniBadge>
              <MiniBadge tone="violet">em construção</MiniBadge>
              <MiniBadge tone="green">Felipe Navaar</MiniBadge>
              <MiniBadge tone="amber">escopo</MiniBadge>
              <MiniBadge tone="slate">17/09/2026</MiniBadge>
            </div>
          </div>
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                <FileText size={13} />
                Resumo visível
              </div>
              <p className="text-base leading-7 text-slate-200">{selectedNote.preview}</p>
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  O que esta nota guarda
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{selectedNote.section}</p>
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                <Tag size={13} />
                Campos que ajudam a achar
              </div>
              <div className="space-y-2">
                {selectedNote.fields.map((field, index) => (
                  <div
                    key={field}
                    className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                  >
                    <span className="text-xs text-slate-400">{field}</span>
                    <Check
                      size={14}
                      className={index < 2 ? 'text-emerald-400' : 'text-slate-600'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.08] bg-black/10 px-5 py-4 text-xs text-slate-500 sm:px-7">
            <span className="text-cyan-300">Fonte:</span> a nota sempre aponta para a conversa,
            documento ou entrega que sustentou aquela frase.
          </div>
        </div>
      </div>
    </div>
  )
}

function FrontmatterView() {
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="As etiquetas do topo"
        title="O que permite encontrar a nota depois"
        copy="O nome técnico é frontmatter. Na prática, é o cartão de identificação da nota. Ele diz de quem é, sobre o que fala, em que momento o cliente está e como encontrar outras notas parecidas."
        action={<MiniBadge tone="cyan">8 campos essenciais</MiniBadge>}
      />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/[0.1] bg-[#0e141d] p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300/70">
                Exemplo visual
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                Topo da nota do Cleiton
              </h3>
            </div>
            <Tag size={20} className="text-cyan-300" />
          </div>
          <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-[#080d13] p-4 font-mono text-xs leading-7">
            <p>
              <span className="text-violet-300">cliente</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-emerald-300">"Cleiton Fertilizantes"</span>
            </p>
            <p>
              <span className="text-violet-300">apelidos</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-amber-300">[Cleiton, Cleiton ME]</span>
            </p>
            <p>
              <span className="text-violet-300">nicho</span>
              <span className="text-slate-600">:</span> <span className="text-cyan-300">agro</span>
            </p>
            <p>
              <span className="text-violet-300">fase</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-cyan-300">em construção</span>
            </p>
            <p>
              <span className="text-violet-300">temperatura</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-cyan-300">72, quente, subindo</span>
            </p>
            <p>
              <span className="text-violet-300">consultor</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-emerald-300">Felipe Navaar</span>
            </p>
            <p>
              <span className="text-violet-300">tags</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-amber-300">[escopo, API, prazo]</span>
            </p>
            <p>
              <span className="text-violet-300">atualizada_em</span>
              <span className="text-slate-600">:</span>{' '}
              <span className="text-slate-300">17/09/2026</span>
            </p>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/5 p-4">
            <Sparkles size={17} className="mt-0.5 shrink-0 text-violet-300" />
            <p className="text-xs leading-5 text-violet-100/70">
              A IA pode sugerir nicho e etiquetas. A pessoa responsável pode corrigir. Depois disso,
              todas as notas daquele cliente herdam a informação certa.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {frontmatterFields.map((item) => (
            <div
              key={item.field}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-cyan-300/20"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-cyan-300">{item.field}</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-[10px] text-slate-600">Vem de: {item.source}</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-cyan-300" />
          <div>
            <h3 className="text-sm font-bold text-white">As etiquetas respondem perguntas reais</h3>
            <p className="mt-1 text-xs text-slate-500">Elas não existem para enfeitar a nota.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <QuestionCard
            question="Quais clientes de agro estão em risco?"
            answer="nicho + temperatura"
          />
          <QuestionCard
            question="Quais clientes do Navaar estão parados?"
            answer="consultor + fase"
          />
          <QuestionCard
            question="Quais problemas aparecem mais?"
            answer="tags + nota de problemas"
          />
        </div>
      </div>
    </div>
  )
}

function QuestionCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
      <Quote size={14} className="text-violet-300" />
      <p className="mt-3 text-xs leading-5 text-slate-300">{question}</p>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-cyan-300">
        <ArrowRight size={12} />
        {answer}
      </div>
    </div>
  )
}

function TemperatureView() {
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="O momento do cliente"
        title="Temperatura não é chute"
        copy="É uma leitura contínua do relacionamento. Reuniões, mensagens, entregas e problemas mudam o número. Cada mudança precisa ter contexto e uma fonte para conferir."
        action={<MiniBadge tone="red">sempre com evidência</MiniBadge>}
      />
      <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-3xl border border-white/[0.1] bg-[#0e141d] p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                Exemplo atual
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                Cleiton Fertilizantes
              </h3>
            </div>
            <Gauge size={24} className="text-cyan-300" />
          </div>
          <div className="mt-9 flex items-end justify-between">
            <div>
              <p className="font-display text-7xl font-bold tracking-[-0.06em] text-cyan-300">72</p>
              <p className="mt-2 text-sm text-slate-400">quente e subindo</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                última mudança
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-300">+5</p>
              <p className="mt-1 text-[10px] text-slate-500">call produtiva</p>
            </div>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-300" />
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-slate-600">
            <span>risco</span>
            <span>frio</span>
            <span>morno</span>
            <span>quente</span>
          </div>
          <div className="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
            <div className="flex gap-3">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-cyan-300" />
              <p className="text-xs leading-5 text-cyan-100/70">
                Uma frase sozinha não muda a leitura. A intenção, o momento e o que aconteceu antes
                entram juntos.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {temperatureEvents.map((event) => (
            <div
              key={event.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${event.tone === 'up' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}
                >
                  {event.tone === 'up' ? <ArrowUpRight size={18} /> : <CircleAlert size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">{event.label}</h3>
                    <span
                      className={`font-mono text-xs font-bold ${event.tone === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}
                    >
                      {event.value}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{event.detail}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5">
            <div className="flex gap-3">
              <BrainCircuit size={18} className="mt-0.5 text-violet-300" />
              <div>
                <h3 className="text-sm font-bold text-white">O histórico explica o número</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Se o cliente esfriou, a equipe consegue ver quando aconteceu, qual foi o motivo e
                  qual trecho sustentou a leitura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExecutionView() {
  return (
    <div className="lift">
      <SectionHeader
        eyebrow="Da ideia para o mundo"
        title="Por onde começa"
        copy="A ordem protege o projeto. Primeiro definimos a casa e testamos uma história completa. Só depois abrimos para todos os clientes."
        action={<MiniBadge tone="amber">escopo antes da execução</MiniBadge>}
      />
      <div className="relative">
        <div className="absolute bottom-6 left-[22px] top-6 w-px bg-gradient-to-b from-cyan-300/50 via-violet-300/30 to-transparent sm:left-[27px]" />
        <div className="space-y-3">
          {phases.map((phase, index) => {
            const Icon = phase.icon
            return (
              <div
                key={phase.code}
                className="relative flex gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-white/15 sm:gap-5 sm:p-5"
              >
                <div
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${phase.done ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-cyan-400/20 bg-[#0b1219] text-cyan-300'}`}
                >
                  {phase.done ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-cyan-300">
                      {phase.code}
                    </span>
                    <h3 className="text-sm font-bold text-white">{phase.title}</h3>
                    {phase.done && <MiniBadge tone="green">base definida</MiniBadge>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{phase.copy}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <span className="rounded-lg bg-white/[0.05] px-2.5 py-1.5">critério claro</span>
                    <span className="rounded-lg bg-white/[0.05] px-2.5 py-1.5">
                      fonte preservada
                    </span>
                    {index > 0 && (
                      <span className="rounded-lg bg-white/[0.05] px-2.5 py-1.5">
                        vem depois do piloto
                      </span>
                    )}
                  </div>
                </div>
                <span className="hidden text-[10px] text-slate-700 sm:block">0{index + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Callout
          icon={ShieldCheck}
          tone="green"
          title="Só avança quando dá para conferir"
          copy="Cada etapa termina com uma entrega que alguém consegue abrir, ler e validar. Não basta dizer que o fluxo funcionou."
        />
        <Callout
          icon={ListChecks}
          tone="amber"
          title="O que fica fora por enquanto"
          copy="Editar pelo Obsidian, dashboard operacional e clientes Pass ou Elite. A base fica preparada, mas o primeiro ciclo é Native."
        />
      </div>
    </div>
  )
}
