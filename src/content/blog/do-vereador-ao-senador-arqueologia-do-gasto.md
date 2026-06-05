---
title: 'Do vereador ao senador: a arqueologia de saber quanto custa um parlamentar'
description: 'No post anterior parei no federal. Depois desci até a câmara da sua cidade e subi de volta até o Senado, e fiz a mesma pergunta para as quatro esferas: quanto custa esse parlamentar pra você? O dado é público em todas. O problema é que ele nunca combina com ele mesmo. Cada esfera guarda em um lugar, num formato e com uma chave diferente, sempre num CSV que ninguém fora de um servidor do governo gostaria de abrir. Este é o relato de campo de cruzar quatro burocracias com a mesma IA, e de descobrir que a parte difícil quase nunca é a técnica.'
pubDate: '2026-06-05'
---

No [post anterior](/blog/o-oposto-de-um-saas/) eu parei no federal: a arqueologia do CSV da Câmara e o XML do Senado com o estado do senador escondido num canto. De lá eu fiz o caminho inteiro. Desci até a câmara de João Pessoa, e depois até as outras 222 cidades da Paraíba. Passei pela Assembleia do estado e voltei pro Senado. Quatro esferas de governo, a mesma pergunta boba em todas: quanto esse parlamentar custa pra você, com o seu dinheiro?

O dado existe e é oficial nas quatro. Esse não é o problema. O problema é que ele nunca combina com ele mesmo. Cada esfera guarda a informação num lugar diferente, num formato diferente, com uma chave diferente pra identificar a pessoa. Pra mim, que sou técnico, virou uma sequência de quebra-cabeças. Pra um cidadão comum, que só queria saber no que o vereador dele gastou, é uma parede.

Esse post é sobre essa parede. E sobre uma coisa que eu não esperava: o único lugar onde o dado estava razoavelmente domado foi justamente o que eu mais temia.

## Município: 223 câmaras, 223 jeitos de não te contar

Comecei pelo vereador, achando que seria o mais fácil. É o oposto. A Paraíba tem 223 câmaras municipais. Cada uma publica, ou não publica, do jeito que quer. Uma bota a verba indenizatória num PDF escaneado, que é uma imagem de papel, ilegível por máquina. Outra põe num xlsx caprichado. A maioria não põe nada, e te manda pro Tribunal de Contas.

Foi aí que veio a surpresa boa: o **TCE-PB tem dados abertos que cobrem todas as 223 de uma vez**. Um lugar só, um formato só, a folha e as despesas de cada câmara em CSV. Varrer fonte por fonte, cidade por cidade, é justamente o tipo de tarefa onde a IA brilha: o que seria semanas de garimpo manual virou três dias de investigação dirigida, eu descrevendo o que procurar e conferindo o resultado. E achar, no meio disso, uma base única e padronizada foi um alívio. É de longe a coisa mais bem organizada que encontrei no projeto inteiro.

O "quase" é importante, porque padronizado não quer dizer fácil. O CSV do TCE vem com armadilhas que existem só pra te lembrar que você está mexendo em dado de governo:

- O CPF aparece **mascarado** numa tabela (algo como `***.456.789-**`) e **inteiro** em outra (`00012345678909`, números fictícios aqui). Pra casar a pessoa entre as duas, o jeito é pegar os seis dígitos do meio, que sobrevivem nas duas grafias.
- O arquivo tem **bytes nulos** no meio do texto. O leitor de CSV padrão do Python simplesmente quebra. Você descobre isso depois de meia hora achando que o problema é seu.
- A mesma pessoa aparece duas vezes no mesmo mês, uma como "vereador" e outra como "vereador presidente interino", e se você não deduplica por CPF a cidade ganha um vereador fantasma.

Domada essa parte, dava pra perguntar o que cada câmara paga por vereador. E a resposta foi a primeira lição sobre padrão: **não existe um padrão**. De 223 câmaras, só cerca de 22 pagam uma verba indenizatória rastreável por vereador. Outras 66 pagam diárias. A maioria esmagadora não tem nada além do subsídio que dá pra atribuir a uma pessoa. Os conjuntos se sobrepõem só em parte.

