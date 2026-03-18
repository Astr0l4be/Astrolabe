/* ============================================================
   AUTH.JS — Astrolabe
   Gestion des 4 tranches d'âge :
     < 13     → refus d'accès
     13–16    → compte junior, achats désactivés sauf accord parental
     16–18    → compte ado, soft_spicy désactivé par défaut
     18+      → compte adulte complet
   ============================================================ */

/* ── UTILS ── */
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function calcAge(dateNaissance) {
  if (!dateNaissance) return 0;
  const dob = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() ||
     (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
}

function trancheFromAge(age) {
  if (age < 13)  return 'refuse';
  if (age < 16)  return 'junior';
  if (age < 18)  return 'ado';
  return 'adulte';
}


/* ── VÉRIFICATIONS EN TEMPS RÉEL (onblur) ── */
async function verifierPseudo() {
  const pseudo = document.getElementById('insc-pseudo').value.trim();
  const errPseudo = document.getElementById('pseudo-error');
  errPseudo.classList.remove('show');
  if (!pseudo) return;
  const { data, error } = await db.rpc('pseudo_existe', { p_pseudo: pseudo });
  if (!error && data === true) errPseudo.classList.add('show');
}

async function verifierEmail() {
  const email = document.getElementById('insc-mail').value.trim();
  const errEmail = document.getElementById('email-error');
  errEmail.classList.remove('show');
  if (!email) return;
  if (!isValidEmail(email)) { errEmail.classList.add('show'); return; }
  const { data, error } = await db.rpc('email_existe', { p_email: email });
  if (!error && data === true) errEmail.classList.add('show');
}


/* ── DATE DE NAISSANCE ── */
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

function initDobFields() {
  if (isMobile) {
    const dobMobile = document.querySelector('.dob-mobile');
    if (dobMobile) dobMobile.style.display = 'flex';
    const jourSel  = document.getElementById('dob-jour');
    const moisSel  = document.getElementById('dob-mois');
    const anneeSel = document.getElementById('dob-annee');
    if (!jourSel) return;
    const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    for (let i = 1; i <= 31; i++) {
      const o = document.createElement('option');
      o.value = i; o.textContent = i; if (i === 1) o.selected = true;
      jourSel.appendChild(o);
    }
    moisNoms.forEach((m, i) => {
      const o = document.createElement('option');
      o.value = i + 1; o.textContent = m; if (i === 0) o.selected = true;
      moisSel.appendChild(o);
    });
    const now2 = new Date(); const curYear = now2.getFullYear();
    for (let y = curYear; y >= curYear - 100; y--) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y; if (y === curYear - 18) o.selected = true;
      anneeSel.appendChild(o);
    }
  } else {
    const dobDate = document.getElementById('dob-date');
    if (!dobDate) return;
    dobDate.style.display = 'block';
    const now2 = new Date();
    const def = new Date(now2.getFullYear() - 18, now2.getMonth(), now2.getDate());
    dobDate.value = def.toISOString().split('T')[0];
    dobDate.max = now2.toISOString().split('T')[0];
    dobDate.min = new Date(now2.getFullYear() - 100, now2.getMonth(), now2.getDate()).toISOString().split('T')[0];
  }
}
document.addEventListener('DOMContentLoaded', initDobFields);


/* ── HELPER : lire la DOB depuis le formulaire ── */
function getDobFromForm() {
  if (isMobile) {
    const j = parseInt(document.getElementById('dob-jour').value);
    const m = parseInt(document.getElementById('dob-mois').value);
    const a = parseInt(document.getElementById('dob-annee').value);
    return { age: calcAge(`${a}-${String(m).padStart(2,'0')}-${String(j).padStart(2,'0')}`),
             dobVal: `${a}-${String(m).padStart(2,'0')}-${String(j).padStart(2,'0')}` };
  } else {
    const val = document.getElementById('dob-date').value;
    if (!val) return { age: 16, dobVal: null };
    return { age: calcAge(val), dobVal: val };
  }
}


/* ══════════════════════════════════════════════════════
   ÉTAPE 1 — Validation pseudo / mdp / email / âge
   Route vers la bonne page selon la tranche
   ══════════════════════════════════════════════════════ */
