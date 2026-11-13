import { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, PresentationIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SlideIllustration } from '@/components/SlideIllustration';
import { cn } from '@/lib/utils';

interface SlideLink {
  label: string;
  url: string;
}

interface SlidePhoto {
  /** Pexels direct image URL (medium size, ~800px wide) */
  src: string;
  /** Alt text describing the photo */
  alt: string;
  /** Pexels page URL for attribution */
  pexelsUrl: string;
}

interface SlideData {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning' | 'info';
  links?: SlideLink[];
  /** Photo replaces the SVG illustration when present */
  photo?: SlidePhoto;
}

const SLIDES: SlideData[] = [
  // === БЛОК 1: ВВЕДЕНИЕ (слайды 1–3) ===
  {
    title: 'Забастовка резидент-врачей NHS',
    subtitle: 'Исторический и политический контекст конфликта',
    variant: 'highlight',
    photo: {
      src: 'https://images.pexels.com/photos/16511269/pexels-photo-16511269.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Crowd protesting by the Palace of Westminster in London during a demonstration',
      pexelsUrl: 'https://www.pexels.com/photo/crowd-protesting-by-the-palace-of-westminster-16511269/',
    },
    links: [
      { label: 'BMA: Resident Doctor Campaigns', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns' },
      { label: 'NHS England — About', url: 'https://www.england.nhs.uk/about/' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-lg leading-relaxed">
          Этот брифинг подготовлен для команд перед началом деловой игры. За 20 слайдов вы получите минимально необходимый исторический и политический контекст, чтобы выбрать орган и начать играть осознанно.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Конфликт</span>
            <span className="font-semibold">Трудовой спор врачей NHS с правительством Великобритании</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Период игры</span>
            <span className="font-semibold">27 мая — 5 июля 2026</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Раундов</span>
            <span className="font-semibold">5 раундов по 8 дней</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Что такое NHS и почему это важно',
    subtitle: 'Национальная служба здравоохранения Великобритании',
    photo: {
      src: 'https://images.pexels.com/photos/263108/pexels-photo-263108.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Hospital building exterior with clear sky',
      pexelsUrl: 'https://www.pexels.com/photo/hospital-building-263108/',
    },
    links: [
      { label: 'NHS — Who we are', url: 'https://www.nhs.uk/about-the-nhs/' },
      { label: 'The King\'s Fund: NHS explainer', url: 'https://www.kingsfund.org.uk/insight-and-analysis/long-reads/nhs-explained' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          <strong>NHS (National Health Service)</strong> — государственная система здравоохранения, основанная в 1948 году. Бесплатная медицина для всех граждан, финансируется из налогов. Одна из крупнейших организаций-работодателей в мире (~1,5 млн сотрудников).
        </p>
        <p className="leading-relaxed">
          NHS — не просто больница. Это национальная идентичность: британцы гордятся «бесплатной медициной» больше, чем любым другим институтом. Любая угроза NHS воспринимается как атака на социальные ценности страны.
        </p>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm leading-relaxed">
            <strong>Почему это важно для игры:</strong> все решения игроков происходят внутри этой системы. Бюджет NHS ограничен государством, а спрос на услуги растёт. Конфликт врачей — симптом системного кризиса.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Кто такие резидент-врачи',
    subtitle: '≈81 000 специалистов на разных этапах подготовки',
    photo: {
      src: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Young doctor in white coat with stethoscope in hospital corridor',
      pexelsUrl: 'https://www.pexels.com/photo/doctor-wearing-white-coat-5215024/',
    },
    links: [
      { label: 'BMA: Resident Doctors\' Pay Scales', url: 'https://www.bma.org.uk/pay-and-contracts/pay' },
      { label: 'NHS England: Medical training', url: 'https://www.england.nhs.uk/long-read/foundation-training/' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          Резидент-врачи (resident doctors, ранее junior doctors) — это врачи после получения диплома, проходящие последипломную подготовку. Они составляют основу рабочей силы NHS: ведут приёмы, дежурят ночью, проводят операции под надзором.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">FY1–FY2</span>
            <span className="text-sm">Интерны, первые годы после вуза. Базовая ставка FY1: £38 831</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">ST3–ST8</span>
            <span className="text-sm">Ординаторы, специализация. Зарплата выше, но и ответственность больше</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">LED</span>
            <span className="text-sm">Locally Employed Doctors — врачи на временных контрактах без места в ординатуре</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Медианная ЗП UK</span>
            <span className="text-sm">£37 400 — интерн FY1 получает чуть больше, но после 8–10 лет обучения</span>
          </div>
        </div>
      </div>
    ),
  },

  // === БЛОК 2: ИСТОРИЯ КОНФЛИКТА (слайды 4–7) ===
  {
    title: 'Хронология: от 2008 до 2023',
    subtitle: 'Как мы пришли к забастовкам',
    variant: 'info',
    links: [
      { label: 'BMA: History of junior doctor disputes', url: 'https://www.bma.org.uk/our-campaigns/junior-doctors-campaign' },
      { label: 'BBC: Junior doctors\' strikes timeline', url: 'https://www.bbc.co.uk/news/health-65498750' },
    ],
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="shrink-0 mt-0.5">2008</Badge>
          <p className="text-sm leading-relaxed">Последний год, когда реальная зарплата резидентов была на пике. С этого момента начинается падение.</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="shrink-0 mt-0.5">2016</Badge>
          <p className="text-sm leading-relaxed">Первая массовая забастовка junior doctors за 40 лет. Правительство консерваторов навязало новый контракт. Врачи проиграли, но запомнили обиду.</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="shrink-0 mt-0.5">2019–22</Badge>
          <p className="text-sm leading-relaxed">Пандемия COVID-19. Врачи работали на пределе, многие умерли. Обещания «благодарности» не перешли в повышение оплаты.</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="shrink-0 mt-0.5">2023</Badge>
          <p className="text-sm leading-relaxed">BMA объявляет первую серию забастовок нового поколения. Мандат получен с огромной поддержкой. Начинается цикл переговоров и эскалации.</p>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Ключевой вывод: конфликт длится уже более 15 лет. Текущая забастовка — не вспышка, а кульминация долгого накопления обид.
        </p>
      </div>
    ),
  },
  {
    title: '2023–2024: Забастовки при консерваторах',
    subtitle: 'Рекордное число дней простоя',
    photo: {
      src: 'https://images.pexels.com/photos/7550698/pexels-photo-7550698.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Crowd of protesters holding signs and banners at a rally',
      pexelsUrl: 'https://www.pexels.com/photo/people-protesting-on-street-during-daytime-7550698/',
    },
    links: [
      { label: 'BMA: Strike action updates 2023–24', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns/strike-action' },
      { label: 'NHS England: Waiting list data', url: 'https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          При правительстве Риши Сунака переговоры зашли в тупик. Министр здравоохранения Виктория Аткинс отказывалась обсуждать pay restoration. BMA провела более 30 дней забастовок — рекорд для NHS.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Очередь (waiting list)</span>
            <span className="text-sm">Выросла до 7,8 млн человек — абсолютный рекорд</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Утечка кадров</span>
            <span className="text-sm">Тысячи врачей уехали в Австралию и Новую Зеландию</span>
          </div>
        </div>
        <p className="leading-relaxed">
          Общественная поддержка врачей оставалась высокой (55–60%), несмотря на неудобства. Нарратив «безопасность пациентов» работал лучше, чем «зарплаты».
        </p>
      </div>
    ),
  },
  {
    title: 'Июль 2024: Смена власти',
    subtitle: 'Лейбористы приходят к власти — ничего не меняется',
    variant: 'warning',
    photo: {
      src: 'https://images.pexels.com/photos/19894733/pexels-photo-19894733.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'UK Houses of Parliament and Big Ben at dusk',
      pexelsUrl: 'https://www.pexels.com/photo/houses-of-parliament-at-dusk-19894733/',
    },
    links: [
      { label: 'Labour Party: Health mission', url: 'https://labour.org.uk/change/nhs/' },
      { label: 'DHSC: Wes Streeting\'s priorities', url: 'https://www.gov.uk/government/speeches/health-and-social-care-secretary-statement-on-nhs-priorities' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          На выборах 4 июля 2024 лейбористы во главе с <strong>Киром Стармером</strong> одержали победу. Врачи надеялись на перемены. Но новый министр здравоохранения <strong>Уэс Стритинг</strong> сразу заявил: денег сверх бюджета нет.
        </p>
        <p className="leading-relaxed">
          Лейбористы унаследовали «чёрную дыру» в бюджете от консерваторов. Канцлер Рейчел Ривз установила жёсткие фискальные правила. Повышение зарплат врачам означало бы аналогичные требования от учителей, полиции, медсестёр.
        </p>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm leading-relaxed">
            <strong>Парадокс:</strong> лейбористы традиционно ближе к профсоюзам, но бюджетная дисциплина оказалась важнее солидарности. Это ключевое напряжение игры.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: '2025–2026: Эскалация продолжается',
    subtitle: 'Новый министр, старые проблемы',
    photo: {
      src: 'https://images.pexels.com/photos/7550289/pexels-photo-7550289.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Person holding grocery receipt showing rising prices',
      pexelsUrl: 'https://www.pexels.com/photo/person-holding-receipt-7550289/',
    },
    links: [
      { label: 'ONS: CPI Inflation September 2026', url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026' },
      { label: 'DHSC on gov.uk', url: 'https://www.gov.uk/government/organisations/department-of-health-and-social-care' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          Переговоры 2025 года не привели к прорыву. Мартовская оферта правительства (в среднем 4,9%) была отклонена базой. Рекомендация DDRB — 3,5% — тоже не удовлетворила профсоюз.
        </p>
        <p className="leading-relaxed">
          <strong>14 мая 2026</strong> новым министром здравоохранения стал <strong>Джеймс Мюррей</strong>, выходец из Казначейства. Это назначение — сигнал: правительство не собирается выходить за рамки бюджета. Уэс Стритинг был переведён на другую должность.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Инфляция (CPI)</span>
            <span className="text-sm">3,5% годовых (сентябрь 2026)</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Жильё</span>
            <span className="text-sm">+5,3% за год</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Транспорт</span>
            <span className="text-sm">+6,6% за год</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Бензин</span>
            <span className="text-sm">£1,695/литр — максимум с августа 2022</span>
          </div>
        </div>
      </div>
    ),
  },

  // === БЛОК 3: СУТЬ СПОРА (слайды 8–11) ===
  {
    title: 'Pay Restoration: ядро конфликта',
    subtitle: 'Восстановление реальной зарплаты до уровня 2008 года',
    variant: 'highlight',
    photo: {
      src: 'https://images.pexels.com/photos/6863479/pexels-photo-6863479.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'British pound coins stacked showing money and wages',
      pexelsUrl: 'https://www.pexels.com/photo/british-pound-coins-6863479/',
    },
    links: [
      { label: 'BMA: Pay restoration explained', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns/pay-restoration' },
      { label: 'IFS: Public sector pay analysis', url: 'https://ifs.org.uk/articles/public-sector-pay-gap' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          <strong>Pay restoration</strong> — главное требование BMA. Реальная зарплата резидент-врачей упала примерно на <strong>20%</strong> с 2008 года с учётом инфляции. Профсоюз требует не просто повышения, а восстановления покупательной способности.
        </p>
        <div className="rounded-lg border p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Зарплата 2008 (реальная)</span>
            <span className="font-bold">100%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium">Зарплата 2026 (реальная)</span>
            <span className="font-bold text-destructive">~80%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-destructive rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Правительство считает pay restoration невозможным: это потребовало бы ~£2 млрд дополнительно и создало бы прецедент для всего госсектора.
        </p>
      </div>
    ),
  },
  {
    title: 'Три требования профсоюза',
    subtitle: 'Не только деньги',
    links: [
      { label: 'BMA: Resident doctors\' demands', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns' },
      { label: 'AoMRC: Training places & exam fees', url: 'https://www.aomrc.org.uk/' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge className="shrink-0 mt-0.5">1</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Pay Restoration</span>
              <span className="text-sm text-muted-foreground">Восстановление реальной зарплаты до уровня 2008 года. Разрыв ≈20%. Самое дорогое и политически чувствительное требование.</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge variant="secondary" className="shrink-0 mt-0.5">2</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Места в ординатуре</span>
              <span className="text-sm text-muted-foreground">Увеличение числа мест для специализации. Тысячи врачей застряли на LED-контрактах без перспективы карьерного роста.</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge variant="secondary" className="shrink-0 mt-0.5">3</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Компенсация экзаменационных сборов</span>
              <span className="text-sm text-muted-foreground">Экзамены Royal Colleges стоят тысячи фунтов. Врачи платят из своего кармана за обязательную сертификацию.</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Для игры: правительство готово торговаться по пунктам 2 и 3, но пункт 1 — красная линия Казначейства.
        </p>
      </div>
    ),
  },
  {
    title: 'DDRB: независимый арбитр',
    subtitle: 'Doctors\' and Dentists\' Review Body',
    variant: 'info',
    links: [
      { label: 'DDRB Reports & Recommendations', url: 'https://www.gov.uk/government/organisations/doctors-and-dentists-review-body' },
      { label: 'GOV.UK: Pay review bodies', url: 'https://www.gov.uk/government/collections/pay-review-body-reports' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          <strong>DDRB</strong> — независимый экспертный орган, который ежегодно рекомендует правительству процент повышения зарплат врачам и стоматологам. Создан именно для того, чтобы деполитизировать вопрос оплаты труда медиков.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Рекомендация 2026</span>
            <span className="text-sm font-semibold">3,5% с апреля 2026</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Статус</span>
            <span className="text-sm">Не обязывает, но создаёт «якорь» для переговоров</span>
          </div>
        </div>
        <p className="leading-relaxed">
          Правительство не может диктовать DDRB, но может через переговоры добиться структурных изменений <em>сверх</em> рекомендации. Например, добавить места или компенсировать сборы — это не входит в remit DDRB.
        </p>
        <p className="text-sm text-muted-foreground">
          Для игры: DDRB — это «якорь». Оферта ниже 3,5% будет воспринята как оскорбление. Выше — требует обоснования перед Казначейством.
        </p>
      </div>
    ),
  },
  {
    title: 'Бюджетный лимит Казначейства',
    subtitle: 'Главное ограничение правительства',
    variant: 'warning',
    links: [
      { label: 'HM Treasury on gov.uk', url: 'https://www.gov.uk/government/organisations/hm-treasury' },
      { label: 'IFS: Public spending explained', url: 'https://ifs.org.uk/articles/how-does-government-spend-your-money' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          <strong>HMT (HM Treasury)</strong> устанавливает бюджетный лимит — максимальную сумму расходов на повышение зарплат во всём госсекторе. DHSC не может выйти за эти рамки без разрешения Казначейства.
        </p>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
          <p className="font-semibold text-destructive">Эффект заражения (contagion)</p>
          <p className="text-sm leading-relaxed">
            Если резидент-врачи получат больше рекомендованного DDRB, завтра те же требования выдвинут:
          </p>
          <ul className="flex flex-col gap-1 text-sm ml-4">
            <li className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span> Учителя (NEU)</li>
            <li className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span> Полиция и пожарные</li>
            <li className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span> Медсёстры (RCN)</li>
            <li className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span> Консультанты (BMA consultants)</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Для игры: даже если DHSC хочет быть щедрым, HMT может наложить вето. Это не баг, а фича системы.
        </p>
      </div>
    ),
  },

  // === БЛОК 4: ИГРОВЫЕ ОРГАНЫ (слайды 12–17) ===
  {
    title: 'Играбельные органы: обзор',
    subtitle: '6 команд, которые выбирают игроки',
    variant: 'highlight',
    links: [
      { label: 'BMA: Organisation structure', url: 'https://www.bma.org.uk/about-us/our-structure' },
      { label: 'NHS Providers: About', url: 'https://www.nhsproviders.org/about-us' },
    ],
    content: (
      <div className="flex flex-col gap-3">
        <p className="leading-relaxed">
          В игре 6 играбельных органов. Каждый представляет реальную организацию в конфликте. Ниже — краткая характеристика каждого, чтобы помочь вам выбрать роль.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { name: 'RDC', desc: 'Забастовочный комитет врачей', color: '#E30613' },
            { name: 'BMA UK', desc: 'Совет всего профсоюза', color: '#C41E3A' },
            { name: 'DHSC', desc: 'Министерство здравоохранения', color: '#2E5C9E' },
            { name: 'HMT + Даунинг-стрит', desc: 'Казначейство и премьер', color: '#009B3D' },
            { name: 'NHS Providers', desc: 'Больничные трасты', color: '#6B4C9A' },
            { name: 'AoMRC', desc: 'Академия колледжей', color: '#D4A017' },
          ].map((organ) => (
            <div key={organ.name} className="flex items-center gap-2 rounded-lg border p-2">
              <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: organ.color }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{organ.name}</p>
                <p className="text-xs text-muted-foreground truncate">{organ.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'RDC — Забастовочный комитет',
    subtitle: 'Доктор Джек Флетчер • Голос врачей',
    links: [
      { label: 'BMA: Resident Doctors Committee', url: 'https://www.bma.org.uk/about-us/our-structure/resident-doctors-committee' },
      { label: 'BMA: Ballot results & mandate', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns/ballots-and-mandates' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          RDC создан в 2023 году специально для ведения забастовочной кампании резидент-врачей. Возглавляет его доктор <strong>Джек Флетчер</strong>. Комитет ведёт переговоры, объявляет забастовки и даёт рекомендацию базе на референдуме.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Представлять все грейды (FY, ST, LED)</li>
              <li>Давать рекомендацию по каждой оферте</li>
              <li>Соблюдать законные процедуры забастовки</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Объявить/отменить дни забастовки</li>
              <li>Рекомендовать принять/отклонить оферту</li>
              <li>Выдвинуть контрпредложение</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Дилемма:</strong> если порекомендовать плохую сделку — база взбунтуется. Если быть слишком жёстким — забастовки затянутся, поддержка упадёт.
        </p>
      </div>
    ),
  },
  {
    title: 'BMA UK — Совет профсоюза',
    subtitle: 'Все ветви медицины • Распорядитель забастовочного фонда',
    links: [
      { label: 'BMA: About us & governance', url: 'https://www.bma.org.uk/about-us' },
      { label: 'BMA: Strike fund information', url: 'https://www.bma.org.uk/advice/employment/strikes/strike-fund' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          BMA основана в 1832 году. Совет объединяет все ветви: консультантов, GP, студентов, SAS-врачей. Контролирует забастовочный фонд и определяет общую политическую линию.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Обеспечивать платёжеспособность фонда</li>
              <li>Координировать позиции всех ветвей</li>
              <li>Не допускать, чтобы уступки одной группе подрывали позиции другой</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Выделить/заморозить средства фонда</li>
              <li>Организовать солидарные акции</li>
              <li>Контролировать «заражение» уступок</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Дилемма:</strong> щедрая сделка для резидентов → консультанты потребуют того же. Скромная → резиденты выйдут из союза.
        </p>
      </div>
    ),
  },
  {
    title: 'DHSC — Министерство здравоохранения',
    subtitle: 'Джеймс Мюррей • Переговорщик от правительства',
    links: [
      { label: 'DHSC on gov.uk', url: 'https://www.gov.uk/government/organisations/department-of-health-and-social-care' },
      { label: 'NHS Employers: Pay negotiations', url: 'https://www.nhsemployers.org/topics/pay-and-reward' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          DHSC ведёт переговоры с врачами от имени правительства. Министр <strong>Джеймс Мюррей</strong> (с 14 мая 2026) — выходец из Казначейства, что подчёркивает жёсткую бюджетную линию.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Вести переговоры добросовестно</li>
              <li>Оставаться в рамках бюджетного лимита</li>
              <li>Обеспечивать безопасность пациентов</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Сформулировать новую оферту</li>
              <li>Предложить места вместо денег</li>
              <li>Запросить расширение лимита у HMT</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Дилемма:</strong> между требованиями врачей и ограничениями Казначейства. Политическое выживание министра зависит от результата.
        </p>
      </div>
    ),
  },
  {
    title: 'HMT + Даунинг-стрит',
    subtitle: 'Канцлер Казначейства • Фискальный каркас',
    links: [
      { label: 'HM Treasury on gov.uk', url: 'https://www.gov.uk/government/organisations/hm-treasury' },
      { label: 'GOV.UK: Spending Review', url: 'https://www.gov.uk/government/collections/spending-review' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed">
          Казначейство устанавливает бюджетный лимит. Даунинг-стрит определяет политические приоритеты. Вместе они формируют жёсткий каркас, внутри которого DHSC торгуется.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-destructive mb-1.5">Обязан</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Удерживать общий бюджетный лимит</li>
              <li>Поддерживать авторитет DDRB</li>
              <li>Не давать бессрочных обязательств</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">Может</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Расширить лимит в обмен на реформы</li>
              <li>Изменить remit DDRB</li>
              <li>Наложить вето на дорогую оферту</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Дилемма:</strong> уступить врачам → цепная реакция в госсекторе. Не уступить → бесконечные забастовки и политический ущерб.
        </p>
      </div>
    ),
  },
  {
    title: 'NHS Providers и AoMRC',
    subtitle: 'Больницы на земле и стандарты подготовки',
    photo: {
      src: 'https://www.aomrc.org.uk/wp-content/uploads/2023/07/about-banner-1800x333.jpg',
      alt: 'Academy of Medical Royal Colleges banner',
      pexelsUrl: 'https://www.aomrc.org.uk/about-us/',
    },
    links: [
      { label: 'NHS Providers: About', url: 'https://www.nhsproviders.org/about-us' },
      { label: 'AoMRC: About the Academy', url: 'https://www.aomrc.org.uk/about/' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: '#6B4C9A' }} />
            <span className="font-semibold">NHS Providers</span>
          </div>
          <p className="text-sm leading-relaxed">
            Объединение больничных трастов. Люди «на земле», которые видят последствия забастовок: отменённые операции, рост очереди, расходы на locum. Их цель — безопасность пациентов и восстановление нормальной работы.
          </p>
          <p className="text-sm text-muted-foreground">
            Рычаги: данные об ущербе, давление на обе стороны, перераспределение бюджетов.
          </p>
        </div>
        <div className="rounded-lg border p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: '#D4A017' }} />
            <span className="font-semibold">AoMRC</span>
          </div>
          <p className="text-sm leading-relaxed">
            Академия королевских медицинских колледжей. Ставит экзамены и определяет стандарты подготовки. Может снизить сборы, сертифицировать новые места, выступить медиатором по техническим вопросам.
          </p>
          <p className="text-sm text-muted-foreground">
            Рычаги: экзаменационные сборы, стандарты, экспертиза по местам, публичный авторитет.
          </p>
        </div>
      </div>
    ),
  },

  // === БЛОК 5: МЕХАНИКА И СТРАТЕГИЯ (слайды 18–20) ===
  {
    title: 'Три барьера на пути к сделке',
    subtitle: 'Что нужно преодолеть для победы',
    variant: 'info',
    links: [
      { label: 'BMA: How pay deals are ratified', url: 'https://www.bma.org.uk/advice/employment/strikes/balloting-and-mandates' },
      { label: 'GOV.UK: Trade Union Act 2016', url: 'https://www.legislation.gov.uk/ukpga/2016/15/contents' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge className="shrink-0 mt-0.5">1</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Забастовочный барьер</span>
              <span className="text-sm text-muted-foreground">Действует ли мандат? Соблюдены ли сроки уведомления? Каждый день простоя растит очередь и расходы на locum.</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge variant="secondary" className="shrink-0 mt-0.5">2</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Ратификационный барьер</span>
              <span className="text-sm text-muted-foreground">Оферту утверждает референдум членов простым большинством. RDC может рекомендовать принять, но база вправе отклонить.</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 flex items-start gap-3">
            <Badge variant="secondary" className="shrink-0 mt-0.5">3</Badge>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Фискальный барьер</span>
              <span className="text-sm text-muted-foreground">Рекомендация DDRB (3,5%) + лимит Казначейства. Торговаться приходится не только деньгами, но и местами, сборами, структурой оплаты.</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Метрики, за которыми стоит следить',
    subtitle: 'Ключевые показатели для принятия решений',
    links: [
      { label: 'NHS England: RTT waiting times', url: 'https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/' },
      { label: 'ONS: Labour market overview', url: 'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/latest' },
    ],
    content: (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { label: 'Дни забастовки', desc: 'Чем больше — сильнее давление, но растёт очередь и падает поддержка' },
            { label: 'Среднее повышение', desc: 'Текущая оферта: 4,9%. Рекомендация DDRB: 3,5%' },
            { label: 'Единство базы', desc: '≈54 тыс. членов. Раскол между грейдами может провалить референдум' },
            { label: 'Поддержка общества', desc: 'Зависит от фрейминга в СМИ: «жадные врачи» vs «безопасность»' },
            { label: 'Прогноз референдума', desc: 'Вероятность принятия оферты простым большинством' },
            { label: 'Разрыв pay restoration', desc: 'Реальная ЗП ниже уровня 2008 года примерно на 20%' },
            { label: 'Стабильность правительства', desc: 'Риск вотума недоверия или отставки министра' },
            { label: 'Мандат на забастовку', desc: 'Действует до августа 2026. Повторное голосование: 93% за' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-lg border p-3 flex flex-col gap-1">
              <span className="text-sm font-semibold">{metric.label}</span>
              <span className="text-xs text-muted-foreground">{metric.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Условия победы и советы',
    subtitle: 'Как выиграть и чего избегать',
    variant: 'highlight',
    photo: {
      src: 'https://images.pexels.com/photos/54288/pexels-photo-54288.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Team of medical professionals standing together in hospital',
      pexelsUrl: 'https://www.pexels.com/photo/group-of-doctors-in-hospital-54288/',
    },
    links: [
      { label: 'BMA: Resident Doctor Campaigns', url: 'https://www.bma.org.uk/our-campaigns/resident-doctor-campaigns' },
      { label: 'The King\'s Fund: NHS workforce', url: 'https://www.kingsfund.org.uk/projects/nhs-workforce' },
    ],
    content: (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">Победа</span>
            <span className="text-sm font-semibold">≥70% целей</span>
            <span className="text-xs text-muted-foreground">по весам выполнены</span>
          </div>
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Частичный успех</span>
            <span className="text-sm font-semibold">40–69%</span>
            <span className="text-xs text-muted-foreground">целей выполнено</span>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-destructive">Поражение</span>
            <span className="text-sm font-semibold">&lt;40% целей</span>
            <span className="text-xs text-muted-foreground">или нет ратифицированной оферты к 5 июля</span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Советы перед игрой:</p>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground ml-2">
            <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Выберите орган, чья позиция вам понятна или интересна</li>
            <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Изучите цели и красные линии вашего органа — это ваш компас</li>
            <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Помните: другие органы тоже имеют свои ограничения и мандаты</li>
            <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Таймер реальный: если группа не договорилась, движок фиксирует статус-кво</li>
            <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Следите за метриками — они показывают, куда движется конфликт</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export function HistoricalSlides() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < SLIDES.length) {
      setCurrentSlide(index);
    }
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const slide = SLIDES[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <PresentationIcon className="size-5 text-primary" />
          <CardTitle>Брифинг: контекст забастовки</CardTitle>
        </div>
        <CardDescription>
          Исторический и политический контекст для выбора органа и начала игры
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground tabular-nums w-12 shrink-0">
            {currentSlide + 1} / {SLIDES.length}
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Slide content */}
        <div
          className={cn(
            "min-h-[320px] rounded-lg border p-5 md:p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300",
            slide.variant === 'highlight' && "border-primary/30 bg-primary/5",
            slide.variant === 'warning' && "border-destructive/30 bg-destructive/5",
            slide.variant === 'info' && "border-blue-500/30 bg-blue-500/5",
            (!slide.variant || slide.variant === 'default') && "bg-card"
          )}
          key={currentSlide}
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Photo or illustration — above on mobile, side on desktop */}
            {slide.photo ? (
              <div className="shrink-0 w-full md:w-[35%] md:min-w-[220px] overflow-hidden rounded-lg border bg-muted/30">
                <img
                  src={slide.photo.src}
                  alt={slide.photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover min-h-[160px] md:min-h-[200px]"
                />
                <a
                  href={slide.photo.pexelsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-2 py-1 text-[10px] text-muted-foreground hover:text-primary truncate"
                >
                  Photo via Pexels
                </a>
              </div>
            ) : (
              <SlideIllustration slideIndex={currentSlide} className="md:w-48 md:h-auto md:min-h-[200px]" />
            )}

            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold leading-tight">{slide.title}</h3>
                {slide.subtitle && (
                  <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                )}
              </div>
              <Separator />
              <div className="flex-1">
                {slide.content}
              </div>
              {slide.links && slide.links.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Источники</span>
                    <ul className="flex flex-col gap-1">
                      {slide.links.map((link) => (
                        <li key={link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                          >
                            <ExternalLinkIcon data-icon="inline-start" className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Назад
        </Button>

        {/* Dot indicators */}
        <div className="hidden md:flex items-center gap-1">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={cn(
                "size-2 rounded-full transition-all",
                idx === currentSlide
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Слайд ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          variant={isLast ? 'default' : 'outline'}
          size="sm"
          onClick={goNext}
          disabled={isLast}
        >
          {isLast ? 'Готово' : 'Далее'}
          {!isLast && <ChevronRightIcon data-icon="inline-end" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
