import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { Metrics, Organ } from '@/types/game';
import { 
  Calendar,
  TrendingUp,
  MapPin,
  FileText,
  Percent,
  Users,
  Heart,
  Shield,
  Clock,
  AlertTriangle,
  Vote,
  Target,
  ChevronDown,
  InfoIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsBoardProps {
  metrics: Metrics;
  organs?: Organ[];
}

function getRiskVariant(risk: number): "default" | "secondary" | "destructive" {
  if (risk > 50) return 'destructive';
  if (risk > 30) return 'secondary';
  return 'default';
}

/** Aim targets for metrics with progress bars, per organ perspective. */
interface AimTarget {
  /** Target value to reach */
  aim: number;
  /** Threshold below which the situation is critical */
  criticalBelow: number;
  /** If true, lower is better (e.g. risk metrics) */
  inverse?: boolean;
}

type MetricAimKey = 'baseUnity' | 'publicSupport' | 'governmentStability' | 'referendumProjection' | 'reballotRisk';

/** Per-organ aim profiles. Keys are organ IDs from context.json. */
const ORGAN_AIM_PROFILES: Record<string, Record<MetricAimKey, AimTarget>> = {
  rdc: {
    baseUnity:            { aim: 80, criticalBelow: 50 },
    publicSupport:        { aim: 65, criticalBelow: 40 },
    governmentStability:  { aim: 40, criticalBelow: 20, inverse: true },
    referendumProjection: { aim: 55, criticalBelow: 40 },
    reballotRisk:         { aim: 15, criticalBelow: 30, inverse: true },
  },
  'bma-uk': {
    baseUnity:            { aim: 70, criticalBelow: 45 },
    publicSupport:        { aim: 60, criticalBelow: 35 },
    governmentStability:  { aim: 50, criticalBelow: 25 },
    referendumProjection: { aim: 60, criticalBelow: 45 },
    reballotRisk:         { aim: 10, criticalBelow: 25, inverse: true },
  },
  dhsc: {
    baseUnity:            { aim: 40, criticalBelow: 70, inverse: true },
    publicSupport:        { aim: 45, criticalBelow: 65, inverse: true },
    governmentStability:  { aim: 75, criticalBelow: 50 },
    referendumProjection: { aim: 40, criticalBelow: 55, inverse: true },
    reballotRisk:         { aim: 30, criticalBelow: 15 },
  },
  hmt: {
    baseUnity:            { aim: 35, criticalBelow: 65, inverse: true },
    publicSupport:        { aim: 40, criticalBelow: 60, inverse: true },
    governmentStability:  { aim: 80, criticalBelow: 55 },
    referendumProjection: { aim: 35, criticalBelow: 50, inverse: true },
    reballotRisk:         { aim: 35, criticalBelow: 15 },
  },
  providers: {
    baseUnity:            { aim: 50, criticalBelow: 30 },
    publicSupport:        { aim: 55, criticalBelow: 35 },
    governmentStability:  { aim: 65, criticalBelow: 40 },
    referendumProjection: { aim: 50, criticalBelow: 35 },
    reballotRisk:         { aim: 20, criticalBelow: 35, inverse: true },
  },
  aomrc: {
    baseUnity:            { aim: 60, criticalBelow: 40 },
    publicSupport:        { aim: 55, criticalBelow: 35 },
    governmentStability:  { aim: 60, criticalBelow: 35 },
    referendumProjection: { aim: 50, criticalBelow: 35 },
    reballotRisk:         { aim: 20, criticalBelow: 30, inverse: true },
  },
  ddrb: {
    baseUnity:            { aim: 50, criticalBelow: 30 },
    publicSupport:        { aim: 50, criticalBelow: 30 },
    governmentStability:  { aim: 60, criticalBelow: 35 },
    referendumProjection: { aim: 50, criticalBelow: 35 },
    reballotRisk:         { aim: 15, criticalBelow: 25, inverse: true },
  },
  base: {
    baseUnity:            { aim: 85, criticalBelow: 55 },
    publicSupport:        { aim: 70, criticalBelow: 45 },
    governmentStability:  { aim: 30, criticalBelow: 15, inverse: true },
    referendumProjection: { aim: 60, criticalBelow: 45 },
    reballotRisk:         { aim: 10, criticalBelow: 25, inverse: true },
  },
  press: {
    baseUnity:            { aim: 50, criticalBelow: 30 },
    publicSupport:        { aim: 60, criticalBelow: 35 },
    governmentStability:  { aim: 55, criticalBelow: 30 },
    referendumProjection: { aim: 50, criticalBelow: 35 },
    reballotRisk:         { aim: 20, criticalBelow: 30, inverse: true },
  },
};

const DEFAULT_AIM_PROFILE: Record<MetricAimKey, AimTarget> = ORGAN_AIM_PROFILES.rdc;

const STAGGER_CLASSES = [
  'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4',
  'stagger-5', 'stagger-6', 'stagger-7', 'stagger-8',
];

/** Color tokens for subtitle text */
type SubtitleColor = 'success' | 'warning' | 'destructive' | 'muted';

const SUBTITLE_COLOR_CLASSES: Record<SubtitleColor, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
};

