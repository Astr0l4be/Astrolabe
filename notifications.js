/* ============================================================
   NOTIFICATIONS.JS — Astrolabe
   Types : 'reponse', 'top_com', 'epingle'
   ============================================================ */

let _notifs = [];
const _notifsSupprimees = new Set(); // IDs supprimés localement dans cette session

/* ══════════════════════════════════════════════════════
   CHARGEMENT & BADGE
   ══════════════════════════════════════════════════════ */

async function chargerNotifications() {
  if (!compte.loggedIn || !compte.userId) return;

  const { data, error } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', compte.userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data) return;

  // Ne pas faire réapparaître les notifs déjà supprimées localement dans cette session
  _notifs = data.filter(n => !_notifsSupprimees.has(n.id));
  _updateBadge();
}

function _updateBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;

  const nbNonLues = _notifs.filter(n => !n.lue).length;

  if (nbNonLues > 0) {
    badge.textContent = nbNonLues > 99 ? '99+' : nbNonLues;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════
   RENDU — section Mon Compte
   ══════════════════════════════════════════════════════ */

function renderNotifications() {
  const bloc = document.getElementById('notifs-bloc');
  const liste = document.getElementById('notifs-liste');
  const countLabel = document.getElementById('notifs-count-label');
  if (!bloc || !liste) return;

  if (!_notifs.length) {
    bloc.style.display = 'none';
    return;
  }

  bloc.style.display = 'block';

  const nbNonLues = _notifs.filter(n => !n.lue).length;
  if (countLabel) countLabel.textContent = nbNonLues > 0 ? `(${nbNonLues} non lue${nbNonLues > 1 ? 's' : ''})` : '';

  // Ouvrir automatiquement l'accordeon s'il y a des notifs non lues
  if (nbNonLues > 0 && !_notifBlocOuvert) {
    _notifBlocOuvert = true;
    const accordeon = document.getElementById('notifs-accordeon');
    const chevron = document.getElementById('notifs-chevron');
    if (accordeon) setTimeout(() => { accordeon.style.maxHeight = accordeon.scrollHeight + 'px'; }, 50);
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }

  liste.innerHTML = _notifs.map(n => {
    const icone = _iconeNotif(n.type);
    const date = _formatDateNotif(n.created_at);
    const nonLue = !n.lue ? ' non-lue' : '';
    const dot = !n.lue ? '<div class="notif-dot"></div>' : '';
    const onclick = n.lien_histoire_id
      ? `onclick="clicNotif('${n.id}', '${n.lien_histoire_id}', ${n.lien_chapitre_num || 'null'}, ${n.lien_commentaire_id ? "'" + n.lien_commentaire_id + "'" : 'null'})"`
      : `onclick="marquerLue('${n.id}')"`;

    return `
      <div class="notif-card${nonLue}" id="notif-card-${n.id}" ${onclick}>
        <div class="notif-icone">${icone}</div>
        <div class="notif-texte">
          <div class="notif-message">${_escapeHtmlNotif(n.message)}</div>
          <div class="notif-date">${date}</div>
        </div>
        ${dot}
        <button class="notif-suppr-btn" onclick="event.stopPropagation();supprimerNotif('${n.id}')">✕</button>
      </div>`;
  }).join('');
}

let _notifBlocOuvert = false;

function toggleNotifBloc() {
  _notifBlocOuvert = !_notifBlocOuvert;
  const accordeon = document.getElementById('notifs-accordeon');
  const chevron = document.getElementById('notifs-chevron');
  if (accordeon) accordeon.style.maxHeight = _notifBlocOuvert ? accordeon.scrollHeight + 'px' : '0';
  if (chevron) chevron.style.transform = _notifBlocOuvert ? 'rotate(180deg)' : '';
}

async function supprimerNotif(notifId) {
  const { error } = await db.from('notifications')
    .delete()
    .eq('id', notifId)
    .eq('user_id', compte.userId);
  if (error) { console.error('Suppr notif error:', error); return; }
  _notifs = _notifs.filter(n => n.id !== notifId);
  _updateBadge();
  renderNotifications();
  const accordeon = document.getElementById('notifs-accordeon');
  if (accordeon && _notifBlocOuvert) accordeon.style.maxHeight = accordeon.scrollHeight + 'px';
}

/* ══════════════════════════════════════════════════════
   ACTIONS
   ══════════════════════════════════════════════════════ */

async function clicNotif(notifId, histoireId, chapNum, commentaireId) {
  // Suppression visuelle immédiate
  _notifsSupprimees.add(notifId);
  _notifs = _notifs.filter(n => n.id !== notifId);
  const card = document.getElementById('notif-card-' + notifId);
  if (card) card.remove();
  _updateBadge();

  // Suppression en base en arrière-plan — on n'attend pas
  db.from('notifications').delete().eq('id', notifId).eq('user_id', compte.userId);

  // Navigation immédiate
  closeM('p-moncompte');

  if (histoireId && chapNum) {
    await openLecture(histoireId, chapNum);
    setTimeout(() => {
      const scroller = document.querySelector('#p-lecture .page-scroll') || document.querySelector('.page-scroll');
      if (commentaireId) {
        const comCard = document.getElementById('com-card-' + commentaireId);
        if (comCard && scroller) {
          scroller.scrollTo({ top: comCard.offsetTop - 80, behavior: 'smooth' });
          comCard.classList.add('notif-highlight');
          setTimeout(() => comCard.classList.remove('notif-highlight'), 2000);
        }
      } else {
        const comSection = document.getElementById('com-section');
        if (comSection && scroller) {
          scroller.scrollTo({ top: comSection.offsetTop, behavior: 'smooth' });
        }
      }
    }, 400);

  } else if (histoireId) {
    openHistoire(histoireId);
  }
}

async function marquerLue(notifId) {
  const notif = _notifs.find(n => n.id === notifId);
  if (!notif || notif.lue) return;

  notif.lue = true;

  // Mise à jour visuelle immédiate
  const card = document.getElementById('notif-card-' + notifId);
  if (card) {
    card.classList.remove('non-lue');
    const dot = card.querySelector('.notif-dot');
    if (dot) dot.remove();
  }
  _updateBadge();

  // Persistance Supabase
  await db.from('notifications')
    .update({ lue: true })
    .eq('id', notifId)
    .catch(() => {});
}

async function marquerToutesLues() {
  if (!compte.loggedIn || !compte.userId) return;

  const nonLues = _notifs.filter(n => !n.lue);
  if (!nonLues.length) return;

  // Mise à jour locale immédiate
  _notifs.forEach(n => n.lue = true);
  _updateBadge();
  renderNotifications();

  // Persistance Supabase
  await db.from('notifications')
    .update({ lue: true })
    .eq('user_id', compte.userId)
    .eq('lue', false)
    .catch(() => {});
}

/* ══════════════════════════════════════════════════════
   UTILITAIRES
   ══════════════════════════════════════════════════════ */

function _iconeNotif(type) {
  switch (type) {
    case 'reponse':  return '↩';
    case 'top_com':  return '✦';
    case 'epingle':  return '📌';
    default:         return '🔔';
  }
}

function _formatDateNotif(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)      return 'à l\'instant';
  if (diff < 3600)    return Math.floor(diff / 60) + ' min';
  if (diff < 86400)   return Math.floor(diff / 3600) + 'h';
  if (diff < 604800)  return Math.floor(diff / 86400) + 'j';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function _escapeHtmlNotif(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
