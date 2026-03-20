/* STARS */
const starsEl=document.getElementById('stars');
for(let i=0;i<70;i++){const s=document.createElement('div');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--d',(2+Math.random()*5)+'s');s.style.setProperty('--dl',(-Math.random()*5)+'s');s.style.width=s.style.height=(Math.random()>0.7?3:2)+'px';starsEl.appendChild(s);}

/* ÉTAT */
const compte={loggedIn:false,pseudo:'',tickets:0,userId:null,adulte:false,softSpicy:false,trancheAge:'adulte',twrHistoire:true,twrChapitre:false,afficherChoixVersion:false,versionDefaut:'spicy',avatar:'☽',age:16};
function addTickets(n){compte.tickets+=n;updateTicketsDisplay();}
function updateTicketsDisplay(){
  const el=document.getElementById('compte-tickets');if(el)el.textContent=compte.tickets+' ✦';
  const i=document.getElementById('ticket-count-insc');if(i)i.textContent=compte.tickets;
}

/* DATA — Textes complets */
const CH1=`Chapitre 1\nBerta\n\nSi je ne m'étais pas arrêté dans ce bar, je pense que ma bonne vieille Berta aurait rendu l'âme au milieu du désert. Presque cinq kilomètres qu'elle crachote comme une vieillarde, me faisant craindre à chaque virage qu'elle ne m'explose sous le séant et ne m'envoie valser dans les nuages. Même la béquille grince lorsque j'y donne un coup de botte pour stabiliser ma bête. Un gémissement douloureux fait trembler jusqu'à ses boulons lorsque j'en descends et je me fends moi-même d'un soupir.\n\nDes Harley. Plein. Beaucoup trop pour un parking aussi petit. Et au milieu de toutes ces bécanes rutilantes, la mienne fait peine à voir. Dire que c'est une antiquité serait malhonnête : cette vieillerie pourrait être datée au carbone 14 tant c'est un vestige ! Elle grince, elle râle, elle crache. Les pièces semblent prêtes à se séparer les unes des autres à tout instant et je soupçonne le responsable de sa fabrication d'avoir piqué des bouts à toutes les motos de son quartier pour créer un monstre de Frankenstein de métal. Si encore elle avait connu des heures de gloire, mais je suis certaine que, même neuve, elle était déjà bonne pour la casse. Et après l'avoir eu sous les fesses depuis Sacramento, je peux affirmer que c'est l'engin de torture le plus sophistiqué de toute l'histoire. J'ai rarement eu aussi mal partout que depuis que trace la route sur ce cheval mort et les quelques nuits que j'ai passées à la belle étoile ont sans doute été salutaires pour mes vertèbres toutes tassées.\n\nAvoir garé une telle épave au milieu de tous ces bijoux me fait déjà mal au cœur, mais bien moins que l'idée d'entrer dans ce bar rempli de motards alors que moi-même je ne sais même pas la marque de ma monture. Depuis que je suis arrivé aux états-unis, j'ai bien compris que pour être un motard, ici, il ne suffisait pas d'avoir le permis et une bécane. C'est un art de vivre et la pauvre franchie que je suis, avec son petit permis A obtenu à la chance et sa vieille moto à moitié crevée… Disons que je passe un peu pour une amatrice, voire une usurpatrice dans certains cercles que j'ai jusqu'ici essayé au possible d'éviter. Mais après m'être tapé une demi-journée de soleil sur une route si droite que j'ai failli m'y endormir, je ne rêve que de m'abriter dans ce bar, et tant pis si c'est un nid de dockers qui vont se faire une joie de me juger. J'ai juste à prier pour que personne n'aperçoive cette honte de la route qu'est Berta avant que je n'aie sifflé un soda pour repartir chargé à bloc sur ces routes interminables.\n\nJe retire mon casque et fourre une main dans mes cheveux pour chasser la coiffure peu avantageuse que m'impose cette protection routière. Prenant une grande inspiration, je pousse la porte de l'édifice et tente au possible de cacher mon malaise lorsque j'y rentre fièrement.\n\nJe m'étais attendue à ce que mon arrivée provoque l'émoi de la faune locale. Que tous s'arrêtent de parler et de boire pour me dévisager d'un air mauvais alors que j'irais m'accouder au bar pour demander un whisky sans faux col tout en expectorant un merveilleux mollard dans le premier crachoir à portée de tire. Peut-être même qu'un pianiste interromprait soudainement son ragtime et que la dernière note serait suspendue dans l'air alors que chacun retiendrait son souffle, se demandant qui de moi ou des locaux dégainerait les premiers.\n\nMais mon entrée se fait dans la parfaite indifférence. Le jukebox placé au fond de la salle ne tressaute même pas, et je le soupçonne d'ailleurs de n'être là qu'à titre décoratif au vu des enceintes dernier cri accrochées au plafond.\n\n— Hello ! Je lance au barman dans mon plus parfait anglais. N'importe quoi sans alcool s'il vous plaît !\n\nLe bar est parfaitement ajusté à la hauteur de mes coudes. Nickel. Je lâche mon sac entre mes pieds et glisse subtilement l'une des anses sous ma chaussure au cas où il viendrait à certains l'idée de se tirer avec mes affaires.\n\nL'homme derrière le comptoir hoche la tête et sort de sa glacière une bouteille de soda qu'il décapsule à la main pour me la tendre sans un mot. Je sors mon billet de ma poche, en espérant ne pas me tromper de président, et le lui tends dans un sourire aimable qu'il regarde à peine, déjà occupé à servir les autres clients.\n\nPersonne ne fait attention à moi, et c'est à peine si ma présence a fait frémir l'air chaud de cette ville perdue.\n\nUn coin paumé au milieu de l'Ouest américain.\n\nParfait pour une sorcière en cavale.`;

const CH2=`Chapitre 2\nL'étrangère\n\nElle n'est pas d'ici. C'est tellement flagrant qu'on pourrait presque croire que c'est fait exprès.\n\nSon jean élimé est trop grand et ne tient à ses hanches que par une ceinture de cuir vieillotte. Sa veste bleue n'est guère en meilleur état, couverte de sable et reprisée au niveau des coudes alors que la bordure basse s'effiloche calmement. Même ses grosses chaussures de motarde semblent avoir déjà vécu mille vies, mais ce n'était rien comparé à son sac à dos si rapiécé que je serais bien en peine de deviner sa couleur d'origine. Elle l'avait laissé tomber à ses pieds en s'accoudant au bar où, depuis ma table, j'ai pu entendre son terrible accent. Difficile à cette distance de pouvoir le situer, mais je penchais pour une langue latine. Italien ou français.\n\n— Qu'est-ce que tu regardes Timy ?\n— La fille là.\n\nAndréa ne fait preuve d'aucune discrétion lorsqu'elle jette un œil derrière elle.\n\n— Mignonne. Valide-t-elle en portant sa bière à ses lèvres. On tire à pile ou face ?\n\nJe lui donne un coup de pied par-dessous la table alors qu'elle pouffe en s'étouffant avec sa gorgée.\n\n— Arrête de me faire honte ! Je râle pour la forme alors que le sourire d'Andréa attire à lui le mien.\n\nMais elle a raison sur ce point : l'étrangère est plutôt mignonne. Des cheveux blonds coupés court, encore un peu aplatis par le poids du casque, dont les pointes oscillent entre le cuivre et le rose comme si elle les avait négligemment laissé traîner dans un pot de peinture. Je n'ai pas vraiment pu voir son visage, hormis le sourire qu'elle a offert à Steve au bar, si lumineux qu'elle aurait pu éclairer toute la ville. Et quand elle a commandé, elle a agité ses mains, mimant presque ses mots pour compenser la raideur de son accent.\n\nMignonne.\n\nC'est effectivement le premier mot qui me vient en tête.\n\n— Tu la fixes. Me rappelle à l'ordre Andréa sans cesser de sourire. Va la voir si elle te plaît.\n\nJe ricane, sirotant ma bière.\n\n— Ouais, t'as raison : c'est tout à fait normal d'aller taper la discute avec une meuf juste parce qu'on la trouve mignonne de dos.\n— Moi c'est comme ça que je fais.\n\nElle me donne un petit coup de coude, ramenant mon attention sur elle. Andréa est le genre de fille à être magnifique sans effort, simplement en existant. De longs cheveux châtain bouclés qui tombent sur ses épaules sur laquelle pend négligemment la bretelle de son débardeur blanc savamment taché d'huile de moteur. Elle ressemble exactement au fantasme de la mécanicienne dans ces vieux films de voiture qu'on regardait en boucle quand on était ados.\n\n— Et qu'est-ce que tu veux que j'aille lui dire ?\n\nElle ricane, puis plisse les yeux et prend un air sombre et mystérieux en une vaine tentative de m'imiter :\n\n— Essaye un truc du genre : salut poupée. Je suis le meilleur garagiste de la région, mais j'ai besoin de quelqu'un pour réparer mon cœur blessé par la vie.\n\nJe pouffe dans ma bière, incrédule.\n\n— Mon cœur blessé par la vie ?\n\nElle hoche la tête, dramatique :\n\n— Ton pauvre cœur brisé par Sharon.\n\nJe fronce les sourcils, tâchant de recoller les morceaux :\n\n— On s'est vus qu'une fois… Je tente d'objecter.\n— Avant qu'elle ne se remette avec son ex ! s'offusque-t-elle, bien plus scandalisée que moi par toute cette affaire.\n— Ouais, mais ils vont super bien ensemble.\n\nMon argument la fait un instant réfléchir puis elle soupire, s'étalant presque sur la table dans un gémissement frustré.\n\n— Raaah, t'as raison… Ils en deviennent même frustrants. Un couple ne devrait jamais être aussi bien assorti, ça fait seulement déprimer les célibataires.\n\nSon minois devient soudain tout triste, et je dois lutter pour ne pas pincer sa joue et lui rendre ainsi un peu de couleur.\n\n— Si on est encore célibataire à 50 ans, tu te maries avec moi ?\n— Promis.\n\nElle m'offre son sourire éclatant.\n\n— Je veux une belle demande en mariage sur une gondole à Venise !\n— Ce que ma meilleure amie veut, ma meilleure amie aura. Je lui promets solennellement en levant ma bière pour qu'elle y heurte la sienne.\n\nEt alors que je m'apprêtais à finir ma bouteille et ma pause d'une même gorgée, quelqu'un entra dans le bar dans un fracas qui fit même tressauter la musique des haut-parleurs. Comme un seul homme, tous les clients se tournèrent vers la porte et sur la bande qui y bloquait la lumière.\n\nArsène.\n\nLe visage rouge, il fit un pas dans le bar, pointant l'extérieur avec autant de dégoût que de fureur avant de tonner avec colère :\n\n— Hé, les gars ! Qui a osé garer son immonde tas de boue devant notre bar ?!\n\nAu milieu du bar bondé, dans un silence mordant, une petite main se lève alors qu'un sourire coupable étire les lèvres de l'étrangère.`;

/* DONNÉES */
let BOOKS=[];

function bookCardHTML(b){
  const img=b.cover?`<img src="${b.cover}" alt="${b.title}" loading="lazy">`:'';
  const icones=(b.adulte&&compte.trancheAge==='adulte')
    ?`<div class="book-card-icones">${b.versionSoft?'<span class="book-card-icone">🌸</span>':''}<span class="book-card-icone">🌶</span></div>`
    :'';
  return`<div class="book-card ${b.color}" onclick="openHistoire('${b.id}')" style="position:relative">${img}${icones}<div class="book-card-label">${b.title}</div></div>`;
}

function livreVisible(b){
  const tranche=compte.trancheAge||'adulte';

  // Filtre TW — masquer les histoires dont un TW est dans la liste filtrée
  if(compte.twFiltres && compte.twFiltres.length && b.tw){
    const twsHistoire = b.tw.split(',').map(t => t.trim());
    if(compte.twFiltres.some(f => twsHistoire.includes(f))) return false;
  }

  // 18+ : acces a tout le catalogue
  if(tranche==='adulte') return true;

  // Contenu adulte sans version soft -> 18+ uniquement
  if(b.adulte && !b.versionSoft) return false;

  // Contenu adulte + version soft mais -18 non coche -> 18+ uniquement
  if(b.adulte && b.versionSoft && !b.adapteMoins18) return false;

  // 16-18 ans
  if(tranche==='ado'){
    // Contenu adulte + version soft + -18 -> accessible (version soft)
    if(b.adulte && b.versionSoft && b.adapteMoins18) return true;
    // Contenu non adulte -> accessible
    if(!b.adulte) return true;
    return false;
  }

  // 13-16 ans : uniquement les histoires marquees -16
  if(tranche==='junior') return b.adapteMoins16===true;

  return false;
}

function renderGrid(id,books){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML=books.filter(b=>livreVisible(b)).map(b=>bookCardHTML(b)).join('');
}

async function loadHistoires(){
  const {data:histoires,error}=await db.from('histoires').select('*').or('statut.eq.en-cours,statut.eq.pause,statut.eq.termine').order('created_at',{ascending:false});
  if(error||!histoires)return;
  const {data:allTags}=await db.from('histoires_tags').select('histoire_id, tags(nom)');
  const {data:allTW}=await db.from('trigger_warnings_histoires').select('histoire_id, contenu');
  const {data:allChaps}=await db.from('chapitres').select('id,histoire_id,numero,titre,gratuit,spicy').order('numero');
  BOOKS=histoires.map(h=>{
    const tags=(allTags||[]).filter(t=>t.histoire_id===h.id).map(t=>t.tags?.nom).filter(Boolean);
    const tws=(allTW||[]).filter(t=>t.histoire_id===h.id).map(t=>t.contenu);
    const chapitres=(allChaps||[]).filter(ch=>ch.histoire_id===h.id).map(ch=>({
      num:ch.numero,titre:ch.titre,gratuit:ch.gratuit,spicy:ch.spicy||false,
      texte:null,texte_soft:null,citation:null,citation_auteur:null
    }));
    return{
      id:h.id,title:h.titre,color:'bc'+(Math.floor(Math.random()*8)+1),
      cover:h.cover_url||null,banner:h.banner_url||null,author:h.auteur_pseudo||'',
      tags,tw:tws.join(', ')||null,desc:h.resume||'',
      adulte:h.adulte||false,versionSoft:h.version_soft||false,
      adapteMoins18:h.adapte_moins18||false,adapteMoins16:h.adapte_moins16||false,
      gratuit_jusqu_au:h.gratuit_jusqu_au||8,numerotation:h.numerotation||'arabe',chapitres
    };
  });
  renderGrid('book-grid',BOOKS);
  renderGrid('search-grid',BOOKS);
  renderGrid('hashtag-grid',BOOKS);
  const allTagNames=[...new Set(BOOKS.flatMap(b=>b.tags))].sort();
  const band=document.getElementById('hashtag-band');
  if(band){
    band.innerHTML='<div class="tag-pill active" onclick="goHashtag(null)" id="tag-pill-all">✦ Tout</div>';
    allTagNames.forEach(tag=>{
      const pill=document.createElement('div');
      pill.className='tag-pill';pill.textContent='✦ '+tag;pill.onclick=()=>goHashtag(tag);
      band.appendChild(pill);
    });
  }
}

async function loadContenuChapitre(bookId,chapNum){
  const b=BOOKS.find(x=>x.id===bookId);if(!b)return null;
  const ch=b.chapitres.find(c=>c.num===chapNum);if(!ch)return null;

  // Charger les deux versions depuis Supabase si pas encore en cache
  if(ch.texte===null){
    const {data}=await db.from('chapitres')
      .select('contenu,contenu_soft,citation,citation_auteur')
      .eq('histoire_id',bookId).eq('numero',chapNum).single();
    if(data){
      ch.texte=data.contenu||null;
      ch.texte_soft=data.contenu_soft||null;
      ch.citation=data.citation||null;
      ch.citation_auteur=data.citation_auteur||null;
    }
  }

  // Décider quelle version servir
  const estSpicySoftDispo = b.adulte && b.versionSoft && ch.spicy && ch.texte_soft;

  if(!estSpicySoftDispo) return ch.texte;

  // 16-18 ans : toujours soft
  if(compte.trancheAge==='ado' && b.adapteMoins18) return ch.texte_soft;

  // 18+ : version forcée (popup nav ou bouton liste) sinon prefs histoire sinon versionDefaut
  if(compte.trancheAge==='adulte'){
    const version = window._versionForcee
      || (window._versionsChoisies && window._versionsChoisies[chapNum])
      || window._versionDefautCourante
      || compte.versionDefaut
      || 'spicy';
    return version==='soft' ? ch.texte_soft : ch.texte;
  }

  return ch.texte;
}

/* NAV */
function go(id){
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');const mo=p.querySelector('.modal-overlay');if(mo)mo.classList.remove('open');});
  if(id==='p-connexion-modal'){document.getElementById('p-main').classList.add('active');setTimeout(()=>openModal('p-connexion-modal'),50);return;}
  const el=document.getElementById(id);if(el)el.classList.add('active');
  const stars=document.getElementById('stars');
  if(stars)stars.style.opacity=(id==='p-lecture')?'0':'1';
  if(id==='p-main'||id==='p-moncompte')updateTopbar();
  if(id==='p-moncompte')renderBibliotheque().catch(()=>{});
  if(id==='p-inscription4b' && typeof _initCGUScroll==='function') setTimeout(_initCGUScroll, 100);
  if(id!=='p-splash')sessionStorage.setItem('lastPage',id);
}
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeM(id){document.getElementById(id)?.classList.remove('open');}
function closeModal(e,id){if(e.target===document.getElementById(id))closeM(id);}
function goCompte(){if(compte.loggedIn)go('p-moncompte');else go('p-inscription1');}
function goAcheterTickets(fromPage){
  if(document.getElementById('tickets-back-btn'))document.getElementById('tickets-back-btn').onclick=()=>go(fromPage||'p-inscription5');
  go('p-acheter-tickets');
}

function goHashtag(name){
  document.querySelectorAll('.tag-pill').forEach(p=>p.classList.remove('active'));
  if(!name){
    document.getElementById('tag-pill-all')?.classList.add('active');
    document.getElementById('hashtag-title').textContent='✦ Toutes les histoires';
    const filtered=BOOKS.filter(b=>livreVisible(b));
    document.getElementById('hashtag-count').textContent=filtered.length+' histoire'+(filtered.length>1?'s':'');
    renderGrid('hashtag-grid',filtered);
  } else {
    const res=BOOKS.filter(b=>livreVisible(b)&&b.tags.some(t=>t.toLowerCase()===name.toLowerCase()));
    document.getElementById('hashtag-title').textContent='# '+name;
    document.getElementById('hashtag-count').textContent=res.length+' histoire'+(res.length>1?'s':'');
    renderGrid('hashtag-grid',res);
  }
  go('p-hashtag');
}



let prevPage='p-main';

/* ══════════════════════════════════════════════════════
   SYSTÈME DE NOTES ÉTOILES
   ══════════════════════════════════════════════════════ */

let _noteUtilisateur = 0;   // note validée en base
let _noteSelectionnee = 0;  // note en cours de sélection (pas encore validée)
let _noteModeEdition = false; // true quand on modifie une note déjà soumise

async function loadNoteHistoire(histoireId) {
  const { data: stats } = await db.from('notes').select('note').eq('histoire_id', histoireId);
  let moyenne = 0, nbNotes = 0;
  if (stats && stats.length) {
    nbNotes = stats.length;
    moyenne = stats.reduce((s, r) => s + r.note, 0) / nbNotes;
  }
  _noteUtilisateur = 0;
  if (compte.loggedIn && compte.userId) {
    const { data: perso } = await db.from('notes').select('note')
      .eq('histoire_id', histoireId).eq('user_id', compte.userId).single();
    if (perso) _noteUtilisateur = perso.note;
  }
  _noteSelectionnee = _noteUtilisateur;
  _noteModeEdition = false;
  _renderNoteBloc(moyenne, nbNotes);
}

function _renderNoteBloc(moyenne, nbNotes) {
  const bloc = document.getElementById('note-bloc');
  if (!bloc) return;

  const moyenneTexte = nbNotes > 0
    ? `${moyenne.toFixed(1)} ★ · ${nbNotes} avis`
    : 'Aucun avis pour l\'instant';

  // CAS 1 : non connecté → étoiles grisées, message
  if (!compte.loggedIn) {
    bloc.innerHTML = `
      <div class="note-stars">
        ${[1,2,3,4,5].map(i => `<button class="note-star" disabled>★</button>`).join('')}
      </div>
      <div class="note-moyenne">${moyenneTexte}</div>
      <div class="note-info">Connecte-toi pour laisser une note</div>`;
    return;
  }

  // CAS 2 : déjà noté et pas en mode édition → note figée + bouton modifier
  if (_noteUtilisateur > 0 && !_noteModeEdition) {
    bloc.innerHTML = `
      <div class="note-stars">
        ${[1,2,3,4,5].map(i =>
          `<button class="note-star${i <= _noteUtilisateur ? ' active' : ''}" disabled>★</button>`
        ).join('')}
      </div>
      <div class="note-moyenne">${moyenneTexte}</div>
      <div class="note-info">Ta note : ${_noteUtilisateur}/5</div>
      <button class="note-btn-modifier" onclick="_activerEditionNote()">Modifier ma note</button>`;
    return;
  }

  // CAS 3 : pas encore noté, ou en mode édition → étoiles cliquables + bouton valider
  const noteRef = _noteModeEdition ? _noteUtilisateur : 0;
  bloc.innerHTML = `
    <div class="note-stars" id="note-stars">
      ${[1,2,3,4,5].map(i =>
        `<button class="note-star${i <= (_noteSelectionnee || noteRef) ? ' active' : ''}"
          onclick="_selectionnerNote(${i})"
          onmouseenter="_hoverNote(${i})"
          onmouseleave="_hoverNote(0)"
        >★</button>`
      ).join('')}
    </div>
    <div class="note-moyenne">${moyenneTexte}</div>
    <div class="note-info" id="note-info-txt">${_noteSelectionnee ? `${_noteSelectionnee}/5 sélectionné` : 'Sélectionne une note'}</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="note-btn-valider" id="note-btn-valider"
        onclick="soumettreNote()"
        ${!_noteSelectionnee ? 'disabled' : ''}>
        Valider ✦
      </button>
      ${_noteModeEdition ? `<button class="note-btn-annuler" onclick="_annulerEditionNote()">Annuler</button>` : ''}
    </div>`;
}

function _selectionnerNote(n) {
  _noteSelectionnee = n;
  // Mettre à jour les étoiles visuellement
  document.querySelectorAll('.note-star').forEach((s, i) => s.classList.toggle('active', i < n));
  // Mettre à jour le texte et débloquer le bouton valider
  const info = document.getElementById('note-info-txt');
  if (info) info.textContent = `${n}/5 sélectionné`;
  const btn = document.getElementById('note-btn-valider');
  if (btn) btn.disabled = false;
}

function _hoverNote(n) {
  const ref = _noteSelectionnee;
  document.querySelectorAll('.note-star').forEach((s, i) => {
    s.classList.toggle('active', i < (n || ref));
  });
}

function _activerEditionNote() {
  _noteModeEdition = true;
  _noteSelectionnee = _noteUtilisateur;
  // On re-fetche juste les stats pour la moyenne, sans écraser _noteModeEdition
  db.from('notes').select('note').eq('histoire_id', currentHistoireId).then(({ data: stats }) => {
    let moyenne = 0, nbNotes = 0;
    if (stats && stats.length) {
      nbNotes = stats.length;
      moyenne = stats.reduce((s, r) => s + r.note, 0) / nbNotes;
    }
    _renderNoteBloc(moyenne, nbNotes);
  });
}

function _annulerEditionNote() {
  _noteModeEdition = false;
  _noteSelectionnee = _noteUtilisateur;
  loadNoteHistoire(currentHistoireId);
}

async function soumettreNote() {
  if (!compte.loggedIn || !compte.userId || !_noteSelectionnee) return;
  const btn = document.getElementById('note-btn-valider');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  await db.from('notes').upsert(
    { user_id: compte.userId, histoire_id: currentHistoireId, note: _noteSelectionnee },
    { onConflict: 'user_id,histoire_id' }
  );
  _noteUtilisateur = _noteSelectionnee;
  _noteModeEdition = false;
  await loadNoteHistoire(currentHistoireId);
}


/* ══════════════════════════════════════════════════════
   ABONNEMENTS HISTOIRES
   ══════════════════════════════════════════════════════ */

let _estAbonne = false;

async function loadAbonnement(histoireId) {
  const bloc = document.getElementById('abo-bloc');
  if (!bloc) return;

  // Uniquement visible si connecté
  if (!compte.loggedIn || !compte.userId) {
    bloc.style.display = 'none';
    return;
  }

  bloc.style.display = 'block';
  const { data } = await db.from('abonnements_histoires')
    .select('id')
    .eq('histoire_id', histoireId)
    .eq('user_id', compte.userId)
    .single();

  _estAbonne = !!data;
  _renderAbonnementBtn();
}

function _renderAbonnementBtn() {
  const btn = document.getElementById('abo-btn');
  if (!btn) return;
  if (_estAbonne) {
    btn.textContent = '🔔 Se désabonner';
    btn.classList.add('btn-abo-actif');
  } else {
    btn.textContent = '🔔 S\'abonner';
    btn.classList.remove('btn-abo-actif');
  }
}

async function toggleAbonnement() {
  if (!compte.loggedIn || !compte.userId) return;
  const btn = document.getElementById('abo-btn');
  if (btn) btn.disabled = true;

  if (_estAbonne) {
    await db.from('abonnements_histoires')
      .delete()
      .eq('histoire_id', currentHistoireId)
      .eq('user_id', compte.userId);
    _estAbonne = false;
  } else {
    await db.from('abonnements_histoires')
      .insert({ user_id: compte.userId, histoire_id: currentHistoireId });
    _estAbonne = true;
  }

  if (btn) btn.disabled = false;
  _renderAbonnementBtn();
}

async function accepterAboSuggestion() {
  closeM('abo-suggestion-popup');
  if (!compte.loggedIn || !compte.userId || _estAbonne) return;
  await db.from('abonnements_histoires')
    .insert({ user_id: compte.userId, histoire_id: currentHistoireId });
  _estAbonne = true;
  _renderAbonnementBtn();
}

function refuserAboSuggestion() {
  closeM('abo-suggestion-popup');
  // Mémoriser le refus pour cette histoire — ne plus jamais proposer
  const refus = JSON.parse(localStorage.getItem('abo_refus') || '{}');
  refus[currentHistoireId] = true;
  localStorage.setItem('abo_refus', JSON.stringify(refus));
}

/* ══════════════════════════════════════════════════════
   PILE À LIRE (PAL)
   ══════════════════════════════════════════════════════ */

let _estEnPAL = false;

async function loadPAL(histoireId) {
  const btn = document.getElementById('pal-btn');
  if (!btn) return;

  if (!compte.loggedIn || !compte.userId) {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = 'flex';
  const { data } = await db.from('pile_a_lire')
    .select('id')
    .eq('histoire_id', histoireId)
    .eq('user_id', compte.userId)
    .single();

  _estEnPAL = !!data;
  _renderPALBtn();
}

function _renderPALBtn() {
  const plus = document.getElementById('pal-plus');
  const btn = document.getElementById('pal-btn');
  if (!btn) return;
  if (_estEnPAL) {
    btn.classList.add('btn-pal-actif');
    if (plus) plus.textContent = '−';
    btn.title = 'Retirer de ma Pile à Lire';
  } else {
    btn.classList.remove('btn-pal-actif');
    if (plus) plus.textContent = '+';
    btn.title = 'Ajouter à ma Pile à Lire';
  }
}

function clickPAL() {
  if (!compte.loggedIn || !compte.userId) return;
  const popupDesactive = localStorage.getItem('pal_popup_off') === '1';
  const popupRetireDesactive = localStorage.getItem('pal_popup_retire_off') === '1';

  if (_estEnPAL) {
    // Retirer — popup sauf si désactivé
    if (popupRetireDesactive) { retirerPAL(); return; }
    openModal('pal-retire-popup');
  } else {
    // Ajouter — popup sauf si désactivé
    if (popupDesactive) { ajouterPAL(); return; }
    openModal('pal-popup');
  }
}

async function ajouterPAL() {
  if (_estEnPAL) return;
  await db.from('pile_a_lire')
    .insert({ user_id: compte.userId, histoire_id: currentHistoireId });
  _estEnPAL = true;
  _renderPALBtn();
}

async function retirerPAL() {
  await db.from('pile_a_lire')
    .delete()
    .eq('histoire_id', currentHistoireId)
    .eq('user_id', compte.userId);
  _estEnPAL = false;
  _renderPALBtn();
}

async function confirmerPAL() {
  closeM('pal-popup');
  await ajouterPAL();
}

function desactiverPopupPAL() {
  localStorage.setItem('pal_popup_off', '1');
  closeM('pal-popup');
  ajouterPAL();
}

async function confirmerRetirerPAL() {
  closeM('pal-retire-popup');
  await retirerPAL();
}

function desactiverPopupRetirerPAL() {
  localStorage.setItem('pal_popup_retire_off', '1');
  closeM('pal-retire-popup');
  retirerPAL();
}

/* ══════════════════════════════════════════════════════
   BIBLIOTHÈQUE PERSONNELLE
   ══════════════════════════════════════════════════════ */

async function renderBibliotheque() {
  if (!compte.loggedIn || !compte.userId) return;

  // ── Récupérer PAL et abonnements depuis Supabase ──
  const [{ data: palData }, { data: aboData }] = await Promise.all([
    db.from('pile_a_lire').select('histoire_id').eq('user_id', compte.userId),
    db.from('abonnements_histoires').select('histoire_id').eq('user_id', compte.userId)
  ]);

  const palIds    = (palData  || []).map(r => r.histoire_id);
  const aboIds    = (aboData  || []).map(r => r.histoire_id);

  // ── Continuer + Terminés depuis localStorage ──
  const enCours   = [];
  const termines  = [];

  BOOKS.forEach(b => {
    const lus = JSON.parse(localStorage.getItem('chapitres_lus_' + b.id) || '[]');
    if (!lus.length) return;
    // Terminé = dernier chapitre marqué fini
    const dernierChap = b.chapitres[b.chapitres.length - 1];
    const dernierFini = dernierChap &&
      localStorage.getItem('chapitre_fini_' + b.id + '_' + dernierChap.num) === '1';
    if (dernierFini) {
      termines.push(b);
    } else {
      enCours.push(b);
    }
  });

  // ── Rendu d'une étagère ──
  function renderEtagere(containerId, books_or_ids, sourceIds) {
    const el = document.getElementById(containerId);
    if (!el) return;
    // books_or_ids peut être un tableau de BOOKS ou d'IDs
    const livres = sourceIds
      ? sourceIds.map(id => BOOKS.find(b => b.id === id)).filter(Boolean)
      : books_or_ids;

    if (!livres.length) {
      el.innerHTML = '<span class="biblio-empty">' + el.dataset.empty + '</span>';
      return;
    }
    el.innerHTML = livres.map(b => {
      const img = b.cover
        ? `<img src="${b.cover}" alt="${b.title}">`
        : `<div class="biblio-card-bg ${b.color}">✦</div>`;
      return `<div class="biblio-card" onclick="openHistoire('${b.id}')" title="${b.title}">${img}</div>`;
    }).join('');
  }

  // Stocker les messages "vide" en data-empty
  document.getElementById('biblio-pal').dataset.empty      = 'Ta pile à lire est vide';
  document.getElementById('biblio-abos').dataset.empty     = 'Aucun abonnement';
  document.getElementById('biblio-continuer').dataset.empty = 'Aucune lecture en cours';
  document.getElementById('biblio-termines').dataset.empty  = 'Aucun livre terminé';

  renderEtagere('biblio-pal',      null, palIds);
  renderEtagere('biblio-abos',     null, aboIds);
  renderEtagere('biblio-continuer', enCours);
  renderEtagere('biblio-termines',  termines);
}

/* ══════════════════════════════════════════════════════
   FILTRE TRIGGER WARNINGS
   ══════════════════════════════════════════════════════ */

// Liste des TW filtrés par l'utilisateur (chargée depuis Supabase)
compte.twFiltres = [];

function toggleTWFiltrePanel() {
  const panel = document.getElementById('tw-filtre-panel');
  const chevron = document.getElementById('tw-filtre-chevron');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(90deg)';
  if (!isOpen) _renderTWFiltreListe();
}

async function _renderTWFiltreListe() {
  const liste = document.getElementById('tw-filtre-liste');
  if (!liste) return;

  // Récupérer tous les TW distincts depuis la base
  const { data } = await db.from('trigger_warnings_histoires').select('contenu');
  if (!data || !data.length) {
    liste.innerHTML = '<span style="font-size:11px;color:var(--text3);font-style:italic">Aucun trigger warning enregistré.</span>';
    return;
  }

  // Dédoublonner
  const tousLesTW = [...new Set(data.map(r => r.contenu).filter(Boolean))].sort();
  const filtresActifs = compte.twFiltres || [];

  liste.style.flexDirection = 'row';
  liste.style.flexWrap = 'wrap';
  liste.style.gap = '8px';

  liste.innerHTML = tousLesTW.map(tw => `
    <button class="tw-filtre-pill${filtresActifs.includes(tw) ? ' tw-filtre-pill-actif' : ''}"
      onclick="toggleTWFiltre('${tw.replace(/'/g, "\\'")}', ${!filtresActifs.includes(tw)})">
      ${tw}
    </button>
  `).join('');
}

async function toggleTWFiltre(tw, actif) {
  if (!compte.userId) return;
  if (actif) {
    if (!compte.twFiltres.includes(tw)) compte.twFiltres.push(tw);
  } else {
    compte.twFiltres = compte.twFiltres.filter(t => t !== tw);
  }
  // Mettre à jour visuellement les pills
  document.querySelectorAll('.tw-filtre-pill').forEach(btn => {
    const label = btn.textContent.trim();
    btn.classList.toggle('tw-filtre-pill-actif', compte.twFiltres.includes(label));
    btn.onclick = () => toggleTWFiltre(label, !compte.twFiltres.includes(label));
  });
  // Sauvegarder en Supabase
  await db.from('profils').update({ tw_filtres: compte.twFiltres }).eq('id', compte.userId);
  // Mettre à jour le catalogue
  renderGrid('book-grid', BOOKS);
  renderGrid('search-grid', BOOKS);
  renderGrid('hashtag-grid', BOOKS);
}

function openHistoire(id){
  currentHistoireId=id;
  const cur=document.querySelector('.page.active');if(cur)prevPage=cur.id;
  const b=BOOKS.find(x=>x.id===id);if(!b)return;
  const bannerEl=document.getElementById('histoire-banner');
  if(b.banner){bannerEl.innerHTML=`<img src="${b.banner}" alt="${b.title}" style="width:100%;height:100%;object-fit:cover;display:block;">`;}
  else{bannerEl.innerHTML=`<div class="histoire-banner-bg ${b.color}">✦</div>`;}
  document.getElementById('histoire-title').textContent=b.title;
  document.getElementById('histoire-author').textContent=b.author?'par '+b.author:'';
  document.getElementById('histoire-tags').innerHTML=b.tags.map(t=>`<span class="histoire-tag"># ${t}</span>`).join('');
  document.getElementById('histoire-desc').innerHTML=b.desc;

  // Bandeau spicy/soft pour les 18+
  const bandeauSpicy=document.getElementById('bandeau-spicy');
  if(bandeauSpicy){
    bandeauSpicy.style.display=(compte.trancheAge==='adulte' && b.adulte && b.versionSoft)?'block':'none';
  }

  const twBox=document.getElementById('tw-box');
  const twRevealBtn=document.getElementById('tw-reveal-btn');
  const twBoxReveal=document.getElementById('tw-box-reveal');
  twBox.style.display='none';if(twBoxReveal)twBoxReveal.style.display='none';
  if(twRevealBtn)twRevealBtn.style.display='none';
  if(b.tw){
    if(compte.twrHistoire!==false){twBox.style.display='block';document.getElementById('tw-text').textContent=b.tw;}
    else{if(twRevealBtn)twRevealBtn.style.display='block';if(document.getElementById('tw-text-reveal'))document.getElementById('tw-text-reveal').textContent=b.tw;}
  }
  // État des versions cochées par chapitre (spicy par défaut)
  window._versionsChoisies={};
  window._versionForcee=null;
  // Pré-remplir avec la versionDefaut de cette histoire si elle existe
  const _prefsHist=typeof optParHistoire!=='undefined'?optParHistoire[b.id]:null;
  window._versionDefautCourante=(_prefsHist&&_prefsHist.versionDefaut)||compte.versionDefaut||'spicy';
  const vc=window._versionsChoisies;

  // Toujours lire le localStorage pour affichage immédiat
  const _mp=JSON.parse(localStorage.getItem('marque_pages')||'{}');
  const _mpNum=_mp[id]||null;
  _renderChapitresList(b,vc,_mpNum);
  _updateBtnLectureRapide(b);
  loadNoteHistoire(id).catch(()=>{});
  loadAbonnement(id).catch(()=>{});
  loadPAL(id).catch(()=>{});
  const backDest=(prevPage==='p-histoire'||prevPage==='p-lecture')?'p-main':prevPage;
  document.getElementById('histoire-back-btn').onclick=function(){go(backDest);};
  go('p-histoire');
}



function refreshTWHistoire(){
  const b=BOOKS.find(x=>x.id===currentHistoireId);if(!b)return;
  const prefs=optParHistoire[currentHistoireId];
  const twrHistoire=prefs?prefs.twrHistoire:compte.twrHistoire;
  const twBox=document.getElementById('tw-box');
  const twRevealBtn=document.getElementById('tw-reveal-btn');
  const twBoxReveal=document.getElementById('tw-box-reveal');
  twBox.style.display='none';
  if(twBoxReveal)twBoxReveal.style.display='none';
  if(twRevealBtn)twRevealBtn.style.display='none';
  if(b.tw){
    if(twrHistoire!==false){twBox.style.display='block';document.getElementById('tw-text').textContent=b.tw;}
    else{if(twRevealBtn)twRevealBtn.style.display='block';if(twBoxReveal)twBoxReveal.textContent=b.tw;}
  }
}

// openLecture est définie dans lecture.js

/* SEARCH */
function handleSearch(val){
  const label=document.getElementById('search-label');
  const q=val.trim().toLowerCase();
  var res;
  if(!q){label.textContent='Suggestions';res=BOOKS.filter(b=>livreVisible(b));}
  else{res=BOOKS.filter(b=>livreVisible(b)&&(b.title.toLowerCase().includes(q)||b.tags.some(t=>t.toLowerCase().includes(q))));label.textContent=res.length?res.length+' résultat'+(res.length>1?'s':''):'Aucun résultat';}
  renderGrid('search-grid',res);
}

/* BANNER */
let bIdx=0;const BCOUNT=5;
const track=document.getElementById('banner-track');
function setBanner(idx){bIdx=(idx+BCOUNT)%BCOUNT;track.style.transform='translateX(-'+(bIdx*20)+'%)';document.querySelectorAll('.bdot').forEach((d,i)=>d.classList.toggle('active',i===bIdx));}
let bTimer=setInterval(()=>setBanner(bIdx+1),3500);
const bWrap=document.getElementById('banner-wrap');
let tx=0,ty=0;
bWrap.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
bWrap.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){clearInterval(bTimer);setBanner(dx<0?bIdx+1:bIdx-1);bTimer=setInterval(()=>setBanner(bIdx+1),3500);}},{passive:true});

