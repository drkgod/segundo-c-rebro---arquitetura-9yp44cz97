import { useState } from 'react'

/* ============ DADOS (linguagem clara, humano) ============ */

const fontes = [
  {
    nome: 'tl;dv',
    icone: '🎥',
    entrega:
      'Toda conversa gravada: a call de vendas, o kickoff, as consultorias, o encerramento. O que foi dito, quem tava lá, quando foi.',
    gatilho: 'Toda vez que um consultor gravar uma call',
    wf: 'Fluxo 1 · Calls',
    idempotencia:
      'Se a mesma call cair duas vezes, o banco percebe e ignora a segunda. Nada é processado em dobro.',
    correlacao:
      'O cliente é reconhecido pelo email dele. Se ele ainda nem pagou, a call fica guardada esperando, e quando a conta dele for criada, tudo volta pra ele.',
    destino: 'Vira memória pesquisável (chunks), ata da reunião, decisões e problemas levantados',
    cor: 'cyan',
  },
  {
    nome: 'Portal',
    icone: '🚪',
    entrega:
      'O momento em que o cliente vira cliente de verdade: conta criada, em que etapa da jornada ele está, qual plano.',
    gatilho: 'Cliente pagou e a conta foi criada no portal',
    wf: 'Fluxo 5 · Portal',
    idempotencia: 'Cada cliente tem uma conta só. Criou, entra no cérebro.',
    correlacao:
      'É aqui que a mágica acontece: o sistema pega TUDO que estava guardado no email dele, inclusive a call de vendas de antes de pagar, e junta na pasta dele.',
    destino: 'A ficha do cliente nasce, com o histórico inteiro desde a primeira conversa',
    cor: 'violet',
  },
  {
    nome: 'WhatsApp',
    icone: '💬',
    entrega:
      'O que o cliente fala no grupo: reclamações, pedidos urgentes, elogios, aquele desabafo. O que já é registrado hoje pelo controle de SLA.',
    gatilho: 'Algo relevante acontece no grupo do cliente',
    wf: 'Fluxo 2 · WhatsApp',
    idempotencia:
      'Lê o que já está registrado no sistema de SLA, não baixa nem processa mensagem de novo.',
    correlacao:
      'Cada grupo sabe de quem é. Cliente puto no grupo esfria o cliente na hora, e fica escrito o porquê.',
    destino:
      'Vira memória pesquisável, registra o problema (e quantas vezes ele reclamou disso), mexe na temperatura',
    cor: 'green',
  },
  {
    nome: 'Drive',
    icone: '📁',
    entrega:
      'Os mapeamentos de processo: como o processo era antes, quanto tempo gastava, como ficou depois do projeto.',
    gatilho: 'Documento novo na pasta do cliente',
    wf: 'Fluxo 3 · Docs',
    idempotencia: 'Cada documento entra uma vez só.',
    correlacao:
      'Cada cliente tem sua pasta. O que é mapeado lá vira a história do processo dele: antes → depois.',
    destino: 'Vira a nota de processos: quanto tempo levava, quanto leva agora, qual foi o ganho',
    cor: 'amber',
  },
  {
    nome: 'GitHub',
    icone: '🐙',
    entrega:
      'O que foi construído de verdade: cada entrega, commit por commit. Se virou um sistema, uma automação, um RPA, qual tecnologia foi usada.',
    gatilho: 'Alguém sobe código no projeto do cliente',
    wf: 'Fluxo 4 · GitHub',
    idempotencia: 'Cada alteração entra uma vez só.',
    correlacao:
      'Cada cliente tem seu projeto. O que é construído lá dentro vira a nota de soluções, o que ele tem hoje, construído com a gente.',
    destino: 'Vira a nota de soluções: o que faz, com o que foi feito, em que pé está',
    cor: 'slate',
  },
]

