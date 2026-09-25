import { CHORDS, MAIN_CHORDS, ADDITIONAL_CHORDS, STRING_NAMES } from './chords-data.js?v=chords-2';
import { PATTERNS } from './patterns-data.js?v=eighth-10';

const $ = selector => document.querySelector(selector);
const appKey = 'guitar-constructor-session-v1';

/* Безопасное хранилище: в песочницах без same-origin (встроенный предпросмотр,
   некоторые iframe) localStorage бросает SecurityError — падаем в память. */
const memStore = {};
export const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return memStore[key] ?? null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { memStore[key] = value; } }
};
const themeKey = 'chordflow-theme-v2';
let draggedId = null;
let uiWired = false;

const LANGUAGE_PAIRS = [
  ['Chordflow — конструктор боя', 'Chordflow — konstruktér rytmu'],
  ['конструктор аккордов и боя', 'konstruktér akordů a rytmu'],
  ['аудио готово', 'audio připraveno'],
  ['Загрузка стальной гитары…', 'Načítání ocelové kytary…'],
  ['♫  Играть в фоне', '♫  Přehrávat na pozadí'],
  ['♫  Фоновый режим включён', '♫  Režim přehrávání na pozadí zapnut'],
  ['♫  Собираю фоновую музыку…', '♫  Připravuji hudbu na pozadí…'],
  ['Нажмите кнопку ещё раз, чтобы запустить фоновую музыку', 'Stiskněte tlačko znovu pro spuštění hudby na pozadí'],
  ['Текст песни', 'Text písně'],
  ['Сохранить текст в таблицу', 'Uložit text do tabulky'],
  ['Вставьте или напишите текст песни…', 'Vložte nebo napište text písně…'],
  ['Текст сохраняется в браузере автоматически', 'Text se automaticky ukládá v prohlížeči'],
  ['Закрыть окно', 'Zavřít okno'],
  ['Зациклить', 'Opakovat'],
  ['Сохранить онлайн', 'Uložit online'],
  ['Открыть по коду', 'Otevřít podle kódu'],
  ['Код песни', 'Kód písně'],
  ['Готово к игре', 'Připraveno ke hře'],
  ['Восьмёрка · DDUUUDDU', 'Osmička · DDUUUDDU'],
  ['Шестёрка · D-DU-UDU', 'Šestka · D-DU-UDU'],
  ['Шестёрка · D-D-DUDU', 'Šestka · D-D-DUDU'],
  ['Библиотека', 'Knihovna'],
  ['Аккорды', 'Akordy'],
  ['Дополнительные аккорды', 'Další akordy'],
  ['Аранжировка', 'Aranžmá'],
  ['Карта песни', 'Mapa písně'],
  ['Дублировать все', 'Duplikovat vše'],
  ['Стереть куплет', 'Smazat sloku'],
  ['Стереть припев', 'Smazat refrén'],
  ['Стереть бридж', 'Smazat bridge'],
  ['Очистить всё', 'Vymazat vše'],
  ['глушение', 'tlumení'],
  ['вниз', 'dolů'],
  ['вверх', 'nahoru'],
  ['Порядок песни', 'Pořadí písně'],
  ['+ часть', '+ část'],
  ['Разделить бой с соседним аккордом', 'Rozdělit rytmus mezi sousední akordy'],
  ['Часть боя', 'Část rytmu'],
  ['Весь DDUUUDDU', 'Celý DDUUUDDU'],
  ['Начало · DD', 'Začátek · DD'],
  ['Продолжение · UUUDDU', 'Pokračování · UUUDDU'],
  ['Глушение в «шестёрке»', 'Tlumení v „šestce“'],
  ['Показывать структуру песни', 'Zobrazit strukturu písně'],
  ['Каждый блок = один такт боя × заданное число тактов', 'Každý blok = jeden takt rytmu × zvolený počet taktů'],
  ['Web Audio · без сервера · данные сохраняются в браузере', 'Web Audio · bez serveru · data se ukládají v prohlížeji'],
  ['Эта часть пока пустая', 'Tato část je zatím prázdná'],
  ['Добавьте сюда аккорды из палитры', 'Přidejte sem akordy z knihovny'],
  ['Поиск: Am, Cmaj7…', 'Hledat: Am, Cmaj7…'],
  ['· редактируется', '· upravujete'],
  ['аккордов', 'akordů'],
  ['такта', 'takty'],
  ['такт', 'takt'],
  ['удар', 'úder'],
  ['Тема', 'Motiv'],
  ['Сохранить', 'Uložit'],
  ['Открыть', 'Otevřít'],
  ['Файл', 'Soubor'],
  ['Облако', 'Cloud'],
  ['Настройки', 'Nastavení'],
  ['Куплет', 'Sloka'],
  ['Припев', 'Refrén'],
  ['Бридж', 'Bridge'],
  ['Моя мелодия', 'Moje melodie'],
  ['Дальше по карте', 'Dál po mapě'],
  ['Карта песни', 'Mapa písně'],
  ['фокус-сцена', 'fokus-scéna'],
  ['конструктор', 'konstruktér'],
  ['Сцена', 'Scéna'],
  ['сейчас', 'nyní'],
  ['+ добавить часть — карта песни соберётся здесь', '+ přidejte část — mapa písně se sestaví zde'],
  ['заполнена одна часть — карта свернулась в семечко', 'je vyplněna jedna část — mapa se sbalila do semínka'],
  ['вторая часть появилась — карта выросла: узлы, рёбра, повторы', 'objevila se druhá část — mapa vyrostla: uzly, hrany, opakování'],
  ['песня собрана — виден весь обход с петлёй цикла', 'píseň je hotová — vidíte celý průchod se smyčkou'],
  ['Пусто · добавьте аккорды в конструкторе', 'Prázdné · přidejte akordy v konstruktéru'],
  ['Текст песни · автоскролл в разделе «Текст»', 'Text písně · automatické posouvání v záložce «Text»'],
];