async function handleInscription1() {
  const mdp      = document.getElementById('insc-mdp').value;
  const mdp2     = document.getElementById('insc-mdp2').value;
  const pseudo   = document.getElementById('insc-pseudo').value.trim();
  const email    = document.getElementById('insc-mail').value.trim();
  const errMdp   = document.getElementById('mdp-error');
  const errLen   = document.getElementById('mdp-length-error');
  const errPseudo = document.getElementById('pseudo-error');
  const errEmail = document.getElementById('email-error');

  errMdp.classList.remove('show');
  errLen.classList.remove('show');
  errPseudo.classList.remove('show');
  errEmail.classList.remove('show');

  if (mdp.length < 6) { errLen.classList.add('show'); return; }
  if (mdp !== mdp2)   { errMdp.classList.add('show');  return; }

  // Vérification format email
  if (!isValidEmail(email)) { errEmail.classList.add('show'); return; }

  // Vérification email déjà utilisé via une fonction Supabase sécurisée
  const { data: emailCheck, error: emailErr } = await db.rpc('email_existe', { p_email: email });
  if (!emailErr && emailCheck === true) { errEmail.classList.add('show'); return; }

  if (pseudo) {
    const { data: pseudoCheck, error: pseudoErr } = await db.rpc('pseudo_existe', { p_pseudo: pseudo });
    if (!pseudoErr && pseudoCheck === true) { errPseudo.classList.add('show'); return; }
    compte.pseudo = pseudo;
  }

  const { age, dobVal } = getDobFromForm();
  compte.age    = age;
  compte.dobVal = dobVal;

  // Appliquer la tranche immédiatement pour que le filtre du catalogue soit correct
  const tranche = trancheFromAge(age);
  compte.trancheAge = tranche;

  switch (tranche) {
    case 'refuse': go('p-inscription-refuse');  break;
    case 'junior': go('p-inscription-accord');  break;
    case 'ado':    go('p-inscription2');         break;
    case 'adulte': go('p-inscription3');         break;
  }
}


/* ══════════════════════════════════════════════════════
   ACCORD PARENTAL — actions
   ══════════════════════════════════════════════════════ */

// L'ado choisit "plus tard" → compte junior sans achats
function accordParentalPlusTard() {
  compte.accordParental  = false;
  compte.achatAutorise   = false;
  go('p-inscription2');   // même page TW que les 13-16
}

// L'ado demande l'accord → on affiche la page parent
function demanderAccordParental() {
  go('p-accord-parent');
}

// Le parent AUTORISE
async function parentAutorise() {
  compte.accordParental = true;
  compte.achatAutorise  = true;
  go('p-inscription2');
}

// Le parent REFUSE → suppression immédiate du compte si déjà créé,
// sinon on abandonne l'inscription et on retourne à l'accueil sans compte
async function parentRefuse() {
  if (compte.userId) {
    await supprimerCompteParentRefus(compte.userId);
  }
  // Réinitialiser l'état
  compte.loggedIn = false; compte.userId = null; compte.pseudo = '';
  compte.tickets = 0; compte.age = 16;
  updateTopbar(); updateTicketsDisplay();
  go('p-main');
}

// Suppression via Edge Function Supabase
async function supprimerCompteParentRefus(userId) {
  try {
    await db.functions.invoke('delete-user', { body: { user_id: userId } });
  } catch (e) {
    // Si l'edge function échoue, on marque le compte à supprimer en urgence
    await db.from('profils').update({
      a_supprimer_le: new Date(Date.now()).toISOString(),
      statut: 'refus_parental'
    }).eq('id', userId);
  }
  await db.auth.signOut();
}


/* ══════════════════════════════════════════════════════
   FINALISATION — création du compte Supabase
   Appelé depuis p-inscription5 ("Commencer ma lecture")
   ══════════════════════════════════════════════════════ */
