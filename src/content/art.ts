/**
 * Desenhos dos exercícios: o rosto em traço fino, com os dedos no lugar certo,
 * setas mostrando o movimento e a expressão da boca e dos olhos.
 * Gera SVG em texto, usado no app e no PDF do NotebookLM (sem dependências).
 */

type Pt = [number, number]

export interface Finger {
  /** Ponta do dedo. */
  at: Pt
  /** Para onde o dedo aponta, em graus (0 = para cima, 90 = para a direita). */
  angle: number
  len?: number
}

export interface Arrow {
  /** 2 pontos (reta) ou 3 (curva: início, controle, fim). */
  pts: Pt[]
  both?: boolean
}

export interface Pose {
  eyes?: 'open' | 'closed' | 'wide' | 'up' | 'side'
  mouth?: 'neutral' | 'o' | 'a' | 'smile' | 'kiss' | 'u' | 'puff' | 'fish' | 'lipsIn' | 'blow' | 'tongueArch' | 'tongueSide' | 'lowerLipUp' | 'ajar'
  /** Inclinação da cabeça, em graus (positivo = para a direita de quem olha). */
  tilt?: number
  fingers?: Finger[]
  palms?: { at: Pt; rx?: number; ry?: number; angle?: number }[]
  arrows?: Arrow[]
  /** Setas em caminho livre (não espelhadas). */
  paths?: { d: string; both?: boolean }[]
  /** Pontos de pressão. */
  presses?: Pt[]
  prop?: { kind: 'palito' | 'guasha' | 'rolo' | 'escova'; at: Pt; angle?: number }
  /** Repete dedos, palmas, setas e pontos do outro lado do rosto. */
  sym?: boolean
  /** Texto curto no canto (ex.: "O → A"). */
  caption?: string
  /** Recorte do desenho [x, y, largura, altura], para dar zoom numa região. */
  view?: [number, number, number, number]
}

const mx = ([x, y]: Pt): Pt => [200 - x, y]

function mirror(p: Pose): Pose {
  if (!p.sym) return p
  return {
    ...p,
    fingers: [...(p.fingers ?? []), ...(p.fingers ?? []).map((f) => ({ ...f, at: mx(f.at), angle: -f.angle }))],
    palms: [...(p.palms ?? []), ...(p.palms ?? []).map((q) => ({ ...q, at: mx(q.at), angle: -(q.angle ?? 0) }))],
    arrows: [...(p.arrows ?? []), ...(p.arrows ?? []).map((a) => ({ ...a, pts: a.pts.map(mx) }))],
    presses: [...(p.presses ?? []), ...(p.presses ?? []).map(mx)],
  }
}

const C = {
  ink: 'var(--ink, #15302b)',
  hand: 'var(--quartz-soft, #f5e1dd)',
  handLine: 'var(--rose-ink, #9a4a42)',
  move: 'var(--jade, #1f5a4e)',
  soft: 'var(--jade-soft, #d5e6df)',
}

function eyes(kind: Pose['eyes'] = 'closed'): string {
  const brows = `<path d="M62 86 C70 80 82 80 88 84"/><path d="M112 84 C118 80 130 80 138 86"/>`
  if (kind === 'closed') return brows + `<path d="M65 103 C71 109 81 109 87 103"/><path d="M113 103 C119 109 129 109 135 103"/>`
  const ry = kind === 'wide' ? 8 : 5.5
  const dx = kind === 'side' ? 4 : 0
  const dy = kind === 'up' ? -3 : 0
  const b = kind === 'wide' ? `<path d="M62 82 C70 75 82 75 88 79"/><path d="M112 79 C118 75 130 75 138 82"/>` : brows
  return (
    b +
    [76, 124]
      .map((x) => `<ellipse cx="${x}" cy="103" rx="11" ry="${ry}"/><circle cx="${x + dx}" cy="${103 + dy}" r="3.2" fill="${C.ink}" stroke="none"/>`)
      .join('')
  )
}

