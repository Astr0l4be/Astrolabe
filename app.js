/* STARS */
const starsEl=document.getElementById('stars');
for(let i=0;i<70;i++){const s=document.createElement('div');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--d',(2+Math.random()*5)+'s');s.style.setProperty('--dl',(-Math.random()*5)+'s');s.style.width=s.style.height=(Math.random()>0.7?3:2)+'px';starsEl.appendChild(s);}

/* ÉTAT */
const compte={loggedIn:false,pseudo:'',tickets:0,userId:null,adulte:false,softSpicy:false,trancheAge:'adulte',twrHistoire:true,twrChapitre:false,afficherChoixVersion:false,versionDefaut:'spicy',avatar:'☽',age:16,role:'lectrice'};
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
let _auteursUserIds = {}; // { auteur_pseudo: user_id }

function _estAutriceDeLHistoire(b) {
  if (!compte.userId || !b.author) return false;
  // Chercher le user_id associé au nom de plume de l'histoire
  const userId = _auteursUserIds[b.author];
  return userId === compte.userId;
}

function _aDesChapitresNonLus(b) {
  const lus = JSON.parse(localStorage.getItem('chapitres_lus_' + b.id) || '[]');
  const maintenant = new Date();
  return b.chapitres.some(function(ch) {
    if (ch.datePublication && new Date(ch.datePublication) > maintenant) return false;
    return !lus.includes(ch.num);
  });
}

function bookCardHTML(b){
  const img=b.cover?`<img src="${b.cover}" alt="${b.title}" loading="lazy">`:'';
  const icones=b.adulte&&compte.trancheAge==='adulte'
    ?`<div class="book-card-icones">${b.versionSoft?'<span class="book-card-icone">🌸</span>':''}<span class="book-card-icone">🌶</span></div>`
    :!b.adulte
    ?'<div class="book-card-icones"><span class="book-card-icone">🌸</span></div>'
    :'';
  const formatBadge=b.format
    ?`<div class="book-format-badge">${b.format==='bd'?'🎨':b.format==='webtoon'?'📱':b.format==='audio'?'🎧':'📖'}</div>`
    :'';
  const badgeNonLu=_aDesChapitresNonLus(b)
    ?'<span class="book-card-badge-new"></span>'
    :'';
  return`<div class="book-card ${b.color}" onclick="openHistoire('${b.id}')" style="position:relative">${img}${icones}${formatBadge}${badgeNonLu}<div class="book-card-label">${b.title}</div></div>`;
}

function livreVisible(b){
  const tranche=compte.trancheAge||'adulte';

  // Filtre TW — uniquement si le filtre est activé
  if(compte.twFiltreActif && compte.twFiltres && compte.twFiltres.length && b.tw){
    const twsHistoire = b.tw.split(',').map(t => t.trim());
    const twMatch = compte.twFiltres.filter(f => twsHistoire.includes(f));
    if(twMatch.length){
      // Cas spécial "Scène spicy" : si l'histoire a une version soft, elle reste visible
      const seulementSpicy = twMatch.every(f => f === 'Scène spicy');
      if(seulementSpicy && b.versionSoft) {
        // On laisse passer — la version soft sera servie
      } else {
        return false;
      }
    }
  }

  // 18+ : accès au catalogue selon préférences
  if(tranche==='adulte'){
    // Si la lectrice a désactivé le contenu adulte
    if(!compte.adulte && b.adulte){
      // Autoriser uniquement si version soft disponible
      if(b.versionSoft) return true;
      return false;
    }
    return true;
  }

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

function _formatDatePublication(date){
  const maintenant=new Date();
  const heure=date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  // Comparer par jour calendaire (pas par durée)
  const aujourdhuiStr=maintenant.toDateString();
  const demainDate=new Date(maintenant); demainDate.setDate(demainDate.getDate()+1);
  const demainStr=demainDate.toDateString();
  if(date.toDateString()===aujourdhuiStr) return '⏰ '+heure;
  if(date.toDateString()===demainStr) return 'Demain à '+heure;
  const diff=date-maintenant;
  const jours=Math.round(diff/(1000*60*60*24));
  if(jours<7) return 'Dans '+jours+' jours';
  return date.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})
    +' à '+heure;
}

function renderGrid(id,books){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML=books.filter(b=>livreVisible(b)).map(b=>bookCardHTML(b)).join('');
}

async function loadHistoires(){
  const {data:histoires,error}=await db.from('histoires').select('*').or('statut.eq.en-cours,statut.eq.pause,statut.eq.termine').order('created_at',{ascending:false});
  if(error||!histoires)return;
  await _chargerTwGlobaux(); // Charger les TW globaux pour les filtres
  const {data:allTags}=await db.from('histoires_tags').select('histoire_id, tags(nom)');
  const {data:allTW}=await db.from('trigger_warnings_histoires').select('histoire_id, contenu');
  const {data:allChaps}=await db.from('chapitres').select('id,histoire_id,numero,titre,gratuit,spicy,date_publication,created_at,tw').order('numero');
  // Charger le mapping pseudo → user_id pour les auteurs
  const {data:auteursData}=await db.from('auteurs').select('pseudo,user_id');
  _auteursUserIds={};
  (auteursData||[]).forEach(a=>{if(a.pseudo&&a.user_id)_auteursUserIds[a.pseudo]=a.user_id;});
  BOOKS=histoires.map(h=>{
    const tags=(allTags||[]).filter(t=>t.histoire_id===h.id).map(t=>t.tags?.nom).filter(Boolean);
    const tws=(allTW||[]).filter(t=>t.histoire_id===h.id).map(t=>t.contenu);
    const chapitres=(allChaps||[]).filter(ch=>ch.histoire_id===h.id).map(ch=>({
      num:ch.numero,titre:ch.titre,gratuit:ch.gratuit,spicy:ch.spicy||false,
      datePublication:ch.date_publication||null,
      createdAt:ch.created_at||null,
      tw:ch.tw||null,
      texte:null,texte_soft:null,citation:null,citation_auteur:null
    }));
    return{
      id:h.id,title:h.titre,color:'bc'+(Math.floor(Math.random()*8)+1),
      cover:h.cover_url||null,banner:h.banner_url||null,author:h.auteur_pseudo||'',
      tags,tw:tws.join(', ')||null,desc:h.resume||'',
      format:h.format||'roman',
      adulte:h.adulte||false,versionSoft:h.version_soft||false,
      adapteMoins18:h.adapte_moins18||false,adapteMoins16:h.adapte_moins16||false,
      gratuit_jusqu_au:h.gratuit_jusqu_au||8,numerotation:h.numerotation||'arabe',chapitres
    };
  });
  _indexerChapsProgrammes();
  const _sortedBooks=[...BOOKS].sort((a,b)=>(_aDesChapitresNonLus(b)?1:0)-(_aDesChapitresNonLus(a)?1:0));
  renderGrid('book-grid',_sortedBooks);
  renderGrid('search-grid',BOOKS);
  renderGrid('hashtag-grid',BOOKS);
  renderSectionAujourdhui();
  renderSectionContinuer();
  renderSectionRecos();
  renderSectionDerniersChaps();
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
      .select('contenu,contenu_soft,citation,citation_auteur,musique_url')
      .eq('histoire_id',bookId).eq('numero',chapNum).single();
    if(data){
      ch.texte=data.contenu||null;
      ch.texte_soft=data.contenu_soft||null;
      ch.citation=data.citation||null;
      ch.citation_auteur=data.citation_auteur||null;
      ch.musique_url=data.musique_url||null;
    }
  } else if(typeof ch.musique_url === 'undefined') {
    const {data}=await db.from('chapitres')
      .select('musique_url')
      .eq('histoire_id',bookId).eq('numero',chapNum).single();
    ch.musique_url = data?.musique_url || null;
  }

  // Décider quelle version servir
  const estSpicySoftDispo = b.adulte && b.versionSoft && ch.spicy && ch.texte_soft;

  if(!estSpicySoftDispo) return ch.texte;

  // 16-18 ans : toujours soft
  if(compte.trancheAge==='ado' && b.adapteMoins18) return ch.texte_soft;

  // Si contenu adulte désactivé dans les préférences → forcer soft
  if(compte.trancheAge==='adulte' && !compte.adulte && estSpicySoftDispo) return ch.texte_soft;

  // Si "Scène spicy" est filtré et que la version soft existe → forcer soft
  const spicyFiltre = compte.twFiltreActif && compte.twFiltres && compte.twFiltres.includes('Scène spicy');
  if(spicyFiltre && estSpicySoftDispo) return ch.texte_soft;

  // Idem depuis la recherche avancée (tags croisés)
  if(_twExclus && _twExclus.includes('Scène spicy') && estSpicySoftDispo) return ch.texte_soft;

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
/* ══════════════════════════════════════════════════════
   SYSTÈME D'URLs PARTAGEABLES
   ══════════════════════════════════════════════════════ */