async function finishInscription() {
  const email    = document.getElementById('insc-mail').value.trim();
  const mdp      = document.getElementById('insc-mdp').value;
  const pseudo = document.getElementById('insc-pseudo').value.trim() || 'Astrolectrice';
  const tranche = trancheFromAge(compte.age);

  // Récupère les préférences TW selon la page affichée
  const twrHistoire = document.getElementById('twr3-histoire')?.checked
                   ?? document.getElementById('twr2-histoire')?.checked
                   ?? true;
  const twrChapitre = document.getElementById('twr3-chapitre')?.checked
                   ?? document.getElementById('twr2-chapitre')?.checked
                   ?? false;

  // Contenu adulte : uniquement pour les 18+, si coché
  const adulte = (tranche === 'adulte') && (document.getElementById('adult3')?.checked || false);

  // soft_spicy : pour 16-18, désactivé par défaut
  const softSpicy = (tranche === 'ado') && (document.getElementById('soft-spicy3')?.checked || false);

  // Achat autorisé : adultes et ados toujours oui ; juniors selon accord parental
  const achatAutorise = (tranche === 'adulte' || tranche === 'ado')
                      ? true
                      : (compte.achatAutorise || false);

  const finishBtn = document.querySelector('#p-inscription5 .choice-card.featured');
  if (finishBtn) finishBtn.style.opacity = '0.5';

  try {
    const { data, error } = await db.auth.signUp({ email, password: mdp, options: { data: { pseudo } } });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        errEmail.classList.add('show'); go('p-inscription1');
      } else { alert('Oups ! ' + error.message); }
      if (finishBtn) finishBtn.style.opacity = '1';
      return;
    }

    const userId = data.user?.id;
    if (!userId) throw new Error('Erreur création compte');

    compte.userId = userId;  // stocker pour parentRefuse() si besoin

    const { error: pe } = await db.from('profils').insert({
      id:                       userId,
      pseudo,
      email,
      tickets:                  20,
      tranche_age:              tranche,
      adulte,
      soft_spicy:               softSpicy,
      achat_autorise:           achatAutorise,
      accord_parental:          compte.accordParental || false,
      trigger_warnings_histoire: twrHistoire,
      trigger_warnings_chapitre: twrChapitre,
      date_naissance:           compte.dobVal || null
    });
    if (pe) throw pe;

    compte.loggedIn      = true;
    compte.pseudo        = pseudo;
    compte.tickets       = 20;
    compte.adulte        = adulte;
    compte.softSpicy     = softSpicy;
    compte.achatAutorise = achatAutorise;
    compte.trancheAge    = tranche;
    compte.twrHistoire   = twrHistoire;
    compte.twrChapitre   = twrChapitre;

    document.getElementById('compte-name').textContent = pseudo;
    updateTicketsDisplay(); syncCompteToggles(); updateTopbar();
    renderGrid('book-grid', BOOKS);
    renderGrid('search-grid', BOOKS);
    renderGrid('hashtag-grid', BOOKS);
    document.getElementById('bienvenue-pseudo').textContent = pseudo;
    document.getElementById('bienvenue-popup').classList.add('open');

  } catch (e) {
    alert('Oups ! ' + e.message);
    if (finishBtn) finishBtn.style.opacity = '1';
  }
}


/* ══════════════════════════════════════════════════════
   MOT DE PASSE OUBLIÉ
   ══════════════════════════════════════════════════════ */
async function handleMdpOublie() {
  const email = document.getElementById('mdp-oublie-email').value.trim();
  const errEl = document.getElementById('mdp-oublie-error');
  const okEl  = document.getElementById('mdp-oublie-ok');
  if (errEl) errEl.style.display = 'none';
  if (okEl)  okEl.style.display  = 'none';

  if (!isValidEmail(email)) {
    if (errEl) { errEl.textContent = 'Adresse e-mail invalide.'; errEl.style.display = 'block'; }
    return;
  }

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/?reset=1'
  });

  if (error) {
    if (errEl) { errEl.textContent = 'Une erreur est survenue. Réessaie dans quelques instants.'; errEl.style.display = 'block'; }
  } else {
    if (okEl) okEl.style.display = 'block';
  }
}


/* ══════════════════════════════════════════════════════
   CONNEXION / DÉCONNEXION
   ══════════════════════════════════════════════════════ */
async function handleConnexion() {
  const email  = document.getElementById('connexion-email').value.trim();
  const mdp    = document.getElementById('connexion-mdp').value;
  const errEl  = document.getElementById('connexion-error');

  const { data, error } = await db.auth.signInWithPassword({ email, password: mdp });
  if (error) {
    if (errEl) { errEl.textContent = 'E-mail ou mot de passe incorrect.'; errEl.style.display = 'block'; }
    return;
  }

  const { data: profil } = await db.from('profils').select('*').eq('id', data.user.id).single();
  if (profil) {
    _chargerProfil(data.user.id, profil);
  }
  closeM('p-connexion-modal'); updateTopbar(); go('p-main');
}