function mouth(kind: Pose['mouth'] = 'neutral'): string {
  switch (kind) {
    case 'o':
      return `<ellipse cx="100" cy="158" rx="7" ry="10"/><ellipse cx="100" cy="158" rx="3" ry="5.5" opacity="0.5"/>`
    case 'a':
      return `<path d="M86 152 C92 148 108 148 114 152 C114 166 106 172 100 172 C94 172 86 166 86 152 Z"/><path d="M90 164 C96 161 104 161 110 164" opacity="0.5"/>`
    case 'ajar':
      return `<path d="M88 156 C95 153 105 153 112 156 C108 162 92 162 88 156 Z"/>`
    case 'smile':
      return `<path d="M80 151 C92 155 108 155 120 151"/><path d="M80 151 C88 168 112 168 120 151"/><path d="M60 140 C64 134 70 132 76 134" opacity="0.6"/><path d="M140 140 C136 134 130 132 124 134" opacity="0.6"/>`
    case 'lipsIn':
      return `<path d="M82 156 C92 152 108 152 118 156" stroke-width="3"/><path d="M82 156 L78 150 M118 156 L122 150"/>`
    case 'kiss':
      return `<ellipse cx="100" cy="158" rx="6" ry="5"/><path d="M94 158 L100 158 M100 158 L106 158" opacity="0.5"/><path d="M88 152 C84 156 84 160 88 164 M112 152 C116 156 116 160 112 164" opacity="0.5"/>`
    case 'u':
      return `<ellipse cx="100" cy="159" rx="6" ry="7"/><path d="M89 151 C85 157 86 164 90 168 M111 151 C115 157 114 164 110 168" opacity="0.5"/>`
    case 'puff':
      return `<path d="M92 157 C96 155 104 155 108 157"/><path d="M47 128 C34 138 36 160 50 170" opacity="0.8"/><path d="M153 128 C166 138 164 160 150 170" opacity="0.8"/>`
    case 'fish':
      return `<ellipse cx="100" cy="158" rx="5" ry="6"/><path d="M68 132 C74 140 74 150 70 158" opacity="0.7"/><path d="M132 132 C126 140 126 150 130 158" opacity="0.7"/>`
    case 'blow':
      return `<circle cx="100" cy="158" r="4.5"/><path d="M100 168 L100 180 M92 166 L86 176 M108 166 L114 176" stroke="${C.move}" stroke-dasharray="2 3"/>`
    case 'tongueArch':
      return `<path d="M86 152 C92 148 108 148 114 152 C114 166 106 172 100 172 C94 172 86 166 86 152 Z"/><path d="M90 166 C94 156 106 156 110 166" fill="${C.hand}" stroke="${C.handLine}"/>`
    case 'tongueSide':
      return `<path d="M88 154 C95 151 105 151 112 154 C110 162 90 162 88 154 Z"/><path d="M108 156 C116 150 124 146 128 148 C130 152 122 158 110 160" fill="${C.hand}" stroke="${C.handLine}"/>`
    case 'lowerLipUp':
      return `<path d="M84 154 C92 150 108 150 116 154"/><path d="M84 154 C92 148 108 148 116 154 C110 160 90 160 84 154 Z" fill="${C.soft}"/>`
    default:
      return `<path d="M86 157 C92 153 97 154 100 155 C103 154 108 153 114 157"/><path d="M89 158 C95 164 105 164 111 158" opacity="0.6"/>`
  }
}

function finger(f: Finger): string {
  const len = f.len ?? 30
  return `<g transform="translate(${f.at[0]} ${f.at[1]}) rotate(${f.angle})"><rect x="-4.6" y="-1" width="9.2" height="${len}" rx="4.6" fill="${C.hand}" stroke="${C.handLine}" stroke-width="1.3"/><path d="M-2.4 2.5 C-1.5 5.5 1.5 5.5 2.4 2.5" stroke="${C.handLine}" stroke-width="1" fill="none" opacity="0.7"/></g>`
}

function arrowPath(a: Arrow): string {
  const [p0, p1, p2] = a.pts
  return p2 ? `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}` : `M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]}`
}

const ARROW_STYLE = `fill="none" stroke="${C.move}" stroke-width="2.4" stroke-linecap="round"`

function arrowEl(d: string, both?: boolean, id = 'fz-seta'): string {
  return `<path d="${d}" ${ARROW_STYLE} marker-end="url(#${id})"${both ? ` marker-start="url(#${id}-i)"` : ''}/>`
}

