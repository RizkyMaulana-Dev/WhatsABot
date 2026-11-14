const state = { ...data };
const t = () => translations[state.lang];

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') e.className = v;
    else if (k === 'style') Object.assign(e.style, v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c instanceof Node) e.appendChild(c);
    else if (Array.isArray(c)) c.forEach(x => e.appendChild(x instanceof Node ? x : document.createTextNode(String(x))));
  });
  return e;
}

function renderApp() {
  renderNav();
  renderPage();
}

function renderNav() {
  const items = [
    { id: 'home', icon: homeIcon },
    { id: 'connection', icon: connectionIcon },
    { id: 'plugins', icon: pluginsIcon },
    { id: 'commands', icon: commandsIcon },
    { id: 'settings', icon: settingsIcon }
  ];
  const active = state.currentPage || 'home';

  qs('#navRailInner').innerHTML = '';
  qs('#bottomNavInner').innerHTML = '';

  items.forEach(item => {
    const rail = el('button', { class: `rail-item${active === item.id ? ' active' : ''}`, onclick: () => navigate(item.id) }, [
      item.icon,
      el('span', {}, t()[item.id])
    ]);
    qs('#navRailInner').appendChild(rail);

    const bnav = el('button', { class: `bnav-item${active === item.id ? ' active' : ''}`, onclick: () => navigate(item.id) }, [
      item.icon,
      el('span', {}, t()[item.id])
    ]);
    qs('#bottomNavInner').appendChild(bnav);
  });
}

function navigate(page) {
  state.currentPage = page;
  renderApp();
  window.scrollTo(0, 0);
}

const homeIcon = svg('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10');
const connectionIcon = svg('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z', 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2');
const pluginsIcon = svg('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M8 10h8', 'M12 6v8');
const commandsIcon = svg('M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z');
const settingsIcon = svg('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 6v4', 'M12 14v4');

function svg(...paths) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '2');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  paths.forEach(p => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p);
    s.appendChild(path);
  });
  return s;
}

function renderPage() {
  const page = qs('#page');
  page.innerHTML = '';
  const tr = t();

  switch (state.currentPage) {
    case 'home': page.appendChild(renderHome(tr)); break;
    case 'connection': page.appendChild(renderConnection(tr)); break;
    case 'plugins': page.appendChild(renderPlugins(tr)); break;
    case 'commands': page.appendChild(renderCommands(tr)); break;
    case 'settings': page.appendChild(renderSettings(tr)); break;
  }
}

// --- Home ---
function renderHome(tr) {
  const frag = document.createDocumentFragment();

  frag.appendChild(el('div', { class: 'page-head' }, [
    el('h1', { class: 'page-title' }, tr.botStatus),
    el('p', { class: 'page-sub' }, tr.runtimeHealth)
  ]));

  const statusCard = el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.botStatus),
    el('div', { class: 'row' }, [
      el('div', {}, [
        el('div', { style: 'display:flex;align-items:center;gap:12px' }, [
          el('span', { class: `dot${state.botStatus === 'active' ? '' : state.botStatus === 'paused' ? '' : ''}`, style: `background:${state.botStatus === 'active' ? 'var(--primary)' : state.botStatus === 'paused' ? 'var(--warn)' : 'var(--danger)'}` }),
          el('strong', { style: 'font-size:18px' }, tr[state.botStatus])
        ]),
        el('div', { class: 'meta', style: 'margin-top:4px' }, state.plan === 'free' ? `${tr.free} · ${tr.localRuntime}` : `${tr.starter} · ${tr.cloudRuntime}`)
      ]),
      el('div', { style: 'display:flex;flex-direction:column;gap:8px;align-items:flex-end' }, [
        state.botStatus === 'active' ? el('button', { class: 'btn btn-primary', onclick: () => setBotStatus('stopped') }, tr.stopBot) :
        el('button', { class: 'btn btn-primary', onclick: () => setBotStatus('active') }, tr.startBot),
        el('button', { class: 'btn btn-secondary', onclick: () => setBotStatus(state.botStatus === 'paused' ? 'active' : 'paused') }, state.botStatus === 'paused' ? tr.startBot : tr.pauseTemporarily)
      ])
    ])
  ]);
  frag.appendChild(statusCard);

  const healthCard = el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.runtimeHealth),
    el('div', { class: 'grid' }, [
      el('div', {}, [
        el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
          svg('M1 21h20', 'M12 9v12', 'M4 13h16', 'M8 17h8'),
          el('span', { class: 'card-label', style: 'margin:0' }, tr.battery)
        ]),
        el('div', { class: 'mono', style: 'font-size:28px;font-weight:700;margin-top:8px' }, `${state.batteryPercent}%`),
        el('div', { class: 'meta', style: 'margin-top:4px' }, `${state.batteryEstimateHours}h ${tr.remaining}`)
      ]),
      el('div', {}, [
        el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
          svg('M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'),
          el('span', { class: 'card-label', style: 'margin:0' }, tr.thermal)
        ]),
        el('div', { class: 'mono', style: 'font-size:28px;font-weight:700;margin-top:8px' }, `${state.temperatureC}°C`),
        el('div', { class: 'meta', style: 'margin-top:4px' }, state.temperatureC >= 40 ? tr.hot : state.temperatureC >= 35 ? tr.warm : tr.normal)
      ])
    ])
  ]);
  frag.appendChild(healthCard);

  const activityCard = el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.recentActivity),
    ...state.recentMessages.map(msg => el('div', { class: 'row', style: 'padding:8px 0;border-top:1px solid var(--border)' }, [
      el('div', { style: 'flex:1' }, [
        el('div', { class: 'meta' }, `${msg.sender} · ${msg.timestamp}`),
        el('div', { style: 'margin-top:3px;color:var(--text-dim)' }, msg.preview)
      ])
    ])).slice(1)
  ]);
  frag.appendChild(activityCard);

  return frag;
}