// Correspondance page → segment d'URL lisible
const _urlSegments = {
  'p-main': '',
  'p-moncompte': 'compte',
  'p-recherche': 'recherche',
  'p-apropos': 'apropos',
  'p-mentions-legales': 'confidentialite',
  'p-cgv': 'cgv',
  'p-cgu': 'cgu',
  'p-inscription1': 'inscription',
  'p-abonnement': 'abonnement',
  'p-acheter-tickets': 'tickets',
  'p-hashtag': 'catalogue',
  'p-tags-croises': 'recherche-avancee',
};

// Construit l'URL à afficher selon la page et le contexte courant
function _construireURL(pageId, extra) {
  const base = window.location.pathname; // ex: "/"
  if (pageId === 'p-main' || pageId === 'p-splash') return base;
  if (pageId === 'p-histoire' && extra?.histoireId) return base + '#histoire/' + extra.histoireId;
  if (pageId === 'p-lecture' && extra?.histoireId && extra?.chapNum) return base + '#histoire/' + extra.histoireId + '/chapitre/' + extra.chapNum;
  if (pageId === 'p-webtoon' && extra?.histoireId && extra?.chapNum) return base + '#histoire/' + extra.histoireId + '/webtoon/' + extra.chapNum;
  if (pageId === 'p-bd' && extra?.histoireId && extra?.chapNum) return base + '#histoire/' + extra.histoireId + '/bd/' + extra.chapNum;
  if (pageId === 'p-audio' && extra?.histoireId && extra?.chapNum) return base + '#histoire/' + extra.histoireId + '/audio/' + extra.chapNum;
  const seg = _urlSegments[pageId];
  if (seg) return base + '#' + seg;
  return base; // pages système (inscription, delete…) → pas d'URL exposée
}

// Pousse une nouvelle entrée dans l'historique du navigateur
function _pushURL(pageId, extra) {
  const url = _construireURL(pageId, extra);
  const state = { pageId, ...extra };
  history.pushState(state, '', url);
}

// Lit le hash de l'URL au chargement et navigue vers la bonne page
async function _lireURLInitiale() {
  const hash = window.location.hash.slice(1); // retire le #
  if (!hash) return; // page d'accueil, rien à faire

  // #histoire/ID
  const mHistoire = hash.match(/^histoire\/([^/]+)$/);
  if (mHistoire) {
    await _attendreBooks();
    openHistoire(mHistoire[1], true);
    return;
  }

  // #histoire/ID/chapitre/NUM
  const mChapitre = hash.match(/^histoire\/([^/]+)\/chapitre\/(\d+)$/);
  if (mChapitre) {
    await _attendreBooks();
    openHistoire(mChapitre[1], true);
    setTimeout(() => openLecture(mChapitre[1], parseInt(mChapitre[2])), 300);
    return;
  }

  // #histoire/ID/webtoon/NUM
  const mWebtoon = hash.match(/^histoire\/([^/]+)\/webtoon\/(\d+)$/);
  if (mWebtoon) {
    await _attendreBooks();
    openHistoire(mWebtoon[1], true);
    setTimeout(() => openWebtoon(mWebtoon[1], parseInt(mWebtoon[2])), 300);
    return;
  }

  // #histoire/ID/bd/NUM
  const mBD = hash.match(/^histoire\/([^/]+)\/bd\/(\d+)$/);
  if (mBD) {
    await _attendreBooks();
    openHistoire(mBD[1], true);
    setTimeout(() => openLectureBD(mBD[1], parseInt(mBD[2])), 300);
    return;
  }

  // #histoire/ID/audio/NUM
  const mAudio = hash.match(/^histoire\/([^/]+)\/audio\/(\d+)$/);
  if (mAudio) {
    await _attendreBooks();
    openHistoire(mAudio[1], true);
    setTimeout(() => openAudio(mAudio[1], parseInt(mAudio[2])), 300);
    return;
  }

  // Pages simples (#compte, #recherche…)
  const pageId = Object.entries(_urlSegments).find(([, seg]) => seg === hash)?.[0];
  if (pageId) { go(pageId, true); return; }
}

// Attend que BOOKS soit chargé (max 5 secondes)
function _attendreBooks() {
  return new Promise(resolve => {
    if (BOOKS.length) { resolve(); return; }
    let tries = 0;
    const t = setInterval(() => {
      if (BOOKS.length || ++tries > 50) { clearInterval(t); resolve(); }
    }, 100);
  });
}

// Bouton retour / avance du navigateur
window.addEventListener('popstate', async (e) => {
  const state = e.state;
  if (!state) { go('p-main', true); return; }

  if (state.pageId === 'p-lecture' && state.histoireId && state.chapNum) {
    await _attendreBooks();
    if (currentHistoireId !== state.histoireId) openHistoire(state.histoireId, true);
    setTimeout(() => openLecture(state.histoireId, state.chapNum, true), currentHistoireId !== state.histoireId ? 300 : 0);
  } else if (state.pageId === 'p-histoire' && state.histoireId) {
    await _attendreBooks();
    openHistoire(state.histoireId, true);
  } else if (state.pageId) {
    go(state.pageId, true);
  } else {
    go('p-main', true);
  }
});

