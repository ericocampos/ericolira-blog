---
title: 'Eu sei codar. Ninguém me ensinou a emitir uma nota fiscal'
description: 'Construir o produto é a parte que eu sei fazer. Sentei pra ligar a cobrança do meu SaaS e caí num buraco de PJ, ISS, contador, taxa de pagamento e uma política de privacidade que prometia algo ilegal. O primeiro capítulo da parte do SaaS que ninguém ensina pra quem é técnico.'
pubDate: '2026-06-01'
---

Eu tenho um SaaS em produção. É jurídico, roda há semanas, tem usuário real validando, tem pipeline verde, deploy automatizado, observabilidade, o pacote inteiro que um engenheiro sabe montar. A parte difícil, eu pensava, estava feita.

Aí sentei pra fazer a coisa mais óbvia do mundo: **começar a cobrar.** E descobri que não fazia ideia de como se cobra alguém no Brasil.

Não estou falando de `Stripe.checkout.create()`. Isso eu sei. Estou falando de tudo o que vem antes e em volta: como você decide o preço, como você recebe o dinheiro de forma legal, o que é uma nota fiscal de serviço, por que você precisa de uma empresa, o que um contador faz, e por que ligar um botão de pagamento te transforma, da noite pro dia, numa entidade com obrigações que você nem sabia que existiam.

Sou técnico. Nunca tive uma empresa. E este post é o primeiro de uma série sobre a parte do SaaS que ninguém te conta, porque quem te conta normalmente já passou por isso e esqueceu que um dia não sabia. Vou documentar tudo, errado e certo, até o dia em que eu tiver meu primeiro cliente pagante.

## "Quanto custa rodar isso?" e a descoberta de que essa não era a pergunta

Comecei pelo lugar que parecia mais sólido, o lugar de engenheiro: **os números.** Antes de inventar preço, quanto me custa atender um cliente? Felizmente eu já registro isso. Cada operação cara do meu produto passa por um modelo de IA externo, e eu gravo o custo de cada chamada no banco. Então fui lá ver.

A resposta me desarmou: **cada operação custa centavos.** Não "alguns reais que eu preciso diluir no preço". Centavos. Mesmo as operações pesadas, com documentos grandes e reprocessamento, ficam numa fração de real.

Fiquei um tempo olhando aquilo tentando entender por que me incomodava. E aí caiu a ficha. **Eu estava prestes a calcular o preço a partir do custo, e o custo era ruído.** Se eu cobrir o custo marginal de cada operação, eu cubro com troco de cafezinho. O que realmente sai dinheiro do meu bolso é outra coisa:

- A **infraestrutura fixa**, que é a mesma quer eu tenha um usuário ou cem. Um único pagante cobre isso, em qualquer preço.
- A **taxa de pagamento**, sobre a qual eu falo mais abaixo, e que tem um piso por transação que pode ser maior que o custo da operação inteira.
- O meu **tempo**, que não é caixa mas é o recurso mais escasso que eu tenho.

A lição número um chegou antes do primeiro preço: **num produto de software com custo marginal quase zero, "cobrir o custo" é quase um não-objetivo.** O preço não é um repasse de despesa. É outra coisa completamente diferente.

## Definir preço não é conta. É psicologia.

Tirado o custo da mesa, sobra a pergunta que engenheiro odeia: **quanto isso vale pra quem vai pagar?**

Não tem fórmula. Tem evidência. Eu fui olhar o que o mercado da minha área cobra, e os números variam de algumas dezenas de reais por mês, no piso, até produtos premium dez vezes mais caros, dependendo do que entregam. Olhei como eles estruturam: alguns cobram por volume (tantos documentos por mês), outros por assinatura cheia, quase todos oferecem um período de teste gratuito em vez de um plano grátis pra sempre.

Isso me ensinou duas coisas que eu não teria descoberto sozinho na minha planilha:

1. **O cliente do meu mercado já foi educado** a entender certos modelos de cobrança. Eu não preciso inventar um jeito novo de cobrar; inventar fricção é o oposto do que eu quero.
2. **O número certo não se acha pensando, se acha testando.** O preço de lançamento é uma hipótese, não uma conclusão. Você escolhe um número defensável, coloca no mundo, e observa quem assina, quem desiste, quem reclama. Eu vinha tratando preço como um problema de otimização com resposta única. É um problema de descoberta, com a resposta escondida no comportamento de gente real.

A armadilha do técnico aqui é sutil e eu caí redondo nela por uns minutos: a gente quer **derivar** o preço, calcular ele a partir de variáveis conhecidas, como se existisse um valor "correto" esperando ser encontrado. Não existe. Existe um valor que as pessoas pagam e um que elas não pagam, e a fronteira entre os dois só aparece quando você cobra.