function setBotStatus(status) {
  state.botStatus = status;
  state.foregroundServiceRunning = status === 'active';
  renderApp();
}

// --- Connection ---
function renderConnection(tr) {
  const frag = document.createDocumentFragment();

  frag.appendChild(el('div', { class: 'page-head' }, [
    el('h1', { class: 'page-title' }, tr.connectionStatus),
    el('p', { class: 'page-sub' }, tr.pairingCode)
  ]));

  const banner = el('div', { class: 'card', style: 'display:flex;align-items:center;justify-content:space-between;gap:12px' }, [
    el('div', {}, [
      el('div', { class: 'mono', style: 'font-size:20px;font-weight:700' }, state.connectionStatus === 'connected' ? state.phoneNumber : tr.disconnected),
      el('div', { class: 'meta' }, state.connectionStatus === 'connected' ? tr.connected : tr.disconnected)
    ]),
    state.connectionStatus === 'connected' ? el('button', { class: 'btn btn-danger', onclick: () => openModal(renderDisconnectModal(tr)) }, tr.disconnectSession) :
    el('button', { class: 'btn btn-primary', onclick: requestPairingCode }, tr.requestNewCode)
  ]);
  frag.appendChild(banner);

  const codeCard = el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.pairingCode),
    el('div', { style: 'display:flex;align-items:center;gap:12px;flex-wrap:wrap' }, [
      el('div', { class: 'mono', style: 'font-size:32px;font-weight:700;letter-spacing:4px;background:var(--surface-elevated);border:1px solid var(--border);border-radius:12px;padding:16px 24px;flex:1;min-width:200px;text-align:center' },
        state.pairingCode || '────'
      ),
      state.pairingCode ? el('button', { class: 'btn btn-primary', onclick: () => copyCode() }, tr.copy) : null
    ]),
    el('div', { class: 'meta', style: 'margin-top:12px' }, state.connectionStatus === 'loading' ? 'Menghasilkan kode...' : state.pairingCode ? 'Kode aktif selama 20 detik' : 'Tekan tombol di atas untuk memulai pairing')
  ]);
  frag.appendChild(codeCard);

  const guideCard = el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.pairingGuide),
    el('div', { style: 'display:flex;flex-direction:column;gap:14px' }, [
      ['WhatsApp → Settings', 'Linked Devices → Link with phone number', 'Enter the 8-character code above'].map((step, i) =>
        el('div', { style: 'display:flex;align-items:flex-start;gap:12px' }, [
          el('div', { class: 'dot', style: `width:24px;height:24px;border-radius:50%;background:${state.pairingCode ? (i < 3 ? 'var(--primary)' : 'var(--border)') : 'var(--border)'};display:flex;align-items:center;justify-content:center;flex:none` },
            el('span', { style: 'font-weight:700;color:var(--background);font-size:12px' }, i + 1)
          ),
          el('span', { style: 'margin-top:3px' }, step)
        ])
      )
    ])
  ]);
  frag.appendChild(guideCard);

  return frag;
}

function requestPairingCode() {
  state.connectionStatus = 'loading';
  state.pairingCode = null;
  renderApp();
  setTimeout(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code = code.slice(0, 4) + '-' + code.slice(4);
    state.pairingCode = code;
    state.connectionStatus = 'connected';
    renderApp();
    toast(t().copied);
  }, 800);
}

