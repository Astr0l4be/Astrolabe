
/* ── OPTIONS SPICY/SOFT ── */
function toggleInfoSpicy(){
  const el=document.getElementById('info-spicy');
  if(el) el.style.display=el.style.display==='none'?'block':'none';
}

function setAfficherChoixVersion(val){
  compte.afficherChoixVersion=val;
  savePrefs();
}

function setVersionDefaut(version){
  compte.versionDefaut=version;
  window._versionDefautCourante=version;
  const btnSoft=document.getElementById('vdef-soft-btn');
  const btnSpicy=document.getElementById('vdef-spicy-btn');
  if(btnSoft) btnSoft.classList.toggle('ch-version-active', version==='soft');
  if(btnSpicy) btnSpicy.classList.toggle('ch-version-active', version==='spicy');
  savePrefs();
  // Recharger le chapitre en cours si on y est
  const surChapitre=document.getElementById('p-lecture')?.classList.contains('active');
  if(surChapitre && currentHistoireId && window._chapNumCourant){
    if(window._versionsChoisies) delete window._versionsChoisies[window._chapNumCourant];
    openLecture(currentHistoireId, window._chapNumCourant);
  }
}

function setOptAfficherVersion(prefix, val){
}

function setOptVersionDefaut(prefix, version){
  const btnSoft=document.getElementById('opt-'+prefix+'-vdef-soft');
  const btnSpicy=document.getElementById('opt-'+prefix+'-vdef-spicy');
  if(btnSoft) btnSoft.classList.toggle('ch-version-active', version==='soft');
  if(btnSpicy) btnSpicy.classList.toggle('ch-version-active', version==='spicy');
}

function syncVersionToggles(){
  const togV=document.getElementById('toggle-afficher-version');
  if(togV) togV.checked=compte.afficherChoixVersion;
  const rowVD=document.getElementById('row-version-defaut');
  if(rowVD) rowVD.style.display='block';
  const btnSoft=document.getElementById('vdef-soft-btn');
  const btnSpicy=document.getElementById('vdef-spicy-btn');
  if(btnSoft) btnSoft.classList.toggle('ch-version-active', compte.versionDefaut==='soft');
  if(btnSpicy) btnSpicy.classList.toggle('ch-version-active', compte.versionDefaut!=='soft');
}

function cocherVersion(chapNum, version){
  if(!window._versionsChoisies) window._versionsChoisies={};
  window._versionsChoisies[chapNum]=version;
  const btnSoft=document.getElementById('vbtn-soft-'+chapNum);
  const btnSpicy=document.getElementById('vbtn-spicy-'+chapNum);
  if(btnSoft) btnSoft.classList.toggle('ch-version-active', version==='soft');
  if(btnSpicy) btnSpicy.classList.toggle('ch-version-active', version==='spicy');
}

async function ouvrirVersionChoisie(bookId, chapNum){
  // _versionsChoisies est déjà mis à jour par cocherVersion
  // loadContenuChapitre le lira directement
  await openLecture(bookId, chapNum);
}

function ouvrirPopupVersionNav(bookId, chapNum){
  window._navBookId=bookId;
  window._navChapNum=chapNum;
  document.getElementById('version-nav-popup').classList.add('open');
}

async function ouvrirVersionChoisieNav(bookId, chapNum, version){
  // Mémoriser le choix dans _versionsChoisies pour mettre à jour la liste des chapitres
  if(!window._versionsChoisies) window._versionsChoisies={};
  window._versionsChoisies[chapNum]=version;
  // Mettre à jour visuellement les boutons dans la liste si elle est visible
  cocherVersion(chapNum, version);
  window._versionForcee=version;
  await openLecture(bookId, chapNum);
  window._versionForcee=null;
}

