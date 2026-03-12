/**
 * Formata duração em segundos para string legível (ex: "1:30", "2:05:00").
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0 || !Number.isInteger(totalSeconds)) {
    return "0:00";
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}
