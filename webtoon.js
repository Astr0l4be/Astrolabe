/* ============================================================
   WEBTOON.JS — Astrolabe
   Utilise la structure native du site (lecture-header + page-scroll)
   ============================================================ */

async function openWebtoon(histoireId, chapNum) {
  const book = BOOKS.find(b => b.id === histoireId);
  if (!book) return;
  const ch = book.chapitres.find(c => c.num === chapNum);
  if (!ch) return;
  if (ch.datePublication && new Date(ch.datePublication) > new Date()) return;

  const seuil = book.gratuit_jusqu_au || 2;
  if (!ch.gratuit && chapNum > seuil) {
    if (!compte.loggedIn) { go('p-connexion-modal'); return; }
    if (compte.tickets < (book.prix_ticket || 1)) { _ticketsRetourPage = 'p-histoire'; go('p-acheter-tickets'); return; }
  }

  const { data: strips } = await db
    .from('episodes_images')
    .select('ordre, image_url')
    .eq('histoire_id', histoireId)
    .eq('chapitre_num', chapNum)
    .order('ordre');

  if (!strips || !strips.length) { alert("Cet épisode n'a pas encore d'images."); return; }

  if (!ch.gratuit && chapNum > seuil && compte.loggedIn) {
    const prix = book.prix_ticket || 1;
    await db.from('profils').update({ tickets: compte.tickets - prix }).eq('id', compte.userId);
    compte.tickets -= prix;
    updateTicketsDisplay();
  }

  _marquerEpisodeLu(histoireId, chapNum);
  _renderWebtoonReader(book, chapNum, strips);
  go('p-webtoon');

  // Initialiser les commentaires après que go() a rendu la page active
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (typeof initCommentaires === 'function') {
        initCommentaires(histoireId, chapNum);
      }
      const comInput = document.getElementById('wt-com-input');
      if (comInput) comInput.addEventListener('input', () => {
        const count = document.getElementById('wt-com-char-count');
        if (count) count.textContent = comInput.value.length + ' / 1000';
      });
    });
  });
}

