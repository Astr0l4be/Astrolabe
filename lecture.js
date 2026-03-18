// Ouvre un chapitre dans une version précise ('soft' ou 'spicy') pour les 18+
async function openLectureVersion(bookId, chapNum, version){
  const b=BOOKS.find(x=>x.id===bookId);
  if(!b)return;
  // On force temporairement la tranche pour charger la bonne version
  const trancheOriginale=compte.trancheAge;
  if(version==='soft') compte.trancheAge='ado';
  else compte.trancheAge='adulte';
  await openLecture(bookId, chapNum);
  compte.trancheAge=trancheOriginale;
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

  // TW chapitre
  const showTWCh=compte.twrChapitre===true;
  const histPrefs=optParHistoire[bookId];
  const useTWCh=histPrefs?histPrefs.twrChapitre:showTWCh;
  if(b.tw&&useTWCh){html=`<div class="tw-box" style="margin:0 0 20px"><div class="tw-label">Trigger warnings</div><div class="tw-text">${b.tw}</div></div>`+html;}

  document.getElementById('lecture-body').innerHTML=html;

  // Navigation chapitres
  const nav=document.getElementById('lecture-nav');
  const prev=b.chapitres.find(c=>c.num===chapNum-1);
  const next=b.chapitres.find(c=>c.num===chapNum+1);
  nav.innerHTML='';
  const prevNum=prev?(b.numerotation==='romain'?toRoman(prev.num):prev.num):null;
  const nextNum=next?(b.numerotation==='romain'?toRoman(next.num):next.num):null;
  if(prev)nav.innerHTML+=`<button class="btn btn-full" style="flex:1" onclick="openLecture('${bookId}',${prev.num})">← Ch.${prevNum}</button>`;
  if(next)nav.innerHTML+=`<button class="btn btn-full btn-accent" style="flex:1" onclick="openLecture('${bookId}',${next.num})">Ch.${nextNum} →</button>`;

  document.getElementById('lecture-back-btn').onclick=()=>go('p-histoire');
  document.querySelector('#p-lecture .page-scroll').scrollTop=0;
  go('p-lecture');
  setTimeout(()=>applyLectureModeForHistoire(bookId),50);

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

function syncCompteToggles(){
  const togAdulte=document.getElementById('toggle-adulte');
  const togTWH=document.getElementById('toggle-tw-histoire');
  const togTWC=document.getElementById('toggle-tw-chapitre');
  if(togAdulte)togAdulte.checked=compte.adulte;
  if(togTWH)togTWH.checked=compte.twrHistoire;
  if(togTWC)togTWC.checked=compte.twrChapitre;
  const rowAdulte=document.getElementById('row-adulte');
  if(rowAdulte)rowAdulte.style.display=compte.estAdulteAge?'flex':'none';
  // Restaurer le mode lecture sauvegardé
  toggleModeJour(modeJour);
  setTexte(textesBlancs?'blanc':'bleu');
  initTailleBtns();
  renderBiblioContinuer();
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
  const prefsC=optParHistoire[bookId]||{modeJour,textesBlancs,twrHistoire:compte.twrHistoire,twrChapitre:compte.twrChapitre};
  _setOngletControls('c', prefsC);
  // Remplir onglet "toutes les histoires" avec les prefs générales
  _setOngletControls('t', {modeJour,textesBlancs,twrHistoire:compte.twrHistoire,twrChapitre:compte.twrChapitre});
  // Ouvrir sur onglet "cette histoire"
  afficherOnglet('cette');
  openModal('options-popup');
}

// Valider
function saveOptions(){
  if(optOnglet==='cette'){
    const v=_getOngletValues('c');
    optParHistoire[currentHistoireId]=v;
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
  closeM('options-popup');
  refreshTWHistoire();
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

