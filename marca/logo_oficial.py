# Logo oficial da Ponte (24/10/2026): ponte pênsil dentro de um círculo aberto, avião saindo com o rastro.
# Gera SVGs em duas versões: "completa" (marca, perfil, loja, abertura) e "icone" (traço grosso, para tamanhos pequenos).
#   python logo_oficial.py <pasta de saída>
import math, os, sys

NAVY_BG = '#1A3263'   # fundo do ícone e da tela de abertura do app
CREAM = '#F6F4F0'
SKY = '#A8BDD9'       # azul-claro do app (navyLight)
GOLD = '#E9A24C'


def plane(cx, cy, s, rot, fill):
    # Avião apontando para a direita, centrado em (0,0), depois girado e posicionado.
    body = ('M -55 -6.5 L 44 -6.5 Q 64 -6.5 66 0 Q 64 6.5 44 6.5 L -55 6.5 Q -61 0 -55 -6.5 Z '
            'M 2 -6 L -22 -54 L -8 -54 L 30 -6 Z M 2 6 L -22 54 L -8 54 L 30 6 Z '
            'M -40 -6 L -57 -27 L -48 -27 L -29 -6 Z M -40 6 L -57 27 L -48 27 L -29 6 Z')
    return f'<path d="{body}" fill="{fill}" transform="translate({cx} {cy}) rotate({rot}) scale({s})"/>'


def arc(cx, cy, r, a0, a1):
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    (x0, y0), (x1, y1) = p(a0), p(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f'M {x0:.1f} {y0:.1f} A {r} {r} 0 {large} 1 {x1:.1f} {y1:.1f}'


def logo(accent, bridge=CREAM, icon=False):
    """Desenho em 1024x1024, sem fundo."""
    w = (lambda full, ic: ic if icon else full)
    cx, cy, R = 512, 540, 338
    out = []
    # Círculo aberto: arco de cima (esquerda até perto do avião) e arco de baixo.
    out.append(f'<path d="{arc(cx, cy, R, 192, 296)}" stroke="{accent}" stroke-width="{w(12, 26)}" stroke-linecap="round" fill="none"/>')
    out.append(f'<path d="{arc(cx, cy, R, w(24, 36), w(156, 144))}" stroke="{accent}" stroke-width="{w(12, 26)}" stroke-linecap="round" fill="none"/>')
    # Rastro do avião: meia-lua fina que afina nas pontas.
    t = w(1.0, 2.0)
    out.append(f'<path d="M 236 590 Q 392 {226 - 6 * t:.0f} 792 372 Q {406 + 4 * t:.0f} {254 + 9 * t:.0f} 236 590 Z" fill="{accent}"/>')
    out.append(plane(842, 342, w(1.05, 1.25), -27, accent))
    # Ponte
    deck, tl, tr, top = 648, 382, 642, 448
    sw = w(13, 28)
    cable = lambda x: top + 440 * ((x - tl) / (tr - tl)) * (1 - (x - tl) / (tr - tl))
    out.append(f'<g stroke="{bridge}" stroke-linecap="round" fill="none">')
    out.append(f'<path d="M {tl} {top} Q 512 {top + 220} {tr} {top}" stroke-width="{sw}"/>')
    out.append(f'<path d="M {tl} {top} Q 318 600 {w(196, 214)} {deck - 8}" stroke-width="{sw}"/>')
    out.append(f'<path d="M {tr} {top} Q 706 600 {w(828, 810)} {deck - 8}" stroke-width="{sw}"/>')
    hangers = [434, 473, 512, 551, 590] if not icon else [460, 512, 564]
    for x in hangers:
        out.append(f'<line x1="{x}" y1="{cable(x):.1f}" x2="{x}" y2="{deck}" stroke-width="{w(8, 18)}"/>')
    out.append(f'<line x1="{w(186, 200)}" y1="{deck}" x2="{w(838, 824)}" y2="{deck}" stroke-width="{w(16, 32)}"/>')
    out.append(f'<line x1="{tl}" y1="{top - 14}" x2="{tl}" y2="{w(742, 734)}" stroke-width="{w(24, 40)}"/>')
    out.append(f'<line x1="{tr}" y1="{top - 14}" x2="{tr}" y2="{w(742, 734)}" stroke-width="{w(24, 40)}"/>')
    out.append('</g>')
    # Reflexo na água (só na versão completa; no ícone fica uma linha).
    if icon:
        out.append(f'<line x1="430" y1="796" x2="594" y2="796" stroke="{accent}" stroke-width="22" stroke-linecap="round"/>')
    else:
        for y, x0, x1, c, sw2 in [(770, 340, 684, bridge, 9), (798, 398, 626, bridge, 7), (824, 456, 568, accent, 7), (846, 488, 536, accent, 6)]:
            out.append(f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{c}" stroke-width="{sw2}" stroke-linecap="round"/>')
    return '\n  '.join(out)


def svg(inner, bg=None, scale=1.0, size=1024):
    k = (1 - scale) * 512
    bgr = f'<rect width="1024" height="1024" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">{bgr}\n'
            f'<g transform="translate({k:.1f} {k:.1f}) scale({scale})">\n  {inner}\n</g></svg>\n')


def jsx(icon):
    """Mesmo desenho em JSX (react-native-svg), com as cores vindas de props."""
    import re
    x = logo('{accent}', '{color}', icon)
    x = x.replace('"{accent}"', '{accent}').replace('"{color}"', '{color}')
    for a, b in [('stroke-width', 'strokeWidth'), ('stroke-linecap', 'strokeLinecap')]:
        x = x.replace(a, b)
    x = re.sub(r'<path ', '<Path ', x)
    x = re.sub(r'<line ', '<Line ', x)
    x = x.replace('<g ', '<G ').replace('</g>', '</G>')
    x = re.sub(r'(<(?:Path|Line)[^>]*?)\s*/?>', lambda m: m.group(1) + ' />', x)
    return x


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    files = {
        'ponte-logo.svg': svg(logo(SKY), NAVY_BG),
        'ponte-logo-transparente.svg': svg(logo(SKY)),
        'ponte-logo-dourado.svg': svg(logo(GOLD), NAVY_BG),
        'ponte-icone.svg': svg(logo(SKY, icon=True), NAVY_BG, 0.9),
        'ponte-icone-dourado.svg': svg(logo(GOLD, icon=True), NAVY_BG, 0.9),
        # Android: o primeiro plano precisa caber no círculo seguro (66% do quadro).
        'android-foreground.svg': svg(logo(SKY, icon=True), None, 0.74),
        'android-monochrome.svg': svg(logo('#FFFFFF', '#FFFFFF', icon=True), None, 0.74),
    }
    for name, s2 in files.items():
        open(os.path.join(out, name), 'w', encoding='utf-8').write(s2)
        print('ok', name)
    open(os.path.join(out, 'jsx-completo.txt'), 'w', encoding='utf-8').write(jsx(False))
    open(os.path.join(out, 'jsx-icone.txt'), 'w', encoding='utf-8').write(jsx(True))
