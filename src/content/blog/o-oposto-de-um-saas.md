---
title: 'Construí o oposto de um SaaS'
description: 'Venho escrevendo sobre transformar código em negócio: preço, PJ, nota fiscal, cliente pagante. Em paralelo construí o contrário disso, uma ferramenta pública e de código aberto que mostra quanto os parlamentares da Paraíba gastam com dinheiro nosso. Não inventei nada, já tem gente fazendo isso muito bem. Usei o projeto pra outra coisa: aprender a dirigir a IA num problema de verdade, sem cliente, sem cobrança e sem nota.'
pubDate: '2026-06-02'
---

Os últimos textos daqui foram todos sobre a mesma viagem: pegar um software que funciona e transformar em negócio. Preço, gateway, PJ, nota fiscal municipal, contador, política de privacidade que vira ilegal no segundo em que você cobra. A parte do mundo que ninguém ensina pra quem é técnico.

Esse post é sobre uma coisa que fiz no caminho oposto. Um software que não tem cliente, não tem preço, não emite nota, não quer o seu dinheiro e nunca vai querer. Chama [Gastômetro](https://ericocampos.github.io/gastometro/), é de código aberto, e a única coisa que faz é pegar quanto os parlamentares federais da Paraíba gastam com a cota deles, dinheiro público, e botar num lugar onde qualquer pessoa consegue olhar.

Antes de qualquer coisa, um aviso de honestidade: eu não inventei nada aqui. Fiscalizar gasto público com tecnologia é coisa que gente boa faz há anos. A [Operação Serenata de Amor](https://serenata.ai/), da Open Knowledge Brasil, treinou uma IA chamada Rosie pra farejar reembolso estranho da cota dos deputados federais. Tem portal oficial, tem projeto de jornalismo de dados, tem ONG séria nisso. Eu não entrei pra competir com ninguém.

Entrei por um motivo bem mais egoísta e, acho, mais interessante de contar: eu queria um problema de verdade pra aprender a usar melhor a ferramenta de IA. E achei que valia mais escrever sobre o que esse laboratório me ensinou do que sobre os bugs que apareceram no meio.

## Por que um projeto de transparência virou meu campo de treino

Eu poderia ter treinado a ferramenta num projeto de brinquedo. To-do list, clone de alguma coisa, o de sempre. O problema do projeto de brinquedo é que ele não te ensina nada, porque não tem atrito real: o dado é limpo, o escopo é claro, e a IA acerta de primeira justamente porque você escolheu um problema que não machuca.

Transparência de dado público é o contrário disso. O dado existe, é oficial, é baixável, mas vem de um jeito que ninguém fora de um servidor do governo gostaria de tocar. Tem formato chato, encoding esquisito, endpoint que muda de humor dependendo do ano. É o tipo de coisa monótona, longa e ingrata que eu queria ver a IA enfrentar sob a minha direção, pra entender de verdade onde ela ajuda e onde ela me deixa na mão.

E tinha um bônus de propósito que me agradou: se eu ia gastar tempo aprendendo, que o subproduto fosse útil pra alguém. Melhor treinar fazendo uma coisa que um vizinho meu pode abrir pra ver no que o deputado dele gastou, do que fazer mais um clone que eu apago na semana seguinte.

## O que aprendi sobre delegar a parte chata

A primeira lição veio rápido e foi reconfortante: a IA brilha exatamente na parte que eu odeio.

A coleta do dado da Câmara é um pequeno inferno de arqueologia. Tem três jeitos de baixar a despesa de um deputado e dois deles te enganam em silêncio: uma API que responde zero pra anos antigos sem dar erro, um arquivo "puro" que vem truncado, e só um terceiro formato, zipado de um jeito teimoso, que presta de verdade desde 2008. O do Senado tem charme próprio, com o estado do senador escondido num canto inesperado do XML e a nota fiscal num código que não bate com a URL onde ela mora.

Esse tipo de tarefa, atravessar formato bagunçado com paciência infinita, testar uma hipótese de parsing, descobrir que o byte sete está errado, tentar de novo, é onde a ferramenta paga o ingresso. Eu descrevia o problema, mandava investigar, lia o resultado, corrigia o rumo. O que antes seria uma tarde inteira de tédio meu virou uma conversa de revisão. No fim o coletor junta mais de cem mil despesas desde 2008 num formato limpo, e a curva de gasto anual da Paraíba, que sai de uns três milhões em 2009 pra perto de oito milhões em 2025, só existe porque alguém (no caso, a máquina sob direção) teve estômago pra brigar com três versões de CSV.

A lição prática que levei daqui: quanto mais tediosa e bem-definida a tarefa, mais a IA rende, e mais o meu trabalho vira o de quem escreve o enunciado e confere a resposta, não o de quem digita.

## A lição que importou de verdade: segurar a mão da ferramenta

Se a parte chata me ensinou onde a IA ajuda, a parte sensível me ensinou onde eu não posso largar o volante. E essa foi a lição mais valiosa do projeto inteiro.

O Gastômetro tem uma seção de "pontos de atenção". Ele roda análises em cima dos dados pra achar coisas que valem um segundo olhar: um mês muito fora da curva do próprio parlamentar, um fornecedor que concentra quase tudo, pagamentos repetidos em valores redondos, gasto de combustível que, convertido em litros e quilômetros, daria uma rodagem difícil de explicar.

Aqui mora um risco enorme, e foi onde percebi uma coisa sobre a ferramenta: a IA, deixada solta, quer ser interessante. Peça um texto pra um indicador e ela te entrega algo com mais tempero do que o dado aguenta. Um número fora da curva, na mão dela, facilmente vira uma frase que cheira a acusação. E acusação a partir de estatística é injusto, porque um pico tem mil explicações legítimas.

Então a régua editorial virou minha, não dela, e foi dura: em lugar nenhum o site afirma fraude, crime ou irregularidade. A palavra é sempre "ponto de atenção". Todo indicador vem com o dado-fonte do lado e leva de volta pra nota fiscal, pra você conferir com seus próprios olhos. A ferramenta aponta onde olhar, quem julga é a pessoa. Levei isso até a interface: quando uma análise marca algo, a própria linha do gasto ganha um sinalzinho discreto no extrato, um "ó, esse aqui vale conferir", e não um carimbo de suspeito.

A lição que eu tiro disso vale pra muito além de transparência: a IA é ótima pra gerar, e justamente por isso o trabalho humano migra pra curadoria e pro freio. O que eu não deixei ela escolher foi mais importante do que tudo que deixei.

## E aqui o contraste com o SaaS fica nítido

A coisa que eu mais gosto nesse projeto é colocar ele lado a lado com a outra série, a do SaaS que quer, sim, o seu dinheiro.

No SaaS, todo valor que o software gera precisa ser capturado. Vira preço, vira receita, vira nota fiscal, senão o negócio morre. Cada decisão é puxada pela pergunta "isso me ajuda a cobrar?". No Gastômetro, o valor é de propósito dado embora. Não tem cliente, tem cidadão. Não tem preço, tem licença aberta. E, porque ninguém paga, faz sentido que ninguém seja dono: o código é público pra que ele sobreviva a mim, seja corrigido por quem quiser e seja de quem usar.

Isso muda o que "pronto" significa. Num SaaS, pronto é "dá pra cobrar". Aqui, pronto é "dá pra outra pessoa pegar e tocar sozinha". Por isso o projeto foi feito pra ser forkado: a fonte filtra por estado, e as configurações (qual UF, quais legislaturas, identidade visual) ficam num arquivo só. Em tese, alguém de outro estado clona, troca "PB" pelo seu, roda o coletor e tem a própria instância no ar. Eu briguei com os CSVs uma vez, a ideia é que ninguém mais precise.

Tem até uma decisão técnica que virou decisão de princípio. O dado fica versionado junto com o código, no git. O servidor só monta o site, nunca toca nas fontes do governo. O efeito colateral é que o dataset inteiro fica auditável no histórico: dá pra ver o que mudou, quando, e voltar atrás. Uma ferramenta de transparência que não fosse transparente com os próprios dados seria meio piada.

São as mesmas ferramentas, o mesmo teclado, a mesma forma de trabalhar delegando pra agentes. Apontadas pra dois lados opostos. Uma tentando virar negócio, com tudo que isso cobra. A outra existindo só porque dinheiro público devia ser fácil de olhar, e não era.

## O que sobra disso

No fim, o aprendizado que eu queria veio em dose dupla. Aprendi onde a IA é imbatível, na arqueologia chata de dado, e aprendi onde ela é perigosa, na hora de dar voz a um número, que é exatamente onde eu não posso soltar a mão. Pra uma pessoa só, no tempo livre, isso é uma alavanca absurda: dá pra entregar uma ferramenta cívica de verdade num punhado de fins de semana, coisa que há pouco tempo pediria um time.

E sobrou também uma coisa que não é sobre mim. O [Gastômetro PB está no ar](https://ericocampos.github.io/gastometro/), cobre desde 2008, e o [código está todo aberto no GitHub](https://github.com/ericocampos/gastometro). Se você é de outro estado e topa subir o seu, me procura, a parte difícil já está resolvida e documentada. E se você é só um cidadão querendo saber no que andam gastando em seu nome, era exatamente pra você que eu fiz, mesmo que tenha começado querendo só aprender uma ferramenta nova.
