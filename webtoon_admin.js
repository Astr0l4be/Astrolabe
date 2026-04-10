function weepPreviewMusique(input) {
  const preview = document.getElementById('weep-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}
function wtEpPreviewMusique(input) {
  const preview = document.getElementById('wt-ep-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

/* ============================================================
   WEBTOON_ADMIN.JS — Astrolabe
   ============================================================ */

/* ══════════════════════════════════════════════════════
   CRÉATION D'UN WEBTOON
   ══════════════════════════════════════════════════════ */

let _wtCoverFile = null;
let _wtBannerFile = null;
let _wtTags = [], _wtTws = [];

function wtPreviewCover(input) {
  _wtCoverFile = input.files[0];
  const zone = document.getElementById('wt-cover-zone');
  if (_wtCoverFile) {
    const url = URL.createObjectURL(_wtCoverFile);
    zone.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><input type="file" accept="image/*" onchange="wtPreviewCover(this)" style="position:absolute;inset:0;opacity:0;cursor:pointer">`;
  }
}

function wtPreviewBanner(input) {
  _wtBannerFile = input.files[0];
  const zone = document.getElementById('wt-banner-zone');
  if (_wtBannerFile) {
    const url = URL.createObjectURL(_wtBannerFile);
    zone.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><input type="file" accept="image/*" onchange="wtPreviewBanner(this)" style="position:absolute;inset:0;opacity:0;cursor:pointer">`;
  }
}

async function creerWebtoon() {
  const alertEl = document.getElementById('alert-wt-form');
  alertEl.textContent = ''; alertEl.className = 'alert';

  const titre = document.getElementById('wt-titre').value.trim();
  const resume = document.getElementById('wt-resume').value.trim();
  const gratuitJusquau = parseInt(document.getElementById('wt-gratuit').value) || 3;
  const prixTicket = parseInt(document.getElementById('wt-prix').value) || 1;

  if (!titre) {
    alertEl.textContent = 'Le titre est obligatoire.';
    alertEl.className = 'alert alert-error'; return;
  }

  const btn = document.getElementById('wt-creer-btn');
  btn.disabled = true; btn.textContent = 'Création en cours…';

  let coverUrl = null, bannerUrl = null;
  try {
    if (_wtCoverFile) coverUrl = await uploadImage(_wtCoverFile, 'covers');
    if (_wtBannerFile) bannerUrl = await uploadImage(_wtBannerFile, 'banners');
  } catch(e) {
    alertEl.textContent = 'Erreur upload image : ' + e.message;
    alertEl.className = 'alert alert-error';
    btn.disabled = false; btn.textContent = '✦ Créer le webtoon'; return;
  }

  const auteurLabel = document.getElementById('wt-auteur-label')?.textContent || '';
  const _wtAgeVal = document.getElementById('wt-age-val').value;

  const { data, error } = await db.from('histoires').insert({
    titre, resume,
    cover_url: coverUrl, banner_url: bannerUrl,
    auteur_pseudo: (auteurLabel === '— Choisir un·e auteur·ice —') ? '' : auteurLabel,
    format: 'webtoon',
    statut: document.getElementById('wt-statut').value || 'en-cours',
    gratuit_jusqu_au: gratuitJusquau,
    prix_ticket: prixTicket,
    adulte: _wtAgeVal === 'adulte',
    adapte_moins18: _wtAgeVal === 'moins18' || _wtAgeVal === 'adulte',
    adapte_moins16: _wtAgeVal === 'tout',
  }).select().single();

  btn.disabled = false; btn.textContent = '✦ Créer le webtoon';

  if (error) {
    alertEl.textContent = 'Erreur : ' + error.message;
    alertEl.className = 'alert alert-error'; return;
  }

  for (const tagNom of _wtTags) {
    let { data: tag } = await db.from('tags').select('id').eq('nom', tagNom).single();
    if (!tag) { const { data: nt } = await db.from('tags').insert({ nom: tagNom }).select().single(); tag = nt; }
    if (tag) await db.from('histoires_tags').insert({ histoire_id: data.id, tag_id: tag.id });
  }
  for (const tw of _wtTws) {
    await db.from('trigger_warnings_histoires').insert({ histoire_id: data.id, contenu: tw });
  }

  alertEl.textContent = '✦ Webtoon créé avec succès !';
  alertEl.className = 'alert alert-success';

  // Reset complet du formulaire
  document.getElementById('wt-titre').value = '';
  document.getElementById('wt-resume').value = '';
  document.getElementById('wt-gratuit').value = '3';
  document.getElementById('wt-prix').value = '1';

  // Reset cover zone
  _wtCoverFile = null;
  document.getElementById('wt-cover-zone').innerHTML = '<input type="file" accept="image/*" onchange="wtPreviewCover(this)"><div class="img-upload-text">📎 Cliquer ou glisser</div>';

  // Reset banner zone
  _wtBannerFile = null;
  document.getElementById('wt-banner-zone').innerHTML = '<input type="file" accept="image/*" onchange="wtPreviewBanner(this)"><div class="img-upload-text">📎 Cliquer ou glisser</div>';

  // Reset auteur
  document.getElementById('wt-auteur').value = '';
  document.getElementById('wt-auteur-label').textContent = '— Choisir un·e auteur·ice —';

  // Reset tags et TW
  _wtTags = []; _wtTws = [];
  renderWTTags(); renderWTTws();

  // Reset boutons statut et âge
  setWTStatut('en-cours'); setWTAge('tout');

  // Recharger les suggestions et la liste
  loadWTTagsSuggestions();
  loadWebtoonPublies();
  loadWTHistoireSelect();
}

/* ══════════════════════════════════════════════════════
   LISTE DES WEBTOONS
   ══════════════════════════════════════════════════════ */

let _allWebtoons = [];
let _currentFilterWT = 'all';

async function loadWebtoonPublies() {
  const liste = document.getElementById('wt-publiees-liste');
  if (!liste) return;
  liste.innerHTML = '<div class="loading"><span class="spinner"></span>Chargement…</div>';
  const { data } = await db.from('histoires').select('id, titre, statut, cover_url').eq('format', 'webtoon').order('created_at', { ascending: false });
  _allWebtoons = data || [];
  renderWebtoonListe();
}

function filterWT(filtre, btn) {
  _currentFilterWT = filtre;
  document.querySelectorAll('.filter-btn-wt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderWebtoonListe();
}

function renderWebtoonListe() {
  const liste = document.getElementById('wt-publiees-liste');
  if (!liste) return;
  let filtered = _allWebtoons;
  if (_currentFilterWT !== 'all') filtered = _allWebtoons.filter(h => h.statut === _currentFilterWT);
  if (!filtered.length) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucun webtoon ici.</div>';
    return;
  }
  liste.innerHTML = filtered.map(h => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--glass-border)">
      ${h.cover_url ? `<img src="${h.cover_url}" style="width:40px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0">` : '<div style="width:40px;height:60px;background:var(--glass);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">📱</div>'}
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text);margin-bottom:4px">${h.titre}</div>
        <div style="font-size:11px;color:var(--text3)">${h.statut}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button onclick="ouvrirPopupEditWT('${h.id}')" style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">✏️ Modifier</button>
        <button onclick="voirEpisodesWT('${h.id}', '${h.titre.replace(/'/g, "\\'")}')" style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">Épisodes</button>
        <button onclick="ouvrirPopupSupprWT('${h.id}')" style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">🗑</button>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   ÉPISODES
   ══════════════════════════════════════════════════════ */

async function voirEpisodesWT(histoireId, titre) {
  const card = document.getElementById('wt-episodes-card');
  const titreEl = document.getElementById('wt-episodes-titre');
  if (titreEl) titreEl.textContent = 'Épisodes — ' + titre;
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  await loadWTEpisodes(histoireId);
}

async function loadWTEpisodes(histoireIdParam) {
  const histoireId = histoireIdParam || document.getElementById('wt-ep-histoire').value;
  const liste = document.getElementById('wt-episodes-liste');
  if (!liste) return;
  if (!histoireId) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Sélectionne un webtoon.</div>';
    return;
  }

  const { data } = await db.from('chapitres').select('id, numero, titre, gratuit, date_publication')
    .eq('histoire_id', histoireId).order('numero');

  if (!data || !data.length) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucun épisode pour l\'instant.</div>';
    // Remettre le numéro à 1 si aucun épisode
    const numInput = document.getElementById('wt-ep-num');
    if (numInput && document.getElementById('wt-ep-histoire').value === histoireId) numInput.value = 1;
    return;
  }

  window._wtEpisodesHistoireId = histoireId;

  // Mettre à jour le numéro suivant si ce webtoon est sélectionné dans le form
  const numInput = document.getElementById('wt-ep-num');
  if (numInput && document.getElementById('wt-ep-histoire').value === histoireId) {
    numInput.value = Math.max(...data.map(ep => ep.numero)) + 1;
  }

  liste.innerHTML = data.map(ep => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
      <div>
        <div style="font-size:13px;color:var(--text)">Épisode ${ep.numero} — ${ep.titre || 'Sans titre'}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${ep.gratuit ? 'Gratuit' : '🎟 Ticket'}${ep.date_publication && new Date(ep.date_publication) > new Date() ? ' · <span style="color:var(--accent)">⏰ ' + new Date(ep.date_publication).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) + ' à ' + new Date(ep.date_publication).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) + '</span>' : ''}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="ouvrirPopupEditWTEp('${ep.id}', '${histoireId}', ${ep.numero}, '${(ep.titre||'').replace(/'/g,"\\'")}', ${ep.gratuit})" style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">✏️</button>
        <button onclick="supprimerEpisodeWT('${ep.id}', '${histoireId}', ${ep.numero})" style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">🗑</button>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   AJOUT D'UN ÉPISODE
   ══════════════════════════════════════════════════════ */