function go(id, _sansHistory){
  // Réinitialiser les cases spoiler/spicy quand on quitte le chapitre
  if (id !== 'p-lecture') {
    ['com-tag-spoiler','com-tag-spicy','bd-com-tag-spoiler','bd-com-tag-spicy'].forEach(cbId => {
      const cb = document.getElementById(cbId);
      if (cb) cb.checked = false;
    });
  }
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');const mo=p.querySelector('.modal-overlay');if(mo)mo.classList.remove('open');});
  if(id==='p-connexion-modal'){document.getElementById('p-main').classList.add('active');setTimeout(()=>openModal('p-connexion-modal'),50);return;}
  const el=document.getElementById(id);if(el)el.classList.add('active');
  const stars=document.getElementById('stars');
  if(stars)stars.style.opacity=(id==='p-lecture')?'0':'1';
  if(id==='p-main'||id==='p-moncompte')updateTopbar();
  if(id==='p-main'&&BOOKS.length){
    const sorted=[...BOOKS].sort((a,b)=>{
      const aNonLu=_aDesChapitresNonLus(a)?1:0;
      const bNonLu=_aDesChapitresNonLus(b)?1:0;
      return bNonLu-aNonLu;
    });
    renderGrid('book-grid',sorted);
    renderSectionAujourdhui();
    renderSectionContinuer();
    renderSectionRecos();
    renderSectionDerniersChaps();
  }
  if(id==='p-moncompte'){
    renderBibliotheque().catch(()=>{});
    if(typeof checkAlertesSignalement==='function') checkAlertesSignalement().catch(()=>{});
    if(typeof chargerNotifications==='function') chargerNotifications().then(()=>{
      if(typeof renderNotifications==='function') renderNotifications();
    }).catch(()=>{});
  }
  if(id==='p-inscription4b' && typeof _initCGUScroll==='function') setTimeout(_initCGUScroll, 100);
  if(id!=='p-splash')sessionStorage.setItem('lastPage',id);

  // Mettre à jour l'URL (sauf lors des navigations déclenchées par popstate)
  if(!_sansHistory && id !== 'p-splash') _pushURL(id);
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

// compte.twFiltreActif = true si le filtre est activé
compte.twFiltres = [];
compte.twFiltreActif = false;

function setTWFiltreActif(actif) {
  compte.twFiltreActif = actif;
  const panel = document.getElementById('tw-filtre-panel');
  if (actif) {
    if (panel) panel.style.display = 'block';
    _renderTWFiltreListe();
  } else {
    if (panel) panel.style.display = 'none';
  }
  if (compte.userId) {
    db.from('profils').update({ tw_filtre_actif: actif }).eq('id', compte.userId).catch(() => {});
  }
  renderGrid('book-grid', BOOKS);
  renderGrid('search-grid', BOOKS);
  renderGrid('hashtag-grid', BOOKS);
}

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

  // Récupérer tous les TW depuis la table globale
  const tousLesTW = await _chargerTwGlobaux();
  if (!tousLesTW.length) {
    liste.innerHTML = '<span style="font-size:11px;color:var(--text3);font-style:italic">Aucun trigger warning enregistré.</span>';
    return;
  }
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
  // Boutons auteurs (un par auteur)
  const auteurWrap=document.getElementById('histoire-author-wrap');
  if(auteurWrap){
    auteurWrap.innerHTML='';
    if(b.author){
      const pseudos=b.author.split(',').map(p=>p.trim()).filter(Boolean);
      // "par " fixe
      const par=document.createElement('span');
      par.textContent='par ';
      par.style.cssText='color:var(--text3);font-family:\'Jost\',sans-serif;font-size:11px;letter-spacing:1px;';
      auteurWrap.appendChild(par);
      pseudos.forEach((pseudo,i)=>{
        // Séparateur : ", " ou " et " avant le dernier
        if(i>0){
          const sep=document.createElement('span');
          sep.textContent=i===pseudos.length-1?' et ':', ';
          sep.style.cssText='color:var(--text3);font-family:\'Jost\',sans-serif;font-size:11px;letter-spacing:1px;';
          auteurWrap.appendChild(sep);
        }
        const btn=document.createElement('button');
        btn.textContent=pseudo;
        btn.style.cssText='background:none;border:none;color:var(--text3);font-family:\'Jost\',sans-serif;font-size:11px;letter-spacing:1px;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px;';
        btn.onclick=()=>openAuteurParPseudo(pseudo);
        auteurWrap.appendChild(btn);
      });
    }
  }
  document.getElementById('histoire-tags').innerHTML=b.tags.map(t=>`<span class="histoire-tag"># ${t}</span>`).join('');
  document.getElementById('histoire-desc').innerHTML=b.desc;

  // Icônes spicy/soft sur la page histoire
  const iconeEl=document.getElementById('histoire-icones');
  if(iconeEl){
    if(b.adulte && b.versionSoft){
      iconeEl.textContent='🌶 🌸';iconeEl.style.display='block';
    } else if(b.adulte && !b.versionSoft){
      iconeEl.textContent='🌶';iconeEl.style.display='block';
    } else if(!b.adulte){
      iconeEl.textContent='🌸';iconeEl.style.display='block';
    } else {
      iconeEl.style.display='none';
    }
  }

  // Bandeau spicy/soft — deux messages selon si l'adulte est désactivé
  const bandeauSpicy=document.getElementById('bandeau-spicy');
  if(bandeauSpicy){
    const afficher=compte.trancheAge==='adulte' && b.adulte && b.versionSoft;
    if(!afficher){
      bandeauSpicy.style.display='none';
    } else {
      const softForce=!compte.adulte
        ||(compte.twFiltreActif&&compte.twFiltres&&compte.twFiltres.includes('Scène spicy'))
        ||(_twExclus&&_twExclus.includes('Scène spicy'));
      if(softForce){
        // Mode soft forcé — expliquer pourquoi
        bandeauSpicy.style.cssText='display:block;margin:0 16px 14px;padding:14px 16px;background:linear-gradient(135deg,rgba(126,159,212,.12),rgba(167,143,212,.12));border:1px solid rgba(126,159,212,.3);border-radius:12px;font-size:12px;color:var(--text);line-height:1.8;text-align:center;letter-spacing:.3px;';
        bandeauSpicy.innerHTML='<span style="font-size:24px;display:block;margin-bottom:8px">🌸</span>Cette histoire existe aussi en version spicy, mais est actuellement affichée en version soft.<br>Tu peux changer la version depuis les paramètres !<br><span style="color:var(--accent);font-size:11px;letter-spacing:.5px">✦ Bonne lecture. ✦</span>';
      } else {
        // Mode choix disponible
        bandeauSpicy.style.cssText='display:block;margin:0 16px 14px;padding:14px 16px;background:linear-gradient(135deg,rgba(212,126,126,.12),rgba(126,159,212,.12));border:1px solid rgba(212,126,126,.3);border-radius:12px;font-size:12px;color:var(--text);line-height:1.8;text-align:center;letter-spacing:.3px;';
        bandeauSpicy.innerHTML='<span style="font-size:20px;display:block;margin-bottom:6px">🌶 🌸</span>Cette histoire contient des scènes spicy et existe aussi en version soft.<br>Tu peux choisir la version que tu préfères dans les paramètres !<br><span style="color:var(--accent);font-size:11px;letter-spacing:.5px">✦ Bonne lecture ! ✦</span>';
      }
    }
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
  // Réinitialiser l'ordre pour cette histoire (sera recalculé automatiquement)
  if(window._ordreChapitres) delete window._ordreChapitres[id];
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
  if(typeof loadTopCommentaires==='function') loadTopCommentaires(id).catch(()=>{});
  _loadTotalLikesHistoire(id).catch(()=>{});
  const backDest=(prevPage==='p-histoire'||prevPage==='p-lecture')?'p-main':prevPage;
  document.getElementById('histoire-back-btn').onclick=function(){go(backDest);};
  // Mettre à jour l'URL (sauf si appelé depuis popstate)
  const _sansHistHist = arguments[1];
  if(!_sansHistHist) _pushURL('p-histoire', { histoireId: id });
  go('p-histoire', true);
}

/* ══════════════════════════════════════════════════════
   PAGE AUTEUR
   ══════════════════════════════════════════════════════ */

async function openAuteur(histoireId){
  const b=BOOKS.find(x=>x.id===histoireId);
  if(!b||!b.author)return;
  const pseudo=b.author.split(',')[0].trim();
  openAuteurParPseudo(pseudo);
}

async function openAuteurParPseudo(pseudo){
  // Charger les données de l'auteur depuis Supabase
  const {data:auteur}=await db.from('auteurs').select('*').eq('pseudo',pseudo).single();
  if(!auteur)return;

  // Retour vers la page histoire
  const backBtn=document.getElementById('auteur-back-btn');
  if(backBtn) backBtn.onclick=()=>go('p-histoire');

  // Remplir le contenu
  const container=document.getElementById('auteur-content');
  if(!container)return;

  // Photo ou avatar
  const photoHtml=auteur.photo_url
    ?`<img src="${auteur.photo_url}" class="auteur-photo" alt="${auteur.pseudo}">`
    :`<div class="auteur-avatar">✍</div>`;

  // Réseaux sociaux
  const reseaux=[];
  if(auteur.instagram) reseaux.push(`<a href="https://instagram.com/${auteur.instagram.replace('@','')}" target="_blank" class="auteur-reseau-btn">📷 Instagram</a>`);
  if(auteur.twitter)   reseaux.push(`<a href="https://twitter.com/${auteur.twitter.replace('@','')}" target="_blank" class="auteur-reseau-btn">🐦 Twitter / X</a>`);
  if(auteur.tiktok)    reseaux.push(`<a href="https://tiktok.com/@${auteur.tiktok.replace('@','')}" target="_blank" class="auteur-reseau-btn">🎵 TikTok</a>`);
  if(auteur.site_web)  reseaux.push(`<a href="${auteur.site_web}" target="_blank" class="auteur-reseau-btn">🌐 Site web</a>`);
  const reseauxHtml=reseaux.length?`<div class="auteur-reseaux">${reseaux.join('')}</div>`:'';

  // Histoires de cet auteur
  const histoires=BOOKS.filter(x=>x.author&&x.author.split(',').map(p=>p.trim()).includes(auteur.pseudo)&&livreVisible(x));
  const histoiresHtml=histoires.length
    ?`<div class="auteur-histoires-label">✦ Ses histoires</div>`
      +histoires.map(h=>`
        <div class="auteur-histoire-card" onclick="openHistoire('${h.id}')">
          ${h.cover
            ?`<img src="${h.cover}" class="auteur-histoire-cover" alt="${h.title}">`
            :`<div class="auteur-histoire-cover-placeholder">📖</div>`}
          <div>
            <div class="auteur-histoire-title">${h.title}</div>
            <div class="auteur-histoire-meta">${h.chapitres.length} chapitre${h.chapitres.length>1?'s':''}</div>
          </div>
        </div>`).join('')
    :'';

  container.innerHTML=`
    <div style="text-align:center;margin-bottom:20px">
      ${photoHtml}
      <div class="auteur-nom">${auteur.pseudo}</div>
      ${auteur.bio?`<p class="auteur-bio">${auteur.bio}</p>`:''}
    </div>
    ${reseauxHtml}
    ${histoiresHtml}
  `;

  go('p-auteur');
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

async function _loadTotalLikesHistoire(histoireId){
  const el=document.getElementById('histoire-likes-total');
  if(!el) return;
  const {count}=await db.from('chapitres_likes')
    .select('*',{count:'exact',head:true})
    .eq('histoire_id',histoireId);
  if(!count){el.style.display='none';return;}
  el.style.display='block';
  el.textContent='♥ '+count+' j\'aime sur toute la série';
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
/* BANNER DYNAMIQUE */
let bIdx=0,bCount=0,bTimer=null;
function getTrack(){return document.getElementById('banner-track');}

function setBanner(idx){
  if(!bCount)return;
  bIdx=(idx+bCount)%bCount;
  getTrack().style.transform='translateX(-'+(bIdx*(100/bCount))+'%)';
  document.querySelectorAll('.bdot').forEach((d,i)=>d.classList.toggle('active',i===bIdx));
}

function _startBannerTimer(){
  if(bTimer)clearInterval(bTimer);
  if(bCount>1)bTimer=setInterval(()=>setBanner(bIdx+1),3500);
}

async function loadBannieres(){
  const{data,error}=await db.from('bannieres').select('*').eq('actif',true).order('ordre');
  if(error||!data||!data.length){
    // Fallback slide vide
    getTrack().innerHTML='<div class="banner-slide b1" style="display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text3);letter-spacing:2px;">✦ Astrolabe ✦</div>';
    bCount=1;return;
  }
  bCount=data.length;
  getTrack().style.width=(bCount*100)+'%';
  getTrack().innerHTML=data.map((b,i)=>{
    const slideW = (100/bCount)+'%';
    const onclick=b.lien
      ? b.type_lien==='histoire' ? `onclick="openHistoire('${b.histoire_id}')"`
      : b.type_lien==='chapitre' ? `onclick="openHistoire('${b.histoire_id}');setTimeout(()=>openLecture('${b.histoire_id}',${b.chapitre_num}),300)"`
      : b.type_lien==='interne' ? `onclick="go('${b.lien}')"`
      : `onclick="window.open('${b.lien}','_blank')"`
      :'';
    return`<div class="banner-slide" style="width:${slideW};cursor:${b.lien?'pointer':'default'}" ${onclick}>
      <img src="${b.image_url}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>`;
  }).join('');
  // Dots
  const dotsEl=document.getElementById('banner-dots');
  if(dotsEl){
    dotsEl.innerHTML=data.map((_,i)=>`<div class="bdot${i===0?' active':''}" id="bd${i}"></div>`).join('');
  }
  setBanner(0);
  _startBannerTimer();
}

const bWrap=document.getElementById('banner-wrap');
let tx=0,ty=0;
bWrap.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
bWrap.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){e.preventDefault();clearInterval(bTimer);setBanner(dx<0?bIdx+1:bIdx-1);_startBannerTimer();}},{passive:false});

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
  _updateBtnLectureRapide(b);

  // ── Déterminer l'ordre automatique si pas encore défini pour cette histoire ──
  if(window._ordreChapitres===undefined) window._ordreChapitres={};
  if(window._ordreChapitres[b.id]===undefined){
    // Compter les chapitres non lus publiés
    const _now2=new Date();
    const _lus0=JSON.parse(localStorage.getItem('chapitres_lus_'+b.id)||'[]');
    const nonLus=b.chapitres.filter(ch=>{
      const dp=ch.datePublication?new Date(ch.datePublication):null;
      if(dp&&dp>_now2) return false;
      return !_lus0.includes(ch.num);
    }).length;
    // ≤ 2 non lus → décroissant (plus récent en premier), sinon croissant
    window._ordreChapitres[b.id] = nonLus<=2 && b.chapitres.length>0 ? 'desc' : 'asc';
  }

  // Mettre à jour le bouton
  const btnOrdre=document.getElementById('btn-ordre-chaps');
  if(btnOrdre){
    btnOrdre.textContent=window._ordreChapitres[b.id]==='asc' ? '↑↓ Le plus ancien' : '↑↓ Le plus récent';
  }

  var _now=new Date();
  let chapitresAffiches=[...b.chapitres];
  if(window._ordreChapitres[b.id]==='desc') chapitresAffiches.reverse();

  chapList.innerHTML=chapitresAffiches.map(function(ch){
    var _dp=ch.datePublication?new Date(ch.datePublication):null;
    if(_dp&&_dp>_now){
      var _na=(b.numerotation==='romain')?toRoman(ch.num):ch.num;
      var _ds=_formatDatePublication(_dp);
      return '<div class="ch-lire-row">'
        +'<button class="btn-lire btn-lire-locked btn-lire-avenir" disabled>'
        +'<span class="ch-col-bookmark"></span>'
        +'<span class="ch-col-info">'
        +'<span class="ch-lire-titre">Ch.'+_na+' · '+ch.titre+'</span>'
        +'</span>'
        +'<span class="ch-col-right"><span class="ch-date-pub">'+_ds+'</span></span>'
        +'</button>'
        +'</div>';
    }
    const _seuilGratuit = b.format==='audio' ? (b.gratuit_jusqu_au||2) : (b.gratuit_jusqu_au||8);
    const libreAcces=ch.gratuit||ch.num<=_seuilGratuit
      || compte.role==='admin'
      || (compte.role==='autrice' && _estAutriceDeLHistoire(b));
    const libre=ch.gratuit||ch.num<=_seuilGratuit; // pour le badge uniquement
    const estAdulte18=compte.trancheAge==='adulte'&&b.adulte&&b.versionSoft&&ch.spicy;
    // Forcer soft si : contenu adulte désactivé, filtre Scène spicy actif, ou ado -18
    const forcerSoft=estAdulte18&&(
      (compte.trancheAge==='adulte'&&!compte.adulte)
      ||(compte.twFiltreActif&&compte.twFiltres&&compte.twFiltres.includes('Scène spicy'))
      ||(_twExclus&&_twExclus.includes('Scène spicy'))
      ||(compte.trancheAge==='ado'&&b.adapteMoins18)
    );
    if(!vc[ch.num]) vc[ch.num]=compte.versionDefaut||'spicy';
    const badge='<span class="ch-badge'+(libre?'':' ch-badge-ticket')+'" style="flex-shrink:0;min-width:54px;text-align:center">'+(libre?'Gratuit':'🎟 1 ticket')+'</span>';
    const montrerBtns=estAdulte18&&!masquer&&!forcerSoft;
    const versionActive=vc[ch.num]||'spicy';
    const versionBtns=montrerBtns
      ?'<span class="ch-version-btn'+(versionActive==='soft'?' ch-version-active':'')+'" id="vbtn-soft-'+ch.num+'" onclick="event.stopPropagation();cocherVersion('+ch.num+',\'soft\')" title="Version douce">🌸</span>'
       +'<span class="ch-version-btn'+(versionActive==='spicy'?' ch-version-active':'')+'" id="vbtn-spicy-'+ch.num+'" onclick="event.stopPropagation();cocherVersion('+ch.num+',\'spicy\')" title="Version spicy">🌶</span>'
      :'';
    const onclick=forcerSoft
      ?'onclick="openLecture(\''+b.id+'\','+ch.num+')"'
      :estAdulte18
      ?'onclick="ouvrirVersionChoisie(\''+b.id+'\','+ch.num+')"'
      : b.format==='bd' ? 'onclick="openLectureBD(\''+b.id+'\','+ch.num+')"'
      : b.format==='webtoon' ? 'onclick="openWebtoon(\''+b.id+'\','+ch.num+')"'
      : b.format==='audio' ? 'onclick="openAudio(\''+b.id+'\','+ch.num+')"'
      :'onclick="openLecture(\''+b.id+'\','+ch.num+')"';
    const _lus=JSON.parse(localStorage.getItem('chapitres_lus_'+b.id)||'[]');
    const estLu=_lus.indexOf(ch.num)!==-1;
    const marquePage=(ch.num===marquePageNum)
      ?'<span style="font-size:13px;flex-shrink:0" title="Dernière lecture">🔖</span>'
      :'';
    var _datePubStr='';
    var _dateRef=ch.datePublication||ch.createdAt;
    if(_dateRef){
      var _dpPasse=new Date(_dateRef);
      _datePubStr='<span class="ch-date-passee">'
        +_dpPasse.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})
        +'</span>';
    }
    return '<div class="ch-lire-row">'
      +'<button class="btn-lire'+(libreAcces?'':' btn-lire-locked')+(estLu?' btn-lire-lu':'')+'" '+onclick+'>'
      +'<span class="ch-col-bookmark">'+marquePage+'</span>'
      +'<span class="ch-col-info">'
      +'<span class="ch-lire-titre">Ch.'+ch.num+' · '+ch.titre+'</span>'
      +(_datePubStr?'<span class="ch-date-passee">'+_dpPasse.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+'</span>':'')
      +'</span>'
      +'<span class="ch-col-right">'+versionBtns+'<span class="ch-like-count" id="ch-likes-'+ch.num+'"></span>'+badge+'</span>'
      +'</button>'
      +'</div>';
  }).join('');

  // Charger les likes en arrière-plan sans bloquer l'affichage
  _injecterLikesChapitres(b.id).catch(()=>{});
}