function copyCode() {
  navigator.clipboard.writeText(state.pairingCode);
  toast(t().copied);
}

function renderDisconnectModal(tr) {
  return el('div', { class: 'modal' }, [
    el('div', { class: 'modal-content' }, [
      el('h3', {}, tr.disconnectSession),
      el('p', { style: 'color:var(--text-dim);margin:12px 0' }, 'Putuskan sesi WhatsApp saat ini? Anda perlu memindai ulang kode pairing untuk menghubungkan kembali.'),
      el('div', { style: 'display:flex;gap:10px;justify-content:flex-end;margin-top:16px' }, [
        el('button', { class: 'btn btn-secondary', onclick: closeModal }, tr.cancel || 'Batal'),
        el('button', { class: 'btn btn-danger', onclick: () => { state.connectionStatus = 'disconnected'; state.pairingCode = null; closeModal(); renderApp(); } }, tr.disconnectSession)
      ])
    ])
  ]);
}
// --- Plugins ---
let pluginTab = 'explore';
let pluginCategory = 'All';

function renderPlugins(tr) {
  const frag = document.createDocumentFragment();
  frag.appendChild(el('div', { class: 'page-head' }, [
    el('h1', { class: 'page-title' }, tr.plugins),
    el('p', { class: 'page-sub' }, state.plugins.filter(p => p.installed).length + ' ' + tr.installed.toLowerCase())
  ]));

  const tabs = el('div', { class: 'seg' }, [
    ['explore', tr.explore], ['installed', tr.installed]
  ].map(([id, label]) => el('button', { class: `seg-btn${pluginTab === id ? ' active' : ''}`, onclick: () => { pluginTab = id; renderApp(); } }, label)));
  frag.appendChild(tabs);

  if (pluginTab === 'explore') {
    const cats = ['All', 'Sticker', 'AI', 'Commerce', 'Utility'];
    frag.appendChild(el('div', { class: 'cat-bar' }, cats.map(c =>
      el('button', { class: `cat-btn${pluginCategory === c ? ' active' : ''}`, onclick: () => { pluginCategory = c; renderApp(); } }, c)
    )));
    const list = state.plugins.filter(p => pluginCategory === 'All' || p.category === pluginCategory);
    frag.appendChild(el('div', { class: 'grid' }, list.map(p => pluginCard(p, tr))));
  } else {
    const list = state.plugins.filter(p => p.installed);
    if (!list.length) frag.appendChild(el('div', { class: 'card empty' }, tr.noPlugins || 'No plugins installed'));
    frag.appendChild(el('div', { class: 'stack' }, list.map(p => installedRow(p, tr))));
  }
  return frag;
}

function pluginCard(p, tr) {
  return el('div', { class: 'card plugin-card', onclick: () => openModal(pluginDetail(p, tr)) }, [
    el('div', { class: 'row' }, [
      el('div', { style: 'display:flex;align-items:center;gap:10px' }, [
        pluginIcon(p.id),
        el('strong', {}, p.name)
      ]),
      p.isOfficial ? el('span', { class: 'tag tag-neutral' }, tr.official) : null
    ].filter(Boolean)),
    el('div', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:8px' }, p.description),
    el('div', { class: 'meta', style: 'margin-top:10px' }, [
      el('span', { class: 'mono' }, 'v' + p.version),
      el('span', { class: 'sep' }, '·'),
      p.category
    ])
  ]);
}

function installedRow(p, tr) {
  return el('div', { class: 'card', style: 'padding:14px 16px' }, [
    el('div', { class: 'row' }, [
      el('div', { style: 'display:flex;align-items:center;gap:10px;min-width:0' }, [
        pluginIcon(p.id),
        el('div', {}, [
          el('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' }, [
            el('strong', {}, p.name),
            p.hasUpdate ? el('button', { class: 'btn btn-small btn-primary', onclick: (e) => { e.stopPropagation(); p.hasUpdate = false; p.version = bump(p.version); renderApp(); toast(tr.updated || 'Updated'); } }, tr.update) : null
          ].filter(Boolean)),
          el('div', { class: 'meta' }, [
            el('span', { class: 'mono' }, 'v' + p.version),
            el('span', { class: 'sep' }, '·'),
            p.enabled ? (tr.enabledOn || 'On') : (tr.enabledOff || 'Off')
          ])
        ])
      ]),
      el('div', { style: 'display:flex;align-items:center;gap:10px;flex:none' }, [
        el('button', { class: 'icon-btn', title: tr.permissions, onclick: () => openModal(permissionsModal(p, tr)) }, lockIcon()),
        toggle(p.enabled, v => { p.enabled = v; renderApp(); })
      ])
    ])
  ]);
}