export function applyLanguage(language = 'ru') {
  const pairs = language === 'cs' ? LANGUAGE_PAIRS : LANGUAGE_PAIRS.map(([ru, cs]) => [cs, ru]);
  const replaceText = value => pairs.slice().sort((a, b) => b[0].length - a[0].length).reduce((text, from_to) => text.split(from_to[0]).join(from_to[1]), value);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { node.nodeValue = replaceText(node.nodeValue); });
  document.querySelectorAll('[title], [aria-label]').forEach(element => { if (element.title) element.title = replaceText(element.title); if (element.getAttribute('aria-label')) element.setAttribute('aria-label', replaceText(element.getAttribute('aria-label'))); });
  const toggle = $('#language-toggle'); if (toggle) toggle.textContent = language === 'ru' ? 'Čeština' : 'Русский';
  document.documentElement.lang = language === 'cs' ? 'cs' : 'ru';
  document.title = language === 'cs' ? 'Chordflow — konstruktér rytmu' : 'Chordflow — конструктор боя';
}

/* ---------- svg helpers ---------- */
export function diagramSVG(chord, w = 58, h = 44) {
  const n = 6, rows = 5, sx = (w - 8) / (n - 1), sy = (h - 10) / (rows - 1);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">`;
  for (let i = 0; i < n; i++) s += `<line x1="${4 + i * sx}" y1="8" x2="${4 + i * sx}" y2="${h - 2}" style="stroke:var(--line2)" stroke-width="1"/>`;
  for (let r = 0; r < rows; r++) s += `<line x1="4" y1="${8 + r * sy}" x2="${w - 4}" y2="${8 + r * sy}" style="stroke:var(--line)" stroke-width="1"/>`;
  chord.frets.forEach((f, i) => {
    const x = 4 + i * sx;
    if (f === null) s += `<path d="M${x - 2.6} 2.4 l5 5 M${x + 2.6} 2.4 l-5 5" style="stroke:var(--faint)" stroke-width="1.2"/>`;
    else if (f === 0) s += `<circle cx="${x}" cy="4.6" r="2.4" fill="none" style="stroke:var(--muted)" stroke-width="1.2"/>`;
    else s += `<circle cx="${x}" cy="${8 + (f - 1) * sy + sy / 2}" r="3.1" style="fill:var(--dot)"/>`;
  });
  return s + '</svg>';
}
const ARROW_DOWN = '<path d="M5.5 1v10M5.5 16 1.6 10.4h7.8L5.5 16Z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>';
const ARROW_UP = '<path d="M5.5 17V7M5.5 2 1.6 7.6h7.8L5.5 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>';
const ARROW_MUTE = '<path d="M2.6 6.4 8.4 12.6M8.4 6.4 2.6 12.6" stroke="currentColor" stroke-width="1.8"/>';
function arrowsSVG(pattern) {
  return pattern.strokes.map(s => {
    const cls = !s.sound ? 'ar mute' : s.dir === 'down' ? 'ar down' : 'ar up';
    const body = !s.sound ? ARROW_MUTE : s.dir === 'down' ? ARROW_DOWN : ARROW_UP;
    return `<svg class="${cls}" width="11" height="18" viewBox="0 0 11 18" aria-hidden="true">${body}</svg>`;
  }).join('');
}
const PLAY_SVG = '<svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true"><path d="M6 3.6v11.8L15.4 9.5 6 3.6Z" fill="currentColor"/></svg>';
const PAUSE_SVG = '<svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true"><rect x="3" y="2" width="4" height="13" rx="1.4" fill="currentColor"/><rect x="10" y="2" width="4" height="13" rx="1.4" fill="currentColor"/></svg>';