const tabelas = [
  {
    nome: 'clientes',
    papel: 'A ficha de cada cliente. É daqui que tudo pende.',
    campos:
      'nome · nicho · objetivo declarado · email · contas (portal, GitHub, Drive, WhatsApp) · consultor e CSM · temperatura',
    refs: 'Toda outra tabela aponta pra cá. Achou o cliente, acha tudo.',
  },
  {
    nome: 'fontes_ingestao',
    papel:
      'A caixa de entrada bruta. Tudo que chega (call, mensagem, documento, código) passa por aqui primeiro.',
    campos:
      'de qual fonte veio · identificador único · quando aconteceu · o conteúdo original guardado inteiro',
    refs: 'Se a mesma coisa chegar duas vezes, é ignorada. E o original fica guardado, se a IA errar, dá pra refazer.',
  },
  {
    nome: 'chunks',
    papel:
      'A memória de verdade. Cada pedaço de conversa/documento, com assunto e vetor pra busca.',
    campos: 'trecho · assunto · vetor (pra busca por significado) · de qual evento veio',
    refs: "É o que permite perguntar 'o que foi falado sobre API?' e achar a parte exata, em qualquer call.",
  },
  {
    nome: 'atas_reunioes',
    papel: 'A ata de cada reunião: o resumo, o clima da conversa, como o cliente entrou e saiu.',
    campos: 'data · tipo da call · resumo em poucas linhas · temperatura antes e depois',
    refs: 'Cada decisão sabe em qual reunião foi tomada, porque aponta pra cá.',
  },
  {
    nome: 'decisoes',
    papel: 'Cada decisão que mexe no projeto, numa linha, na ordem em que aconteceu.',
    campos: 'o que foi decidido · o que muda no projeto · por que decidiram · em qual reunião',
    refs: 'É o histórico de decisões do cliente. Ninguém precisa lembrar de cabeça o que foi combinado.',
  },
  {
    nome: 'problemas',
    papel:
      'As dores do cliente: o que ele reclamou, de onde veio (WhatsApp, call, projeto) e quantas vezes.',
    campos:
      'descrição · gravidade · status (aberto, resolvido) · quantas vezes reclamou · primeira e última vez',
    refs: "É o que responde 'o que ele mais reclamou?', com número, não com impressão.",
  },
  {
    nome: 'processos',
    papel: 'Cada processo mapeado: como era, quanto tempo levava, como ficou, quanto ganhou.',
    campos:
      'nome do processo · antes (descrição + tempo) · depois (descrição + tempo) · ganho · de qual documento veio',
    refs: "É o que responde 'quanto melhorou?', com o número de antes e depois.",
  },
  {
    nome: 'solucoes',
    papel: 'O que foi construído: sistema, automação, RPA, integração, e com qual tecnologia.',
    campos:
      'nome · tipo (sistema criado, automação, RPA, integração, funcionalidade) · tecnologias · em que pé está',
    refs: "É o que responde 'o que a gente já entregou pra ele?', sem depender da memória do consultor.",
  },
  {
    nome: 'notas',
    papel: 'As notas prontas, o texto que você lê no Obsidian, já com etiquetas e vetor de busca.',
    campos: 'tipo da nota · texto completo · etiquetas · versão · vetor',
    refs: 'Sempre regeneradas do banco. Se um dado muda, a nota muda junto na próxima atualização.',
  },
  {
    nome: 'temperatura_historico',
    papel: 'O histórico do humor do cliente: cada mudança com o motivo e a prova.',
    campos: 'novo valor · quanto subiu ou caiu · por quê · qual evento causou',
    refs: "É o que responde 'por que esfriou?', com o trecho da conversa que causou.",
  },
]