interface SubtitleThreshold {
  label: string;
  color: SubtitleColor;
}

/** Per-organ subtitle evaluation for non-progress metrics. */
interface OrganSubtitleProfile {
  strikeDays: (v: number) => SubtitleThreshold;
  averagePayIncrease: (v: number) => SubtitleThreshold;
  trainingPlacesOffered: (v: number) => SubtitleThreshold;
  payRestorationGap: (v: number) => SubtitleThreshold;
  waitingListImpact: (v: number) => SubtitleThreshold;
  monthsToMandateExpiry: (v: number) => SubtitleThreshold;
}

const ORGAN_SUBTITLE_PROFILES: Record<string, OrganSubtitleProfile> = {
  // --- Union / worker side ---
  rdc: {
    strikeDays: (v) => v === 0 ? { label: 'Забастовка не запланирована', color: 'muted' }
      : v <= 2 ? { label: 'Минимальное давление', color: 'warning' }
      : v >= 7 ? { label: 'Максимальное давление', color: 'success' }
      : { label: 'Умеренное давление', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Щедрое предложение', color: 'success' }
      : v >= 5 ? { label: 'Приемлемое предложение', color: 'success' }
      : v >= 3 ? { label: 'Ниже ожиданий', color: 'warning' }
      : { label: 'Недостаточное предложение', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Достаточно мест', color: 'success' }
      : v >= 3000 ? { label: 'Частичное покрытие', color: 'warning' }
      : { label: 'Дефицит мест', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Почти восстановлено', color: 'success' }
      : v <= 15 ? { label: 'Значительный разрыв', color: 'warning' }
      : { label: 'Критический разрыв', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Сильное давление на систему', color: 'success' }
      : v > 0 ? { label: 'Умеренное давление', color: 'warning' }
      : { label: 'Нет рычага', color: 'muted' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Срочно!', color: 'destructive' }
      : v <= 3 ? { label: 'Время истекает', color: 'warning' }
      : { label: 'Достаточно времени', color: 'success' },
  },
  base: {
    strikeDays: (v) => v === 0 ? { label: 'Нет борьбы', color: 'destructive' }
      : v <= 2 ? { label: 'Слабое давление', color: 'warning' }
      : v >= 7 ? { label: 'Полная мобилизация', color: 'success' }
      : { label: 'Борьба продолжается', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Справедливое предложение', color: 'success' }
      : v >= 5 ? { label: 'Можно обсудить', color: 'warning' }
      : v >= 3 ? { label: 'Оскорбительное', color: 'destructive' }
      : { label: 'Неприемлемое', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Хорошо', color: 'success' }
      : v >= 3000 ? { label: 'Мало', color: 'warning' }
      : { label: 'Недостаточно', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Наконец-то!', color: 'success' }
      : v <= 15 ? { label: 'Ещё далеко', color: 'warning' }
      : { label: 'Нас ограбили', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Наша сила видна', color: 'success' }
      : v > 0 ? { label: 'Нужно больше давления', color: 'warning' }
      : { label: 'Нас не слышат', color: 'muted' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Последний шанс!', color: 'destructive' }
      : v <= 3 ? { label: 'Торопитесь!', color: 'warning' }
      : { label: 'Есть время', color: 'success' },
  },
  'bma-uk': {
    strikeDays: (v) => v === 0 ? { label: 'Пауза в эскалации', color: 'muted' }
      : v <= 2 ? { label: 'Ограниченная акция', color: 'warning' }
      : v >= 7 ? { label: 'Риск истощения фонда', color: 'destructive' }
      : { label: 'Умеренная нагрузка на фонд', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Выше рынка', color: 'success' }
      : v >= 5 ? { label: 'В рамках ожиданий', color: 'success' }
      : v >= 3 ? { label: 'Ниже инфляции', color: 'warning' }
      : { label: 'Реальное снижение зарплат', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Покрывает потребность', color: 'success' }
      : v >= 3000 ? { label: 'Частичное решение', color: 'warning' }
      : { label: 'Не решает проблему кадров', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Близко к цели', color: 'success' }
      : v <= 15 ? { label: 'Требуется доработка', color: 'warning' }
      : { label: 'Далеко от справедливости', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Репутационный риск', color: 'destructive' }
      : v > 0 ? { label: 'Управляемый уровень', color: 'warning' }
      : { label: 'Нет негативного эффекта', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Критический срок', color: 'destructive' }
      : v <= 3 ? { label: 'Нужна стратегия', color: 'warning' }
      : { label: 'Стабильная позиция', color: 'success' },
  },
  // --- Government / employer side ---
  dhsc: {
    strikeDays: (v) => v === 0 ? { label: 'Нормальная работа', color: 'success' }
      : v <= 2 ? { label: 'Минимальные сбои', color: 'success' }
      : v >= 7 ? { label: 'Кризис в NHS', color: 'destructive' }
      : { label: 'Заметные сбои', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'За пределами бюджета', color: 'destructive' }
      : v >= 5 ? { label: 'На пределе возможностей', color: 'warning' }
      : v >= 3 ? { label: 'Разумное предложение', color: 'success' }
      : { label: 'Консервативная позиция', color: 'success' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Щедрый пакет', color: 'success' }
      : v >= 3000 ? { label: 'В рамках бюджета', color: 'success' }
      : { label: 'Ограничено финансированием', color: 'warning' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Перерасход бюджета', color: 'destructive' }
      : v <= 15 ? { label: 'В пределах нормы', color: 'success' }
      : { label: 'Соответствует политике', color: 'success' },
    waitingListImpact: (v) => v > 10 ? { label: 'Недопустимый ущерб', color: 'destructive' }
      : v > 0 ? { label: 'Есть влияние на пациентов', color: 'warning' }
      : { label: 'Без влияния на очередь', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Шанс на сделку', color: 'success' }
      : v <= 3 ? { label: 'Окно возможностей', color: 'success' }
      : { label: 'Долгий конфликт', color: 'warning' },
  },
  hmt: {
    strikeDays: (v) => v === 0 ? { label: 'Фискальная стабильность', color: 'success' }
      : v <= 2 ? { label: 'Приемлемые издержки', color: 'success' }
      : v >= 7 ? { label: 'Угроза бюджету NHS', color: 'destructive' }
      : { label: 'Рост расходов', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Нефинансируемо', color: 'destructive' }
      : v >= 5 ? { label: 'Требует пересмотра бюджета', color: 'warning' }
      : v >= 3 ? { label: 'В рамках лимитов', color: 'success' }
      : { label: 'Фискально ответственно', color: 'success' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Дорогой пакет', color: 'warning' }
      : v >= 3000 ? { label: 'В пределах сметы', color: 'success' }
      : { label: 'Экономия средств', color: 'success' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Нецелевое расходование', color: 'destructive' }
      : v <= 15 ? { label: 'Приемлемая политика', color: 'success' }
      : { label: 'Соответствует мандату', color: 'success' },
    waitingListImpact: (v) => v > 10 ? { label: 'Политические издержки', color: 'destructive' }
      : v > 0 ? { label: 'Умеренный эффект', color: 'warning' }
      : { label: 'Нет политических рисков', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Можно переждать', color: 'success' }
      : v <= 3 ? { label: 'Тактика выжидания', color: 'success' }
      : { label: 'Затяжной спор', color: 'warning' },
  },
  providers: {
    strikeDays: (v) => v === 0 ? { label: 'Штатный режим', color: 'success' }
      : v <= 2 ? { label: 'Управляемые сбои', color: 'success' }
      : v >= 7 ? { label: 'Операционный кризис', color: 'destructive' }
      : { label: 'Нарушение плановой помощи', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Давление на трасты', color: 'destructive' }
      : v >= 5 ? { label: 'На грани бюджета трастов', color: 'warning' }
      : v >= 3 ? { label: 'Укладывается в тарифы', color: 'success' }
      : { label: 'Безопасно для трастов', color: 'success' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Хорошо для кадров', color: 'success' }
      : v >= 3000 ? { label: 'Частично закрывает вакансии', color: 'warning' }
      : { label: 'Кадровый голод продолжится', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Риск для тарифов', color: 'warning' }
      : v <= 15 ? { label: 'Устойчивая модель', color: 'success' }
      : { label: 'Стабильно для планирования', color: 'success' },
    waitingListImpact: (v) => v > 10 ? { label: 'Целевые показатели под угрозой', color: 'destructive' }
      : v > 0 ? { label: 'Незначительное отклонение', color: 'warning' }
      : { label: 'Показатели в норме', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Нужна определённость', color: 'warning' }
      : v <= 3 ? { label: 'Планирование затруднено', color: 'warning' }
      : { label: 'Можно планировать', color: 'success' },
  },
  aomrc: {
    strikeDays: (v) => v === 0 ? { label: 'Обучение без сбоев', color: 'success' }
      : v <= 2 ? { label: 'Минимальное влияние на обучение', color: 'success' }
      : v >= 7 ? { label: 'Обучение серьёзно нарушено', color: 'destructive' }
      : { label: 'Влияние на ротацию', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Привлекательно для стажёров', color: 'success' }
      : v >= 5 ? { label: 'Конкурентоспособно', color: 'success' }
      : v >= 3 ? { label: 'Риск оттока кадров', color: 'warning' }
      : { label: 'Утечка мозгов неизбежна', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Покрывает потребности', color: 'success' }
      : v >= 3000 ? { label: 'Частично достаточно', color: 'warning' }
      : { label: 'Угроза качеству обучения', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'Справедливо для стажёров', color: 'success' }
      : v <= 15 ? { label: 'Демотивирует стажёров', color: 'warning' }
      : { label: 'Кризис привлечения', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Страдают пациенты и обучение', color: 'destructive' }
      : v > 0 ? { label: 'Умеренный компромисс', color: 'warning' }
      : { label: 'Баланс сохранён', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Угроза учебному году', color: 'destructive' }
      : v <= 3 ? { label: 'Нужно решение', color: 'warning' }
      : { label: 'Стабильный учебный цикл', color: 'success' },
  },
  ddrb: {
    strikeDays: (v) => v === 0 ? { label: 'Стабильная среда', color: 'success' }
      : v <= 2 ? { label: 'Ограниченное влияние', color: 'success' }
      : v >= 7 ? { label: 'Системный сбой', color: 'destructive' }
      : { label: 'Заметное disruption', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Выше рекомендаций DDRB', color: 'warning' }
      : v >= 5 ? { label: 'В рамках рекомендаций', color: 'success' }
      : v >= 3 ? { label: 'Ниже рекомендаций', color: 'warning' }
      : { label: 'Игнорирование DDRB', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Соответствует прогнозам', color: 'success' }
      : v >= 3000 ? { label: 'Ниже прогнозов', color: 'warning' }
      : { label: 'Серьёзное расхождение', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'В пределах погрешности', color: 'success' }
      : v <= 15 ? { label: 'Требует корректировки', color: 'warning' }
      : { label: 'Структурная проблема', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Влияет на данные мониторинга', color: 'warning' }
      : v > 0 ? { label: 'Незначительное отклонение', color: 'success' }
      : { label: 'Данные стабильны', color: 'success' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Сжатые сроки обзора', color: 'warning' }
      : v <= 3 ? { label: 'В рабочем цикле', color: 'success' }
      : { label: 'Достаточно данных', color: 'success' },
  },
  press: {
    strikeDays: (v) => v === 0 ? { label: 'Тишина в эфире', color: 'muted' }
      : v <= 2 ? { label: 'Новостной фон', color: 'muted' }
      : v >= 7 ? { label: 'Главная тема новостей', color: 'warning' }
      : { label: 'Заметный сюжет', color: 'warning' },
    averagePayIncrease: (v) => v >= 8 ? { label: 'Заголовок: «Щедрая сделка»', color: 'success' }
      : v >= 5 ? { label: 'Нейтральный нарратив', color: 'muted' }
      : v >= 3 ? { label: 'Заголовок: «Врачи недовольны»', color: 'warning' }
      : { label: 'Заголовок: «Кризис недоверия»', color: 'destructive' },
    trainingPlacesOffered: (v) => v >= 5000 ? { label: 'Позитивный сигнал', color: 'success' }
      : v >= 3000 ? { label: 'Неоднозначная реакция', color: 'warning' }
      : { label: 'Критика в СМИ', color: 'destructive' },
    payRestorationGap: (v) => v <= 5 ? { label: 'История успеха', color: 'success' }
      : v <= 15 ? { label: 'Смешанные отзывы', color: 'warning' }
      : { label: 'Скандал в прессе', color: 'destructive' },
    waitingListImpact: (v) => v > 10 ? { label: 'Истории пациентов в СМИ', color: 'destructive' }
      : v > 0 ? { label: 'Единичные репортажи', color: 'warning' }
      : { label: 'Нет медийного эффекта', color: 'muted' },
    monthsToMandateExpiry: (v) => v <= 1 ? { label: 'Дедлайн для прессы', color: 'warning' }
      : v <= 3 ? { label: 'Нарастающее внимание', color: 'warning' }
      : { label: 'Фоновая тема', color: 'muted' },
  },
};

const DEFAULT_SUBTITLE_PROFILE: OrganSubtitleProfile = ORGAN_SUBTITLE_PROFILES.rdc;

export const MetricsBoard = memo(function MetricsBoard({ metrics, organs }: MetricsBoardProps) {
  const [selectedOrganId, setSelectedOrganId] = useState<string>('rdc');

  const aimProfile = ORGAN_AIM_PROFILES[selectedOrganId] ?? DEFAULT_AIM_PROFILE;
  const subProfile = ORGAN_SUBTITLE_PROFILES[selectedOrganId] ?? DEFAULT_SUBTITLE_PROFILE;

  const strikeSub = subProfile.strikeDays(metrics.strikeDaysScheduled);
  const paySub = subProfile.averagePayIncrease(metrics.averagePayIncrease);
  const placesSub = subProfile.trainingPlacesOffered(metrics.trainingPlacesOffered);
  const gapSub = subProfile.payRestorationGap(metrics.payRestorationGap);
  const waitSub = subProfile.waitingListImpact(metrics.waitingListImpact);
  const mandateSub = subProfile.monthsToMandateExpiry(metrics.monthsToMandateExpiry);

  const metricsData: Array<{
    title: string;
    description: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    showProgress?: boolean;
    progressMax?: number;
    progressValue?: number;
    variant?: "default" | "secondary" | "destructive";
    aimKey?: string;
    subtitle?: string;
    subtitleColor?: SubtitleColor;
  }> = [
    {
      title: 'Дни забастовки',
      description: 'Запланированное количество дней забастовки в текущем периоде конфликта.',
      value: metrics.strikeDaysScheduled,
      icon: Calendar,
      subtitle: strikeSub.label,
      subtitleColor: strikeSub.color,
    },
    {
      title: 'Средняя надбавка',
      description: 'Средний процент повышения заработной платы, предложенный работодателями.',
      value: `${metrics.averagePayIncrease}%`,
      icon: TrendingUp,
      subtitle: paySub.label,
      subtitleColor: paySub.color,
    },
    {
      title: 'Места ординатуры',
      description: 'Количество мест ординатуры (специализации), предложенных для врачей-стажёров.',
      value: metrics.trainingPlacesOffered.toLocaleString('ru-RU'),
      icon: MapPin,
      subtitle: placesSub.label,
      subtitleColor: placesSub.color,
    },
    {
      title: 'Экзаменационные сборы',
      description: 'Статус компенсации экзаменационных сборов для медицинских специалистов.',
      value: metrics.examFeesCompensated ? 'Компенсированы' : 'Не компенсированы',
      icon: FileText,
      subtitle: metrics.examFeesCompensated
        ? 'Требование выполнено'
        : 'Требование не выполнено',
      subtitleColor: metrics.examFeesCompensated ? 'success' : 'destructive',
    },
    {
      title: 'Разрыв с 2008',
      description: 'Насколько текущий уровень оплаты труда отстаёт от уровня 2008 года с учётом инфляции.',
      value: `~${metrics.payRestorationGap}% ниже`,
      icon: Percent,
      subtitle: gapSub.label,
      subtitleColor: gapSub.color,
    },
    {
      title: 'Единство базы',
      description: 'Уровень сплочённости и поддержки среди рядовых членов профсоюза.',
      value: `${metrics.baseUnity}%`,
      icon: Users,
      showProgress: true,
      progressMax: 100,
      progressValue: metrics.baseUnity,
      aimKey: 'baseUnity',
    },
    {
      title: 'Общественная поддержка',
      description: 'Уровень поддержки действий профсоюза со стороны широкой общественности.',
      value: `${metrics.publicSupport}%`,
      icon: Heart,
      showProgress: true,
      progressMax: 100,
      progressValue: metrics.publicSupport,
      aimKey: 'publicSupport',
    },
    {
      title: 'Стабильность правительства',
      description: 'Текущая устойчивость правительственной коалиции и её способность вести переговоры.',
      value: `${metrics.governmentStability}%`,
      icon: Shield,
      showProgress: true,
      progressMax: 100,
      progressValue: metrics.governmentStability,
    },
    {
      title: 'Влияние на очередь',
      description: 'Влияние забастовки на сокращение очередей пациентов в системе здравоохранения.',
      value: metrics.waitingListImpact > 0 ? `+${metrics.waitingListImpact}%` : 'Нет данных',
      icon: Clock,
      subtitle: waitSub.label,
      subtitleColor: waitSub.color,
    },
    {
      title: 'Месяцев до истечения мандата',
      description: 'Оставшееся время до окончания текущего переговорного мандата профсоюза.',
      value: metrics.monthsToMandateExpiry,
      icon: Calendar,
      subtitle: mandateSub.label,
      subtitleColor: mandateSub.color,
    },
    {
      title: 'Проекция референдума',
      description: 'Прогнозируемый результат голосования на референдуме по текущему предложению.',
      value: `${metrics.referendumProjection}%`,
      icon: Vote,
      showProgress: true,
      progressMax: 100,
      progressValue: metrics.referendumProjection,
      variant: getRiskVariant(metrics.referendumProjection),
      aimKey: 'referendumProjection',
    },
    {
      title: 'Риск re-ballot',
      description: 'Вероятность повторного голосования из-за недостаточной явки или спорных результатов.',
      value: `${metrics.reballotRisk}%`,
      icon: AlertTriangle,
      showProgress: true,
      progressMax: 100,
      progressValue: metrics.reballotRisk,
      variant: getRiskVariant(metrics.reballotRisk),
      aimKey: 'reballotRisk',
    },
  ];

  return (
    <TooltipProvider>
      <section className="w-full py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Ключевые метрики</h2>
          {organs && organs.length > 0 && (
            <div className="relative inline-flex items-center min-w-0 max-w-full sm:max-w-[280px] md:max-w-[340px]">
              <label htmlFor="aim-organ-select" className="sr-only">Цель для</label>
              <select
                id="aim-organ-select"
                value={selectedOrganId}
                onChange={(e) => setSelectedOrganId(e.target.value)}
                title={`Цель для: ${organs.find((o) => o.id === selectedOrganId)?.name ?? ''}`}
                className={cn(
                  "appearance-none w-full pl-3 pr-8 py-1.5 text-xs md:text-sm font-medium rounded-md truncate",
                  "bg-secondary text-secondary-foreground border border-border",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  "cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {organs.map((organ) => (
                  <option key={organ.id} value={organ.id}>
                    Цель для: {organ.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 size-3.5 pointer-events-none text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {metricsData.map((metric, index) => (
            <Card 
              key={index} 
              className={cn("overflow-hidden animate-slide-up", STAGGER_CLASSES[index % STAGGER_CLASSES.length])}
            >
              <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground leading-tight truncate">
                      {metric.title}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="size-3.5 flex-shrink-0 text-muted-foreground/60 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-wrap">
                        {metric.description}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <metric.icon className="size-4 md:size-5 flex-shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold truncate">{metric.value}</div>
              {!metric.showProgress && metric.subtitle && (
                <p className={cn("text-xs mt-1", SUBTITLE_COLOR_CLASSES[metric.subtitleColor ?? 'muted'])}>
                  {metric.subtitle}
                </p>
              )}
              {metric.showProgress && metric.progressValue !== undefined && (() => {
                const aim = metric.aimKey ? aimProfile[metric.aimKey as MetricAimKey] : undefined;
                const isAtAim = aim && (
                  aim.inverse
                    ? metric.progressValue <= aim.aim
                    : metric.progressValue >= aim.aim
                );
                const isCritical = aim && !isAtAim && (
                  aim.inverse
                    ? metric.progressValue >= aim.criticalBelow
                    : metric.progressValue < aim.criticalBelow
                );
                return (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Progress 
                        value={metric.progressValue} 
                        max={metric.progressMax}
                      />
                      {aim && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 size-2.5 rounded-full border-2 border-background shadow-sm cursor-help z-10",
                                  isAtAim
                                    ? "bg-success"
                                    : isCritical
                                      ? "bg-destructive animate-pulse"
                                      : "bg-warning"
                                )}
                                style={{ left: `${aim.aim}%` }}
                              />
                            }
                          />
                          <TooltipContent side="top">
                            {isAtAim
                              ? `✓ Цель достигнута (${aim.aim}%)`
                              : isCritical
                                ? `⚠ Критически низко! Цель: ${aim.aim}%`
                                : `Цель: ${aim.aim}%`}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.variant && (
                        <Badge variant={metric.variant} className="w-fit">
                          {Math.round(metric.progressValue!)}%
                        </Badge>
                      )}
                      {aim && (
                        <span className={cn(
                          "flex items-center gap-1 text-xs",
                          isAtAim
                            ? "text-success"
                            : isCritical
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                        )}>
                          <Target className="size-3" />
                          {aim.aim}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
        </div>
      </section>
    </TooltipProvider>
  );
});