/* ---------- state ---------- */
export function createInitialState() {
  const saved = JSON.parse(storage.get(appKey) || 'null');
  const restore = sequence => (sequence || []).map(item => ({ ...item, chord: CHORDS.find(c => c.id === item.chord?.id) || CHORDS[0] }));
  const sections = saved?.sections?.length ? saved.sections.map(section => ({ ...section, sequence: restore(section.sequence) })) : [
    { id: 'verse', name: 'Куплет', sequence: restore(saved?.sequence) },
    { id: 'chorus', name: 'Припев', sequence: [] },
    { id: 'bridge', name: 'Бридж', sequence: [] },
  ];
  const validIds = new Set(sections.map(section => section.id));
  const songOrder = (saved?.songOrder || ['verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus']).filter(id => validIds.has(id));
  return {
    songName: saved?.songName || 'Моя мелодия',
    language: saved?.language || 'ru',
    bpm: saved?.bpm || 90,
    pattern: PATTERNS.find(p => p.id === saved?.patternId) || PATTERNS[0],
    loop: saved?.loop ?? true,
    mutedStrikes: saved?.mutedStrikes ?? false,
    showSongStructure: saved?.showSongStructure ?? true,
    sections,
    songOrder: songOrder.length ? songOrder : ['verse'],
    currentSectionId: validIds.has(saved?.currentSectionId) ? saved.currentSectionId : sections[0].id,
    bgDuration: Number(saved?.bgDuration) || 60
  };
}

export function persist(state) { storage.set(appKey, JSON.stringify({ songName: state.songName, language: state.language, bpm: state.bpm, patternId: state.pattern.id, loop: state.loop, mutedStrikes: state.mutedStrikes, showSongStructure: state.showSongStructure, bgDuration: state.bgDuration || 60, currentSectionId: state.currentSectionId, songOrder: state.songOrder, sections: state.sections.map(section => ({ id: section.id, name: section.name, sequence: section.sequence.map(({ chord, bars, strumPart }) => ({ chord: { id: chord.id }, bars, strumPart: strumPart || 'full' })) })) })); }

/* ---------- palette ---------- */
const TYPE_SHORT = { minor: 'min', major: 'maj', dominant7: '7', minor7: 'm7', major7: 'maj7', sus2: 'sus2', sus4: 'sus4', add9: 'add9' };
export function renderPalette(onAdd) {
  const tile = chord => `<button class="tile" draggable="true" data-id="${chord.id}" title="${chord.name}"><span class="nm"><b>${chord.id}</b><span>${TYPE_SHORT[chord.type] || chord.type}</span></span>${diagramSVG(chord)}</button>`;
  const palette = $('#palette');
  palette.innerHTML = `<div class="pgrid main-grid">${MAIN_CHORDS.map(tile).join('')}</div><details class="more-wrap"><summary class="more"><span>＋ Дополнительные аккорды</span><span>${ADDITIONAL_CHORDS.length}</span></summary><div class="pgrid" style="padding:0 0 4px">${ADDITIONAL_CHORDS.map(tile).join('')}</div></details>`;
  const wire = card => {
    card.addEventListener('dragstart', () => draggedId = card.dataset.id);
    card.addEventListener('click', () => onAdd(card.dataset.id));
  };
  palette.querySelectorAll('.tile').forEach(wire);
  const search = $('#chord-search');
  if (search && !search.dataset.wired) {
    search.dataset.wired = '1';
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      palette.querySelectorAll('.tile').forEach(t => { t.style.display = !q || t.dataset.id.toLowerCase().includes(q) ? '' : 'none'; });
      const more = palette.querySelector('.more-wrap');
      if (more && q) more.open = true;
    });
  }
  const count = $('#chord-count'); if (count) count.textContent = CHORDS.length;
}

/* ---------- arrange chips ---------- */
const sectionColor = (state, id) => `sec-${(state.sections.findIndex(s => s.id === id) % 3) + 1}`;