async function openLecture(bookId,chapNum){
  const b=BOOKS.find(x=>x.id===bookId);
  if(!b)return;
  const contenu=await loadContenuChapitre(bookId,chapNum);
  const ch=b.chapitres.find(c=>c.num===chapNum);
  if(!ch)return;
  if(!contenu){
    document.getElementById('lecture-body').innerHTML='<p style="text-align:center;color:var(--text3)">Chapitre à venir…</p>';
    go('p-lecture');return;
  }
  document.getElementById('lecture-titre').textContent=b.title;
  window._chapNumCourant=chapNum;

  // Sauvegarder marque-page
  if(typeof sauvegarderMarquePage==='function') sauvegarderMarquePage(bookId,chapNum);

  // Marquer le chapitre comme lu
  const _clKey='chapitres_lus_'+bookId;
  const _lus=JSON.parse(localStorage.getItem(_clKey)||'[]');
  if(_lus.indexOf(chapNum)===-1){ _lus.push(chapNum); localStorage.setItem(_clKey,JSON.stringify(_lus)); }
  // Mettre à jour visuellement le bouton dans la liste sans recharger
  document.querySelectorAll('.ch-lire-row .btn-lire').forEach(btn=>{
    const t=btn.querySelector('.ch-lire-titre');
    if(t&&t.textContent.startsWith('Ch.'+chapNum+' '))btn.classList.add('btn-lire-lu');
  });

  // Suggestion d'abonnement au 3ème chapitre lu (connecté, pas déjà abonné, pas déjà refusé)
  if(compte.loggedIn && _lus.length === 3 && !_estAbonne) {
    const refus = JSON.parse(localStorage.getItem('abo_refus') || '{}');
    if (!refus[bookId]) {
      setTimeout(() => openModal('abo-suggestion-popup'), 800);
    }
  }

  // Numéro du chapitre — arabe ou romain
  const numAffiche=(b.numerotation==='romain')?toRoman(chapNum):chapNum;
  let html=`<div class="lecture-ch-num"><span class="lecture-star-side">✦</span>Chapitre ${numAffiche}<span class="lecture-star-side">✦</span></div>`;

  // Titre du chapitre
  if(ch.titre)html+=`<div class="lecture-ch-title">${ch.titre}</div>`;

  // Citation + Auteur
  if(ch.citation){
    html+=`<div class="lecture-citation">`;
    html+=`<div class="lecture-citation-texte">${ch.citation}</div>`;
    if(ch.citation_auteur)html+=`<div class="lecture-citation-auteur">${ch.citation_auteur}</div>`;
    html+=`</div>`;
  }

  html+=`<div class="lecture-ch-sep">✦</div>`;

  // Parser le contenu en blocs
  const parties=contenu.split(/(<pov>[^<]*<\/pov>|<img-bloc>[^<]*<\/img-bloc>)/g);
  parties.forEach(partie=>{
    partie=partie.trim();
    if(!partie)return;

    if(partie.startsWith('<pov>')){
      // Bloc POV
      const nom=partie.replace(/<\/?pov>/g,'').trim();
      if(nom)html+=`<div class="lecture-pov">${nom}</div>`;

    } else if(partie.startsWith('<img-bloc>')){
      // Bloc image
      const url=partie.replace(/<\/?img-bloc>/g,'').trim();
      if(url)html+=`<div class="lecture-img-bloc"><img src="${url}" alt="" loading="lazy"></div>`;

    } else {
      // Bloc texte — parser paragraphe par paragraphe
      partie.split('\n\n').forEach(para=>{
        para=para.trim();
        if(!para)return;
        // Conserver les divs d'alignement
        if(para.startsWith('<div')){
          // Appliquer typographie française à l'intérieur
          para=para
            .replace(/ ([?!:;»])/g,'\u00a0$1')
            .replace(/(«) /g,'$1\u00a0');
          html+=para;
          return;
        }
        // Typographie française
        para=para
          .replace(/ ([?!:;»])/g,'\u00a0$1')
          .replace(/(«) /g,'$1\u00a0');
        const isD=para.startsWith('—')||para.startsWith('-');
        html+=`<p class="${isD?'d':''}">${para.replace(/\n/g,'<br>')}</p>`;
      });
    }
  });

  // TW chapitre — priorité TW du chapitre, sinon TW de l'histoire
  const showTWCh=compte.twrChapitre===true;
  const histPrefs=optParHistoire[bookId];
  const useTWCh=histPrefs?histPrefs.twrChapitre:showTWCh;
  if(ch.tw&&useTWCh){html=`<div class="tw-box" style="margin:0 0 20px"><div class="tw-label">Trigger warnings</div><div class="tw-text">${ch.tw}</div></div>`+html;}

  document.getElementById('lecture-body').innerHTML=html;

  // Navigation chapitres
  const nav=document.getElementById('lecture-nav');
  const prev=b.chapitres.find(c=>c.num===chapNum-1);
  const next=b.chapitres.find(c=>c.num===chapNum+1);
  nav.innerHTML='';
  const prevNum=prev?(b.numerotation==='romain'?toRoman(prev.num):prev.num):null;
  const nextNum=next?(b.numerotation==='romain'?toRoman(next.num):next.num):null;
  if(prev){
    const prevAccessible=prev.gratuit===true||_chapitreDejAchete(bookId,prev.num)||compte.role==='admin'||(compte.role==='autrice'&&_estAutriceDeLHistoire(b));
    const prevPrix=b.prix_ticket||1;
    if(!prevAccessible){
      nav.innerHTML+=`<button class="btn btn-full" style="flex:1" onclick="ouvrirPopupAchat('${bookId}',${prev.num})">← 🎟 Ch.${prevNum} (${prevPrix} ticket${prevPrix>1?'s':''})</button>`;
    } else {
      nav.innerHTML+=`<button class="btn btn-full" style="flex:1" onclick="openLecture('${bookId}',${prev.num})">← Ch.${prevNum}</button>`;
    }
  }
  if(next){
    const nextEstSpicySoft=(compte.trancheAge==='adulte' || window._versionForcee) && b.adulte && b.versionSoft && next.spicy;
    if(nextEstSpicySoft && !compte.afficherChoixVersion){
      // Un bouton qui ouvre le popup de choix
      nav.innerHTML+=`<button class="btn btn-full btn-accent" style="flex:1" onclick="ouvrirPopupVersionNav('${bookId}',${next.num})">Ch.${nextNum} →</button>`;
    } else if(nextEstSpicySoft && compte.afficherChoixVersion){
      // Ouvrir directement la version par défaut
      nav.innerHTML+=`<button class="btn btn-full btn-accent" style="flex:1" onclick="ouvrirVersionChoisieNav('${bookId}',${next.num},'${compte.versionDefaut||'spicy'}')">Ch.${nextNum} →</button>`;
    } else {
      nav.innerHTML+=`<button class="btn btn-full btn-accent" style="flex:1" onclick="openLecture('${bookId}',${next.num})">Ch.${nextNum} →</button>`;
    }
  }

  document.getElementById('lecture-back-btn').onclick=()=>{
    _sauvegarderScrollPosition(bookId,chapNum);
    quitterImmersif();
    // Sauvegarder le marque-page et rafraîchir la liste immédiatement
    const _mp=JSON.parse(localStorage.getItem('marque_pages')||'{}');
    _mp[bookId]=chapNum;
    localStorage.setItem('marque_pages',JSON.stringify(_mp));
    if(typeof _renderChapitresList==='function'){
      const _b=BOOKS.find(x=>x.id===bookId);
      if(_b) _renderChapitresList(_b,window._versionsChoisies||{},chapNum);
    }
    go('p-histoire');
  };
  const _scrollKey='scroll_'+bookId+'_'+chapNum;
  const _savedScroll=localStorage.getItem(_scrollKey);
  // Remettre la barre de progression à 0
  const progressBar=document.getElementById('lecture-progress-bar');
  if(progressBar) progressBar.style.width='0%';
  // Quitter le mode immersif si changement de chapitre
  quitterImmersif();
  // Ne remettre à zéro que s'il n'y a pas de position sauvegardée
  if(!_savedScroll) document.querySelector('#p-lecture .page-scroll').scrollTop=0;
  // Mettre à jour l'URL (sauf si appelé depuis popstate)
  const _sansHistLect = arguments[2];
  if(!_sansHistLect && typeof _pushURL === 'function') _pushURL('p-lecture', { histoireId: bookId, chapNum });
  go('p-lecture', true);
  setTimeout(()=>applyLectureModeForHistoire(bookId),50);
  // Charger les commentaires et les likes
  if(typeof initCommentaires==='function') initCommentaires(bookId,chapNum).catch(()=>{});
  if(typeof initLikeChapitre==='function') initLikeChapitre(bookId,chapNum).catch(()=>{});

  // Détecter la fin du chapitre (scroll à moins de 200px de la fin)
  const _scroller=document.querySelector('#p-lecture .page-scroll');
  if(_scroller){
    const _onScroll=()=>{
      // Barre de progression
      const progressBar=document.getElementById('lecture-progress-bar');
      if(progressBar){
        const scrolled=_scroller.scrollTop;
        const total=_scroller.scrollHeight-_scroller.clientHeight;
        progressBar.style.width=(total>0?Math.min(100,(scrolled/total)*100):0)+'%';
      }
      const distanceFin=_scroller.scrollHeight-_scroller.scrollTop-_scroller.clientHeight;
      if(distanceFin<200){
        localStorage.setItem('chapitre_fini_'+bookId+'_'+chapNum,'1');
        _scroller.removeEventListener('scroll',_onScroll);
      }
    };
    _scroller.removeEventListener('scroll',_scroller._lastScrollHandler||null);
    _scroller._lastScrollHandler=_onScroll;
    _scroller.addEventListener('scroll',_onScroll);
  }

  if(_savedScroll!==null){
    setTimeout(()=>{
      const scroller=document.querySelector('#p-lecture .page-scroll');
      const savedScroll=parseInt(_savedScroll);
      // Supprimer ancien trait
      const ancienTrait=document.getElementById('reprise-trait');
      if(ancienTrait) ancienTrait.remove();
      // Trouver le premier paragraphe après la position sauvegardée
      const paragraphes=Array.from(document.querySelectorAll('#lecture-body p, #lecture-body .lecture-pov, #lecture-body .lecture-citation'));
      let cible=null;
      for(let i=0;i<paragraphes.length;i++){
        if(paragraphes[i].offsetTop>=savedScroll){cible=paragraphes[i];break;}
      }
      if(cible&&savedScroll>50){
        const trait=document.createElement('div');
        trait.id='reprise-trait';
        trait.style.cssText='width:100%;height:1px;background:var(--accent);opacity:0.45;margin:4px 0 14px;position:relative;flex-shrink:0;';
        const label=document.createElement('span');
        label.textContent='✦ reprise de lecture';
        label.style.cssText='position:absolute;left:50%;transform:translateX(-50%);top:-9px;background:var(--bg);padding:0 10px;font-size:10px;color:var(--accent);opacity:0.7;letter-spacing:1px;white-space:nowrap;font-family:"Jost",sans-serif;';
        trait.appendChild(label);
        cible.parentNode.insertBefore(trait,cible);
      }
      scroller.scrollTop=savedScroll;
    },150);
  }

  // Taille du texte
  const lb2=document.getElementById('lecture-body');
  const prefsT=optParHistoire[bookId];
  const t=prefsT&&prefsT.taille?prefsT.taille:tailleLecture;
  if(lb2)lb2.style.fontSize=TAILLES[t]+'px';
  ajouterBiblioContinuer(bookId,chapNum);
}