async function deconnexion() {
  await db.auth.signOut();
  compte.loggedIn = false; compte.userId = null; compte.pseudo = ''; compte.tickets = 0;
  updateTicketsDisplay(); updateTopbar(); go('p-main');
}

async function savePrefs() {
  if (!compte.userId) return;
  await db.from('profils').update({
    adulte:                    compte.adulte,
    soft_spicy:                compte.softSpicy,
    trigger_warnings_histoire: compte.twrHistoire,
    trigger_warnings_chapitre: compte.twrChapitre
  }).eq('id', compte.userId);
}


/* ── Helper : charger un profil en mémoire ── */
function _chargerProfil(userId, profil) {
  compte.loggedIn      = true;
  compte.userId        = userId;
  compte.pseudo        = profil.pseudo || 'Astrolectrice';
  compte.tickets       = profil.tickets || 0;
  compte.adulte        = profil.adulte  || false;
  compte.softSpicy     = profil.soft_spicy || false;
  compte.achatAutorise = profil.achat_autorise !== false;
  compte.trancheAge    = profil.tranche_age || (calcAge(profil.date_naissance)>=18?'adulte':calcAge(profil.date_naissance)>=16?'ado':'junior');
  compte.twrHistoire   = profil.trigger_warnings_histoire !== false;
  compte.twrChapitre   = profil.trigger_warnings_chapitre === true;
  compte.estAdulteAge  = calcAge(profil.date_naissance) >= 18;
  compte.est16Ans      = calcAge(profil.date_naissance) >= 16;
  document.getElementById('compte-name').textContent = compte.pseudo;
  updateTicketsDisplay(); syncCompteToggles(); renderGrid('book-grid', BOOKS); updateTopbar();
}


/* ══════════════════════════════════════════════════════
   TOPBAR
   ══════════════════════════════════════════════════════ */
function updateTopbar() {
  const loggedIn = compte.loggedIn;
  document.getElementById('btn-inscription').style.display  = loggedIn ? 'none' : '';
  document.getElementById('btn-connexion').style.display    = loggedIn ? 'none' : '';
  document.getElementById('btn-deconnexion').style.display  = loggedIn ? ''     : 'none';
  document.getElementById('btn-moncompte-top').style.display = loggedIn ? 'flex' : 'none';
  if (loggedIn) {
    const av  = document.getElementById('topbar-avatar');  if (av)  av.textContent  = compte.avatar || '☽';
    const av2 = document.getElementById('topbar-avatar2'); if (av2) av2.textContent = compte.avatar || '☽';
  }
}


/* ══════════════════════════════════════════════════════
   AVATAR
   ══════════════════════════════════════════════════════ */
let _tempAvatar = null; let _savedAvatar = '☽';

function openAvatarPopup() { _tempAvatar = compte.avatar || '☽'; openModal('avatar-popup'); }

function setAvatar(symbol) {
  _tempAvatar = symbol;
  document.getElementById('compte-avatar').textContent = symbol;
  const topbarAv = document.getElementById('topbar-avatar'); if (topbarAv) topbarAv.textContent = symbol;
  ['av-lune','av-etoile','av-soleil'].forEach(id => { document.getElementById(id).style.borderColor = 'rgba(180,190,255,.2)'; });
  const map = { '☽': 'av-lune', '✦': 'av-etoile', '☀': 'av-soleil' };
  if (map[symbol]) document.getElementById(map[symbol]).style.borderColor = 'var(--accent)';
}

function cancelAvatar() {
  document.getElementById('compte-avatar').textContent = _savedAvatar;
  const topbarAv = document.getElementById('topbar-avatar'); if (topbarAv) topbarAv.textContent = _savedAvatar;
  compte.avatar = _savedAvatar; closeM('avatar-popup');
}