export function renderSections(state, handlers) {
  const tabs = $('#section-tabs'); if (tabs) tabs.innerHTML = '';
  const orderCount = id => state.songOrder.filter(x => x === id).length;
  const host = $('#song-order');
  host.innerHTML = state.songOrder.map((id, index) => {
    const section = state.sections.find(item => item.id === id);
    return `<button class="achip ${sectionColor(state, id)} ${id === state.currentSectionId ? 'cur' : ''}" data-order-section="${id}"><span class="num">${index + 1}</span><i class="mark"></i>${section?.name || id}<span class="x" data-remove-order="${index}" role="button" aria-label="Убрать часть">×</span></button>`;
  }).join('') + `<span class="order-add"><select id="order-section-select" aria-label="Добавить часть">${state.sections.map(section => `<option value="${section.id}">${section.name}</option>`).join('')}</select><button id="add-order" class="achip add">+ часть</button></span>`;
  host.querySelectorAll('[data-order-section]').forEach(button => button.addEventListener('click', () => handlers.section(button.dataset.orderSection)));
  host.querySelectorAll('[data-remove-order]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); handlers.removeOrder(Number(button.dataset.removeOrder)); }));
  const add = $('#add-order'); if (add) add.onclick = () => handlers.addOrder($('#order-section-select').value);
}

/* ---------- song map (lanes) ---------- */
let currentState = null;

export function renderTimeline(state, handlers) {
  currentState = state;
  const timeline = $('#timeline');
  const orderCount = id => state.songOrder.filter(x => x === id).length;
  const isVosmyorka = state.pattern.id === 'vosmyorka';

  const blockHTML = (section, item, index, editable) => {
    const actions = editable ? `<div class="bacts">${isVosmyorka ? '<button data-action="split" title="Разделить бой с соседним аккордом">⇄</button>' : ''}<button data-action="duplicate" title="Дублировать">⧉</button><button data-action="remove" title="Убрать">×</button></div>` : '';
    const bars = editable
      ? `<span class="st"><button data-action="bars-" aria-label="Меньше тактов">−</button><b>${item.bars}</b><button data-action="bars+" aria-label="Больше тактов">+</button></span>`
      : `<span class="st"><b>${item.bars}</b></span>`;
    const segment = editable && isVosmyorka ? `<select class="seg-select" data-action="segment" aria-label="Часть боя"><option value="full" ${item.strumPart === 'full' || !item.strumPart ? 'selected' : ''}>Весь DDUUUDDU</option><option value="first" ${item.strumPart === 'first' ? 'selected' : ''}>Начало · DD</option><option value="second" ${item.strumPart === 'second' ? 'selected' : ''}>Продолжение · UUUDDU</option></select>` : '';
    return `<${editable ? 'article' : 'div'} class="block ${editable ? 'editable' : 'ro'}" ${editable ? 'draggable="true"' : ''} data-section="${section.id}" data-index="${index}" ${editable ? '' : 'tabindex="0" role="button"'}>
      <span class="idx">${String(index + 1).padStart(2, '0')}</span>${actions}
      <div class="cn">${item.chord.name}</div>
      <div class="arrows">${arrowsSVG(state.pattern)}</div>
      <div class="bars"><span class="bl">такта</span>${bars}</div>${segment}
    </${editable ? 'article' : 'div'}>`;
  };

  timeline.innerHTML = state.sections.map(section => {
    const current = section.id === state.currentSectionId;
    const blocks = section.sequence.length
      ? section.sequence.map((item, index) => blockHTML(section, item, index, current)).join('')
      : '<div class="empty-state"><span>＋</span><p>Эта часть пока пустая<br>Добавьте сюда аккорды из палитры</p></div>';
    return `<section class="lane ${sectionColor(state, section.id)} ${current ? 'current' : ''}" data-lane="${section.id}">
      <div class="lhead">
        <button class="lname" data-set-section="${section.id}"><i class="mark"></i><b>${section.name}</b><span class="mult">×${orderCount(section.id)}</span><span class="cnt">${section.sequence.length} аккордов</span></button>
        <span class="acts"><button data-lane-dup title="Дублировать все">⧉</button><button data-lane-clear title="Стереть часть">⌫</button></span>
      </div>
      <div class="blocks">${blocks}${current ? '<button class="addblock" title="Добавить аккорд">+</button>' : ''}</div>
    </section>`;
  }).join('');

  /* wiring */
  timeline.querySelectorAll('[data-set-section]').forEach(el => el.addEventListener('click', () => handlers.section(el.dataset.setSection)));
  timeline.querySelectorAll('.lane').forEach(lane => {
    const id = lane.dataset.lane;
    lane.querySelector('[data-lane-dup]')?.addEventListener('click', () => { if (id !== state.currentSectionId) handlers.section(id); handlers.duplicateAll(); });
    lane.querySelector('[data-lane-clear]')?.addEventListener('click', () => { if (id !== state.currentSectionId) handlers.section(id); handlers.clearSection(); });
    const drop = lane.querySelector('.blocks');
    drop.ondragover = e => e.preventDefault();
    drop.ondrop = e => { e.preventDefault(); if (draggedId && !draggedId.startsWith('index:')) { if (id !== state.currentSectionId) handlers.section(id); handlers.add(draggedId); draggedId = null; } };
  });
  timeline.querySelectorAll('.block.editable').forEach(block => {
    const index = Number(block.dataset.index);
    block.addEventListener('dragstart', () => draggedId = `index:${index}`);
    block.addEventListener('drop', e => { e.stopPropagation(); if (draggedId?.startsWith('index:')) handlers.reorder(Number(draggedId.slice(6)), index); });
    block.querySelectorAll('.bacts button').forEach(btn => btn.addEventListener('click', () => handlers.action(btn.dataset.action, index)));
    block.querySelectorAll('.bars .st button').forEach(btn => btn.addEventListener('click', () => {
      const current = state.sections.find(s => s.id === state.currentSectionId)?.sequence[index]?.bars || 1;
      handlers.bars(index, current + (btn.dataset.action === 'bars+' ? 1 : -1));
    }));
    const segment = block.querySelector('select[data-action="segment"]');
    if (segment) segment.addEventListener('change', e => handlers.segment(index, e.target.value));
  });
  timeline.querySelectorAll('.addblock').forEach(btn => btn.addEventListener('click', () => { const s = $('#chord-search'); s?.focus(); s?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }));

  $('#duplicate-all').onclick = handlers.duplicateAll;
  const currentSection = state.sections.find(s => s.id === state.currentSectionId) || state.sections[0];
  $('#clear-section').textContent = `⌫ Стереть ${currentSection.name.toLowerCase()}`;
  $('#clear-section').onclick = handlers.clearSection;
  $('#clear-all').onclick = handlers.clearAll;
  applyView(state);
}

/* ---------- transport & controls ---------- */
export function setupControls(state, handlers) {
  const seg = $('#pattern-seg');
  seg.innerHTML = PATTERNS.map(p => {
    const [name, code] = p.name.split('·');
    return `<button role="radio" aria-checked="${p.id === state.pattern.id}" class="${p.id === state.pattern.id ? 'on' : ''}" data-pattern="${p.id}"><span class="n">${name.trim()}</span><span class="p">${(code || '').trim()}</span></button>`;
  }).join('');
  seg.querySelectorAll('button').forEach(btn => btn.onclick = () => handlers.pattern(btn.dataset.pattern));

  $('#bpm').value = state.bpm;
  $('#bpm-value').textContent = state.bpm;
  $('#bpm-minus').onclick = () => handlers.bpm(Math.max(40, state.bpm - 5));
  $('#bpm-plus').onclick = () => handlers.bpm(Math.min(200, state.bpm + 5));
  $('#loop').checked = state.loop;
  $('#loop').onchange = e => handlers.loop(e.target.checked);

  const muteAvailable = state.pattern.id.startsWith('shestyorka');
  const muteControl = $('#mute-strikes').closest('label');
  $('#mute-strikes').checked = state.mutedStrikes;
  $('#mute-strikes').disabled = !muteAvailable;
  muteControl.classList.toggle('disabled', !muteAvailable);
  muteControl.title = 'Работает только с вариантами боя «Шестёрка»';
  $('#mute-strikes').onchange = e => handlers.muted(e.target.checked);

  $('#show-song-structure').checked = state.showSongStructure;
  $('#show-song-structure').onchange = e => handlers.showStructure(e.target.checked);
  $('#section-switcher').classList.toggle('hidden', !state.showSongStructure);

  const bgDurationSelect = $('#bg-duration-select');
  if (bgDurationSelect) {
    bgDurationSelect.value = String(state.bgDuration || 60);
    bgDurationSelect.onchange = e => handlers.bgDuration(Number(e.target.value));
  }

  const nameText = $('#song-name-text'); if (nameText) nameText.textContent = state.songName || 'Моя мелодия';
  $('#bpm').oninput = e => handlers.bpm(Number(e.target.value));
  setTransportState(document.body.classList.contains('playing'));

  if (!uiWired) {
    uiWired = true;
    /* theme */
    const savedTheme = storage.get(themeKey);
    if (savedTheme) document.documentElement.dataset.theme = savedTheme;
    $('#theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'scene' ? 'paper' : 'scene';
      document.documentElement.dataset.theme = next;
      storage.set(themeKey, next);
    });
    $('#st-play').addEventListener('click', () => $('#play').click());
    $('#st-stop').addEventListener('click', () => $('#stop').click());
    $('#to-stage').addEventListener('click', () => setView('stage'));
    $('#to-constructor').addEventListener('click', () => setView('constructor'));
    $('#focus-toggle').addEventListener('click', () => {
      const on = document.documentElement.dataset.focus === 'on';
      document.documentElement.dataset.focus = on ? 'off' : 'on';
    });
    /* save popover */
    const menu = $('#save-menu'), toggle = $('#save-menu-toggle');
    const closeMenu = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); });
    document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.save-wrap')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });
  }
}