Isso me obrigou a uma decisão de produto que virou decisão de princípio: eu não ia forçar uma "tabela única e justa" entre cidades que não têm o mesmo dado. O site mostra o que **cada** cidade tem, e diz de onde veio. Expor a falta de padrão é parte da transparência, não um defeito a esconder.

## A nota que eu não achei

Dentro do município teve um caso que resume o projeto. Eu me perguntei: "tem como ver a nota fiscal da diária?". A resposta honesta é que, se existe, até agora eu não consegui encontrar. E por que eu acho que ela talvez nem exista é a parte interessante.

Verba indenizatória é reembolso: o parlamentar gasta, apresenta a nota, é ressarcido. Tem documento. Diária é outra coisa: é um adiantamento de viagem, autorizado por uma portaria, não por uma nota fiscal. Se existe um comprovante desse tipo, ele não aparece em nenhuma das fontes abertas que eu vasculhei.

Só que o empenho da diária, no CSV do TCE, carrega um campo de **histórico**: um texto livre que descreve a viagem. Destino, motivo, datas. Coisas como "deslocamento a Brasília para cumprir agenda nos ministérios, ida 30/01 chegada 03/02". Não é a nota, é a justificativa que a própria câmara registrou. Passei a guardar cada diária lançamento a lançamento, com esse histórico, e a deixar a busca varrer esse texto.

A lição que eu tirei vale pro projeto todo: às vezes a transparência não é mostrar o documento, é deixar claro, com honestidade, que ele não existe, e mostrar o que existe no lugar.

## Estado: a corte de contas que sumiu

No estadual eu cheguei confiante. Tinha um plano: cruzar a verba dos deputados estaduais com o Tribunal de Contas, do mesmo jeito que eu tinha feito no município. Achei que era só repetir.