/* CONVERSION CHIFFRES ROMAINS */
function toRoman(num){
  const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r='';
  for(let i=0;i<vals.length;i++){while(num>=vals[i]){r+=syms[i];num-=vals[i];}}
  return r;
}

function ajouterBiblioContinuer(bookId, chapNum){
  let enCours=JSON.parse(localStorage.getItem('biblio_continuer')||'[]');
  enCours=enCours.filter(e=>e.id!==bookId);
  enCours.unshift({id:bookId,chapNum});
  enCours=enCours.slice(0,20);
  localStorage.setItem('biblio_continuer',JSON.stringify(enCours));
  renderBiblioContinuer();
}

function renderBiblioContinuer(){
  const el=document.getElementById('biblio-continuer');
  if(!el)return;
  const enCours=JSON.parse(localStorage.getItem('biblio_continuer')||'[]');
  if(!enCours.length){el.innerHTML='<span class="biblio-empty">Aucune lecture en cours</span>';return;}
  el.innerHTML=enCours.map(e=>{
    const b=BOOKS.find(x=>x.id===e.id);
    if(!b)return'';
    const img=b.cover?`<img src="${b.cover}" alt="${b.title}">`:`<div class="biblio-card-bg ${b.color}">✦</div>`;
    return`<div class="biblio-card" onclick="openHistoire('${b.id}')" title="${b.title} — Ch.${e.chapNum}">${img}</div>`;
  }).join('');
}