function bump(v) { const [a, b, c] = v.split('.').map(Number); return `${a}.${b}.${c + 1}`; }

function toggle(on, onChange) {
  const b = el('button', { class: `switch${on ? ' on' : ''}`, role: 'switch', 'aria-checked': String(on) });
  b.addEventListener('click', () => { onChange(!on); });
  return b;
}

function pluginIcon(id) {
  const colors = { sticker: '#25D366', ai: '#A78BFA', commerce: '#F59E0B', utility: '#38BDF8', news: '#F472B6', weather: '#60A5FA' };
  const c = colors[id] || '#25D366';
  const d = el('div', { style: `width:38px;height:38px;border-radius:11px;background:${c}22;border:1px solid ${c}44;display:flex;align-items:center;justify-content:center;flex:none` });
  d.appendChild(svg('M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z'));
  d.firstChild.setAttribute('stroke', c);
  d.firstChild.setAttribute('fill', 'none');
  return d;
}

function lockIcon() {
  return svg('M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4');
}

function pluginDetail(p, tr) {
  const installed = p.installed;
  return el('div', { class: 'modal' }, [
    el('div', { class: 'modal-content' }, [
      el('div', { class: 'row' }, [
        el('div', { style: 'display:flex;align-items:center;gap:10px' }, [pluginIcon(p.id), el('h3', {}, p.name)]),
        el('button', { class: 'icon-btn', onclick: closeModal }, '✕')
      ]),
      el('div', { class: 'meta', style: 'margin-top:10px' }, [
        el('span', { class: 'mono' }, 'v' + p.version),
        el('span', { class: 'sep' }, '·'),
        p.category,
        p.isOfficial ? el('span', { class: 'tag tag-neutral', style: 'margin-left:8px' }, tr.official) : null
      ]),
      el('p', { style: 'color:var(--text-dim);margin-top:12px' }, p.description),
      el('div', { class: 'card-label', style: 'margin-top:16px' }, tr.changelog || 'Changelog'),
      el('div', { style: 'color:var(--text-dim);font-size:13.5px' }, p.changelog),
      el('div', { class: 'card-label', style: 'margin-top:16px' }, tr.permissions),
      el('div', { class: 'stack', style: 'gap:8px' }, p.permissions.map(per =>
        el('div', { style: 'display:flex;align-items:center;gap:8px;color:var(--text-dim);font-size:13.5px' }, [lockIcon(), per])
      )),
      el('div', { style: 'display:flex;gap:10px;margin-top:20px' }, [
        installed
          ? el('button', { class: 'btn btn-danger', style: 'flex:1', onclick: () => { p.installed = false; p.enabled = false; closeModal(); renderApp(); toast(tr.uninstalled || 'Uninstalled'); } }, tr.uninstall)
          : el('button', { class: 'btn btn-primary', style: 'flex:1', onclick: () => { p.installed = true; p.enabled = true; closeModal(); renderApp(); toast(tr.installedDone || 'Installed'); } }, tr.install),
        installed ? el('button', { class: `btn ${p.enabled ? 'btn-secondary' : 'btn-primary'}`, style: 'flex:1', onclick: () => { p.enabled = !p.enabled; closeModal(); renderApp(); } }, p.enabled ? tr.disable : tr.enable) : null
      ].filter(Boolean))
    ])
  ]);
}

function permissionsModal(p, tr) {
  return el('div', { class: 'modal' }, [
    el('div', { class: 'modal-content' }, [
      el('div', { class: 'row' }, [
        el('h3', {}, `${p.name} — ${tr.permissions}`),
        el('button', { class: 'icon-btn', onclick: closeModal }, '✕')
      ]),
      el('div', { class: 'stack', style: 'gap:10px;margin-top:14px' }, p.permissions.map(per =>
        el('div', { style: 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface-elevated);border-radius:10px;font-size:14px' }, [lockIcon(), per])
      ))
    ])
  ]);
}

// --- Commands ---
let cmdSearch = '';

function renderCommands(tr) {
  const frag = document.createDocumentFragment();
  frag.appendChild(el('div', { class: 'page-head' }, [
    el('h1', { class: 'page-title' }, tr.commands),
    el('p', { class: 'page-sub' }, tr.searchCommands)
  ]));

  frag.appendChild(el('div', { class: 'card' }, [
    el('input', {
      class: 'search-input',
      placeholder: tr.searchCommands,
      value: cmdSearch,
      oninput: (e) => { cmdSearch = e.target.value; renderApp(); }
    })
  ]));

  const visiblePlugins = state.plugins.filter(p => p.installed && p.enabled);
  visiblePlugins.forEach(p => {
    const cmds = p.commands.filter(c =>
      c.trigger.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(cmdSearch.toLowerCase())
    );
    if (!cmds.length) return;
    frag.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'card-label' }, p.name),
      ...cmds.map(c => el('div', { class: 'row', style: 'padding:10px 0;border-top:1px solid var(--border)' }, [
        el('div', {}, [
          el('span', { class: 'mono', style: 'font-size:15px;color:var(--primary)' }, c.trigger),
          el('span', { style: 'color:var(--text-dim);margin-left:10px' }, c.description)
        ]),
        el('button', { class: 'btn btn-small', onclick: () => copyTrigger(c.trigger) }, tr.copy)
      ]))
    ]));
  });

  return frag;
}

