/**
 * Calcula streak (dias consecutivos com pelo menos uma sessão concluída).
 * Considera o dia no timezone do usuário.
 *
 * @param completedAtDates - Array de datas de conclusão (Date ou ISO string)
 * @param timezone - IANA timezone (ex: "America/Sao_Paulo")
 * @returns Número de dias consecutivos até hoje (ontem, anteontem, ...)
 */
export function calculateStreak(
  completedAtDates: (Date | string)[],
  timezone: string = "America/Sao_Paulo",
): number {
  if (completedAtDates.length === 0) return 0;

  const toDateKey = (d: Date | string): string => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-CA", { timeZone: timezone });
  };

  const uniqueDays = new Set(
    completedAtDates.map((d) => toDateKey(d)).filter(Boolean),
  );

  const todayKey = toDateKey(new Date());
  if (!uniqueDays.has(todayKey)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);
    if (!uniqueDays.has(yesterdayKey)) return 0;
  }

  let count = 0;
  const check = new Date();
  for (;;) {
    const key = toDateKey(check);
    if (!uniqueDays.has(key)) break;
    count++;
    check.setDate(check.getDate() - 1);
  }
  return count;
}