/* MODE LECTURE */
let modeJour=localStorage.getItem('modeJour')==='1';
let textesBlancs=localStorage.getItem('textesBlancs')==='1';
let tailleLecture=localStorage.getItem('tailleLecture')||'normal';
const TAILLES={'petit':13,'normal':15,'grand':17,'tres-grand':20};

function setTaille(taille){
  tailleLecture=taille;
  localStorage.setItem('tailleLecture',taille);
  // Appliquer au corps de lecture
  const lb=document.getElementById('lecture-body');
  if(lb)lb.style.fontSize=TAILLES[taille]+'px';
  // Mettre à jour les boutons Mon Compte
  ['petit','normal','grand','tres-grand'].forEach(t=>{
    const btn=document.getElementById('compte-taille-'+t.replace('-',''));
    if(btn)btn.classList.toggle('btn-taille-sel',t===taille);
  });
  syncTailleBtns('compte',taille);
}

function setOptTaille(prefix,taille){
  syncTailleBtns(prefix,taille);
  // Stocker temporairement dans un dataset sur le panel
  const panel=document.getElementById('opt-panel-'+(prefix==='c'?'cette':'toutes'));
  if(panel)panel.dataset.taille=taille;
}

function syncTailleBtns(prefix,taille){
  ['p','n','g','tg'].forEach((suf,i)=>{
    const keys=['petit','normal','grand','tres-grand'];
    const id=prefix==='compte'?`compte-taille-${suf}`:`opt-${prefix}-taille-${suf}`;
    const btn=document.getElementById(id);
    if(btn)btn.classList.toggle('btn-taille-sel',keys[i]===taille);
  });
}

function initTailleBtns(){
  syncTailleBtns('compte',tailleLecture);
  syncTailleBtns('c',tailleLecture);
  syncTailleBtns('t',tailleLecture);
}
function toggleModeJour(actif){
  modeJour=actif;
  localStorage.setItem('modeJour',actif?'1':'0');
  document.getElementById('mode-lecture-label').textContent=actif?'Jour':'Nuit';
  document.getElementById('row-couleur-texte').style.display=actif?'none':'flex';
  const togModeJour=document.getElementById('toggle-mode-jour');
  if(togModeJour)togModeJour.checked=actif;
  const lp=document.getElementById('p-lecture');
  if(lp)lp.classList.toggle('mode-jour-lecture',actif);
}
function setTexte(couleur){
  textesBlancs=(couleur==='blanc');
  localStorage.setItem('textesBlancs',textesBlancs?'1':'0');
  document.getElementById('btn-texte-bleu').style.opacity=textesBlancs?'0.5':'1';
  document.getElementById('btn-texte-blanc').style.opacity=textesBlancs?'1':'0.5';
  applyLectureMode();
}
function applyLectureMode(){
  const lb=document.getElementById('lecture-body');
  if(!lb)return;
  lb.classList.remove('texte-bleu','texte-blanc');
  if(!modeJour){lb.classList.add(textesBlancs?'texte-blanc':'texte-bleu');}
  const lp=document.getElementById('p-lecture');
  if(lp)lp.classList.toggle('mode-jour-lecture',modeJour);
  // Appliquer la couleur aux titres de chapitre
  const couleur=modeJour?'':textesBlancs?'#eef0fa':'var(--accent)';
  document.querySelectorAll('.lecture-ch-num,.lecture-ch-title,.lecture-pov').forEach(el=>{
    el.style.color=modeJour?'':'couleur';
    el.style.color=couleur;
  });
}

/* ══════════════════════════════════════════════════════
   MODE IMMERSIF
   ══════════════════════════════════════════════════════ */

let _modeImmersif = false;

function toggleImmersif() {
  _modeImmersif = !_modeImmersif;
  document.getElementById('p-lecture').classList.toggle('mode-immersif', _modeImmersif);
  const btn = document.getElementById('btn-immersif');
  if (btn) btn.title = _modeImmersif ? 'Quitter le mode immersif' : 'Mode immersif';
}

function quitterImmersif() {
  _modeImmersif = false;
  document.getElementById('p-lecture').classList.remove('mode-immersif');
}

function syncCompteToggles(){
  const togAdulte=document.getElementById('toggle-adulte');
  const togTWH=document.getElementById('toggle-tw-histoire');
  const togTWC=document.getElementById('toggle-tw-chapitre');
  const togTWF=document.getElementById('toggle-tw-filtre-actif');
  if(togAdulte)togAdulte.checked=compte.adulte;
  if(togTWH)togTWH.checked=compte.twrHistoire;
  if(togTWC)togTWC.checked=compte.twrChapitre;
  if(togTWF){
    togTWF.checked=compte.twFiltreActif||false;
    const panel=document.getElementById('tw-filtre-panel');
    if(compte.twFiltreActif){
      if(panel)panel.style.display='block';
      _renderTWFiltreListe();
    } else {
      if(panel)panel.style.display='none';
    }
  }
  const rowAdulte=document.getElementById('row-adulte');
  if(rowAdulte)rowAdulte.style.display=compte.estAdulteAge?'flex':'none';
  // Restaurer le mode lecture sauvegardé
  toggleModeJour(modeJour);
  setTexte(textesBlancs?'blanc':'bleu');
  initTailleBtns();
  renderBiblioContinuer();
  syncVersionToggles();
}

