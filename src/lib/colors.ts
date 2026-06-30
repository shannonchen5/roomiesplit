const PALETTE = [
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#a855f7',
]

export function assignColor(existingColors: string[]): string {
  const used = new Set(existingColors)
  const available = PALETTE.find((c) => !used.has(c))
  if (available) return available
  const index = existingColors.length % PALETTE.length
  return PALETTE[index]
}

export function getPersonColor(
  people: { id: string; color: string }[],
  personId: string
): string {
  return people.find((p) => p.id === personId)?.color ?? '#94a3b8'
}