/* ══════════════════════════════════════════════════════
   TIMER — déblocage automatique des chapitres programmés
   ══════════════════════════════════════════════════════ */

// Chapitres dont on suit la date de publication
var _chapsProgrammes = [];

function _indexerChapsProgrammes() {
  _chapsProgrammes = [];
  BOOKS.forEach(function(b) {
    b.chapitres.forEach(function(ch) {
      if (ch.datePublication) {
        _chapsProgrammes.push({ bookId: b.id, chapNum: ch.num, date: new Date(ch.datePublication) });
      }
    });
  });
}

function _verifierChapsProgrammes() {
  if (!_chapsProgrammes.length) return;
  var now = new Date();
  var aDebloquer = _chapsProgrammes.filter(function(c) { return c.date <= now; });
  if (!aDebloquer.length) return;
  // Retirer les chapitres débloqués de la liste de suivi
  _chapsProgrammes = _chapsProgrammes.filter(function(c) { return c.date > now; });
  // Re-rendre la liste pour chaque histoire concernée
  var histoireIds = [...new Set(aDebloquer.map(function(c) { return c.bookId; }))];
  histoireIds.forEach(function(bookId) {
    var b = BOOKS.find(function(x) { return x.id === bookId; });
    if (!b) return;
    // Seulement si la page histoire est actuellement visible pour cette histoire
    if (currentHistoireId === bookId && document.getElementById('p-histoire')?.classList.contains('active')) {
      var vc = window._versionsChoisies || {};
      var mp = JSON.parse(localStorage.getItem('marque_pages') || '{}');
      _renderChapitresList(b, vc, mp[bookId] || null);
    }
  });
}