Dois muros. O primeiro: os [dados abertos que eu usei no município](https://download.tce.pb.gov.br/dados-abertos/) são **só municipais**. A esfera estadual não está lá. O segundo foi pior. O TCE até publica a esfera estadual, a Assembleia inteira está num código de unidade gestora, com empenhos no mesmo formato bom do município. Só que aquele endereço **saiu do ar** numa migração de portal: o [novo portal de dados abertos](https://dados-abertos.tce.pb.gov.br/) virou um single page application (SPA) que devolve sempre a mesma casca de HTML, e a única ferramenta estadual que sobrou, o [Sagres Cidadão](https://sagrescidadao.tce.pb.gov.br/), está atrás de um captcha. Para uma máquina, e pra qualquer pessoa que quisesse baixar em lote, acabou.

A fonte viva acabou sendo a [própria Assembleia](https://www.al.pb.leg.br/despesas), que publica as diárias numa planilha por mês. Formato novo, regras novas. E aqui apareceu o detalhe que mais incomoda quem tenta cruzar dado: **não tem CPF**. Só nome. E o nome na planilha é o nome civil completo, enquanto o meu cadastro tem o nome parlamentar. "Adriano Galdino" precisa virar "Adriano Cezar Galdino de Araujo". Pra apelido então, tipo "Cabo Gilberto Silva", o casamento por pedaços de nome simplesmente não fecha sem ajuda.

A lição estadual é técnica. Não dá pra contar com estabilidade num portal de governo: um endpoint que respondia vira SPA, um arquivo em lote vira captcha, e o coletor precisa de um plano B (no caso, raspar a planilha da própria casa) e de um casamento por nome robusto pra quando o CPF não vem. O jeito é tratar toda fonte como instável: detectar quando o formato muda, falhar com aviso em vez de silêncio, e não amarrar o pipeline a uma única URL que pode sumir na próxima migração.

## Federal: o melhor dado, e mesmo assim espalhado

O federal foi o contrário do município. O deputado federal é, de longe, o mais bem documentado: a cota vem itemizada, item a item, com **link pra nota fiscal de verdade** em praticamente tudo. O senador, idem. A comprovação que eu persegui o projeto inteiro já existia aqui, de graça.

Inclusive matei uma expectativa minha de cara: não adianta esperar um "TCU por deputado" pra cruzar, como o TCE no município. O dado granular por parlamentar **é** a base da própria Câmara, com nota. O Tribunal de Contas da União audita a Câmara como instituição, não despesa por deputado.

A lacuna no federal era outra: a **moradia**, que fica fora da cota. E ela mostrou, de novo, o tema do post. O mesmo benefício, contado em dois lugares e dois formatos diferentes. A Câmara publica quem usa apartamento funcional e quem recebe auxílio em listas de HTML, uma por mês, e o valor é um fixo de R$ 4.253. O Senado publica num CSV próprio, com um valor diferente, R$ 5.500, e regra diferente, só em dinheiro mediante comprovação. Duas casas do mesmo Congresso, o mesmo tipo de benefício, e eu tive que escrever dois coletores e dois textos explicativos porque elas não combinam entre si.

## O padrão é não ter padrão

Quando eu junto as quatro, o desenho fica claro, e é meio assustador. Pra responder a mesma pergunta em quatro esferas eu precisei de:

- **Quatro formatos**: CSV zipado (TCE municipal), planilha ODS (Assembleia), listas de HTML mensais (Câmara), CSV solto em latin-1 (Senado).
- **Quatro lugares**: o portal do Tribunal estadual, o site da Assembleia, o portal da Câmara, o do Senado. Nenhum conversa com o outro.
- **Quatro chaves pra identificar a mesma espécie de pessoa**: seis dígitos do meio do CPF, nome civil completo, nome parlamentar, matrícula de folha. Cada esfera escolheu uma.

Pensa no que isso significa pra alguém que não programa. Um cidadão que queira saber o custo do vereador, do deputado estadual, do deputado federal e do senador dele teria que descobrir quatro portais, baixar quatro arquivos em quatro formatos, e abrir CSVs que, no melhor dos casos, são confusos, e no pior vêm com byte nulo e CPF picado. O dado é "público" no sentido jurídico. Acessível, de verdade, ele não é.

Foi exatamente aí que a IA pagou o ingresso, e onde eu mantive a mão no volante. A parte chata, atravessar quatro formatos teimosos com paciência infinita, é onde a ferramenta é imbatível: eu descrevia o quebra-cabeça, mandava investigar, conferia o resultado. Mas a régua continuou minha. Em lugar nenhum o site diz que alguém errou. Cada número leva de volta à fonte, e quando a fonte não tem documento, como na diária, o site diz isso na cara, em vez de inventar uma certeza que o dado não sustenta.

## O que sobra

O [Gastômetro](https://ericocampos.github.io/gastometro/) agora cobre as quatro esferas da Paraíba, do vereador ao senador, com o código [aberto no GitHub](https://github.com/ericocampos/gastometro) e o dado versionado junto, auditável no histórico. Eu pretendo aumentar a cobertura pra outros estados. Mas a graça do código aberto é que você não precisa esperar por mim: a fonte filtra por UF e as configurações ficam num arquivo só, então dá pra forkar, trocar a Paraíba pelo seu estado e, de quebra, medir outras métricas ou capturar informações que eu nem coletei. A parte federal é igual pra todo mundo, já está resolvida e documentada. A parte municipal e estadual é o aviso: ela depende do TCE do seu estado, e se o tribunal de lá não publicar os mesmos dados que o da Paraíba, essa metade do caminho vai ser diferente, e provavelmente mais difícil.

E se você é só uma pessoa querendo saber no que andam gastando em seu nome, a conclusão honesta do projeto é essa: a informação está lá, mas o trabalho de torná-la encontrável não foi feito por quem a publica. Foi preciso um robô paciente e uma régua humana pra transformar quatro CSVs confusos em uma página que o seu vizinho consegue abrir. Não devia ser tão difícil. Mas, enquanto for, valeu a pena fazer.