/* PWA */
let deferredPrompt=null;
const pwaBanner=document.getElementById('pwa-banner');
const isIOS=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
if(!isStandalone){
  if(isIOS){setTimeout(()=>{document.getElementById('pwa-install-text').textContent='Appuie sur ⬆ puis "Sur l\'écran d\'accueil"';document.getElementById('pwa-install-btn').textContent='Comment ?';document.getElementById('pwa-install-btn').onclick=()=>alert('1. Appuie sur ⬆ en bas de Safari\n2. Choisis "Sur l\'écran d\'accueil"\n3. Appuie sur "Ajouter"');pwaBanner.classList.remove('hidden');},5000);}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;setTimeout(()=>pwaBanner.classList.remove('hidden'),5000);});
}
function installPWA(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;closePWABanner();});}}
function closePWABanner(){pwaBanner.classList.add('hidden');}
window.addEventListener('appinstalled',()=>closePWABanner());
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});


/* ══════════════════════════════════════════════════════
   MARQUE-PAGE & RENDU LISTE CHAPITRES
   ══════════════════════════════════════════════════════ */

function _renderChapitresList(b, vc, marquePageNum){
  const chapList=document.getElementById('chapitres-list');
  if(!chapList) return;
  const prefsHist=(typeof optParHistoire!=='undefined')?optParHistoire[b.id]:null;
  const masquer=prefsHist?prefsHist.afficherChoixVersion:compte.afficherChoixVersion;
  // Mettre à jour le bouton lecture rapide
  _updateBtnLectureRapide(b);

  chapList.innerHTML=b.chapitres.map(function(ch){
    const libre=ch.gratuit||ch.num<=(b.gratuit_jusqu_au||8);
    const estAdulte18=compte.trancheAge==='adulte'&&b.adulte&&b.versionSoft&&ch.spicy;
    if(!vc[ch.num]) vc[ch.num]=compte.versionDefaut||'spicy';
    const badge='<span class="ch-badge'+(libre?'':' ch-badge-ticket')+'" style="flex-shrink:0;min-width:54px;text-align:center">'+(libre?'Gratuit':'🎟 1 ticket')+'</span>';
    const montrerBtns=estAdulte18&&!masquer;
    const versionActive=vc[ch.num]||'spicy';
    const versionBtns=montrerBtns
      ?'<span class="ch-version-btn'+(versionActive==='soft'?' ch-version-active':'')+'" id="vbtn-soft-'+ch.num+'" onclick="event.stopPropagation();cocherVersion('+ch.num+',\'soft\')" title="Version douce">🌸</span>'
       +'<span class="ch-version-btn'+(versionActive==='spicy'?' ch-version-active':'')+'" id="vbtn-spicy-'+ch.num+'" onclick="event.stopPropagation();cocherVersion('+ch.num+',\'spicy\')" title="Version spicy">🌶</span>'
      :'';
    const onclick=estAdulte18
      ?'onclick="ouvrirVersionChoisie(\''+b.id+'\','+ch.num+')"'
      :'onclick="openLecture(\''+b.id+'\','+ch.num+')"';
    const _lus=JSON.parse(localStorage.getItem('chapitres_lus_'+b.id)||'[]');
    const estLu=_lus.indexOf(ch.num)!==-1;
    const marquePage=(ch.num===marquePageNum)
      ?'<span style="font-size:13px;flex-shrink:0" title="Dernière lecture">🔖</span>'
      :'';
    return '<div class="ch-lire-row">'
      +'<button class="btn-lire'+(libre?'':' btn-lire-locked')+(estLu?' btn-lire-lu':'')+'" '+onclick+'>'
      +'<span style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">'+marquePage+'<span class="ch-lire-titre">Ch.'+ch.num+' · '+ch.titre+'</span></span>'
      +'<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">'+versionBtns+badge+'</div>'
      +'</button>'
      +'</div>';
  }).join('');
}