function copyTrigger(t) {
  navigator.clipboard.writeText(t);
  toast(translations[state.lang].copied);
}

// --- Settings ---
function renderSettings(tr) {
  const frag = document.createDocumentFragment();
  frag.appendChild(el('div', { class: 'page-head' }, [
    el('h1', { class: 'page-title' }, tr.settings)
  ]));

  // Update Center
  frag.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.updateCenter),
    ...state.updates.map(u => el('div', { class: 'row', style: 'padding:12px 0;border-top:1px solid var(--border)' }, [
      el('div', {}, [
        el('strong', {}, u.name),
        el('div', { class: 'meta' }, 'v' + u.version)
      ]),
      u.mandatory ? el('span', { class: 'tag tag-red' }, tr.mandatory) : el('span', { class: 'tag tag-amber' }, tr.recommended),
      el('button', { class: `btn btn-small${u.updated ? '' : ' btn-primary'}`, onclick: () => { u.updated = true; renderApp(); toast(tr.updated || 'Updated'); }, disabled: u.updated }, u.updated ? (tr.upToDate || 'Up to date') : tr.update)
    ]))
  ]));

  // Update Policy
  frag.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.updatePolicy),
    el('div', { style: 'display:flex;align-items:center;gap:12px;margin-bottom:14px' }, [
      el('label', { style: 'font-weight:600;font-size:13.5px' }, tr.channel + ':'),
      el('select', { value: state.updatePolicy.channel, onchange: e => { state.updatePolicy.channel = e.target.value; renderApp(); }, style: 'flex:1;padding:8px 12px;background:var(--surface-elevated);border:1px solid var(--border);border-radius:10px;color:var(--text)' }, [
        el('option', { value: 'stable' }, tr.stable),
        el('option', { value: 'beta' }, tr.beta)
      ])
    ]),
    el('div', { class: 'stack', style: 'gap:10px' }, [
      el('div', { class: 'row' }, [
        el('div', {}, [
          el('strong', {}, tr.autoUpdatePlugins),
          el('div', { class: 'meta' }, tr.wifiOnly + ': ' + (state.updatePolicy.wifiOnly ? (tr.on || 'On') : (tr.off || 'Off')))
        ]),
        toggle(state.updatePolicy.autoUpdatePlugins, v => { state.updatePolicy.autoUpdatePlugins = v; renderApp(); })
      ]),
      el('div', { class: 'row' }, [
        el('div', {}, [
          el('strong', {}, tr.wifiOnly)
        ]),
        toggle(state.updatePolicy.wifiOnly, v => { state.updatePolicy.wifiOnly = v; renderApp(); })
      ])
    ])
  ]));

  // Diagnostics
  frag.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.diagnostics),
    el('div', { class: 'row' }, [
      el('div', {}, [
        el('strong', {}, tr.foregroundService),
        el('div', { class: 'meta' }, state.foregroundServiceRunning ? tr.running : tr.stopped)
      ]),
      el('span', { class: `dot${state.foregroundServiceRunning ? '' : ''}`, style: `background:${state.foregroundServiceRunning ? 'var(--primary)' : 'var(--danger)'}` })
    ]),
    el('div', { class: 'row', style: 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border)' }, [
      el('div', {}, [
        el('strong', {}, tr.ramUsage),
        el('div', { style: 'display:flex;gap:10px;align-items:center;margin-top:6px' }, [
          el('div', { style: 'flex:1;height:8px;background:var(--surface-elevated);border-radius:4px;overflow:hidden' }, [
            el('div', { style: `width:${Math.min(100, state.ramUsageMb / 512 * 100)}%;height:100%;background:var(--primary);border-radius:4px;transition:width .3s` })
          ]),
          el('span', { class: 'mono', style: 'font-size:14px' }, `${state.ramUsageMb} / 512 MB`)
        ])
      ])
    ]),
    el('div', { style: 'margin-top:14px' }, [
      el('div', { class: 'card-label' }, tr.exportLogs),
      el('button', { class: 'btn btn-secondary', onclick: exportLogs }, tr.exportLogs)
    ]),
    el('details', { style: 'margin-top:14px' }, [
      el('summary', { style: 'cursor:pointer;color:var(--text-dim)' }, 'Log preview'),
      el('pre', { style: 'margin-top:10px;font-family:JetBrains Mono;font-size:12px;color:var(--text-dim);white-space:pre-wrap' }, state.diagnosticLogs.join('\n'))
    ])
  ]));

  // Plan Management
  const planLabel = state.plan === 'free' ? tr.free + ' — ' + tr.localRuntime : tr.starter + ' — ' + tr.cloudRuntime;
  frag.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'card-label' }, tr.planManagement),
    el('div', { class: 'row' }, [
      el('div', {}, [
        el('strong', {}, tr.plan),
        el('div', { class: 'meta' }, planLabel)
      ]),
      el('button', { class: 'btn btn-primary', onclick: () => openModal(planUpgradeModal(tr)) }, state.plan === 'free' ? tr.upgrade : tr.switchPlan)
    ]),
    el('button', { class: 'btn btn-secondary', style: 'margin-top:10px;width:100%', onclick: () => { state.onboardingComplete = false; closeModal(); openModal(onboardingModal(tr)); } }, tr.replayOnboarding)
  ]));

  return frag;
}