let _wtEpFichiers = [];

function wtAjouterStrips(input) {
  const nouveaux = Array.from(input.files).sort((a, b) => a.name.localeCompare(b.name));
  _wtEpFichiers = _wtEpFichiers.concat(nouveaux);
  input.value = '';
  wtRendreStrips();
}

function wtViderStrips() {
  _wtEpFichiers = [];
  wtRendreStrips();
}

function wtSupprimerStrip(idx) {
  _wtEpFichiers.splice(idx, 1);
  wtRendreStrips();
}

function wtRendreStrips() {
  const preview = document.getElementById('wt-ep-preview');
  const count = document.getElementById('wt-ep-count');
  const vider = document.getElementById('wt-ep-vider');
  if (!preview) return;
  preview.innerHTML = _wtEpFichiers.map((f, i) => {
    const url = URL.createObjectURL(f);
    return `<div draggable="true" data-idx="${i}" style="position:relative;cursor:grab">
      <img src="${url}" style="height:80px;width:auto;border-radius:4px;object-fit:cover;display:block;pointer-events:none">
      <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;pointer-events:none">${i+1}</span>
      <button onclick="wtSupprimerStrip(${i})" style="position:absolute;top:2px;right:2px;background:rgba(200,60,60,.8);border:none;color:#fff;font-size:10px;width:16px;height:16px;border-radius:50%;cursor:pointer;padding:0;line-height:1">×</button>
    </div>`;
  }).join('');
  if (count) count.textContent = _wtEpFichiers.length + ' image(s)';
  if (vider) vider.style.display = _wtEpFichiers.length > 0 ? 'inline-block' : 'none';
  _wtInitDragDrop(preview);
}