const correlacoes = [
  {
    de: 'Call no tl;dv',
    para: 'Caixa de entrada',
    tipo: 'chega',
    como: 'Cada call nova entra uma vez só, guardada inteira.',
  },
  {
    de: 'Consultor na call',
    para: 'Ficha do cliente',
    tipo: 'de quem é',
    como: 'O email do consultor diz quem atendeu. O email do cliente diz de quem é a call.',
  },
  {
    de: 'Cliente que ainda não pagou',
    para: 'Fica guardado esperando',
    tipo: 'o detalhe que muda tudo',
    como: 'A call de vendas é guardada mesmo sem cliente ainda. Nada se perde.',
  },
  {
    de: 'Cliente pagou (conta no portal)',
    para: 'Tudo volta pra ele',
    tipo: 'o momento da mágica',
    como: 'O sistema busca tudo que estava guardado no email dele e junta na pasta dele, inclusive a call de vendas de antes de pagar.',
  },
  {
    de: 'Ficha do cliente',
    para: 'Todas as outras tabelas',
    tipo: 'o centro de tudo',
    como: 'Memória, atas, decisões, problemas, processos, soluções, notas e temperatura, tudo se une na ficha do cliente.',
  },
  {
    de: 'Caixa de entrada',
    para: 'Tudo que é derivado',
    tipo: 'rastro',
    como: 'Toda decisão, problema, processo e solução sabe de qual conversa/documento/código veio. Sempre dá pra voltar na origem.',
  },
  {
    de: 'Ata da reunião',
    para: 'Decisão',
    tipo: 'contexto',
    como: 'Cada decisão sabe em qual reunião foi tomada. A nota de decisões lista na ordem, com data.',
  },
  {
    de: 'Grupo do WhatsApp',
    para: 'Ficha do cliente',
    tipo: 'de quem é o grupo',
    como: 'Reclamação no grupo vira problema registrado, e esfria a temperatura, com o trecho citado.',
  },
  {
    de: 'Pasta no Drive',
    para: 'Ficha do cliente',
    tipo: 'de quem é a pasta',
    como: 'Documento novo na pasta vira processo: antes → depois, com tempos e ganho.',
  },
  {
    de: 'Projeto no GitHub',
    para: 'Ficha do cliente',
    tipo: 'de quem é o projeto',
    como: 'Código novo vira solução registrada: o que faz, com o que foi feito, em que pé está.',
  },
  {
    de: 'Banco',
    para: 'Etiquetas da nota',
    tipo: 'herança',
    como: 'As etiquetas do topo da nota vêm prontas do banco: nicho, temperatura, consultor. Ninguém preenche na mão.',
  },
  {
    de: 'Notas e memória',
    para: 'Busca por significado',
    tipo: 'pergunta livre',
    como: 'Tudo é vetorizado. Pergunta em português normal acha a resposta, mesmo sem saber o nome do campo.',
  },
  {
    de: 'Histórico de temperatura',
    para: 'Temperatura atual',
    tipo: 'sempre com motivo',
    como: 'Nada muda sem explicação: cada subida ou queda tem o motivo e a prova escritos.',
  },
]

const tiposNota = [
  {
    nome: '00-Geral',
    granularidade: 'uma por cliente',
    responde: 'Como está o cliente?',
    mutavel: 'Atualizada a cada novidade',
    especificos:
      'objetivo dele · com quem falamos · temperatura com o histórico · problemas em aberto · o que já foi construído · próximos passos',
    corpo:
      'Começa com um resumo de 2-3 linhas (quem só bate o olho já sabe o essencial). Depois: quem é o cliente, o que ele quer, como anda o humor, o que tá pegando, o que já foi entregue e o que vem agora.',
  },
  {
    nome: '01-Decisões',
    granularidade: 'uma por cliente',
    responde: 'O que a gente combinou com ele?',
    mutavel: 'Atualizada a cada decisão',
    especificos: 'quantas decisões · quando foi a última',
    corpo:
      'Na ordem, da mais recente pra mais antiga. Cada decisão: o que foi, o que muda no projeto, por que decidiram, e em qual reunião saiu.',
  },
  {
    nome: '02-Problemas',
    granularidade: 'uma por cliente',
    responde: 'O que ele mais reclamou?',
    mutavel: 'Atualizada a cada problema',
    especificos: 'quantos abertos · quantos resolvidos · o mais recorrente',
    corpo:
      'Agrupado por assunto. Cada problema: o quão sério é, se tá aberto ou resolvido, quantas vezes ele reclamou disso, e a última frase que ele falou sobre.',
  },
  {
    nome: '03-Processos',
    granularidade: 'uma por cliente',
    responde: 'Quanto melhorou depois da gente?',
    mutavel: 'Atualizada a cada mapeamento',
    especificos: 'quantos processos · ganho médio',
    corpo:
      'Por processo: como era e quanto tempo levava → como ficou e quanto leva agora → qual foi o ganho → de onde saiu esse número.',
  },
  {
    nome: '04-Soluções',
    granularidade: 'uma por cliente',
    responde: 'O que a gente já construiu pra ele?',
    mutavel: 'Atualizada a cada entrega',
    especificos: 'quantas soluções · de que tipo · tecnologia principal',
    corpo:
      'Por solução: o que faz, se é sistema/automação/RPA, com que tecnologia, e em que pé está.',
  },
  {
    nome: 'Ata',
    granularidade: 'uma por reunião',
    responde: 'O que aconteceu naquela call?',
    mutavel: 'Fica como está (histórico)',
    especificos:
      'data · tipo da call · temperatura antes e depois · decisões e problemas da call · link pra gravação',
    corpo:
      'Resumo em poucas linhas → o que foi decidido → problemas levantados → quem fica com o quê → frases importantes ditas na call → como o humor mudou.',
  },
  {
    nome: 'MOC',
    granularidade: 'uma por recorte',
    responde: 'Visões do conjunto: por nicho, por consultor, quem tá em risco',
    mutavel: 'Gerada automática',
    especificos: 'qual o recorte (nicho, consultor, risco)',
    corpo:
      "Lista de clientes com link pra ficha de cada um, temperatura e fase. Ex.: 'todos os clientes de agro', 'todos do Navaar', 'quem tá em risco'.",
  },
]

