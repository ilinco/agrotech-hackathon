export function pointColor(index: number): string {
  return `hsl(${(index * 137.508) % 360}, 65%, 38%)`;
}
