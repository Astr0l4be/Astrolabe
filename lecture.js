let prevPage='p-main';
function openHistoire(id){
  currentHistoireId=id;
  const cur=document.querySelector('.page.active');if(cur)prevPage=cur.id;
  const b=BOOKS.find(x=>x.id===id);if(!b)return;
  // Bannière 2:1 (même format que l'accueil)
  const bannerEl=document.getElementById('histoire-banner');
  if(b.banner){bannerEl.innerHTML=`<img src="${b.banner}" alt="${b.title}" style="width:100%;height:100%;object-fit:cover;display:block;">`;}
  else{bannerEl.innerHTML=`<div class="histoire-banner-bg ${b.color}">✦</div>`;}
  document.getElementById('histoire-title').textContent=b.title;
  document.getElementById('histoire-author').textContent=b.author?'par '+b.author:'';
  document.getElementById('histoire-tags').innerHTML=b.tags.map(t=>`<span class="histoire-tag"># ${t}</span>`).join('');
  document.getElementById('histoire-desc').innerHTML=b.desc;
  const twBox=document.getElementById('tw-box');
  const twRevealBtn=document.getElementById('tw-reveal-btn');
  const twBoxReveal=document.getElementById('tw-box-reveal');
  twBox.style.display='none';if(twBoxReveal)twBoxReveal.style.display='none';
  if(twRevealBtn)twRevealBtn.style.display='none';
  if(b.tw){
    if(compte.twrHistoire!==false){twBox.style.display='block';document.getElementById('tw-text').textContent=b.tw;}
    else{if(twRevealBtn){twRevealBtn.style.display='block';}if(document.getElementById('tw-text-reveal'))document.getElementById('tw-text-reveal').textContent=b.tw;}
  }
  const chapList=document.getElementById('chapitres-list');
  chapList.innerHTML=b.chapitres.map(ch=>{
    const libre=ch.gratuit||ch.num<=8;
    return`<button class="btn-lire ${libre?'':'btn-lire-locked'}" onclick="openLecture('${b.id}',${ch.num})">
      <span>Chapitre ${ch.num} · ${ch.titre}</span>
      <span class="ch-badge ${libre?'':'ch-badge-ticket'}">${libre?'Gratuit':'🎟 1 ticket'}</span>
    </button>`;
  }).join('');
  document.getElementById('histoire-back-btn').onclick=()=>go(prevPage);
  go('p-histoire');
}

async function openLecture(bookId,chapNum){
  const b=BOOKS.find(x=>x.id===bookId);
  if(!b)return;
  // Charger le contenu si pas encore fait
  const contenu=await loadContenuChapitre(bookId,chapNum);
  const ch=b.chapitres.find(c=>c.num===chapNum);
  if(!ch)return;
  if(!contenu){
    document.getElementById('lecture-body').innerHTML='<p style="text-align:center;color:var(--text3)">Chapitre à venir…</p>';
    go('p-lecture');return;
  }
  document.getElementById('lecture-titre').textContent=b.title;
  // Titre et sous-titre depuis les métadonnées du chapitre
  let html=`<div class="lecture-ch-num"><span class="lecture-star-side">✦</span>Chapitre ${ch.num}<span class="lecture-star-side">✦</span></div>`;
  if(ch.titre)html+=`<div class="lecture-ch-title">${ch.titre}</div>`;
  // Nettoyer le contenu : supprimer les balises de style mais garder <strong> et <em>
  const contenuPropre=contenu
    .replace(/<div[^>]*style="[^"]*text-align[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,'$1')
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi,'$1')
    .replace(/style="[^"]*"/gi,'')
    .trim();
  // Découper en paragraphes et afficher
  contenuPropre.split('\n\n').forEach(para=>{
    para=para.trim();
    if(!para)return;
    const isD=para.startsWith('—')||para.startsWith('-');
    html+=`<p class="${isD?'d':''}">${para.replace(/\n/g,'<br>')}</p>`;
  });
  const showTWCh=compte.twrChapitre===true;
  const histPrefs=optParHistoire[bookId];
  const useTWCh=histPrefs?histPrefs.twrChapitre:showTWCh;
  if(b.tw&&useTWCh){html=`<div class="tw-box" style="margin:0 0 20px"><div class="tw-label">Trigger warnings</div><div class="tw-text">${b.tw}</div></div>`+html;}
  document.getElementById('lecture-body').innerHTML=html;
  const nav=document.getElementById('lecture-nav');
  const prev=b.chapitres.find(c=>c.num===chapNum-1);
  const next=b.chapitres.find(c=>c.num===chapNum+1);
  nav.innerHTML='';
  if(prev)nav.innerHTML+=`<button class="btn btn-full" style="flex:1" onclick="openLecture('${bookId}',${prev.num})">← Ch.${prev.num}</button>`;
  if(next)nav.innerHTML+=`<button class="btn btn-full btn-accent" style="flex:1" onclick="openLecture('${bookId}',${next.num})">Ch.${next.num} →</button>`;
  document.getElementById('lecture-back-btn').onclick=()=>go('p-histoire');
  document.querySelector('#p-lecture .page-scroll').scrollTop=0;
  go('p-lecture');
  setTimeout(applyLectureMode,50);
}

