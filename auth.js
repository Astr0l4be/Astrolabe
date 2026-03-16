/* INSCRIPTION */
function isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);}

async function handleInscription1(){
  const mdp=document.getElementById('insc-mdp').value;
  const mdp2=document.getElementById('insc-mdp2').value;
  const pseudo=document.getElementById('insc-pseudo').value.trim();
  const errMdp=document.getElementById('mdp-error');
  const errLen=document.getElementById('mdp-length-error');
  const errPseudo=document.getElementById('pseudo-error');
  errMdp.classList.remove('show');errLen.classList.remove('show');errPseudo.classList.remove('show');
  if(mdp.length<6){errLen.classList.add('show');return;}
  if(mdp!==mdp2){errMdp.classList.add('show');return;}
  if(pseudo){
    const {data:existing}=await db.from('profils').select('id').eq('pseudo',pseudo).limit(1);
    if(existing&&existing.length>0){errPseudo.classList.add('show');return;}
    compte.pseudo=pseudo;
  }
  let age=16;
  if(isMobile){
    const jour=parseInt(document.getElementById('dob-jour').value);
    const mois=parseInt(document.getElementById('dob-mois').value);
    const annee=parseInt(document.getElementById('dob-annee').value);
    const today=new Date();
    age=today.getFullYear()-annee;
    if(today.getMonth()+1<mois||(today.getMonth()+1===mois&&today.getDate()<jour))age--;
  } else {
    const val=document.getElementById('dob-date').value;
    if(val){const dob=new Date(val);const today=new Date();age=today.getFullYear()-dob.getFullYear();if(today.getMonth()<dob.getMonth()||(today.getMonth()===dob.getMonth()&&today.getDate()<dob.getDate()))age--;}
  }
  compte.age=age;
  go(age<18?'p-inscription2':'p-inscription3');
}

async function finishInscription(){
  const email=document.getElementById('insc-mail').value.trim();
  const mdp=document.getElementById('insc-mdp').value;
  const errEmail=document.getElementById('email-error');
  if(!isValidEmail(email)){errEmail.classList.add('show');go('p-inscription1');return;}
  const pseudo=document.getElementById('insc-pseudo').value.trim()||'Astrolectrice';
  const adulte=compte.age>=18&&(document.getElementById('adult3')?.checked||false);
  const twrHistoire=document.getElementById('twr3-histoire')?.checked??document.getElementById('twr2-histoire')?.checked??true;
  const twrChapitre=document.getElementById('twr3-chapitre')?.checked??document.getElementById('twr2-chapitre')?.checked??false;
  const finishBtn=document.querySelector('#p-inscription5 .choice-card.featured');
  if(finishBtn)finishBtn.style.opacity='0.5';
  try{
    const {data,error}=await db.auth.signUp({email,password:mdp,options:{data:{pseudo}}});
    if(error){
      if(error.message.includes('already registered')||error.message.includes('already been registered')){
        errEmail.classList.add('show');go('p-inscription1');
      } else {alert('Oups ! '+error.message);}
      if(finishBtn)finishBtn.style.opacity='1';return;
    }
    const userId=data.user?.id;
    if(!userId)throw new Error('Erreur création compte');
    const dobVal=isMobile
      ?`${document.getElementById('dob-annee').value}-${String(document.getElementById('dob-mois').value).padStart(2,'0')}-${String(document.getElementById('dob-jour').value).padStart(2,'0')}`
      :(document.getElementById('dob-date').value||null);
    const {error:pe}=await db.from('profils').insert({id:userId,pseudo,email,tickets:20,adulte,trigger_warnings_histoire:twrHistoire,trigger_warnings_chapitre:twrChapitre,date_naissance:dobVal||null});
    if(pe)throw pe;
    compte.loggedIn=true;compte.userId=userId;compte.pseudo=pseudo;compte.tickets=20;
    compte.adulte=adulte;compte.twrHistoire=twrHistoire;compte.twrChapitre=twrChapitre;
    document.getElementById('compte-name').textContent=pseudo;
    updateTicketsDisplay();syncCompteToggles();updateTopbar();
    document.getElementById('bienvenue-pseudo').textContent=pseudo;
    document.getElementById('bienvenue-popup').classList.add('open');
  }catch(e){
    alert('Oups ! '+e.message);
    if(finishBtn)finishBtn.style.opacity='1';
  }
}