const fmComum = [
  {
    campo: 'cliente',
    tipo: 'nome',
    origem: 'ficha do cliente',
    uso: 'Saber de quem é a nota. É o título dela.',
  },
  {
    campo: 'aliases',
    tipo: 'apelidos',
    origem: 'preenchido uma vez',
    uso: "Como o cliente é chamado no dia a dia ('Cleiton', 'a Cleiton ME'), pra reconhecer a call pelo nome solto.",
  },
  {
    campo: 'tipo',
    tipo: 'rótulo',
    origem: 'automático',
    uso: 'Filtrar: só decisões, só problemas, só atas...',
  },
  {
    campo: 'produto',
    tipo: 'rótulo',
    origem: 'do cadastro',
    uso: 'Native, Pass ou Elite, pra não misturar universos.',
  },
  {
    campo: 'nicho',
    tipo: 'lista fechada',
    origem: 'a IA sugere, você corrige',
    uso: "A pergunta clássica: 'quais clientes de agro...?'",
  },
  {
    campo: 'segmento',
    tipo: 'texto livre',
    origem: 'a IA sugere, você corrige',
    uso: 'O sub-assunto do nicho (ex.: fertilizantes especiais).',
  },
  {
    campo: 'status',
    tipo: 'rótulo',
    origem: 'do cadastro',
    uso: 'Ativo, pausado, saiu, terminou.',
  },
  {
    campo: 'fase do projeto',
    tipo: 'rótulo',
    origem: 'da jornada',
    uso: 'Ainda sem plano, em descoberta, em construção, integrando, finalizado.',
  },
  {
    campo: 'temperatura',
    tipo: 'nota de 0 a 100',
    origem: 'recalculada a cada evento',
    uso: 'O número do humor. Sempre atualizado.',
  },
  {
    campo: 'categoria da temperatura',
    tipo: 'saída do número',
    origem: 'automático',
    uso: 'Quente, morno, frio ou risco. Ninguém escreve isso à mão, o número manda.',
  },
  {
    campo: 'tendência',
    tipo: 'saída dos últimos eventos',
    origem: 'automático',
    uso: 'Subindo, estável ou caindo.',
  },
  {
    campo: 'consultor e CSM',
    tipo: 'nomes',
    origem: 'da carteira',
    uso: 'Saber de quem é aquele cliente.',
  },
  {
    campo: 'tags',
    tipo: 'assuntos (máx 7)',
    origem: 'a IA classifica',
    uso: 'Do que a nota fala: escopo, prazo, API, reclamação... Nunca nome de cliente.',
  },
  {
    campo: 'versão e data de atualização',
    tipo: 'controle',
    origem: 'automático',
    uso: 'Saber se a nota tá fresca.',
  },
]

