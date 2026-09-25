import { CalendarPlus, Download, Info, RefreshCw, Smartphone, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { REGIONS } from '../content/exercises'
import { DISCLAIMER } from '../content/guide'
import { SAFETY_OPTIONS } from '../content/profileOptions'
import { LogoMark } from '../components/Logo'
import { BackLink, Button, Card, Note, Segmented, Title, Toggle } from '../components/ui'
import { canSpeak } from '../lib/audio'
import { formatShort } from '../lib/dates'
import { daysLabel, downloadFile, exportBackup, parseBackup, practiceCalendar } from '../lib/files'
import { canInstall, isStandalone, promptInstall } from '../lib/install'
import { skinLabel } from '../lib/skincare'
import { snapshot, useStore } from '../lib/store'

export function Profile() {
  const navigate = useNavigate()
  const state = useStore()
  const { profile, settings, device, updateSettings, updateProfile, importData, resetAll } = state
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [installable, setInstallable] = useState(canInstall())

  if (!profile) return null
  const focus = REGIONS.filter((r) => profile.focus.includes(r.id)).map((r) => r.short)
  const appUrl = window.location.href.split('#')[0]

  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to="/" label="Hoje" />
      </div>
      <header className="flex items-center gap-4 pt-2 pb-6">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-jade font-display text-3xl font-medium text-on-jade shadow-soft">{profile.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <Title>{profile.name}</Title>
          <p className="text-sm text-ink-soft">Neste aparelho desde {formatShort(new Date(device.registeredAt))}</p>
        </div>
      </header>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-medium text-ink">Seu plano</h2>
          <Button size="sm" variant="soft" onClick={() => navigate('/ajustar')}>
            <RefreshCw className="size-4" /> Refazer
          </Button>
        </div>
        <dl className="mt-3 grid gap-3 text-sm">
          <Item label="Pele" value={skinLabel(profile)} />
          <Item label="Regiões em destaque" value={focus.length ? focus.join(', ') : 'Todas'} />
          <Item label="Sessões" value={`${profile.minutes} minutos · ${daysLabel(profile.days)} às ${profile.time}`} />
        </dl>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Seu cuidado</h2>
        <p className="mt-1 text-sm text-ink-soft">Atualize quando algo mudar, por exemplo depois da liberação de um procedimento.</p>
        <div className="mt-1 divide-y divide-line">
          {SAFETY_OPTIONS.map((o) => (
            <Toggle
              key={o.id}
              id={`s-${o.id}`}
              checked={profile.safety.includes(o.id)}
              onChange={(v) => updateProfile({ safety: v ? [...profile.safety, o.id] : profile.safety.filter((f) => f !== o.id) })}
              label={o.label}
              hint={o.hint}
            />
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Durante a sessão</h2>
        <div className="mt-1 divide-y divide-line">
          <Toggle id="set-voice" checked={settings.voice} onChange={(v) => updateSettings({ voice: v })} label="Voz guiada" hint={canSpeak() ? 'Lê cada passo em voz alta' : 'Este navegador não oferece voz'} />
          <Toggle id="set-sound" checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} label="Sino suave" hint="Ao trocar de passo e de lado" />
          <Toggle id="set-vibrate" checked={settings.vibrate} onChange={(v) => updateSettings({ vibrate: v })} label="Vibração" hint="Em celulares compatíveis" />
          <Toggle id="set-mirror" checked={settings.mirror} onChange={(v) => updateSettings({ mirror: v })} label="Modo espelho" hint="Câmera frontal ao fundo. Nada é gravado." />
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Aparência</h2>
        <Segmented
          className="mt-3"
          value={settings.theme}
          onChange={(v) => updateSettings({ theme: v })}
          options={[
            { value: 'system', label: 'Automático' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
        />
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Lembretes e app</h2>
        <p className="mt-1 text-sm text-ink-soft">Adicione suas sessões ao calendário do celular, com aviso no horário escolhido.</p>
        <div className="mt-3 grid gap-2">
          <Button variant="soft" block onClick={() => downloadFile('facezen-lembretes.ics', practiceCalendar(profile, appUrl), 'text/calendar')}>
            <CalendarPlus className="size-4" /> Adicionar ao calendário
          </Button>
          {!isStandalone() &&
            (installable ? (
              <Button
                variant="soft"
                block
                onClick={async () => {
                  await promptInstall()
                  setInstallable(canInstall())
                }}
              >
                <Smartphone className="size-4" /> Instalar o FaceZen
              </Button>
            ) : (
              <Note icon={<Smartphone className="size-4" />}>
                Para usar como app: no iPhone, toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android, abra o menu do navegador e toque em “Instalar app”.
              </Note>
            ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Seus dados</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Tudo o que você marca fica salvo só neste aparelho, sem cadastro. Para levar para outro aparelho, exporte um backup e importe lá.
        </p>
        <p className="tnum mt-2 text-xs text-ink-faint">Aparelho {device.id.slice(0, 8)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="soft" onClick={() => exportBackup(snapshot(state))}>
            <Download className="size-4" /> Exportar
          </Button>
          <Button variant="soft" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Importar
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            try {
              importData(parseBackup(await file.text()))
              setMessage({ tone: 'ok', text: 'Backup importado. Seu histórico foi restaurado neste aparelho.' })
            } catch (err) {
              setMessage({ tone: 'danger', text: err instanceof Error ? err.message : 'Não foi possível ler o arquivo.' })
            }
          }}
        />
        {message && (
          <Note tone={message.tone} className="mt-3">
            {message.text}
          </Note>
        )}
        <div className="mt-4 border-t border-line pt-4">
          {confirmReset ? (
            <div>
              <p className="text-sm text-ink">Apagar perfil, sessões, diário e skincare deste aparelho? Não dá para desfazer.</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    resetAll()
                    navigate('/', { replace: true })
                  }}
                >
                  Apagar tudo
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
              <Trash2 className="size-4" /> Apagar meus dados
            </button>
          )}
        </div>
      </Card>

      <section className="mt-8 flex gap-3 text-sm text-ink-soft">
        <LogoMark className="size-10" />
        <div>
          <p className="font-semibold text-ink">FaceZen · versão {__APP_VERSION__}</p>
          <p className="mt-1 flex gap-1.5">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>{DISCLAIMER}</span>
          </p>
        </div>
      </section>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  )
}