async function sauvegarderMarquePage(bookId,chapNum){
  // Toujours sauvegarder en localStorage d'abord
  const mp=JSON.parse(localStorage.getItem('marque_pages')||'{}');
  mp[bookId]=chapNum;
  localStorage.setItem('marque_pages',JSON.stringify(mp));
  // Puis tenter Supabase si connecté
  if(compte.loggedIn&&compte.userId){
    try{
      await db.from('marque_pages').upsert({
        user_id:compte.userId,
        histoire_id:bookId,
        chapitre_num:chapNum,
        updated_at:new Date().toISOString()
      },{onConflict:'user_id,histoire_id'});
    }catch(e){}
  }
}


/* ══════════════════════════════════════════════════════
   BOUTON LECTURE RAPIDE
   ══════════════════════════════════════════════════════ */

function _updateBtnLectureRapide(b){
  const btn=document.getElementById('btn-lecture-rapide');
  if(!btn||!b) return;

  const lus=JSON.parse(localStorage.getItem('chapitres_lus_'+b.id)||'[]');
  const marquePages=JSON.parse(localStorage.getItem('marque_pages')||'{}');
  const dernierChapLu=marquePages[b.id]||null;

  // Aucun chapitre lu → Commencer
  if(!lus.length||!dernierChapLu){
    btn.textContent="✦ Commencer l'histoire";
    btn.style.display='block';
    window._lectureRapideChap=b.chapitres.length?b.chapitres[0].num:1;
    return;
  }

  // Histoire terminée ET dernier chapitre fini → Recommencer
  const dernierChap=b.chapitres[b.chapitres.length-1];
  const dernierFini=localStorage.getItem('chapitre_fini_'+b.id+'_'+dernierChap.num)==='1';
  if(b.statut==='termine'&&dernierFini){
    btn.textContent='✦ Recommencer la lecture';
    btn.style.display='block';
    window._lectureRapideChap=b.chapitres[0].num;
    return;
  }

  // Chapitre marqué fini → ouvrir le suivant, sinon reprendre le dernier lu
  const chapFini=localStorage.getItem('chapitre_fini_'+b.id+'_'+dernierChapLu)==='1';
  if(chapFini){
    const chapSuivant=b.chapitres.find(c=>c.num===dernierChapLu+1);
    window._lectureRapideChap=chapSuivant?chapSuivant.num:dernierChapLu;
  } else {
    window._lectureRapideChap=dernierChapLu;
  }
  btn.textContent='✦ Continuer la lecture';
  btn.style.display='block';
}

function lancerLectureRapide(){
  if(currentHistoireId&&window._lectureRapideChap!=null){
    openLecture(currentHistoireId, window._lectureRapideChap);
  }
}
