import { useState } from 'react'
import { useStore, type SessionLog } from '../lib/store'
import { Button, Field, Note, Sheet, YesNo } from './ui'

/** Registro de "uma hora depois", do diário de acompanhamento. */
export function HourLaterSheet({ session, open, onClose }: { session: SessionLog; open: boolean; onClose: () => void }) {
  const updateSession = useStore((s) => s.updateSession)
  const [peleOk, setPeleOk] = useState<boolean | null>(null)
  const [vermelhidao, setVermelhidao] = useState<boolean | null>(null)
  const [olhos, setOlhos] = useState<boolean | null>(null)
  const [mandibulaOk, setMandibulaOk] = useState<boolean | null>(null)
  const [proxima, setProxima] = useState('')

  const alert = peleOk === false || vermelhidao === true || olhos === true || mandibulaOk === false

  return (
    <Sheet open={open} onClose={onClose} title="Uma hora depois">
      <p className="text-ink-soft">Como estão a pele e os músculos depois da sessão de hoje?</p>
      <div className="mt-3 divide-y divide-line">
        <YesNo label="Pele confortável?" value={peleOk} onChange={setPeleOk} />
        <YesNo label="Vermelhidão persistente?" value={vermelhidao} onChange={setVermelhidao} />
        <YesNo label="Inchaço ou sensação diferente nos olhos?" value={olhos} onChange={setOlhos} />
        <YesNo label="Mandíbula e pescoço confortáveis?" value={mandibulaOk} onChange={setMandibulaOk} />
      </div>
      {alert && (
        <Note tone="warn" className="mt-3">
          Na próxima sessão, reduza a dose ou volte à semana anterior. Se a reação persistir ou envolver os olhos, procure avaliação profissional.
        </Note>
      )}
      <div className="mt-4">
        <Field id="h-proxima" label="O que farei diferente na próxima sessão?" value={proxima} onChange={setProxima} multiline />
      </div>
      <Button
        block
        size="lg"
        className="mt-5"
        onClick={() => {
          updateSession(session.id, {
            hourLater: { peleOk, vermelhidao, olhos, mandibulaOk, proxima: proxima.trim(), at: new Date().toISOString() },
            flagged: session.flagged || alert,
          })
          onClose()
        }}
      >
        Salvar
      </Button>
    </Sheet>
  )
}