// Lancer le timer toutes les 30 secondes
setInterval(_verifierChapsProgrammes, 30000);

async function _injecterLikesChapitres(histoireId){
  const {data}=await db.from('chapitres_likes')
    .select('chapitre_num')
    .eq('histoire_id',histoireId);
  if(!data||!data.length) return;
  const likesParChap={};
  data.forEach(l=>{likesParChap[l.chapitre_num]=(likesParChap[l.chapitre_num]||0)+1;});
  Object.entries(likesParChap).forEach(([num,nb])=>{
    const el=document.getElementById('ch-likes-'+num);
    if(el&&nb>0) el.textContent='♥ '+nb;
  });
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

function ouvrirInscriptionSansRetour(){
  go('p-inscription1');
  const btn=document.getElementById('insc1-back-btn');
  if(btn) btn.style.display='none';
  const sansCpte=document.getElementById('insc1-sans-compte-btn');
  if(sansCpte) sansCpte.style.display='block';
  sessionStorage.setItem('insc_depuis_accueil','1');
}

function continuerSansCompteDepuisInscription(){
  // Cacher le bouton, remettre le retour par défaut, aller sur p-main
  const sansCpte=document.getElementById('insc1-sans-compte-btn');
  if(sansCpte) sansCpte.style.display='none';
  sessionStorage.removeItem('insc_depuis_accueil');
  go('p-main');
  // Ouvrir le popup d'âge comme si on avait cliqué "Continuer sans compte" depuis l'accueil
  setTimeout(()=>openModal('age-popup'),300);
}

function toggleOrdreChapitres(){
  const b=BOOKS.find(x=>x.id===currentHistoireId);
  if(!b) return;
  if(!window._ordreChapitres) window._ordreChapitres={};
  window._ordreChapitres[b.id]=window._ordreChapitres[b.id]==='asc'?'desc':'asc';
  const vc=window._versionsChoisies||{};
  const mp=JSON.parse(localStorage.getItem('marque_pages')||'{}');
  _renderChapitresList(b,vc,mp[b.id]||null);
}

function lancerLectureRapide(){
  if(currentHistoireId&&window._lectureRapideChap!=null){
    openLecture(currentHistoireId, window._lectureRapideChap);
  }
}

/* ══════════════════════════════════════════════════════
   SECTIONS DYNAMIQUES PAGE PRINCIPALE
   ══════════════════════════════════════════════════════ */

/* ── Helper : génère une book-card pour un scroll horizontal ── */
function _hscrollCard(b){
  return bookCardHTML(b);
}

/* ── 1. Aujourd'hui : histoires avec un chapitre publié ce jour ── */
function renderSectionAujourdhui(){
  const section=document.getElementById('section-aujourdhui');
  const track=document.getElementById('hscroll-aujourdhui');
  if(!section||!track) return;

  const maintenant=new Date();
  const debutJour=new Date(maintenant.getFullYear(),maintenant.getMonth(),maintenant.getDate());
  const finJour=new Date(debutJour.getTime()+86400000);

  const livres=BOOKS.filter(b=>{
    if(!livreVisible(b)) return false;
    return b.chapitres.some(ch=>{
      if(!ch.datePublication) return false;
      const d=new Date(ch.datePublication);
      return d>=debutJour && d<finJour;
    });
  });

  if(!livres.length){ section.style.display='none'; return; }
  section.style.display='block';
  track.innerHTML=livres.map(b=>_hscrollCard(b)).join('');
}

/* ── 2. Continuer la lecture : histoires avec chapitres non lus ── */
function renderSectionContinuer(){
  const section=document.getElementById('section-continuer');
  const track=document.getElementById('hscroll-continuer');
  if(!section||!track) return;

  // Utiliser biblio_continuer pour respecter l'ordre chronologique des lectures
  const historique=JSON.parse(localStorage.getItem('biblio_continuer')||'[]');
  const livres=historique
    .map(e=>BOOKS.find(b=>b.id===e.id))
    .filter(b=>b && livreVisible(b) && _aDesChapitresNonLus(b));

  if(!livres.length){ section.style.display='none'; return; }
  section.style.display='block';
  track.innerHTML=livres.map(b=>_hscrollCard(b)).join('');
}

/* ── 3. Recommandations (2 lignes basées sur les 2 dernières lectures) ── */
function renderSectionRecos(){
  const historique=JSON.parse(localStorage.getItem('biblio_continuer')||'[]');
  if(!historique.length){
    document.getElementById('section-reco1').style.display='none';
    document.getElementById('section-reco2').style.display='none';
    return;
  }

  // Prendre les 2 dernières histoires lues distinctes
  const dernieres=[];
  for(const e of historique){
    const b=BOOKS.find(x=>x.id===e.id);
    if(b && livreVisible(b) && !dernieres.find(x=>x.id===b.id)) dernieres.push(b);
    if(dernieres.length>=2) break;
  }

  function recosPour(livre, sectionId, labelId){
    const section=document.getElementById(sectionId);
    const label=document.getElementById(labelId);
    const track=document.getElementById('hscroll-'+sectionId.replace('section-',''));
    if(!section||!label||!track){ if(section) section.style.display='none'; return; }

    if(!livre){ section.style.display='none'; return; }

    const recos=BOOKS.filter(b=>{
      if(!livreVisible(b)) return false;
      if(b.id===livre.id) return false;
      const tagsCommuns=b.tags.filter(t=>livre.tags.includes(t));
      return tagsCommuns.length>=2;
    });

    if(!recos.length){ section.style.display='none'; return; }

    const titre=livre.title.length>20 ? livre.title.substring(0,18)+'…' : livre.title;
    label.textContent='Parce que tu as lu · '+titre;
    section.style.display='block';
    track.innerHTML=recos.map(b=>_hscrollCard(b)).join('');
  }

  recosPour(dernieres[0]||null, 'section-reco1', 'reco1-label');
  recosPour(dernieres[1]||null, 'section-reco2', 'reco2-label');
}

/* ── 4. Derniers chapitres publiés ── */
function renderSectionDerniersChaps(){
  const section=document.getElementById('section-derniers-chaps');
  const track=document.getElementById('hscroll-derniers-chaps');
  if(!section||!track) return;

  const maintenant=new Date();

  // Collecter tous les chapitres publiés avec leur livre
  const tousChaps=[];
  BOOKS.forEach(b=>{
    if(!livreVisible(b)) return;
    b.chapitres.forEach(ch=>{
      const dateRef=ch.datePublication||ch.createdAt;
      if(!dateRef) return;
      const d=new Date(dateRef);
      if(d>maintenant) return; // pas encore publié
      tousChaps.push({b, ch, date:d});
    });
  });

  // Trier par date décroissante, garder les 20 plus récents
  tousChaps.sort((a,z)=>z.date-a.date);
  const recents=tousChaps.slice(0,20);

  if(!recents.length){ section.style.display='none'; return; }
  section.style.display='block';

  track.innerHTML=recents.map(({b,ch,date})=>{
    const coverHtml=b.cover
      ?`<img src="${b.cover}" alt="${b.title}" loading="lazy">`
      :`<div class="chap-card-cover-bg ${b.color}">✦</div>`;
    const numDisp=(b.numerotation==='romain')?toRoman(ch.num):ch.num;
    const dateTxt=date.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
    const onclick=b.format==='bd'
      ?`openLectureBD('${b.id}',${ch.num})`
      :b.format==='webtoon'?`openWebtoon('${b.id}',${ch.num})`
      :`openLecture('${b.id}',${ch.num})`;
    return `<div class="chap-card" onclick="${onclick}">
      <div class="chap-card-cover">${coverHtml}</div>
      <div class="chap-card-titre">Ch.${numDisp} · ${ch.titre||''}</div>
      <div class="chap-card-histoire">${b.title}</div>
      <div class="chap-card-date">${dateTxt}</div>
    </div>`;
  }).join('');
}

/* ── Helper romain (si pas déjà défini dans lecture.js) ── */
if(typeof toRoman==='undefined'){
  function toRoman(n){
    const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const s=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let r='';for(let i=0;i<v.length;i++){while(n>=v[i]){r+=s[i];n-=v[i];}}return r;
  }
}

/* ══════════════════════════════════════════════════════
   TAGS CROISÉS — sélection multi-tags (max 3)
   ══════════════════════════════════════════════════════ */

let _tagsCroisesSelectionnes = [];
let _tagsExclus = [];
let _twExclus = [];

function reinitialiserTagsCroises() {
  _tagsCroisesSelectionnes = [];
  _tagsExclus = [];
  _twExclus = [];
  _renderTagsCroisesBand();
  _renderTagsExclusBand();
  _renderTwExclusBand();
  _renderTagsCroisesResultats();
}

function ouvrirTagsCroises() {
  _tagsCroisesSelectionnes = [];
  _tagsExclus = [];
  _twExclus = [];
  go('p-tags-croises');
  setTimeout(() => {
    _renderTagsCroisesBand();
    _renderTagsExclusBand();
    _renderTwExclusBand();
    _renderTagsCroisesResultats();
  }, 50);
}

function _allTagsVisibles() {
  return [...new Set(BOOKS.filter(b => livreVisible(b)).flatMap(b => b.tags))].sort();
}

let _twGlobaux = []; // Cache des TW globaux chargés depuis Supabase

async function _chargerTwGlobaux() {
  if (_twGlobaux.length) return _twGlobaux;
  const { data } = await db.from('trigger_warnings').select('contenu,ordre').order('ordre', { ascending: true, nullsFirst: false });
  _twGlobaux = (data || []).map(t => t.contenu).filter(Boolean);
  return _twGlobaux;
}

function _allTwVisibles() {
  return _twGlobaux.length ? _twGlobaux : [...new Set(
    BOOKS.filter(b => livreVisible(b) && b.tw)
         .flatMap(b => b.tw.split(',').map(t => t.trim()).filter(Boolean))
  )].sort();
}

/* Tags à inclure */
function _renderTagsCroisesBand() {
  const band = document.getElementById('tags-croises-band');
  const selEl = document.getElementById('tags-croises-selection');
  if (!band) return;
  const allTags = _allTagsVisibles();
  band.innerHTML = allTags.map(tag => {
    const actif = _tagsCroisesSelectionnes.includes(tag);
    const maxAtteint = _tagsCroisesSelectionnes.length >= 3 && !actif;
    const grise = _tagsExclus.includes(tag); // grisé si déjà exclu
    return `<div class="tag-pill${actif?' active':''}" data-tag-inclure="${tag.replace(/"/g,'&quot;')}"
      style="${maxAtteint||grise?'opacity:0.35;cursor:default;':''}${grise?'text-decoration:line-through;':''}">
      ${actif?'✦ ':''}${tag}</div>`;
  }).join('');
  band.querySelectorAll('[data-tag-inclure]').forEach(el => {
    el.addEventListener('click', () => {
      const tag = el.dataset.tagInclure;
      if (_tagsExclus.includes(tag)) return; // bloqué si déjà exclu
      const idx = _tagsCroisesSelectionnes.indexOf(tag);
      if (idx > -1) _tagsCroisesSelectionnes.splice(idx, 1);
      else { if (_tagsCroisesSelectionnes.length >= 3) return; _tagsCroisesSelectionnes.push(tag); }
      _renderTagsCroisesBand();
      _renderTagsExclusBand();
      _renderTagsCroisesResultats();
    });
  });
  if (selEl) selEl.textContent = _tagsCroisesSelectionnes.length
    ? _tagsCroisesSelectionnes.map(t => '✦ ' + t).join('  ·  ')
    : 'Aucun tag sélectionné';
}

function toggleTagCroise(tag) {
  const idx = _tagsCroisesSelectionnes.indexOf(tag);
  if (idx > -1) _tagsCroisesSelectionnes.splice(idx, 1);
  else { if (_tagsCroisesSelectionnes.length >= 3) return; _tagsCroisesSelectionnes.push(tag); }
  _renderTagsCroisesBand();
  _renderTagsExclusBand(); // mettre à jour le grisage dans l'autre bande
  _renderTagsCroisesResultats();
}

/* Tags à exclure */
function _renderTagsExclusBand() {
  const band = document.getElementById('tags-exclus-band');
  const selEl = document.getElementById('tags-exclus-selection');
  if (!band) return;
  const allTags = _allTagsVisibles();
  band.innerHTML = allTags.map(tag => {
    const actif = _tagsExclus.includes(tag);
    const maxAtteint = _tagsExclus.length >= 2 && !actif;
    const grise = _tagsCroisesSelectionnes.includes(tag); // grisé si déjà inclus
    return `<div class="tag-pill${actif?' active':''}" data-tag-exclure="${tag.replace(/"/g,'&quot;')}"
      style="${actif?'border-color:rgba(224,112,112,0.5);color:#e07070;background:rgba(224,112,112,0.1);':''}${maxAtteint||grise?'opacity:0.35;cursor:default;':''}${grise?'text-decoration:line-through;':''}">
      ${actif?'✕ ':''}${tag}</div>`;
  }).join('');
  band.querySelectorAll('[data-tag-exclure]').forEach(el => {
    el.addEventListener('click', () => {
      const tag = el.dataset.tagExclure;
      if (_tagsCroisesSelectionnes.includes(tag)) return; // bloqué si déjà inclus
      const idx = _tagsExclus.indexOf(tag);
      if (idx > -1) _tagsExclus.splice(idx, 1);
      else { if (_tagsExclus.length >= 2) return; _tagsExclus.push(tag); }
      _renderTagsCroisesBand();
      _renderTagsExclusBand();
      _renderTagsCroisesResultats();
    });
  });
  if (selEl) selEl.textContent = _tagsExclus.length
    ? _tagsExclus.map(t => '✕ ' + t).join('  ·  ')
    : 'Aucun tag exclu';
}

function toggleTagExclu(tag) {
  const idx = _tagsExclus.indexOf(tag);
  if (idx > -1) _tagsExclus.splice(idx, 1);
  else { if (_tagsExclus.length >= 2) return; _tagsExclus.push(tag); }
  _renderTagsExclusBand();
  _renderTagsCroisesBand(); // mettre à jour le grisage dans l'autre bande
  _renderTagsCroisesResultats();
}

/* TW à exclure */
function _renderTwExclusBand() {
  const band = document.getElementById('tw-exclus-band');
  const selEl = document.getElementById('tw-exclus-selection');
  if (!band) return;
  const allTw = _allTwVisibles();
  if (!allTw.length) {
    band.innerHTML = '<span style="font-size:11px;color:var(--text3);font-style:italic;">Aucun trigger warning enregistré.</span>';
    if (selEl) selEl.textContent = '';
    return;
  }
  band.innerHTML = allTw.map(tw => {
    const actif = _twExclus.includes(tw);
    return `<div class="tag-pill${actif?' active':''}" data-tw-exclure="${tw.replace(/"/g,'&quot;')}"
      style="${actif?'border-color:rgba(224,112,112,0.5);color:#e07070;background:rgba(224,112,112,0.1);':''}">
      ${actif?'✕ ':'⚠ '}${tw}</div>`;
  }).join('');
  band.querySelectorAll('[data-tw-exclure]').forEach(el => {
    el.addEventListener('click', () => {
      const tw = el.dataset.twExclure;
      const idx = _twExclus.indexOf(tw);
      if (idx > -1) _twExclus.splice(idx, 1);
      else _twExclus.push(tw);
      _renderTwExclusBand();
      _renderTagsCroisesResultats();
    });
  });
  if (selEl) selEl.textContent = _twExclus.length
    ? _twExclus.map(t => '✕ ' + t).join('  ·  ')
    : 'Aucun TW exclu';
}

function toggleTwExclu(tw) {
  const idx = _twExclus.indexOf(tw);
  if (idx > -1) _twExclus.splice(idx, 1);
  else _twExclus.push(tw);
  _renderTwExclusBand();
  _renderTagsCroisesResultats();
}

/* Résultats */
function _renderTagsCroisesResultats() {
  const grid = document.getElementById('tags-croises-grid');
  const count = document.getElementById('tags-croises-count');
  if (!grid) return;

  const aucunFiltre = !_tagsCroisesSelectionnes.length && !_tagsExclus.length && !_twExclus.length;
  if (aucunFiltre) {
    grid.innerHTML = '';
    if (count) count.textContent = 'Sélectionne au moins un filtre pour voir les résultats.';
    return;
  }

  const resultats = BOOKS.filter(b => {
    if (!livreVisible(b)) return false;
    if (_tagsCroisesSelectionnes.length && !_tagsCroisesSelectionnes.every(tag =>
      b.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    )) return false;
    if (_tagsExclus.length && _tagsExclus.some(tag =>
      b.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    )) return false;
    if (_twExclus.length && b.tw) {
      const twsHistoire = b.tw.split(',').map(t => t.trim().toLowerCase());
      const twMatch = _twExclus.filter(tw => twsHistoire.includes(tw.toLowerCase()));
      if (twMatch.length) {
        // Cas spécial "Scène spicy" : si l'histoire a une version soft, elle reste visible
        const seulementSpicy = twMatch.every(tw => tw.toLowerCase() === 'scène spicy');
        if (seulementSpicy && b.versionSoft) {
          // On laisse passer — la version soft sera servie à la lecture
        } else {
          return false;
        }
      }
    }
    return true;
  });

  if (count) count.textContent = resultats.length + ' histoire' + (resultats.length > 1 ? 's' : '') + ' trouvée' + (resultats.length > 1 ? 's' : '');

  if (resultats.length === 0) {
    grid.innerHTML = ''; const msg = document.createElement('p'); msg.style.cssText = 'text-align:center;padding:40px 20px;color:var(--text3);font-size:13px;grid-column:1/-1;width:100%;'; msg.textContent = 'Aucune histoire ne correspond à ces critères.'; grid.appendChild(msg);
  } else {
    renderGrid('tags-croises-grid', resultats);
  }
}

/* ══════════════════════════════════════════════════════
   MUSIQUE D'AMBIANCE
   ══════════════════════════════════════════════════════ */

let _musiqueAudio = null;
let _musiqueMuted = false;

function lancerMusique(url) {
  arreterMusique();
  if (!url) return;
  _musiqueMuted = false;
  _musiqueAudio = new Audio(url);
  _musiqueAudio.loop = true;
  _musiqueAudio.volume = 0.5;
  _musiqueAudio.play().catch(() => {});
  _renderBoutonMusique(true);
}

function arreterMusique() {
  if (_musiqueAudio) {
    _musiqueAudio.pause();
    _musiqueAudio.src = '';
    _musiqueAudio = null;
  }
  _renderBoutonMusique(false);
}

function toggleMusique() {
  if (!_musiqueAudio) return;
  _musiqueMuted = !_musiqueMuted;
  _musiqueAudio.muted = _musiqueMuted;
  ['musique-btn-roman','musique-btn-bd','musique-btn-wt'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('muted', _musiqueMuted);
  });
}