const temperaturas = [
  { evento: 'Elogiou, marco importante, entrega entrou em produção', delta: '+5 a +10' },
  { evento: 'Call boa: decisões tomadas, próximos passos claros', delta: '+5' },
  { evento: 'Reclamação nova', delta: '−5 a −10' },
  {
    evento: 'Cliente puto no WhatsApp (comprovado no que ele escreveu, não por palavra isolada)',
    delta: '−10 a −20',
  },
  {
    evento: 'Sinal de que quer sair (avaliado no contexto, nunca por uma palavra solta)',
    delta: '−20',
  },
  { evento: 'Sumiu: mais de 30 dias sem call e sem mensagem', delta: '−10' },
  { evento: 'Problema sério parado há mais de 7 dias', delta: '−5 por semana' },
]

const fases = [
  {
    fase: 'F0',
    nome: 'Criar o banco',
    oque: 'Criar o Supabase novo e rodar a estrutura',
    aceite: 'Tabelas prontas, busca funcionando, ninguém de fora entra',
  },
  {
    fase: 'F1',
    nome: 'Piloto com um cliente',
    oque: 'Fluxo de calls completo: baixa o tl;dv, a IA organiza tudo, gera as notas',
    aceite: 'Um cliente com o histórico inteiro dentro e as notas dele prontas pra ler',
  },
  {
    fase: 'F2',
    nome: 'Todos os clientes Native',
    oque: 'Conectar o portal e puxar o histórico de todos',
    aceite: 'Todo cliente Native com a ficha dele; nada de call perdida',
  },
  {
    fase: 'F3',
    nome: 'WhatsApp',
    oque: 'O que o cliente fala no grupo entra no cérebro na hora',
    aceite: 'Reclamação no grupo aparece como problema e mexe na temperatura no mesmo dia',
  },
  {
    fase: 'F4',
    nome: 'Drive e GitHub',
    oque: 'Mapeamentos viram nota de processos; código vira nota de soluções',
    aceite: 'Processos e soluções preenchidos no piloto',
  },
  {
    fase: 'F5',
    nome: 'Busca',
    oque: 'Perguntar em português e achar a resposta',
    aceite: 'As perguntas da liderança respondidas em menos de 30 segundos',
  },
]