## "É só plugar o Stripe", eu pensei

Decidido o modelo, voltei pro meu terreno. Pagamento é integração, integração eu faço dormindo. E o reflexo foi imediato, automático, quase muscular: **Stripe.** É a ferramenta que todo tutorial usa, que todo dev conhece, com a melhor API do mercado. Eu já tinha colocado "Stripe" no meu próprio documento de planejamento como se fosse decisão tomada.

Foi aí que parei pra checar uma coisa óbvia que eu tinha pulado: **o Stripe emite nota fiscal brasileira?**

Não emite. O Stripe é uma plataforma global de pagamento. Ele move dinheiro lindamente. Ele não tem nada a ver com a obrigação fiscal de um prestador de serviço brasileiro. E mais: a forma de pagamento que mais cresce no Brasil, o Pix, especialmente o Pix recorrente, é justamente o ponto mais fraco de um player global comparado com quem nasceu aqui.

Quando eu olhei as alternativas nacionais, a coisa ficou desconfortável. Existem gateways brasileiros que fazem **cobrança recorrente E emitem a nota fiscal no mesmo lugar**, com Pix nativo, por uma fração de centavo por nota. Ou seja: a ferramenta que o meu reflexo de engenheiro escolheu resolvia a parte fácil (mover dinheiro) e ignorava as duas partes difíceis (Pix e nota), enquanto uma ferramenta que eu nem conhecia resolvia exatamente as duas partes difíceis.

A lição doeu um pouco: **o default do técnico é a ferramenta famosa, não a ferramenta certa pro contexto.** Stripe é excelente pro problema do Vale do Silício. O meu problema é Brasil, B2B, Pix e nota fiscal municipal. São problemas diferentes, e a fama de uma ferramenta não diz nada sobre o segundo.

## Nota fiscal: o buraco que eu nem sabia que existia

E aqui chegamos na parte que mais me humilhou, porque é a mais básica pra qualquer pessoa que já teve um negócio e era território completamente alienígena pra mim.

Eu achava, sinceramente, que "receber dinheiro" era um problema técnico. Você integra um gateway, o dinheiro cai numa conta, fim. Eu não fazia a menor ideia de que, por trás daquele `payment succeeded`, existe uma máquina fiscal inteira que **é obrigação minha**, não do gateway:

- Pra cobrar, eu preciso de uma **pessoa jurídica**. Uma empresa. Com CNPJ. Receber dinheiro recorrente de cliente como pessoa física não é uma opção séria.
- Como eu presto serviço, cada cobrança precisa de uma **NFS-e**, a nota fiscal de serviço eletrônica. E aqui mora um detalhe que me deixou de queixo caído: **a NFS-e é municipal.** Cada cidade do Brasil tem o seu sistema, o seu layout, as suas regras, a sua instabilidade. Existem empresas inteiras cujo único produto é abstrair esse caos de prefeituras atrás de uma API.
- Tem o **ISS**, o imposto sobre serviço, que varia de 2% a 5% dependendo do município, e que precisa estar parametrizado certinho na nota: código de serviço, alíquota, regime tributário.
- E tem o detalhe final: **dá pra terceirizar a emissão da nota, não a obrigação de tê-la.** Existe uma porção de serviços que emitem a NFS-e por você, automaticamente, a partir do evento de pagamento. Mas nenhum deles te livra de ter a empresa, o enquadramento e, quase certamente, **um contador.**

Eu, que automatizo tudo, descobri o limite da automação: nada disso eu vou chutar. Código de serviço errado, alíquota errada, regime errado, isso não dá erro de compilação, dá multa. Essa é uma das primeiras coisas na minha vida de "fundador" que eu vou explicitamente terceirizar pra um humano especialista, e pagar com prazer por isso.

Ah, e como bônus cósmico: a Reforma Tributária entrou em vigor em 2026, no meio de tudo isso, mexendo justamente na parametrização fiscal. Então nem o conhecimento de quem já fazia isso há anos está totalmente estável. Cheguei na festa no exato momento em que mudaram as regras.

## Ligar a cobrança é "ir a público". E isso acorda monstros adormecidos.

O golpe final foi o mais traiçoeiro, porque não tinha nada a ver com dinheiro.

Eu tenho uma política de privacidade publicada. Levei a sério, foi revisada, está no ar. Me senti tranquilo. Até eu levar a decisão de cobrar pra uma revisão com olhos jurídicos e ouvir, em resumo: **a sua política não cobre nada disso, e pior, ela promete uma coisa que vai ficar ilegal no momento em que você cobrar.**

