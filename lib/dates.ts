const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

const fullFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

const shortFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
})

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
})

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function isoDay(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatDay(date: Date) {
  return capitalize(dayFormatter.format(date))
}

export function formatFullDay(date: Date) {
  return capitalize(fullFormatter.format(date))
}

export function formatRelative(timestamp: number) {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "à l'instant"
  if (diff < hour) return `il y a ${Math.floor(diff / minute)} min`
  if (diff < day && new Date(timestamp).getDate() === new Date().getDate()) {
    return `aujourd'hui à ${timeFormatter.format(timestamp)}`
  }
  if (diff < 2 * day) return `hier à ${timeFormatter.format(timestamp)}`
  if (diff < 7 * day) return `il y a ${Math.floor(diff / day)} jours`
  return `le ${shortFormatter.format(timestamp)}`
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return "Bonne nuit"
  if (h < 12) return "Bonjour"
  if (h < 18) return "Bon après-midi"
  return "Bonsoir"
}