function confirmAvatar() {
  _savedAvatar = _tempAvatar || compte.avatar; compte.avatar = _savedAvatar;
  document.getElementById('compte-avatar').textContent = _savedAvatar;
  const topbarAv  = document.getElementById('topbar-avatar');  if (topbarAv)  topbarAv.textContent  = _savedAvatar;
  const topbarAv2 = document.getElementById('topbar-avatar2'); if (topbarAv2) topbarAv2.textContent = _savedAvatar;
  closeM('avatar-popup');
}


/* ══════════════════════════════════════════════════════
   TOGGLE PASSWORD
   ══════════════════════════════════════════════════════ */
function togglePwd(inputId, btnId) {
  const inp = document.getElementById(inputId); const btn = document.getElementById(btnId);
  if (inp.type === 'password') { inp.type = 'text';     btn.style.color = '#fff';          btn.style.fontWeight = '700'; }
  else                         { inp.type = 'password'; btn.style.color = 'var(--accent)'; btn.style.fontWeight = '400'; }
}


/* ══════════════════════════════════════════════════════
   SUPPRESSION COMPTE (flow normal 30 jours)
   ══════════════════════════════════════════════════════ */
async function supprimerCompteDefinitif() {
  try {
    if (compte.userId) {
      const raison = document.getElementById('delete-raison')?.value?.trim() || null;
      await db.from('profils').update({
        a_supprimer_le: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        raison_suppression: raison
      }).eq('id', compte.userId);
    }
    await db.auth.signOut();
    compte.loggedIn = false; compte.userId = null; compte.pseudo = ''; compte.tickets = 0;
    updateTopbar(); updateTicketsDisplay(); go('p-main');
  } catch (e) {
    await db.auth.signOut(); compte.loggedIn = false; compte.userId = null; go('p-main');
  }
}


/* ══════════════════════════════════════════════════════
   POP-UP ANNIVERSAIRES
   ══════════════════════════════════════════════════════ */

// 18 ans → accès contenu adulte optionnel
async function confirmerAdulte(choix) {
  document.getElementById('anniversaire-popup').classList.remove('open');
  if (compte.userId) localStorage.setItem('adulte_popup_vu_' + compte.userId, '1');
  compte.adulte = choix;
  syncCompteToggles(); renderGrid('book-grid', BOOKS);
  if (compte.userId) await db.from('profils').update({ adulte: choix, tranche_age: 'adulte' }).eq('id', compte.userId);
}

// 16 ans → passage tranche ado, plus besoin d'accord parental
async function confirmer16Ans() {
  document.getElementById('anniversaire-16-popup').classList.remove('open');
  if (compte.userId) localStorage.setItem('ado_popup_vu_' + compte.userId, '1');
  compte.trancheAge    = 'ado';
  compte.achatAutorise = true;
  compte.accordParental = false; // plus nécessaire
  syncCompteToggles(); renderGrid('book-grid', BOOKS);
  if (compte.userId) {
    await db.from('profils').update({
      tranche_age:     'ado',
      achat_autorise:  true,
      accord_parental: false
    }).eq('id', compte.userId);
  }
}


/* ══════════════════════════════════════════════════════
   SESSION
   ══════════════════════════════════════════════════════ */
async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return;

  const { data: profil } = await db.from('profils').select('*').eq('id', session.user.id).single();
  if (!profil) return;

  _chargerProfil(session.user.id, profil);

  const age = calcAge(profil.date_naissance);

  // Popup anniversaire 16 ans
  if (profil.date_naissance &&
      profil.tranche_age === 'junior' &&
      age >= 16 &&
      !localStorage.getItem('ado_popup_vu_' + session.user.id)) {
    setTimeout(() => document.getElementById('anniversaire-16-popup')?.classList.add('open'), 4000);
  }

  // Popup anniversaire 18 ans
  if (profil.date_naissance &&
      !profil.adulte &&
      age >= 18 &&
      profil.tranche_age !== 'adulte' &&
      !localStorage.getItem('adulte_popup_vu_' + session.user.id)) {
    setTimeout(() => document.getElementById('anniversaire-popup')?.classList.add('open'), 4000);
  }
}

checkSession().catch(() => {}).finally(() => {
  setTimeout(() => {
    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage && lastPage !== 'p-splash' && document.getElementById(lastPage)) {
      go(lastPage);
    } else {
      go('p-main');
    }
    loadHistoires().catch(() => {});
  }, 3200);
});
