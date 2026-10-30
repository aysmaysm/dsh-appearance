// dsh-appearance client bundle (self-registering script, NOT ESM).
// Convention from official plugins: window.__ModuleLoader__.load({ id, factory })
// Wrapped in an IIFE + guard: if the loader is not ready yet we exit silently
// instead of throwing (an uncaught throw here can take the whole UI down).
;(() => {
  if (typeof window === 'undefined' || !window.__ModuleLoader__ || typeof window.__ModuleLoader__.load !== 'function') {
    return
  }
  window.__ModuleLoader__.load({
  id: 'dsh-appearance',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement

    const STORAGE_KEY = 'dsh-appearance:config'
    const MAX_IMG_DIM = 1920

    const DEFAULTS = {
      // basic colours (4)
      primary: '#4f8ef7',
      background: '#ffffff',
      text: '#1f2328',
      forceAllText: true,
      border: '#e5e7eb',
      // size & motion
      fontSize: 14,
      radius: 8,
      opacity: 100,
      animation: true,
      animationSpeed: 200,
      // advanced (4)
      hoverBg: '#f3f4f6',
      shadow: 20,
      fontWeight: 400,
      fontFamily: '',
      // wallpaper
      wallpaperMode: 'none', // none | url | local | color | gradient
      wallpaperUrl: '',
      wallpaperColor: '#1e1e2e',
      wallpaperGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }

    function loadConfig() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw))
      } catch (e) {
        /* ignore */
      }
      return Object.assign({}, DEFAULTS)
    }

    function saveConfig(cfg) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
      } catch (e) {
        /* ignore - storage full */
      }
    }

    function hexToRgba(hex, alpha) {
      if (!hex || hex.charAt(0) !== '#') return hex
      let s = hex.slice(1)
      if (s.length === 3) s = s.split('').map((c) => c + c).join('')
      const n = parseInt(s, 16)
      if (isNaN(n)) return hex
      const r = (n >> 16) & 255
      const g = (n >> 8) & 255
      const b = n & 255
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha / 100 + ')'
    }

    function buildCss(cfg) {
      const mode = cfg.wallpaperMode
      const hasImg = (mode === 'url' || mode === 'local') && !!cfg.wallpaperUrl
      const bg = hexToRgba(cfg.background, cfg.opacity)
      let baseDecl = ''
      let wallLayer = ''
      if (hasImg) {
        const u = String(cfg.wallpaperUrl).replace(/["\n\r]/g, '')
        baseDecl = 'html, body { background: transparent !important; }'
        wallLayer =
          'body::before { content:""; position: fixed; inset: 0; z-index: -1; pointer-events: none;' +
          ' background-image: url("' + u + '"); background-size: cover; background-position: center;' +
          ' opacity: ' + (cfg.opacity / 100) + '; }' +
          '#root, #root div, #root aside, #root main, #root section, #root nav, #root ul, #root li,' +
          ' #root header, #root footer, #root form, #root table, #root tbody, #root tr, #root td {' +
          ' background-color: transparent !important; background-image: none !important; }' +
          'input:not([type="range"]):not([type="color"]):not([type="checkbox"]), textarea, select, [contenteditable="true"] {' +
          ' background-color: rgba(255,255,255,0.30) !important; }' +
          '#root button, #root [role="button"] {' +
          ' background-color: rgba(255,255,255,0.14) !important; }' +
          '#root button:hover, #root [role="button"]:hover, #root li:hover, #root a:hover {' +
          ' background-color: ' + hexToRgba(cfg.hoverBg, 55) + ' !important; }'
      } else if (mode === 'color' && cfg.wallpaperColor) {
        baseDecl = 'html, body { background: ' + cfg.wallpaperColor + ' !important; }'
      } else if (mode === 'gradient') {
        baseDecl = 'html, body { background: ' + cfg.wallpaperGradient + ' !important; }'
      } else {
        baseDecl = 'html, body { background: ' + bg + ' !important; }'
      }
      // Transition only on interactive elements (a global `*` transition causes
      // heavy style recalculation and visible lag).
      const anim = ''
      return (
        ':root {' +
        '--app-primary: ' + cfg.primary + ';' +
        '--app-text: ' + cfg.text + ';' +
        '--app-border: ' + cfg.border + ';' +
        '--app-radius: ' + cfg.radius + 'px;' +
        '--app-font-size: ' + cfg.fontSize + 'px;' +
        '--app-font-weight: ' + cfg.fontWeight + ';' +
        '--app-font-family: ' + (cfg.fontFamily ? cfg.fontFamily.replace(/[;}]/g, '') : 'inherit') + ';' +
        '--app-shadow: 0 ' + Math.round(cfg.shadow / 4) + 'px ' + cfg.shadow + 'px rgba(0,0,0,0.12);' +
        '--app-hover-bg: ' + cfg.hoverBg + ';' +
        '--app-bg: ' + (hasImg || mode === 'color' || mode === 'gradient' ? 'transparent' : bg) + ';' +
        '}' +
        baseDecl +
        'html, body {' +
        'color: var(--app-text);' +
        'font-size: var(--app-font-size);' +
        'font-weight: var(--app-font-weight);' +
        'font-family: var(--app-font-family);' +
        '}' +
        wallLayer +
        (cfg.forceAllText === false
          ? '#root { color: var(--app-text) !important; }'
          : '#root, #root * { color: var(--app-text) !important; }') +
        '#root a, #root a * { color: var(--app-primary) !important; }' +
        'input[type="checkbox"], input[type="radio"], input[type="range"], progress, meter {' +
        ' accent-color: var(--app-text); }' +
        '[role="switch"][aria-checked="true"], [role="checkbox"][aria-checked="true"], [role="radio"][aria-checked="true"] {' +
        ' background-color: var(--app-text) !important; }' +
        'button, [role="button"], #root li, a {' +
        ' transition: ' + (cfg.animation
          ? 'background-color ' + cfg.animationSpeed + 'ms ease, color ' + cfg.animationSpeed + 'ms ease, border-color ' + cfg.animationSpeed + 'ms ease'
          : 'none') + '; }' +
        'button, [role="button"] { border-radius: var(--app-radius) !important; box-shadow: var(--app-shadow); }' +
        'input:not([type="file"]):not([type="color"]):not([type="range"]), textarea, select, [contenteditable="true"] { border-radius: var(--app-radius) !important; border-color: var(--app-border) !important; }' +
        'a { color: var(--app-primary) !important; }' +
        '::selection { background: ' + hexToRgba(cfg.primary, 35) + '; }' +
        anim
      )
    }

    function applyStyle(cfg) {
      let el = document.getElementById('dsh-appearance-style')
      if (!el) {
        el = document.createElement('style')
        el.id = 'dsh-appearance-style'
        document.head.appendChild(el)
      }
      el.textContent = buildCss(cfg)
    }

    // Downscale a picked image so it fits localStorage comfortably.
    // Always calls back: shrink success, onerror, or a hard timeout with the raw data URL.
    function takeImageFile(file, done) {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const raw = String(reader.result || '')
        let settled = false
        const finish = (url) => {
          if (settled) return
          settled = true
          done(url)
        }
        const timer = setTimeout(() => finish(raw), 2500)
        try {
          const img = new Image()
          img.onload = () => {
            clearTimeout(timer)
            try {
              let w = img.naturalWidth || img.width
              let ht = img.naturalHeight || img.height
              if (!w || !ht) return finish(raw)
              const k = Math.min(1, MAX_IMG_DIM / Math.max(w, ht))
              if (k >= 1) return finish(raw)
              w = Math.round(w * k)
              ht = Math.round(ht * k)
              const canvas = document.createElement('canvas')
              canvas.width = w
              canvas.height = ht
              const ctx2d = canvas.getContext('2d')
              if (!ctx2d) return finish(raw)
              ctx2d.drawImage(img, 0, 0, w, ht)
              finish(canvas.toDataURL('image/jpeg', 0.85))
            } catch (e) {
              finish(raw)
            }
          }
          img.onerror = () => finish(raw)
          img.src = raw
        } catch (e) {
          finish(raw)
        }
      }
      reader.onerror = () => done('')
      reader.readAsDataURL(file)
    }

    const rowStyle = { display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }
    const labelStyle = { width: '110px', fontSize: 13, opacity: 0.8, flex: '0 0 auto' }
    const inputStyle = {
      flex: 1,
      padding: '6px 8px',
      borderRadius: 6,
      border: '1px solid #d0d5dd',
      fontSize: 13,
      color: '#1f2328',
      background: '#fff'
    }

    function ColorRow(props) {
      const off = !!props.disabled
      return h(
        'div',
        { style: off ? Object.assign({}, rowStyle, { opacity: 0.42 }) : rowStyle },
        h('span', { style: labelStyle }, props.label),
        h('input', {
          type: 'color',
          value: props.value,
          disabled: off,
          onChange: (e) => props.onChange(e.target.value),
          style: { width: 44, height: 28, border: 'none', background: 'none', cursor: off ? 'not-allowed' : 'pointer', flex: '0 0 auto' }
        }),
        h('input', {
          type: 'text',
          value: props.value,
          disabled: off,
          onChange: (e) => props.onChange(e.target.value),
          style: Object.assign({}, inputStyle, { maxWidth: 130 })
        }),
        props.hint && h('span', { style: { fontSize: 11, opacity: 0.6 } }, props.hint)
      )
    }

    function SliderRow(props) {
      return h(
        'div',
        { style: rowStyle },
        h('span', { style: labelStyle }, props.label),
        h('input', {
          type: 'range',
          min: props.min,
          max: props.max,
          step: props.step,
          value: props.value,
          onChange: (e) => props.onChange(Number(e.target.value)),
          style: { flex: 1 }
        }),
        h('span', { style: { width: 56, fontSize: 12, textAlign: 'right', flex: '0 0 auto' } },
          String(props.value) + (props.suffix || ''))
      )
    }

    function TextRow(props) {
      return h(
        'div',
        { style: rowStyle },
        h('span', { style: labelStyle }, props.label),
        h('input', {
          type: 'text',
          value: props.value,
          placeholder: props.placeholder || '',
          onChange: (e) => props.onChange(e.target.value),
          style: inputStyle
        })
      )
    }

    function FileRow(props) {
      // Native file input is hidden; a styled <label> opens the picker.
      return h(
        'div',
        { style: rowStyle },
        h('span', { style: labelStyle }, props.label),
        h(
          'label',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px dashed #98a2b3',
              background: '#fff',
              color: '#1f2328',
              fontSize: 13,
              cursor: 'pointer',
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          },
          props.buttonText || '选择图片…',
          h('input', {
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: (e) => {
              const f = e.target.files && e.target.files[0]
              if (f) props.onPick(f)
              e.target.value = ''
            }
          })
        )
      )
    }

    function AppearancePanel() {
      const [cfg, setCfg] = React.useState(loadConfig)
      const [advanced, setAdvanced] = React.useState(false)
      const [pickNote, setPickNote] = React.useState('')

      React.useEffect(() => {
        applyStyle(cfg)
        saveConfig(cfg)
      }, [cfg])

      const set = (k) => (v) => setCfg((c) => Object.assign({}, c, { [k]: v }))
      const title = (t) => h('div', { style: { fontWeight: 600, fontSize: 13, margin: '14px 0 4px', opacity: 0.9 } }, t)
      const onPick = (file) => {
        if (!file) return
        setPickNote('已选择：' + file.name + '（处理中…）')
        takeImageFile(file, (dataUrl) => {
          if (!dataUrl) {
            setPickNote('读取失败：' + file.name)
            return
          }
          set('wallpaperMode')('local')
          set('wallpaperUrl')(dataUrl)
          setPickNote('已设置：' + file.name)
        })
      }

      return h(
        'div',
        { style: { padding: '4px 2px', maxWidth: 640 } },
        h('div', { style: { fontSize: 13, opacity: 0.7, marginBottom: 8 } },
          '调整后立即生效，保存在本机浏览器里。'),
        title('基础颜色'),
        h(ColorRow, { label: '主色', value: cfg.primary, onChange: set('primary') }),
        h(ColorRow, {
          label: '背景色',
          value: cfg.background,
          onChange: set('background'),
          disabled: cfg.wallpaperMode !== 'none',
          hint: cfg.wallpaperMode !== 'none' ? '壁纸生效中，背景色不参与' : ''
        }),
        h(ColorRow, { label: '文字色', value: cfg.text, onChange: set('text') }),
        h('div', { style: rowStyle },
          h('span', { style: labelStyle }, '强制所有文字'),
          h('input', {
            type: 'checkbox',
            checked: cfg.forceAllText !== false,
            onChange: (e) => set('forceAllText')(e.target.checked)
          }),
          h('span', { style: { fontSize: 12, opacity: 0.65 } },
            cfg.forceAllText !== false ? '开（含插件市场）' : '关（插件市场保留自身配色）')
        ),
        h(ColorRow, { label: '边框色', value: cfg.border, onChange: set('border') }),
        title('尺寸与动效'),
        h(SliderRow, { label: '字号', value: cfg.fontSize, min: 11, max: 20, step: 1, onChange: set('fontSize'), suffix: 'px' }),
        h(SliderRow, { label: '圆角', value: cfg.radius, min: 0, max: 24, step: 1, onChange: set('radius'), suffix: 'px' }),
        h(SliderRow, { label: '透明度', value: cfg.opacity, min: 0, max: 100, step: 5, onChange: set('opacity'), suffix: '%' }),
        h('div', { style: rowStyle },
          h('span', { style: labelStyle }, '动画'),
          h('input', {
            type: 'checkbox',
            checked: cfg.animation,
            onChange: (e) => set('animation')(e.target.checked)
          }),
          h('span', { style: { fontSize: 12, opacity: 0.7 } }, cfg.animation ? '开' : '关')
        ),
        h(SliderRow, { label: '动画速度', value: cfg.animationSpeed, min: 0, max: 800, step: 50, onChange: set('animationSpeed'), suffix: 'ms' }),
        title('壁纸'),
        h('div', { style: rowStyle },
          h('span', { style: labelStyle }, '模式'),
          h('select', {
            value: cfg.wallpaperMode,
            onChange: (e) => set('wallpaperMode')(e.target.value),
            style: Object.assign({}, inputStyle, { maxWidth: 220 })
          },
            h('option', { value: 'none' }, '无（纯色背景）'),
            h('option', { value: 'url' }, '网络图片'),
            h('option', { value: 'local' }, '本地图片'),
            h('option', { value: 'color' }, '纯色'),
            h('option', { value: 'gradient' }, '渐变')
          )
        ),
        cfg.wallpaperMode === 'url' &&
          h(TextRow, {
            label: '图片 URL',
            value: cfg.wallpaperUrl,
            placeholder: 'https://example.com/bg.jpg',
            onChange: set('wallpaperUrl')
          }),
        cfg.wallpaperMode === 'local' &&
          h('div', null,
            h(FileRow, {
              label: '选择图片',
              onPick,
              buttonText: cfg.wallpaperUrl ? '更换图片…' : '选择图片…'
            }),
            h('div', { style: { fontSize: 12, opacity: 0.65, marginLeft: 122 } },
              pickNote || (cfg.wallpaperUrl ? '已选好一张图片（重新选择可替换）' : '未选择文件')
            )
          ),
        cfg.wallpaperMode === 'color' &&
          h(ColorRow, { label: '壁纸颜色', value: cfg.wallpaperColor, onChange: set('wallpaperColor') }),
        cfg.wallpaperMode === 'gradient' &&
          h(TextRow, { label: '渐变 CSS', value: cfg.wallpaperGradient, placeholder: 'linear-gradient(...)', onChange: set('wallpaperGradient') }),
        h('div', { style: { marginTop: 16 } },
          h('span', {
            style: { cursor: 'pointer', fontSize: 13, opacity: 0.75 },
            onClick: () => setAdvanced((v) => !v)
          }, (advanced ? '▾ ' : '▸ ') + '高级')
        ),
        advanced &&
          h('div', null,
            h(ColorRow, { label: '悬停背景', value: cfg.hoverBg, onChange: set('hoverBg') }),
            h(SliderRow, { label: '阴影强度', value: cfg.shadow, min: 0, max: 60, step: 1, onChange: set('shadow') }),
            h(SliderRow, { label: '字重', value: cfg.fontWeight, min: 300, max: 700, step: 100, onChange: set('fontWeight') }),
            h(TextRow, { label: '字体', value: cfg.fontFamily, placeholder: '"Microsoft YaHei", sans-serif', onChange: set('fontFamily') })
          ),
        h('div', { style: { marginTop: 18 } },
          h('button', {
            onClick: () => setCfg(Object.assign({}, DEFAULTS)),
            style: {
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #d0d5dd',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13
            }
          }, '恢复默认')
        )
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        try {
          applyStyle(loadConfig())
        } catch (e) {
          /* ignore */
        }
        const slots = ctx.get('slots')
        if (!slots) return
        slots.inject('settings.section', () =>
          slots.register(
            { name: 'settings.section', id: 'dsh-appearance', order: 35, label: '外观' },
            () => h(AppearancePanel)
          )
        )
      }
    }
  }
  })
})()