/* DATE NAISSANCE */
const isMobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
if(isMobile){
  document.querySelector('.dob-mobile').style.display='flex';
  const jourSel=document.getElementById('dob-jour');
  const moisSel=document.getElementById('dob-mois');
  const anneeSel=document.getElementById('dob-annee');
  const moisNoms=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  for(let i=1;i<=31;i++){const o=document.createElement('option');o.value=i;o.textContent=i;if(i===1)o.selected=true;jourSel.appendChild(o);}
  moisNoms.forEach((m,i)=>{const o=document.createElement('option');o.value=i+1;o.textContent=m;if(i===0)o.selected=true;moisSel.appendChild(o);});
  const now2=new Date();const curYear=now2.getFullYear();
  for(let y=curYear;y>=curYear-100;y--){const o=document.createElement('option');o.value=y;o.textContent=y;if(y===curYear-18)o.selected=true;anneeSel.appendChild(o);}
} else {
  const dobDate=document.getElementById('dob-date');
  dobDate.style.display='block';
  const now2=new Date();
  const def=new Date(now2.getFullYear()-18,now2.getMonth(),now2.getDate());
  dobDate.value=def.toISOString().split('T')[0];
  dobDate.max=now2.toISOString().split('T')[0];
  dobDate.min=new Date(now2.getFullYear()-100,now2.getMonth(),now2.getDate()).toISOString().split('T')[0];
}

/* CONNEXION */
async function handleConnexion(){
  const email=document.getElementById('connexion-email').value.trim();
  const mdp=document.getElementById('connexion-mdp').value;
  const errEl=document.getElementById('connexion-error');
  const {data,error}=await db.auth.signInWithPassword({email,password:mdp});
  if(error){if(errEl){errEl.textContent='E-mail ou mot de passe incorrect.';errEl.style.display='block';}return;}
  const {data:profil}=await db.from('profils').select('*').eq('id',data.user.id).single();
  if(profil){
    compte.loggedIn=true;compte.userId=data.user.id;
    compte.pseudo=profil.pseudo||'Astrolectrice';compte.tickets=profil.tickets||0;
    compte.adulte=profil.adulte||false;
    compte.twrHistoire=profil.trigger_warnings_histoire!==false;
    compte.twrChapitre=profil.trigger_warnings_chapitre===true;
    compte.estAdulteAge=calcAge(profil.date_naissance)>=18;
    document.getElementById('compte-name').textContent=compte.pseudo;
    updateTicketsDisplay();syncCompteToggles();renderGrid('book-grid',BOOKS);
  }
  closeM('p-connexion-modal');updateTopbar();go('p-main');
}

async function deconnexion(){
  await db.auth.signOut();
  compte.loggedIn=false;compte.userId=null;compte.pseudo='';compte.tickets=0;
  updateTicketsDisplay();updateTopbar();go('p-main');
}

async function savePrefs(){
  if(!compte.userId)return;
  await db.from('profils').update({adulte:compte.adulte,trigger_warnings_histoire:compte.twrHistoire,trigger_warnings_chapitre:compte.twrChapitre}).eq('id',compte.userId);
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
}

function updateTopbar(){
  const loggedIn=compte.loggedIn;
  document.getElementById('btn-inscription').style.display=loggedIn?'none':'';
  document.getElementById('btn-connexion').style.display=loggedIn?'none':'';
  document.getElementById('btn-deconnexion').style.display=loggedIn?'':'none';
  document.getElementById('btn-moncompte-top').style.display=loggedIn?'flex':'none';
  if(loggedIn){
    const av=document.getElementById('topbar-avatar');
    if(av)av.textContent=compte.avatar||'☽';
    const av2=document.getElementById('topbar-avatar2');
    if(av2)av2.textContent=compte.avatar||'☽';
  }
}