const perguntas = [
  {
    p: 'Quais clientes de agro tão em risco?',
    resolve: 'Etiqueta de nicho + categoria de temperatura, em qualquer nota',
  },
  { p: 'Como tá o Cleiton?', resolve: 'Ficha geral dele: resumo, temperatura e próximos passos' },
  { p: 'Por que ele esfriou?', resolve: 'Histórico de temperatura: o motivo e a frase que causou' },
  {
    p: 'O que a gente combinou com ele?',
    resolve: 'Nota de decisões, na ordem, com a reunião de origem',
  },
  {
    p: 'Do que ele mais reclamou?',
    resolve: 'Nota de problemas: o assunto mais recorrente, com número de vezes',
  },
  {
    p: 'Quanto o processo melhorou?',
    resolve: 'Nota de processos: tempo de antes vs tempo de agora',
  },
  {
    p: 'O que já foi construído?',
    resolve: 'Nota de soluções: o que é, com que tecnologia, em que pé está',
  },
  { p: 'O que aconteceu na call de 15/09?', resolve: 'A ata do dia, com link pra gravação' },
  {
    p: 'Quais clientes do Navaar tão parados?',
    resolve: 'Recorte por consultor + fase do projeto',
  },
  {
    p: "'Clientes com problema de API'",
    resolve: 'Busca por significado, acha mesmo sem saber onde está escrito',
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
    { id: 'fontes', label: 'De onde vem' },
    { id: 'banco', label: 'Como guarda' },
    { id: 'correlacoes', label: 'Como se liga' },
    { id: 'notas', label: 'As notas' },
    { id: 'frontmatter', label: 'Etiquetas' },
    { id: 'temperatura', label: 'Temperatura' },
    { id: 'execucao', label: 'Por onde começa' },
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
                A memória completa de cada cliente · v1.0 · 17/09/2026
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-300">
                Um banco novo, só disso
              </span>
              <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-violet-300">
                Notas no Obsidian
              </span>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                5 fluxos automáticos
              </span>
            </div>
          </div>
          {/* PIPELINE RESUMO */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            {['Conversas (tl;dv)', 'Portal', 'WhatsApp', 'Drive', 'GitHub'].map((f) => (
              <span
                key={f}
                className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-slate-300"
              >
                {f}
              </span>
            ))}
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-300">
              A IA organiza em pedaços com assunto
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-violet-500/50 bg-violet-500/10 px-2.5 py-1.5 text-violet-300">
              Guarda tudo no banco, com busca por significado
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-300">
              Vira nota por cliente
            </span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-amber-300">
              O time consulta antes da call · a liderança busca o que quiser
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
                A história de um cliente, de ponta a ponta
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                O Cleiton aparece na nossa vida numa call de vendas, antes mesmo de existir como
                cliente. Essa conversa já fica guardada. Quando ele paga, tudo que estava guardado
                no nome dele se junta numa pasta só. Daí pra frente, tudo que acontece com ele
                alimenta a memória.
              </p>
              <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
                <div className="space-y-3 text-sm">
                  {[
                    {
                      n: '1',
                      t: 'A primeira conversa',
                      d: 'Call de vendas gravada no tl;dv. Ele ainda nem pagou, mas a conversa já fica guardada, e já dá pra pesquisar dentro dela.',
                    },
                    {
                      n: '2',
                      t: 'Ele pagou',
                      d: 'Conta criada no portal. Na mesma hora, o sistema busca tudo que estava guardado no email dele e junta: a call de vendas volta pra ele.',
                    },
                    {
                      n: '3',
                      t: 'A IA organiza',
                      d: 'Lê a conversa, separa por assunto, escreve a ata, anota as decisões e os problemas, e atualiza o humor dele, sempre com a frase que justifica.',
                    },
                    {
                      n: '4',
                      t: 'As notas nascem',
                      d: 'A ficha geral, as decisões, os problemas, a ata da reunião. Tudo com as etiquetas de busca no topo.',
                    },
                    {
                      n: '5',
                      t: 'E a vida continua alimentando',
                      d: 'Reclamação no WhatsApp esfria o humor dele na hora. Mapeamento no Drive vira nota de processos. Código no GitHub vira nota de soluções. Call nova, ata nova.',
                    },
                    {
                      n: '6',
                      t: 'Todo mundo consulta',
                      d: "O time abre a ficha antes da call. A liderança pergunta o que quiser ('quem tá em risco?') e a resposta sai em segundos. Os agentes de IA usam como contexto.",
                    },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300 ring-1 ring-cyan-500/40">
                        {s.n}
                      </span>
                      <div>
                        <span className="font-medium text-white">{s.t}</span>
                        <span className="text-slate-400">, {s.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">
                O que a liderança vai perguntar, e onde está a resposta
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/60 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Pergunta</th>
                      <th className="px-4 py-2.5 font-medium">A resposta está em</th>
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
                  t: 'Nada entra duas vezes',
                  d: 'Se a mesma call, mensagem ou documento aparecer de novo, o banco percebe e ignora. E o original fica guardado, se a IA errar, refaz sem perder nada.',
                },
                {
                  t: 'Tudo tem rastro',
                  d: 'Cada decisão, problema, processo e solução sabe de qual conversa ou documento saiu. Sempre dá pra voltar na origem e conferir.',
                },
                {
                  t: 'Nada muda sem motivo',
                  d: 'O humor do cliente nunca esfria ou esquenta do nada: cada mudança vem com a frase que causou. E as notas são sempre refeitas do banco, se um dado muda, a nota muda junto.',
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
            <h2 className="text-lg font-semibold text-white">De onde vem cada informação</h2>
            <p className="text-sm text-slate-400">
              Cinco lugares. Cada um tem seu fluxo automático e sua forma de saber de quem é a
              informação.
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
                    <span className="font-medium text-slate-300">O que entrega:</span>{' '}
                    <span className="text-slate-400">{f.entrega}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Quando dispara:</span>{' '}
                    <span className="text-slate-400">{f.gatilho}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Sem duplicar:</span>{' '}
                    <span className="text-slate-400">{f.idempotencia}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Como sabe de quem é:</span>{' '}
                    <span className="text-slate-400">{f.correlacao}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-slate-300">Vira:</span>{' '}
                    <span className="text-violet-300/90">{f.destino}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ BANCO ============ */}
        {tab === 'banco' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Como tudo é guardado</h2>
            <p className="text-sm text-slate-400">
              Um banco novo, só disso. A ficha do cliente é o centro: tudo se liga nela. E tudo que
              chega passa primeiro pela caixa de entrada, que guarda o original, dá sempre pra
              refazer.
            </p>
            {tabelas.map((t) => (
              <div key={t.nome} className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h3 className="text-base font-semibold text-violet-300">{t.nome}</h3>
                  <span className="text-sm text-slate-400">{t.papel}</span>
                </div>
                <p className="mb-2 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">O que tem dentro:</span> {t.campos}
                </p>
                <p className="text-sm text-cyan-300/80">
                  <span className="font-medium text-slate-300">Como se liga:</span> {t.refs}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ============ CORRELAÇÕES ============ */}
        {tab === 'correlacoes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Como cada coisa se liga na outra</h2>
            <p className="text-sm text-slate-400">
              O mapa completo: quem puxa o quê, de onde, e como junta tudo na ficha do cliente.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">De</th>
                    <th className="px-4 py-2.5 font-medium">Para</th>
                    <th className="px-4 py-2.5 font-medium">O que é</th>
                    <th className="px-4 py-2.5 font-medium">Como funciona</th>
                  </tr>
                </thead>
                <tbody>
                  {correlacoes.map((c, i) => (
                    <tr key={i} className="border-t border-slate-800/70 align-top">
                      <td className="px-4 py-2.5 text-cyan-300/90">{c.de}</td>
                      <td className="px-4 py-2.5 text-violet-300/90">{c.para}</td>
                      <td className="px-4 py-2.5 text-slate-300">{c.tipo}</td>
                      <td className="px-4 py-2.5 text-slate-400">{c.como}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-sm text-slate-300">
              <strong className="text-cyan-300">O pulo do gato:</strong> a call de vendas fica
              guardada mesmo antes do cliente existir. Quando ele paga e a conta é criada, o sistema
              busca tudo que estava no email dele e junta na pasta dele, a memória começa na
              PRIMEIRA conversa, não na primeira consultoria.
            </div>
          </div>
        )}

        {/* ============ NOTAS ============ */}
        {tab === 'notas' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              As notas, uma memória que dá gosto de ler
            </h2>
            <p className="text-sm text-slate-400">
              Cada nota é pequena e de um assunto só. Todas carregam as mesmas etiquetas no topo
              (nicho, temperatura, consultor), dá pra filtrar em qualquer uma. E ninguém escreve
              nota à mão: elas são sempre refeitas do banco, então nunca ficam velhas.
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
                  <span className="font-medium text-slate-300">O que mais aparece no topo:</span>{' '}
                  {n.especificos}
                </p>
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Como é por dentro:</span> {n.corpo}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-5">
              <h3 className="mb-2 text-base font-semibold text-white">
                Como fica a pasta de cada cliente (quando o Obsidian entrar)
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-slate-300">{`Segundo Cérebro/
├── Clientes/
│   └── Cleiton Fertilizantes/
│       ├── 00-Geral, Cleiton Fertilizantes.md
│       ├── 01-Decisões, Cleiton Fertilizantes.md
│       ├── 02-Problemas, Cleiton Fertilizantes.md
│       ├── 03-Processos, Cleiton Fertilizantes.md
│       ├── 04-Soluções, Cleiton Fertilizantes.md
│       └── Atas/
│           └── 2026-09-15, 1ª Consultoria.md
└── Recortes/
    ├── Clientes de Agro.md
    ├── Clientes do Navaar.md
    └── Quem tá em Risco.md`}</pre>
              <p className="mt-2 text-sm text-slate-400">
                Até lá, as notas já vivem prontas no banco, dá pra ler e buscar tudo por lá.
              </p>
            </div>
          </div>
        )}

        {/* ============ FRONTMATTER ============ */}
        {tab === 'frontmatter' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              As etiquetas do topo, o que permite achar depois
            </h2>
            <p className="text-sm text-slate-400">
              Toda nota começa com um bloco de etiquetas. Cada uma existe por um motivo: tem uma
              pergunta que só ela responde. Quase tudo é automático, ninguém fica preenchendo isso à
              mão.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Etiqueta</th>
                    <th className="px-4 py-2.5 font-medium">O que é</th>
                    <th className="px-4 py-2.5 font-medium">Quem preenche</th>
                    <th className="px-4 py-2.5 font-medium">Pra que serve</th>
                  </tr>
                </thead>
                <tbody>
                  {fmComum.map((f) => (
                    <tr key={f.campo} className="border-t border-slate-800/70">
                      <td className="px-4 py-2.5 text-cyan-300/90">{f.campo}</td>
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
                Como fica o topo de uma nota
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-slate-300">{`cliente: "Cleiton Fertilizantes"
apelidos: ["Cleiton", "Cleiton ME"]
tipo: geral
produto: native
nicho: agro
segmento: "fertilizantes especiais"
status: ativo
fase do projeto: em construção
temperatura: 72 (quente, subindo)
consultor: "Felipe Navaar" · CSM: "Izabel"
tags: escopo, API, prazo
atualizada em: 17/09/2026`}</pre>
            </div>
          </div>
        )}

        {/* ============ TEMPERATURA ============ */}
        {tab === 'temperatura' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              A temperatura, o humor do cliente, em número
            </h2>
            <p className="text-sm text-slate-400">
              Começa em 50 quando o cliente entra. Sobe e desce com o que acontece: cada reunião,
              cada mensagem no WhatsApp. E o mais importante: nenhuma mudança acontece sem que fique
              escrito o porquê.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">O que aconteceu</th>
                    <th className="px-4 py-2.5 font-medium">Mexe quanto</th>
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
                <strong className="text-rose-300">A regra que não quebra:</strong> a IA não pode
                esfriar um cliente por causa de uma palavra solta. "Se porventura a gente desistir"
                é hipótese, não ameaça. Ela olha a frase inteira, o contexto e a intenção, e sempre
                cita a frase que justificou a mudança.
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-4 text-sm text-slate-300">
                <strong className="text-cyan-300">As faixas:</strong> quente (75 pra cima) · morno
                (50 a 74) · frio (25 a 49) · risco (abaixo de 25). A faixa sai do número, ninguém
                escolhe à mão. E cada mudança fica registrada com o motivo, é o que responde "por
                que ele esfriou?".
              </div>
            </div>
          </div>
        )}

        {/* ============ EXECUÇÃO ============ */}
        {tab === 'execucao' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Por onde a gente começa</h2>
            <p className="text-sm text-slate-400">
              Nada roda antes do escopo estar fechado. A ordem é essa:
            </p>
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
                      <span className="font-medium">Pronto quando:</span> {f.aciete}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-slate-300">
              <strong className="text-amber-300">O que NÃO entra agora (v1):</strong> editar nota
              direto no Obsidian (ele só lê) · ficha de quem nunca pagou (as conversas ficam
              guardadas, mas sem ficha) · dashboard web · clientes Pass e Elite (o sistema já
              suporta quando quiser expandir).
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1219] p-4 text-sm text-slate-400">
              <strong className="text-slate-200">Documentos completos por trás disso:</strong>{' '}
              escopo (11 seções) · estrutura do banco · os 7 modelos de nota · o desenho dos 5
              fluxos. Tudo em artifacts/ no meu workspace.
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Segundo Cérebro (Elite) · Adapta · v1.0, 17/09/2026 · aguardando o ok do Rodrigo
      </footer>
    </div>
  )
}