/* OPTIONS LECTURE */
let optOnglet='cette'; // onglet actif dans le popup
let optParHistoire={};  // prefs spécifiques par histoire { [id]: {modeJour, textesBlancs, twrHistoire, twrChapitre} }
let currentHistoireId=null;

// Helpers pour remplir/lire les contrôles d'un onglet
function _setOngletControls(prefix, prefs){
  const mj=prefs.modeJour||false;
  const tb=prefs.textesBlancs||false;
  const t=prefs.taille||tailleLecture;
  document.getElementById('opt-'+prefix+'-mode-jour').checked=mj;
  document.getElementById('opt-'+prefix+'-mode-label').textContent=mj?'Jour':'Nuit';
  document.getElementById('opt-'+prefix+'-row-couleur').style.display=mj?'none':'flex';
  _setOptTexte(prefix, tb?'blanc':'bleu');
  document.getElementById('opt-'+prefix+'-tw-histoire').checked=prefs.twrHistoire!==false;
  document.getElementById('opt-'+prefix+'-tw-chapitre').checked=prefs.twrChapitre===true;
  const affV=prefs.afficherChoixVersion===true;
  const togAV=document.getElementById('opt-'+prefix+'-afficher-version');
  if(togAV) togAV.checked=affV;
  const rowVD=document.getElementById('opt-'+prefix+'-row-version-defaut');
  if(rowVD) rowVD.style.display='block';
  setOptVersionDefaut(prefix, prefs.versionDefaut||'spicy');
  syncTailleBtns(prefix,t);
  const panel=document.getElementById('opt-panel-'+(prefix==='c'?'cette':'toutes'));
  if(panel)panel.dataset.taille=t;
}
function _getOngletValues(prefix){
  const panel=document.getElementById('opt-panel-'+(prefix==='c'?'cette':'toutes'));
  return {
    modeJour: document.getElementById('opt-'+prefix+'-mode-jour').checked,
    textesBlancs: document.getElementById('opt-'+prefix+'-btn-blanc').dataset.sel==='1',
    twrHistoire: document.getElementById('opt-'+prefix+'-tw-histoire').checked,
    twrChapitre: document.getElementById('opt-'+prefix+'-tw-chapitre').checked,
    afficherChoixVersion: (document.getElementById('opt-'+prefix+'-afficher-version')||{checked:false}).checked,
    versionDefaut: document.getElementById('opt-'+prefix+'-vdef-spicy')?.classList.contains('ch-version-active')?'spicy':'soft',
    taille: panel&&panel.dataset.taille?panel.dataset.taille:tailleLecture,
  };
}
function _setOptTexte(prefix, couleur){
  document.getElementById('opt-'+prefix+'-btn-bleu').dataset.sel=couleur==='bleu'?'1':'0';
  document.getElementById('opt-'+prefix+'-btn-blanc').dataset.sel=couleur==='blanc'?'1':'0';
  document.getElementById('opt-'+prefix+'-btn-bleu').style.opacity=couleur==='bleu'?'1':'0.5';
  document.getElementById('opt-'+prefix+'-btn-blanc').style.opacity=couleur==='blanc'?'1':'0.5';
}

// Changement mode jour/nuit dans les onglets
function optCModeChange(checked){
  document.getElementById('opt-c-mode-label').textContent=checked?'Jour':'Nuit';
  document.getElementById('opt-c-row-couleur').style.display=checked?'none':'flex';
}
function optTModeChange(checked){
  document.getElementById('opt-t-mode-label').textContent=checked?'Jour':'Nuit';
  document.getElementById('opt-t-row-couleur').style.display=checked?'none':'flex';
}
function setOptCTexte(c){_setOptTexte('c',c);}
function setOptTTexte(c){_setOptTexte('t',c);}

// Afficher un onglet
function afficherOnglet(onglet){
  optOnglet=onglet;
  document.getElementById('opt-btn-cette').className='btn btn-full'+(onglet==='cette'?' btn-accent':'');
  document.getElementById('opt-btn-toutes').className='btn btn-full'+(onglet==='toutes'?' btn-accent':'');
  document.getElementById('opt-panel-cette').style.display=onglet==='cette'?'block':'none';
  document.getElementById('opt-panel-toutes').style.display=onglet==='toutes'?'block':'none';
}

// Ouvrir le popup
function openOptionsPopup(bookId){
  currentHistoireId=bookId;
  // Remplir onglet "cette histoire" avec les prefs spécifiques ou les prefs générales par défaut
  const prefsGlobales={modeJour,textesBlancs,twrHistoire:compte.twrHistoire,twrChapitre:compte.twrChapitre,afficherChoixVersion:compte.afficherChoixVersion,versionDefaut:compte.versionDefaut};
  const prefsC=Object.assign({},prefsGlobales,optParHistoire[bookId]||{});
  _setOngletControls('c', prefsC);
  // Remplir onglet "toutes les histoires" avec les prefs générales
  _setOngletControls('t', {modeJour,textesBlancs,twrHistoire:compte.twrHistoire,twrChapitre:compte.twrChapitre,afficherChoixVersion:compte.afficherChoixVersion,versionDefaut:compte.versionDefaut});
  // Ouvrir sur onglet "cette histoire"
  afficherOnglet('toutes');
  openModal('options-popup');
}

