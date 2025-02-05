const neighborhoods = [
  'Downtown',
  'Midtown',
  'Uptown',
  'Suburbia',
  'Historic District',
  'Chinatown',
  'Little Italy',
  'Financial District',
  'Arts District',
]

export function getRandomNeighborhood() {
  return neighborhoods[Math.floor(Math.random() * neighborhoods.length)]
}
