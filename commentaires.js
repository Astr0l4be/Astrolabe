/* ============================================================
   COMMENTAIRES.JS — Astrolabe
   Système de commentaires par chapitre
   Fonctions : afficher, écrire, liker, répondre, signaler
   ============================================================ */

const COM_PAR_PAGE = 10;
let _comOffset = 0;
let _comHistoireId = null;
let _comChapNum = null;
let _comSignalementId = null;
let _comReponseParentId = null;
let _comReponseParentTexte = null;
let _pseudosAuteurs = null;
let _comTri = 'top';
let _comTopIds = [];
let _comASupprimer = null;
let _comEstSpicy = false; // true si le chapitre courant est lu en version spicy

/* ══════════════════════════════════════════════════════
   HELPER — résout les IDs selon le contexte (BD ou roman)
   ══════════════════════════════════════════════════════ */

let _comPrefix = 'com-'; // 'com-' pour roman, 'bd-com-' pour BD, 'wt-com-' pour webtoon

function _comEstBD() {
  return document.getElementById('p-bd')?.classList.contains('active');
}

function _comEstWebtoon() {
  return document.getElementById('p-webtoon')?.classList.contains('active');
}

function _comEstAudio() {
  return document.getElementById('p-audio')?.classList.contains('active');
}

function _comEl(id) {
  return document.getElementById(_comPrefix + id) || document.getElementById('com-' + id) || document.getElementById(id);
}

/* ══════════════════════════════════════════════════════
   INITIALISATION — appelée depuis openLecture()
   ══════════════════════════════════════════════════════ */

async function initCommentaires(histoireId, chapNum) {
  _comHistoireId = histoireId;
  _comChapNum = chapNum;
  _comOffset = 0;
  _comTri = 'top';

  // Définir le préfixe selon le contexte — stocké une fois pour éviter les problèmes de timing async
  if (_comEstWebtoon()) _comPrefix = 'wt-com-';
  else if (_comEstBD()) _comPrefix = 'bd-com-';
  else if (_comEstAudio()) _comPrefix = 'audio-com-';
  else _comPrefix = 'com-';

  // Détecter si on lit en version spicy
  const _b = typeof BOOKS !== 'undefined' ? BOOKS.find(x => x.id === histoireId) : null;
  const _ch = _b ? _b.chapitres.find(c => c.num === chapNum) : null;
  // Ce chapitre existe-t-il en version spicy ?
  const _chapAVersionSpicy = !!(_b && _ch && _b.adulte && _b.versionSoft && _ch.spicy);
  // Version réellement lue — priorité : choix explicite du chapitre > versionForcee > défaut global. Fallback sur soft (jamais spicy par défaut)
  const _versionLue = _chapAVersionSpicy
    ? ((window._versionsChoisies && window._versionsChoisies[chapNum])
       || window._versionForcee
       || window._versionDefautCourante
       || compte.versionDefaut
       || 'soft')
    : 'soft';
  _comEstSpicy = _chapAVersionSpicy && _versionLue === 'spicy';

  // Réinitialiser les cases à cocher
  ['tag-spoiler', 'tag-spicy'].forEach(suffix => {
    const cb = document.getElementById(_comPrefix + suffix);
    if (cb) cb.checked = false;
  });

  // Afficher/cacher les cases spoiler/spicy du formulaire
  const tagSpicyWrap = document.getElementById(_comPrefix + 'tag-spicy-wrap');
  if (tagSpicyWrap) tagSpicyWrap.style.display = _comEstSpicy ? 'inline-flex' : 'none';

  if (_pseudosAuteurs === null) {
    const { data: auteursData } = await db.from('auteurs').select('pseudo, user_id');
    _pseudosAuteurs = (auteursData || []).filter(a => a.user_id);
  }

  const formWrap = _comEl('form-wrap');
  const loginMsg = _comEl('login-msg');
  if (compte.loggedIn) {
    if (formWrap) formWrap.style.display = 'block';
    if (loginMsg) loginMsg.style.display = 'none';
  } else {
    if (formWrap) formWrap.style.display = 'none';
    if (loginMsg) loginMsg.style.display = 'flex';
  }

  const input = _comEl('input');
  if (input) { input.value = ''; if (input.id) _updateCharCount(input.id, input.id.replace('input','char-count')); }

  const liste = _comEl('liste');
  if (liste) liste.innerHTML = '';
  const loadMore = _comEl('load-more');
  if (loadMore) loadMore.style.display = 'none';

  _renderTriBoutons();
  await _chargerTopIds();
  await _chargerCommentaires(true);

  // Afficher le message spicy si la version lue est spicy
  const spicyMsg = document.getElementById('com-spicy-msg');
  if (spicyMsg) {
    const b = typeof BOOKS !== 'undefined' ? BOOKS.find(x => x.id === histoireId) : null;
    const ch = b ? b.chapitres.find(c => c.num === chapNum) : null;
    // Même logique que _comEstSpicy — on réutilise directement la variable déjà calculée
    spicyMsg.style.display = _comEstSpicy ? 'block' : 'none';
  }
}