function prop(p: NonNullable<Pose['prop']>): string {
  const t = `translate(${p.at[0]} ${p.at[1]}) rotate(${p.angle ?? 0})`
  if (p.kind === 'escova') {
    // Escova curva: cabo claro por cima, cerdas macias por baixo, encostando na pele.
    const bristles = Array.from({ length: 11 }, (_, i) => {
      // Pontos ao longo da curva de baixo do cabo (Bézier quadrática).
      const t = 0.05 + (i / 10) * 0.9
      const x = -27 + 54 * t
      const y = (1 - t) ** 2 * 4 + 2 * (1 - t) * t * -20 + t ** 2 * 4
      return `<path d="M${x.toFixed(1)} ${(y + 1).toFixed(1)} L${x.toFixed(1)} ${(y + 10).toFixed(1)}"/>`
    }).join('')
    return `<g transform="${t} scale(1.3)"><path d="M-30 -2 Q0 -30 30 -2 L27 4 Q0 -20 -27 4 Z" fill="#efe6d6" stroke="${C.ink}" stroke-width="1.3"/><g stroke="#b9895a" stroke-width="2.2" stroke-linecap="round">${bristles}</g></g>`
  }
  if (p.kind === 'palito') return `<g transform="${t}"><rect x="-38" y="-2.5" width="76" height="5" rx="2.5" fill="#c8a27a" stroke="#8a6440"/></g>`
  if (p.kind === 'guasha') return `<g transform="${t}"><path d="M-8 -16 C4 -20 14 -6 12 8 C10 18 -4 20 -12 12 C-18 4 -18 -12 -8 -16 Z" fill="${C.hand}" stroke="${C.handLine}" stroke-width="1.3" opacity="0.95"/></g>`
  return `<g transform="${t}"><rect x="-7" y="-12" width="14" height="24" rx="5" fill="${C.hand}" stroke="${C.handLine}" stroke-width="1.3"/><path d="M0 12 L0 26" stroke="${C.handLine}" stroke-width="2"/><path d="M-5 26 L5 26" stroke="${C.handLine}" stroke-width="2"/></g>`
}

/** SVG de uma pose. `title` vira o texto alternativo. */
export function poseSvg(pose: Pose, title = 'Desenho do exercício'): string {
  const p = mirror(pose)
  const tilt = p.tilt ? ` transform="rotate(${p.tilt} 100 205)"` : ''
  const head = `<g fill="none" stroke="${C.ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
<path d="M100 28 C62 28 42 58 42 100 C42 122 45 140 52 156 C60 176 78 196 100 200 C122 196 140 176 148 156 C155 140 158 122 158 100 C158 58 138 28 100 28 Z"/>
<path d="M43 104 C35 104 33 126 45 130"/><path d="M157 104 C165 104 167 126 155 130"/>
<path d="M60 60 C74 44 96 40 112 44 C128 48 140 58 146 72" opacity="0.4"/>
<path d="M100 100 C99 114 95 126 96 132 C98 136 104 136 106 133"/>
${eyes(p.eyes)}${mouth(p.mouth)}</g>`
  const body = `<g fill="none" stroke="${C.ink}" stroke-width="1.7" stroke-linecap="round" opacity="0.85"><path d="M80 194 L78 240 C66 246 44 250 22 260"/><path d="M120 194 L122 240 C134 246 156 250 178 260"/><path d="M70 254 C82 250 92 252 99 256" opacity="0.5"/><path d="M130 254 C118 250 108 252 101 256" opacity="0.5"/></g>`
  const palms = (p.palms ?? [])
    .map((q) => `<ellipse cx="${q.at[0]}" cy="${q.at[1]}" rx="${q.rx ?? 16}" ry="${q.ry ?? 24}" transform="rotate(${q.angle ?? 0} ${q.at[0]} ${q.at[1]})" fill="${C.hand}" fill-opacity="0.85" stroke="${C.handLine}" stroke-width="1.3"/>`)
    .join('')
  const presses = (p.presses ?? []).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${C.move}"/><circle cx="${x}" cy="${y}" r="5.5" fill="none" stroke="${C.move}" stroke-width="1.2" opacity="0.6"/>`).join('')
  const arrows = [...(p.arrows ?? []).map((a) => arrowEl(arrowPath(a), a.both)), ...(p.paths ?? []).map((a) => arrowEl(a.d, a.both))].join('')
  // Legenda numa etiqueta clara no canto de cima, para não cobrir o desenho.
  const [vx, vy, vw] = p.view ?? [0, 0, 200, 270]
  const fs = 12
  const cw = p.caption ? Math.min(vw - 8, p.caption.length * fs * 0.56 + 14) : 0
  const caption = p.caption
    ? `<g><rect x="${vx + vw - 4 - cw}" y="${vy + 4}" width="${cw}" height="${fs + 9}" rx="${(fs + 9) / 2}" fill="var(--jade-soft, #d5e6df)"/><text x="${vx + vw - 4 - cw / 2}" y="${vy + 4 + fs + 1.5}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="${fs}" font-weight="700" fill="${C.move}">${p.caption}</text></g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(p.view ?? [0, 0, 200, 270]).join(' ')}" role="img" aria-label="${title}">
<defs>
<marker id="fz-seta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${C.move}"/></marker>
<marker id="fz-seta-i" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M10 0 L0 5 L10 10 Z" fill="${C.move}"/></marker>
</defs>
${body}<g${tilt}>${head}${palms}${(p.fingers ?? []).map(finger).join('')}${p.prop ? prop(p.prop) : ''}${presses}${arrows}</g>${caption}</svg>`
}