O problema é lindo de tão didático. A minha política, escrita quando o produto era gratuito, promete que, ao excluir a conta, **todos os dados do usuário são apagados imediatamente, sem janela de carência.** Ótima promessa de privacidade. Só que dado fiscal, nota fiscal emitida, registro de transação, a lei **obriga** a guardar por anos. Ou seja: no segundo em que eu emitir a primeira nota, a minha política de privacidade estará me obrigando a apagar um documento que a lei me obriga a manter.

São duas obrigações legais em rota de colisão, e eu só descobri porque alguém com a lente certa olhou. A correção é conceitualmente simples (a exclusão de dado de processo e de usuário continua imediata; só o dado fiscal ganha uma retenção própria e uma ressalva). Mas a lição é maior que a correção:

**Ligar a cobrança não é uma feature. É uma mudança de estado da empresa inteira.** Você deixa de ser "um projeto pessoal que algumas pessoas usam" e passa a ser "um fornecedor com clientes pagantes". E essa mudança acorda um monte de obrigações que estavam dormindo: fiscais, contratuais (termos de uso, direito de arrependimento, regras de cancelamento), e de proteção de dados. Nenhuma delas aparece no seu editor de código.

## O que aprendi (de novo, e pela primeira vez)

**Um: o produto é a parte que eu sei fazer, e talvez seja a menor parte.** Passei meses achando que o trabalho era o software. O software estava em produção e eu ainda não tinha como receber um único real de forma legal. A distância entre "funciona" e "é um negócio" é feita quase inteira de coisas que não são código.

**Dois: em software, preço não se calcula, se descobre.** O custo é ruído quando o marginal é quase zero. O preço é uma hipótese sobre quanto a coisa vale pra outra pessoa, e a única forma de validar a hipótese é cobrar e observar. Engenheiro quer derivar; aqui você tem que testar.

**Três: o default do técnico é a ferramenta famosa, e ela frequentemente resolve o problema errado.** Meu reflexo escolheu a melhor API global pra um problema que é local, fiscal e em Pix. A pergunta certa não é "qual a melhor ferramenta", é "qual o meu contexto", e o contexto de um SaaS brasileiro B2B é muito específico.

**Quatro: existe um imposto invisível que só é cobrado quando você tenta virar negócio.** PJ, nota fiscal municipal, ISS, contador, regime tributário, reforma no meio do caminho. Nada disso aparece enquanto você está construindo. Tudo isso aparece de uma vez quando você decide cobrar. Pra quem nunca teve empresa, é um continente inteiro que você não sabia que ia ter que atravessar.

**Cinco: terceirizar não é fraqueza, é arquitetura.** Do mesmo jeito que eu não escrevo meu próprio banco de dados, eu não vou inventar minha própria contabilidade fiscal. Tem coisa que o certo é delegar pra quem faz aquilo o dia inteiro, e a maturidade é reconhecer onde fica essa fronteira. A minha estava muito mais perto de mim do que eu imaginava.

**Seis: ligar a cobrança muda o estado da empresa, não só do código.** Uma feature flag de billing parece uma mudança técnica. Não é. É o gatilho que transforma você em fornecedor e acorda todas as obrigações que vinham dormindo. Trate "ir a público" como o evento que é, não como mais um deploy.

## E daqui pra frente

Eu terminei essa semana com um plano de produto bonito, um preço de hipótese, um modelo de cobrança escolhido, e a percepção clara de que **a parte de engenharia desse problema é a parte fácil e ela está praticamente resolvida.** O que falta é tudo o que eu nunca fiz: abrir a empresa, achar um contador, escolher o gateway certo (provavelmente um nacional, não o reflexo famoso), emendar a política de privacidade, escrever termos de uso, e só então ligar o botão.

Esse é o plano dos próximos capítulos. Vou contar como é abrir a PJ sendo desenvolvedor que nunca preencheu um formulário da Receita. Como é a primeira conversa com um contador. Quanto custa, de verdade e em reais, a soma de todos esses "custos escondidos" que eu fui descobrindo um por um. E, se tudo der certo, vou contar como foi receber o primeiro pagamento de um cliente de verdade.

Se você é técnico e está construindo algo sozinho achando que o produto é o trabalho: o produto é o trabalho que você consegue ver. Tem um outro, do tamanho de um país, do lado de fora do editor. Eu estou descobrindo ele agora, em tempo real, e vou anotar tudo.

Continua.