export function setTransportState(running) {
  const play = $('#play');
  play.classList.toggle('active', running);
  play.innerHTML = running ? PAUSE_SVG : PLAY_SVG;
  play.setAttribute('aria-label', running ? 'Пауза' : 'Играть');
  const stPlay = $('#st-play');
  if (stPlay) { stPlay.classList.toggle('active', running); stPlay.innerHTML = running ? PAUSE_SVG : PLAY_SVG; stPlay.setAttribute('aria-label', running ? 'Пауза' : 'Играть'); }
  document.body.classList.toggle('playing', running);
}

export function updatePlayhead(item, step, visibleSectionId) {
  const beat = item ? Math.floor((step % 8) / 2) : -1;
  document.querySelectorAll('#beat-dots i').forEach((dot, i) => dot.classList.toggle('on', i === beat));
  document.querySelectorAll('.block[data-index]').forEach(el => {
    const active = !!item && el.dataset.section === item.sectionId && Number(el.dataset.index) === item.localIndex;
    el.classList.toggle('now', active);
    if (active) el.querySelectorAll('.arrows .ar').forEach((ar, j) => ar.classList.toggle('lit', j === step % 8));
    else el.querySelectorAll('.arrows .ar.lit').forEach(ar => ar.classList.remove('lit'));
    if (active) {
      const scroller = el.closest('.blocks');
      if (scroller) {
        const left = el.offsetLeft - (scroller.clientWidth - el.offsetWidth) / 2;
        const visibleLeft = scroller.scrollLeft, visibleRight = visibleLeft + scroller.clientWidth;
        if (el.offsetLeft < visibleLeft || el.offsetLeft + el.offsetWidth > visibleRight) scroller.scrollTo({ left, behavior: 'smooth' });
      }
    }
  });
  $('#current-position').textContent = item ? `${item.sectionName} · такт ${item.localIndex + 1} · удар ${(step % 8) + 1}` : 'Готово к игре';
  updateStagePlayhead(item, step);
}