/** Pose de cada exercício da biblioteca (mesmos códigos de `library.ts`). */
export const POSES: Record<string, Pose> = {
  // ——— Aquecimento
  A3: { eyes: 'closed', arrows: [{ pts: [[36, 150], [100, 262], [164, 150]], both: true }], caption: 'só pela frente' },
  A5: { eyes: 'open', mouth: 'puff', arrows: [{ pts: [[58, 150], [100, 182], [142, 150]], both: true }, { pts: [[100, 142], [100, 172]], both: true }] },
  // ——— Testa
  D1: { eyes: 'closed', sym: true, fingers: [{ at: [70, 243], angle: 165, len: 26 }, { at: [79, 241], angle: 172, len: 26 }], presses: [[74, 248]], arrows: [{ pts: [[60, 228], [68, 240]] }], caption: 'bem de leve' },
  D2: { eyes: 'closed', sym: true, palms: [{ at: [83, 214], rx: 9, ry: 18 }], arrows: [{ pts: [[70, 204], [70, 232]] }], caption: 'só estica a pele' },
  D3: { eyes: 'closed', sym: true, fingers: [{ at: [47, 112], angle: 10, len: 26 }, { at: [33, 112], angle: -10, len: 26 }], arrows: [{ pts: [[38, 138], [42, 152], [54, 160]] }] },
  D4: { eyes: 'closed', sym: true, fingers: [{ at: [90, 194], angle: 160, len: 26 }, { at: [78, 190], angle: 150, len: 26 }], arrows: [{ pts: [[86, 186], [66, 176], [50, 152]] }], caption: 'até a orelha' },
  D5: { eyes: 'closed', sym: true, fingers: [{ at: [90, 146], angle: 100, len: 24 }, { at: [90, 180], angle: 80, len: 24 }], arrows: [{ pts: [[78, 166], [62, 172], [50, 156]] }] },
  D6: { eyes: 'closed', sym: true, fingers: [{ at: [86, 120], angle: 200, len: 26 }, { at: [84, 131], angle: 200, len: 26 }, { at: [82, 142], angle: 200, len: 26 }], arrows: [{ pts: [[74, 132], [60, 126], [46, 120]] }], caption: 'até a orelha' },
  D7: { eyes: 'closed', sym: true, fingers: [{ at: [84, 117], angle: 200, len: 24 }], arrows: [{ pts: [[80, 122], [66, 122], [54, 108]] }], caption: 'só no osso' },
  D8: { eyes: 'closed', sym: true, fingers: [{ at: [94, 60], angle: 175, len: 24 }, { at: [94, 72], angle: 185, len: 24 }], arrows: [{ pts: [[86, 66], [68, 64], [54, 82]] }], caption: 'até as têmporas' },
  D9: { eyes: 'closed', sym: true, fingers: [{ at: [52, 86], angle: 40, len: 26 }], paths: [{ d: 'M60 74 C70 84 62 100 50 98' }, { d: 'M140 74 C130 84 138 100 150 98' }], arrows: [{ pts: [[44, 104], [42, 140]] }] },
  D10: { eyes: 'closed', sym: true, palms: [{ at: [62, 168], rx: 9, ry: 18, angle: -15 }], arrows: [{ pts: [[48, 144], [60, 200], [72, 240]] }], presses: [[74, 248]], caption: 'até a clavícula' },
  T1: { eyes: 'closed', sym: true, fingers: [{ at: [72, 56], angle: 165 }, { at: [84, 52], angle: 172 }, { at: [96, 50], angle: 178 }], arrows: [{ pts: [[76, 70], [76, 82]] }] },
  // ——— Olhos
  O1: { eyes: 'open', sym: true, fingers: [{ at: [56, 104], angle: 90, len: 28 }], arrows: [{ pts: [[76, 118], [76, 110]] }], caption: 'só embaixo' },
  O4: { eyes: 'closed', sym: true, fingers: [{ at: [58, 100], angle: 60, len: 26 }], presses: [[84, 93], [70, 92], [74, 119]] },
  // ——— Bochechas
  B1: { eyes: 'open', mouth: 'smile', sym: true, arrows: [{ pts: [[64, 150], [60, 126]] }], caption: 'O → sorriso' },
  B3: { eyes: 'open', mouth: 'fish', sym: true, arrows: [{ pts: [[84, 172], [78, 162]] }] },
  // ——— Boca
  N1: { eyes: 'open', mouth: 'lipsIn', sym: true, palms: [{ at: [38, 116], rx: 12, ry: 24 }], arrows: [{ pts: [[62, 152], [58, 136]] }] },
  L1: { eyes: 'open', mouth: 'a', caption: 'O → A' },
  // ——— Mandíbula e pescoço
  M1: { eyes: 'up', mouth: 'lowerLipUp', arrows: [{ pts: [[132, 196], [132, 176]] }], caption: 'olhe o teto' },
  M3: { eyes: 'open', mouth: 'blow', sym: true, fingers: [{ at: [56, 170], angle: 40, len: 28 }, { at: [62, 178], angle: 40, len: 28 }], arrows: [{ pts: [[50, 184], [42, 166]] }] },
  M4: { eyes: 'open', mouth: 'ajar', sym: true, fingers: [{ at: [60, 160], angle: 70, len: 28 }], paths: [{ d: 'M72 146 C84 150 82 172 68 174' }, { d: 'M128 146 C116 150 118 172 132 174' }] },
  // ——— Relaxamento
  P1: { eyes: 'side', mouth: 'tongueSide', palms: [{ at: [90, 248], rx: 16, ry: 9, angle: 20 }, { at: [110, 248], rx: 16, ry: 9, angle: -20 }], paths: [{ d: 'M70 18 C100 6 130 8 150 22' }] },
  L4: { eyes: 'open', mouth: 'lipsIn', fingers: [{ at: [86, 146], angle: 90, len: 26 }, { at: [86, 172], angle: 90, len: 26 }], arrows: [{ pts: [[112, 146], [138, 146]], both: true }, { pts: [[112, 172], [138, 172]], both: true }], caption: 'vai e volta' },
  T5: { eyes: 'wide', sym: true, fingers: [{ at: [94, 112], angle: 0 }, { at: [72, 84], angle: 100, len: 34 }], caption: 'testa parada' },
  R3: { eyes: 'closed', mouth: 'neutral', caption: 'dentes soltos' },
  // ——— Escova facial (opcional)
  E1: { eyes: 'closed', prop: { kind: 'escova', at: [56, 218], angle: -80 }, sym: true, arrows: [{ pts: [[48, 136], [64, 170], [74, 200]] }, { pts: [[80, 206], [78, 246]] }], caption: 'de cima para baixo' },
  E2: { eyes: 'closed', prop: { kind: 'escova', at: [34, 150], angle: -100 }, sym: true, arrows: [{ pts: [[94, 194], [64, 184], [50, 146]] }, { pts: [[84, 160], [66, 146], [50, 128]] }, { pts: [[88, 126], [68, 108], [54, 92]] }], caption: 'para fora e para cima' },
  E4: { eyes: 'closed', prop: { kind: 'escova', at: [44, 104], angle: -110 }, sym: true, arrows: [{ pts: [[88, 116], [70, 120], [54, 100]] }], caption: 'só no osso' },
  E3: { eyes: 'closed', prop: { kind: 'escova', at: [74, 30], angle: 0 }, sym: true, arrows: [{ pts: [[92, 80], [92, 52]] }, { pts: [[76, 80], [76, 54]] }, { pts: [[62, 84], [56, 66]] }], caption: 'até o cabelo' },
}