let _wtDragIdx = null;
function _wtInitDragDrop(container) {
  container.querySelectorAll('[draggable]').forEach(el => {
    el.addEventListener('dragstart', e => { _wtDragIdx = parseInt(el.dataset.idx); el.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', () => { el.style.opacity = '1'; });
    el.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    el.addEventListener('drop', e => {
      e.preventDefault();
      const targetIdx = parseInt(el.dataset.idx);
      if (_wtDragIdx === null || _wtDragIdx === targetIdx) return;
      const moved = _wtEpFichiers.splice(_wtDragIdx, 1)[0];
      _wtEpFichiers.splice(targetIdx, 0, moved);
      _wtDragIdx = null;
      wtRendreStrips();
    });
  });
}

async function ajouterEpisodeWT() {
  const alertEl = document.getElementById('alert-wt-form');
  alertEl.textContent = ''; alertEl.className = 'alert';

  const histoireId = document.getElementById('wt-ep-histoire').value;
  const num = parseInt(document.getElementById('wt-ep-num').value);
  const titre = document.getElementById('wt-ep-titre').value.trim();
  const gratuit = document.getElementById('wt-ep-gratuit').value === 'true';
  const _epDateVal = document.getElementById('wt-ep-date-publication').value;
  const epDatePub = _epDateVal ? new Date(_epDateVal).toISOString() : null;
  const _wtMusiqueFile = document.getElementById('wt-ep-musique-file')?.files[0] || null;
  const files = _wtEpFichiers.slice();

  if (!histoireId) { alertEl.textContent = 'Sélectionne un webtoon.'; alertEl.className = 'alert alert-error'; return; }
  if (!num || num < 1) { alertEl.textContent = 'Numéro d\'épisode invalide.'; alertEl.className = 'alert alert-error'; return; }
  if (!files.length) { alertEl.textContent = 'Sélectionne au moins une image.'; alertEl.className = 'alert alert-error'; return; }

  const btn = document.getElementById('wt-ep-btn');
  const progress = document.getElementById('wt-ep-progress');
  btn.disabled = true;
  progress.style.display = 'block';

  const epTwStr = _wtEpTws.length ? _wtEpTws.join(', ') : null;
  let _wtMusiqueUrl = null;
  if (_wtMusiqueFile) { try { _wtMusiqueUrl = await uploadAudio(_wtMusiqueFile, 'musiques'); } catch(e) {} }
  const { data: chap, error: chapErr } = await db.from('chapitres').insert({
    histoire_id: histoireId, numero: num, titre: titre || `Épisode ${num}`,
    gratuit, contenu: null, date_publication: epDatePub, tw: epTwStr, musique_url: _wtMusiqueUrl
  }).select().single();

  if (chapErr) {
    alertEl.textContent = 'Erreur création épisode : ' + chapErr.message;
    alertEl.className = 'alert alert-error';
    btn.disabled = false; progress.style.display = 'none'; return;
  }

  const imageUrls = [];
  for (let i = 0; i < files.length; i++) {
    progress.textContent = `Upload image ${i+1} / ${files.length}…`;
    try {
      const url = await uploadImage(files[i], `webtoon/${histoireId}/ep${num}`);
      imageUrls.push({ histoire_id: histoireId, chapitre_num: num, ordre: i, image_url: url });
    } catch(e) {
      alertEl.textContent = `Erreur upload image ${i+1} : ` + e.message;
      alertEl.className = 'alert alert-error';
      btn.disabled = false; progress.style.display = 'none'; return;
    }
  }

  const { error: imgErr } = await db.from('episodes_images').insert(imageUrls);
  btn.disabled = false; progress.style.display = 'none';

  if (imgErr) {
    alertEl.textContent = 'Erreur enregistrement images : ' + imgErr.message;
    alertEl.className = 'alert alert-error'; return;
  }

  alertEl.textContent = `✦ Épisode ${num} publié avec ${files.length} image(s) !`;
  alertEl.className = 'alert alert-success';
  _wtEpFichiers = []; wtRendreStrips();
  _wtEpTws = []; renderWTEpTws();
  document.getElementById('wt-ep-titre').value = '';
  document.getElementById('wt-ep-date-publication').value = '';
  const _wtMusiqueFileEl = document.getElementById('wt-ep-musique-file'); if (_wtMusiqueFileEl) _wtMusiqueFileEl.value = '';
  const _wtMusiquePreviewEl = document.getElementById('wt-ep-musique-preview'); if (_wtMusiquePreviewEl) _wtMusiquePreviewEl.style.display = 'none';
  setWTEpAcces(true);
  loadWTEpisodes(histoireId);
}

async function supprimerEpisodeWT(chapId, histoireId, chapNum) {
  if (!confirm('Supprimer cet épisode et toutes ses images ?')) return;
  await db.from('episodes_images').delete().eq('histoire_id', histoireId).eq('chapitre_num', chapNum);
  await db.from('chapitres').delete().eq('id', chapId);
  loadWTEpisodes(histoireId);
}

/* ══════════════════════════════════════════════════════
   SÉLECTION WEBTOON POUR ÉPISODE (mise à jour numéro auto)
   ══════════════════════════════════════════════════════ */

async function loadWTHistoireSelect() {
  const { data: wts } = await db.from('histoires').select('id, titre').eq('format', 'webtoon').order('titre');
  const histMenu = document.getElementById('wt-dropdown-ep-histoire-menu');
  if (histMenu) {
    histMenu.innerHTML = wts && wts.length
      ? wts.map(h => `<div class="ban-dropdown-item" data-id="${h.id}" onclick="wtPickHistoire(this)">${h.titre}</div>`).join('')
      : '<div class="ban-dropdown-item" style="opacity:.5">Aucun webtoon créé</div>';
  }
}

async function wtPickHistoire(el) {
  document.getElementById('wt-ep-histoire').value = el.dataset.id;
  document.getElementById('wt-ep-histoire-label').textContent = el.textContent.trim();
  document.querySelectorAll('#wt-dropdown-ep-histoire-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('wt-dropdown-ep-histoire').classList.remove('open');
  // Charger les épisodes existants et mettre le numéro suivant
  const histoireId = el.dataset.id;
  const { data } = await db.from('chapitres').select('numero').eq('histoire_id', histoireId).order('numero');
  const numInput = document.getElementById('wt-ep-num');
  if (numInput) {
    numInput.value = data && data.length ? Math.max(...data.map(c => c.numero)) + 1 : 1;
  }
}

async function loadWTAuteursSelect() {
  const { data } = await db.from('auteurs').select('id, pseudo').order('pseudo');
  const menu = document.getElementById('wt-dropdown-auteur-menu');
  if (menu && data) {
    menu.innerHTML = '<div class="ban-dropdown-item" data-id="" onclick="wtPickAuteur(this)">— Aucun·e —</div>' +
      data.map(a => `<div class="ban-dropdown-item" data-id="${a.id}" onclick="wtPickAuteur(this)">${a.pseudo}</div>`).join('');
  }
}

function wtPickAuteur(el) {
  document.getElementById('wt-auteur').value = el.dataset.id;
  document.getElementById('wt-auteur-label').textContent = el.textContent.trim();
  document.querySelectorAll('#wt-dropdown-auteur-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('wt-dropdown-auteur').classList.remove('open');
}

/* ══════════════════════════════════════════════════════
   MODIFIER UN WEBTOON
   ══════════════════════════════════════════════════════ */

let _ewtData = null;
let _ewtTags = [], _ewtTws = [];

async function ouvrirPopupEditWT(id) {
  const { data: h } = await db.from('histoires').select('*').eq('id', id).single();
  if (!h) return;
  _ewtData = h;
  document.getElementById('ewt-id').value = id;
  document.getElementById('ewt-titre').value = h.titre || '';
  document.getElementById('ewt-resume').value = h.resume || '';
  document.getElementById('ewt-gratuit').value = h.gratuit_jusqu_au || 3;
  setEWTStatut(h.statut || 'en-cours');
  const ageVal = h.adulte ? 'adulte' : h.adapte_moins18 ? 'moins18' : 'tout';
  setEWTAge(ageVal);

  const { data: htags } = await db.from('histoires_tags').select('tags(nom)').eq('histoire_id', id);
  const { data: htws } = await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id', id);
  _ewtTags = (htags || []).map(t => t.tags?.nom).filter(Boolean);
  _ewtTws = (htws || []).map(t => t.contenu);
  renderEWTTags(); renderEWTTws();

  const { data: allTags } = await db.from('tags').select('nom').order('nom');
  const { data: allTws } = await db.from('trigger_warnings_histoires').select('contenu');
  const uniqTws = [...new Set((allTws||[]).map(t=>t.contenu))];
  const sugT = document.getElementById('ewt-tags-suggestions');
  if (sugT) sugT.innerHTML = (allTags||[]).map(t => {
    const cls = _ewtTags.includes(t.nom) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    return `<button class="${cls}" style="font-size:11px" onclick="toggleEWTTagSug('${t.nom.replace(/'/g,"\\'")}')">✦ ${t.nom}</button>`;
  }).join('');
  const sugW = document.getElementById('ewt-tw-suggestions');
  if (sugW) sugW.innerHTML = uniqTws.map(t => {
    const cls = _ewtTws.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    return `<button class="${cls}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEWTTwSug('${t.replace(/'/g,"\\'")}')">✦ ${t}</button>`;
  }).join('');

  document.getElementById('popup-edit-wt').style.display = 'flex';
}

function fermerPopupEditWT() { document.getElementById('popup-edit-wt').style.display = 'none'; _ewtData = null; }
function toggleEWTTagSug(val) { if (_ewtTags.includes(val)) _ewtTags.splice(_ewtTags.indexOf(val),1); else _ewtTags.push(val); renderEWTTags(); ouvrirPopupEditWT(document.getElementById('ewt-id').value); }
function toggleEWTTwSug(val) { if (_ewtTws.includes(val)) _ewtTws.splice(_ewtTws.indexOf(val),1); else _ewtTws.push(val); renderEWTTws(); ouvrirPopupEditWT(document.getElementById('ewt-id').value); }

async function sauvegarderWT() {
  const id = document.getElementById('ewt-id').value;
  const titre = document.getElementById('ewt-titre').value.trim();
  if (!titre) { alert('Le titre est obligatoire.'); return; }
  const btn = document.getElementById('ewt-save-btn');
  btn.textContent = 'Sauvegarde…'; btn.disabled = true;
  try {
    let coverUrl = _ewtData?.cover_url || null;
    let bannerUrl = _ewtData?.banner_url || null;
    const coverFile = document.getElementById('ewt-cover-input')?.files[0];
    const bannerFile = document.getElementById('ewt-banner-input')?.files[0];
    if (coverFile) coverUrl = await uploadImage(coverFile, 'covers');
    if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banners');
    const _eAgeVal = document.getElementById('ewt-age-val').value;
    await db.from('histoires').update({
      titre, resume: document.getElementById('ewt-resume').value.trim() || null,
      statut: document.getElementById('ewt-statut').value,
      gratuit_jusqu_au: parseInt(document.getElementById('ewt-gratuit').value) || 3,
      cover_url: coverUrl, banner_url: bannerUrl,
      adulte: _eAgeVal === 'adulte',
      adapte_moins18: _eAgeVal === 'moins18' || _eAgeVal === 'adulte',
      adapte_moins16: _eAgeVal === 'tout',
    }).eq('id', id);
    await db.from('histoires_tags').delete().eq('histoire_id', id);
    for (const tagNom of _ewtTags) {
      let { data: tag } = await db.from('tags').select('id').eq('nom', tagNom).single();
      if (!tag) { const { data: nt } = await db.from('tags').insert({ nom: tagNom }).select().single(); tag = nt; }
      if (tag) await db.from('histoires_tags').insert({ histoire_id: id, tag_id: tag.id });
    }
    await db.from('trigger_warnings_histoires').delete().eq('histoire_id', id);
    for (const tw of _ewtTws) await db.from('trigger_warnings_histoires').insert({ histoire_id: id, contenu: tw });
    fermerPopupEditWT(); loadWebtoonPublies(); showAlert('wt', '✦ Webtoon modifié avec succès !');
  } catch(e) { alert('Erreur : ' + e.message); }
  finally { btn.textContent = '✦ Sauvegarder'; btn.disabled = false; }
}

/* ══════════════════════════════════════════════════════
   MODIFIER UN ÉPISODE
   ══════════════════════════════════════════════════════ */

let _weepTws = [];

async function ouvrirPopupEditWTEp(chapId, histoireId, num, titre, gratuit) {
  document.getElementById('weep-id').value = chapId;
  document.getElementById('weep-histoire-id').value = histoireId;
  document.getElementById('weep-ancien-num').value = num;
  document.getElementById('weep-num').value = num;
  document.getElementById('weep-titre').value = titre || '';
  setWEEPGratuit(gratuit === true || gratuit === 'true');

  const { data: epChap } = await db.from('chapitres').select('tw, date_publication, musique_url').eq('id', chapId).single();
  _weepTws = epChap?.tw ? epChap.tw.split(',').map(t=>t.trim()).filter(Boolean) : [];
  renderWEEPTws();
  document.getElementById('weep-date-publication').value = epChap?.date_publication ? _isoToDatetimeLocal(epChap.date_publication) : '';
  // Musique actuelle
  const _weepMusiqueUrl = epChap?.musique_url || null;
  document.getElementById('weep-musique-url').value = _weepMusiqueUrl || '';
  const _weepMusiqueActuelle = document.getElementById('weep-musique-actuelle');
  if (_weepMusiqueActuelle) {
    if (_weepMusiqueUrl) { _weepMusiqueActuelle.textContent = '🎵 ' + _weepMusiqueUrl.split('/').pop(); _weepMusiqueActuelle.style.display = 'block'; }
    else { _weepMusiqueActuelle.style.display = 'none'; }
  }
  const _weepMusiqueFile = document.getElementById('weep-musique-file');
  if (_weepMusiqueFile) _weepMusiqueFile.value = '';
  const _weepMusiquePreview = document.getElementById('weep-musique-preview');
  if (_weepMusiquePreview) _weepMusiquePreview.style.display = 'none';

  // Suggestions TW
  await loadWTEpTwSuggestions('weep');

  const { data: strips } = await db.from('episodes_images')
    .select('ordre, image_url').eq('histoire_id', histoireId).eq('chapitre_num', num).order('ordre');
  const stripsEl = document.getElementById('weep-strips-actuels');
  if (stripsEl) {
    stripsEl.innerHTML = strips && strips.length
      ? strips.map((s, i) => `<div style="position:relative"><img src="${s.image_url}" style="height:60px;width:auto;border-radius:4px;object-fit:cover"><span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px">${i+1}</span><button onclick="weepSupprimerStrip('${s.image_url}','${histoireId}',${num},this)" style="position:absolute;top:2px;right:2px;background:rgba(200,60,60,.8);border:none;color:#fff;font-size:10px;width:16px;height:16px;border-radius:50%;cursor:pointer;padding:0;line-height:1">×</button></div>`).join('')
      : '<span style="font-size:11px;color:var(--text3)">Aucune image.</span>';
  }
  document.getElementById('popup-edit-wt-ep').style.display = 'flex';
}

async function weepSupprimerStrip(imageUrl, histoireId, chapNum, btn) {
  if (!confirm('Supprimer cette image ?')) return;
  await db.from('episodes_images').delete().eq('histoire_id', histoireId).eq('chapitre_num', chapNum).eq('image_url', imageUrl);
  btn.closest('div').remove();
}

function weepPreviewAjout(input) {
  const preview = document.getElementById('weep-preview');
  const countEl = document.getElementById('weep-ajout-count');
  const files = Array.from(input.files).sort((a,b) => a.name.localeCompare(b.name));
  preview.innerHTML = files.map((f, i) => { const url = URL.createObjectURL(f); return `<div style="position:relative"><img src="${url}" style="height:60px;width:auto;border-radius:4px;object-fit:cover"><span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px">+${i+1}</span></div>`; }).join('');
  if (countEl) countEl.textContent = files.length ? files.length + ' image(s) à ajouter' : '';
}

function setWEEPGratuit(val) {
  document.getElementById('weep-gratuit').value = String(val);
  document.getElementById('weep-gratuit-btn').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('weep-payant-btn').className = 'btn' + (val ? '' : ' btn-accent');
}
function fermerPopupEditWTEp() { document.getElementById('popup-edit-wt-ep').style.display = 'none'; }

async function sauvegarderEpisodeWT() {
  const chapId = document.getElementById('weep-id').value;
  const histoireId = document.getElementById('weep-histoire-id').value;
  const ancienNum = parseInt(document.getElementById('weep-ancien-num').value);
  const nouveauNum = parseInt(document.getElementById('weep-num').value);
  const titre = document.getElementById('weep-titre').value.trim();
  const gratuit = document.getElementById('weep-gratuit').value === 'true';
  const _weepDateVal = document.getElementById('weep-date-publication').value;
  const weepDatePub = _weepDateVal ? new Date(_weepDateVal).toISOString() : null;
  const files = Array.from(document.getElementById('weep-images').files).sort((a,b) => a.name.localeCompare(b.name));
  const btn = document.getElementById('weep-save-btn');
  const progress = document.getElementById('weep-progress');
  btn.disabled = true; btn.textContent = 'Sauvegarde…';
  try {
    const weepTwStr = _weepTws.length ? _weepTws.join(', ') : null;
    const _weepMusiqueNewFile = document.getElementById('weep-musique-file')?.files[0] || null;
    let _weepMusiqueUrl = document.getElementById('weep-musique-url')?.value || null;
    if (_weepMusiqueNewFile) { try { _weepMusiqueUrl = await uploadAudio(_weepMusiqueNewFile, 'musiques'); } catch(e) { alert('Erreur upload musique : ' + e.message); btn.disabled=false; btn.textContent='✦ Sauvegarder'; return; } }
    await db.from('chapitres').update({ numero: nouveauNum, titre: titre || `Épisode ${nouveauNum}`, gratuit, date_publication: weepDatePub, tw: weepTwStr, musique_url: _weepMusiqueUrl || null }).eq('id', chapId);
    if (nouveauNum !== ancienNum) await db.from('episodes_images').update({ chapitre_num: nouveauNum }).eq('histoire_id', histoireId).eq('chapitre_num', ancienNum);
    if (files.length > 0) {
      progress.style.display = 'block';
      const { data: existantes } = await db.from('episodes_images').select('ordre').eq('histoire_id', histoireId).eq('chapitre_num', nouveauNum).order('ordre', { ascending: false }).limit(1);
      const ordreDepart = existantes && existantes.length ? existantes[0].ordre + 1 : 0;
      const imageUrls = [];
      for (let i = 0; i < files.length; i++) {
        progress.textContent = `Upload image ${i+1} / ${files.length}…`;
        const url = await uploadImage(files[i], `webtoon/${histoireId}/ep${nouveauNum}`);
        imageUrls.push({ histoire_id: histoireId, chapitre_num: nouveauNum, ordre: ordreDepart + i, image_url: url });
      }
      await db.from('episodes_images').insert(imageUrls);
    }
    fermerPopupEditWTEp(); loadWTEpisodes(); showAlert('wt', '✦ Épisode modifié !');
  } catch(e) { alert('Erreur : ' + e.message); }
  finally { btn.textContent = '✦ Sauvegarder'; btn.disabled = false; progress.style.display = 'none'; }
}

/* ══════════════════════════════════════════════════════
   SUPPRIMER UN WEBTOON
   ══════════════════════════════════════════════════════ */

let _wtASupprimer = null;
function ouvrirPopupSupprWT(id) { _wtASupprimer = id; document.getElementById('popup-suppr-wt').style.display = 'flex'; }
function fermerPopupSupprWT() { document.getElementById('popup-suppr-wt').style.display = 'none'; _wtASupprimer = null; }
async function confirmerSupprWT() {
  if (!_wtASupprimer) return;
  const id = _wtASupprimer;
  const { data: chaps } = await db.from('chapitres').select('id,numero').eq('histoire_id', id);
  for (const ch of (chaps || [])) await db.from('episodes_images').delete().eq('histoire_id', id).eq('chapitre_num', ch.numero);
  await db.from('chapitres').delete().eq('histoire_id', id);
  await db.from('histoires').delete().eq('id', id);
  fermerPopupSupprWT(); loadWebtoonPublies(); showAlert('wt', 'Webtoon supprimé.');
}

/* ══════════════════════════════════════════════════════
   TAGS, TW, STATUT, ÂGE
   ══════════════════════════════════════════════════════ */

function handleWTTagInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_wtTags.includes(v)) { _wtTags.push(v); renderWTTags(); } e.target.value = ''; }
function renderWTTags() {
  const wrap = document.getElementById('wt-tags-wrap');
  const input = document.getElementById('wt-tags-input');
  if (!wrap) return;
  const chips = _wtTags.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.innerHTML = `${t}<button onclick="_wtTags.splice(${i},1);renderWTTags()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips;
  wrap.appendChild(input);
}
function handleWTTwInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_wtTws.includes(v)) { _wtTws.push(v); renderWTTws(); } e.target.value = ''; }
function renderWTTws() {
  const wrap = document.getElementById('wt-tw-wrap');
  const input = document.getElementById('wt-tw-input');
  if (!wrap) return;
  const chips = _wtTws.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)'; d.innerHTML = `${t}<button onclick="_wtTws.splice(${i},1);renderWTTws()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips;
  wrap.appendChild(input);
}
function setWTEpAcces(val) {
  document.getElementById('wt-ep-gratuit').value = String(val);
  document.getElementById('wt-ep-gratuit-btn').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('wt-ep-payant-btn').className = 'btn' + (val ? '' : ' btn-accent');
}

function setWTStatut(val) {
  document.getElementById('wt-statut').value = val;
  ['encours','brouillon','pause','termine'].forEach(s => { const key = s === 'encours' ? 'en-cours' : s; const btn = document.getElementById('wt-s-' + s); if (btn) btn.className = 'btn' + (val === key ? ' btn-accent' : ''); });
}
function setWTAge(val) {
  document.getElementById('wt-age-val').value = val;
  ['tout','moins18','adulte'].forEach(s => { const btn = document.getElementById('wt-age-' + s); if (btn) btn.className = 'btn' + (val === s ? ' btn-accent' : ''); });
}

function handleEWTTagInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_ewtTags.includes(v)) { _ewtTags.push(v); renderEWTTags(); } e.target.value = ''; }
function renderEWTTags() {
  const wrap = document.getElementById('ewt-tags-wrap'); const input = document.getElementById('ewt-tags-input'); if (!wrap) return;
  const chips = _ewtTags.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.innerHTML = `${t}<button onclick="_ewtTags.splice(${i},1);renderEWTTags()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips; wrap.appendChild(input);
}
function handleEWTTwInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_ewtTws.includes(v)) { _ewtTws.push(v); renderEWTTws(); } e.target.value = ''; }
function renderEWTTws() {
  const wrap = document.getElementById('ewt-tw-wrap'); const input = document.getElementById('ewt-tw-input'); if (!wrap) return;
  const chips = _ewtTws.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)'; d.innerHTML = `${t}<button onclick="_ewtTws.splice(${i},1);renderEWTTws()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips; wrap.appendChild(input);
}
function setEWTStatut(val) {
  document.getElementById('ewt-statut').value = val;
  ['encours','pause','termine','brouillon'].forEach(s => { const key = s === 'encours' ? 'en-cours' : s; const btn = document.getElementById('ewt-s-' + s); if (btn) btn.className = 'btn' + (val === key ? ' btn-accent' : ''); });
}
function setEWTAge(val) {
  document.getElementById('ewt-age-val').value = val;
  ['tout','moins18','adulte'].forEach(s => { const btn = document.getElementById('ewt-age-' + s); if (btn) btn.className = 'btn' + (val === s ? ' btn-accent' : ''); });
}