function _renderWebtoonReader(book, chapNum, strips) {
  const page = document.getElementById('p-webtoon');
  if (!page) return;

  const ch = book.chapitres.find(c => c.num === chapNum);
  const chapPrecedent = [...book.chapitres].reverse().find(c => {
    if (c.datePublication && new Date(c.datePublication) > new Date()) return false;
    return c.num < chapNum;
  });
  const chapSuivant = book.chapitres.find(c => {
    if (c.datePublication && new Date(c.datePublication) > new Date()) return false;
    return c.num > chapNum;
  });

  page._wtHistoireId = book.id;
  page._wtChapNum = chapNum;

  const numDisp = _formatNumEp(chapNum, book);
  const titrePropre = ch?.titre && ch.titre !== 'Episode ' + chapNum && ch.titre !== 'Épisode ' + chapNum ? ch.titre : '';

  page.innerHTML = `
    <div class="lecture-header" id="wt-header">
      <button class="btn" onclick="closeWebtoon()">← Retour</button>
      <div class="lecture-titre" style="font-size:13px;text-align:center;flex:1">
        ${book.title}
        <span style="color:var(--text3);font-size:11px;display:block">Épisode ${numDisp}${titrePropre ? ' — ' + titrePropre : ''}</span>
      </div>
      <button class="btn btn-icon" onclick="toggleWTMenu()" style="background:none;border:1px solid rgba(180,190,255,.2);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">☰</button>
    </div>

    <div id="wt-ep-menu-overlay" onclick="closeWTMenu()" style="display:none;position:absolute;inset:0;z-index:99;background:rgba(0,0,0,.4)"></div>
    <div id="wt-ep-menu" style="display:none;position:absolute;top:0;right:0;width:min(280px,80vw);height:100%;background:var(--bg2);border-left:1px solid rgba(180,190,255,.1);z-index:100;flex-direction:column;overflow:hidden">
      <div style="padding:16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);border-bottom:1px solid rgba(180,190,255,.08);display:flex;justify-content:space-between;align-items:center">
        Épisodes <button onclick="closeWTMenu()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;line-height:1">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1">
        ${book.chapitres.map(c => {
          if (c.datePublication && new Date(c.datePublication) > new Date()) return '';
          const actif = c.num === chapNum;
          const n = _formatNumEp(c.num, book);
          const t = c.titre && c.titre !== 'Episode '+c.num && c.titre !== 'Épisode '+c.num ? ' — ' + c.titre : '';
          return `<div onclick="closeWTMenu();openWebtoon('${book.id}',${c.num})" style="padding:12px 16px;font-size:13px;color:${actif?'var(--accent)':'var(--text2)'};background:${actif?'rgba(126,159,212,.1)':'none'};cursor:pointer;border-bottom:1px solid rgba(180,190,255,.05)">Ép. ${n}${t}${c.gratuit?'':' 🎟'}</div>`;
        }).join('')}
      </div>
    </div>

    <div class="page-scroll" id="wt-scroll">
      <div style="padding:24px 16px 16px;text-align:center;background:var(--bg);border-bottom:1px solid rgba(180,190,255,.06)">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:4px">Épisode ${numDisp}</div>
        ${titrePropre ? `<div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text)">${titrePropre}</div>` : ''}
      </div>

      <div style="display:flex;flex-direction:column;width:100%;background:#000">
        ${strips.map((s,i) => `<img src="${s.image_url}" alt="" loading="${i<3?'eager':'lazy'}" style="display:block;width:100%;height:auto" onerror="this.style.display='none'">`).join('')}
      </div>

      <div style="padding:48px 24px 80px;display:flex;flex-direction:column;align-items:center;gap:12px;background:var(--bg)">
        <div style="font-size:24px;color:rgba(200,210,255,.3);letter-spacing:8px">✦</div>
        <div style="font-size:13px;color:var(--text3)">Fin de l'épisode ${numDisp}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px">
          ${chapPrecedent ? `<button class="btn" onclick="openWebtoon('${book.id}',${chapPrecedent.num})">← Épisode précédent</button>` : ''}
          ${chapSuivant ? `<button class="btn btn-accent" onclick="openWebtoon('${book.id}',${chapSuivant.num})">Épisode suivant →</button>` : `<div style="font-size:13px;color:var(--accent);padding:12px 0">Tu es à jour ! ✦</div>`}
        </div>
        <button onclick="closeWebtoon()" style="margin-top:4px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;font-family:'Jost',sans-serif;text-decoration:underline">← Retour à ${book.title}</button>
      </div>

      <!-- SECTION COMMENTAIRES — IDs préfixés wt-com pour éviter les conflits -->
      <div class="com-section" id="wt-com-section" style="padding:0 16px 80px">
        <div class="com-section-title">✦ Commentaires</div>
        <div id="wt-com-form-wrap" style="display:none">
          <textarea id="wt-com-input" class="com-input" placeholder="Laisse un commentaire…" maxlength="1000" rows="3"></textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <span id="wt-com-char-count" class="com-char-count">0 / 1000</span>
            <div class="com-tags-wrap">
              <label class="com-tag-label" id="wt-com-tag-spoiler-wrap">
                <input type="checkbox" id="wt-com-tag-spoiler"> ⚠️ Spoiler
              </label>
            </div>
            <button class="btn btn-accent com-submit-btn" onclick="soumettreCommentaire()">Publier ✦</button>
          </div>
          <div id="wt-com-error" class="com-error" style="display:none"></div>
        </div>
        <div id="wt-com-login-msg" class="com-login-msg" style="display:none">
          <span>Connecte-toi pour laisser un commentaire</span>
          <button class="btn btn-accent" style="font-size:12px;padding:6px 14px" onclick="go('p-connexion-modal')">Se connecter</button>
        </div>
        <div id="wt-com-liste"></div>
        <div id="wt-com-loading" class="com-loading">Chargement…</div>
        <button id="wt-com-load-more" class="com-load-more" style="display:none" onclick="chargerPlusCommentaires()">Voir plus de commentaires</button>
      </div>
    </div>
  `;
}

function closeWebtoon() {
  go('p-histoire');
}

function toggleWTMenu() {
  const menu = document.getElementById('wt-ep-menu');
  const overlay = document.getElementById('wt-ep-menu-overlay');
  if (!menu) return;
  const open = menu.style.display !== 'none';
  menu.style.display = open ? 'none' : 'flex';
  if (overlay) overlay.style.display = open ? 'none' : 'block';
}

function closeWTMenu() {
  const menu = document.getElementById('wt-ep-menu');
  const overlay = document.getElementById('wt-ep-menu-overlay');
  if (menu) menu.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
}

function _marquerEpisodeLu(histoireId, chapNum) {
  const key = 'chapitres_lus_' + histoireId;
  const lus = JSON.parse(localStorage.getItem(key) || '[]');
  if (!lus.includes(chapNum)) { lus.push(chapNum); localStorage.setItem(key, JSON.stringify(lus)); }
}

function _formatNumEp(num, book) {
  if (book && book.numerotation === 'romain' && typeof toRoman === 'function') return toRoman(num);
  return num;
}