/** O desenho de um exercício pelo código (ou nada). */
export function exerciseSvg(id: string, title?: string): string | undefined {
  const pose = POSES[id]
  return pose ? poseSvg(pose, title) : undefined
}

/**
 * Um desenho por passo do tutorial (mesma ordem de `steps` em `library.ts`).
 * Exercícios sem entrada aqui usam o desenho principal em todos os passos.
 */
const C1: Pose = { eyes: 'closed' }
export const STEP_POSES: Record<string, Pose[]> = {
  A3: [
    { ...C1, arrows: [{ pts: [[100, 206], [100, 226]] }], caption: 'queixo ao peito' },
    { ...C1, tilt: -16, arrows: [{ pts: [[100, 252], [58, 250], [40, 196]] }], caption: 'orelha ao ombro' },
    { ...C1, tilt: 16, arrows: [{ pts: [[40, 176], [100, 262], [160, 176]] }], caption: 'outro lado' },
  ],
  D1: [
    { ...C1, view: [10, 120, 180, 150], sym: true, fingers: [{ at: [70, 243], angle: 165, len: 26 }, { at: [79, 241], angle: 172, len: 26 }], presses: [[74, 248]], caption: 'acima da clavícula' },
    { ...C1, view: [10, 120, 180, 150], sym: true, fingers: [{ at: [70, 243], angle: 165, len: 26 }, { at: [79, 241], angle: 172, len: 26 }], arrows: [{ pts: [[62, 232], [72, 244]] }], caption: 'estica e solta' },
    { ...C1, view: [10, 120, 180, 150], sym: true, fingers: [{ at: [70, 243], angle: 165, len: 26 }, { at: [79, 241], angle: 172, len: 26 }], arrows: [{ pts: [[62, 232], [72, 244]] }], presses: [[74, 248]], caption: 'devagar' },
  ],
  D2: [
    { ...C1, view: [10, 120, 180, 150], sym: true, palms: [{ at: [83, 208], rx: 9, ry: 16 }], caption: 'abaixo das orelhas' },
    { ...C1, view: [10, 120, 180, 150], sym: true, palms: [{ at: [83, 208], rx: 9, ry: 16 }], arrows: [{ pts: [[70, 200], [70, 224]] }], caption: 'para baixo e solta' },
    { ...C1, view: [10, 120, 180, 150], sym: true, palms: [{ at: [83, 228], rx: 9, ry: 14 }], arrows: [{ pts: [[70, 220], [70, 244]] }], caption: 'um pouco mais abaixo' },
  ],
  D3: [
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [47, 112], angle: 10, len: 26 }, { at: [33, 112], angle: -10, len: 26 }], caption: 'frente e atrás' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [47, 112], angle: 10, len: 26 }, { at: [33, 112], angle: -10, len: 26 }], arrows: [{ pts: [[38, 138], [42, 152], [54, 160]] }], caption: 'círculos para baixo' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [47, 112], angle: 10, len: 26 }, { at: [33, 112], angle: -10, len: 26 }], arrows: [{ pts: [[38, 138], [42, 152], [54, 160]] }], caption: 'repita e solte' },
  ],
  D4: [
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [90, 196], angle: 160, len: 26 }], caption: 'perto do queixo' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [90, 196], angle: 160, len: 26 }], arrows: [{ pts: [[86, 186], [72, 182], [62, 170]] }], caption: 'em direção à orelha' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [68, 186], angle: 140, len: 26 }, { at: [54, 166], angle: 120, len: 26 }], arrows: [{ pts: [[60, 172], [52, 158], [46, 140]] }], caption: 'meio e perto da orelha' },
  ],
  D5: [
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [90, 146], angle: 100, len: 24 }, { at: [90, 180], angle: 80, len: 24 }], caption: 'lábio e queixo' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [90, 146], angle: 100, len: 24 }, { at: [90, 180], angle: 80, len: 24 }], arrows: [{ pts: [[78, 166], [62, 172], [50, 156]] }], caption: 'para fora e solta' },
    { ...C1, view: [10, 70, 180, 160], sym: true, fingers: [{ at: [90, 146], angle: 100, len: 24 }, { at: [90, 180], angle: 80, len: 24 }], arrows: [{ pts: [[78, 166], [62, 172], [50, 156]] }], caption: 'lábios relaxados' },
  ],
  D6: [
    { ...C1, sym: true, fingers: [{ at: [86, 120], angle: 200, len: 26 }, { at: [84, 131], angle: 200, len: 26 }, { at: [82, 142], angle: 200, len: 26 }], caption: 'ao lado do nariz' },
    { ...C1, sym: true, fingers: [{ at: [86, 120], angle: 200, len: 26 }, { at: [84, 131], angle: 200, len: 26 }, { at: [82, 142], angle: 200, len: 26 }], arrows: [{ pts: [[74, 132], [64, 128], [56, 124]] }], caption: 'em direção à orelha' },
    { ...C1, sym: true, fingers: [{ at: [64, 124], angle: 210, len: 24 }, { at: [62, 136], angle: 210, len: 24 }], arrows: [{ pts: [[54, 130], [48, 126], [44, 120]] }], caption: 'meio, depois orelha' },
  ],
  D7: [
    { ...C1, sym: true, fingers: [{ at: [86, 116], angle: 200, len: 24 }], caption: 'osso perto do nariz' },
    { ...C1, sym: true, fingers: [{ at: [86, 116], angle: 200, len: 24 }], arrows: [{ pts: [[82, 122], [74, 124], [66, 120]] }], caption: 'bem de leve, para fora' },
    { ...C1, sym: true, fingers: [{ at: [66, 118], angle: 220, len: 24 }], arrows: [{ pts: [[62, 122], [56, 116], [52, 104]] }], caption: 'até a têmpora' },
  ],
  D8: [
    { ...C1, sym: true, fingers: [{ at: [94, 60], angle: 175, len: 24 }, { at: [94, 72], angle: 185, len: 24 }], caption: 'meio da testa' },
    { ...C1, sym: true, fingers: [{ at: [94, 60], angle: 175, len: 24 }, { at: [94, 72], angle: 185, len: 24 }], arrows: [{ pts: [[86, 66], [76, 64], [68, 66]] }], caption: 'para os lados e solta' },
    { ...C1, sym: true, fingers: [{ at: [68, 64], angle: 165, len: 24 }, { at: [66, 76], angle: 195, len: 24 }], arrows: [{ pts: [[60, 70], [54, 76], [50, 88]] }], caption: 'até as têmporas' },
  ],
  D9: [
    { ...C1, sym: true, fingers: [{ at: [52, 86], angle: 40, len: 26 }], presses: [[50, 90]], caption: 'dedos nas têmporas' },
    { ...C1, sym: true, fingers: [{ at: [52, 86], angle: 40, len: 26 }], paths: [{ d: 'M60 74 C70 84 62 100 50 98' }, { d: 'M140 74 C130 84 138 100 150 98' }], caption: 'círculos para trás' },
    { ...C1, sym: true, arrows: [{ pts: [[46, 96], [42, 120], [46, 146]] }], caption: 'desce pela orelha' },
  ],
  D10: [
    { ...C1, view: [10, 120, 180, 150], sym: true, palms: [{ at: [60, 160], rx: 9, ry: 16, angle: -15 }], caption: 'abaixo das orelhas' },
    { ...C1, view: [10, 120, 180, 150], sym: true, palms: [{ at: [64, 176], rx: 9, ry: 16, angle: -15 }], arrows: [{ pts: [[48, 144], [60, 200], [72, 240]] }], caption: 'desce até a clavícula' },
    { ...C1, view: [10, 120, 180, 150], sym: true, fingers: [{ at: [70, 243], angle: 165, len: 26 }, { at: [79, 241], angle: 172, len: 26 }], presses: [[74, 248]], caption: 'bombeia de leve' },
  ],
}

/** Desenho de um passo (ou o desenho principal do exercício). */
export function stepSvg(id: string, step: number, title?: string): string | undefined {
  const pose = STEP_POSES[id]?.[step]
  return pose ? poseSvg(pose, title) : exerciseSvg(id, title)
}