function _renderBoutonMusique(visible) {
  const ids = ['musique-btn-roman', 'musique-btn-bd', 'musique-btn-wt'];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.display = visible ? 'flex' : 'none';
      if (visible) btn.classList.remove('muted');
    }
  });
}

/* ══════════════════════════════════════════════════════
   LECTURE AUDIO
   ══════════════════════════════════════════════════════ */

async function openAudio(histoireId, chapNum) {
  const b = BOOKS.find(x => x.id === histoireId);
  if (!b) return;
  const ch = b.chapitres.find(c => c.num === chapNum);
  if (!ch) return;

  const libre = ch.gratuit || chapNum <= (b.gratuit_jusqu_au || 2) || compte.role === 'admin';
  if (!libre) {
    if (!compte.loggedIn) { go('p-connexion-modal'); return; }
    if (compte.tickets < (b.prix_ticket || 1)) { _ticketsRetourPage = 'p-histoire'; go('p-acheter-tickets'); return; }
  }

  if (!ch.audio_url || typeof ch.cover_url === 'undefined') {
    const { data } = await db.from('chapitres').select('audio_url, cover_url').eq('histoire_id', histoireId).eq('numero', chapNum).single();
    ch.audio_url = data && data.audio_url ? data.audio_url : null;
    ch.cover_url = data && data.cover_url ? data.cover_url : null;
  }

  if (!ch.audio_url) { alert("Ce chapitre n'a pas encore de fichier audio."); return; }

  const key = 'chapitres_lus_' + histoireId;
  const lus = JSON.parse(localStorage.getItem(key) || '[]');
  if (lus.indexOf(chapNum) === -1) { lus.push(chapNum); localStorage.setItem(key, JSON.stringify(lus)); }

  _renderPageAudio(b, ch, chapNum);
  go('p-audio');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      if (typeof initCommentaires === 'function') initCommentaires(histoireId, chapNum);
      // Lancer la lecture seulement si on vient d'un autoplay
      var audioEl = document.getElementById('audio-player-el');
      if (_audioAutoPlayNext && audioEl) {
        _audioAutoPlayNext = false;
        audioEl.play().then(function() {
          var btn = document.getElementById('audio-play-btn');
          if (btn) btn.textContent = '⏸';
          var disc = document.getElementById('audio-disc');
          if (disc) disc.classList.add('playing');
        }).catch(function() {});
      } else if (audioEl) {
        // S'assurer que l'audio ne joue pas
        audioEl.pause();
      }
      var comInput = document.getElementById('audio-com-input');
      if (comInput) comInput.addEventListener('input', function() {
        var count = document.getElementById('audio-com-char-count');
        if (count) count.textContent = comInput.value.length + ' / 1000';
      });
    });
  });
}

