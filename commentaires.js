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

/* ══════════════════════════════════════════════════════
   INITIALISATION — appelée depuis openLecture()
   ══════════════════════════════════════════════════════ */

async function initCommentaires(histoireId, chapNum) {
  _comHistoireId = histoireId;
  _comChapNum = chapNum;
  _comOffset = 0;

  // Afficher formulaire ou message connexion
  const formWrap = document.getElementById('com-form-wrap');
  const loginMsg = document.getElementById('com-login-msg');
  if (compte.loggedIn) {
    if (formWrap) formWrap.style.display = 'block';
    if (loginMsg) loginMsg.style.display = 'none';
  } else {
    if (formWrap) formWrap.style.display = 'none';
    if (loginMsg) loginMsg.style.display = 'flex';
  }

  // Reset textarea et compteur
  const input = document.getElementById('com-input');
  if (input) { input.value = ''; _updateCharCount('com-input', 'com-char-count'); }

  // Vider et charger
  const liste = document.getElementById('com-liste');
  if (liste) liste.innerHTML = '';
  const loadMore = document.getElementById('com-load-more');
  if (loadMore) loadMore.style.display = 'none';

  await _chargerCommentaires(true);
}

/* ══════════════════════════════════════════════════════
   CHARGEMENT
   ══════════════════════════════════════════════════════ */

async function _chargerCommentaires(reset = false) {
  const loading = document.getElementById('com-loading');
  if (loading) loading.style.display = 'block';

  if (reset) _comOffset = 0;

  const { data, error } = await db
    .from('commentaires')
    .select('*, replies:commentaires!parent_id(*, user_id)')
    .eq('histoire_id', _comHistoireId)
    .eq('chapitre_num', _comChapNum)
    .is('parent_id', null)
    .eq('signale', false)
    .order('epingle', { ascending: false })
    .order('created_at', { ascending: false })
    .range(_comOffset, _comOffset + COM_PAR_PAGE - 1);

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

  const liste = document.getElementById('com-liste');
  if (!liste) return;

  if (reset) liste.innerHTML = '';

  data.forEach(com => {
    const aLike = mesLikes.includes(com.id);
    liste.insertAdjacentHTML('beforeend', _renderComCard(com, aLike, false));
  });

  _comOffset += data.length;

  const loadMore = document.getElementById('com-load-more');
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
  const texteEchappe = _escapeHtml(com.contenu);

  // Actions
  const likeBtn = `<button class="com-action-btn${aLike ? ' liked' : ''}" id="com-like-${com.id}" onclick="toggleLikeCommentaire('${com.id}')">♥ <span id="com-likes-${com.id}">${com.nb_likes || 0}</span></button>`;
  const repondreBtn = !isReply && compte.loggedIn
    ? `<button class="com-action-btn" onclick="ouvrirReponse('${com.id}', ${JSON.stringify(com.contenu)})">↩ Répondre</button>` : '';
  const signalerBtn = compte.loggedIn && com.user_id !== compte.userId
    ? `<button class="com-action-btn" onclick="ouvrirSignalement('${com.id}')">⚑ Signaler</button>` : '';
  const supprimerBtn = compte.loggedIn && com.user_id === compte.userId
    ? `<button class="com-action-btn" onclick="supprimerCommentaire('${com.id}')">✕ Supprimer</button>` : '';

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
        ${epingleBadge}
        <span class="com-date">${date}</span>
      </div>
      <div class="com-texte">${texteEchappe}</div>
      <div class="com-actions">
        ${likeBtn}${repondreBtn}${signalerBtn}${supprimerBtn}
      </div>
      ${repliesHtml}
    </div>`;
}

/* ══════════════════════════════════════════════════════
   SOUMETTRE UN COMMENTAIRE
   ══════════════════════════════════════════════════════ */

async function soumettreCommentaire() {
  if (!compte.loggedIn || !compte.userId) return;

  const input = document.getElementById('com-input');
  const errEl = document.getElementById('com-error');
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

  const { data, error } = await db.from('commentaires').insert({
    histoire_id: _comHistoireId,
    chapitre_num: _comChapNum,
    user_id: compte.userId,
    pseudo: compte.pseudo,
    contenu
  }).select().single();

  if (btn) { btn.disabled = false; btn.textContent = 'Publier ✦'; }

  if (error) {
    if (errEl) { errEl.textContent = 'Une erreur est survenue. Réessaie.'; errEl.style.display = 'block'; }
    return;
  }

  // Ajouter en tête de liste
  if (input) { input.value = ''; _updateCharCount('com-input', 'com-char-count'); }
  const liste = document.getElementById('com-liste');
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

  const { data: liked, error } = await db.rpc('toggle_like_commentaire', {
    p_commentaire_id: comId
  });

  if (!error) {
    if (btn) btn.classList.toggle('liked', liked);
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = liked ? current + 1 : Math.max(0, current - 1);
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
    parent_id: _comReponseParentId
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

  await db.from('commentaires_signalements').insert({
    user_id: compte.userId,
    commentaire_id: _comSignalementId,
    raison
  }).catch(() => {});

  // Marquer comme signalé côté serveur (soft hide)
  await db.from('commentaires')
    .update({ signale: true })
    .eq('id', _comSignalementId)
    .catch(() => {});

  // Masquer côté client immédiatement
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
  if (!confirm('Supprimer ce commentaire ?')) return;

  const { error } = await db.from('commentaires')
    .delete()
    .eq('id', comId)
    .eq('user_id', compte.userId);

  if (!error) {
    const card = document.getElementById('com-card-' + comId);
    if (card) card.remove();
  }
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
