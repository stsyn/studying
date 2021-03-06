content.intro = {
c:`# Общие сведения о P2P-сетях
P2P-сеть (также «одноранговая», «децентрализованная») — это компьютерная сеть, основанная на равноправии участников, в которой все узлы сети выполняют одинаковые функции или автоматически могут изменять набор своих функций в зависимости от окружающих условий.

/combineImages /zoomImages /showLabels![P2P-сеть](content/media/p2p-network.png) ![Обычная сеть](content/media/common-network.png)

Сеть состоит из некоторого числа машин, называемых *пирами* (*peer*), при этом каждая может связаться с любой другой. Каждая из этих машин может посылать запросы другим машинам на предоставление каких-либо ресурсов в пределах этой сети и, таким образом, выступать в роли клиента. Будучи сервером, каждая машина должна быть способной обрабатывать запросы от других машин в сети и отсылать то, что было запрошено. Также, каждая машина должна выполнять некоторые вспомогательные и административные функции (например, хранить список других известных машин-«соседей» и поддерживать его актуальность).

Различают несколько видов одноранговых сетей, в зависимости от их структуры:

*	**Централизованные сети с сервером** — подразумевается существование выделенного сервера (чаще — несколько) — *трекера* (*tracker*), который хранит информацию о находящихся в сети пирах и обеспечивает поиск контента. Минусом данного типа сетей является возникающая уязвимость этого узла;
*	**Децентрализованная структура** — выделенного сервера нет, пиры хранят информацию только о «соседях», поиск происходит методом пошагового обхода. Минусом данного типа является большие задержки при выполнении запросов, существует вероятность, что искомый файл не будет найден, даже если он сущестует и доступен в сети, также возможны сложности при подключении; 
*	**Частично централизованные сети** — выделенный сервер может иметься, чтобы ускорять операции поиска и подключения, но количество не определено, и в нем нет обязательной необходимости. 

В сравнении с традиционными сетями, P2P-сети имеют ряд преимуществ:

*	**Надежность** — функционирование сети не страдает, если некоторые узлы сети становятся недоступными;
*	**Большая скорость** — контент может передаваться сразу с нескольких «пиров-серверов»;
*	**Масштабируемость** — увеличение трафика в сети не скажется на ее производительности для отдельного пользователя, в отличие от «клиент-сервер», где общая скорость упирается в суммарный канал всех серверов.

P2P-сети чаще всего используются для организации **распределенных вычислений** и **обмена файлов**. Архитектура P2P  также положена в основу **Bitcoin** и **I2P**.`,
markdown:true,
next:'bittorrent',
prev:'title',
name:'Общие сведения о P2P',
id:'intro'
};