// Valider
function saveOptions(){
  if(optOnglet==='cette'){
    const v=_getOngletValues('c');
    optParHistoire[currentHistoireId]=v;
    window._versionDefautCourante=v.versionDefaut;
    const lp=document.getElementById('p-lecture');
    if(lp)lp.classList.toggle('mode-jour-lecture',v.modeJour);
    const lb=document.getElementById('lecture-body');
    if(lb){
      lb.classList.remove('texte-bleu','texte-blanc');
      if(!v.modeJour)lb.classList.add(v.textesBlancs?'texte-blanc':'texte-bleu');
      lb.style.fontSize=TAILLES[v.taille||'normal']+'px';
    }
    document.querySelectorAll('.lecture-ch-num,.lecture-ch-title,.lecture-pov').forEach(el=>{
      el.style.color=v.modeJour?'#1a1510':v.textesBlancs?'#eef0fa':'var(--accent)';
    });
  } else {
    const v=_getOngletValues('t');
    modeJour=v.modeJour; textesBlancs=v.textesBlancs; tailleLecture=v.taille||'normal';
    compte.twrHistoire=v.twrHistoire; compte.twrChapitre=v.twrChapitre;
    compte.afficherChoixVersion=v.afficherChoixVersion; compte.versionDefaut=v.versionDefaut||'spicy';
    syncVersionToggles();
    localStorage.setItem('tailleLecture',tailleLecture);
    toggleModeJour(v.modeJour); setTexte(v.textesBlancs?'blanc':'bleu');
    syncTailleBtns('compte',tailleLecture);
    const togTWH=document.getElementById('toggle-tw-histoire');if(togTWH)togTWH.checked=v.twrHistoire;
    const togTWC=document.getElementById('toggle-tw-chapitre');if(togTWC)togTWC.checked=v.twrChapitre;
    savePrefs();
    if(!optParHistoire[currentHistoireId]){
      const lp=document.getElementById('p-lecture');
      if(lp)lp.classList.toggle('mode-jour-lecture',v.modeJour);
      const lb=document.getElementById('lecture-body');
      if(lb){
        lb.classList.remove('texte-bleu','texte-blanc');
        if(!v.modeJour)lb.classList.add(v.textesBlancs?'texte-blanc':'texte-bleu');
        lb.style.fontSize=TAILLES[v.taille||'normal']+'px';
      }
      document.querySelectorAll('.lecture-ch-num,.lecture-ch-title,.lecture-pov').forEach(el=>{
        el.style.color=v.modeJour?'#1a1510':v.textesBlancs?'#eef0fa':'var(--accent)';
      });
    }
  }
  // Mettre à jour _versionDefautCourante — priorité aux prefs de cette histoire
  const prefsHistCourante=optParHistoire[currentHistoireId];
  window._versionDefautCourante=(prefsHistCourante&&prefsHistCourante.versionDefaut)||compte.versionDefaut||'spicy';

  // Vider _versionsChoisies pour que _renderChapitresList recalcule avec la nouvelle versionDefaut
  window._versionsChoisies={};

  // Vérifier si on est sur le chapitre AVANT de fermer le popup
  const surChapitre=document.getElementById('p-lecture')?.classList.contains('active');
  const chapARecharger=(surChapitre && currentHistoireId && window._chapNumCourant);

  closeM('options-popup');
  refreshTWHistoire();
  refreshChapitresList(currentHistoireId);

  if(chapARecharger){
    if(window._versionsChoisies) delete window._versionsChoisies[window._chapNumCourant];
    openLecture(currentHistoireId, window._chapNumCourant);
  }
}

function refreshChapitresList(bookId){
  const b=BOOKS.find(x=>x.id===bookId);
  if(!b) return;
  if(!window._versionsChoisies) window._versionsChoisies={};
  if(typeof _renderChapitresList==='function'){
    if(compte.loggedIn&&compte.userId){
      db.from('marque_pages').select('chapitre_num').eq('user_id',compte.userId).eq('histoire_id',bookId).single()
        .then(({data})=>{ _renderChapitresList(b,window._versionsChoisies,data?data.chapitre_num:null); });
    } else {
      const mp=JSON.parse(localStorage.getItem('marque_pages')||'{}');
      _renderChapitresList(b,window._versionsChoisies,mp[bookId]||null);
    }
  }
}

function _sauvegarderScrollPosition(bookId,chapNum){
  const scroller=document.querySelector('#p-lecture .page-scroll');
  if(!scroller) return;
  localStorage.setItem('scroll_'+bookId+'_'+chapNum, Math.round(scroller.scrollTop));
}

function ouvrirPopupResetOptions(){
  closeM('options-popup');
  openModal('reset-options-popup');
}

function confirmerResetOptions(){
  optParHistoire={};
  closeM('reset-options-popup');
  openModal('reset-options-popup2');
}