function exportLogs() {
  const text = state.diagnosticLogs.join('\n');
  navigator.clipboard.writeText(text);
  toast(translations[state.lang].logsExported);
}

function planUpgradeModal(tr) {
  return el('div', { class: 'modal' }, [
    el('div', { class: 'modal-content' }, [
      el('h3', {}, tr.upgrade),
      el('p', { style: 'color:var(--text-dim);margin:12px 0' }, state.plan === 'free' ? 'Switch to cloud runtime for cooler operation and always-on availability.' : 'Switch to local runtime to run entirely on this device.'),
      el('div', { class: 'grid', style: 'margin-top:16px' }, [
        el('div', { class: 'card', style: `border-color:${state.plan === 'free' ? 'var(--primary)' : 'var(--border)'}` }, [
          el('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:8px' }, [
            el('strong', {}, tr.free),
            state.plan === 'free' ? el('span', { class: 'tag tag-green' }, tr.active || 'Active') : null
          ]),
          el('p', { style: 'color:var(--text-dim);font-size:13.5px' }, tr.localRuntime + '. ' + 'Device may get warm.'),
          el('button', { class: 'btn btn-secondary', style: 'margin-top:10px;width:100%', onclick: () => { state.plan = 'free'; state.botStatus = 'active'; closeModal(); renderApp(); } }, state.plan === 'free' ? (tr.current || 'Current') : tr.select)
        ]),
        el('div', { class: 'card', style: `border-color:${state.plan === 'starter' ? 'var(--accent-ai)' : 'var(--border)'}` }, [
          el('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:8px' }, [
            el('strong', { style: 'color:var(--accent-ai)' }, tr.starter),
            state.plan === 'starter' ? el('span', { class: 'tag tag-purple' }, tr.active || 'Active') : null
          ]),
          el('p', { style: 'color:var(--text-dim);font-size:13.5px' }, tr.cloudRuntime + '. ' + 'Phone stays cool, requires internet.'),
          el('button', { class: 'btn', style: 'margin-top:10px;width:100%;background:var(--accent-ai);color:#1a0e3d', onclick: () => { state.plan = 'starter'; state.botStatus = 'active'; closeModal(); renderApp(); } }, state.plan === 'starter' ? (tr.current || 'Current') : tr.select)
        ])
      ]),
      el('button', { class: 'btn btn-secondary', style: 'margin-top:16px;width:100%', onclick: closeModal }, tr.close || 'Close')
    ])
  ]);
}

// --- Modals & Toasts ---
let currentModal = null;

function openModal(content) {
  closeModal();
  currentModal = content;
  const root = qs('#overlayRoot');
  root.appendChild(content);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!currentModal) return;
  currentModal.remove();
  currentModal = null;
  document.body.style.overflow = '';
}

function toast(msg, duration = 2000) {
  const t = el('div', { class: 'toast' }, msg);
  qs('#toastRoot').appendChild(t);
  setTimeout(() => t.classList.add('out'), duration - 400);
  setTimeout(() => t.remove(), duration);
}

document.getElementById('overlayRoot').addEventListener('click', e => {
  if (e.target.id === 'overlayRoot') closeModal();
});