function _renderPageAudio(b, ch, chapNum) {
  const page = document.getElementById('p-audio');
  if (!page) return;

  const chapPrecedent = b.chapitres.slice().reverse().find(function(c) {
    return c.num < chapNum && (!c.datePublication || new Date(c.datePublication) <= new Date());
  });
  const chapSuivant = b.chapitres.find(function(c) {
    return c.num > chapNum && (!c.datePublication || new Date(c.datePublication) <= new Date());
  });
  const numDisp = (b.numerotation === 'romain' && typeof toRoman === 'function') ? toRoman(chapNum) : chapNum;
  const titrePropre = ch.titre && ch.titre !== 'Chapitre ' + chapNum ? ch.titre : '';

  const navPrev = chapPrecedent
    ? '<button class="btn" onclick="openAudio(\'' + b.id + '\',' + chapPrecedent.num + ')">← Chapitre précédent</button>'
    : '';
  const navNext = chapSuivant
    ? '<button class="btn btn-accent" onclick="openAudio(\'' + b.id + '\',' + chapSuivant.num + ')">Chapitre suivant →</button>'
    : '<div style="font-size:13px;color:var(--accent);padding:12px 0">Tu es à jour ! ✦</div>';

  var chapCover = ch.cover_url || b.cover || null;
  var coverHtml = chapCover
    ? '<img src="' + chapCover + '" style="width:100%;height:100%;object-fit:cover;">'
    : '<div style="width:100%;height:100%;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:80px">🎧</div>';

  page.innerHTML =
    '<div class="lecture-header">' +
      '<button class="btn" onclick="fermerAudio()">← Retour</button>' +
      '<div class="lecture-titre" style="font-size:13px;text-align:center;flex:1">' +
        b.title +
        '<span style="color:var(--text3);font-size:11px;display:block">' + b.author + '</span>' +
      '</div>' +
      '<div style="width:60px"></div>' +
    '</div>' +
    '<div class="page-scroll" style="display:flex;flex-direction:column;align-items:center;padding:32px 16px 80px;gap:24px">' +
    '<div style="width:100%;max-width:480px;display:flex;flex-direction:column;align-items:center;gap:24px">' +
      '<div id="audio-disc" class="audio-disc">' + coverHtml + '</div>' +
      '<div style="text-align:center">' +
        '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:6px">Épisode ' + numDisp + '</div>' +
        '<div style="font-family:\'Cormorant Garamond\',serif;font-size:22px;color:var(--text)">' + (titrePropre || ('Chapitre ' + numDisp)) + '</div>' +
      '</div>' +
      '<div class="audio-player" style="width:100%">' +
        '<audio id="audio-player-el" src="' + ch.audio_url + '" preload="metadata"></audio>' +
        '<div class="audio-progress-wrap" onclick="audioSeek(event)">' +
          '<div class="audio-progress-bg"><div class="audio-progress-fill" id="audio-progress-fill"></div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px">' +
          '<span id="audio-time-current" style="font-size:10px;color:var(--text3);flex-shrink:0">0:00</span>' +
          '<div class="audio-controls" style="flex:1;justify-content:center">' +
            '<button class="audio-btn" onclick="audioRewind()" title="-15s">⟨15</button>' +
            '<button class="audio-btn audio-btn-play" id="audio-play-btn" onclick="audioTogglePlay()">▶</button>' +
            '<button class="audio-btn" onclick="audioForward()" title="+15s">15⟩</button>' +
            '<select class="audio-speed-select" id="audio-speed" onchange="audioSetSpeed(this.value)">' +
              '<option value="0.75">0.75x</option>' +
              '<option value="1" selected>1x</option>' +
              '<option value="1.25">1.25x</option>' +
              '<option value="1.5">1.5x</option>' +
              '<option value="2">2x</option>' +
            '</select>' +
          '</div>' +
          '<span id="audio-time-total" style="font-size:10px;color:var(--text3);flex-shrink:0">0:00</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:center;margin-top:10px">' +
          '<button class="audio-btn audio-btn-auto" id="audio-auto-btn" onclick="toggleAutoPlay()" style="font-size:12px;width:auto;padding:4px 14px;border-radius:20px;gap:6px">⇄ Lecture automatique</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' + navPrev + navNext + '</div>' +
      '<div class="com-section" id="audio-com-section" style="width:100%;padding-bottom:40px">' +
        '<div class="com-section-title">✦ Commentaires</div>' +
        '<div id="audio-com-form-wrap" style="display:none">' +
          '<textarea id="audio-com-input" class="com-input" placeholder="Laisse un commentaire…" maxlength="1000" rows="3"></textarea>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">' +
            '<span id="audio-com-char-count" class="com-char-count">0 / 1000</span>' +
            '<div class="com-tags-wrap">' +
              '<label class="com-tag-label" id="audio-com-tag-spoiler-wrap">' +
                '<input type="checkbox" id="audio-com-tag-spoiler"> ⚠️ Spoiler' +
              '</label>' +
            '</div>' +
            '<button class="btn btn-accent com-submit-btn" onclick="soumettreCommentaire()">Publier ✦</button>' +
          '</div>' +
          '<div id="audio-com-error" class="com-error" style="display:none"></div>' +
        '</div>' +
        '<div id="audio-com-login-msg" class="com-login-msg" style="display:none">' +
          '<span>Connecte-toi pour laisser un commentaire</span>' +
          '<button class="btn btn-accent" style="font-size:12px;padding:6px 14px" onclick="go(\'p-connexion-modal\')">Se connecter</button>' +
        '</div>' +
        '<div id="audio-com-liste"></div>' +
        '<div id="audio-com-loading" class="com-loading">Chargement…</div>' +
        '<button id="audio-com-load-more" class="com-load-more" style="display:none" onclick="chargerPlusCommentaires()">Voir plus de commentaires</button>' +
      '</div>' +
    '</div></div>';

  _updateAutoPlayBtn();
  var audio = document.getElementById('audio-player-el');
  if (audio) {
    // Stocker les infos pour la lecture automatique
    _audioHistoireId = b.id;
    // Pour l'autoplay, ignorer le filtre datePublication
    var _chapSuivantAuto = b.chapitres.find(function(c) { return c.num > chapNum; });
    _audioChapSuivantNum = _chapSuivantAuto ? _chapSuivantAuto.num : null;
    audio.addEventListener('timeupdate', _audioUpdateProgress);
    audio.addEventListener('loadedmetadata', _audioUpdateDuration);
    audio.addEventListener('ended', function() {
      var btn = document.getElementById('audio-play-btn');
      if (btn) btn.textContent = '▶';
      var disc = document.getElementById('audio-disc');
      if (disc) disc.classList.remove('playing');
      // Lecture automatique
      if (localStorage.getItem('audio_autoplay') === 'true' && _audioChapSuivantNum) {
        _audioAutoPlayNext = true;
        setTimeout(function() { openAudio(_audioHistoireId, _audioChapSuivantNum); }, 1000);
      }
    });
  }
}


