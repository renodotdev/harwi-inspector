import {
  Award,
  BatteryCharging,
  CalendarDays,
  Camera,
  ChevronLeft,
  CircleHelp,
  ClipboardCheck,
  CornerDownRight,
  Droplet,
  Fingerprint,
  Info,
  MessageSquareText,
  Package,
  Power,
  ScanLine,
  Smartphone,
  SquarePen,
  UserCheck,
  UserRound,
  Volume2,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  award: Award,
  "battery-charging": BatteryCharging,
  calendar: CalendarDays,
  camera: Camera,
  "chevron-left": ChevronLeft,
  "clipboard-check": ClipboardCheck,
  "corner-down-right": CornerDownRight,
  droplet: Droplet,
  fingerprint: Fingerprint,
  info: Info,
  "message-square-text": MessageSquareText,
  package: Package,
  power: Power,
  "scan-line": ScanLine,
  smartphone: Smartphone,
  "square-pen": SquarePen,
  "user-check": UserCheck,
  "user-round": UserRound,
  "volume-2": Volume2,
  wifi: Wifi,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Glyph = ICONS[name as IconName] ?? CircleHelp;
  return <Glyph className={className} aria-hidden />;
}
