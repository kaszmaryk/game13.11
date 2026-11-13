import { useState } from 'react';
import { InfoIcon, QrCodeIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Term } from '@/components/Term';
import { HistoricalSlides } from '@/components/HistoricalSlides';
import { useGameContext } from '@/hooks/useGameContext';
import type { Organ, KeyNumbers, GlossaryTerm, FAQItem } from '@/types/game';

export function ContextInfoPage() {
  const { gameState, loading, error, retry } = useGameContext();
  const [activeTab, setActiveTab] = useState('description');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (!gameState) {
    return (
      <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
        <p className="text-lg text-muted-foreground">Нет данных</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="flex flex-col gap-6 page-enter">
      {/* Game Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{gameState.game.title}</CardTitle>
          <CardDescription>{gameState.game.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">Дата начала</label>
              <p className="text-base md:text-lg font-semibold">{formatDate(gameState.game.startDate)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">Текущий раунд</label>
              <p className="text-base md:text-lg">{gameState.game.currentTurn} / {gameState.game.totalTurns}</p>
            </div>
            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">Статус</label>
              <Badge variant={gameState.game.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                {gameState.game.status === 'active' ? 'Активна' : gameState.game.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 group-data-horizontal/tabs:h-auto p-1">
          <TabsTrigger value="briefing" className="text-xs md:text-sm">Брифинг</TabsTrigger>
          <TabsTrigger value="description" className="text-xs md:text-sm">Описание</TabsTrigger>
          <TabsTrigger value="organs" className="text-xs md:text-sm">Органы</TabsTrigger>
          <TabsTrigger value="numbers" className="text-xs md:text-sm">Ключевые числа</TabsTrigger>
          <TabsTrigger value="glossary" className="text-xs md:text-sm">Глоссарий</TabsTrigger>
          <TabsTrigger value="faq" className="text-xs md:text-sm">FAQ</TabsTrigger>
          <TabsTrigger value="qrcode" className="text-xs md:text-sm">QR-код</TabsTrigger>
        </TabsList>

        {/* Briefing Slides Tab */}
        <TabsContent value="briefing" className="mt-6">
          <HistoricalSlides />
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Об игре</CardTitle>
              <CardDescription>Контекст, правила и ключевые данные для игроков</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-sm leading-relaxed">
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Что это за игра</p>
                <p>
                  «Врачи против правительства: Англия, май 2026» — деловая игра о трудовом конфликте <Term>резидент-врачей</Term> <Term>NHS</Term> с правительством Великобритании. Каждый игрок управляет коллективным органом: комитетом, министерством или советом, внутри которых есть свои фракции. Решения принимаются совместно. Если группа не успела договориться за таймер, движок фиксирует статус-кво, и раунд потерян. Всего 5 раундов по 8 дней, с 27 мая по 5 июля 2026.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">О чём конфликт</p>
                <p>
                  В Англии около 81 000 <Term>резидент-врачей</Term> (раньше их называли junior doctors). Это специалисты на разных этапах подготовки, от первого года интернатуры (<Term>FY1</Term>) до старших ординаторов (<Term>ST8</Term>). С 2008 года их реальная зарплата упала примерно на 20%. Профсоюз <Term>BMA</Term> требует восстановить оплату до прежнего уровня (<em><Term>pay restoration</Term></em>), добавить места в ординатуре и компенсировать экзаменационные сборы. Правительство лейбористов при премьере <Term>Кире Стармере</Term> связано бюджетным лимитом <Term>Казначейства</Term>: если уступить врачам, завтра те же требования выдвинут учителя, полиция, медсёстры и консультанты.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Зарплаты и цены</p>
                <p>
                  Базовая ставка <Term>FY1</Term> в 2025–26 году — £38 831, <Term>FY2</Term> — £44 439. Это до налогов, без лондонской надбавки и доплат за ночные смены. Медианная заработная плата в Великобритании в 2026 году — около £37 400, так что интерн формально получает чуть больше медианного значения, но только после 8–10 лет обучения и при рабочей неделе от 48 часов.
                </p>
                <p>
                  Инфляция (<Term>CPI</Term>) в сентябре 2026 составила 3,5% годовых. Жильё подорожало на 5,3%, транспорт — на 6,6%, бензин достиг £1,695 за литр — максимум с августа 2022. Независимый орган <Term>DDRB</Term> рекомендовал повышение на 3,5% с апреля 2026, но этого недостаточно, чтобы угнаться за ростом цен на жильё и энергию. Мартовскую <Term>оферту</Term> правительства (в среднем 4,9%) база отклонила.
                </p>
                <p className="text-muted-foreground">
                  Источники: <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">ONS Consumer Price Inflation, September 2026</a>, <a href="https://www.bma.org.uk/pay-and-contracts/pay" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">BMA Resident Doctors' Pay Scales</a>.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Более широкий контекст</p>
                <p>
                  Конфликт разворачивается на фоне системного кризиса <Term>NHS</Term>. Очередь на плановое лечение (<em><Term>waiting list</Term></em>) бьёт рекорды, больницы зависят от дорогих временных врачей (<em><Term>locum</Term></em>), а многие резиденты уезжают в Австралию и Новую Зеландию. Забастовки начались ещё в 2023 году при консерваторах и не прекратились после смены власти в июле 2024. 14 мая 2026 новым министром здравоохранения стал <Term>Джеймс Мюррей</Term>, выходец из <Term>Казначейства</Term>, сменивший <Term>Уэса Стритинга</Term>. Это назначение показывает, что правительство не намерено выходить за рамки бюджета. <Term>Мандат</Term> на забастовку действует до августа 2026 (повторное голосование: 93% за, явка 52,5%).
                </p>
                <p className="text-muted-foreground">
                  Подробнее: <a href="https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">BMA Resident Doctor Campaigns</a>, <a href="https://www.gov.uk/government/organisations/department-of-health-and-social-care" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">DHSC on gov.uk</a>.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Метрики, за которыми стоит следить</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground ml-2">
                  <li>Запланированные дни забастовки. Чем больше дней, тем сильнее давление, но растёт очередь и падает общественная поддержка.</li>
                  <li>Среднее повышение оплаты. Текущий процент <Term>оферты</Term>: мартовская — 4,9%, рекомендация <Term>DDRB</Term> — 3,5%.</li>
                  <li>Единство базы. Численность — ≈54 тыс. членов профсоюза. Раскол между грейдами (<Term>FY1</Term>/<Term>FY2</Term>, ST, LED) может провалить <Term>референдум</Term>.</li>
                  <li>Поддержка общества. Зависит от того, какая подача берёт верх в СМИ: «жадные врачи» или «безопасность пациентов».</li>
                  <li>Прогноз <Term>референдума</Term>. Вероятность того, что база примет <Term>оферту</Term> простым большинством.</li>
                  <li>Разрыв <Term>pay restoration</Term>. Реальная зарплата примерно на 20% ниже уровня 2008 года — основная претензия профсоюза.</li>
                  <li>Стабильность правительства. Риск вотума недоверия или отставки министра.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Кто есть кто</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground ml-2">
                  <li>Доктор <Term>Джек Флетчер</Term> (<Term>RDC</Term>) — глава забастовочного комитета <Term>резидент-врачей</Term>. Ведёт переговоры и определяет, какую рекомендацию дать базе на <Term>референдум</Term>.</li>
                  <li><Term>Джеймс Мюррей</Term> (<Term>DHSC</Term>) — министр здравоохранения с 14 мая 2026, ранее работал в <Term>Казначействе</Term>. Придерживается жёсткой бюджетной линии.</li>
                  <li>Канцлер <Term>Казначейства</Term> (<Term>HMT</Term>) — контролирует лимит расходов. Выход за пределы бюджетного лимита немедленно вызовет аналогичные требования у учителей, полиции и всего госсектора.</li>
                  <li><Term>DDRB</Term> — независимый орган, рекомендовавший повышение на 3,5%. Правительство не может ему указывать, но способно через переговоры добиться структурных изменений сверх этой рекомендации.</li>
                  <li><Term>Кир Стармер</Term> (Даунинг-стрит) — премьер-министр, определяет политический таймлайн и приоритеты лейбористов.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Три препятствия на пути к сделке</p>
                <p>
                  Чтобы сделка состоялась, нужно преодолеть три барьера. Первый — забастовочный: действует ли <Term>мандат</Term>, соблюдены ли сроки уведомления, во что обходится каждый день простоя (растущая очередь, расходы на <Term>locum</Term>, потерянные места ординатуры). Второй — ратификационный: <Term>оферту</Term> утверждает <Term>референдум</Term> членов простым большинством, и хотя <Term>RDC</Term> может рекомендовать принять её, база вправе отклонить. Третий — фискальный: рекомендация <Term>DDRB</Term> в 3,5% плюс лимит <Term>Казначейства</Term>. Торговаться приходится не только деньгами, но и местами, сборами и структурой оплаты.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-semibold text-base">Условия победы</p>
                <p>
                  Орган выполнил ≥70% своих целей по весам — это победа. От 40% до 69% — частичный успех. Ниже 40% — поражение, даже если сделку приняли. Если к 5 июля нет ратифицированной оферты, начинаются июльские забастовки и политический тупик.
                </p>
              </div>

              <div className="border-t pt-4 flex flex-col gap-1 text-xs text-muted-foreground">
                <p>Ссылки по теме:</p>
                <ul className="list-disc list-inside flex flex-col gap-1 ml-2">
                  <li><a href="https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">BMA: Resident Doctor Campaigns</a></li>
                  <li><a href="https://www.bma.org.uk/pay-and-contracts/pay" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">BMA: Pay Scales</a></li>
                  <li><a href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">ONS: CPI Inflation September 2026</a></li>
                  <li><a href="https://www.gov.uk/government/organisations/department-of-health-and-social-care" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">DHSC on gov.uk</a></li>
                  <li><a href="https://www.gov.uk/government/organisations/hm-treasury" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">HM Treasury on gov.uk</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organs Tab */}
        <TabsContent value="organs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Играбельные органы</CardTitle>
              <CardDescription>Команды, которые выбирают игроки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {gameState.organs.filter(o => o.isPlayerOrgan).map((organ: Organ) => (
                  <div key={organ.id} className="border rounded-lg p-4 animate-slide-up">
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="size-4 rounded-full mt-1 flex-shrink-0" 
                        style={{ backgroundColor: organ.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{organ.name}</h3>
                        <p className="text-sm text-muted-foreground">Лидер: {organ.leader}</p>
                        <p className="text-sm text-muted-foreground mt-1">{organ.role}</p>
                      </div>
                    </div>

                    {organ.description && (
                      <p className="text-sm leading-relaxed mb-3">{organ.description}</p>
                    )}

                    {(organ.mustDo || organ.canDo) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {organ.mustDo && organ.mustDo.length > 0 && (
                          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан сделать</p>
                            <ul className="flex flex-col gap-1">
                              {organ.mustDo.map((item, idx) => (
                                <li key={idx} className="text-sm leading-snug flex items-start gap-1.5">
                                  <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {organ.canDo && organ.canDo.length > 0 && (
                          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может сделать</p>
                            <ul className="flex flex-col gap-1">
                              {organ.canDo.map((item, idx) => (
                                <li key={idx} className="text-sm leading-snug flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {organ.goals && organ.goals.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold mb-2">Цели:</p>
                        <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
                          {organ.goals.map((goal, idx) => (
                            <li key={idx}>
                              {goal.description} <Badge variant="outline" className="ml-2 text-xs">{goal.weight} вес</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {organ.redLines && organ.redLines.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold mb-2 text-destructive">Красные линии:</p>
                        <ul className="list-disc list-inside flex flex-col gap-1 text-sm text-destructive">
                          {organ.redLines.map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {organ.levers && organ.levers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold mb-2">Рычаги:</p>
                        <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
                          {organ.levers.map((lever, idx) => (
                            <li key={idx}>{lever}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Неиграбельные органы (ИИ)</CardTitle>
              <CardDescription>Органы, управляемые ведущим или ИИ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {gameState.organs.filter(o => !o.isPlayerOrgan).map((organ: Organ) => (
                  <div key={organ.id} className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div 
                        className="size-4 rounded-full mt-1 flex-shrink-0" 
                        style={{ backgroundColor: organ.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold">{organ.name}</h3>
                        <p className="text-sm text-muted-foreground">Лидер: {organ.leader}</p>
                        <p className="text-sm text-muted-foreground mt-1">{organ.role}</p>
                        {organ.description && (
                          <p className="text-sm leading-relaxed mt-2">{organ.description}</p>
                        )}
                        {(organ.mustDo || organ.canDo) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {organ.mustDo && organ.mustDo.length > 0 && (
                              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан сделать</p>
                                <ul className="flex flex-col gap-1">
                                  {organ.mustDo.map((item, idx) => (
                                    <li key={idx} className="text-sm leading-snug flex items-start gap-1.5">
                                      <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {organ.canDo && organ.canDo.length > 0 && (
                              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может сделать</p>
                                <ul className="flex flex-col gap-1">
                                  {organ.canDo.map((item, idx) => (
                                    <li key={idx} className="text-sm leading-snug flex items-start gap-1.5">
                                      <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Numbers Tab */}
        <TabsContent value="numbers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ключевые числа</CardTitle>
              <CardDescription>Важные цифры для игры</CardDescription>
            </CardHeader>
            <CardContent>
              {gameState.keyNumbers && gameState.keyNumbers.length > 0 ? (
                <TooltipProvider>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.keyNumbers.map((item: KeyNumbers, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4 animate-slide-up">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                          {item.description && (
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="size-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                {item.description}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-xl font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </TooltipProvider>
              ) : (
                <p className="text-muted-foreground">Ключевые числа не загружены</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Глоссарий</CardTitle>
              <CardDescription>Словарь терминов</CardDescription>
            </CardHeader>
            <CardContent>
              {gameState.glossary && gameState.glossary.length > 0 ? (
                <Accordion className="w-full">
                  {gameState.glossary.map((term: GlossaryTerm, idx: number) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left font-semibold">{term.term}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{term.definition}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">Глоссарий не загружен</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Часто задаваемые вопросы</CardTitle>
              <CardDescription>Ответы на типичные вопросы новичков</CardDescription>
            </CardHeader>
            <CardContent>
              {gameState.faq && gameState.faq.length > 0 ? (
                <Accordion className="w-full">
                  {gameState.faq.map((item: FAQItem, idx: number) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">FAQ не загружен</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qrcode" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCodeIcon data-icon="inline-start" />
                QR-код дашборда
              </CardTitle>
              <CardDescription>Отсканируйте, чтобы открыть дашборд на телефоне</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <div className="rounded-xl border-2 border-border bg-white p-4">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : 'https://kaszmaryk.github.io/game13.11/'}
                  size={256}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Наведите камеру телефона на QR-код, чтобы открыть дашборд в мобильном браузере
              </p>
              <p className="text-xs font-mono text-muted-foreground break-all text-center">
                {typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://kaszmaryk.github.io/game13.11/'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