function _renderTriBoutons() {
  const liste = _comEl('liste');
  if (!liste) return;
  const container = liste.parentElement;
  if (!container || container.querySelector('.com-tri-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'com-tri-bar';
  bar.innerHTML = `
    <button class="com-tri-btn actif" id="com-tri-top" onclick="event.preventDefault();changerTriCommentaires('top')">TOP</button>
    <button class="com-tri-btn" id="com-tri-recent" onclick="event.preventDefault();changerTriCommentaires('recent')">Le plus récent</button>
  `;
  container.insertBefore(bar, liste);
}

async function _chargerTopIds() {
  const { data } = await db
    .from('commentaires')
    .select('id')
    .eq('histoire_id', _comHistoireId)
    .eq('chapitre_num', _comChapNum)
    .is('parent_id', null)
    .eq('signale', false)
    .gt('nb_likes', 0)
    .order('nb_likes', { ascending: false })
    .limit(3);
  _comTopIds = (data || []).map(c => c.id);
}

async function changerTriCommentaires(tri) {
  _comTri = tri;
  const btnTop    = document.getElementById('com-tri-top');
  const btnRecent = document.getElementById('com-tri-recent');
  if (btnTop)    btnTop.classList.toggle('actif', tri === 'top');
  if (btnRecent) btnRecent.classList.toggle('actif', tri === 'recent');

  const liste = _comEl('liste');
  if (liste) {
    // Figer la hauteur actuelle pour éviter tout saut de layout
    liste.style.minHeight = liste.offsetHeight + 'px';
    liste.innerHTML = '';
  }
  await _chargerCommentaires(true);
  if (liste) liste.style.minHeight = '';
}

/* ══════════════════════════════════════════════════════
   CHARGEMENT
   ══════════════════════════════════════════════════════ */

async function _chargerCommentaires(reset = false) {
  const loading = _comEl('loading');
  if (loading) loading.style.display = 'block';

  if (reset) _comOffset = 0;

  let query = db
    .from('commentaires')
    .select('*, replies:commentaires!parent_id(*, user_id)')
    .eq('histoire_id', _comHistoireId)
    .eq('chapitre_num', _comChapNum)
    .is('parent_id', null)
    .eq('signale', false)
    .order('epingle', { ascending: false });

  // En version soft : exclure totalement les commentaires spicy
  if (!_comEstSpicy) query = query.eq('est_spicy', false);

  if (_comTri === 'top') {
    query = query.order('nb_likes', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(_comOffset, _comOffset + COM_PAR_PAGE - 1);

  if (loading) loading.style.display = 'none';

  if (error || !data) return;

  // Récupérer les likes de l'utilisateur connecté
  let mesLikes = [];
  if (compte.loggedIn && compte.userId && data.length) {
    const ids = data.map(c => c.id);
    const { data: likesData } = await db
      .from('commentaires_likes')
      .select('commentaire_id')
      .eq('user_id', compte.userId)
      .in('commentaire_id', ids);
    mesLikes = (likesData || []).map(l => l.commentaire_id);
  }

  const liste = _comEl('liste');
  if (!liste) return;

  if (reset) liste.innerHTML = '';

  data.forEach(com => {
    const aLike = mesLikes.includes(com.id);
    liste.insertAdjacentHTML('beforeend', _renderComCard(com, aLike, false));
  });

  _comOffset += data.length;

  const loadMore = _comEl('load-more');
  if (loadMore) loadMore.style.display = data.length === COM_PAR_PAGE ? 'block' : 'none';
}

async function chargerPlusCommentaires() {
  await _chargerCommentaires(false);
}

/* ══════════════════════════════════════════════════════
   RENDU HTML D'UN COMMENTAIRE
   ══════════════════════════════════════════════════════ */

function _renderComCard(com, aLike, isReply) {
  const date = _formatDate(com.created_at);
  const epingleBadge = com.epingle
    ? '<span class="com-epingle-badge">✦ épinglé</span>' : '';
  const popComBadge = (!isReply && _comTopIds.includes(com.id))
    ? '<span class="com-popcom-badge">✦ Pop Com</span>' : '';
  // Gestion spoiler / spicy
  let contenuHtml;
  let tagsBadgesHtml = '';

  if (com.est_spicy && !_comEstSpicy) {
    // Ne pas afficher ce commentaire — on retourne une chaîne vide
    return '';
  } else if (com.est_spoiler) {
    const texteEchappe2 = _escapeHtml(com.contenu);
    const pimentInline = com.est_spicy ? '<span class="com-spicy-icon">🌶</span>' : '';
    contenuHtml = `<div class="com-spoiler-wrap">
      <button class="com-spoiler-btn" onclick="this.closest('.com-spoiler-wrap').classList.add('revele')">
        <span class="spoiler-star">✦ · ✦</span>
        Spoiler
        <span class="spoiler-star">✦ · ✦</span>
      </button>
      <div class="com-spoiler-texte">${texteEchappe2}${pimentInline}</div>
      <button class="com-spoiler-recacher" onclick="this.closest('.com-spoiler-wrap').classList.remove('revele')">↑ Recacher le spoiler</button>
    </div>`;
  } else {
    const pimentInline = com.est_spicy ? '<span class="com-spicy-icon">🌶</span>' : '';
    contenuHtml = _escapeHtml(com.contenu) + pimentInline;
  }
  const texteEchappe = contenuHtml;

  let macaron = '';
  if (com.role === 'admin') {
    macaron = '<span class="com-autrice-badge com-admin-badge">✦ Admin</span>';
  } else if (com.role === 'autrice') {
    const autrice = (_pseudosAuteurs || []).find(a => a.user_id === com.user_id);
    if (autrice) {
      const b = typeof BOOKS !== 'undefined' ? BOOKS.find(x => x.id === _comHistoireId) : null;
      const estSonHistoire = b && b.author === autrice.pseudo;
      const classe = estSonHistoire ? 'son-histoire' : 'autre-histoire';
      macaron = `<span class="com-autrice-badge ${classe}">✍ Auteur·ice</span>`;
    }
  }

  // Vérifier si l'utilisateur connecté est l'autrice DE CETTE histoire
  const b = typeof BOOKS !== 'undefined' ? BOOKS.find(x => x.id === _comHistoireId) : null;
  const estAutriceDeLHistoire = !isReply && b && compte.loggedIn && compte.userId &&
    (_pseudosAuteurs || []).some(a => a.pseudo === b.author && a.user_id === compte.userId);

  // Actions
  const likeBtn = `<button class="com-action-btn${aLike ? ' liked' : ''}" id="com-like-${com.id}" onclick="toggleLikeCommentaire('${com.id}')"><span class="com-heart"></span> <span id="com-likes-${com.id}">${com.nb_likes || 0}</span></button>`;
  const repondreBtn = !isReply && compte.loggedIn
    ? `<button class="com-action-btn" onclick="ouvrirReponse('${com.id}', ${JSON.stringify(com.contenu)})">↩ Répondre</button>` : '';
  const signalerBtn = compte.loggedIn && com.user_id !== compte.userId
    ? `<button class="com-action-btn" onclick="ouvrirSignalement('${com.id}')">⚑ Signaler</button>` : '';
  const supprimerBtn = compte.loggedIn && com.user_id === compte.userId
    ? `<button class="com-action-btn com-supprimer-btn" onclick="supprimerCommentaire('${com.id}')">✕ Supprimer</button>` : '';
  const epinglerBtn = estAutriceDeLHistoire
    ? `<button class="com-action-btn com-epingler-btn" onclick="toggleEpinglerCommentaire('${com.id}', ${com.epingle ? 'true' : 'false'})">${com.epingle ? '📌 Désépingler' : '📌 Épingler'}</button>` : '';

  // Réponses imbriquées
  let repliesHtml = '';
  if (!isReply && com.replies && com.replies.length) {
    const repliesCards = com.replies
      .filter(r => !r.signale)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(r => _renderComCard(r, false, true))
      .join('');
    repliesHtml = `<div class="com-replies">${repliesCards}</div>`;
  }

  return `
    <div class="com-card" id="com-card-${com.id}">
      <div class="com-card-header">
        <div class="com-avatar">☽</div>
        <span class="com-pseudo">${_escapeHtml(com.pseudo)}</span>
        ${macaron}
        ${epingleBadge}
        ${popComBadge}
        <span class="com-date">${date}</span>
      </div>
      <div class="com-texte">${texteEchappe}</div>
      <div class="com-actions">
        ${likeBtn}${repondreBtn}${signalerBtn}${supprimerBtn}${epinglerBtn}
      </div>
      ${repliesHtml}
    </div>`;
}

/* ══════════════════════════════════════════════════════
   SOUMETTRE UN COMMENTAIRE
   ══════════════════════════════════════════════════════ */

async function soumettreCommentaire() {
  if (!compte.loggedIn || !compte.userId) return;

  const input = _comEl('input');
  const errEl = _comEl('error');
  const contenu = input?.value.trim();

  if (errEl) errEl.style.display = 'none';

  if (!contenu || contenu.length < 1) {
    if (errEl) { errEl.textContent = 'Le commentaire ne peut pas être vide.'; errEl.style.display = 'block'; }
    return;
  }
  if (contenu.length > 1000) {
    if (errEl) { errEl.textContent = 'Maximum 1000 caractères.'; errEl.style.display = 'block'; }
    return;
  }

  const btn = document.querySelector('.com-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  const estSpoiler = document.getElementById(_comPrefix + 'tag-spoiler')?.checked || false;
  const estSpicy = _comPrefix !== 'wt-com-' && _comPrefix !== 'audio-com-' && _comEstSpicy &&
    (document.getElementById(_comPrefix + 'tag-spicy')?.checked || false);

  const { data, error } = await db.from('commentaires').insert({
    histoire_id: _comHistoireId,
    chapitre_num: _comChapNum,
    user_id: compte.userId,
    pseudo: compte.pseudo,
    contenu,
    role: compte.role || 'lectrice',
    est_spoiler: estSpoiler,
    est_spicy: estSpicy
  }).select().single();

  if (btn) { btn.disabled = false; btn.textContent = 'Publier ✦'; }

  if (error) {
    if (errEl) { errEl.textContent = 'Une erreur est survenue. Réessaie.'; errEl.style.display = 'block'; }
    return;
  }

  // Ajouter en tête de liste
  if (input) { input.value = ''; if (input.id) _updateCharCount(input.id, input.id.replace('input','char-count')); }
  const spoilerCb = document.getElementById(_comPrefix + 'tag-spoiler');
  const spicyCb = document.getElementById(_comPrefix + 'tag-spicy');
  if (spoilerCb) spoilerCb.checked = false;
  if (spicyCb)   spicyCb.checked   = false;
  const liste = _comEl('liste');
  if (liste && data) {
    liste.insertAdjacentHTML('afterbegin', _renderComCard(data, false, false));
  }
}

/* ══════════════════════════════════════════════════════
   LIKES
   ══════════════════════════════════════════════════════ */

async function toggleLikeCommentaire(comId) {
  if (!compte.loggedIn || !compte.userId) {
    go('p-connexion-modal');
    return;
  }

  const btn = document.getElementById('com-like-' + comId);
  const countEl = document.getElementById('com-likes-' + comId);
  if (btn) btn.disabled = true;

  // Sauvegarder les top IDs avant le like
  const topIdsBefore = [..._comTopIds];

  const { data: liked, error } = await db.rpc('toggle_like_commentaire', {
    p_commentaire_id: comId
  });

  if (!error) {
    if (btn) btn.classList.toggle('liked', liked);
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = liked ? current + 1 : Math.max(0, current - 1);
    }

    // Vérifier si ce commentaire vient d'entrer dans le top 3
    if (liked) {
      await _chargerTopIds();
      if (_comTopIds.includes(comId) && !topIdsBefore.includes(comId)) {
        // Ce commentaire est nouveau dans le top 3 — notifier son auteur
        const { data: com } = await db.from('commentaires')
          .select('user_id, chapitre_num')
          .eq('id', comId)
          .single();
        if (com) {
          const { error: notifError } = await db.from('notifications').insert({
            user_id: com.user_id,
            type: 'top_com',
            message: `Ton commentaire au chapitre ${com.chapitre_num} est dans le Top Com ✦`,
            lien_histoire_id: _comHistoireId,
            lien_chapitre_num: com.chapitre_num,
            lue: false
          });
          if (notifError) console.error('Notif top_com error:', notifError);
          else if (typeof chargerNotifications === 'function') chargerNotifications();
        }
      }
    } else {
      await _chargerTopIds();
    }
  }
  if (btn) btn.disabled = false;
}

/* ══════════════════════════════════════════════════════
   RÉPONSES
   ══════════════════════════════════════════════════════ */

function ouvrirReponse(parentId, parentTexte) {
  _comReponseParentId = parentId;
  _comReponseParentTexte = parentTexte;

  const apercu = document.getElementById('com-reponse-parent-apercu');
  if (apercu) apercu.textContent = '"' + parentTexte.slice(0, 120) + (parentTexte.length > 120 ? '…' : '') + '"';

  const input = document.getElementById('com-reponse-input');
  if (input) { input.value = ''; _updateCharCount('com-reponse-input', 'com-reponse-char-count'); }

  const errEl = document.getElementById('com-reponse-error');
  if (errEl) errEl.style.display = 'none';

  openModal('com-reponse-popup');
}

async function soumettreReponse() {
  if (!compte.loggedIn || !compte.userId || !_comReponseParentId) return;

  const input = document.getElementById('com-reponse-input');
  const errEl = document.getElementById('com-reponse-error');
  const contenu = input?.value.trim();

  if (errEl) errEl.style.display = 'none';

  if (!contenu) {
    if (errEl) { errEl.textContent = 'La réponse ne peut pas être vide.'; errEl.style.display = 'block'; }
    return;
  }

  const btn = document.querySelector('#com-reponse-popup .com-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  const { data, error } = await db.from('commentaires').insert({
    histoire_id: _comHistoireId,
    chapitre_num: _comChapNum,
    user_id: compte.userId,
    pseudo: compte.pseudo,
    contenu,
    parent_id: _comReponseParentId,
    role: compte.role || 'lectrice'
  }).select().single();

  if (btn) { btn.disabled = false; btn.textContent = 'Répondre ✦'; }

  if (error) {
    if (errEl) { errEl.textContent = 'Une erreur est survenue. Réessaie.'; errEl.style.display = 'block'; }
    return;
  }

  closeM('com-reponse-popup');
  if (input) input.value = '';

  // Ajouter la réponse dans le fil du commentaire parent
  if (data) {
    const parentCard = document.getElementById('com-card-' + _comReponseParentId);
    if (parentCard) {
      let repliesEl = parentCard.querySelector('.com-replies');
      if (!repliesEl) {
        repliesEl = document.createElement('div');
        repliesEl.className = 'com-replies';
        parentCard.appendChild(repliesEl);
      }
      repliesEl.insertAdjacentHTML('beforeend', _renderComCard(data, false, true));
    }
  }
}

/* ══════════════════════════════════════════════════════
   SIGNALEMENT
   ══════════════════════════════════════════════════════ */

function ouvrirSignalement(comId) {
  _comSignalementId = comId;
  // Reset les radios
  document.querySelectorAll('input[name="signal-raison"]').forEach(r => r.checked = false);
  openModal('com-signalement-popup');
}

async function confirmerSignalement() {
  if (!_comSignalementId || !compte.loggedIn || !compte.userId) return;

  const raison = document.querySelector('input[name="signal-raison"]:checked')?.value || 'autre';

  // Passe par la fonction sécurisée — le trigger gère le masquage auto après 3 signalements
  await db.rpc('signaler_commentaire', {
    p_commentaire_id: _comSignalementId,
    p_raison: raison
  }).catch(() => {});

  // Masquer côté client immédiatement pour le signalant
  const card = document.getElementById('com-card-' + _comSignalementId);
  if (card) card.style.display = 'none';

  closeM('com-signalement-popup');
  _comSignalementId = null;
}

/* ══════════════════════════════════════════════════════
   SUPPRESSION
   ══════════════════════════════════════════════════════ */

async function supprimerCommentaire(comId) {
  if (!compte.loggedIn || !compte.userId) return;
  _comASupprimer = comId;
  openModal('com-supprimer-popup');
}

async function confirmerSuppression() {
  if (!_comASupprimer || !compte.loggedIn || !compte.userId) return;
  const comId = _comASupprimer;
  _comASupprimer = null;
  closeM('com-supprimer-popup');
  const { error } = await db.from('commentaires')
    .delete()
    .eq('id', comId)
    .eq('user_id', compte.userId);
  if (!error) {
    const card = document.getElementById('com-card-' + comId);
    if (card) card.remove();
  }
}

function annulerSuppression() {
  _comASupprimer = null;
  closeM('com-supprimer-popup');
}

/* ══════════════════════════════════════════════════════
   ÉPINGLER — autrice de l'histoire uniquement
   ══════════════════════════════════════════════════════ */

async function toggleEpinglerCommentaire(comId, estEpingle) {
  if (!compte.loggedIn || !compte.userId) return;
  const nouvelEtat = !estEpingle;
  const { error } = await db.from('commentaires')
    .update({ epingle: nouvelEtat })
    .eq('id', comId);
  if (error) return;

  // Notifier l'autrice du commentaire si on épingle (pas si on désépingle)
  if (nouvelEtat) {
    const { data: com } = await db.from('commentaires')
      .select('user_id, pseudo, chapitre_num')
      .eq('id', comId)
      .single();
    if (com) {
      const { error: notifError } = await db.from('notifications').insert({
        user_id: com.user_id,
        type: 'epingle',
        message: `Ton commentaire au chapitre ${com.chapitre_num} a été épinglé ✦`,
        lien_histoire_id: _comHistoireId,
        lien_chapitre_num: com.chapitre_num,
        lue: false
      });
      if (notifError) console.error('Notif epingle error:', notifError);
      else if (typeof chargerNotifications === 'function') chargerNotifications();
    }
  }

  await _chargerTopIds();
  const liste = _comEl('liste');
  if (liste) liste.style.minHeight = liste.offsetHeight + 'px';
  liste.innerHTML = '';
  await _chargerCommentaires(true);
  if (liste) liste.style.minHeight = '';
}

/* ══════════════════════════════════════════════════════
   COUPS DE CŒUR — page histoire
   ══════════════════════════════════════════════════════ */

async function loadTopCommentaires(histoireId) {
  const bloc = document.getElementById('top-coms-bloc');
  const liste = document.getElementById('top-coms-liste');
  if (!bloc || !liste) return;

  const { data, error } = await db
    .from('commentaires')
    .select('contenu, pseudo, chapitre_num')
    .eq('histoire_id', histoireId)
    .eq('coup_de_coeur_valide', true)
    .eq('signale', false)
    .limit(3);

  if (error || !data || !data.length) {
    bloc.style.display = 'none';
    return;
  }

  bloc.style.display = 'block';
  liste.innerHTML = data.map(c => `
    <div class="top-com-card">
      <div class="com-texte">"${_escapeHtml(c.contenu.slice(0, 200))}${c.contenu.length > 200 ? '…' : ''}"</div>
      <div class="top-com-source">— ${_escapeHtml(c.pseudo)} · Ch.${c.chapitre_num}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   COMPTEUR DE CARACTÈRES
   ══════════════════════════════════════════════════════ */

function _updateCharCount(inputId, countId) {
  const input = document.getElementById(inputId);
  const count = document.getElementById(countId);
  if (!input || !count) return;
  count.textContent = input.value.length + ' / 1000';
}

// Branchement des compteurs au chargement
document.addEventListener('DOMContentLoaded', () => {
  const comInput = document.getElementById('com-input');
  if (comInput) comInput.addEventListener('input', () => _updateCharCount('com-input', 'com-char-count'));

  const repInput = document.getElementById('com-reponse-input');
  if (repInput) repInput.addEventListener('input', () => _updateCharCount('com-reponse-input', 'com-reponse-char-count'));

  // Le wt-com-input est créé dynamiquement, branché dans webtoon.js
});

/* ══════════════════════════════════════════════════════
   UTILITAIRES
   ══════════════════════════════════════════════════════ */

function _escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 2592000) return Math.floor(diff / 86400) + 'j';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ══════════════════════════════════════════════════════
   BUG REPORT
   ══════════════════════════════════════════════════════ */

async function soumettreSignalementBug() {
  if (!compte.loggedIn || !compte.userId) return;

  const page = document.getElementById('bug-page-select')?.value || '';
  const desc = document.getElementById('bug-description')?.value.trim() || '';
  const errEl = document.getElementById('bug-error');
  const okEl = document.getElementById('bug-ok');
  const btn = document.getElementById('bug-submit-btn');

  if (errEl) errEl.style.display = 'none';
  if (okEl) okEl.style.display = 'none';

  if (desc.length < 10) {
    if (errEl) { errEl.textContent = 'Décris le problème en au moins 10 caractères.'; errEl.style.display = 'block'; }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  const { error } = await db.from('bug_reports').insert({
    user_id: compte.userId,
    pseudo: compte.pseudo,
    page: page || null,
    description: desc
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ✦'; }

  if (error) {
    if (errEl) { errEl.textContent = 'Une erreur est survenue. Réessaie.'; errEl.style.display = 'block'; }
    return;
  }

  // Succès
  if (okEl) okEl.style.display = 'block';
  const descEl = document.getElementById('bug-description');
  if (descEl) { descEl.value = ''; _updateCharCount('bug-description', 'bug-char-count'); }
  const pageEl = document.getElementById('bug-page-select');
  if (pageEl) pageEl.value = '';
  setTimeout(() => closeM('bug-report-popup'), 2000);
}

// Compteur bug description
document.addEventListener('DOMContentLoaded', () => {
  const bugDesc = document.getElementById('bug-description');
  if (bugDesc) bugDesc.addEventListener('input', () => _updateCharCount('bug-description', 'bug-char-count'));
});

/* ══════════════════════════════════════════════════════
   ALERTE SIGNALEMENT — chargée à l'ouverture de Mon Compte
   ══════════════════════════════════════════════════════ */

async function checkAlertesSignalement() {
  if (!compte.loggedIn || !compte.userId) return;

  // Commentaires de l'utilisateur qui sont signalés (masqués)
  const { data, error } = await db
    .from('commentaires')
    .select('id, contenu, signale')
    .eq('user_id', compte.userId)
    .eq('signale', true);

  const bloc = document.getElementById('alerte-signalement-bloc');
  const badge = document.getElementById('notif-badge');

  if (error || !data || !data.length) {
    if (bloc) bloc.style.display = 'none';
    if (badge) badge.style.display = 'none';
    return;
  }

  // Afficher l'alerte dans Mon Compte
  if (bloc) {
    bloc.style.display = 'block';
    const texteEl = document.getElementById('alerte-signalement-texte');
    if (texteEl) {
      const nb = data.length;
      texteEl.textContent = nb === 1
        ? '1 de tes commentaires est en attente de vérification.'
        : `${nb} de tes commentaires sont en attente de vérification.`;
    }
  }

  // Afficher le badge rouge sur le bouton Mon Compte
  if (badge) badge.style.display = 'block';
}

/* ══════════════════════════════════════════════════════
   J'AIME CHAPITRE
   ══════════════════════════════════════════════════════ */

let _chapLiked = false;
let _chapLikeHistoireId = null;
let _chapLikeNum = null;

async function initLikeChapitre(histoireId, chapNum) {
  _chapLikeHistoireId = histoireId;
  _chapLikeNum = chapNum;
  _chapLiked = false;

  // Compter les likes de ce chapitre
  const { count } = await db
    .from('chapitres_likes')
    .select('*', { count: 'exact', head: true })
    .eq('histoire_id', histoireId)
    .eq('chapitre_num', chapNum);

  // Vérifier si l'utilisateur a déjà liké
  if (compte.loggedIn && compte.userId) {
    const { data } = await db
      .from('chapitres_likes')
      .select('user_id')
      .eq('histoire_id', histoireId)
      .eq('chapitre_num', chapNum)
      .eq('user_id', compte.userId)
      .single();
    _chapLiked = !!data;
  }

  _renderLikeChapitre(count || 0);
}

function _renderLikeChapitre(nb) {
  const enBD = document.getElementById('p-bd')?.classList.contains('active');
  const btn   = document.getElementById(enBD ? 'bd-like-btn'   : 'chapitre-like-btn');
  const icone = document.getElementById(enBD ? 'bd-like-icone' : 'chapitre-like-icone');
  const count = document.getElementById(enBD ? 'bd-like-count' : 'chapitre-like-count');
  const msg   = document.getElementById('chapitre-like-msg'); // roman uniquement

  if (!btn) return;

  btn.classList.toggle('liked', _chapLiked);
  if (icone) icone.textContent = _chapLiked ? '♥' : '♡';
  if (count) count.textContent = nb;
  if (msg)   msg.textContent   = _chapLiked ? 'Tu as aimé ce chapitre ✦' : '';
}

async function toggleLikeChapitre() {
  if (!compte.loggedIn || !compte.userId) {
    // En BD : ouvrir le modal de connexion sans quitter la visionneuse
    if (document.getElementById('p-bd')?.classList.contains('active')) {
      openModal('p-connexion-modal');
    } else {
      go('p-connexion-modal');
    }
    return;
  }

  const enBD = document.getElementById('p-bd')?.classList.contains('active');
  const btn   = document.getElementById(enBD ? 'bd-like-btn'    : 'chapitre-like-btn');
  const icone = document.getElementById(enBD ? 'bd-like-icone'  : 'chapitre-like-icone');
  const count = document.getElementById(enBD ? 'bd-like-count'  : 'chapitre-like-count');
  const msg   = document.getElementById('chapitre-like-msg'); // roman uniquement

  if (!btn) return;
  btn.disabled = true;

  // Déclencher l'animation pulse
  btn.classList.remove('pulse');
  void btn.offsetWidth;
  btn.classList.add('pulse');
  setTimeout(() => btn.classList.remove('pulse'), 500);

  const { data: liked, error } = await db.rpc('toggle_like_chapitre', {
    p_histoire_id: _chapLikeHistoireId,
    p_chapitre_num: _chapLikeNum
  });

  btn.disabled = false;
  if (error) return;

  _chapLiked = liked;
  const current = parseInt(count?.textContent) || 0;
  const newCount = liked ? current + 1 : Math.max(0, current - 1);

  btn.classList.toggle('liked', liked);
  if (icone) icone.textContent = liked ? '♥' : '♡';
  if (count) count.textContent = newCount;
  if (msg) msg.textContent = liked ? 'Tu as aimé ce chapitre ✦' : '';
}