/* ---------- in-app dialogs (работают даже там, где нативные prompt/confirm заблокированы) ---------- */
let dialogHost = null;
function ensureDialogHost() {
  if (dialogHost) return dialogHost;
  dialogHost = document.createElement('div');
  dialogHost.id = 'cf-dialog-host';
  document.body.appendChild(dialogHost);
  return dialogHost;
}
export function askConfirm({ title = '', text = '', confirm = 'Подтвердить', cancel = 'Отмена', danger = false } = {}) {
  return new Promise(resolve => {
    const host = ensureDialogHost();
    host.innerHTML = `<div class="cf-overlay"><div class="cf-window" role="dialog" aria-modal="true">
      <h3>${title}</h3><p>${text}</p>
      <div class="cf-actions"><button class="cf-cancel chipbtn" type="button">${cancel}</button><button class="cf-confirm chipbtn ${danger ? 'danger' : ''}" type="button">${confirm}</button></div>
    </div></div>`;
    const close = value => { host.innerHTML = ''; document.removeEventListener('keydown', key); resolve(value); };
    const key = e => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', key);
    host.querySelector('.cf-cancel').onclick = () => close(false);
    host.querySelector('.cf-confirm').onclick = () => close(true);
    host.querySelector('.cf-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(false); });
    host.querySelector('.cf-confirm').focus();
  });
}
export function askText({ title = '', label = '', value = '', confirm = 'Сохранить', cancel = 'Отмена' } = {}) {
  return new Promise(resolve => {
    const host = ensureDialogHost();
    host.innerHTML = `<div class="cf-overlay"><div class="cf-window" role="dialog" aria-modal="true">
      <h3>${title}</h3><label for="cf-dialog-input">${label}</label>
      <input id="cf-dialog-input" type="text" value="${value.replace(/"/g, '&quot;')}">
      <div class="cf-actions"><button class="cf-cancel chipbtn" type="button">${cancel}</button><button class="cf-confirm chipbtn" type="button">${confirm}</button></div>
    </div></div>`;
    const input = host.querySelector('input');
    const close = val => { host.innerHTML = ''; document.removeEventListener('keydown', key); resolve(val); };
    const key = e => { if (e.key === 'Escape') close(null); if (e.key === 'Enter') close(input.value); };
    document.addEventListener('keydown', key);
    host.querySelector('.cf-cancel').onclick = () => close(null);
    host.querySelector('.cf-confirm').onclick = () => close(input.value);
    host.querySelector('.cf-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(null); });
    input.focus(); input.select();
  });
}

/* ---------- hybrid mode: scene + growing canvas (G1+G3) ---------- */
const viewKey = 'chordflow-view-v1';
const filledSections = state => state.sections.filter(sec => sec.sequence.length > 0);
function orderSequence(state) {
  return state.songOrder.flatMap(id => {
    const sec = state.sections.find(x => x.id === id);
    return (sec?.sequence || []).map((item, i) => ({ ...item, sectionId: id, sectionName: sec.name, localIndex: i }));
  });
}
const stArrow = (stroke, small) => {
  const w = small ? 6 : 24, h = small ? 12 : 42, sw = small ? 0 : 1.4;
  if (!stroke.sound) return `<svg class="ar mute" width="${w}" height="${h}" viewBox="0 0 11 20"><path d="M2.6 6.4 8.4 12.6M8.4 6.4 2.6 12.6" stroke="currentColor" stroke-width="1.8"/></svg>`;
  return stroke.dir === 'down'
    ? `<svg class="ar down" width="${w}" height="${h}" viewBox="0 0 11 20"><path d="M5.5 1v11M5.5 18 1.6 11.6h7.8L5.5 18Z" fill="currentColor" stroke="currentColor" stroke-width="${sw}"/></svg>`
    : `<svg class="ar up" width="${w}" height="${h}" viewBox="0 0 11 20"><path d="M5.5 19V8M5.5 2 1.6 8.4h7.8L5.5 2Z" fill="currentColor" stroke="currentColor" stroke-width="${sw}"/></svg>`;
};

export function renderStage(state) {
  const filled = filledSections(state);
  document.documentElement.dataset.state = String(Math.min(3, Math.max(1, filled.length)));
  const cur = state.sections.find(sec => sec.id === state.currentSectionId) || state.sections[0];
  $('#st-song').textContent = state.songName || 'Моя мелодия';
  $('#st-secs').innerHTML = state.sections.map(sec => `<span class="${sec.sequence.length ? (sec.id === state.currentSectionId ? 'on' : '') : 'empty'}">${sec.name}</span>`).join('');
  $('#st-bpm').textContent = state.bpm;
  const seq = cur?.sequence || [];
  const first = seq[0];
  $('#st-chord').textContent = first ? first.chord.name : '—';
  $('#st-bars').innerHTML = first ? `${cur.name} · такт <b>1</b>/${seq.length} · ${state.pattern.name.split('·')[0].trim()}` : 'Пусто · добавьте аккорды в конструкторе';
  const runway = $('#st-runway');
  runway.querySelectorAll('.ar').forEach(el => el.remove());
  runway.insertAdjacentHTML('beforeend', state.pattern.strokes.map(st => stArrow(st, false)).join(''));
  const order = orderSequence(state);
  const startIdx = order.findIndex(o => o.sectionId === cur?.id);
  const next = startIdx >= 0 ? order.slice(startIdx + 1, startIdx + 4) : order.slice(0, 3);
  $('#st-next').innerHTML = next.length
    ? next.map((o, i) => `<div class="ncard ${i === 0 ? 'soon' : ''}"><span class="n">${o.chord.name}</span><span class="m">${o.bars} такта</span><span class="from">${o.sectionName.toLowerCase()}</span></div>`).join('')
    : '<div class="ncard"><span class="m">Добавьте части — и здесь появится «дальше»</span></div>';
  const lyr = (storage.get('guitar-constructor-lyrics-v1') || '').split('\n').filter(Boolean)[0];
  $('#st-lyr').innerHTML = lyr ? `<b>${lyr}</b><br><span style="font-size:10.5px">Текст песни · автоскролл в разделе «Текст»</span>` : '';
  const seed = $('#st-seed'), graph = $('#st-graph');
  if (filled.length <= 1) {
    seed.style.display = 'flex'; graph.style.display = 'none';
    const s0 = filled[0] || cur;
    seed.innerHTML = `<span class="nchip sec-${(state.sections.indexOf(s0) % 3) + 1}"><i></i><b>${s0.name}</b><span>${s0.sequence.length} аккордов · ×${state.songOrder.filter(x => x === s0.id).length}</span></span><span class="ghost">+ добавить часть — карта песни соберётся здесь</span>`;
  } else {
    seed.style.display = 'none'; graph.style.display = 'block';
    const pos = {}; filled.forEach((sec, i) => { pos[sec.id] = { x: 20 + i * 340, y: filled.length > 2 ? (i % 2 ? 108 : 34) : 44 }; });
    const W = 298;
    const tr = {};
    for (let i = 0; i < state.songOrder.length - 1; i++) {
      const a = state.songOrder[i], b = state.songOrder[i + 1];
      if (a !== b && pos[a] && pos[b]) { const k = a + '>' + b; tr[k] = tr[k] || { a, b, n: 0 }; tr[k].n++; }
    }
    const edges = Object.values(tr).map((t, idx) => {
      const pa = pos[t.a], pb = pos[t.b], fwd = pb.x > pa.x;
      const x1 = fwd ? pa.x + W : pa.x, y1 = pa.y + 40, x2 = fwd ? pb.x : pb.x + W, y2 = pb.y + 40;
      const my = Math.min(y1, y2) - 30 - idx * 8;
      const lit = t.a === state.currentSectionId;
      return `<path d="M${x1} ${y1} C ${(x1 + x2) / 2} ${my}, ${(x1 + x2) / 2} ${my}, ${x2} ${y2}" fill="none" stroke="${lit ? 'var(--accent)' : 'var(--muted)'}" stroke-width="${lit ? 2.2 : 1.4}" ${lit ? '' : 'stroke-dasharray="4 6"'} marker-end="url(#st-${lit ? 'a' : 'm'})"/><text x="${(x1 + x2) / 2 - 8}" y="${my + 12}" fill="${lit ? 'var(--accent)' : 'var(--muted)'}" font-size="11" font-family="JetBrains Mono,monospace">×${t.n}</text>`;
    }).join('');
    graph.innerHTML = `<svg class="edges" viewBox="0 0 1392 216" preserveAspectRatio="none"><defs><marker id="st-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--accent)"/></marker><marker id="st-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--muted)"/></marker></defs>${edges}</svg>` +
      filled.map(sec => {
        const p = pos[sec.id];
        return `<section class="gnode sec-${(state.sections.indexOf(sec) % 3) + 1} ${sec.id === state.currentSectionId ? 'play' : ''}" data-section="${sec.id}" style="left:${p.x}px;top:${p.y}px"><div class="h"><i></i><b>${sec.name}</b><span class="m">×${state.songOrder.filter(x => x === sec.id).length} · ${sec.sequence.reduce((a, b) => a + b.bars, 0)} тактов</span></div><div class="strip2">${sec.sequence.slice(0, 5).map((bl, bi) => `<div class="cb" data-ci="${bi}"><div class="n">${bl.chord.name}</div><div class="a">${stArrow(state.pattern.strokes[0], true)}${stArrow(state.pattern.strokes[2] || state.pattern.strokes[0], true)}</div></div>`).join('')}</div></section>`;
      }).join('');
  }
  $('#st-hint').textContent = filled.length <= 1
    ? 'заполнена одна часть — карта свернулась в семечко'
    : filled.length === 2 ? 'вторая часть появилась — карта выросла: узлы, рёбра, повторы' : 'песня собрана — виден весь обход с петлёй цикла';
}

export function updateStagePlayhead(item, step) {
  if (document.body.dataset.view !== 'stage' || !item) return;
  $('#st-chord').textContent = item.chord.name;
  $('#st-bar').textContent = item.localIndex + 1;
  $('#st-hit').textContent = (step % 8) + 1;
  document.querySelectorAll('#st-runway .ar').forEach((el, i) => el.classList.toggle('lit', i === step % 8));
  document.querySelectorAll('#st-beats i').forEach((el, i) => el.classList.toggle('on', i === Math.floor((step % 8) / 2)));
  document.querySelectorAll('.gnode').forEach(node => {
    const on = node.dataset.section === item.sectionId;
    node.classList.toggle('play', on);
    if (on) node.querySelectorAll('.cb').forEach((c, i) => c.classList.toggle('lit', i === item.localIndex));
  });
}

let viewInitialized = false;
export function applyView(state) {
  currentState = state;
  if (!viewInitialized) {
    viewInitialized = true;
    const savedView = storage.get(viewKey);
    document.body.dataset.view = savedView || (filledSections(state).length > 0 ? 'stage' : 'constructor');
  }
  if (document.body.dataset.view === 'stage') renderStage(state);
}
export function setView(view, state) {
  storage.set(viewKey, view);
  document.body.dataset.view = view;
  if (view === 'stage' && currentState) renderStage(currentState);
}

export { $, CHORDS, PATTERNS };
