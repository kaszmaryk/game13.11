import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useGameState } from "@/hooks/useGameState";

/**
 * Built-in quick descriptions for domain-specific terms.
 * Used as fallback when the glossary from context.json has no matching entry.
 */
const BUILTIN_TERMS: Record<string, string> = {
  "NHS": "National Health Service — государственная система здравоохранения Великобритании",
  "резидент-врачей": "Resident doctors — врачи на этапах постдипломной подготовки (ранее junior doctors)",
  "резидент-врачи": "Resident doctors — врачи на этапах постдипломной подготовки (ранее junior doctors)",
  "FY1": "Foundation Year 1 — первый год интернатуры после медицинского вуза",
  "FY2": "Foundation Year 2 — второй год интернатуры",
  "ST8": "Specialty Training year 8 — старший ординатор на последнем году специализации",
  "BMA": "British Medical Association — профсоюз врачей Великобритании",
  "pay restoration": "Восстановление реальной зарплаты до уровня 2008 года с учётом инфляции",
  "DDRB": "Doctors' and Dentists' Review Body — независимый орган по пересмотру зарплат врачей и стоматологов",
  "CPI": "Consumer Price Index — индекс потребительских цен, основная мера инфляции",
  "waiting list": "Очередь на плановое лечение в NHS; измеряется количеством пациентов, ожидающих процедуры",
  "locum": "Временный врач, нанимаемый больницей через агентство для закрытия вакантных смен; стоит значительно дороже штатного персонала",
  "RDC": "Resident Doctors Committee — забастовочный комитет резидент-врачей при BMA",
  "DHSC": "Department of Health and Social Care — Министерство здравоохранения и социальной защиты Великобритании",
  "HMT": "HM Treasury — Казначейство Её Величества, контролирует бюджетные лимиты всех министерств",
  "Кир Стармер": "Премьер-министр Великобритании с июля 2024, лидер Лейбористской партии",
  "Джеймс Мюррей": "Министр здравоохранения с 14 мая 2026, ранее работал в Казначействе; придерживается жёсткой бюджетной линии",
  "Уэс Стритинг": "Бывший министр здравоохранения (июль 2024 – май 2026), смещён после смены стратегии правительства",
  "Джек Флетчер": "Глава RDC, ведёт переговоры от имени резидент-врачей и определяет рекомендацию базе на референдуме",
  "референдум": "Голосование членов профсоюза простым большинством для принятия или отклонения оферты правительства",
  "мандат": "Результат голосования членов профсоюза, дающий право на проведение забастовки; имеет срок действия",
  "оферта": "Формальное предложение правительства по условиям оплаты и другим вопросам, выносимое на голосование базы",
  "Казначейства": "HM Treasury — финансовое ведомство, устанавливающее лимиты расходов для всех министерств",
  "Казначейство": "HM Treasury — финансовое ведомство, устанавливающее лимиты расходов для всех министерств",
};

interface TermProps {
  /** The exact term text as it appears in the paragraph */
  children: string;
  /** Optional override description; takes priority over glossary and built-in */
  description?: string;
}

export function Term({ children, description }: TermProps) {
  const { gameState } = useGameState();

  // Priority: explicit prop > glossary from context.json > built-in dictionary
  const resolvedDescription =
    description ??
    gameState?.glossary?.find(
      (t) => t.term.toLowerCase() === children.toLowerCase()
    )?.definition ??
    BUILTIN_TERMS[children];

  if (!resolvedDescription) {
    // No description available — render plain text without tooltip
    return <span>{children}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className="border-b border-dashed border-primary/50 cursor-help text-foreground"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        <p className="max-w-xs leading-snug">{resolvedDescription}</p>
      </TooltipContent>
    </Tooltip>
  );
}