// TW épisodes
let _wtEpTws = [];
function handleWTEpTwInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_wtEpTws.includes(v)) { _wtEpTws.push(v); renderWTEpTws(); } e.target.value = ''; }
function renderWTEpTws() {
  const wrap = document.getElementById('wt-ep-tw-wrap'); const input = document.getElementById('wt-ep-tw-input'); if (!wrap || !input) return;
  const chips = _wtEpTws.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)'; d.innerHTML = t + `<button onclick="_wtEpTws.splice(${i},1);renderWTEpTws()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips; wrap.appendChild(input);
}
function handleWEEPTwInput(e) { if (e.key !== 'Enter' && e.key !== ',') return; e.preventDefault(); const v = e.target.value.trim(); if (v && !_weepTws.includes(v)) { _weepTws.push(v); renderWEEPTws(); } e.target.value = ''; }
function renderWEEPTws() {
  const wrap = document.getElementById('weep-tw-wrap'); const input = document.getElementById('weep-tw-input'); if (!wrap || !input) return;
  const chips = _weepTws.map((t, i) => { const d = document.createElement('div'); d.className = 'tag-chip'; d.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)'; d.innerHTML = t + `<button onclick="_weepTws.splice(${i},1);renderWEEPTws()">×</button>`; return d.outerHTML; }).join('');
  wrap.innerHTML = chips; wrap.appendChild(input);
}

/* ══════════════════════════════════════════════════════
   SUGGESTIONS TAGS & TW
   ══════════════════════════════════════════════════════ */

async function loadWTTagsSuggestions() {
  const { data: allTags } = await db.from('tags').select('nom').order('nom');
  const { data: allTwsRaw } = await db.from('trigger_warnings_histoires').select('contenu');
  const uniqTws = [...new Set((allTwsRaw||[]).map(t=>t.contenu))];

  const sugT = document.getElementById('wt-tags-suggestions');
  if (sugT) sugT.innerHTML = (allTags||[]).map(t => {
    const cls = _wtTags.includes(t.nom) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    return `<button class="${cls}" style="font-size:11px" onclick="toggleWTTagSug('${t.nom.replace(/'/g,"\\'")}')">✦ ${t.nom}</button>`;
  }).join('');

  const sugW = document.getElementById('wt-tw-suggestions');
  if (sugW) sugW.innerHTML = uniqTws.map(t => {
    const cls = _wtTws.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    return `<button class="${cls}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleWTTwSug('${t.replace(/'/g,"\\'")}')">✦ ${t}</button>`;
  }).join('');
}

function toggleWTTagSug(val) { if (_wtTags.includes(val)) _wtTags.splice(_wtTags.indexOf(val),1); else _wtTags.push(val); renderWTTags(); loadWTTagsSuggestions(); }
function toggleWTTwSug(val) { if (_wtTws.includes(val)) _wtTws.splice(_wtTws.indexOf(val),1); else _wtTws.push(val); renderWTTws(); loadWTTagsSuggestions(); }

async function loadWTEpTwSuggestions(prefix) {
  const { data } = await db.from('trigger_warnings_histoires').select('contenu').order('contenu');
  const uniq = [...new Set((data||[]).map(t=>t.contenu))];
  const arr = prefix === 'wt-ep' ? _wtEpTws : _weepTws;
  const labelId = prefix + '-tw-suggestions-label';
  const containerId = prefix + '-tw-suggestions';
  const label = document.getElementById(labelId);
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!uniq.length) { if (label) label.style.display = 'none'; container.innerHTML = ''; return; }
  if (label) label.style.display = 'block';
  container.innerHTML = uniq.map(t => {
    const cls = arr.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    return `<button class="${cls}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleWTEpTwSug('${prefix}','${t.replace(/'/g,"\\'")}')">✦ ${t}</button>`;
  }).join('');
}
function toggleWTEpTwSug(prefix, val) {
  const arr = prefix === 'wt-ep' ? _wtEpTws : _weepTws;
  if (arr.includes(val)) arr.splice(arr.indexOf(val),1); else arr.push(val);
  if (prefix === 'wt-ep') renderWTEpTws(); else renderWEEPTws();
  loadWTEpTwSuggestions(prefix);
}
