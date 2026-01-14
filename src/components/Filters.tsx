interface FiltersProps {
  maakunta: string
  setMaakunta: (value: string) => void
  luokka: string
  setLuokka: (value: string) => void
  maakunnat: string[]
}

export function Filters({ maakunta, setMaakunta, luokka, setLuokka, maakunnat }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <select
        value={maakunta}
        onChange={(e) => setMaakunta(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <option value="">Kaikki maakunnat</option>
        {maakunnat.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        value={luokka}
        onChange={(e) => setLuokka(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <option value="">Kaikki luokat</option>
        <option value="A">A - Huippuluokka</option>
        <option value="B">B - Hyvä</option>
        <option value="C">C - Keskitaso</option>
        <option value="D">D - Kehitettävää</option>
        <option value="E">E - Heikko</option>
      </select>
    </div>
  )
}
