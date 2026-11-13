import {
  StethoscopeIcon,
  Building2Icon,
  UsersIcon,
  TrendingDownIcon,
  CalendarIcon,
  VoteIcon,
  LandmarkIcon,
  ScaleIcon,
  BriefcaseIcon,
  ShieldAlertIcon,
  GavelIcon,
  WalletIcon,
  ActivityIcon,
  TrophyIcon,
  MegaphoneIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  FileTextIcon,
  ArrowRightLeftIcon,
  ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideIllustrationProps {
  slideIndex: number;
  className?: string;
}

/**
 * Thematic SVG illustrations for each of the 20 briefing slides.
 * Uses Lucide icons composed with simple SVG shapes for lightweight,
 * dark-mode-compatible visuals that need no external assets.
 */
export function SlideIllustration({ slideIndex, className }: SlideIllustrationProps) {
  const illustrations: Record<number, React.ReactNode> = {
    // Slide 0: Title — NHS strike banner
    0: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background shape */}
        <rect x="10" y="10" width="180" height="100" rx="12" className="fill-primary/10 stroke-primary/20" strokeWidth="1.5" />
        {/* NHS cross */}
        <rect x="75" y="25" width="50" height="50" rx="6" className="fill-primary/20" />
        <rect x="92" y="32" width="16" height="36" rx="2" className="fill-primary" />
        <rect x="82" y="42" width="36" height="16" rx="2" className="fill-primary" />
        {/* Strike sign */}
        <line x1="40" y1="85" x2="160" y2="85" className="stroke-destructive" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="92" x2="160" y2="92" className="stroke-destructive" strokeWidth="3" strokeLinecap="round" />
        {/* People silhouettes */}
        <circle cx="55" cy="70" r="5" className="fill-muted-foreground/40" />
        <circle cx="100" cy="68" r="6" className="fill-muted-foreground/50" />
        <circle cx="145" cy="70" r="5" className="fill-muted-foreground/40" />
      </svg>
    ),

    // Slide 1: NHS institution
    1: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hospital building */}
        <rect x="50" y="30" width="100" height="70" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
        <rect x="85" y="70" width="30" height="30" rx="2" className="fill-primary/20" />
        {/* Cross on building */}
        <rect x="93" y="38" width="14" height="28" rx="2" className="fill-primary" />
        <rect x="86" y="45" width="28" height="14" rx="2" className="fill-primary" />
        {/* Windows */}
        <rect x="58" y="40" width="12" height="10" rx="1" className="fill-primary/20" />
        <rect x="130" y="40" width="12" height="10" rx="1" className="fill-primary/20" />
        <rect x="58" y="56" width="12" height="10" rx="1" className="fill-primary/20" />
        <rect x="130" y="56" width="12" height="10" rx="1" className="fill-primary/20" />
        {/* Ground */}
        <line x1="30" y1="100" x2="170" y2="100" className="stroke-muted-foreground/30" strokeWidth="1.5" />
        {/* Flag */}
        <line x1="155" y1="15" x2="155" y2="30" className="stroke-muted-foreground/50" strokeWidth="1.5" />
        <rect x="155" y="15" width="20" height="12" rx="1" className="fill-primary/30" />
      </svg>
    ),

    // Slide 2: Resident doctors hierarchy
    2: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pyramid/stairs */}
        <rect x="30" y="80" width="140" height="25" rx="3" className="fill-muted-foreground/10 stroke-muted-foreground/20" strokeWidth="1" />
        <rect x="50" y="55" width="100" height="25" rx="3" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
        <rect x="70" y="30" width="60" height="25" rx="3" className="fill-primary/20 stroke-primary/30" strokeWidth="1" />
        {/* Labels */}
        <text x="100" y="97" textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">FY1–FY2</text>
        <text x="100" y="72" textAnchor="middle" className="fill-primary/80 text-[9px] font-medium">ST3–ST8</text>
        <text x="100" y="47" textAnchor="middle" className="fill-primary text-[9px] font-bold">LED</text>
        {/* Stethoscope icon hint */}
        <circle cx="170" cy="25" r="12" className="fill-primary/10" />
        <path d="M166 22 C166 18, 174 18, 174 22 L174 28 C174 32, 166 32, 166 28Z" className="stroke-primary fill-none" strokeWidth="1.5" />
      </svg>
    ),

    // Slide 3: Timeline 2008–2023
    3: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Timeline line */}
        <line x1="20" y1="60" x2="180" y2="60" className="stroke-muted-foreground/30" strokeWidth="2" />
        {/* Year markers */}
        <circle cx="35" cy="60" r="5" className="fill-primary/30 stroke-primary" strokeWidth="1.5" />
        <text x="35" y="80" textAnchor="middle" className="fill-muted-foreground text-[8px]">2008</text>
        <circle cx="80" cy="60" r="5" className="fill-destructive/30 stroke-destructive" strokeWidth="1.5" />
        <text x="80" y="80" textAnchor="middle" className="fill-muted-foreground text-[8px]">2016</text>
        <circle cx="125" cy="60" r="5" className="fill-muted-foreground/30 stroke-muted-foreground" strokeWidth="1.5" />
        <text x="125" y="80" textAnchor="middle" className="fill-muted-foreground text-[8px]">2020</text>
        <circle cx="165" cy="60" r="6" className="fill-destructive stroke-destructive" strokeWidth="2" />
        <text x="165" y="80" textAnchor="middle" className="fill-destructive text-[8px] font-bold">2023</text>
        {/* Downward trend arrow */}
        <path d="M35 40 Q80 45, 125 50 T165 55" className="stroke-destructive/60 fill-none" strokeWidth="1.5" strokeDasharray="4 2" />
        <polygon points="165,55 160,50 162,58" className="fill-destructive/60" />
        {/* Label */}
        <text x="100" y="25" textAnchor="middle" className="fill-muted-foreground/60 text-[8px]">Реальная зарплата ↓</text>
      </svg>
    ),

    // Slide 4: Strikes under Conservatives
    4: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Picket signs */}
        <line x1="45" y1="40" x2="45" y2="100" className="stroke-muted-foreground/50" strokeWidth="2" />
        <rect x="25" y="20" width="40" height="25" rx="3" className="fill-destructive/20 stroke-destructive/40" strokeWidth="1" />
        <text x="45" y="36" textAnchor="middle" className="fill-destructive text-[7px] font-bold">NHS</text>
        <line x1="100" y1="35" x2="100" y2="100" className="stroke-muted-foreground/50" strokeWidth="2" />
        <rect x="78" y="15" width="44" height="25" rx="3" className="fill-destructive/30 stroke-destructive/50" strokeWidth="1" />
        <text x="100" y="31" textAnchor="middle" className="fill-destructive text-[7px] font-bold">PAY</text>
        <line x1="155" y1="40" x2="155" y2="100" className="stroke-muted-foreground/50" strokeWidth="2" />
        <rect x="135" y="20" width="40" height="25" rx="3" className="fill-destructive/20 stroke-destructive/40" strokeWidth="1" />
        <text x="155" y="36" textAnchor="middle" className="fill-destructive text-[7px] font-bold">SAFE</text>
        {/* Crowd dots */}
        {[30, 55, 75, 95, 115, 135, 160].map((x, i) => (
          <circle key={i} cx={x} cy={105 + (i % 2) * 4} r="3" className="fill-muted-foreground/30" />
        ))}
      </svg>
    ),

    // Slide 5: Change of government
    5: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Two buildings facing each other */}
        <rect x="20" y="35" width="60" height="55" rx="4" className="fill-muted-foreground/10 stroke-muted-foreground/30" strokeWidth="1" />
        <text x="50" y="68" textAnchor="middle" className="fill-muted-foreground/60 text-[8px]">CON</text>
        {/* Arrow */}
        <path d="M85 60 L115 60" className="stroke-primary" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
          </marker>
        </defs>
        <rect x="120" y="35" width="60" height="55" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1" />
        <text x="150" y="68" textAnchor="middle" className="fill-primary/80 text-[8px]">LAB</text>
        {/* Same budget lock */}
        <rect x="75" y="85" width="50" height="20" rx="3" className="fill-destructive/10 stroke-destructive/30" strokeWidth="1" />
        <text x="100" y="99" textAnchor="middle" className="fill-destructive text-[7px] font-bold">£ LOCK</text>
        {/* Year label */}
        <text x="100" y="20" textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">Июль 2024</text>
      </svg>
    ),

    // Slide 6: 2025-2026 escalation
    6: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rising cost bars */}
        <rect x="30" y="70" width="25" height="30" rx="2" className="fill-muted-foreground/20" />
        <rect x="65" y="55" width="25" height="45" rx="2" className="fill-destructive/20" />
        <rect x="100" y="40" width="25" height="60" rx="2" className="fill-destructive/30" />
        <rect x="135" y="25" width="25" height="75" rx="2" className="fill-destructive/50" />
        {/* Labels */}
        <text x="42" y="110" textAnchor="middle" className="fill-muted-foreground text-[7px]">CPI</text>
        <text x="77" y="110" textAnchor="middle" className="fill-muted-foreground text-[7px]">Жильё</text>
        <text x="112" y="110" textAnchor="middle" className="fill-muted-foreground text-[7px]">Транс.</text>
        <text x="147" y="110" textAnchor="middle" className="fill-muted-foreground text-[7px]">Бензин</text>
        {/* Upward arrow */}
        <path d="M25 95 L165 20" className="stroke-destructive/40 fill-none" strokeWidth="1.5" strokeDasharray="4 2" />
        <polygon points="165,20 158,24 163,28" className="fill-destructive/40" />
      </svg>
    ),

    // Slide 7: Pay Restoration gap
    7: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Two bars comparison */}
        <rect x="30" y="20" width="60" height="80" rx="4" className="fill-primary/20 stroke-primary/30" strokeWidth="1" />
        <text x="60" y="55" textAnchor="middle" className="fill-primary text-[10px] font-bold">100%</text>
        <text x="60" y="112" textAnchor="middle" className="fill-muted-foreground text-[8px]">2008</text>
        <rect x="110" y="36" width="60" height="64" rx="4" className="fill-destructive/20 stroke-destructive/30" strokeWidth="1" />
        <text x="140" y="65" textAnchor="middle" className="fill-destructive text-[10px] font-bold">~80%</text>
        <text x="140" y="112" textAnchor="middle" className="fill-muted-foreground text-[8px]">2026</text>
        {/* Gap indicator */}
        <line x1="95" y1="36" x2="95" y2="100" className="stroke-destructive" strokeWidth="1" strokeDasharray="3 2" />
        <text x="95" y="30" textAnchor="middle" className="fill-destructive text-[8px] font-bold">−20%</text>
      </svg>
    ),

    // Slide 8: Three demands
    8: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Three pillars */}
        <rect x="20" y="30" width="45" height="65" rx="4" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
        <text x="42" y="55" textAnchor="middle" className="fill-primary text-[16px] font-bold">£</text>
        <text x="42" y="72" textAnchor="middle" className="fill-primary/70 text-[7px]">PAY</text>
        <rect x="78" y="30" width="45" height="65" rx="4" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
        <text x="100" y="55" textAnchor="middle" className="fill-primary text-[16px] font-bold">🎓</text>
        <text x="100" y="72" textAnchor="middle" className="fill-primary/70 text-[7px]">Места</text>
        <rect x="136" y="30" width="45" height="65" rx="4" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
        <text x="158" y="55" textAnchor="middle" className="fill-primary text-[16px] font-bold">📋</text>
        <text x="158" y="72" textAnchor="middle" className="fill-primary/70 text-[7px]">Сборы</text>
        {/* Base line */}
        <line x1="15" y1="100" x2="185" y2="100" className="stroke-muted-foreground/30" strokeWidth="1.5" />
      </svg>
    ),

    // Slide 9: DDRB anchor
    9: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Scale/balance */}
        <line x1="100" y1="20" x2="100" y2="50" className="stroke-muted-foreground/50" strokeWidth="2" />
        <polygon points="90,50 110,50 100,40" className="fill-muted-foreground/30" />
        {/* Left pan - government */}
        <line x1="50" y1="55" x2="100" y2="50" className="stroke-muted-foreground/40" strokeWidth="1.5" />
        <path d="M30 55 Q50 70, 70 55" className="stroke-primary/50 fill-primary/10" strokeWidth="1.5" />
        <text x="50" y="80" textAnchor="middle" className="fill-muted-foreground text-[7px]">HMT</text>
        {/* Right pan - union */}
        <line x1="150" y1="55" x2="100" y2="50" className="stroke-muted-foreground/40" strokeWidth="1.5" />
        <path d="M130 55 Q150 70, 170 55" className="stroke-destructive/50 fill-destructive/10" strokeWidth="1.5" />
        <text x="150" y="80" textAnchor="middle" className="fill-muted-foreground text-[7px]">BMA</text>
        {/* DDRB anchor in center */}
        <circle cx="100" cy="95" r="12" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
        <text x="100" y="99" textAnchor="middle" className="fill-primary text-[8px] font-bold">3.5%</text>
        <text x="100" y="115" textAnchor="middle" className="fill-muted-foreground text-[7px]">DDRB</text>
      </svg>
    ),

    // Slide 10: Treasury envelope / contagion
    10: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Envelope shape */}
        <rect x="40" y="25" width="120" height="70" rx="6" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
        <path d="M40 25 L100 60 L160 25" className="stroke-primary/30 fill-none" strokeWidth="1.5" />
        {/* Lock */}
        <rect x="88" y="55" width="24" height="18" rx="3" className="fill-destructive/30 stroke-destructive/50" strokeWidth="1" />
        <circle cx="100" cy="64" r="3" className="fill-destructive" />
        {/* Contagion arrows radiating out */}
        <path d="M160 45 L180 35" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-red)" />
        <path d="M160 60 L185 60" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-red)" />
        <path d="M160 75 L180 85" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-red)" />
        <path d="M40 45 L20 35" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-red)" />
        <path d="M40 75 L20 85" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-red)" />
        <defs>
          <marker id="arr-red" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" className="fill-destructive/40" />
          </marker>
        </defs>
        {/* Labels */}
        <text x="185" y="32" className="fill-destructive/60 text-[6px]">NEU</text>
        <text x="187" y="63" className="fill-destructive/60 text-[6px]">RCN</text>
        <text x="182" y="92" className="fill-destructive/60 text-[6px]">Police</text>
        <text x="5" y="32" className="fill-destructive/60 text-[6px]">GP</text>
        <text x="2" y="92" className="fill-destructive/60 text-[6px]">SAS</text>
      </svg>
    ),

    // Slide 11: All organs overview
    11: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagonal network */}
        {[
          { x: 100, y: 30, color: '#E30613' },
          { x: 55, y: 55, color: '#C41E3A' },
          { x: 145, y: 55, color: '#2E5C9E' },
          { x: 40, y: 90, color: '#009B3D' },
          { x: 100, y: 90, color: '#6B4C9A' },
          { x: 160, y: 90, color: '#D4A017' },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="14" fill={node.color} fillOpacity="0.15" stroke={node.color} strokeWidth="1.5" strokeOpacity="0.4" />
            <circle cx={node.x} cy={node.y} r="4" fill={node.color} fillOpacity="0.6" />
          </g>
        ))}
        {/* Connection lines */}
        <line x1="100" y1="30" x2="55" y2="55" className="stroke-muted-foreground/20" strokeWidth="1" />
        <line x1="100" y1="30" x2="145" y2="55" className="stroke-muted-foreground/20" strokeWidth="1" />
        <line x1="55" y1="55" x2="40" y2="90" className="stroke-muted-foreground/20" strokeWidth="1" />
        <line x1="55" y1="55" x2="100" y2="90" className="stroke-muted-foreground/20" strokeWidth="1" />
        <line x1="145" y1="55" x2="100" y2="90" className="stroke-muted-foreground/20" strokeWidth="1" />
        <line x1="145" y1="55" x2="160" y2="90" className="stroke-muted-foreground/20" strokeWidth="1" />
      </svg>
    ),

    // Slide 12: RDC
    12: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Megaphone */}
        <path d="M60 40 L120 25 L120 75 L60 60 Z" className="fill-[#E30613]/20 stroke-[#E30613]/50" strokeWidth="1.5" />
        <rect x="45" y="42" width="18" height="16" rx="3" className="fill-[#E30613]/30 stroke-[#E30613]/50" strokeWidth="1" />
        {/* Sound waves */}
        <path d="M125 35 Q140 50, 125 65" className="stroke-[#E30613]/30 fill-none" strokeWidth="1.5" />
        <path d="M132 28 Q152 50, 132 72" className="stroke-[#E30613]/20 fill-none" strokeWidth="1.5" />
        <path d="M139 21 Q164 50, 139 79" className="stroke-[#E30613]/10 fill-none" strokeWidth="1.5" />
        {/* People below */}
        {[50, 70, 90, 110, 130, 150].map((x, i) => (
          <circle key={i} cx={x} cy={100 + (i % 2) * 5} r="4" className="fill-[#E30613]/20" />
        ))}
        <text x="100" y="115" textAnchor="middle" className="fill-muted-foreground text-[7px]">≈81 000 резидентов</text>
      </svg>
    ),

    // Slide 13: BMA UK
    13: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Umbrella shape */}
        <path d="M30 60 Q100 10, 170 60" className="fill-[#C41E3A]/15 stroke-[#C41E3A]/40" strokeWidth="1.5" />
        <line x1="100" y1="35" x2="100" y2="95" className="stroke-[#C41E3A]/40" strokeWidth="2" />
        {/* Branch labels under umbrella */}
        <text x="50" y="75" textAnchor="middle" className="fill-muted-foreground text-[7px]">Резид.</text>
        <text x="80" y="75" textAnchor="middle" className="fill-muted-foreground text-[7px]">Конс.</text>
        <text x="110" y="75" textAnchor="middle" className="fill-muted-foreground text-[7px]">GP</text>
        <text x="140" y="75" textAnchor="middle" className="fill-muted-foreground text-[7px]">Студ.</text>
        {/* Fund box */}
        <rect x="70" y="88" width="60" height="20" rx="3" className="fill-[#C41E3A]/10 stroke-[#C41E3A]/30" strokeWidth="1" />
        <text x="100" y="102" textAnchor="middle" className="fill-[#C41E3A]/70 text-[8px] font-bold">£ Фонд</text>
      </svg>
    ),

    // Slide 14: DHSC
    14: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Government building */}
        <rect x="55" y="35" width="90" height="60" rx="4" className="fill-[#2E5C9E]/10 stroke-[#2E5C9E]/30" strokeWidth="1.5" />
        {/* Columns */}
        <rect x="65" y="45" width="8" height="40" rx="1" className="fill-[#2E5C9E]/20" />
        <rect x="85" y="45" width="8" height="40" rx="1" className="fill-[#2E5C9E]/20" />
        <rect x="107" y="45" width="8" height="40" rx="1" className="fill-[#2E5C9E]/20" />
        <rect x="127" y="45" width="8" height="40" rx="1" className="fill-[#2E5C9E]/20" />
        {/* Pediment */}
        <polygon points="50,35 100,15 150,35" className="fill-[#2E5C9E]/15 stroke-[#2E5C9E]/30" strokeWidth="1" />
        {/* Negotiation arrows */}
        <path d="M25 70 L50 60" className="stroke-destructive/40" strokeWidth="1.5" markerEnd="url(#arr-blue)" />
        <path d="M175 70 L150 60" className="stroke-primary/40" strokeWidth="1.5" markerEnd="url(#arr-blue)" />
        <text x="20" y="80" textAnchor="middle" className="fill-destructive/60 text-[7px]">BMA</text>
        <text x="180" y="80" textAnchor="middle" className="fill-primary/60 text-[7px]">HMT</text>
        <defs>
          <marker id="arr-blue" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" className="fill-[#2E5C9E]/40" />
          </marker>
        </defs>
        <text x="100" y="108" textAnchor="middle" className="fill-muted-foreground text-[7px]">Джеймс Мюррей</text>
      </svg>
    ),

    // Slide 15: HMT + Downing Street
    15: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Treasury building */}
        <rect x="30" y="30" width="60" height="55" rx="4" className="fill-[#009B3D]/10 stroke-[#009B3D]/30" strokeWidth="1.5" />
        <text x="60" y="55" textAnchor="middle" className="fill-[#009B3D]/70 text-[9px] font-bold">HMT</text>
        <text x="60" y="70" textAnchor="middle" className="fill-muted-foreground text-[7px]">£ £ £</text>
        {/* Door #10 */}
        <rect x="120" y="30" width="50" height="55" rx="4" className="fill-muted-foreground/10 stroke-muted-foreground/30" strokeWidth="1.5" />
        <rect x="138" y="50" width="14" height="25" rx="1" className="fill-muted-foreground/20" />
        <text x="145" y="45" textAnchor="middle" className="fill-muted-foreground text-[8px] font-bold">№10</text>
        {/* Connection */}
        <line x1="90" y1="57" x2="120" y2="57" className="stroke-muted-foreground/30" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* Budget envelope */}
        <rect x="65" y="92" width="70" height="20" rx="3" className="fill-destructive/10 stroke-destructive/30" strokeWidth="1" />
        <text x="100" y="106" textAnchor="middle" className="fill-destructive text-[7px] font-bold">ENVELOPE</text>
      </svg>
    ),

    // Slide 16: NHS Providers & AoMRC
    16: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left: Hospital ward */}
        <rect x="15" y="25" width="75" height="55" rx="4" className="fill-[#6B4C9A]/10 stroke-[#6B4C9A]/30" strokeWidth="1" />
        <rect x="25" y="40" width="20" height="15" rx="2" className="fill-[#6B4C9A]/15" />
        <rect x="55" y="40" width="20" height="15" rx="2" className="fill-[#6B4C9A]/15" />
        <rect x="25" y="60" width="20" height="15" rx="2" className="fill-[#6B4C9A]/15" />
        <rect x="55" y="60" width="20" height="15" rx="2" className="fill-[#6B4C9A]/15" />
        <text x="52" y="92" textAnchor="middle" className="fill-[#6B4C9A]/70 text-[7px] font-bold">Providers</text>
        {/* Right: Academic cap */}
        <rect x="110" y="25" width="75" height="55" rx="4" className="fill-[#D4A017]/10 stroke-[#D4A017]/30" strokeWidth="1" />
        <polygon points="147,35 125,48 147,55 170,48" className="fill-[#D4A017]/20 stroke-[#D4A017]/40" strokeWidth="1" />
        <line x1="147" y1="55" x2="147" y2="68" className="stroke-[#D4A017]/40" strokeWidth="1.5" />
        <circle cx="147" cy="70" r="3" className="fill-[#D4A017]/30" />
        <text x="147" y="92" textAnchor="middle" className="fill-[#D4A017]/70 text-[7px] font-bold">AoMRC</text>
        {/* Connecting line */}
        <line x1="90" y1="52" x2="110" y2="52" className="stroke-muted-foreground/20" strokeWidth="1" strokeDasharray="3 2" />
      </svg>
    ),

    // Slide 17: Three barriers
    17: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Three walls/barriers */}
        <rect x="20" y="30" width="40" height="60" rx="3" className="fill-destructive/15 stroke-destructive/30" strokeWidth="1.5" />
        <text x="40" y="55" textAnchor="middle" className="fill-destructive text-[14px]">⚡</text>
        <text x="40" y="75" textAnchor="middle" className="fill-destructive/70 text-[6px]">ЗАБАСТ.</text>
        <rect x="80" y="30" width="40" height="60" rx="3" className="fill-primary/15 stroke-primary/30" strokeWidth="1.5" />
        <text x="100" y="55" textAnchor="middle" className="fill-primary text-[14px]">🗳</text>
        <text x="100" y="75" textAnchor="middle" className="fill-primary/70 text-[6px]">РЕФЕР.</text>
        <rect x="140" y="30" width="40" height="60" rx="3" className="fill-muted-foreground/15 stroke-muted-foreground/30" strokeWidth="1.5" />
        <text x="160" y="55" textAnchor="middle" className="fill-muted-foreground text-[14px]">💰</text>
        <text x="160" y="75" textAnchor="middle" className="fill-muted-foreground/70 text-[6px]">ФИСК.</text>
        {/* Path through */}
        <path d="M10 100 Q40 95, 60 100 Q80 105, 100 100 Q120 95, 140 100 Q160 105, 190 100" className="stroke-primary/30 fill-none" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="100" y="115" textAnchor="middle" className="fill-muted-foreground text-[7px]">Путь к сделке →</text>
      </svg>
    ),

    // Slide 18: Metrics dashboard
    18: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dashboard grid */}
        <rect x="15" y="15" width="80" height="40" rx="4" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
        <rect x="20" y="35" width="50" height="4" rx="2" className="fill-primary/30" />
        <rect x="20" y="42" width="35" height="4" rx="2" className="fill-primary/20" />
        <rect x="105" y="15" width="80" height="40" rx="4" className="fill-destructive/10 stroke-destructive/20" strokeWidth="1" />
        <rect x="110" y="35" width="50" height="4" rx="2" className="fill-destructive/30" />
        <rect x="110" y="42" width="35" height="4" rx="2" className="fill-destructive/20" />
        <rect x="15" y="65" width="80" height="40" rx="4" className="fill-muted-foreground/10 stroke-muted-foreground/20" strokeWidth="1" />
        <rect x="20" y="85" width="50" height="4" rx="2" className="fill-muted-foreground/30" />
        <rect x="20" y="92" width="35" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="105" y="65" width="80" height="40" rx="4" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
        <rect x="110" y="85" width="50" height="4" rx="2" className="fill-primary/30" />
        <rect x="110" y="92" width="35" height="4" rx="2" className="fill-primary/20" />
      </svg>
    ),

    // Slide 19: Victory conditions
    19: (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Trophy */}
        <path d="M80 30 L80 55 Q80 75, 100 80 Q120 75, 120 55 L120 30" className="fill-primary/15 stroke-primary/40" strokeWidth="1.5" />
        <rect x="90" y="80" width="20" height="10" rx="2" className="fill-primary/20" />
        <rect x="82" y="90" width="36" height="6" rx="2" className="fill-primary/25" />
        {/* Handles */}
        <path d="M80 35 Q65 35, 65 50 Q65 60, 80 58" className="stroke-primary/30 fill-none" strokeWidth="1.5" />
        <path d="M120 35 Q135 35, 135 50 Q135 60, 120 58" className="stroke-primary/30 fill-none" strokeWidth="1.5" />
        {/* Stars */}
        <text x="100" y="55" textAnchor="middle" className="fill-primary text-[12px]">★</text>
        {/* Threshold labels */}
        <text x="40" y="40" textAnchor="middle" className="fill-primary text-[8px] font-bold">≥70%</text>
        <text x="40" y="55" textAnchor="middle" className="fill-muted-foreground text-[7px]">победа</text>
        <text x="160" y="40" textAnchor="middle" className="fill-destructive text-[8px] font-bold">&lt;40%</text>
        <text x="160" y="55" textAnchor="middle" className="fill-muted-foreground text-[7px]">поражение</text>
        {/* Deadline */}
        <rect x="55" y="102" width="90" height="14" rx="3" className="fill-muted-foreground/10 stroke-muted-foreground/20" strokeWidth="1" />
        <text x="100" y="113" textAnchor="middle" className="fill-muted-foreground text-[7px]">Дедлайн: 5 июля 2026</text>
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-muted/30 p-3 shrink-0",
        "w-full md:w-48 md:h-32",
        className
      )}
      aria-hidden="true"
    >
      <div className="w-full h-full max-w-[200px] max-h-[120px]">
        {illustrations[slideIndex] ?? (
          <ActivityIcon className="size-12 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}