/* AVATAR */
let _tempAvatar=null;let _savedAvatar='☽';
function openAvatarPopup(){_tempAvatar=compte.avatar||'☽';openModal('avatar-popup');}
function setAvatar(symbol){
  _tempAvatar=symbol;
  document.getElementById('compte-avatar').textContent=symbol;
  const topbarAv=document.getElementById('topbar-avatar');if(topbarAv)topbarAv.textContent=symbol;
  ['av-lune','av-etoile','av-soleil'].forEach(id=>{document.getElementById(id).style.borderColor='rgba(180,190,255,.2)';});
  const map={'☽':'av-lune','✦':'av-etoile','☀':'av-soleil'};
  if(map[symbol])document.getElementById(map[symbol]).style.borderColor='var(--accent)';
}
function cancelAvatar(){
  document.getElementById('compte-avatar').textContent=_savedAvatar;
  const topbarAv=document.getElementById('topbar-avatar');if(topbarAv)topbarAv.textContent=_savedAvatar;
  compte.avatar=_savedAvatar;closeM('avatar-popup');
}
function confirmAvatar(){
  _savedAvatar=_tempAvatar||compte.avatar;compte.avatar=_savedAvatar;
  document.getElementById('compte-avatar').textContent=_savedAvatar;
  const topbarAv=document.getElementById('topbar-avatar');if(topbarAv)topbarAv.textContent=_savedAvatar;
  const topbarAv2=document.getElementById('topbar-avatar2');if(topbarAv2)topbarAv2.textContent=_savedAvatar;
  closeM('avatar-popup');
}

/* TOGGLE PASSWORD */
function togglePwd(inputId,btnId){
  const inp=document.getElementById(inputId);const btn=document.getElementById(btnId);
  if(inp.type==='password'){inp.type='text';btn.style.color='#fff';btn.style.fontWeight='700';}
  else{inp.type='password';btn.style.color='var(--accent)';btn.style.fontWeight='400';}
}

/* SUPPRESSION */
async function supprimerCompteDefinitif(){
  try{
    if(compte.userId){
      await db.from('profils').update({a_supprimer_le:new Date(Date.now()+30*24*60*60*1000).toISOString()}).eq('id',compte.userId);
    }
    await db.auth.signOut();
    compte.loggedIn=false;compte.userId=null;compte.pseudo='';compte.tickets=0;
    updateTopbar();updateTicketsDisplay();go('p-main');
  }catch(e){
    await db.auth.signOut();compte.loggedIn=false;compte.userId=null;go('p-main');
  }
}

/* CALCUL AGE */
function calcAge(dateNaissance){
  if(!dateNaissance)return 0;
  const dob=new Date(dateNaissance);
  const today=new Date();
  let age=today.getFullYear()-dob.getFullYear();
  if(today.getMonth()<dob.getMonth()||(today.getMonth()===dob.getMonth()&&today.getDate()<dob.getDate()))age--;
  return age;
}

/* ANNIVERSAIRE 18 ANS */
async function confirmerAdulte(choix){
  document.getElementById('anniversaire-popup').classList.remove('open');
  // Mémoriser que le popup a été vu pour ne plus le réafficher
  if(compte.userId) localStorage.setItem('adulte_popup_vu_'+compte.userId,'1');
  // Mettre à jour le toggle et Supabase selon le choix (modifiable depuis Mon Compte ensuite)
  compte.adulte=choix;
  syncCompteToggles();
  renderGrid('book-grid',BOOKS);
  if(compte.userId) await db.from('profils').update({adulte:choix}).eq('id',compte.userId);
}

/* SESSION */
async function checkSession(){
  const {data:{session}}=await db.auth.getSession();
  if(session){
    const {data:profil}=await db.from('profils').select('*').eq('id',session.user.id).single();
    if(profil){
      compte.loggedIn=true;compte.userId=session.user.id;
      compte.pseudo=profil.pseudo||'Astrolectrice';compte.tickets=profil.tickets||0;
      compte.adulte=profil.adulte||false;
      compte.twrHistoire=profil.trigger_warnings_histoire!==false;
      compte.twrChapitre=profil.trigger_warnings_chapitre===true;
      compte.estAdulteAge=calcAge(profil.date_naissance)>=18;
      document.getElementById('compte-name').textContent=compte.pseudo;
      updateTicketsDisplay();syncCompteToggles();renderGrid('book-grid',BOOKS);updateTopbar();
      // Vérifier si l'utilisateur vient d'avoir 18 ans et n'a pas encore vu le popup
      if(profil.date_naissance&&!profil.adulte&&compte.estAdulteAge&&!localStorage.getItem('adulte_popup_vu_'+session.user.id)){
          setTimeout(()=>document.getElementById('anniversaire-popup').classList.add('open'),4000);
      }
    }
  }
}

checkSession().catch(()=>{}).finally(()=>{
  setTimeout(()=>{
    const lastPage=sessionStorage.getItem('lastPage');
    if(lastPage&&lastPage!=='p-splash'&&document.getElementById(lastPage)){
      go(lastPage);
    } else {
      go('p-main');
    }
    // Charger les histoires après que la page soit visible
    loadHistoires().catch(()=>{});
  },3200);
});