function applyLectureModeForHistoire(bookId){
  const prefs=optParHistoire[bookId];
  const mj=prefs?prefs.modeJour:modeJour;
  const tb=prefs?prefs.textesBlancs:textesBlancs;
  const lp=document.getElementById('p-lecture');
  if(lp)lp.classList.toggle('mode-jour-lecture',mj);
  const lb=document.getElementById('lecture-body');
  if(lb){
    lb.classList.remove('texte-bleu','texte-blanc');
    if(!mj)lb.classList.add(tb?'texte-blanc':'texte-bleu');
  }
  document.querySelectorAll('.lecture-ch-num,.lecture-ch-title,.lecture-pov').forEach(el=>{
    el.style.color=mj?'#1a1510':tb?'#eef0fa':'var(--accent)';
  });
}


/* ══════════════════════════════════════════════════════
   VISIONNEUSE BD
   ══════════════════════════════════════════════════════ */

let _bdPlanches = [];
let _bdPageCourante = 0;
let _bdHistoireId = null;
let _bdChapNum = null;
let _bdTouchStartX = 0;

async function openLectureBD(histoireId, chapNum) {
  _bdHistoireId = histoireId;
  _bdChapNum = chapNum;
  _bdPageCourante = 0;

  const b = BOOKS.find(x => x.id === histoireId);
  if (!b) return;

  // Charger les planches depuis Supabase
  const { data, error } = await db.from('episodes_images')
    .select('image_url, ordre')
    .eq('histoire_id', histoireId)
    .eq('chapitre_num', chapNum)
    .order('ordre');

  if (error || !data || !data.length) {
    alert('Aucune planche disponible pour cet épisode.');
    return;
  }

  _bdPlanches = data.map(d => d.image_url);

  // Titres
  const ch = b.chapitres.find(c => c.num === chapNum);
  document.getElementById('bd-titre').textContent = b.title + (ch?.titre ? ' — ' + ch.titre : '');

  // Bouton retour
  document.getElementById('bd-back-btn').onclick = () => {
    quitterImmersif();
    go('p-histoire');
  };

  const v = document.getElementById('bd-viewer');

  // Bloquer la propagation sur les boutons fléchés (une seule fois)
  const prevBtn = document.getElementById('bd-prev');
  const nextBtn = document.getElementById('bd-next');
  if (!prevBtn._stopAdded) {
    prevBtn._stopAdded = true;
    prevBtn.addEventListener('click', e => e.stopPropagation());
  }
  if (!nextBtn._stopAdded) {
    nextBtn._stopAdded = true;
    nextBtn.addEventListener('click', e => e.stopPropagation());
  }

  // Swipe + tap — ajoutés une seule fois sur le viewer
  if (!v._bdListeners) {
    v._bdListeners = true;
    let _bdSwiped = false;
    v.addEventListener('touchstart', e => {
      _bdTouchStartX = e.touches[0].clientX;
      _bdSwiped = false;
    }, { passive: true });
    v.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - _bdTouchStartX;
      if (Math.abs(dx) > 40) {
        _bdSwiped = true;
        bdNaviger(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
    v.addEventListener('click', e => {
      if (_bdSwiped) { _bdSwiped = false; return; }
      // Ignorer les clics sur la page de fin (like, commentaires, boutons nav)
      if (e.target.closest('#bd-fin-wrap')) return;
      const x = e.clientX;
      const w = v.offsetWidth;
      if (x < w * 0.35) bdNaviger(-1);
      else if (x > w * 0.65) bdNaviger(1);
    });
  }

  // Marque-page + lecture
  if (typeof sauvegarderMarquePage === 'function') sauvegarderMarquePage(histoireId, chapNum);
  const _clKey = 'chapitres_lus_' + histoireId;
  const _lus = JSON.parse(localStorage.getItem(_clKey) || '[]');
  if (_lus.indexOf(chapNum) === -1) { _lus.push(chapNum); localStorage.setItem(_clKey, JSON.stringify(_lus)); }
  // Mettre à jour visuellement le bouton dans la liste sans recharger
  document.querySelectorAll('.ch-lire-row .btn-lire').forEach(btn=>{
    const t=btn.querySelector('.ch-lire-titre');
    if(t&&t.textContent.startsWith('Ch.'+chapNum+' '))btn.classList.add('btn-lire-lu');
  });

  // Like + commentaires (section après les planches)
  document.getElementById('bd-like-wrap').style.display = 'none';

  // Page TW avant la première planche si option cochée
  const _showTWBD = compte.twrChapitre === true;
  const _histPrefsBD = typeof optParHistoire !== 'undefined' ? optParHistoire[histoireId] : null;
  const _useTWBD = _histPrefsBD ? _histPrefsBD.twrChapitre : _showTWBD;
  const _twBD = ch && ch.tw ? ch.tw : null;
  if (_twBD && _useTWBD) {
    // Insérer une planche TW fictive en premier (URL spéciale)
    _bdPlanches.unshift('__TW__:' + _twBD);
  }

  _bdAfficherPage(0);

  // Précharger les 3 premières vraies planches dès l'ouverture
  _bdPlanches.filter(p => !p.startsWith('__TW__:')).slice(0, 3).forEach(url => {
    const pre = new Image();
    pre.src = url;
  });

  go('p-bd');

  // Charger likes et commentaires en arrière-plan
  if (typeof initLikeChapitre === 'function') {
    // Réutilise les mêmes IDs que le lecteur roman mais dans le contexte BD
    _chapLikeHistoireId = histoireId;
    _chapLikeNum = chapNum;
    initLikeChapitre(histoireId, chapNum).catch(() => {});
  }
  if (typeof initCommentaires === 'function') initCommentaires(histoireId, chapNum).catch(() => {});
}

// Index spécial pour la page de fin
const _BD_PAGE_FIN = -1;

function _bdAfficherPage(idx) {
  if (!_bdPlanches.length) return;

  const imageWrap = document.getElementById('bd-image-wrap');
  const finWrap = document.getElementById('bd-fin-wrap');
  const img = document.getElementById('bd-image');
  const compteur = document.getElementById('bd-compteur');
  const prev = document.getElementById('bd-prev');
  const next = document.getElementById('bd-next');

  // Page de fin (idx === _bdPlanches.length)
  if (idx === _bdPlanches.length) {
    _bdPageCourante = idx;
    imageWrap.style.display = 'none';
    finWrap.style.display = 'block';
    compteur.textContent = '';
    prev.disabled = false;
    next.disabled = true;
    // Titre de fin
    const b = BOOKS.find(x => x.id === _bdHistoireId);
    const ch = b && b.chapitres.find(c => c.num === _bdChapNum);
    const finTitre = document.getElementById('bd-fin-titre');
    if (finTitre && b) finTitre.textContent = ch && ch.titre ? b.title + ' — ' + ch.titre : b.title;
    _bdAfficherNavChapitre();
    return;
  }

  // Pages normales
  idx = Math.max(0, Math.min(_bdPlanches.length - 1, idx));
  _bdPageCourante = idx;

  // Page TW spéciale (première planche si TW activé)
  if (_bdPlanches[idx] && _bdPlanches[idx].startsWith('__TW__:')) {
    const twTexte = _bdPlanches[idx].replace('__TW__:', '');
    imageWrap.style.display = 'none';
    finWrap.style.display = 'none';
    let twWrap = document.getElementById('bd-tw-page');
    if (!twWrap) {
      twWrap = document.createElement('div');
      twWrap.id = 'bd-tw-page';
      twWrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;box-sizing:border-box;';
      document.getElementById('bd-viewer').insertBefore(twWrap, document.getElementById('bd-next'));
    }
    twWrap.style.display = 'flex';
    twWrap.innerHTML = '<div class="tw-box" style="max-width:320px;width:100%"><div class="tw-label">Trigger warnings</div><div class="tw-text">' + twTexte + '</div></div>';
    prev.disabled = true;
    next.disabled = false;
    return;
  }

  // Masquer la page TW si on est sur une planche normale
  const twWrapEl = document.getElementById('bd-tw-page');
  if (twWrapEl) twWrapEl.style.display = 'none';
  imageWrap.style.display = 'flex';
  finWrap.style.display = 'none';

  img.src = _bdPlanches[idx];

  // Précharger les 2 images suivantes en arrière-plan (ignorer les pages TW)
  [idx + 1, idx + 2].forEach(i => {
    if (i < _bdPlanches.length && !_bdPlanches[i].startsWith('__TW__:')) {
      const pre = new Image();
      pre.src = _bdPlanches[i];
    }
  });

  const _nbVraiesPlanches = _bdPlanches.filter(p => !p.startsWith('__TW__:')).length;
  const _idxReel = _bdPlanches[idx] && _bdPlanches[idx].startsWith('__TW__:') ? 0 : idx - _bdPlanches.filter((p,i) => i < idx && p.startsWith('__TW__:')).length + 1;
  compteur.textContent = (_idxReel > 0 ? _idxReel : '') + (_idxReel > 0 ? ' / ' + _nbVraiesPlanches : '');
  prev.disabled = idx === 0;
  // Dernière image : le → amène sur la page de fin
  next.disabled = false;
}

function bdNaviger(dir) {
  _bdAfficherPage(_bdPageCourante + dir);
}

function _bdAfficherNavChapitre() {
  const navChap = document.getElementById('bd-nav-chapitre');
  if (!navChap) return;

  const b = BOOKS.find(x => x.id === _bdHistoireId);
  if (!b) { navChap.style.display = 'none'; return; }

  const prev = b.chapitres.find(c => c.num === _bdChapNum - 1);
  const next = b.chapitres.find(c => c.num === _bdChapNum + 1);

  let html = '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">';
  if (prev) {
    const num = b.numerotation === 'romain' ? toRoman(prev.num) : prev.num;
    const prevAccessibleBD=prev.gratuit===true||_chapitreDejAchete(b.id,prev.num)||compte.role==='admin'||(compte.role==='autrice'&&_estAutriceDeLHistoire(b));
    const prevPrixBD=b.prix_ticket||1;
    if(!prevAccessibleBD){
      html += `<button class="btn btn-full" onclick="ouvrirPopupAchat('${b.id}', ${prev.num})">← 🎟 Épisode ${num} (${prevPrixBD} ticket${prevPrixBD>1?'s':''})</button>`;
    } else {
      html += `<button class="btn btn-full" onclick="openLectureBD('${b.id}', ${prev.num})">← Épisode ${num}</button>`;
    }
  }
  if (next) {
    const num = b.numerotation === 'romain' ? toRoman(next.num) : next.num;
    html += `<button class="btn btn-full btn-accent" onclick="openLectureBD('${b.id}', ${next.num})">Épisode ${num} →</button>`;
  }
  html += '</div>';

  if (prev || next) {
    navChap.innerHTML = html;
    navChap.style.display = 'block';
  } else {
    navChap.style.display = 'none';
  }
}

// Commentaires BD — appelle directement soumettreCommentaire()
// qui détecte maintenant le contexte BD via _comEl()
function soumettreCommentaireBD() {
  soumettreCommentaire();
}
