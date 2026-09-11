export interface Cover {
  id: string
  name: string
  css: string
}

export const COVERS: Cover[] = [
  {
    id: "aube",
    name: "Aube",
    css: "radial-gradient(at 20% 30%, #ffd6a5 0, transparent 55%), radial-gradient(at 80% 20%, #ffadad 0, transparent 50%), radial-gradient(at 60% 90%, #bdb2ff 0, transparent 55%), #fdf6ec",
  },
  {
    id: "lagon",
    name: "Lagon",
    css: "radial-gradient(at 10% 80%, #72efdd 0, transparent 50%), radial-gradient(at 90% 10%, #4ea8de 0, transparent 55%), radial-gradient(at 50% 50%, #5390d9 0, transparent 60%), #48bfe3",
  },
  {
    id: "nuit",
    name: "Nuit",
    css: "radial-gradient(at 15% 20%, #3a0ca3 0, transparent 50%), radial-gradient(at 85% 75%, #7209b7 0, transparent 55%), radial-gradient(at 60% 10%, #4361ee 0, transparent 45%), #10002b",
  },
  {
    id: "sauge",
    name: "Sauge",
    css: "radial-gradient(at 25% 25%, #d8f3dc 0, transparent 55%), radial-gradient(at 75% 80%, #95d5b2 0, transparent 55%), radial-gradient(at 90% 10%, #b7e4c7 0, transparent 45%), #e9f5ec",
  },
  {
    id: "braise",
    name: "Braise",
    css: "radial-gradient(at 20% 80%, #f48c06 0, transparent 50%), radial-gradient(at 80% 30%, #dc2f02 0, transparent 55%), radial-gradient(at 50% 0%, #ffba08 0, transparent 50%), #9d0208",
  },
  {
    id: "brume",
    name: "Brume",
    css: "radial-gradient(at 30% 30%, #e2e2e2 0, transparent 55%), radial-gradient(at 80% 70%, #c9c9d1 0, transparent 55%), radial-gradient(at 10% 90%, #f1f1f4 0, transparent 50%), #d6d6dc",
  },
  {
    id: "lavande",
    name: "Lavande",
    css: "radial-gradient(at 80% 20%, #e0aaff 0, transparent 50%), radial-gradient(at 20% 70%, #c8b6ff 0, transparent 55%), radial-gradient(at 60% 95%, #ffc8dd 0, transparent 50%), #efe6ff",
  },
  {
    id: "encre",
    name: "Encre",
    css: "radial-gradient(at 70% 30%, #2b2d42 0, transparent 55%), radial-gradient(at 20% 80%, #3d405b 0, transparent 50%), radial-gradient(at 90% 90%, #5c677d 0, transparent 45%), #0d1b2a",
  },
]

export function coverCss(id: string | null | undefined) {
  if (!id) return null
  return COVERS.find((c) => c.id === id)?.css ?? null
}

export function randomCover() {
  return COVERS[Math.floor(Math.random() * COVERS.length)].id
}