/* MODE LECTURE */
let modeJour=localStorage.getItem('modeJour')==='1';
let textesBlancs=localStorage.getItem('textesBlancs')==='1';
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
  document.querySelectorAll('.lecture-ch-num,.lecture-ch-title').forEach(el=>{
    el.style.color=modeJour?'':'couleur';
    el.style.color=couleur;
  });
}

/* OPTIONS LECTURE */
let optOnglet='cette'; // onglet actif dans le popup
let optParHistoire={};  // prefs spécifiques par histoire { [id]: {modeJour, textesBlancs, twrHistoire, twrChapitre} }
let currentHistoireId=null;

// Helpers pour remplir/lire les contrôles d'un onglet
function _setOngletControls(prefix, prefs){
  const mj=prefs.modeJour||false;
  const tb=prefs.textesBlancs||false;
  document.getElementById('opt-'+prefix+'-mode-jour').checked=mj;
  document.getElementById('opt-'+prefix+'-mode-label').textContent=mj?'Jour':'Nuit';
  document.getElementById('opt-'+prefix+'-row-couleur').style.display=mj?'none':'flex';
  _setOptTexte(prefix, tb?'blanc':'bleu');
  document.getElementById('opt-'+prefix+'-tw-histoire').checked=prefs.twrHistoire!==false;
  document.getElementById('opt-'+prefix+'-tw-chapitre').checked=prefs.twrChapitre===true;
}
function _getOngletValues(prefix){
  return {
    modeJour: document.getElementById('opt-'+prefix+'-mode-jour').checked,
    textesBlancs: document.getElementById('opt-'+prefix+'-btn-blanc').dataset.sel==='1',
    twrHistoire: document.getElementById('opt-'+prefix+'-tw-histoire').checked,
    twrChapitre: document.getElementById('opt-'+prefix+'-tw-chapitre').checked,
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
    // Sauvegarder UNIQUEMENT pour cette histoire, sans toucher aux vars globales
    const v=_getOngletValues('c');
    optParHistoire[currentHistoireId]=v;
    // Appliquer visuellement à la lecture en cours
    const lp=document.getElementById('p-lecture');
    if(lp)lp.classList.toggle('mode-jour-lecture',v.modeJour);
    const lb=document.getElementById('lecture-body');
    if(lb){lb.classList.remove('texte-bleu','texte-blanc');if(!v.modeJour)lb.classList.add(v.textesBlancs?'texte-blanc':'texte-bleu');}
    document.querySelectorAll('.lecture-ch-num,.lecture-ch-title').forEach(el=>{
      el.style.color=v.modeJour?'#1a1510':v.textesBlancs?'#eef0fa':'var(--accent)';
    });
  } else {
    // Sauvegarder les prefs générales SANS écraser les prefs par histoire déjà définies
    const v=_getOngletValues('t');
    modeJour=v.modeJour; textesBlancs=v.textesBlancs;
    compte.twrHistoire=v.twrHistoire; compte.twrChapitre=v.twrChapitre;
    toggleModeJour(v.modeJour); setTexte(v.textesBlancs?'blanc':'bleu');
    const togTWH=document.getElementById('toggle-tw-histoire');if(togTWH)togTWH.checked=v.twrHistoire;
    const togTWC=document.getElementById('toggle-tw-chapitre');if(togTWC)togTWC.checked=v.twrChapitre;
    savePrefs();
    // Appliquer seulement si cette histoire n'a pas de prefs spécifiques
    if(!optParHistoire[currentHistoireId]){
      const lp=document.getElementById('p-lecture');
      if(lp)lp.classList.toggle('mode-jour-lecture',v.modeJour);
      const lb=document.getElementById('lecture-body');
      if(lb){lb.classList.remove('texte-bleu','texte-blanc');if(!v.modeJour)lb.classList.add(v.textesBlancs?'texte-blanc':'texte-bleu');}
      document.querySelectorAll('.lecture-ch-num,.lecture-ch-title').forEach(el=>{
        el.style.color=v.modeJour?'#1a1510':v.textesBlancs?'#eef0fa':'var(--accent)';
      });
    }
  }
  closeM('options-popup');
}

function ouvrirPopupResetOptions(){
  closeM('options-popup');
  openModal('reset-options-popup');
}