var _audioHistoireId = null;
var _ticketsRetourPage = null;

function retourDepuisTickets() {
  go(_ticketsRetourPage || 'p-histoire');
  _ticketsRetourPage = null;
}
var _audioChapSuivantNum = null;
var _audioAutoPlayNext = false;

function toggleAutoPlay() {
  var current = localStorage.getItem('audio_autoplay') === 'true';
  var newVal = !current;
  localStorage.setItem('audio_autoplay', String(newVal));
  _updateAutoPlayBtn();
}

function _updateAutoPlayBtn() {
  var btn = document.getElementById('audio-auto-btn');
  if (!btn) return;
  var active = localStorage.getItem('audio_autoplay') === 'true';
  // S'assurer que la classe est bien retirée si pas actif
  if (active) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
  btn.title = active ? 'Lecture automatique activée' : 'Lecture automatique désactivée';
}

function fermerAudio() {
  var audio = document.getElementById('audio-player-el');
  if (audio) { audio.pause(); audio.src = ''; }
  localStorage.removeItem('audio_autoplay');
  _audioAutoPlayNext = false;
  go('p-histoire');
}

function audioTogglePlay() {
  var audio = document.getElementById('audio-player-el');
  var btn = document.getElementById('audio-play-btn');
  var disc = document.getElementById('audio-disc');
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    if (btn) btn.textContent = '⏸';
    if (disc) disc.classList.add('playing');
  } else {
    audio.pause();
    if (btn) btn.textContent = '▶';
    if (disc) disc.classList.remove('playing');
  }
}

function audioRewind() {
  var audio = document.getElementById('audio-player-el');
  if (audio) audio.currentTime = Math.max(0, audio.currentTime - 15);
}

function audioForward() {
  var audio = document.getElementById('audio-player-el');
  if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
}

function audioSetSpeed(val) {
  var audio = document.getElementById('audio-player-el');
  if (audio) audio.playbackRate = parseFloat(val);
}

function audioSeek(e) {
  var audio = document.getElementById('audio-player-el');
  if (!audio || !audio.duration) return;
  var bar = e.currentTarget;
  var rect = bar.getBoundingClientRect();
  var ratio = (e.clientX - rect.left) / rect.width;
  audio.currentTime = ratio * audio.duration;
}

function _audioUpdateProgress() {
  var audio = document.getElementById('audio-player-el');
  var fill = document.getElementById('audio-progress-fill');
  var cur = document.getElementById('audio-time-current');
  if (!audio || !fill) return;
  var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  fill.style.width = pct + '%';
  if (cur) cur.textContent = _audioFormatTime(audio.currentTime);
}

function _audioUpdateDuration() {
  var audio = document.getElementById('audio-player-el');
  var tot = document.getElementById('audio-time-total');
  if (audio && tot) tot.textContent = _audioFormatTime(audio.duration);
}

function _audioFormatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}