// --- Init & Lang Switch ---
qs('#langSwitch').addEventListener('click', e => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  const lang = btn.dataset.lang;
  if (lang === state.lang) return;
  state.lang = lang;
  qsa('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  renderApp();
});

// Buttons
const style = document.createElement('style');
style.textContent = `
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border-radius:12px;font-weight:700;font-size:14px;transition:background .18s,transform .08s}
.btn:active{transform:scale(.98)}
.btn-primary{background:var(--primary);color:#062b16}
.btn-primary:hover{filter:brightness(1.1)}
.btn-secondary{background:var(--surface-elevated);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{background:var(--border)}
.btn-danger{background:var(--danger);color:#fff}
.btn-danger:hover{filter:brightness(1.1)}
.btn-small{padding:6px 12px;font-size:12.5px}
.btn:disabled{opacity:.5;cursor:not-allowed}

.switch{width:44px;height:24px;border-radius:999px;background:var(--border);position:relative;transition:background .18s}
.switch.on{background:var(--primary)}
.switch::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.3);transition:left .18s}
.switch.on::after{left:22px}

.seg{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:4px;margin-bottom:14px}
.seg-btn{flex:1;padding:8px 0;border-radius:10px;font-weight:700;font-size:13.5px;color:var(--text-dim);transition:all .18s}
.seg-btn.active{background:var(--primary);color:#062b16}

.cat-bar{display:flex;gap:8px;overflow-x:auto;padding:4px 0 10px;margin-bottom:6px;scrollbar-width:thin}
.cat-btn{padding:6px 12px;border-radius:999px;font-weight:700;font-size:12.5px;color:var(--text-dim);white-space:nowrap;background:var(--surface);border:1px solid var(--border);transition:all .18s}
.cat-btn.active{background:var(--primary);color:#062b16;border-color:var(--primary)}

.plugin-card{transition:transform .18s,border-color .18s}
.plugin-card:hover{transform:translateY(-2px);border-color:rgba(37,211,102,.3)}

.search-input{width:100%;padding:12px 14px;background:var(--surface-elevated);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:14.5px}
.search-input:focus{outline:none;border-color:var(--primary)}

.icon-btn{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--text-dim);transition:background .18s,color .18s}
.icon-btn:hover{background:var(--surface-elevated);color:var(--text)}

.modal{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:24px 16px}
.modal-content{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border);border-radius:20px 20px 0 0;padding:20px;animation:slideUp .25s ease-out}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
@media(min-width:768px){.modal{padding:40px}.modal-content{border-radius:16px;max-width:480px;align-self:center;margin:auto}}

.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--surface-elevated);border:1px solid var(--border);color:var(--text);padding:12px 20px;border-radius:12px;font-weight:600;z-index:60;animation:toastIn .3s ease-out}
.toast.out{animation:toastOut .3s ease-in forwards}
@keyframes toastIn{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
@keyframes toastOut{to{transform:translateX(-50%) translateY(20px);opacity:0}}
@media(min-width:768px){.toast{bottom:40px}}

.onboard-wrap{display:flex;flex-direction:column;height:100vh;padding:16px;max-width:400px;margin:0 auto}
.progress-dots{display:flex;gap:4px;height:8px}
.dot{transition:width .3s,background .18s}

.empty{text-align:center;color:var(--text-faint);padding:40px 20px}
`;
document.head.appendChild(style);

// Start
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, state:', state.lang);
  if (!state.onboardingComplete) {
    renderOnboarding(translations[state.lang]);
  } else {
    renderApp();
  }
});

// --- Onboarding helpers ---
function planSteps(current, cb) {
  const tr = translations[state.lang];
  return [
    el('div', { class: 'card', style: `border-color:${current === 'free' ? 'var(--primary)' : 'var(--border)'}`, onclick: () => cb('free') }, [
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, [
        el('strong', {}, `[FREE] ${tr.free}`),
        current === 'free' ? el('div', { class: 'dot', style: 'width:12px;height:12px;background:var(--primary);border-radius:50%' }) : null
      ]),
      el('p', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:8px' }, 'Runs on this phone. Lightweight, device may get warm.')
    ]),
    el('div', { class: 'card', style: `border-color:${current === 'starter' ? 'var(--accent-ai)' : 'var(--border)'}`, onclick: () => cb('starter') }, [
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, [
        el('strong', { style: 'color:var(--accent-ai)' }, `[STARTER] ${tr.starter}`),
        current === 'starter' ? el('div', { class: 'dot', style: 'width:12px;height:12px;background:var(--accent-ai);border-radius:50%' }) : null
      ]),
      el('p', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:8px' }, 'Runs in the cloud. Phone stays cool, requires internet.')
    ])
  ];
}

function permissionSteps(tr) {
  return [
    el('div', { class: 'stack', style: 'gap:10px' }, [
      el('div', { class: 'card', style: 'padding:14px' }, [
        el('div', { style: 'display:flex;align-items:center;gap:10px' }, [
          el('div', { class: 'dot', style: 'background:var(--primary);width:10px;height:10px' }),
          el('div', {}, [
            el('strong', {}, tr.foregroundService),
            el('p', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:2px' }, 'Keep bot running in background')
          ])
        ])
      ]),
      el('div', { class: 'card', style: 'padding:14px' }, [
        el('div', { style: 'display:flex;align-items:center;gap:10px' }, [
          el('div', { class: 'dot', style: 'background:var(--warn);width:10px;height:10px' }),
          el('div', {}, [
            el('strong', {}, 'Battery Optimization Exemption'),
            el('p', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:2px' }, 'Prevent system from killing the app')
          ])
        ])
      ]),
      el('div', { class: 'card', style: 'padding:14px' }, [
        el('div', { style: 'display:flex;align-items:center;gap:10px' }, [
          el('div', { class: 'dot', style: 'background:var(--accent-ai);width:10px;height:10px' }),
          el('div', {}, [
            el('strong', {}, 'Notifications'),
            el('p', { style: 'color:var(--text-dim);font-size:13.5px;margin-top:2px' }, 'Receive alerts and updates')
          ])
        ])
      ])
    ])
  ];
}

function pairingStep(tr) {
  return [
    el('div', { class: 'card' }, [
      el('div', { class: 'card-label' }, tr.pairingGuide),
      el('div', { class: 'stack', style: 'gap:10px' }, [
        ['WhatsApp → Settings', 'Linked Devices → Link with phone number', 'Enter the 8-character code above'].map((s, i) =>
          el('div', { style: 'display:flex;align-items:center;gap:10px;color:var(--text-dim)' }, [
            el('div', { style: 'width:24px;height:24px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex:none' }, i + 1),
            s
          ])
        )
      ])
    ])
  ];
}

function finishOnboarding() {
  state.onboardingComplete = true;
  renderApp();
}

function renderOnboarding(tr) {
  state.currentPage = 'home';
  const steps = ['plan', 'permissions', 'pairing'];
  let step = 0;
  let chosenPlan = 'free';

  function showStep(idx) {
    step = idx;
    const root = qs('#page');
    root.innerHTML = '';
    const sobj = {
      plan: { title: tr.onboardTitles?.[0] || 'Choose Your Plan', subtitle: tr.onboardSubs?.[0] || '' },
      permissions: { title: tr.onboardTitles?.[1] || 'Allow Access', subtitle: tr.onboardSubs?.[1] || '' },
      pairing: { title: tr.onboardTitles?.[2] || 'Link WhatsApp', subtitle: tr.onboardSubs?.[2] || '' }
    };
    const cur = sobj[steps[idx]];
    root.appendChild(el('div', { class: 'onboard-wrap' }, [
      el('div', { class: 'progress-dots', style: 'margin-bottom:16px' }, steps.map((_, i) =>
        el('div', { style: `width:${i < step ? 8 : i === step ? 28 : 8}px;height:8px;border-radius:${i === step ? 999 : 4};background:${i <= step ? 'var(--primary)' : 'var(--border)'};transition:all .25s` })
      )),
      el('h2', { style: 'font-size:22px;font-weight:800;margin:16px 0 4px' }, cur.title),
      cur.subtitle ? el('p', { style: 'color:var(--text-dim);margin-bottom:16px;font-size:14px' }, cur.subtitle) : el('div', { style: 'margin-bottom:12px' }),
      ...(idx === 0 ? planSteps(chosenPlan, v => { chosenPlan = v; state.plan = v; showStep(0); }) : []),
      ...(idx === 1 ? permissionSteps(tr) : []),
      ...(idx === 2 ? pairingStep(tr) : []),
      el('div', { style: 'display:flex;gap:10px;margin-top:24px;padding-bottom:96px' }, [
        step > 0 ? el('button', { class: 'btn btn-secondary', onclick: () => showStep(step - 1) }, tr.back || 'Back') : el('span'),
        step < steps.length - 1
          ? el('button', { class: 'btn btn-primary', style: 'flex:1', onclick: () => showStep(step + 1) }, tr.next || 'Next')
          : el('button', { class: 'btn btn-primary', style: 'flex:1', onclick: finishOnboarding }, tr.finish || 'Finish')
      ])
    ]));
  }
  showStep(0);
}
