/* ══════════════════════════════════════════════════════
   GESTION DES RÔLES
   ══════════════════════════════════════════════════════ */

async function rechercherCompteRole() {
  const email = document.getElementById('role-email-input').value.trim();
  const resultat = document.getElementById('role-resultat');
  const introuvable = document.getElementById('role-introuvable');
  resultat.style.display = 'none';
  introuvable.style.display = 'none';
  if (!email) return;
  const { data, error } = await db.from('profils').select('id, pseudo, role, email').eq('email', email).single();
  if (error || !data) { introuvable.style.display = 'block'; return; }
  document.getElementById('role-res-pseudo').textContent = data.pseudo || '(sans pseudo)';
  document.getElementById('role-res-email').textContent = email;
  document.getElementById('role-user-id').value = data.id;
  const badge = document.getElementById('role-res-badge');
  const roleActuel = data.role || 'lectrice';
  const couleurs = { lectrice: '#9aa2c8', autrice: '#c8a96e', admin: '#c084fc' };
  badge.textContent = roleActuel;
  badge.style.color = couleurs[roleActuel] || '#9aa2c8';
  badge.style.background = 'var(--glass)';
  badge.style.border = '1px solid ' + (couleurs[roleActuel] || '#9aa2c8');
  badge.style.borderRadius = '20px';
  const radio = document.querySelector(`input[name="role-choix"][value="${roleActuel}"]`);
  if (radio) radio.checked = true;
  await _peuplerSelectAutrice();
  const selectWrap = document.getElementById('role-autrice-select-wrap');
  if (selectWrap) selectWrap.style.display = roleActuel === 'autrice' ? 'block' : 'none';
  if (roleActuel === 'autrice') {
    const { data: autrice } = await db.from('auteurs').select('id, pseudo').eq('user_id', data.id).single();
    if (autrice) {
      document.getElementById('role-autrice-select').value = autrice.id;
      document.getElementById('role-autrice-selected-txt').textContent = autrice.pseudo;
    }
  }
  resultat.style.display = 'block';
}

async function sauvegarderRole() {
  const userId = document.getElementById('role-user-id').value;
  const role = document.querySelector('input[name="role-choix"]:checked')?.value;
  if (!userId || !role) return;
  if (role === 'autrice') {
    const autriceId = document.getElementById('role-autrice-select')?.value;
    if (!autriceId) { showAlert('roles', 'Merci de choisir un·e auteur·ice à associer.', 'error'); return; }
    await db.from('auteurs').update({ user_id: userId }).eq('id', autriceId);
    await db.from('auteurs').update({ user_id: null }).eq('user_id', userId).neq('id', autriceId);
  } else {
    await db.from('auteurs').update({ user_id: null }).eq('user_id', userId);
  }
  const btn = document.querySelector('#role-resultat .btn-accent');
  btn.textContent = 'Sauvegarde…'; btn.disabled = true;
  const { error } = await db.from('profils').update({ role }).eq('id', userId);
  btn.textContent = '✦ Sauvegarder le rôle'; btn.disabled = false;
  if (error) { showAlert('roles', 'Erreur : ' + error.message, 'error'); return; }
  showAlert('roles', 'Rôle mis à jour avec succès ✦');
  document.getElementById('role-resultat').style.display = 'none';
  document.getElementById('role-autrice-select-wrap').style.display = 'none';
  document.getElementById('role-email-input').value = '';
  loadRolesListe();
}

async function _peuplerSelectAutrice() {
  const dropdown = document.getElementById('role-autrice-dropdown');
  if (!dropdown) return;
  const { data } = await db.from('auteurs').select('id, pseudo').order('pseudo');
  dropdown.innerHTML = '<div onclick="choisirAutrice(\'\',\'— Choisir un·e auteur·ice —\')" style="padding:10px 12px;font-size:13px;color:var(--text3);cursor:pointer;font-family:\'Jost\',sans-serif;" onmouseover="this.style.background=\'rgba(126,159,212,.1)\'" onmouseout="this.style.background=\'\'" >— Choisir un·e auteur·ice —</div>';
  (data || []).forEach(a => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:10px 12px;font-size:13px;color:var(--text);cursor:pointer;font-family:\'Jost\',sans-serif;border-top:1px solid rgba(180,190,230,.08)';
    div.textContent = a.pseudo;
    div.onmouseover = () => div.style.background = 'rgba(126,159,212,.1)';
    div.onmouseout = () => div.style.background = '';
    div.onclick = () => choisirAutrice(a.id, a.pseudo);
    dropdown.appendChild(div);
  });
}

function toggleAutriceDropdown() {
  const dd = document.getElementById('role-autrice-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function choisirAutrice(id, pseudo) {
  document.getElementById('role-autrice-select').value = id;
  document.getElementById('role-autrice-selected-txt').textContent = pseudo;
  document.getElementById('role-autrice-dropdown').style.display = 'none';
}

function modifierRole(email) {
  document.getElementById('role-email-input').value = email;
  document.getElementById('role-resultat').style.display = 'none';
  document.getElementById('role-introuvable').style.display = 'none';
  rechercherCompteRole();
  document.getElementById('role-email-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function loadRolesListe() {
  const liste = document.getElementById('roles-liste');
  if (!liste) return;
  liste.innerHTML = '<div class="loading"><span class="spinner"></span>Chargement…</div>';
  const { data, error } = await db.from('profils').select('pseudo, email, role').in('role', ['autrice', 'admin']).order('role');
  if (error || !data || !data.length) {
    liste.innerHTML = '<p style="font-size:12px;color:var(--text3);text-align:center;padding:16px">Aucun rôle spécial attribué pour le moment.</p>';
    return;
  }
  const couleurs = { autrice: '#c8a96e', admin: '#c084fc' };
  liste.innerHTML = data.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(180,190,255,.08)">
      <div style="font-size:18px">☽</div>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text);font-weight:600">${p.pseudo || '—'}</div>
        <div style="font-size:11px;color:var(--text3)">${p.email || ''}</div>
      </div>
      <span style="font-size:10px;font-weight:600;padding:2px 10px;border-radius:20px;color:${couleurs[p.role]};background:var(--glass);border:1px solid ${couleurs[p.role]}">${p.role}</span>
      <button onclick="modifierRole('${p.email}')" style="background:none;border:1px solid rgba(180,190,255,.2);border-radius:8px;padding:4px 10px;font-size:10px;color:var(--text2);cursor:pointer;font-family:'Jost',sans-serif">Modifier</button>
    </div>
  `).join('');
}


const SUPA_URL='https://msownknywszovjnfekde.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zb3dua255d3N6b3ZqbmZla2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDIxNDUsImV4cCI6MjA4ODk3ODE0NX0.kekcMQQowhhIazwYDhAa4OYWCnHp4-4I_g9RGkxTjy8';
const ADMIN_EMAIL='astrolabe.support@gmail.com';
const db=window.supabase.createClient(SUPA_URL,SUPA_KEY);

let currentUser=null;
let tags=[];
let tws=[];
let histoires=[];
let auteurs=[];

/* AUTH */
async function login(){
  const email=document.getElementById('auth-email').value.trim();
  const mdp=document.getElementById('auth-mdp').value;
  const errEl=document.getElementById('auth-error');
  errEl.classList.remove('show');
  const {data,error}=await db.auth.signInWithPassword({email,password:mdp});
  if(error){errEl.textContent='E-mail ou mot de passe incorrect.';errEl.classList.add('show');return;}
  const {data:profil}=await db.from('profils').select('role').eq('id',data.user.id).single();
  if(!profil || profil.role!=='admin'){
    await db.auth.signOut();
    errEl.textContent='Accès réservé à l\'administratrice.';errEl.classList.add('show');return;
  }
  currentUser=data.user;
  showAdmin();
}

async function logout(){
  await db.auth.signOut();
  document.getElementById('admin-app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
}

async function checkSession(){
  const {data:{session}}=await db.auth.getSession();
  if(session){
    const {data:profil}=await db.from('profils').select('role').eq('id',session.user.id).single();
    if(profil && profil.role==='admin'){
      currentUser=session.user;
      showAdmin();
    }
  }
}

function showAdmin(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('admin-app').style.display='block';
  document.getElementById('admin-user-label').textContent=currentUser.email;
  loadHistoires();
  loadAuteursSelect();
  loadTagsSuggestions();
  loadTWSuggestions();
}

/* TABS */
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('panel-'+tab).classList.add('active');
  // Toujours fermer les formulaires d'édition histoire et auteur seulement
  const el1=document.getElementById('edit-histoire-form');if(el1)el1.style.display='none';
  const el2=document.getElementById('edit-auteur-form');if(el2)el2.style.display='none';
  const dc=document.getElementById('detail-card');if(dc)dc.style.display='block';
  const ac=document.getElementById('auteur-detail-card');if(ac)ac.style.display='block';
  if(tab==='histoires'){
    document.getElementById('histoires-card').style.display='block';
    document.getElementById('histoire-detail').style.display='none';
    _retourAuteurId=null;
    renderHistoiresList();
  }
  if(tab==='auteurs'){
    document.getElementById('auteurs-card').style.display='block';
    document.getElementById('auteur-detail').style.display='none';
    _retourAuteurId=null;
    loadAuteurs();
  }
  if(tab==='tags'){loadTagsGestion();loadTWsGestion();}
  if(tab==='bannieres'){loadBannieresAdmin();loadHistoiresSelectBan();initBanPages();}
  if(tab==='roles'){loadRolesListe();}
  if(tab==='bd-nouvelle'){loadBDHistoiresSelect();loadBDTagsSuggestions();loadEpTwSuggestions('ep');}
  if(tab==='nouveau-webtoon'){loadWTHistoireSelect();loadWTAuteursSelect();loadWTTagsSuggestions();}
  if(tab==='nouveau-audio'){loadAudioSelect();loadAudioPublies();loadAudioAuteursSelect();_audioTags=[];_audioTws=[];renderAudioTags();renderAudioTws();setAudioAdulte(false);setAudioStatut('en-cours');loadAudioTagsSuggestions();loadAudioTWSuggestions();loadAudioEpTwSuggestions();}

  if(tab==='chapitre'){
    chTws=[];renderChTws();loadHistoiresSelect();initBlocs('','ch-blocs');loadChTwSuggestions();
    document.getElementById('edit-chapitre-form').style.display='none';
    document.getElementById('chapitres-existants').style.display='none';
  }
  if(tab==='nouvelle'){loadAuteursSelect();loadTagsSuggestions();loadTWSuggestions();document.getElementById('n-options-adulte').style.display='none';document.getElementById('n-options-non-adulte').style.display='block';}
  if(tab==='nouvel-auteur'){
    document.getElementById('a-pseudo').value='';
    document.getElementById('a-nom').value='';
    document.getElementById('a-bio').value='';
  }
}

/* ALERTS */
function showAlert(panelId,msg,type='success'){
  const el=document.getElementById('alert-'+panelId);
  el.textContent=msg;el.className='alert alert-'+type+' show';
  setTimeout(()=>el.classList.remove('show'),4000);
}

/* IMAGE PREVIEW */
function previewImg(input,previewId,zoneId){
  if(!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=document.getElementById(previewId);
    img.src=e.target.result;img.style.display='block';
    // Déterminer le type selon le previewId pour trouver le bon bouton "Retirer"
    let type='banner';
    if(previewId==='eaudio-chap-cover-preview')type='eaudio-chap-cover';
    else if(previewId==='eaudio-cover-preview')type='eaudio-cover';
    else if(previewId==='eaudio-banner-preview')type='eaudio-banner';
    else if(previewId==='audio-ep-cover-preview')type='audio-ep-cover';
    else if(previewId==='audio-cover-preview')type='audio-cover';
    else if(previewId==='audio-banner-preview')type='audio-banner';
    else if(previewId.includes('cover'))type='cover';
    else if(previewId==='auteur-photo-preview')type='auteur-photo';
    else if(previewId==='edit-a-photo-preview')type='edit-a-photo';
    const removeBtn=document.getElementById(type+'-remove');
    if(removeBtn)removeBtn.style.display='inline-block';
  };
  reader.readAsDataURL(input.files[0]);
}

function removeImg(type){
  document.getElementById(type+'-preview').style.display='none';
  document.getElementById(type+'-preview').src='';
  document.getElementById(type+'-remove').style.display='none';
  const input=document.getElementById(type+'-input');
  input.value='';
}

/* ÉDITEUR PAR BLOCS — multi-containers */
const _blocsMap={};

function getBlocsForContainer(cid){
  if(!_blocsMap[cid])_blocsMap[cid]={blocs:[],counter:0};
  return _blocsMap[cid];
}

function initBlocs(contenuExistant,containerId){
  const cid=containerId||'ch-blocs';
  _blocsMap[cid]={blocs:[],counter:0};
  const state=_blocsMap[cid];
  if(contenuExistant){
    const parts=contenuExistant.split(/(<pov>[^<]*<\/pov>|<img-bloc>[^<]*<\/img-bloc>)/g);
    parts.forEach(p=>{
      if(p.startsWith('<pov>')){const nom=p.replace(/<\/?pov>/g,'').trim();if(nom)state.blocs.push({type:'pov',id:state.counter++,contenu:nom});}
      else if(p.startsWith('<img-bloc>')){const url=p.replace(/<\/?img-bloc>/g,'').trim();if(url)state.blocs.push({type:'image',id:state.counter++,contenu:url});}
      else if(p.trim())state.blocs.push({type:'texte',id:state.counter++,contenu:p.trim()});
    });
  }
  if(!state.blocs.length)state.blocs.push({type:'texte',id:state.counter++,contenu:''});
  renderBlocs(cid);
}

function _wcId(cid){return cid==='ch-blocs'?'ch-wordcount':cid==='ch-soft-blocs'?'ch-soft-wordcount':cid==='edit-ch-blocs'?'edit-chap-wordcount':'edit-chap-soft-wordcount';}

function renderBlocs(cid){
  const container=document.getElementById(cid);if(!container)return;
  const state=getBlocsForContainer(cid);
  container.innerHTML='';
  state.blocs.forEach((bloc,i)=>{
    const div=document.createElement('div');
    div.className='bloc-wrap';
    if(bloc.type==='pov'){
      div.innerHTML=`<div class="bloc-header"><span class="bloc-type pov">✦ POV</span><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},-1)" ${i===0?'disabled style="opacity:.3"':''}>▲</button><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},1)" ${i===state.blocs.length-1?'disabled style="opacity:.3"':''}>▼</button><button class="tb-btn" onclick="supprimerBloc('${cid}',${i})" style="color:var(--danger)">✕</button></div><input class="bloc-pov-input" type="text" placeholder="Nom du personnage…" value="${bloc.contenu.replace(/"/g,'&quot;')}" oninput="updateBlocContenu('${cid}',${i},this.value)" data-bloc-id="${bloc.id}" data-bloc-container="${cid}">`;
    } else if(bloc.type==='image'){
      div.innerHTML=`<div class="bloc-header"><span class="bloc-type" style="color:var(--accent)">🖼 Image</span><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},-1)" ${i===0?'disabled style="opacity:.3"':''}>▲</button><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},1)" ${i===state.blocs.length-1?'disabled style="opacity:.3"':''}>▼</button><button class="tb-btn" onclick="supprimerBloc('${cid}',${i})" style="color:var(--danger)">✕</button></div><div style="padding:10px 14px">${bloc.contenu?`<div style="position:relative"><img src="${bloc.contenu}" style="width:100%;border-radius:6px;display:block"><button class="btn btn-sm btn-danger" onclick="retirerImageBloc('${cid}',${i})" style="position:absolute;top:6px;right:6px;opacity:.8">✕ Retirer</button></div>`:`<div class="img-upload" style="margin:0" id="img-upload-bloc-${cid}-${bloc.id}"><input type="file" accept="image/*" onchange="uploadImageBloc('${cid}',${i},${bloc.id},this)"><div class="img-upload-text">📎 Cliquer ou glisser une image</div></div>`}</div>`;
    } else {
      div.innerHTML=`<div class="bloc-header"><span class="bloc-type">Texte</span><div class="editor-toolbar" style="background:none;padding:0;border:none"><button type="button" class="tb-btn" onclick="fmtBloc('${cid}',${i},'bold')"><b>G</b></button><button type="button" class="tb-btn" onclick="fmtBloc('${cid}',${i},'italic')"><i>I</i></button><div class="tb-sep"></div><button type="button" class="tb-btn" onclick="alignBloc('${cid}',${i},'left')">⬤◁</button><button type="button" class="tb-btn" onclick="alignBloc('${cid}',${i},'center')">◁⬤▷</button><button type="button" class="tb-btn" onclick="alignBloc('${cid}',${i},'right')">▷⬤</button></div><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},-1)" ${i===0?'disabled style="opacity:.3"':''}>▲</button><button class="tb-btn" onclick="deplacerBloc('${cid}',${i},1)" ${i===state.blocs.length-1?'disabled style="opacity:.3"':''}>▼</button><button class="tb-btn" onclick="supprimerBloc('${cid}',${i})" style="color:var(--danger)">✕</button></div><textarea class="bloc-textarea" oninput="updateBlocContenu('${cid}',${i},this.value);majWordcount('${cid}')" placeholder="Texte du chapitre…" data-bloc-id="${bloc.id}" data-bloc-container="${cid}">${bloc.contenu}</textarea>`;
    }
    container.appendChild(div);
  });
  majWordcount(cid);
}

function updateBlocContenu(cid,idx,val){const s=getBlocsForContainer(cid);if(s.blocs[idx])s.blocs[idx].contenu=val;}

function ajouterBlocTexte(cid){
  const id=cid||'ch-blocs';const s=getBlocsForContainer(id);
  s.blocs.push({type:'texte',id:s.counter++,contenu:''});renderBlocs(id);
  setTimeout(()=>{const t=document.querySelectorAll(`#${id} .bloc-textarea`);if(t.length)t[t.length-1].focus();},50);
}
function ajouterBlocPOV(cid){
  const id=cid||'ch-blocs';const s=getBlocsForContainer(id);
  s.blocs.push({type:'pov',id:s.counter++,contenu:''});renderBlocs(id);
  setTimeout(()=>{const t=document.querySelectorAll(`#${id} .bloc-pov-input`);if(t.length)t[t.length-1].focus();},50);
}
function ajouterBlocImage(cid){
  const id=cid||'ch-blocs';const s=getBlocsForContainer(id);
  s.blocs.push({type:'image',id:s.counter++,contenu:''});renderBlocs(id);
}
async function uploadImageBloc(cid,idx,blocId,input){
  if(!input.files[0])return;
  const zone=document.getElementById(`img-upload-bloc-${cid}-${blocId}`);
  if(zone)zone.innerHTML='<div class="img-upload-text"><span class="spinner"></span>Upload…</div>';
  try{const url=await uploadImage(input.files[0],'chapitres');const s=getBlocsForContainer(cid);if(s.blocs[idx])s.blocs[idx].contenu=url;renderBlocs(cid);}
  catch(e){alert('Erreur upload : '+e.message);renderBlocs(cid);}
}
function retirerImageBloc(cid,idx){const s=getBlocsForContainer(cid);if(s.blocs[idx])s.blocs[idx].contenu='';renderBlocs(cid);}
function deplacerBloc(cid,idx,dir){
  const s=getBlocsForContainer(cid);
  document.querySelectorAll(`[data-bloc-container="${cid}"]`).forEach(el=>{const b=s.blocs.find(x=>x.id===parseInt(el.dataset.blocId));if(b&&b.type!=='image')b.contenu=el.value||b.contenu;});
  const swap=idx+dir;if(swap<0||swap>=s.blocs.length)return;
  [s.blocs[idx],s.blocs[swap]]=[s.blocs[swap],s.blocs[idx]];renderBlocs(cid);
}
function supprimerBloc(cid,idx){const s=getBlocsForContainer(cid);if(s.blocs.length<=1)return;s.blocs.splice(idx,1);renderBlocs(cid);}
function fmtBloc(cid,idx,type){
  const s=getBlocsForContainer(cid);
  const el=document.querySelector(`[data-bloc-container="${cid}"][data-bloc-id="${s.blocs[idx].id}"]`);if(!el)return;
  const start=(_savedSel.id===el.id)?_savedSel.start:el.selectionStart;
  const end=(_savedSel.id===el.id)?_savedSel.end:el.selectionEnd;
  const sel=el.value.substring(start,end);if(!sel)return;
  const tag=type==='bold'?'strong':'em';const wrapped=`<${tag}>${sel}</${tag}>`;
  el.value=el.value.substring(0,start)+wrapped+el.value.substring(end);
  s.blocs[idx].contenu=el.value;el.focus();el.setSelectionRange(start+wrapped.length,start+wrapped.length);
}
function alignBloc(cid,idx,direction){
  const s=getBlocsForContainer(cid);
  const el=document.querySelector(`[data-bloc-container="${cid}"][data-bloc-id="${s.blocs[idx].id}"]`);if(!el)return;
  const start=(_savedSel.id===el.id)?_savedSel.start:el.selectionStart;
  const end=(_savedSel.id===el.id)?_savedSel.end:el.selectionEnd;
  const sel=el.value.substring(start,end);if(!sel)return;
  const clean=sel.replace(/<div[^>]*style="[^"]*text-align[^"]*"[^>]*>([\s\S]*?)<\/div>/g,'$1').trim();
  const wrapped=direction==='left'?clean:`<div style="text-align:${direction}">${clean}</div>`;
  el.value=el.value.substring(0,start)+wrapped+el.value.substring(end);
  s.blocs[idx].contenu=el.value;el.focus();el.setSelectionRange(start+wrapped.length,start+wrapped.length);
}
function majWordcount(cid){
  const s=getBlocsForContainer(cid);
  const total=s.blocs.filter(b=>b.type==='texte').reduce((acc,b)=>acc+(b.contenu?b.contenu.trim().split(/\s+/).filter(w=>w).length:0),0);
  const el=document.getElementById(_wcId(cid));if(el)el.textContent=total.toLocaleString('fr')+' mots';
}
function compileBlocsToContenu(cid){
  const id=cid||'ch-blocs';const s=getBlocsForContainer(id);
  document.querySelectorAll(`[data-bloc-container="${id}"]`).forEach(el=>{const b=s.blocs.find(x=>x.id===parseInt(el.dataset.blocId));if(b&&b.type!=='image')b.contenu=el.value||b.contenu;});
  return s.blocs.map(b=>{
    if(b.type==='pov')return`<pov>${b.contenu}</pov>`;
    if(b.type==='image')return b.contenu?`<img-bloc>${b.contenu}</img-bloc>`:'';
    return b.contenu;
  }).filter(Boolean).join('\n\n');
}


// Sauvegarde de la sélection pour les inputs (perdent le focus au clic bouton)
let _savedSel={id:null,start:0,end:0};
document.addEventListener('mousedown',e=>{
  if(e.target.classList.contains('tb-btn')){
    const active=document.activeElement;
    if(active&&(active.tagName==='INPUT'||active.tagName==='TEXTAREA')){
      _savedSel={id:active.id,start:active.selectionStart,end:active.selectionEnd};
    }
  }
});

function fmt(id,type){
  const ta=document.getElementById(id);
  // Utiliser la sélection sauvegardée si l'id correspond
  const start=(_savedSel.id===id)?_savedSel.start:ta.selectionStart;
  const end=(_savedSel.id===id)?_savedSel.end:ta.selectionEnd;
  const sel=ta.value.substring(start,end);
  if(!sel)return;
  const tag=type==='bold'?'strong':'em';
  const wrapped=`<${tag}>${sel}</${tag}>`;
  ta.value=ta.value.substring(0,start)+wrapped+ta.value.substring(end);
  ta.focus();
  ta.setSelectionRange(start+wrapped.length,start+wrapped.length);
  _savedSel={id:null,start:0,end:0};
}

function align(id,direction){
  const ta=document.getElementById(id);
  const start=(_savedSel.id===id)?_savedSel.start:ta.selectionStart;
  const end=(_savedSel.id===id)?_savedSel.end:ta.selectionEnd;
  const sel=ta.value.substring(start,end);
  if(!sel)return;
  const clean=sel.replace(/<div[^>]*style="[^"]*text-align[^"]*"[^>]*>([\s\S]*?)<\/div>/g,'$1').trim();
  const wrapped=direction==='left'?clean:`<div style="text-align:${direction}">${clean}</div>`;
  ta.value=ta.value.substring(0,start)+wrapped+ta.value.substring(end);
  ta.focus();
  ta.setSelectionRange(start+wrapped.length,start+wrapped.length);
  _savedSel={id:null,start:0,end:0};
}

/* UPLOAD IMAGE SUPABASE */

/* ══ MUSIQUE D'AMBIANCE ══ */
function chPreviewMusique(input) {
  const preview = document.getElementById('ch-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}
function eepPreviewMusique(input) {
  const preview = document.getElementById('eep-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}
function editChapPreviewMusique(input) {
  const preview = document.getElementById('edit-chap-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}
function bdEpPreviewMusique(input) {
  const preview = document.getElementById('bd-ep-musique-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}
async function uploadAudio(file, folder) {
  const ext = file.name.split('.').pop();
  const filename = folder + '/' + Date.now() + '.' + ext;
  const { data, error } = await db.storage.from('Images').upload(filename, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = db.storage.from('Images').getPublicUrl(filename);
  return publicUrl;
}

/* ══════════════════════════════════════════════════════
   LIVRES AUDIO
   ══════════════════════════════════════════════════════ */

let _allAudio = [];
let _audioTags = [];
let _audioTws = [];

function setAudioStatut(val) {
  document.getElementById('audio-statut').value = val;
  [['brouillon','brouillon'],['en-cours','encours'],['pause','pause'],['termine','termine']].forEach(([v,s]) => {
    const btn = document.getElementById('audio-s-' + s);
    if (btn) btn.className = 'btn' + (val === v ? ' btn-accent' : '');
  });
}

function setAudioAdulte(val) {
  document.getElementById('audio-adulte').value = String(val);
  document.getElementById('audio-adulte-non').className = 'btn' + (val ? '' : ' btn-accent');
  document.getElementById('audio-adulte-oui').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('audio-options-adulte').style.display = val ? 'block' : 'none';
  document.getElementById('audio-options-non-adulte').style.display = val ? 'none' : 'block';
  // Ajouter/retirer automatiquement "Scène spicy"
  const idx = _audioTws.indexOf('Scène spicy');
  if (val && idx === -1) { _audioTws.unshift('Scène spicy'); renderAudioTws(); }
  else if (!val && idx !== -1) { _audioTws.splice(idx, 1); renderAudioTws(); }
  if (!val) {
    setAudioOption('audio-soft','false');
    const wrap = document.getElementById('audio-moins18-wrap');
    if (wrap) wrap.style.display = 'none';
  }
  loadAudioTWSuggestions();
}

function setAudioOption(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
  const nonBtn = document.getElementById(id + '-non');
  const ouiBtn = document.getElementById(id + '-oui');
  if (nonBtn) nonBtn.className = 'btn' + (val === 'false' ? ' btn-accent' : '');
  if (ouiBtn) ouiBtn.className = 'btn' + (val === 'true' ? ' btn-accent' : '');
  // Afficher -18 ans si version soft activée
  if (id === 'audio-soft') {
    const wrap = document.getElementById('audio-moins18-wrap');
    if (wrap) wrap.style.display = val === 'true' ? 'block' : 'none';
  }
}


function handleAudioTagInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val && !_audioTags.includes(val)) { _audioTags.push(val); renderAudioTags(); }
    e.target.value = '';
  }
}

function renderAudioTags() {
  const wrap = document.getElementById('audio-tags-wrap');
  const input = document.getElementById('audio-tags-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _audioTags.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = t + ' <span onclick="removeAudioTag(\'' + t + '\')" style="cursor:pointer;opacity:.6">✕</span>';
    wrap.insertBefore(chip, input);
  });
}



async function loadAudioTWSuggestions() {
  const { data } = await db.from('trigger_warnings_histoires').select('contenu').order('contenu', { ascending: true });
  const uniq = [...new Set((data || []).map(t => t.contenu).filter(Boolean))];
  const container = document.getElementById('audio-tw-suggestions');
  const label = document.getElementById('audio-tw-suggestions-label');
  if (!container) return;
  if (!uniq.length) { if(label) label.style.display='none'; container.innerHTML = ''; return; }
  if(label) label.style.display = 'block';
  container.innerHTML = uniq.map(t => {
    if (t === 'Scène spicy') return `<button class="btn btn-sm" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2);opacity:0.5;cursor:default" title="Ajouté automatiquement quand contenu adulte est coché">🌶 Scène spicy (auto)</button>`;
    return `<button class="btn btn-sm ${_audioTws.includes(t) ? 'btn-accent' : ''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleAudioTWSuggestion('${t.replace(/'/g, "\\'")}')">✦ ${t}</button>`;
  }).join('');
}

async function loadAudioTagsSuggestions() {
  const { data } = await db.from('tags').select('nom').order('nom');
  const container = document.getElementById('audio-tags-suggestions');
  if (!container) return;
  if (!data || !data.length) { container.innerHTML = ''; return; }
  container.innerHTML = data.map(t =>
    `<button class="btn btn-sm ${_audioTags.includes(t.nom) ? 'btn-accent' : ''}" style="font-size:11px" onclick="toggleAudioTagSuggestion('${t.nom.replace(/'/g, "\\'")}')">✦ ${t.nom}</button>`
  ).join('');
}


let _audioEpTws = [];

function handleAudioEpTwInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val && !_audioEpTws.includes(val)) { _audioEpTws.push(val); renderAudioEpTws(); }
    e.target.value = '';
  }
}

function renderAudioEpTws() {
  const wrap = document.getElementById('audio-ep-tw-wrap');
  const input = document.getElementById('audio-ep-tw-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _audioEpTws.forEach((t, i) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = t + '<button onclick="_audioEpTws.splice(' + i + ',1);renderAudioEpTws()">×</button>';
    wrap.insertBefore(chip, input);
  });
}

async function loadAudioEpTwSuggestions() {
  const { data } = await db.from('trigger_warnings_histoires').select('contenu').order('contenu', { ascending: true });
  const uniq = [...new Set((data || []).map(t => t.contenu).filter(Boolean))];
  const container = document.getElementById('audio-ep-tw-suggestions');
  const label = document.getElementById('audio-ep-tw-suggestions-label');
  if (!container) return;
  if (!uniq.length) { if(label) label.style.display='none'; container.innerHTML = ''; return; }
  if(label) label.style.display = 'block';
  container.innerHTML = uniq.map(t =>
    `<button class="btn btn-sm ${_audioEpTws.includes(t) ? 'btn-accent' : ''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleAudioEpTwSuggestion('${t.replace(/'/g, "\\'")}')">✦ ${t}</button>`
  ).join('');
}

function toggleAudioEpTwSuggestion(val) {
  if (_audioEpTws.includes(val)) _audioEpTws.splice(_audioEpTws.indexOf(val), 1);
  else _audioEpTws.push(val);
  renderAudioEpTws();
  loadAudioEpTwSuggestions();
}

function toggleAudioTagSuggestion(val) {
  if (_audioTags.includes(val)) { _audioTags.splice(_audioTags.indexOf(val),1); }
  else { _audioTags.push(val); }
  renderAudioTags();
  loadTagsSuggestions();
}

function toggleAudioTWSuggestion(val) {
  if (_audioTws.includes(val)) { _audioTws.splice(_audioTws.indexOf(val),1); }
  else { _audioTws.push(val); }
  renderAudioTws();
  loadTWSuggestions();
}

function removeAudioTag(t) { _audioTags = _audioTags.filter(x => x !== t); renderAudioTags(); }

function handleAudioTWInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val && !_audioTws.includes(val)) { _audioTws.push(val); renderAudioTws(); }
    e.target.value = '';
  }
}

function renderAudioTws() {
  const wrap = document.getElementById('audio-tw-wrap');
  const input = document.getElementById('audio-tw-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _audioTws.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = t + ' <span onclick="removeAudioTw(\'' + t + '\')" style="cursor:pointer;opacity:.6">✕</span>';
    wrap.insertBefore(chip, input);
  });
}

function removeAudioTw(t) { _audioTws = _audioTws.filter(x => x !== t); renderAudioTws(); }

function audioEpPreviewFile(input) {
  const preview = document.getElementById('audio-ep-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

async function creerLivreAudio() {
  const alertEl = document.getElementById('alert-audio');
  alertEl.textContent = ''; alertEl.className = 'alert';
  const titre = document.getElementById('audio-titre').value.trim();
  const auteur = document.getElementById('audio-auteur').value.trim();
  const resume = document.getElementById('audio-resume').value.trim();
  const statut = document.getElementById('audio-statut').value || 'en-cours';
  const gratuitJusquau = parseInt(document.getElementById('audio-gratuit').value) || 2;
  const prixTicket = parseInt(document.getElementById('audio-prix').value) || 1;
  const adulte = document.getElementById('audio-adulte').value === 'true';
  const adapteMoins18 = adulte
    ? document.getElementById('audio-moins18').value === 'true'
    : document.getElementById('audio-moins18b').value === 'true';
  const versionSoft = document.getElementById('audio-soft')?.value === 'true';
  const adapteMoins16 = document.getElementById('audio-moins16').value === 'true';

  if (!titre) { alertEl.textContent = 'Le titre est obligatoire.'; alertEl.className = 'alert alert-error'; return; }

  const btn = document.getElementById('audio-creer-btn');
  btn.disabled = true; btn.textContent = 'Création…';

  let coverUrl = null, bannerUrl = null;
  const coverFile = document.getElementById('audio-cover-input')?.files[0];
  const bannerFile = document.getElementById('audio-banner-input')?.files[0];
  if (coverFile) { try { coverUrl = await uploadImage(coverFile, 'covers'); } catch(e) {} }
  if (bannerFile) { try { bannerUrl = await uploadImage(bannerFile, 'banners'); } catch(e) {} }

  const { data, error } = await db.from('histoires').insert({
    titre, auteur_pseudo: auteur || null, resume: resume || null,
    cover_url: coverUrl, banner_url: bannerUrl,
    format: 'audio', statut,
    gratuit_jusqu_au: gratuitJusquau,
    prix_ticket: prixTicket,
    adulte, version_soft: versionSoft, adapte_moins18: adapteMoins18, adapte_moins16: adapteMoins16,
  }).select().single();

  btn.disabled = false; btn.textContent = '✦ Créer le livre audio';

  if (error) { alertEl.textContent = 'Erreur : ' + error.message; alertEl.className = 'alert alert-error'; return; }

  // Tags
  for (const tagNom of _audioTags) {
    let { data: tag } = await db.from('tags').select('id').eq('nom', tagNom).single();
    if (!tag) { const { data: nt } = await db.from('tags').insert({ nom: tagNom }).select().single(); tag = nt; }
    if (tag) await db.from('histoires_tags').insert({ histoire_id: data.id, tag_id: tag.id });
  }
  // TW
  for (const tw of _audioTws) {
    await db.from('trigger_warnings_histoires').insert({ histoire_id: data.id, contenu: tw });
  }

  alertEl.textContent = '✦ Livre audio créé ! ✦'; alertEl.className = 'alert alert-success';
  document.getElementById('audio-titre').value = '';
  document.getElementById('audio-resume').value = '';
  document.getElementById('audio-auteur').value = '';
  document.getElementById('audio-auteur-label').textContent = '— Choisir un·e auteur·ice —';
  document.getElementById('audio-gratuit').value = '2';
  document.getElementById('audio-prix').value = '1';
  _audioTags = []; _audioTws = [];
  renderAudioTags(); renderAudioTws();
  ['audio-cover-preview','audio-banner-preview'].forEach(id => {
    const el = document.getElementById(id); if (el) { el.src = ''; el.style.display = 'none'; }
  });
  ['audio-cover-remove','audio-banner-remove'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  setAudioAdulte(false);
  setAudioOption('audio-soft','false');
  setAudioStatut('en-cours');
  loadAudioSelect();
  loadAudioPublies();
}

async function loadAudioSelect() {
  const { data } = await db.from('histoires').select('id, titre').eq('format', 'audio').order('titre');
  const menu = document.getElementById('audio-ep-histoire-menu');
  if (!menu) return;
  menu.innerHTML = (data || []).map(h =>
    `<div class="ban-dropdown-item" data-id="${h.id}" onclick="audioPickHistoire(this)">${h.titre}</div>`
  ).join('') || '<div style="padding:8px;font-size:12px;color:var(--text3)">Aucun livre audio</div>';
}

function audioPickHistoire(el) {
  const histoireId = el.dataset.id;
  document.getElementById('audio-ep-histoire').value = histoireId;
  document.getElementById('audio-ep-histoire-label').textContent = el.textContent.trim();
  document.querySelectorAll('#audio-ep-histoire-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('audio-ep-histoire-dropdown').classList.remove('open');
  // Calculer le numéro suivant
  if (histoireId) {
    db.from('chapitres').select('numero').eq('histoire_id', histoireId).order('numero', { ascending: false }).limit(1)
      .then(({ data }) => {
        const next = data && data.length ? data[0].numero + 1 : 1;
        document.getElementById('audio-ep-num').value = next;
      });
  }
  loadAudioEpTwSuggestions();
}

async function loadAudioAuteursSelect() {
  const { data } = await db.from('auteurs').select('id, pseudo').order('pseudo');
  const menu = document.getElementById('audio-dropdown-auteur-menu');
  if (!menu) return;
  menu.innerHTML = '<div class="ban-dropdown-item" onclick="audioPickAuteur(this)">— Aucun·e —</div>' +
    (data || []).map(a => `<div class="ban-dropdown-item" onclick="audioPickAuteur(this)">${a.pseudo}</div>`).join('');
}

function audioPickAuteur(el) {
  document.getElementById('audio-auteur').value = el.textContent.trim() === '— Aucun·e —' ? '' : el.textContent.trim();
  document.getElementById('audio-auteur-label').textContent = el.textContent.trim();
  document.querySelectorAll('#audio-dropdown-auteur-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('audio-dropdown-auteur').classList.remove('open');
}

function setAudioEpAcces(val) {
  document.getElementById('audio-ep-gratuit').value = String(val);
  document.getElementById('audio-ep-gratuit-btn').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('audio-ep-payant-btn').className = 'btn' + (val ? '' : ' btn-accent');
}

async function ajouterChapitreAudio() {
  const alertEl = document.getElementById('alert-audio');
  alertEl.textContent = ''; alertEl.className = 'alert';

  const histoireId = document.getElementById('audio-ep-histoire').value;
  const num = parseInt(document.getElementById('audio-ep-num').value);
  const titre = document.getElementById('audio-ep-titre').value.trim();
  const gratuit = document.getElementById('audio-ep-gratuit').value === 'true';
  const _dateVal = document.getElementById('audio-ep-date-publication').value;
  const datePub = _dateVal ? new Date(_dateVal).toISOString() : null;
  const file = document.getElementById('audio-ep-file').files[0] || null;

  if (!histoireId) { alertEl.textContent = 'Sélectionne un livre audio.'; alertEl.className = 'alert alert-error'; return; }
  if (!num || num < 1) { alertEl.textContent = 'Numéro invalide.'; alertEl.className = 'alert alert-error'; return; }
  if (!file) { alertEl.textContent = 'Sélectionne un fichier audio.'; alertEl.className = 'alert alert-error'; return; }

  const btn = document.getElementById('audio-ep-btn');
  const progress = document.getElementById('audio-ep-progress');
  btn.disabled = true; progress.style.display = 'block'; progress.textContent = 'Upload audio…';

  let audioUrl = null;
  try {
    audioUrl = await uploadAudio(file, 'audio/' + histoireId);
  } catch(e) {
    alertEl.textContent = 'Erreur upload : ' + e.message; alertEl.className = 'alert alert-error';
    btn.disabled = false; progress.style.display = 'none'; return;
  }

  // Upload image chapitre si présente
  let epCoverUrl = null;
  const epCoverFile = document.getElementById('audio-ep-cover-input')?.files[0];
  if (epCoverFile) { try { epCoverUrl = await uploadImage(epCoverFile, 'covers'); } catch(e) {} }
  const audioEpTwStr = _audioEpTws.length ? _audioEpTws.join(', ') : null;
  const { error } = await db.from('chapitres').insert({
    histoire_id: histoireId, numero: num, titre: titre || null,
    gratuit, contenu: null, date_publication: datePub, audio_url: audioUrl,
    tw: audioEpTwStr, cover_url: epCoverUrl
  });

  btn.disabled = false; progress.style.display = 'none';

  if (error) { alertEl.textContent = 'Erreur : ' + error.message; alertEl.className = 'alert alert-error'; return; }

  alertEl.textContent = `✦ Chapitre ${num} publié !`; alertEl.className = 'alert alert-success';
  document.getElementById('audio-ep-num').value = '';
  document.getElementById('audio-ep-titre').value = '';
  document.getElementById('audio-ep-file').value = '';
  document.getElementById('audio-ep-date-publication').value = '';
  document.getElementById('audio-ep-preview').style.display = 'none';
  _audioEpTws = []; renderAudioEpTws();
  const epCoverPrev = document.getElementById('audio-ep-cover-preview');
  if (epCoverPrev) { epCoverPrev.src = ''; epCoverPrev.style.display = 'none'; }
  const epCoverRemove = document.getElementById('audio-ep-cover-remove');
  if (epCoverRemove) epCoverRemove.style.display = 'none';
  const epCoverInput = document.getElementById('audio-ep-cover-input');
  if (epCoverInput) epCoverInput.value = '';
}

async function loadAudioPublies() {
  const { data } = await db.from('histoires').select('id, titre, cover_url, statut').eq('format', 'audio').order('created_at', { ascending: false });
  _allAudio = data || [];
  renderAudioListe();
}

let _currentFilterAudio = 'all';

function filterAudio(filtre, btn) {
  _currentFilterAudio = filtre;
  document.querySelectorAll('.filter-btn-audio').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAudioListe();
}

function renderAudioListe() {
  const liste = document.getElementById('audio-publiees-liste');
  if (!liste) return;
  let filtered = _allAudio;
  if (_currentFilterAudio !== 'all') filtered = _allAudio.filter(h => h.statut === _currentFilterAudio);
  if (!filtered.length) { liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucun livre audio ici.</div>'; return; }
  liste.innerHTML = filtered.map(h => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--glass-border)">
      ${h.cover_url ? `<img src="${h.cover_url}" style="width:40px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0">` : '<div style="width:40px;height:60px;background:var(--glass);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🎧</div>'}
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text);margin-bottom:4px">${h.titre}</div>
        <div style="font-size:11px;color:var(--text3)">${h.statut}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button onclick="ouvrirPopupEditAudio('${h.id}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
          ✏️ Modifier
        </button>
        <button onclick="voirChapitresAudio('${h.id}', '${h.titre.replace(/'/g,"\'")}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
          Chapitres
        </button>
        <button onclick="ouvrirPopupSupprAudio('${h.id}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">
          🗑
        </button>
      </div>
    </div>
  `).join('');
}

async function voirChapitresAudio(histoireId, titre) {
  const card = document.getElementById('audio-chapitres-card');
  const titreEl = document.getElementById('audio-chapitres-titre');
  if (titreEl) titreEl.textContent = 'Chapitres — ' + titre;
  if (card) { card.style.display = 'block'; card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  await loadAudioChapitres(histoireId);
}

async function loadAudioChapitres(histoireId) {
  const liste = document.getElementById('audio-chapitres-liste');
  if (!liste) return;
  const { data } = await db.from('chapitres').select('id, numero, titre, gratuit, date_publication').eq('histoire_id', histoireId).order('numero');
  if (!data || !data.length) { liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucun chapitre.</div>'; return; }
  liste.innerHTML = data.map(ch => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
      <div>
        <div style="font-size:13px;color:var(--text)">Ch.${ch.numero}${ch.titre ? ' — ' + ch.titre : ''}</div>
        <div style="font-size:11px;color:var(--text3)">${ch.gratuit ? 'Gratuit' : '🎟 Ticket'}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="ouvrirPopupEditChapitreAudio('${ch.id}', '${histoireId}', ${ch.numero}, '${(ch.titre||'').replace(/'/g,"\'")}', ${ch.gratuit})"
          style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">
          ✏️
        </button>
        <button onclick="supprimerChapitreAudio('${ch.id}', '${histoireId}')"
          style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">
          🗑
        </button>
      </div>
    </div>
  `).join('');
  window._audioChapitresHistoireId = histoireId;
}

async function supprimerChapitreAudio(chapId, histoireId) {
  if (!confirm('Supprimer ce chapitre ?')) return;
  await db.from('chapitres').delete().eq('id', chapId);
  loadAudioChapitres(histoireId);
}

let _audioASupprimer = null;
function ouvrirPopupSupprAudio(id) { _audioASupprimer = id; document.getElementById('popup-suppr-audio').style.display = 'flex'; }
function fermerPopupSupprAudio() { document.getElementById('popup-suppr-audio').style.display = 'none'; _audioASupprimer = null; }
async function confirmerSupprAudio() {
  if (!_audioASupprimer) return;
  await db.from('chapitres').delete().eq('histoire_id', _audioASupprimer);
  await db.from('histoires').delete().eq('id', _audioASupprimer);
  fermerPopupSupprAudio(); loadAudioPublies();
}


let _eAudioChapId = null, _eAudioChapHistoireId = null;

let _eAudioChapTws = [];

function eAudioChapPreviewFile(input) {
  const preview = document.getElementById('eaudio-chap-file-preview');
  if (input.files[0]) { preview.textContent = '🎵 ' + input.files[0].name; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

function handleEAudioChapTwInput(e) {
  if (e.key !== 'Enter') return; e.preventDefault();
  const val = e.target.value.trim();
  if (val && !_eAudioChapTws.includes(val)) { _eAudioChapTws.push(val); renderEAudioChapTws(); }
  e.target.value = '';
}

function renderEAudioChapTws() {
  const wrap = document.getElementById('eaudio-chap-tw-wrap');
  const input = document.getElementById('eaudio-chap-tw-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _eAudioChapTws.forEach(t => {
    const chip = document.createElement('span'); chip.className = 'tag-chip';
    chip.innerHTML = t + ' <span onclick="removeEAudioChapTw(\'' + t + '\')" style="cursor:pointer;opacity:.6">✕</span>';
    wrap.insertBefore(chip, input);
  });
}
function removeEAudioChapTw(t) { _eAudioChapTws = _eAudioChapTws.filter(x=>x!==t); renderEAudioChapTws(); }

async function loadEAudioChapTwSuggestions() {
  const { data } = await db.from('trigger_warnings_histoires').select('contenu').order('contenu',{ascending:true});
  const uniq = [...new Set((data||[]).map(t=>t.contenu).filter(Boolean))];
  const container = document.getElementById('eaudio-chap-tw-suggestions');
  const label = document.getElementById('eaudio-chap-tw-suggestions-label');
  if (!container) return;
  if (!uniq.length) { if(label)label.style.display='none'; container.innerHTML=''; return; }
  if(label) label.style.display='block';
  const btns = uniq.map(function(t) {
    var cls = _eAudioChapTws.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var btn = document.createElement('button');
    btn.className = cls;
    btn.style.cssText = 'font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)';
    btn.textContent = '✦ ' + t;
    btn.onclick = function() { toggleEAudioChapTwSug(t); };
    return btn;
  });
  container.innerHTML = '';
  btns.forEach(function(b) { container.appendChild(b); });
}
function toggleEAudioChapTwSug(val) {
  if(_eAudioChapTws.includes(val)) _eAudioChapTws.splice(_eAudioChapTws.indexOf(val),1); else _eAudioChapTws.push(val);
  renderEAudioChapTws(); loadEAudioChapTwSuggestions();
}

async function ouvrirPopupEditChapitreAudio(chapId, histoireId, num, titre, gratuit) {
  _eAudioChapId = chapId;
  _eAudioChapHistoireId = histoireId;
  document.getElementById('eaudio-chap-num').value = num;
  document.getElementById('eaudio-chap-titre').value = titre || '';
  setEAudioChapAcces(gratuit === true || gratuit === 'true');
  const { data } = await db.from('chapitres').select('tw, date_publication, audio_url, cover_url').eq('id', chapId).single();
  document.getElementById('eaudio-chap-date').value = data?.date_publication ? _isoToDatetimeLocal(data.date_publication) : '';
  // Audio actuel
  const actuel = document.getElementById('eaudio-chap-file-actuel');
  if (actuel) { if(data?.audio_url){actuel.textContent='🎵 '+data.audio_url.split('/').pop();actuel.style.display='block';}else{actuel.style.display='none';} }
  // Image actuelle
  const coverPrev = document.getElementById('eaudio-chap-cover-preview');
  if (coverPrev) { if(data?.cover_url){coverPrev.src=data.cover_url;coverPrev.style.display='block';document.getElementById('eaudio-chap-cover-remove').style.display='inline-block';}else{coverPrev.style.display='none';document.getElementById('eaudio-chap-cover-remove').style.display='none';} }
  // TW
  _eAudioChapTws = data?.tw ? data.tw.split(',').map(t=>t.trim()).filter(Boolean) : [];
  renderEAudioChapTws();
  loadEAudioChapTwSuggestions();
  // Reset file input
  const fileInput = document.getElementById('eaudio-chap-file'); if(fileInput) fileInput.value='';
  const filePreview = document.getElementById('eaudio-chap-file-preview'); if(filePreview) filePreview.style.display='none';
  document.getElementById('popup-edit-audio-chap').style.display = 'flex';
}

function setEAudioChapAcces(val) {
  document.getElementById('eaudio-chap-gratuit').value = String(val);
  document.getElementById('eaudio-chap-gratuit-btn').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('eaudio-chap-payant-btn').className = 'btn' + (val ? '' : ' btn-accent');
}

function fermerPopupEditChapitreAudio() { document.getElementById('popup-edit-audio-chap').style.display = 'none'; }

async function sauvegarderChapitreAudio() {
  if (!_eAudioChapId) return;
  const num = parseInt(document.getElementById('eaudio-chap-num').value);
  const titre = document.getElementById('eaudio-chap-titre').value.trim();
  const gratuit = document.getElementById('eaudio-chap-gratuit').value === 'true';
  const dateVal = document.getElementById('eaudio-chap-date').value;
  const datePub = dateVal ? new Date(dateVal).toISOString() : null;
  const twStr = _eAudioChapTws.length ? _eAudioChapTws.join(', ') : null;
  const btn = document.getElementById('eaudio-chap-save-btn');
  btn.disabled = true; btn.textContent = 'Sauvegarde…';
  // Nouveau fichier audio ?
  let audioUrl = null;
  const audioFile = document.getElementById('eaudio-chap-file')?.files[0];
  if (audioFile) { try { audioUrl = await uploadAudio(audioFile, 'audio'); } catch(e) { alert('Erreur upload audio : '+e.message); btn.disabled=false; btn.textContent='✦ Sauvegarder'; return; } }
  // Nouvelle image ?
  let coverUrl = null;
  const coverFile = document.getElementById('eaudio-chap-cover-input')?.files[0];
  if (coverFile) { try { coverUrl = await uploadImage(coverFile, 'covers'); } catch(e) {} }
  const updates = { numero: num, titre: titre||null, gratuit, date_publication: datePub, tw: twStr };
  if (audioUrl) updates.audio_url = audioUrl;
  if (coverUrl) updates.cover_url = coverUrl;
  await db.from('chapitres').update(updates).eq('id', _eAudioChapId);
  btn.disabled = false; btn.textContent = '✦ Sauvegarder';
  fermerPopupEditChapitreAudio();
  loadAudioChapitres(_eAudioChapHistoireId);
}

let _eAudioData = null;
let _eAudioTags = [], _eAudioTws = [];

function setEAudioStatut(val) {
  document.getElementById('eaudio-statut').value = val;
  [['brouillon','brouillon'],['en-cours','encours'],['pause','pause'],['termine','termine']].forEach(([v,s]) => {
    const btn = document.getElementById('eaudio-s-' + s);
    if (btn) btn.className = 'btn' + (val === v ? ' btn-accent' : '');
  });
}

function setEAudioAdulte(val) {
  document.getElementById('eaudio-adulte').value = String(val);
  document.getElementById('eaudio-adulte-non').className = 'btn' + (val ? '' : ' btn-accent');
  document.getElementById('eaudio-adulte-oui').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('eaudio-options-adulte').style.display = val ? 'block' : 'none';
  document.getElementById('eaudio-options-non-adulte').style.display = val ? 'none' : 'block';
  const idx = _eAudioTws.indexOf('Scène spicy');
  if (val && idx === -1) { _eAudioTws.unshift('Scène spicy'); renderEAudioTws(); }
  else if (!val && idx !== -1) { _eAudioTws.splice(idx, 1); renderEAudioTws(); }
  if (!val) { setEAudioOption('eaudio-soft','false'); const w=document.getElementById('eaudio-moins18-wrap');if(w)w.style.display='none'; }
}

function setEAudioOption(id, val) {
  const el = document.getElementById(id); if (el) el.value = val;
  const nonBtn = document.getElementById(id+'-non'); const ouiBtn = document.getElementById(id+'-oui');
  if (nonBtn) nonBtn.className = 'btn'+(val==='false'?' btn-accent':'');
  if (ouiBtn) ouiBtn.className = 'btn'+(val==='true'?' btn-accent':'');
  if (id==='eaudio-soft') { const w=document.getElementById('eaudio-moins18-wrap');if(w)w.style.display=val==='true'?'block':'none'; }
}

function handleEAudioTagInput(e) {
  if (e.key !== 'Enter') return; e.preventDefault();
  const val = e.target.value.trim();
  if (val && !_eAudioTags.includes(val)) { _eAudioTags.push(val); renderEAudioTags(); }
  e.target.value = '';
}

function renderEAudioTags() {
  const wrap = document.getElementById('eaudio-tags-wrap');
  const input = document.getElementById('eaudio-tags-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _eAudioTags.forEach(t => {
    const chip = document.createElement('span'); chip.className = 'tag-chip';
    chip.innerHTML = t + ' <span onclick="removeEAudioTag(\'' + t + '\')" style="cursor:pointer;opacity:.6">✕</span>';
    wrap.insertBefore(chip, input);
  });
}
function removeEAudioTag(t) { _eAudioTags = _eAudioTags.filter(x=>x!==t); renderEAudioTags(); }

function handleEAudioTWInput(e) {
  if (e.key !== 'Enter') return; e.preventDefault();
  const val = e.target.value.trim();
  if (val && !_eAudioTws.includes(val)) { _eAudioTws.push(val); renderEAudioTws(); }
  e.target.value = '';
}

function renderEAudioTws() {
  const wrap = document.getElementById('eaudio-tw-wrap');
  const input = document.getElementById('eaudio-tw-input');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  _eAudioTws.forEach(t => {
    const chip = document.createElement('span'); chip.className = 'tag-chip';
    chip.innerHTML = t + ' <span onclick="removeEAudioTw(\'' + t + '\')" style="cursor:pointer;opacity:.6">✕</span>';
    wrap.insertBefore(chip, input);
  });
}
function removeEAudioTw(t) { _eAudioTws = _eAudioTws.filter(x=>x!==t); renderEAudioTws(); }

async function loadEAudioAuteursSelect() {
  const { data } = await db.from('auteurs').select('id, pseudo').order('pseudo');
  const menu = document.getElementById('eaudio-dropdown-auteur-menu');
  if (!menu) return;
  menu.innerHTML = '<div class="ban-dropdown-item" onclick="eAudioPickAuteur(this)">— Aucun·e —</div>' +
    (data||[]).map(a=>`<div class="ban-dropdown-item" onclick="eAudioPickAuteur(this)">${a.pseudo}</div>`).join('');
}
function eAudioPickAuteur(el) {
  document.getElementById('eaudio-auteur').value = el.textContent.trim() === '— Aucun·e —' ? '' : el.textContent.trim();
  document.getElementById('eaudio-auteur-label').textContent = el.textContent.trim();
  document.querySelectorAll('#eaudio-dropdown-auteur-menu .ban-dropdown-item').forEach(i=>i.classList.toggle('selected',i===el));
  document.getElementById('eaudio-dropdown-auteur').classList.remove('open');
}

async function loadEAudioTagsSuggestions() {
  const { data } = await db.from('tags').select('nom').order('nom');
  const container = document.getElementById('eaudio-tags-suggestions');
  const label = document.getElementById('eaudio-tags-suggestions-label');
  if (!container) return;
  if (!data||!data.length) { if(label)label.style.display='none'; container.innerHTML=''; return; }
  if(label) label.style.display='block';
  container.innerHTML = data.map(t=>`<button class="btn btn-sm ${_eAudioTags.includes(t.nom)?'btn-accent':''}" style="font-size:11px" onclick="toggleEAudioTagSug('${t.nom.replace(/'/g,"\\'")}')">✦ ${t.nom}</button>`).join('');
}
function toggleEAudioTagSug(val) {
  if(_eAudioTags.includes(val)) _eAudioTags.splice(_eAudioTags.indexOf(val),1); else _eAudioTags.push(val);
  renderEAudioTags(); loadEAudioTagsSuggestions();
}

async function loadEAudioTWSuggestions() {
  const { data } = await db.from('trigger_warnings_histoires').select('contenu').order('contenu',{ascending:true});
  const uniq = [...new Set((data||[]).map(t=>t.contenu).filter(Boolean))];
  const container = document.getElementById('eaudio-tw-suggestions');
  const label = document.getElementById('eaudio-tw-suggestions-label');
  if (!container) return;
  if (!uniq.length) { if(label)label.style.display='none'; container.innerHTML=''; return; }
  if(label) label.style.display='block';
  container.innerHTML = uniq.map(t=>`<button class="btn btn-sm ${_eAudioTws.includes(t)?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEAudioTWSug('${t.replace(/'/g,"\\'")}')">✦ ${t}</button>`).join('');
}
function toggleEAudioTWSug(val) {
  if(_eAudioTws.includes(val)) _eAudioTws.splice(_eAudioTws.indexOf(val),1); else _eAudioTws.push(val);
  renderEAudioTws(); loadEAudioTWSuggestions();
}

async function ouvrirPopupEditAudio(id) {
  const { data: h } = await db.from('histoires').select('*').eq('id', id).single();
  if (!h) return;
  _eAudioData = h;
  document.getElementById('eaudio-id').value = id;
  document.getElementById('eaudio-titre').value = h.titre || '';
  document.getElementById('eaudio-resume').value = h.resume || '';
  document.getElementById('eaudio-gratuit').value = h.gratuit_jusqu_au || 2;
  document.getElementById('eaudio-prix').value = h.prix_ticket || 1;
  // Auteur
  document.getElementById('eaudio-auteur').value = h.auteur_pseudo || '';
  document.getElementById('eaudio-auteur-label').textContent = h.auteur_pseudo || '— Choisir un·e auteur·ice —';
  // Images
  const coverPrev = document.getElementById('eaudio-cover-preview');
  if (coverPrev) { if(h.cover_url){coverPrev.src=h.cover_url;coverPrev.style.display='block';document.getElementById('eaudio-cover-remove').style.display='inline-block';}else{coverPrev.style.display='none';document.getElementById('eaudio-cover-remove').style.display='none';} }
  const bannerPrev = document.getElementById('eaudio-banner-preview');
  if (bannerPrev) { if(h.banner_url){bannerPrev.src=h.banner_url;bannerPrev.style.display='block';document.getElementById('eaudio-banner-remove').style.display='inline-block';}else{bannerPrev.style.display='none';document.getElementById('eaudio-banner-remove').style.display='none';} }
  // Tags
  const { data: hTags } = await db.from('histoires_tags').select('tags(nom)').eq('histoire_id', id);
  _eAudioTags = (hTags||[]).map(t=>t.tags?.nom).filter(Boolean);
  renderEAudioTags();
  // TW
  const { data: hTws } = await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id', id);
  _eAudioTws = (hTws||[]).map(t=>t.contenu).filter(Boolean);
  renderEAudioTws();
  // Adulte
  setEAudioAdulte(h.adulte||false);
  setEAudioStatut(h.statut||'en-cours');
  setEAudioOption('eaudio-soft', h.version_soft?'true':'false');
  setEAudioOption('eaudio-moins18', (h.adapte_moins18!==false)?'true':'false');
  setEAudioOption('eaudio-moins18b', (h.adapte_moins18!==false)?'true':'false');
  setEAudioOption('eaudio-moins16', (h.adapte_moins16!==false)?'true':'false');
  await loadEAudioAuteursSelect();
  loadEAudioTagsSuggestions();
  loadEAudioTWSuggestions();
  document.getElementById('popup-edit-audio').style.display = 'flex';
}

function fermerPopupEditAudio() { document.getElementById('popup-edit-audio').style.display = 'none'; }

async function sauvegarderAudio() {
  const id = document.getElementById('eaudio-id').value;
  const titre = document.getElementById('eaudio-titre').value.trim();
  const resume = document.getElementById('eaudio-resume').value.trim();
  const statut = document.getElementById('eaudio-statut').value;
  const gratuitJusquau = parseInt(document.getElementById('eaudio-gratuit').value) || 2;
  const prixTicket = parseInt(document.getElementById('eaudio-prix').value) || 1;
  const adulte = document.getElementById('eaudio-adulte').value === 'true';
  const versionSoft = document.getElementById('eaudio-soft')?.value === 'true';
  const adapteMoins18 = adulte ? document.getElementById('eaudio-moins18').value==='true' : document.getElementById('eaudio-moins18b').value==='true';
  const adapteMoins16 = document.getElementById('eaudio-moins16').value === 'true';
  const auteur = document.getElementById('eaudio-auteur').value.trim();
  if (!titre) { alert('Le titre est obligatoire.'); return; }
  const btn = document.getElementById('eaudio-save-btn');
  btn.disabled = true; btn.textContent = 'Sauvegarde…';
  let coverUrl = _eAudioData.cover_url || null;
  let bannerUrl = _eAudioData.banner_url || null;
  const coverFile = document.getElementById('eaudio-cover-input')?.files[0];
  const bannerFile = document.getElementById('eaudio-banner-input')?.files[0];
  if (coverFile) { try { coverUrl = await uploadImage(coverFile,'covers'); } catch(e){} }
  if (bannerFile) { try { bannerUrl = await uploadImage(bannerFile,'banners'); } catch(e){} }
  await db.from('histoires').update({ titre, resume:resume||null, statut, gratuit_jusqu_au:gratuitJusquau, prix_ticket:prixTicket, auteur_pseudo:auteur||null, cover_url:coverUrl, banner_url:bannerUrl, adulte, version_soft:versionSoft, adapte_moins18:adapteMoins18, adapte_moins16:adapteMoins16 }).eq('id', id);
  // Tags
  await db.from('histoires_tags').delete().eq('histoire_id', id);
  for (const tagNom of _eAudioTags) {
    let { data: tag } = await db.from('tags').select('id').eq('nom',tagNom).single();
    if (!tag) { const {data:nt} = await db.from('tags').insert({nom:tagNom}).select().single(); tag=nt; }
    if (tag) await db.from('histoires_tags').insert({histoire_id:id, tag_id:tag.id});
  }
  // TW
  await db.from('trigger_warnings_histoires').delete().eq('histoire_id', id);
  for (const tw of _eAudioTws) await db.from('trigger_warnings_histoires').insert({histoire_id:id, contenu:tw});
  btn.disabled = false; btn.textContent = '✦ Sauvegarder';
  fermerPopupEditAudio(); loadAudioPublies();
}


/* ══ COMPRESSION IMAGE AVANT UPLOAD ══ */
async function compresserImage(file, maxWidth, qualite) {
  return new Promise(function(resolve) {
    // Si c'est un GIF ou SVG, on ne compresse pas
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      resolve(file); return;
    }
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function() {
      URL.revokeObjectURL(url);
      var w = img.naturalWidth;
      var h = img.naturalHeight;
      // Redimensionner si trop large
      if (w > maxWidth) {
        h = Math.round(h * maxWidth / w);
        w = maxWidth;
      }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(function(blob) {
        var compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        resolve(compressed);
      }, 'image/jpeg', qualite);
    };
    img.onerror = function() { resolve(file); };
    img.src = url;
  });
}

async function uploadImage(file,folder){
  // Compression : max 1800px, qualité 85%
  var maxWidth = folder === 'banners' || folder === 'bannieres' ? 1800 : 1200;
  var compressed = await compresserImage(file, maxWidth, 0.85);
  const filename=`${folder}/${Date.now()}.jpg`;
  const {data,error}=await db.storage.from('Images').upload(filename,compressed,{upsert:true,contentType:'image/jpeg'});
  if(error)throw error;
  const {data:{publicUrl}}=db.storage.from('Images').getPublicUrl(filename);
  return publicUrl;
}

/* TAGS */
function handleTagInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const val=e.target.value.trim().replace(',','');
    if(val&&!tags.includes(val)){
      tags.push(val);
      renderTags();
      // Mettre à jour les suggestions pour refléter le tag ajouté
      const btn=document.getElementById('sug-tag-'+val.replace(/\s/g,'-'));
      if(btn)btn.classList.add('btn-accent');
    }
    e.target.value='';
    setTimeout(()=>document.getElementById('tags-input').focus(),0);
  }
}
function removeTag(i){tags.splice(i,1);renderTags();}
function renderTags(){
  const wrap=document.getElementById('tags-wrap');
  const input=document.getElementById('tags-input');
  wrap.innerHTML='';
  tags.forEach((t,i)=>{
    const chip=document.createElement('div');chip.className='tag-chip';
    chip.innerHTML=`${t}<button onclick="removeTag(${i})">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}

function handleTWInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const val=e.target.value.trim().replace(',','');
    if(val==='Scène spicy'){e.target.value='';return;} // bloqué, géré automatiquement
    if(val&&!tws.includes(val)){
      tws.push(val);
      renderTWs();
      const btn=document.getElementById('sug-tw-'+val.replace(/\s/g,'-'));
      if(btn)btn.classList.add('btn-accent');
    }
    e.target.value='';
    setTimeout(()=>document.getElementById('tw-input').focus(),0);
  }
}
function removeTW(i){tws.splice(i,1);renderTWs();}
function renderTWs(){
  const wrap=document.getElementById('tw-wrap');
  const input=document.getElementById('tw-input');
  wrap.innerHTML='';
  tws.forEach((t,i)=>{
    const chip=document.createElement('div');chip.className='tag-chip';
    if(t==='Scène spicy'){
      chip.innerHTML=`🌶 ${t} <span style="font-size:9px;opacity:0.6;margin-left:2px">(auto)</span>`;
      chip.style.opacity='0.7';chip.title='Ajouté automatiquement';
    } else {
      chip.innerHTML=`${t}<button onclick="removeTW(${i})">×</button>`;
    }
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}

/* WORD COUNT */
document.addEventListener('input',e=>{
  if(e.target.id==='ch-contenu'){
    const words=e.target.value.trim().split(/\s+/).filter(w=>w).length;
    document.getElementById('ch-wordcount').textContent=words.toLocaleString('fr')+' mots';
  }
});

/* CRÉER HISTOIRE */
async function creerHistoire(){
  const titre=document.getElementById('n-titre').value.trim();
  const resume=document.getElementById('n-resume').value.trim();
  if(!titre||!resume){showAlert('nouvelle','Le titre et le résumé sont obligatoires.','error');return;}
  const btn=document.querySelector('#panel-nouvelle .btn-accent');
  btn.textContent='Création…';btn.disabled=true;
  try{
    // Upload images
    let coverUrl=null,bannerUrl=null;
    const coverFile=document.querySelector('#cover-zone input').files[0];
    const bannerFile=document.querySelector('#banner-zone input').files[0];
    if(coverFile)coverUrl=await uploadImage(coverFile,'covers');
    if(bannerFile)bannerUrl=await uploadImage(bannerFile,'banners');

    // Créer l'histoire
    const {data:histoire,error}=await db.from('histoires').insert({
      titre,
      resume,
      cover_url:coverUrl,
      banner_url:bannerUrl,
      auteur_pseudo:_auteursSelectionnes.length?_auteursSelectionnes.join(', '):null,
      gratuit_jusqu_au:parseInt(document.getElementById('n-gratuit').value)||8,
      prix_ticket:parseInt(document.getElementById('n-prix').value)||1,
      adulte:document.getElementById('n-adulte').value==='true',
      statut:document.getElementById('n-statut').value||'en-cours',
      numerotation:document.getElementById('n-numerotation').value||'arabe',
      version_soft:document.getElementById('n-soft').value==='true',
      adapte_moins18:(document.getElementById('n-adulte').value==='true'
        ?document.getElementById('n-moins18').value==='true'
        :document.getElementById('n-moins18b').value==='true'),
      adapte_moins16:document.getElementById('n-moins16').value==='true',
    }).select().single();
    if(error)throw error;

    // Tags
    for(const tagNom of tags){
      let {data:tag}=await db.from('tags').select('id').eq('nom',tagNom).single();
      if(!tag){const {data:newTag}=await db.from('tags').insert({nom:tagNom}).select().single();tag=newTag;}
      if(tag)await db.from('histoires_tags').insert({histoire_id:histoire.id,tag_id:tag.id});
    }

    // Auteurs — sauvegarder dans histoires_auteurs
    await db.from('histoires_auteurs').delete().eq('histoire_id',histoire.id);
    for(const pseudo of _auteursSelectionnes){
      await db.from('histoires_auteurs').insert({histoire_id:histoire.id,auteur_pseudo:pseudo});
    }

    // Trigger warnings
    for(const tw of tws){
      await db.from('trigger_warnings_histoires').insert({histoire_id:histoire.id,contenu:tw});
    }

    showAlert('nouvelle','Histoire créée avec succès ! ✦');
    // Reset form
    _auteursSelectionnes=[];renderAuteursChips('n-auteurs-chips','_auteursSelectionnes');
    ['n-titre','n-resume'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('n-gratuit').value='8';document.getElementById('n-prix').value='1';
    setAdulte(false);setStatut('en-cours');
    tags=[];tws=[];renderTags();renderTWs();
    document.querySelectorAll('[id^="sug-"]').forEach(b=>b.classList.remove('btn-accent'));
    ['cover-preview','banner-preview'].forEach(id=>{document.getElementById(id).style.display='none';});
    loadHistoires();
    // Recharger les suggestions pour que les nouveaux tags/TW apparaissent immédiatement
    loadTagsSuggestions();
    loadTWSuggestions();
  }catch(e){
    showAlert('nouvelle','Erreur : '+e.message,'error');
  }finally{
    btn.textContent='✦ Créer l\'histoire';btn.disabled=false;
  }
}

/* LOAD HISTOIRES */
let currentFilter='all';

async function loadHistoires(){
  const {data,error}=await db.from('histoires').select('*').order('created_at',{ascending:false});
  if(error){document.getElementById('histoires-list').innerHTML='<div class="loading">Erreur de chargement.</div>';return;}
  histoires=data||[];
  // Charger nb chapitres
  for(const h of histoires){
    const {count}=await db.from('chapitres').select('*',{count:'exact',head:true}).eq('histoire_id',h.id);
    h._chapCount=count||0;
  }
  renderHistoiresList();
}

function filterHistoires(filtre,btn){
  currentFilter=filtre;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderHistoiresList();
}

function renderHistoiresList(){
  // L'onglet Roman n'affiche que les romans (pas les BD ni webtoons)
  const isRoman = h => !h.format || h.format === 'roman';
  let filtered=histoires;
  if(currentFilter==='corbeille') filtered=histoires.filter(h=>h.corbeille===true&&isRoman(h));
  else if(currentFilter==='en-cours') filtered=histoires.filter(h=>!h.corbeille&&h.statut==='en-cours'&&isRoman(h));
  else if(currentFilter==='brouillon') filtered=histoires.filter(h=>!h.corbeille&&h.statut==='brouillon'&&isRoman(h));
  else if(currentFilter==='pause') filtered=histoires.filter(h=>!h.corbeille&&h.statut==='pause'&&isRoman(h));
  else if(currentFilter==='termine') filtered=histoires.filter(h=>!h.corbeille&&h.statut==='termine'&&isRoman(h));
  else filtered=histoires.filter(h=>!h.corbeille&&isRoman(h));

  if(!filtered.length){
    document.getElementById('histoires-list').innerHTML='<div class="loading">Aucune histoire ici.</div>';
    return;
  }
  const isCorbeille=currentFilter==='corbeille';
  document.getElementById('histoires-list').innerHTML=filtered.map(h=>`
    <div class="histoire-item" style="cursor:pointer" onclick="showHistoireDetail('${h.id}')">
      <div class="histoire-item-cover">${h.cover_url?`<img src="${h.cover_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`:'📖'}</div>
      <div class="histoire-item-info">
        <div class="histoire-item-title">${h.titre}</div>
        <div class="histoire-item-meta">${h.auteur_pseudo?'par '+h.auteur_pseudo+' · ':''}<strong>${h._chapCount}</strong> chapitre(s)</div>
      </div>
      <span class="histoire-item-status ${h.statut==='en-cours'?'status-encours':h.statut==='pause'?'status-pause':h.statut==='termine'?'status-termine':'status-brouillon'}">${h.statut==='en-cours'?'En cours':h.statut==='pause'?'En pause':h.statut==='termine'?'Terminé':'Brouillon'}</span>
      ${isCorbeille
        ?`<button class="btn btn-sm btn-success" onclick="event.stopPropagation();restaurerHistoire('${h.id}')">Restaurer</button>
           <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();supprimerDefinitivement('${h.id}')">Suppr. déf.</button>`
        :`<div style="display:flex;gap:6px;flex-shrink:0">
           <button class="btn btn-sm" onclick="event.stopPropagation();cycleStatut('${h.id}','${h.statut}')" style="background:rgba(180,190,230,.1);border-color:rgba(180,190,230,.2)">${h.statut==='en-cours'?'Mettre en brouillon':h.statut==='pause'?'Reprendre':h.statut==='termine'?'Reprendre':'Mettre en cours'}</button>
           <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();ouvrirPopupCorbeilleDirecte('${h.id}')" title="Mettre à la corbeille">🗑</button>
         </div>`
      }
    </div>
  `).join('');
}

let _corbeilleId=null;
function ouvrirPopupCorbeilleDirecte(id){
  _corbeilleId=id;
  document.getElementById('popup-corbeille').style.display='flex';
}

function ouvrirPopupCorbeille(){
  _corbeilleId=currentDetailId;
  const p=document.getElementById('popup-corbeille');
  p.style.display='flex';
}
function fermerPopupCorbeille(){
  document.getElementById('popup-corbeille').style.display='none';
  _corbeilleId=null;
}
async function confirmerCorbeille(){
  if(!_corbeilleId)return;
  await db.from('histoires').update({corbeille:true}).eq('id',_corbeilleId);
  fermerPopupCorbeille();
  await loadHistoires();
  document.getElementById('histoire-detail').style.display='none';
  document.getElementById('histoires-card').style.display='block';
}

async function restaurerHistoire(id){
  await db.from('histoires').update({corbeille:false}).eq('id',id);
  loadHistoires();
}

async function supprimerDefinitivement(id){
  if(!confirm('Supprimer définitivement cette histoire et tous ses chapitres ? Cette action est irréversible.'))return;
  await db.from('trigger_warnings_histoires').delete().eq('histoire_id',id);
  await db.from('histoires_tags').delete().eq('histoire_id',id);
  await db.from('chapitres').delete().eq('histoire_id',id);
  await db.from('histoires').delete().eq('id',id);
  loadHistoires();
}

let currentDetailId=null;
async function showHistoireDetail(id){
  currentDetailId=id;
  // Toujours s'assurer que le formulaire d'édition est caché
  document.getElementById('edit-histoire-form').style.display='none';
  document.getElementById('detail-card').style.display='block';
  let h=histoires.find(x=>x.id===id);
  if(!h){
    const {data}=await db.from('histoires').select('*').eq('id',id).single();
    if(!data)return;
    h=data;
  }
  const {data:chaps}=await db.from('chapitres').select('*').eq('histoire_id',id).order('numero');
  const {data:htags}=await db.from('histoires_tags').select('tags(nom)').eq('histoire_id',id);
  const {data:htws}=await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id',id);
  const tags=(htags||[]).map(t=>t.tags?.nom).filter(Boolean);
  const tws=(htws||[]).map(t=>t.contenu);
  const gratuits=(chaps||[]).filter(c=>c.gratuit).length;
  const totalMots=(chaps||[]).reduce((acc,ch)=>acc+(ch.contenu?ch.contenu.trim().split(' ').length:0),0);
  document.getElementById('histoires-card').style.display='none';
  document.getElementById('histoire-detail').style.display='block';
  document.getElementById('detail-card').innerHTML=`
    <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start">
      ${h.cover_url?`<img src="${h.cover_url}" style="width:72px;aspect-ratio:2/3;object-fit:cover;border-radius:6px;flex-shrink:0">`:'<div style="width:72px;aspect-ratio:2/3;background:rgba(126,159,212,.1);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">📖</div>'}
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div style="font-family:Cormorant Garamond,serif;font-size:20px;margin-bottom:4px">${h.titre}</div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button onclick="ouvrirEditionHistoire('${h.id}')" title="Modifier" style="background:rgba(126,159,212,.12);border:1px solid rgba(126,159,212,.3);color:var(--accent);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">✏️</button>
            <button onclick="ouvrirPopupCorbeille()" title="Corbeille" style="background:rgba(212,126,126,.12);border:1px solid rgba(212,126,126,.3);color:var(--danger);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">🗑</button>
          </div>
        </div>
        ${h.auteur_pseudo?`<div style="font-size:12px;color:var(--text3);margin-bottom:6px">par ${h.auteur_pseudo}</div>`:''}
        <span class="histoire-item-status ${h.statut==='en-cours'?'status-encours':h.statut==='pause'?'status-pause':h.statut==='termine'?'status-termine':'status-brouillon'}">${h.statut==='en-cours'?'En cours':h.statut==='pause'?'En pause':h.statut==='termine'?'Terminé':'Brouillon'}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
      <div style="background:rgba(126,159,212,.08);border:1px solid rgba(126,159,212,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--accent)">${(chaps||[]).length}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Chapitres</div>
      </div>
      <div style="background:rgba(126,212,160,.06);border:1px solid rgba(126,212,160,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--success)">${gratuits}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Gratuits</div>
      </div>
      <div style="background:rgba(167,143,212,.06);border:1px solid rgba(167,143,212,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--accent2)">${totalMots.toLocaleString('fr')}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Mots</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
      <div style="background:rgba(140,150,195,.06);border:1px solid var(--glass-border);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:600;color:var(--text)">0</div>
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">👁 Vues</div>
      </div>
      <div style="background:rgba(140,150,195,.06);border:1px solid var(--glass-border);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:600;color:var(--text)">0</div>
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">♡ J'aime</div>
      </div>
      <div style="background:rgba(140,150,195,.06);border:1px solid var(--glass-border);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:600;color:var(--text)">0</div>
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">💬 Commentaires</div>
      </div>
      <div style="background:rgba(140,150,195,.06);border:1px solid var(--glass-border);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:600;color:var(--text)">0</div>
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">⭐ Notes</div>
      </div>
    </div>
    ${tags.length?`<div style="margin-bottom:14px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Tags</div><div style="display:flex;flex-wrap:wrap;gap:6px">${tags.map(t=>`<span class="tag-chip">${t}</span>`).join('')}</div></div>`:''}
    ${tws.length?`<div style="margin-bottom:14px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Trigger warnings</div><div style="display:flex;flex-wrap:wrap;gap:6px">${tws.map(t=>`<span class="tag-chip" style="background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)">${t}</span>`).join('')}</div></div>`:''}
    ${h.resume?`<div style="margin-bottom:14px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Résumé</div><p style="font-size:12px;color:var(--text2);line-height:1.7">${h.resume}</p></div>`:''}
    <div style="margin-bottom:16px">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Chapitres</div>
      ${(chaps||[]).map((ch,i)=>`<div class="chapitre-item"><div class="ch-num">${ch.numero}</div><div class="ch-info"><div class="ch-title">${ch.titre}</div><div class="ch-meta">${ch.gratuit?'Gratuit':'Payant'} · ${ch.contenu?ch.contenu.trim().split(' ').length.toLocaleString('fr')+' mots':'vide'}</div></div><div style="display:flex;gap:4px"><button class="btn btn-sm" onclick="deplacerChapitre('${ch.id}','${h.id}',-1)" ${i===0?'disabled style="opacity:.3"':''}>▲</button><button class="btn btn-sm" onclick="deplacerChapitre('${ch.id}','${h.id}',1)" ${i===(chaps.length-1)?'disabled style="opacity:.3"':''}>▼</button><button class="btn btn-sm btn-accent" onclick="ouvrirEditionChapitreDepuisFiche('${ch.id}','${h.id}')">✏️</button><button class="btn btn-sm btn-danger" onclick="supprimerChapitreEtRecharger('${ch.id}','${h.id}')">Suppr.</button></div></div>`).join('')||'<p style="font-size:12px;color:var(--text3)">Aucun chapitre.</p>'}
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-full" onclick="cycleStatut('${h.id}','${h.statut}')" style="flex:1;background:rgba(180,190,230,.1);border-color:rgba(180,190,230,.2)">${h.statut==='en-cours'?'Mettre en brouillon':h.statut==='pause'?'Reprendre':h.statut==='termine'?'Reprendre':'Mettre en cours'}</button>
    </div>
    <div style="margin-top:10px">
      <button class="btn btn-full btn-danger" onclick="supprimerDefinitivementDepuisFiche('${h.id}')" style="opacity:.7;font-size:11px">🗑 Supprimer définitivement</button>
    </div>
  `;
}

/* ÉDITION HISTOIRE */
let _editTags=[];let _editTws=[];
async function ouvrirEditionHistoire(id){
  const h=histoires.find(x=>x.id===id);if(!h)return;
  const {data:htags}=await db.from('histoires_tags').select('tags(nom)').eq('histoire_id',id);
  const {data:htws}=await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id',id);
  _editTags=(htags||[]).map(t=>t.tags?.nom).filter(Boolean);
  _editTws=(htws||[]).map(t=>t.contenu);

  document.getElementById('detail-card').style.display='none';
  const editDiv=document.getElementById('edit-histoire-form');
  editDiv.style.display='block';

  // Pré-remplir
  document.getElementById('edit-titre').value=h.titre||'';
  document.getElementById('edit-resume').value=h.resume||'';
  document.getElementById('edit-gratuit').value=h.gratuit_jusqu_au||8;
  document.getElementById('edit-prix').value=h.prix_ticket||1;
  document.getElementById('edit-adulte-val').value=String(h.adulte||false);
  document.getElementById('edit-statut-val').value=h.statut||'brouillon';
  document.getElementById('edit-adulte-non').className='btn'+(h.adulte?'':' btn-accent');
  document.getElementById('edit-adulte-oui').className='btn'+(h.adulte?' btn-accent':'');
  ['brouillon','en-cours','pause','termine'].forEach(s=>{
    const btn=document.getElementById('edit-statut-'+s);
    if(btn) btn.className='btn'+(h.statut===s?' btn-accent':'');
  });
  // Options conditionnelles adulte
  document.getElementById('edit-options-adulte').style.display=h.adulte?'block':'none';
  document.getElementById('edit-options-non-adulte').style.display=h.adulte?'none':'block';
  setEditOption('edit-soft',String(h.version_soft||false));
  setEditOption('edit-moins18',String(h.adapte_moins18||false));
  setEditOption('edit-moins18b',String(h.adapte_moins18||false));
  setEditOption('edit-moins16',String(h.adapte_moins16||false));
  // Numérotation
  const num=h.numerotation||'arabe';
  document.getElementById('edit-numerotation-val').value=num;
  document.getElementById('edit-num-arabe').className='btn'+(num==='arabe'?' btn-accent':'');
  document.getElementById('edit-num-romain').className='btn'+(num==='romain'?' btn-accent':'');

  // Auteur dropdown
  await loadAuteursSelect();
  // Charger les auteurs depuis histoires_auteurs
  const {data:hAuteurs}=await db.from('histoires_auteurs').select('auteur_pseudo').eq('histoire_id',id);
  _editAuteurs=(hAuteurs||[]).map(a=>a.auteur_pseudo);
  if(!_editAuteurs.length && h.auteur_pseudo) _editAuteurs=[h.auteur_pseudo]; // rétrocompat
  renderAuteursChips('edit-auteurs-chips','_editAuteurs');

  renderEditTags();renderEditTws();
  await loadTagsSuggestions('edit');
  await loadTWSuggestions('edit');
}

function retourDepuisHistoire(){
  const editForm=document.getElementById('edit-histoire-form');
  if(editForm&&editForm.style.display!=='none'){
    // On est en mode édition → revenir sur la fiche
    fermerEditionHistoire();
  } else if(_retourAuteurId){
    // On est venu depuis une fiche auteur → y retourner
    document.getElementById('histoire-detail').style.display='none';
    document.getElementById('histoires-card').style.display='none';
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.querySelector('.tab[onclick*="\'auteurs\'"]').classList.add('active');
    document.getElementById('panel-auteurs').classList.add('active');
    document.getElementById('auteurs-card').style.display='none';
    document.getElementById('auteur-detail').style.display='block';
    _retourAuteurId=null;
  } else {
    // On est sur la fiche → revenir sur la liste
    document.getElementById('histoire-detail').style.display='none';
    document.getElementById('histoires-card').style.display='block';
    renderHistoiresList();
  }
}
function fermerEditionHistoire(){
  document.getElementById('edit-histoire-form').style.display='none';
  document.getElementById('histoires-card').style.display='none';
  document.getElementById('histoire-detail').style.display='block';
  document.getElementById('detail-card').style.display='block';
}

function renderEditTags(){
  const wrap=document.getElementById('edit-tags-wrap');
  const input=document.getElementById('edit-tags-input');
  wrap.innerHTML='';
  _editTags.forEach((t,i)=>{
    const chip=document.createElement('div');chip.className='tag-chip';
    chip.innerHTML=`${t}<button onclick="_editTags.splice(${i},1);renderEditTags()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function renderEditTws(){
  const wrap=document.getElementById('edit-tw-wrap');
  const input=document.getElementById('edit-tw-input');
  wrap.innerHTML='';
  _editTws.forEach((t,i)=>{
    const chip=document.createElement('div');chip.className='tag-chip';
    if(t==='Scène spicy'){
      chip.innerHTML=`🌶 ${t} <span style="font-size:9px;opacity:0.6;margin-left:2px">(auto)</span>`;
      chip.style.opacity='0.7';chip.title='Ajouté automatiquement';
    } else {
      chip.innerHTML=`${t}<button onclick="_editTws.splice(${i},1);renderEditTws()">×</button>`;
    }
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function handleEditTagInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const v=e.target.value.trim().replace(',','');
    if(v&&!_editTags.includes(v)){
      _editTags.push(v);renderEditTags();
      const btn=document.getElementById('edit-sug-tag-'+v.replace(/\s/g,'-'));
      if(btn)btn.classList.add('btn-accent');
    }
    e.target.value='';
    setTimeout(()=>document.getElementById('edit-tags-input').focus(),0);
  }
}
function handleEditTwInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const v=e.target.value.trim().replace(',','');
    if(v==='Scène spicy'){e.target.value='';return;} // bloqué, géré automatiquement
    if(v&&!_editTws.includes(v)){
      _editTws.push(v);renderEditTws();
      const btn=document.getElementById('edit-sug-tw-'+v.replace(/\s/g,'-'));
      if(btn)btn.classList.add('btn-accent');
    }
    e.target.value='';
    setTimeout(()=>document.getElementById('edit-tw-input').focus(),0);
  }
}

async function sauvegarderHistoire(){
  const id=currentDetailId;
  const titre=document.getElementById('edit-titre').value.trim();
  const resume=document.getElementById('edit-resume').value.trim();
  if(!titre){alert('Le titre est obligatoire.');return;}
  const btn=document.getElementById('edit-save-btn');
  btn.textContent='Sauvegarde…';btn.disabled=true;
  try{
    // Images
    let coverUrl=histoires.find(x=>x.id===id)?.cover_url||null;
    let bannerUrl=histoires.find(x=>x.id===id)?.banner_url||null;
    const coverFile=document.getElementById('edit-cover-input').files[0];
    const bannerFile=document.getElementById('edit-banner-input').files[0];
    if(coverFile)coverUrl=await uploadImage(coverFile,'covers');
    if(bannerFile)bannerUrl=await uploadImage(bannerFile,'banners');

    await db.from('histoires').update({
      titre,resume,cover_url:coverUrl,banner_url:bannerUrl,
      auteur_pseudo:_editAuteurs.length?_editAuteurs.join(', '):null,
      gratuit_jusqu_au:parseInt(document.getElementById('edit-gratuit').value)||8,
      prix_ticket:parseInt(document.getElementById('edit-prix').value)||1,
      adulte:document.getElementById('edit-adulte-val').value==='true',
      statut:document.getElementById('edit-statut-val').value,
      numerotation:document.getElementById('edit-numerotation-val').value||'arabe',
      version_soft:document.getElementById('edit-soft').value==='true',
      adapte_moins18:(document.getElementById('edit-adulte-val').value==='true'
        ?document.getElementById('edit-moins18').value==='true'
        :document.getElementById('edit-moins18b').value==='true'),
      adapte_moins16:document.getElementById('edit-moins16').value==='true',
    }).eq('id',id);

    // Tags — supprimer et recréer
    await db.from('histoires_tags').delete().eq('histoire_id',id);
    for(const tagNom of _editTags){
      let {data:tag}=await db.from('tags').select('id').eq('nom',tagNom).single();
      if(!tag){const {data:nt}=await db.from('tags').insert({nom:tagNom}).select().single();tag=nt;}
      if(tag)await db.from('histoires_tags').insert({histoire_id:id,tag_id:tag.id});
    }
    // Auteurs — supprimer et recréer
    await db.from('histoires_auteurs').delete().eq('histoire_id',id);
    for(const pseudo of _editAuteurs){
      await db.from('histoires_auteurs').insert({histoire_id:id,auteur_pseudo:pseudo});
    }

    // TW — supprimer et recréer
    await db.from('trigger_warnings_histoires').delete().eq('histoire_id',id);
    for(const tw of _editTws){
      await db.from('trigger_warnings_histoires').insert({histoire_id:id,contenu:tw});
    }

    await loadHistoires();
    fermerEditionHistoire();
    showHistoireDetail(id);
  }catch(e){alert('Erreur : '+e.message);}
  finally{btn.textContent='✦ Sauvegarder';btn.disabled=false;}
}

function setEditStatut(val){
  document.getElementById('edit-statut-val').value=val;
  ['brouillon','en-cours','pause','termine'].forEach(s=>{
    const btn=document.getElementById('edit-statut-'+s);
    if(btn) btn.className='btn'+(val===s?' btn-accent':'');
  });
}
function toggleAuteurEditDropdown(){
  const list=document.getElementById('auteur-edit-list');
  list.style.display=list.style.display==='none'?'block':'none';
}
function selectAuteurEdit(val,label){
  document.getElementById('n-auteur-edit').value=val;
  document.getElementById('auteur-edit-label').textContent=label||'— Choisir un·e auteur·ice —';
  document.getElementById('auteur-edit-label').style.color=val?'var(--text)':'var(--text3)';
  document.getElementById('auteur-edit-list').style.display='none';
}

async function toggleStatut(id,statut){
  const nouveau=statut==='en-cours'?'brouillon':'en-cours';
  await db.from('histoires').update({statut:nouveau}).eq('id',id);
  await loadHistoires();
  showHistoireDetail(id);
}

async function cycleStatut(id, statut){
  // brouillon -> en-cours -> pause -> termine
  const next = statut==='en-cours'?'brouillon':statut==='brouillon'?'en-cours':statut==='pause'?'en-cours':'en-cours';
  await db.from('histoires').update({statut:next}).eq('id',id);
  const h=histoires.find(x=>x.id===id);
  if(h){ h.statut=next; renderHistoires(); }
}

/* LOAD HISTOIRES SELECT */
async function loadHistoiresSelect(){
  const {data}=await db.from('histoires').select('id,titre').neq('corbeille',true).order('titre');
  const list=document.getElementById('histoire-select-list');
  if(!list)return;
  list.innerHTML=`<div class="custom-select-option" onclick="selectHistoire('','— Choisir une histoire —')">— Choisir une histoire —</div>`
    +(data||[]).map(h=>`<div class="custom-select-option" onclick="selectHistoire('${h.id}',this.textContent)">${h.titre}</div>`).join('');
}

function toggleHistoireDropdown(){
  const list=document.getElementById('histoire-select-list');
  list.style.display=list.style.display==='none'?'block':'none';
}

function selectHistoire(val,label){
  document.getElementById('ch-histoire').value=val;
  const labelEl=document.getElementById('histoire-select-label');
  labelEl.textContent=label;
  labelEl.style.color=val?'var(--text)':'var(--text3)';
  document.getElementById('histoire-select-list').style.display='none';
  if(val){
    loadChapitresExistants(val);
    setTimeout(loadChTwSuggestions,500);
    // Charger version_soft de l'histoire
    const h=histoires.find(x=>x.id===val);
    _histoireVersionSoft=h?h.version_soft||false:false;
    _softBlocsInit=false;
    // Réinitialiser spicy
    setChSpicy(false);
  } else {
    document.getElementById('chapitres-existants').style.display='none';
  }
}

document.addEventListener('click',e=>{
  const wrapH=document.getElementById('histoire-select-wrap');
  if(wrapH&&!wrapH.contains(e.target))document.getElementById('histoire-select-list').style.display='none';
  const wrapA=document.getElementById('auteur-select-wrap');
  if(wrapA&&!wrapA.contains(e.target))document.getElementById('auteur-select-list').style.display='none';
  const wrapE=document.getElementById('auteur-edit-wrap');
  if(wrapE&&!wrapE.contains(e.target))document.getElementById('auteur-edit-list').style.display='none';
});

async function loadChapitresExistants(histoireId){
  if(!histoireId){document.getElementById('chapitres-existants').style.display='none';return;}
  const {data}=await db.from('chapitres').select('*').eq('histoire_id',histoireId).order('numero');
  const section=document.getElementById('chapitres-existants');
  const list=document.getElementById('ch-list');
  if(!data||!data.length){
    section.style.display='none';
    document.getElementById('ch-num').value=1;
    setGratuit(true);return;
  }
  section.style.display='block';
  list.innerHTML=data.map((ch,i)=>`
    <div class="chapitre-item" id="chitem-${ch.id}">
      <div class="ch-num">${ch.numero}</div>
      <div class="ch-info">
        <div class="ch-title">${ch.titre}</div>
        <div class="ch-meta">${ch.gratuit?'Gratuit':'Payant'} · ${ch.contenu?ch.contenu.split(' ').length.toLocaleString('fr')+' mots':'vide'}</div>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        <button class="btn btn-sm" onclick="deplacerChapitre('${ch.id}','${histoireId}',-1)" ${i===0?'disabled style="opacity:.3"':''} title="Monter">▲</button>
        <button class="btn btn-sm" onclick="deplacerChapitre('${ch.id}','${histoireId}',1)" ${i===data.length-1?'disabled style="opacity:.3"':''} title="Descendre">▼</button>
        <button class="btn btn-sm btn-accent" onclick="ouvrirEditionChapitre('${ch.id}','${histoireId}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="supprimerChapitre('${ch.id}','${histoireId}')">Suppr.</button>
      </div>
    </div>
  `).join('');
  const nextNum=(Math.max(...data.map(c=>c.numero))+1)||1;
  document.getElementById('ch-num').value=nextNum;
  const histoire=histoires.find(h=>h.id===histoireId);
  const seuil=histoire?.gratuit_jusqu_au||8;
  setGratuit(nextNum<=seuil);
}

/* DÉPLACER CHAPITRE */
async function deplacerChapitre(id, histoireId, direction){
  const {data}=await db.from('chapitres').select('*').eq('histoire_id',histoireId).order('numero');
  const idx=data.findIndex(c=>c.id===id);
  const swapIdx=idx+direction;
  if(swapIdx<0||swapIdx>=data.length)return;
  const numA=data[idx].numero;
  const numB=data[swapIdx].numero;
  await db.from('chapitres').update({numero:numB}).eq('id',data[idx].id);
  await db.from('chapitres').update({numero:numA}).eq('id',data[swapIdx].id);
  loadChapitresExistants(histoireId);
}

/* ÉDITION CHAPITRE */
let _editChapId=null;let _editChapHistoireId=null;
async function ouvrirEditionChapitre(id, histoireId){
  _editChapDepuisFiche=false;
  _editChapId=id;_editChapHistoireId=histoireId;
  const {data:ch}=await db.from('chapitres').select('*').eq('id',id).single();
  if(!ch)return;
  document.getElementById('edit-chap-num').value=ch.numero;
  document.getElementById('edit-chap-titre').value=ch.titre||'';
  document.getElementById('edit-chap-citation').value=ch.citation||'';
  document.getElementById('edit-chap-citation-auteur').value=ch.citation_auteur||'';
  initBlocs(ch.contenu||'','edit-ch-blocs');
  document.getElementById('edit-chap-wordcount').textContent=(ch.contenu?ch.contenu.trim().split(/\s+/).filter(w=>w).length.toLocaleString('fr'):0)+' mots';
  document.getElementById('edit-chap-gratuit-val').value=String(ch.gratuit);
  document.getElementById('edit-chap-gratuit').className='btn'+(ch.gratuit?' btn-accent':'');
  document.getElementById('edit-chap-payant').className='btn'+(ch.gratuit?'':' btn-accent');
  document.getElementById('edit-chap-date-publication').value=ch.date_publication?_isoToDatetimeLocal(ch.date_publication):'';
  // Spicy
  const h=histoires.find(x=>x.id===(_editChapHistoireId||id));
  _histoireVersionSoft=h?h.version_soft||false:false;
  _editSoftBlocsInit=!!ch.contenu_soft;
  setEditChapSpicy(ch.spicy||false);
  if(ch.contenu_soft)initBlocs(ch.contenu_soft,'edit-ch-soft-blocs');
  // TW du chapitre
  _editChTws = ch.tw ? ch.tw.split(',').map(t=>t.trim()).filter(Boolean) : [];
  renderEditChTws();
  loadChTwSuggestions();
  document.getElementById('chapitres-existants').style.display='none';
  // Musique actuelle
  const _editMusiqueUrl = ch.musique_url || null;
  document.getElementById('edit-chap-musique-url').value = _editMusiqueUrl || '';
  const _editMusiqueActuelle = document.getElementById('edit-chap-musique-actuelle');
  if (_editMusiqueActuelle) {
    if (_editMusiqueUrl) { _editMusiqueActuelle.textContent = '🎵 Musique actuelle : ' + _editMusiqueUrl.split('/').pop(); _editMusiqueActuelle.style.display = 'block'; }
    else { _editMusiqueActuelle.style.display = 'none'; }
  }
  const _editMusiqueFile = document.getElementById('edit-chap-musique-file');
  if (_editMusiqueFile) _editMusiqueFile.value = '';
  const _editMusiquePreview = document.getElementById('edit-chap-musique-preview');
  if (_editMusiquePreview) _editMusiquePreview.style.display = 'none';
  document.getElementById('edit-chapitre-form').style.display='block';
}

function setEditChapGratuit(val){
  document.getElementById('edit-chap-gratuit-val').value=String(val);
  document.getElementById('edit-chap-gratuit').className='btn'+(val?' btn-accent':'');
  document.getElementById('edit-chap-payant').className='btn'+(val?'':' btn-accent');
}

async function sauvegarderChapitre(){
  if(!_editChapId)return;
  const titre=document.getElementById('edit-chap-titre').value.trim();
  const contenu=compileBlocsToContenu('edit-ch-blocs').trim();
  const numero=parseInt(document.getElementById('edit-chap-num').value);
  const gratuit=document.getElementById('edit-chap-gratuit-val').value==='true';
  const citation=document.getElementById('edit-chap-citation').value.trim()||null;
  const citationAuteur=document.getElementById('edit-chap-citation-auteur').value.trim()||null;
  const spicy=document.getElementById('edit-chap-spicy').value==='true';
  const contenuSoft=spicy&&_histoireVersionSoft?compileBlocsToContenu('edit-ch-soft-blocs').trim()||null:null;
  const _editDateVal=document.getElementById('edit-chap-date-publication').value;
  const editDatePub=_editDateVal?new Date(_editDateVal).toISOString():null;
  if(!titre||!contenu){showAlert('chapitre','Le titre et le contenu sont obligatoires.','error');return;}
  const btn=document.getElementById('edit-chap-save-btn');
  btn.textContent='Sauvegarde…';btn.disabled=true;
  try{
    const twChapStr = _editChTws.length ? _editChTws.join(', ') : null;
    // Musique : uploader si nouveau fichier, sinon garder l'URL existante
    const _editMusiqueNewFile = document.getElementById('edit-chap-musique-file')?.files[0] || null;
    let _editMusiqueUrl = document.getElementById('edit-chap-musique-url')?.value || null;
    if (_editMusiqueNewFile) { try { _editMusiqueUrl = await uploadAudio(_editMusiqueNewFile, 'musiques'); } catch(e) { showAlert('chapitre', 'Erreur upload musique : ' + e.message, 'error'); btn.disabled=false; btn.textContent='✦ Sauvegarder'; return; } }
    await db.from('chapitres').update({titre,contenu,numero,gratuit,citation,citation_auteur:citationAuteur,spicy,contenu_soft:contenuSoft,date_publication:editDatePub,tw:twChapStr,musique_url:_editMusiqueUrl||null}).eq('id',_editChapId);
    showAlert('chapitre','Chapitre modifié avec succès ! ✦');
    fermerEditionChapitre();
    loadChapitresExistants(_editChapHistoireId);
  }catch(e){showAlert('chapitre','Erreur : '+e.message,'error');}
  finally{btn.textContent='✦ Sauvegarder';btn.disabled=false;}
}

/* AJOUTER CHAPITRE */
async function ajouterChapitre(){
  const histoireId=document.getElementById('ch-histoire').value;
  const num=parseInt(document.getElementById('ch-num').value);
  const titre=document.getElementById('ch-titre').value.trim();
  const contenu=compileBlocsToContenu().trim();
  const citation=document.getElementById('ch-citation').value.trim()||null;
  const citationAuteur=document.getElementById('ch-citation-auteur').value.trim()||null;
  const spicy=document.getElementById('ch-spicy').value==='true';
  const contenuSoft=spicy&&_histoireVersionSoft?compileBlocsToContenu('ch-soft-blocs').trim()||null:null;
  const gratuit=document.getElementById('ch-gratuit').value==='true'||document.getElementById('ch-gratuit').value===true;
  const _chDateVal=document.getElementById('ch-date-publication').value;
  const datePub=_chDateVal?new Date(_chDateVal).toISOString():null;
  const _chMusiqueFile=document.getElementById('ch-musique-file')?.files[0]||null;
  if(!histoireId||!titre||!contenu){showAlert('chapitre','L\'histoire, le titre et le contenu sont obligatoires.','error');return;}
  const btn=document.querySelector('#panel-chapitre .btn-accent');
  btn.textContent='Publication…';btn.disabled=true;
  try{
    const twChapStr = chTws.length ? chTws.join(', ') : null;
    let _chMusiqueUrl=null;
    if(_chMusiqueFile){try{_chMusiqueUrl=await uploadAudio(_chMusiqueFile,'musiques');}catch(e){showAlert('chapitre','Erreur upload musique : '+e.message,'error');return;}}
    const {error}=await db.from('chapitres').insert({histoire_id:histoireId,numero:num,titre,contenu,gratuit,citation,citation_auteur:citationAuteur,spicy,contenu_soft:contenuSoft,date_publication:datePub,tw:twChapStr,musique_url:_chMusiqueUrl});
    if(error)throw error;
    // Ajouter les TW du chapitre à l'histoire si pas déjà présents
    if(chTws.length>0){
      const {data:existants}=await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id',histoireId);
      const existantsVals=(existants||[]).map(t=>t.contenu);
      for(const tw of chTws){
        if(!existantsVals.includes(tw)){
          await db.from('trigger_warnings_histoires').insert({histoire_id:histoireId,contenu:tw});
        }
      }
    }
    showAlert('chapitre','Chapitre publié avec succès ! ✦');
    document.getElementById('ch-titre').value='';
    document.getElementById('ch-citation').value='';
    document.getElementById('ch-citation-auteur').value='';
    document.getElementById('ch-date-publication').value='';
    setChSpicy(false);
    _softBlocsInit=false;
    initBlocs('','ch-blocs');
    document.getElementById('ch-wordcount').textContent='0 mots';
    chTws=[];renderChTws();
    loadChapitresExistants(histoireId);
  }catch(e){
    showAlert('chapitre','Erreur : '+e.message,'error');
  }finally{
    btn.textContent='✦ Publier le chapitre';btn.disabled=false;
  }
}

async function ouvrirEditionChapitreDepuisFiche(id, histoireId){
  _editChapDepuisFiche=true;
  _editChapId=id;_editChapHistoireId=histoireId;
  const {data:ch}=await db.from('chapitres').select('*').eq('id',id).single();
  if(!ch)return;
  // Basculer vers l'onglet chapitre
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelector('.tab[onclick*="\'chapitre\'"]').classList.add('active');
  document.getElementById('panel-chapitre').classList.add('active');
  document.getElementById('histoire-detail').style.display='none';
  document.getElementById('histoires-card').style.display='block';
  // Pré-remplir
  await loadHistoiresSelect();
  selectHistoire(histoireId, histoires.find(h=>h.id===histoireId)?.titre||'');
  document.getElementById('edit-chap-num').value=ch.numero;
  document.getElementById('edit-chap-titre').value=ch.titre||'';
  document.getElementById('edit-chap-citation').value=ch.citation||'';
  document.getElementById('edit-chap-citation-auteur').value=ch.citation_auteur||'';
  initBlocs(ch.contenu||'','edit-ch-blocs');
  document.getElementById('edit-chap-wordcount').textContent=(ch.contenu?ch.contenu.trim().split(/\s+/).filter(w=>w).length.toLocaleString('fr'):0)+' mots';
  document.getElementById('edit-chap-gratuit-val').value=String(ch.gratuit);
  document.getElementById('edit-chap-gratuit').className='btn'+(ch.gratuit?' btn-accent':'');
  document.getElementById('edit-chap-payant').className='btn'+(ch.gratuit?'':' btn-accent');
  document.getElementById('edit-chap-date-publication').value=ch.date_publication?_isoToDatetimeLocal(ch.date_publication):'';
  // Spicy
  const hh=histoires.find(x=>x.id===histoireId);
  _histoireVersionSoft=hh?hh.version_soft||false:false;
  _editSoftBlocsInit=!!ch.contenu_soft;
  setEditChapSpicy(ch.spicy||false);
  if(ch.contenu_soft)initBlocs(ch.contenu_soft,'edit-ch-soft-blocs');
  document.getElementById('chapitres-existants').style.display='none';
  // Musique actuelle
  const _editMusiqueUrl2 = ch.musique_url || null;
  document.getElementById('edit-chap-musique-url').value = _editMusiqueUrl2 || '';
  const _editMusiqueActuelle2 = document.getElementById('edit-chap-musique-actuelle');
  if (_editMusiqueActuelle2) {
    if (_editMusiqueUrl2) { _editMusiqueActuelle2.textContent = '🎵 Musique actuelle : ' + _editMusiqueUrl2.split('/').pop(); _editMusiqueActuelle2.style.display = 'block'; }
    else { _editMusiqueActuelle2.style.display = 'none'; }
  }
  const _editMusiqueFile2 = document.getElementById('edit-chap-musique-file');
  if (_editMusiqueFile2) _editMusiqueFile2.value = '';
  const _editMusiquePreview2 = document.getElementById('edit-chap-musique-preview');
  if (_editMusiquePreview2) _editMusiquePreview2.style.display = 'none';
  document.getElementById('edit-chapitre-form').style.display='block';
}

// Compteur mots édition chapitre
document.addEventListener('input',e=>{
  if(e.target.id==='edit-chap-contenu'){
    const words=e.target.value.trim().split(/\s+/).filter(w=>w).length;
    document.getElementById('edit-chap-wordcount').textContent=words.toLocaleString('fr')+' mots';
  }
});

async function supprimerChapitreEtRecharger(id,histoireId){
  if(!confirm('Supprimer ce chapitre ?'))return;
  await db.from('chapitres').delete().eq('id',id);
  showHistoireDetail(histoireId);
}

async function supprimerChapitre(id,histoireId){
  if(!confirm('Supprimer ce chapitre ?'))return;
  await db.from('chapitres').delete().eq('id',id);
  loadChapitresExistants(histoireId);
  showAlert('chapitre','Chapitre supprimé.');
}

async function supprimerDefinitivementDepuisFiche(id){
  if(!confirm('Supprimer définitivement cette histoire et tous ses chapitres ? Cette action est irréversible.'))return;
  await db.from('trigger_warnings_histoires').delete().eq('histoire_id',id);
  await db.from('histoires_tags').delete().eq('histoire_id',id);
  await db.from('chapitres').delete().eq('histoire_id',id);
  await db.from('histoires').delete().eq('id',id);
  await loadHistoires();
  document.getElementById('histoire-detail').style.display='none';
  document.getElementById('histoires-card').style.display='block';
  renderHistoiresList();
}

/* GESTION TAGS & TW */
let _selectedTags=new Set();
let _selectedTWs=new Set();
let _supprType=null;

async function loadTagsGestion(){
  const {data}=await db.from('tags').select('id,nom,ordre').order('ordre',{ascending:true,nullsFirst:false});
  const list=document.getElementById('tags-gestion-list');
  if(!list)return;
  _selectedTags.clear();
  document.getElementById('btn-suppr-tags').style.display='none';
  if(!data||!data.length){list.innerHTML='<div style="font-size:12px;color:var(--text3)">Aucun tag pour l\'instant.</div>';return;}
  // Dédupliquer et trier par ordre
  const sorted=[...data].sort((a,b)=>(a.ordre??999)-(b.ordre??999));
  window._tagOrdreList=sorted;
  list.innerHTML=sorted.map((t,i)=>`
    <div class="histoire-item" style="padding:10px 14px;gap:10px">
      <input type="checkbox" id="ck-tag-${t.id}" onchange="toggleSelectTag('${t.id}')" style="width:16px;height:16px;cursor:pointer;accent-color:var(--accent);flex-shrink:0">
      <div class="histoire-item-info"><div class="histoire-item-title" style="font-size:13px">✦ ${t.nom}</div></div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn btn-sm" onclick="deplacerTag(${i},-1)" ${i===0?'disabled style="opacity:.3"':''}>▲</button>
        <button class="btn btn-sm" onclick="deplacerTag(${i},1)" ${i===sorted.length-1?'disabled style="opacity:.3"':''}>▼</button>
      </div>
    </div>`).join('');
}

async function deplacerTag(idx, direction){
  const list=window._tagOrdreList;
  if(!list)return;
  const swapIdx=idx+direction;
  if(swapIdx<0||swapIdx>=list.length)return;
  await db.from('tags').update({ordre:swapIdx}).eq('id',list[idx].id);
  await db.from('tags').update({ordre:idx}).eq('id',list[swapIdx].id);
  await loadTagsGestion();
}

async function loadTWsGestion(){
  const {data}=await db.from('trigger_warnings').select('id,contenu,ordre').is('histoire_id',null).order('contenu',{ascending:true});
  const list=document.getElementById('tw-gestion-list');
  if(!list)return;
  _selectedTWs.clear();
  document.getElementById('btn-suppr-tws').style.display='none';
  if(!data||!data.length){list.innerHTML='<div style="font-size:12px;color:var(--text3)">Aucun trigger warning pour l\'instant.</div>';return;}
  window._twOrdreList=data;
  list.innerHTML=data.map((t,i)=>`
    <div class="histoire-item" style="padding:10px 14px;gap:10px">
      <input type="checkbox" id="ck-tw-${t.id}" onchange="toggleSelectTW('${t.contenu.replace(/'/g,"\'")}')" style="width:16px;height:16px;cursor:pointer;accent-color:var(--accent2);flex-shrink:0">
      <div class="histoire-item-info"><div class="histoire-item-title" style="font-size:13px;color:var(--accent2)">✦ ${t.contenu}${t.contenu==='Scène spicy'?' <span style="font-size:10px;opacity:0.5">(auto)</span>':''}</div></div>
    </div>`).join('');
}

async function deplacerTW(idx, direction){
  // Déplacement désactivé
}

function toggleSelectTag(id){
  if(_selectedTags.has(id))_selectedTags.delete(id);
  else _selectedTags.add(id);
  document.getElementById('btn-suppr-tags').style.display=_selectedTags.size>0?'inline-flex':'none';
}
function toggleSelectTW(val){
  if(_selectedTWs.has(val))_selectedTWs.delete(val);
  else _selectedTWs.add(val);
  document.getElementById('btn-suppr-tws').style.display=_selectedTWs.size>0?'inline-flex':'none';
}

function ouvrirPopupSupprMultiple(type){
  _supprType=type;
  const n=type==='tag'?_selectedTags.size:_selectedTWs.size;
  document.getElementById('popup-suppr-titre').textContent=`Supprimer ${n} ${type==='tag'?'tag(s)':'trigger warning(s)'} ?`;
  document.getElementById('popup-suppr-desc').textContent='Cette action est irréversible. '+(type==='tag'?'Les tags seront retirés de toutes les histoires.':'Les TW seront retirés de toutes les histoires et chapitres.');
  document.getElementById('popup-suppr-multiple').style.display='flex';
}
function fermerPopupSupprMultiple(){
  document.getElementById('popup-suppr-multiple').style.display='none';
  _supprType=null;
}
async function confirmerSupprMultiple(){
  if(_supprType==='tag'){
    for(const id of _selectedTags){
      await db.from('histoires_tags').delete().eq('tag_id',id);
      await db.from('tags').delete().eq('id',id);
    }
    _selectedTags.clear();
    loadTagsGestion();
    loadTagsSuggestions();
    showAlert('tags',`Tags supprimés ! ✦`);
  } else {
    for(const val of _selectedTWs){
      // Supprimer de la table des TW d'histoires
      await db.from('trigger_warnings').delete().is('histoire_id',null).eq('contenu',val);
      // Nettoyer dans les chapitres (tw est une chaîne CSV)
      const {data:chaps}=await db.from('chapitres').select('id,tw').not('tw','is',null);
      if(chaps){
        for(const chap of chaps){
          if(!chap.tw)continue;
          const twList=chap.tw.split(',').map(t=>t.trim()).filter(t=>t&&t!==val);
          await db.from('chapitres').update({tw:twList.length?twList.join(', '):null}).eq('id',chap.id);
        }
      }
    }
    _selectedTWs.clear();
    loadTWsGestion();
    loadTWSuggestions();
    showAlert('tags','Trigger warnings supprimés ! ✦');
  }
  fermerPopupSupprMultiple();
}

async function ajouterTag(){
  const nom=document.getElementById('new-tag-input').value.trim();
  if(!nom){showAlert('tags','Le nom du tag est obligatoire.','error');return;}
  const {error}=await db.from('tags').insert({nom});
  if(error){showAlert('tags','Erreur : '+error.message,'error');return;}
  document.getElementById('new-tag-input').value='';
  showAlert('tags','Tag ajouté ! ✦');
  loadTagsGestion();
  loadTagsSuggestions();
}

async function ajouterTW(){
  const nom=document.getElementById('new-tw-input').value.trim();
  if(!nom){showAlert('tags','Le nom du TW est obligatoire.','error');return;}
  if(nom==='Scène spicy'){showAlert('tags','Ce TW est géré automatiquement.','error');return;}
  const {data:existing}=await db.from('trigger_warnings').select('id').is('histoire_id',null).eq('contenu',nom).limit(1);
  if(existing&&existing.length){showAlert('tags','Ce TW existe déjà.','error');return;}
  const {error}=await db.from('trigger_warnings').insert({contenu:nom,histoire_id:null});
  if(error){showAlert('tags','Erreur : '+error.message,'error');return;}
  showAlert('tags','TW ajouté ! ✦');
  document.getElementById('new-tw-input').value='';
  loadTWsGestion();
  loadTWSuggestions();
}

/* TW CHAPITRE */
let _editChTws = [];

function handleEditChTwInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_editChTws.includes(v)) { _editChTws.push(v); renderEditChTws(); }
  e.target.value = '';
}
function renderEditChTws() {
  const wrap = document.getElementById('edit-ch-tw-wrap');
  const input = document.getElementById('edit-ch-tw-input');
  if (!wrap || !input) return;
  wrap.innerHTML = '';
  _editChTws.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML = t + '<button onclick="_editChTws.splice('+i+',1);renderEditChTws()">×</button>';
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}

function toggleEditChTwSug(val) {
  if (_editChTws.includes(val)) _editChTws.splice(_editChTws.indexOf(val),1);
  else _editChTws.push(val);
  renderEditChTws(); loadChTwSuggestions();
}

let chTws=[];
function handleChTwInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const v=e.target.value.trim().replace(',','');
    if(v&&!chTws.includes(v)){chTws.push(v);renderChTws();}
    e.target.value='';
    setTimeout(()=>document.getElementById('ch-tw-input').focus(),0);
  }
}
function renderChTws(){
  const wrap=document.getElementById('ch-tw-wrap');
  const input=document.getElementById('ch-tw-input');
  wrap.innerHTML='';
  chTws.forEach((t,i)=>{
    const chip=document.createElement('div');chip.className='tag-chip';
    chip.style.cssText='background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML=`${t}<button onclick="chTws.splice(${i},1);renderChTws()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
async function loadChTwSuggestions(){
  const {data}=await db.from('trigger_warnings_histoires').select('contenu,ordre').order('ordre',{ascending:true});
  const seen=new Map();
  (data||[]).forEach(t=>{ if(!seen.has(t.contenu)||t.ordre<seen.get(t.contenu)){seen.set(t.contenu,t.ordre||0);} });
  const uniq=[...seen.keys()];
  // Suggestions ajout chapitre
  const container=document.getElementById('ch-tw-suggestions');
  const label=document.getElementById('ch-tw-suggestions-label');
  if(container){
    if(!uniq.length){if(label)label.style.display='none';container.innerHTML='';}
    else{
      if(label)label.style.display='block';
      container.innerHTML=uniq.map(t=>`<button class="btn btn-sm ${chTws.includes(t)?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleChTwSuggestion('${t.replace(/'/g,"\\'")}')" id="sug-chtw-${t.replace(/\s/g,'-')}">✦ ${t}</button>`).join('');
    }
  }
  // Suggestions édition chapitre
  const containerEdit=document.getElementById('edit-ch-tw-suggestions');
  const labelEdit=document.getElementById('edit-ch-tw-suggestions-label');
  if(containerEdit){
    if(!uniq.length){if(labelEdit)labelEdit.style.display='none';containerEdit.innerHTML='';}
    else{
      if(labelEdit)labelEdit.style.display='block';
      containerEdit.innerHTML=uniq.map(t=>`<button class="btn btn-sm ${_editChTws.includes(t)?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEditChTwSug('${t.replace(/'/g,"\\'")}')" id="edit-sug-chtw-${t.replace(/\s/g,'-')}">✦ ${t}</button>`).join('');
    }
  }
}
function toggleChTwSuggestion(val){
  if(chTws.includes(val)){chTws.splice(chTws.indexOf(val),1);}
  else{chTws.push(val);}
  renderChTws();
  loadChTwSuggestions();
}

/* SUGGESTIONS TAGS & TW */
async function loadTagsSuggestions(){
  const {data}=await db.from('tags').select('nom').order('nom');
  // Suggestions création
  const container=document.getElementById('tags-suggestions');
  const label=document.getElementById('tags-suggestions-label');
  if(container){
    if(!data||!data.length){if(label)label.style.display='none';container.innerHTML='';}
    else{
      if(label)label.style.display='block';
      container.innerHTML=(data||[]).map(t=>`<button class="btn btn-sm ${tags.includes(t.nom)?'btn-accent':''}" style="font-size:11px" onclick="toggleSuggestion('${t.nom}','tag')" id="sug-tag-${t.nom.replace(/\s/g,'-')}">✦ ${t.nom}</button>`).join('');
    }
  }
  // Suggestions audio
  const containerAudio=document.getElementById('audio-tags-suggestions');
  const labelAudio=document.getElementById('audio-tags-suggestions-label');
  if(containerAudio){
    if(!data||!data.length){if(labelAudio)labelAudio.style.display='none';containerAudio.innerHTML='';}
    else{
      if(labelAudio)labelAudio.style.display='block';
      containerAudio.innerHTML=(data||[]).map(t=>`<button class="btn btn-sm ${_audioTags.includes(t.nom)?'btn-accent':''}" style="font-size:11px" onclick="toggleAudioTagSuggestion('${t.nom.replace(/'/g,"\\'")}')">✦ ${t.nom}</button>`).join('');
    }
  }

  // Suggestions édition
  const containerEdit=document.getElementById('edit-tags-suggestions');
  const labelEdit=document.getElementById('edit-tags-suggestions-label');
  if(containerEdit){
    if(!data||!data.length){if(labelEdit)labelEdit.style.display='none';containerEdit.innerHTML='';}
    else{
      if(labelEdit)labelEdit.style.display='block';
      containerEdit.innerHTML=(data||[]).map(t=>`<button class="btn btn-sm ${_editTags.includes(t.nom)?'btn-accent':''}" style="font-size:11px" onclick="toggleEditSuggestion('${t.nom}','tag')" id="edit-sug-tag-${t.nom.replace(/\s/g,'-')}">✦ ${t.nom}</button>`).join('');
    }
  }
}

async function loadTWSuggestions(){
  const {data}=await db.from('trigger_warnings').select('contenu').is('histoire_id',null).order('contenu',{ascending:true});
  const uniq=(data||[]).map(t=>t.contenu).filter(Boolean);
  // Suggestions création
  const container=document.getElementById('tw-suggestions');
  const label=document.getElementById('tw-suggestions-label');
  if(container){
    if(!uniq.length){if(label)label.style.display='none';container.innerHTML='';}
    else{
      if(label)label.style.display='block';
      container.innerHTML=uniq.map(t=>{
        if(t==='Scène spicy') return `<button class="btn btn-sm" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2);opacity:0.5;cursor:default" title="Ajouté automatiquement quand contenu adulte est coché">🌶 Scène spicy (auto)</button>`;
        return `<button class="btn btn-sm ${tws.includes(t)?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleSuggestion('${t}','tw')" id="sug-tw-${t.replace(/\s/g,'-')}">✦ ${t}</button>`;
      }).join('');
    }
  }
  // Suggestions audio
  const containerAudioTW=document.getElementById('audio-tw-suggestions');
  const labelAudioTW=document.getElementById('audio-tw-suggestions-label');

  const twBtns = uniq.map(t=>{
    if(t==='Scène spicy') return `<button class="btn btn-sm" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2);opacity:0.5;cursor:default" title="Ajouté automatiquement quand contenu adulte est coché">🌶 Scène spicy (auto)</button>`;
    return `<button class="btn btn-sm ${(typeof _audioTws !== 'undefined' && _audioTws.includes(t))?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleAudioTWSuggestion('${t.replace(/'/g,"\\'")}')">✦ ${t}</button>`;
  }).join('');
  if(containerAudioTW){
    if(!uniq.length){if(labelAudioTW)labelAudioTW.style.display='none';containerAudioTW.innerHTML='';}
    else{if(labelAudioTW)labelAudioTW.style.display='block';containerAudioTW.innerHTML=twBtns;}
  }

  // Suggestions édition
  const containerEdit=document.getElementById('edit-tw-suggestions');
  const labelEdit=document.getElementById('edit-tw-suggestions-label');
  if(containerEdit){
    if(!uniq.length){if(labelEdit)labelEdit.style.display='none';containerEdit.innerHTML='';}
    else{
      if(labelEdit)labelEdit.style.display='block';
      containerEdit.innerHTML=uniq.map(t=>{
        if(t==='Scène spicy') return `<button class="btn btn-sm" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2);opacity:0.5;cursor:default" title="Ajouté automatiquement quand contenu adulte est coché">🌶 Scène spicy (auto)</button>`;
        return `<button class="btn btn-sm ${_editTws.includes(t)?'btn-accent':''}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEditSuggestion('${t}','tw')" id="edit-sug-tw-${t.replace(/\s/g,'-')}">✦ ${t}</button>`;
      }).join('');
    }
  }
}

function toggleEditSuggestion(val,type){
  const arr=type==='tag'?_editTags:_editTws;
  const btnId='edit-sug-'+type+'-'+val.replace(/\s/g,'-');
  const btn=document.getElementById(btnId);
  if(arr.includes(val)){
    arr.splice(arr.indexOf(val),1);
    if(btn)btn.classList.remove('btn-accent');
  } else {
    arr.push(val);
    if(btn)btn.classList.add('btn-accent');
    // Si on ajoute "Scène spicy" manuellement → passer en adulte automatiquement
    if(type==='tw'&&val==='Scène spicy') setEditAdulte(true);
  }
  type==='tag'?renderEditTags():renderEditTws();
}

function toggleSuggestion(val,type){
  const arr=type==='tag'?tags:tws;
  const btnId='sug-'+type+'-'+val.replace(/\s/g,'-');
  const btn=document.getElementById(btnId);
  if(arr.includes(val)){
    const idx=arr.indexOf(val);arr.splice(idx,1);
    if(btn)btn.classList.remove('btn-accent');
  } else {
    arr.push(val);
    if(btn)btn.classList.add('btn-accent');
    // Si on ajoute "Scène spicy" manuellement → passer en adulte automatiquement
    if(type==='tw'&&val==='Scène spicy') setAdulte(true);
  }
  type==='tag'?renderTags():renderTWs();
}




let currentAuteurId=null;
function fermerAuteurDetail(){
  document.getElementById('auteur-detail').style.display='none';
  document.getElementById('auteurs-card').style.display='block';
  currentAuteurId=null;
}
function retourDepuisAuteur(){
  const editForm=document.getElementById('edit-auteur-form');
  if(editForm&&editForm.style.display!=='none'){
    fermerEditionAuteur();
  } else {
    fermerAuteurDetail();
  }
}

async function showAuteurDetail(id){
  currentAuteurId=id;
  const {data:a}=await db.from('auteurs').select('*').eq('id',id).single();
  if(!a)return;
  const {data:hists}=await db.from('histoires').select('id,titre,statut,cover_url').eq('auteur_pseudo',a.pseudo).order('created_at',{ascending:false});
  const {data:allChaps}=await db.from('chapitres').select('id,histoire_id,contenu');
  const histIds=(hists||[]).map(h=>h.id);
  const chapsAuteur=(allChaps||[]).filter(ch=>histIds.includes(ch.histoire_id));
  const nbPubliees=(hists||[]).filter(h=>h.statut==='en-cours').length;
  const totalMots=chapsAuteur.reduce((acc,ch)=>acc+(ch.contenu?ch.contenu.trim().split(' ').length:0),0);

  document.getElementById('auteurs-card').style.display='none';
  document.getElementById('auteur-detail').style.display='block';
  document.getElementById('auteur-detail-card').innerHTML=`
    <div style="text-align:center;padding:8px 0 20px;position:relative">
      <div style="position:absolute;top:0;right:0;display:flex;gap:6px">
        <button onclick="ouvrirEditionAuteur('${a.id}')" title="Modifier" style="background:rgba(126,159,212,.12);border:1px solid rgba(126,159,212,.3);color:var(--accent);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">✏️</button>
        <button onclick="ouvrirPopupSupprimerAuteur()" title="Supprimer" style="background:rgba(212,126,126,.12);border:1px solid rgba(212,126,126,.3);color:var(--danger);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">🗑</button>
      </div>
      ${a.photo_url?`<img src="${a.photo_url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid rgba(167,143,212,.3);margin-bottom:10px">`:`<div style="font-size:40px;margin-bottom:10px">✍</div>`}
      <div style="font-family:'Cormorant Garamond',serif;font-size:24px;margin-bottom:4px">${a.pseudo}</div>
      ${a.nom_reel?`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">${a.nom_reel}</div>`:''}
      ${a.bio?`<p style="font-size:12px;color:var(--text2);line-height:1.7;font-style:italic;max-width:360px;margin:0 auto">${a.bio}</p>`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div style="background:rgba(126,159,212,.08);border:1px solid rgba(126,159,212,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--accent)">${(hists||[]).length}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Histoires</div>
      </div>
      <div style="background:rgba(126,212,160,.06);border:1px solid rgba(126,212,160,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--success)">${nbPubliees}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">En cours</div>
      </div>
      <div style="background:rgba(167,143,212,.06);border:1px solid rgba(167,143,212,.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--accent2)">${totalMots.toLocaleString('fr')}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Mots</div>
      </div>
    </div>
    ${(hists||[]).length?`
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Histoires</div>
      ${(hists||[]).map(h=>`
        <div class="histoire-item" style="cursor:pointer" onclick="ouvrirHistoireDepuisAuteur('${h.id}','${a.id}')">
          <div class="histoire-item-cover">${h.cover_url?`<img src="${h.cover_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`:'📖'}</div>
          <div class="histoire-item-info">
            <div class="histoire-item-title">${h.titre}</div>
            <div class="histoire-item-meta" style="display:flex;gap:10px;margin-top:4px">
              <span title="Chapitres">📖 ${(allChaps||[]).filter(ch=>ch.histoire_id===h.id).length}</span>
              <span title="Vues">👁 0</span>
              <span title="J'aime">♡ 0</span>
              <span title="Commentaires">💬 0</span>
            </div>
          </div>
          <span class="histoire-item-status ${h.statut==='en-cours'?'status-encours':h.statut==='pause'?'status-pause':h.statut==='termine'?'status-termine':'status-brouillon'}">${h.statut==='en-cours'?'En cours':h.statut==='pause'?'En pause':h.statut==='termine'?'Terminé':'Brouillon'}</span>
        </div>`).join('')}`
    :'<p style="font-size:12px;color:var(--text3)">Aucune histoire pour l\'instant.</p>'}
  `;
}

/* NAVIGATION AUTEUR → HISTOIRE */
let _retourAuteurId=null;
async function ouvrirHistoireDepuisAuteur(histoireId, auteurId){
  _retourAuteurId=auteurId;
  await loadHistoires();
  // Basculer sur le panel histoires pour que histoire-detail soit visible
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelector('.tab[onclick*="\'histoires\'"]').classList.add('active');
  document.getElementById('panel-histoires').classList.add('active');
  document.getElementById('histoires-card').style.display='none';
  document.getElementById('histoire-detail').style.display='block';
  await showHistoireDetail(histoireId);
}


async function ouvrirEditionAuteur(id){
  const {data:a}=await db.from('auteurs').select('*').eq('id',id).single();
  if(!a)return;
  document.getElementById('auteur-detail-card').style.display='none';
  document.getElementById('edit-auteur-form').style.display='block';
  document.getElementById('edit-a-pseudo').value=a.pseudo||'';
  document.getElementById('edit-a-nom').value=a.nom_reel||'';
  document.getElementById('edit-a-bio').value=a.bio||'';
  document.getElementById('edit-a-pseudo-astrolabe').value=a.pseudo_astrolabe||'';
  if(a.photo_url){
    document.getElementById('edit-a-photo-preview').src=a.photo_url;
    document.getElementById('edit-a-photo-preview').style.display='block';
  } else {
    document.getElementById('edit-a-photo-preview').style.display='none';
  }
  document.getElementById('edit-a-instagram').value=a.instagram||'';
  document.getElementById('edit-a-twitter').value=a.twitter||'';
  document.getElementById('edit-a-tiktok').value=a.tiktok||'';
  document.getElementById('edit-a-site-web').value=a.site_web||'';
}

function fermerEditionAuteur(){
  document.getElementById('edit-auteur-form').style.display='none';
  document.getElementById('auteur-detail-card').style.display='block';
}

async function sauvegarderAuteur(){
  const id=currentAuteurId;
  const pseudo=document.getElementById('edit-a-pseudo').value.trim();
  if(!pseudo){alert('Le nom de plume est obligatoire.');return;}
  const btn=document.getElementById('edit-a-save-btn');
  btn.textContent='Sauvegarde…';btn.disabled=true;
  try{
    let photoUrl=null;
    const photoFile=document.getElementById('edit-a-photo-input').files[0];
    if(photoFile){photoUrl=await uploadImage(photoFile,'auteurs');}
    else{
      const {data:current}=await db.from('auteurs').select('photo_url').eq('id',id).single();
      photoUrl=current?.photo_url||null;
    }
    await db.from('auteurs').update({
      pseudo,
      nom_reel:document.getElementById('edit-a-nom').value.trim()||null,
      bio:document.getElementById('edit-a-bio').value.trim()||null,
      photo_url:photoUrl,
      instagram:document.getElementById('edit-a-instagram').value.trim()||null,
      twitter:document.getElementById('edit-a-twitter').value.trim()||null,
      tiktok:document.getElementById('edit-a-tiktok').value.trim()||null,
      site_web:document.getElementById('edit-a-site-web').value.trim()||null,
    }).eq('id',id);
    await loadAuteurs();
    await loadAuteursSelect();
    fermerEditionAuteur();
    showAuteurDetail(id);
  }catch(e){alert('Erreur : '+e.message);}
  finally{btn.textContent='✦ Sauvegarder';btn.disabled=false;}
}

let _auteursSelectionnes=[];
let _editAuteurs=[];

function renderAuteursChips(wrapId, arrayRef){
  const arr=arrayRef==='_auteursSelectionnes'?_auteursSelectionnes:_editAuteurs;
  const wrap=document.getElementById(wrapId);
  if(!wrap)return;
  wrap.innerHTML=arr.map((p,i)=>
    `<div class="tag-chip">${p}<button onclick="${arrayRef}.splice(${i},1);renderAuteursChips('${wrapId}','${arrayRef}')">×</button></div>`
  ).join('');
}

async function loadAuteursSelect(){
  const {data}=await db.from('auteurs').select('id,pseudo').order('pseudo');
  auteurs=data||[];
  const list=document.getElementById('auteur-select-list');
  if(list){
    list.innerHTML=auteurs.map(a=>
      `<div class="custom-select-option" onclick="ajouterAuteur('${a.pseudo}')">${a.pseudo}</div>`
    ).join('');
  }
  const listEdit=document.getElementById('auteur-edit-list');
  if(listEdit){
    listEdit.innerHTML=auteurs.map(a=>
      `<div class="custom-select-option" onclick="ajouterAuteurEdit('${a.pseudo}')">${a.pseudo}</div>`
    ).join('');
  }
}

function ajouterAuteur(pseudo){
  if(!_auteursSelectionnes.includes(pseudo)) _auteursSelectionnes.push(pseudo);
  renderAuteursChips('n-auteurs-chips','_auteursSelectionnes');
  document.getElementById('auteur-select-list').style.display='none';
}

function ajouterAuteurEdit(pseudo){
  if(!_editAuteurs.includes(pseudo)) _editAuteurs.push(pseudo);
  renderAuteursChips('edit-auteurs-chips','_editAuteurs');
  document.getElementById('auteur-edit-list').style.display='none';
}

function toggleAuteurDropdown(){
  const list=document.getElementById('auteur-select-list');
  list.style.display=list.style.display==='none'?'block':'none';
}

function selectAuteur(val,label){
  if(val)ajouterAuteur(val);
}



async function loadAuteurs(){
  const {data}=await db.from('auteurs').select('*').order('pseudo');
  const list=document.getElementById('auteurs-list');
  if(!data||!data.length){list.innerHTML='<div class="loading">Aucun·e auteur·ice pour l\'instant.</div>';return;}
  const {data:hists}=await db.from('histoires').select('auteur_pseudo');
  list.innerHTML=data.map(a=>{
    const nbH=(hists||[]).filter(h=>h.auteur_pseudo===a.pseudo).length;
    return`<div class="histoire-item" style="cursor:pointer" onclick="showAuteurDetail('${a.id}')">
      <div class="histoire-item-cover" style="font-size:20px;background:rgba(167,143,212,.1);display:flex;align-items:center;justify-content:center;overflow:hidden">${a.photo_url?`<img src="${a.photo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`:'✍'}</div>
      <div class="histoire-item-info">
        <div class="histoire-item-title">${a.pseudo}</div>
        <div class="histoire-item-meta">${a.nom_reel?'('+a.nom_reel+') · ':''}<strong>${nbH}</strong> histoire(s)</div>
        ${a.bio?`<div class="histoire-item-meta" style="margin-top:2px;font-style:italic">${a.bio.substring(0,60)}${a.bio.length>60?'…':''}</div>`:''}
      </div>
    </div>`;
  }).join('');
}




let _auteurASupprimer=null;
function ouvrirPopupSupprimerAuteur(){
  _auteurASupprimer=currentAuteurId;
  document.getElementById('popup-supprimer-auteur').style.display='flex';
}
function fermerPopupSupprimerAuteur(){
  document.getElementById('popup-supprimer-auteur').style.display='none';
  _auteurASupprimer=null;
}
async function confirmerSupprimerAuteur(){
  if(!_auteurASupprimer)return;
  await db.from('auteurs').delete().eq('id',_auteurASupprimer);
  fermerPopupSupprimerAuteur();
  fermerAuteurDetail();
  loadAuteurs();
  loadAuteursSelect();
}

async function creerAuteur(){
  const pseudo=document.getElementById('a-pseudo').value.trim();
  const nom=document.getElementById('a-nom').value.trim();
  const bio=document.getElementById('a-bio').value.trim();
  if(!pseudo){showAlert('nouvel-auteur','Le nom de plume est obligatoire.','error');return;}
  const btn=document.querySelector('#panel-nouvel-auteur .btn-accent');
  btn.textContent='Création…';btn.disabled=true;
  try{
    let photoUrl=null;
    const photoFile=document.getElementById('auteur-photo-input').files[0];
    if(photoFile)photoUrl=await uploadImage(photoFile,'auteurs');
    const {error}=await db.from('auteurs').insert({pseudo,nom_reel:nom||null,bio:bio||null,photo_url:photoUrl});
    if(error)throw error;
    showAlert('nouvel-auteur','Auteur·ice ajouté·e avec succès ! ✦');
    document.getElementById('a-pseudo').value='';
    document.getElementById('a-nom').value='';
    document.getElementById('a-bio').value='';
    document.getElementById('auteur-photo-preview').style.display='none';
    document.getElementById('auteur-photo-input').value='';
    document.getElementById('auteur-photo-remove').style.display='none';
    loadAuteursSelect();
    setTimeout(()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.querySelector('.tab[onclick*="\'auteurs\'"]').classList.add('active');
      document.getElementById('panel-auteurs').classList.add('active');
      loadAuteurs();
    },1200);
  }catch(e){showAlert('nouvel-auteur','Erreur : '+e.message,'error');}
  finally{btn.textContent='✦ Ajouter l\'auteur·ice';btn.disabled=false;}
}

async function supprimerAuteur(id){
  await db.from('auteurs').delete().eq('id',id);
  loadAuteurs();loadAuteursSelect();
}

/* TOGGLE BUTTONS */
function setAdulte(val){
  document.getElementById('n-adulte').value=String(val);
  document.getElementById('adulte-non').className='btn'+(val?'':' btn-accent');
  document.getElementById('adulte-oui').className='btn'+(val?' btn-accent':'');
  document.getElementById('n-options-adulte').style.display=val?'block':'none';
  document.getElementById('n-options-non-adulte').style.display=val?'none':'block';
  // Initialiser à Oui par défaut
  if(val) setOption('n-moins18','true');
  else { setOption('n-moins16','true'); setOption('n-moins18b','true'); }
  if(!val)setOption('n-soft','false');
  // Ajouter/retirer automatiquement "Scène spicy"
  const idx=tws.indexOf('Scène spicy');
  if(val&&idx===-1){tws.unshift('Scène spicy');renderTWs();}
  else if(!val&&idx>-1){tws.splice(idx,1);renderTWs();}
}
function setEditAdulte(val){
  document.getElementById('edit-adulte-val').value=String(val);
  document.getElementById('edit-adulte-non').className='btn'+(val?'':' btn-accent');
  document.getElementById('edit-adulte-oui').className='btn'+(val?' btn-accent':'');
  document.getElementById('edit-options-adulte').style.display=val?'block':'none';
  document.getElementById('edit-options-non-adulte').style.display=val?'none':'block';
  if(!val)setEditOption('edit-soft','false');
  // Ajouter/retirer automatiquement "Scène spicy"
  const idx=_editTws.indexOf('Scène spicy');
  if(val&&idx===-1){_editTws.unshift('Scène spicy');renderEditTws();}
  else if(!val&&idx>-1){_editTws.splice(idx,1);renderEditTws();}
}
function setOption(id,val){
  document.getElementById(id).value=val;
  document.getElementById(id+'-non').className='btn'+(val==='false'?' btn-accent':'');
  document.getElementById(id+'-oui').className='btn'+(val==='true'?' btn-accent':'');
  // Si c'est le bouton soft, afficher/cacher -18
  if(id==='n-soft'){
    const wrap=document.getElementById('n-moins18-wrap');
    if(wrap)wrap.style.display=val==='true'?'block':'none';
  }
}
function setEditOption(id,val){
  document.getElementById(id).value=val;
  document.getElementById(id+'-non').className='btn'+(val==='false'?' btn-accent':'');
  document.getElementById(id+'-oui').className='btn'+(val==='true'?' btn-accent':'');
  if(id==='edit-soft'){
    const wrap=document.getElementById('edit-moins18-wrap');
    if(wrap)wrap.style.display=val==='true'?'block':'none';
  }
}
function setStatut(val){
  document.getElementById('n-statut').value=val;
  ['brouillon','en-cours','pause','termine'].forEach(s=>{
    const btn=document.getElementById('statut-'+s);
    if(btn) btn.className='btn'+(val===s?' btn-accent':'');
  });
}
function setChSpicy(val){
  document.getElementById('ch-spicy').value=String(val);
  document.getElementById('ch-spicy-non').className='btn'+(val?'':' btn-accent');
  document.getElementById('ch-spicy-oui').className='btn'+(val?' btn-accent':'');
  // Afficher version soft seulement si l'histoire a version_soft activée
  const softWrap=document.getElementById('ch-soft-wrap');
  if(softWrap)softWrap.style.display=(val&&_histoireVersionSoft)?'block':'none';
  if(val&&_histoireVersionSoft&&!_softBlocsInit){
    initBlocs('','ch-soft-blocs');
    _softBlocsInit=true;
  }
}
function setEditChapSpicy(val){
  document.getElementById('edit-chap-spicy').value=String(val);
  document.getElementById('edit-chap-spicy-non').className='btn'+(val?'':' btn-accent');
  document.getElementById('edit-chap-spicy-oui').className='btn'+(val?' btn-accent':'');
  const softWrap=document.getElementById('edit-chap-soft-wrap');
  if(softWrap)softWrap.style.display=(val&&_histoireVersionSoft)?'block':'none';
  if(val&&_histoireVersionSoft&&!_editSoftBlocsInit){
    initBlocs('','edit-ch-soft-blocs');
    _editSoftBlocsInit=true;
  }
}
let _histoireVersionSoft=false;
let _softBlocsInit=false;
let _editSoftBlocsInit=false;

function setGratuit(val){
  document.getElementById('ch-gratuit').value=String(val);
  document.getElementById('gratuit-gratuit').className='btn'+(val?' btn-accent':'');
  document.getElementById('gratuit-payant').className='btn'+(val?'':' btn-accent');
}
function fermerEditionChapitre(){
  document.getElementById('edit-chapitre-form').style.display='none';
  _editChapId=null;
  if(_editChapDepuisFiche){
    // Revenir sur la fiche histoire
    _editChapDepuisFiche=false;
    showHistoireDetail(currentDetailId);
    // S'assurer qu'on est sur l'onglet histoires
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.querySelector('.tab[onclick*="histoires"]').classList.add('active');
    document.getElementById('panel-histoires').classList.add('active');
  } else {
    document.getElementById('chapitres-existants').style.display='block';
  }
}
let _editChapDepuisFiche=false;
function setNumerotation(val){
  document.getElementById('n-numerotation').value=val;
  document.getElementById('num-arabe').className='btn'+(val==='arabe'?' btn-accent':'');
  document.getElementById('num-romain').className='btn'+(val==='romain'?' btn-accent':'');
}
function setEditNumerotation(val){
  document.getElementById('edit-numerotation-val').value=val;
  document.getElementById('edit-num-arabe').className='btn'+(val==='arabe'?' btn-accent':'');
  document.getElementById('edit-num-romain').className='btn'+(val==='romain'?' btn-accent':'');
}

/* CHIFFRES ROMAINS */
function toRoman(num){
  const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result='';
  for(let i=0;i<vals.length;i++){
    while(num>=vals[i]){result+=syms[i];num-=vals[i];}
  }
  return result;
}

/* ══════════════════════════════════════════════════════
   BANNIÈRES
   ══════════════════════════════════════════════════════ */

function toggleBanDropdown(which) {
  const el = document.getElementById('ban-dropdown-' + which);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.ban-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

function toggleBanDropdown_id(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.ban-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.ban-dropdown')) {
    document.querySelectorAll('.ban-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

function banPickType(el) {
  const value = el.dataset.value;
  const label = el.textContent.trim();
  document.getElementById('ban-type-lien').value = value;
  document.getElementById('ban-type-label').textContent = label;
  document.querySelectorAll('#ban-dropdown-type-menu .ban-dropdown-item')
    .forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('ban-dropdown-type').classList.remove('open');
  // Afficher/masquer les blocs
  document.getElementById('ban-lien-histoire').style.display  = (value === 'histoire' || value === 'chapitre') ? 'block' : 'none';
  document.getElementById('ban-lien-chapitre').style.display  = value === 'chapitre' ? 'block' : 'none';
  document.getElementById('ban-lien-interne').style.display   = value === 'interne'  ? 'block' : 'none';
  document.getElementById('ban-lien-externe').style.display   = value === 'externe'  ? 'block' : 'none';
}

function banPickHistoire(el) {
  document.getElementById('ban-histoire-select').value = el.dataset.id;
  document.getElementById('ban-histoire-label').textContent = el.textContent.trim();
  document.querySelectorAll('#ban-dropdown-histoire-menu .ban-dropdown-item')
    .forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('ban-dropdown-histoire').classList.remove('open');
}

function banPickInterne(el) {
  document.getElementById('ban-interne-select').value = el.dataset.value;
  document.getElementById('ban-interne-label').textContent = el.textContent.trim();
  document.querySelectorAll('#ban-dropdown-interne-menu .ban-dropdown-item')
    .forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('ban-dropdown-interne').classList.remove('open');
}

// Pages connues — ajoute ici toute nouvelle page créée
const BAN_PAGES_CONNUES = [
  { id: 'p-main',            label: 'Accueil' },
  { id: 'p-search',          label: 'Recherche' },
  { id: 'p-hashtag',         label: 'Hashtags' },
  { id: 'p-inscription1',    label: 'Inscription' },
  { id: 'p-connexion-modal', label: 'Connexion' },
  { id: 'p-moncompte',       label: 'Mon compte' },
  { id: 'p-mentions-legales',label: 'Mentions légales' },
  { id: 'p-acheter-tickets', label: 'Acheter des tickets' },
];

function initBanPages() {
  const liste = document.getElementById('ban-pages-liste');
  if (liste) {
    liste.innerHTML = BAN_PAGES_CONNUES
      .map(p => `<span style="cursor:pointer;margin-right:10px" onclick="document.getElementById('ban-interne-select').value='${p.id}';filterBanPages('${p.id}')">${p.id}</span>`)
      .join('');
  }
}

function filterBanPages(val) {
  const suggestionsEl = document.getElementById('ban-pages-suggestions');
  if (!suggestionsEl) return;
  const q = val.trim().toLowerCase();
  if (!q) { suggestionsEl.classList.remove('open'); return; }
  const matches = BAN_PAGES_CONNUES.filter(p =>
    p.id.includes(q) || p.label.toLowerCase().includes(q)
  );
  if (!matches.length) { suggestionsEl.classList.remove('open'); return; }
  suggestionsEl.innerHTML = matches.map(p =>
    `<div class="ban-pages-suggestion-item" onclick="document.getElementById('ban-interne-select').value='${p.id}';document.getElementById('ban-pages-suggestions').classList.remove('open')">${p.id} <span style="color:var(--text3);font-size:11px">— ${p.label}</span></div>`
  ).join('');
  suggestionsEl.classList.add('open');
}

// Fermer les suggestions si clic dehors
document.addEventListener('click', e => {
  if (!e.target.closest('#ban-lien-interne')) {
    document.getElementById('ban-pages-suggestions')?.classList.remove('open');
  }
});

// Alias gardés pour compatibilité
function setBanType(value, label) {}
function setBanHistoire(value, label) {}
function toggleBanLien() {}

async function loadHistoiresSelectBan() {
  const menu = document.getElementById('ban-dropdown-histoire-menu');
  if (!menu || menu.children.length > 0) return;
  const { data } = await db.from('histoires').select('id, titre').order('titre');
  if (!data) return;
  menu.innerHTML = data.map(h =>
    `<div class="ban-dropdown-item" data-id="${h.id}" onclick="banPickHistoire(this)">${h.titre}</div>`
  ).join('');
}

// Prévisualisation image avant upload
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('ban-image-input');
  if (input) {
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const preview = document.getElementById('ban-image-preview');
      const img = document.getElementById('ban-preview-img');
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; preview.style.display = 'block'; };
      reader.readAsDataURL(file);
    });
  }
});

async function ajouterBanniere() {
  const alertEl = document.getElementById('alert-bannieres');
  alertEl.textContent = '';
  alertEl.className = 'alert';

  const fileInput = document.getElementById('ban-image-input');
  const typeLien = document.getElementById('ban-type-lien').value;
  const ordre = parseInt(document.getElementById('ban-ordre').value) || 0;

  if (!fileInput.files[0]) {
    alertEl.textContent = 'Choisis une image.';
    alertEl.className = 'alert alert-error';
    return;
  }

  const file = fileInput.files[0];
  if (file.size > 10 * 1024 * 1024) {
    alertEl.textContent = 'Image trop lourde (max 10 Mo).';
    alertEl.className = 'alert alert-error';
    alertEl.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const btn = document.querySelector('#panel-bannieres .btn-accent');
  btn.disabled = true; btn.textContent = 'Upload en cours…';

  // Utiliser la même fonction uploadImage que le reste de l'admin
  let imageUrl;
  try {
    imageUrl = await uploadImage(file, 'bannieres');
  } catch(e) {
    alertEl.textContent = 'Erreur upload : ' + e.message;
    alertEl.className = 'alert alert-error';
    btn.disabled = false; btn.textContent = '✦ Ajouter la bannière';
    return;
  }

  // Construire le lien selon le type
  let lien = null;
  let histoireId = null;
  let chapitreNum = null;

  if (typeLien === 'histoire') {
    histoireId = document.getElementById('ban-histoire-select').value || null;
    lien = histoireId;
  } else if (typeLien === 'chapitre') {
    histoireId = document.getElementById('ban-histoire-select').value || null;
    chapitreNum = parseInt(document.getElementById('ban-chapitre-num').value) || null;
    lien = histoireId;
  } else if (typeLien === 'interne') {
    lien = document.getElementById('ban-interne-select').value || null;
  } else if (typeLien === 'externe') {
    lien = document.getElementById('ban-url-input').value.trim() || null;
  }

  const { error } = await db.from('bannieres').insert({
    image_url: imageUrl,
    lien,
    type_lien: typeLien || null,
    histoire_id: histoireId,
    chapitre_num: chapitreNum,
    ordre,
    actif: true
  });

  btn.disabled = false; btn.textContent = '✦ Ajouter la bannière';

  if (error) {
    alertEl.textContent = 'Erreur : ' + error.message;
    alertEl.className = 'alert alert-error';
    return;
  }

  alertEl.textContent = '✦ Bannière ajoutée !';
  alertEl.className = 'alert alert-success';

  // Reset formulaire
  fileInput.value = '';
  document.getElementById('ban-image-preview').style.display = 'none';
  document.getElementById('ban-type-lien').value = '';
  document.getElementById('ban-type-label').textContent = 'Aucun lien';
  document.getElementById('ban-histoire-select').value = '';
  document.getElementById('ban-histoire-label').textContent = '— Choisir une histoire —';
  document.getElementById('ban-interne-select').value = '';
  const interneInput = document.getElementById('ban-interne-select');
  if (interneInput) interneInput.value = '';
  document.getElementById('ban-ordre').value = '0';
  // Masquer tous les blocs de lien
  ['ban-lien-histoire','ban-lien-chapitre','ban-lien-interne','ban-lien-externe']
    .forEach(id => document.getElementById(id).style.display = 'none');

  loadBannieresAdmin();
}

async function loadBannieresAdmin() {
  const liste = document.getElementById('ban-liste');
  if (!liste) return;
  liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Chargement…</div>';

  const { data, error } = await db.from('bannieres').select('*').order('ordre');

  if (error || !data || !data.length) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucune bannière pour l\'instant.</div>';
    return;
  }

  // Ordre par défaut = max + 1
  const maxOrdre = Math.max(...data.map(b => b.ordre || 0));
  const banOrdreInput = document.getElementById('ban-ordre');
  if (banOrdreInput && !window._editBanniereId) banOrdreInput.value = String(maxOrdre + 1);


  liste.innerHTML = data.map(b => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--glass-border)">
      <img src="${b.image_url}" style="width:80px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:var(--text2);margin-bottom:4px">
          ${b.type_lien === 'histoire' ? '→ Histoire' : b.type_lien === 'chapitre' ? '→ Chapitre ' + b.chapitre_num : b.type_lien === 'externe' ? '→ ' + (b.lien||'') : 'Aucun lien'}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-size:11px;color:var(--text3)">Ordre</label>
          <input type="number" value="${b.ordre}" min="0"
            style="width:52px;background:var(--glass);border:1px solid var(--glass-border);border-radius:6px;padding:3px 6px;color:var(--text);font-size:12px;font-family:'Jost',sans-serif"
            onchange="majOrdreBanniere('${b.id}', this.value)">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <div style="display:flex;align-items:center;gap:7px">
          <span id="ban-actif-label-${b.id}" style="font-size:11px;color:var(--text2);font-family:'Jost',sans-serif">${b.actif ? 'Active' : 'Inactive'}</span>
          <label class="tgl">
            <input type="checkbox" ${b.actif ? 'checked' : ''} onchange="toggleActifBanniere('${b.id}', this.checked)">
            <div class="tgl-track"></div>
            <div class="tgl-thumb"></div>
          </label>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="ouvrirEditionBanniere('${b.id}')"
            style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
            Modifier
          </button>
          <button onclick="supprimerBanniere('${b.id}', '${b.image_url}')"
            style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function ouvrirEditionBanniere(id) {
  const { data: b } = await db.from('bannieres').select('*').eq('id', id).single();
  if (!b) return;

  // Stocker l'id en cours d'édition
  window._editBanniereId = id;

  // Pré-remplir le formulaire existant
  document.getElementById('ban-ordre').value = b.ordre || 0;
  const _typeLien = b.type_lien || '';
  document.getElementById('ban-type-lien').value = _typeLien;
  // Mettre à jour le label et afficher le bon bloc
  const _typeLabels = {'histoire':'→ Page d\'une histoire','chapitre':'→ Chapitre spécifique','interne':'→ Page du site','externe':'→ URL externe','':"Aucun lien"};
  document.getElementById('ban-type-label').textContent = _typeLabels[_typeLien] || 'Aucun lien';
  document.getElementById('ban-lien-histoire').style.display = (_typeLien==='histoire'||_typeLien==='chapitre')?'block':'none';
  document.getElementById('ban-lien-chapitre').style.display = _typeLien==='chapitre'?'block':'none';
  document.getElementById('ban-lien-interne').style.display  = _typeLien==='interne'?'block':'none';
  document.getElementById('ban-lien-externe').style.display  = _typeLien==='externe'?'block':'none';

  if (b.type_lien === 'histoire' || b.type_lien === 'chapitre') {
    if (b.histoire_id) {
      document.getElementById('ban-histoire-select').value = b.histoire_id;
      const h = histoires.find(x => x.id === b.histoire_id);
      if (h) document.getElementById('ban-histoire-label').textContent = h.titre;
    }
    if (b.type_lien === 'chapitre' && b.chapitre_num) {
      document.getElementById('ban-chapitre-num').value = b.chapitre_num;
    }
  } else if (b.type_lien === 'externe') {
    document.getElementById('ban-url-input').value = b.lien || '';
  }

  // Changer le bouton en mode édition
  const btn = document.getElementById('ban-submit-btn');
  if (btn) { btn.textContent = '✦ Sauvegarder les modifications'; btn.onclick = () => sauvegarderBanniere(); }
  const annulerBtn = document.getElementById('ban-annuler-btn');
  if (annulerBtn) annulerBtn.style.display = 'block';

  // Scroll vers le formulaire
  document.getElementById('ban-ordre').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showAlert('bannieres', 'Tu modifies une bannière existante — change ce que tu veux puis sauvegarde.', 'success');
}

function annulerEditionBanniere() {
  window._editBanniereId = null;
  const btn = document.getElementById('ban-submit-btn');
  if (btn) { btn.textContent = '✦ Ajouter la bannière'; btn.onclick = () => ajouterBanniere(); }
  const annulerBtn = document.getElementById('ban-annuler-btn');
  if (annulerBtn) annulerBtn.style.display = 'none';
}

async function sauvegarderBanniere() {
  const id = window._editBanniereId;
  if (!id) return;

  const typeLien = document.getElementById('ban-type-lien').value;
  const ordre = parseInt(document.getElementById('ban-ordre').value) || 0;
  let lien = null, histoireId = null, chapitreNum = null;

  if (typeLien === 'histoire') {
    histoireId = document.getElementById('ban-histoire-select').value || null;
    lien = histoireId;
  } else if (typeLien === 'chapitre') {
    histoireId = document.getElementById('ban-histoire-select').value || null;
    chapitreNum = parseInt(document.getElementById('ban-chapitre-num').value) || null;
    lien = histoireId;
  } else if (typeLien === 'interne') {
    lien = document.getElementById('ban-interne-select').value || null;
  } else if (typeLien === 'externe') {
    lien = document.getElementById('ban-url-input').value.trim() || null;
  }

  // Nouvelle image si sélectionnée
  const fileInput = document.getElementById('ban-image-input');
  let imageUrl = null;
  if (fileInput.files[0]) {
    try { imageUrl = await uploadImage(fileInput.files[0], 'bannieres'); }
    catch(e) { showAlert('bannieres', 'Erreur upload : ' + e.message, 'error'); return; }
  }

  const updateData = { lien, type_lien: typeLien || null, histoire_id: histoireId, chapitre_num: chapitreNum, ordre };
  if (imageUrl) updateData.image_url = imageUrl;

  const { error } = await db.from('bannieres').update(updateData).eq('id', id);
  if (error) { showAlert('bannieres', 'Erreur : ' + error.message, 'error'); return; }

  // Réinitialiser le formulaire et le bouton
  annulerEditionBanniere();
  fileInput.value = '';
  document.getElementById('ban-image-preview').style.display = 'none';

  showAlert('bannieres', '✦ Bannière modifiée !');
  loadBannieresAdmin();
}

async function majOrdreBanniere(id, ordre) {
  await db.from('bannieres').update({ ordre: parseInt(ordre) || 0 }).eq('id', id);
}

async function toggleActifBanniere(id, actif) {
  await db.from('bannieres').update({ actif }).eq('id', id);
  const label = document.getElementById('ban-actif-label-' + id);
  if (label) label.textContent = actif ? 'Active' : 'Inactive';
}

async function supprimerBanniere(id, imageUrl) {
  if (!confirm('Supprimer cette bannière définitivement ?')) return;

  // Supprimer le fichier du Storage (bucket Images, dossier bannieres)
  const fileName = imageUrl.split('/').pop();
  await db.storage.from('Images').remove(['bannieres/' + fileName]).catch(() => {});

  // Supprimer la ligne en base
  await db.from('bannieres').delete().eq('id', id);
  loadBannieresAdmin();
}

/* ══════════════════════════════════════════════════════
   BD — FONCTIONS ADMIN
   ══════════════════════════════════════════════════════ */

let _bdCoverFile = null;
let _bdBannerFile = null;

function bdPreviewCover(input) {
  _bdCoverFile = input.files[0];
  const zone = document.getElementById('bd-cover-zone');
  if (_bdCoverFile) {
    const url = URL.createObjectURL(_bdCoverFile);
    zone.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><input type="file" accept="image/*" onchange="bdPreviewCover(this)" style="position:absolute;inset:0;opacity:0;cursor:pointer">`;
  }
}

function bdPreviewBanner(input) {
  _bdBannerFile = input.files[0];
  const zone = document.getElementById('bd-banner-zone');
  if (_bdBannerFile) {
    const url = URL.createObjectURL(_bdBannerFile);
    zone.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><input type="file" accept="image/*" onchange="bdPreviewBanner(this)" style="position:absolute;inset:0;opacity:0;cursor:pointer">`;
  }
}

async function creerHistoireBD() {
  const alertEl = document.getElementById('alert-bd');
  alertEl.textContent = ''; alertEl.className = 'alert';

  const titre = document.getElementById('bd-titre').value.trim();
  const auteurId = document.getElementById('bd-auteur').value;
  const resume = document.getElementById('bd-resume').value.trim();
  const gratuitJusquau = parseInt(document.getElementById('bd-gratuit').value) || 2;

  if (!titre) { alertEl.textContent = 'Le titre est obligatoire.'; alertEl.className = 'alert alert-error'; return; }

  const btn = document.getElementById('bd-creer-btn');
  btn.disabled = true; btn.textContent = 'Création en cours…';

  let coverUrl = null, bannerUrl = null;
  try {
    if (_bdCoverFile) coverUrl = await uploadImage(_bdCoverFile, 'covers');
    if (_bdBannerFile) bannerUrl = await uploadImage(_bdBannerFile, 'banners');
  } catch(e) {
    alertEl.textContent = 'Erreur upload image : ' + e.message;
    alertEl.className = 'alert alert-error';
    btn.disabled = false; btn.textContent = '✦ Créer la BD';
    return;
  }

  const auteurPseudo = document.getElementById('bd-auteur-label')?.textContent || '';

  const _bdAgeVal = document.getElementById('bd-age-val').value;
  const { data, error } = await db.from('histoires').insert({
    titre, resume, cover_url: coverUrl, banner_url: bannerUrl,
    auteur_pseudo: (auteurPseudo === '— Aucun·e —' || auteurPseudo === '— Choisir un·e auteur·ice —') ? '' : auteurPseudo,
    format: 'bd',
    statut: document.getElementById('bd-statut').value || 'en-cours',
    gratuit_jusqu_au: gratuitJusquau,
    adulte: _bdAgeVal === 'adulte',
    adapte_moins18: _bdAgeVal === 'moins18' || _bdAgeVal === 'adulte',
    adapte_moins16: _bdAgeVal === 'tout',
  }).select().single();

  btn.disabled = false; btn.textContent = '✦ Créer la BD';

  if (error) { alertEl.textContent = 'Erreur : ' + error.message; alertEl.className = 'alert alert-error'; return; }

  // Sauvegarder tags
  for (const tagNom of _bdTags) {
    let { data: tag } = await db.from('tags').select('id').eq('nom', tagNom).single();
    if (!tag) { const { data: nt } = await db.from('tags').insert({ nom: tagNom }).select().single(); tag = nt; }
    if (tag) await db.from('histoires_tags').insert({ histoire_id: data.id, tag_id: tag.id });
  }
  // Sauvegarder TW
  for (const tw of _bdTws) {
    await db.from('trigger_warnings_histoires').insert({ histoire_id: data.id, contenu: tw });
  }
  alertEl.textContent = '✦ BD créée avec succès !'; alertEl.className = 'alert alert-success';
  document.getElementById('bd-titre').value = '';
  document.getElementById('bd-resume').value = '';
  _bdCoverFile = null; _bdBannerFile = null;
  _bdTags = []; _bdTws = []; renderBDTags(); renderBDTws();
  setBDStatut('en-cours'); setBDAge('tout');
  loadBDHistoiresSelect();
}

async function loadBDTagsSuggestions() {
  const { data: allTags } = await db.from('tags').select('nom').order('nom');
  const { data: allTws } = await db.from('trigger_warnings_histoires').select('contenu');
  const uniqTws = [...new Set((allTws||[]).map(t=>t.contenu))];
  const sugT = document.getElementById('bd-tags-suggestions');
  if (sugT) sugT.innerHTML = (allTags||[]).map(function(t) {
    var cls = _bdTags.includes(t.nom) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var safe = t.nom.replace(/"/g,'&quot;');
    return '<button class="'+cls+'" style="font-size:11px" onclick="toggleBDTagSug(\'' + safe + '\')">&#10022; ' + t.nom + '</button>';
  }).join('');
  const sugW = document.getElementById('bd-tw-suggestions');
  if (sugW) sugW.innerHTML = uniqTws.map(function(t) {
    var cls = _bdTws.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var safe = t.replace(/"/g,'&quot;');
    return '<button class="'+cls+'" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleBDTwSug(\'' + safe + '\')">&#10022; ' + t + '</button>';
  }).join('');
}
function toggleBDTagSug(val) {
  if (_bdTags.includes(val)) _bdTags.splice(_bdTags.indexOf(val),1); else _bdTags.push(val);
  renderBDTags(); loadBDTagsSuggestions();
}
function toggleBDTwSug(val) {
  if (_bdTws.includes(val)) _bdTws.splice(_bdTws.indexOf(val),1); else _bdTws.push(val);
  renderBDTws(); loadBDTagsSuggestions();
}

async function loadBDHistoiresSelect() {
  const { data: bds } = await db.from('histoires').select('id, titre').eq('format', 'bd').order('titre');
  const { data: auteursData } = await db.from('auteurs').select('id, pseudo').order('pseudo');

  const auteurMenu = document.getElementById('bd-dropdown-bd-auteur-menu');
  if (auteurMenu && auteursData) {
    auteurMenu.innerHTML = '<div class="ban-dropdown-item" data-id="" onclick="bdPickAuteur(this)">— Aucun·e —</div>' +
      auteursData.map(a => `<div class="ban-dropdown-item" data-id="${a.id}" onclick="bdPickAuteur(this)">${a.pseudo}</div>`).join('');
  }

  const histMenu = document.getElementById('bd-dropdown-bd-ep-histoire-menu');
  if (histMenu && bds) {
    histMenu.innerHTML = bds && bds.length
      ? bds.map(h => `<div class="ban-dropdown-item" data-id="${h.id}" onclick="bdPickHistoire(this)">${h.titre}</div>`).join('')
      : '<div class="ban-dropdown-item" style="opacity:.5">Aucune BD créée</div>';
  }
}

function bdPickAuteur(el) {
  document.getElementById('bd-auteur').value = el.dataset.id;
  document.getElementById('bd-auteur-label').textContent = el.textContent.trim();
  document.querySelectorAll('#bd-dropdown-bd-auteur-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('bd-dropdown-auteur').classList.remove('open');
}

function bdPickHistoire(el) {
  document.getElementById('bd-ep-histoire').value = el.dataset.id;
  document.getElementById('bd-ep-histoire-label').textContent = el.textContent.trim();
  document.querySelectorAll('#bd-dropdown-bd-ep-histoire-menu .ban-dropdown-item').forEach(i => i.classList.toggle('selected', i === el));
  document.getElementById('bd-dropdown-ep-histoire').classList.remove('open');
  loadBDEpisodes();
}

async function loadBDPubliees() {
  const liste = document.getElementById('bd-publiees-liste');
  if (!liste) return;
  liste.innerHTML = '<div class="loading"><span class="spinner"></span>Chargement…</div>';
  const { data } = await db.from('histoires').select('id, titre, statut, cover_url').eq('format', 'bd').order('created_at', { ascending: false });
  _allBD = data || [];
  renderBDListe();
}

async function loadBDEpisodes(histoireIdParam) {
  const histoireId = histoireIdParam || document.getElementById('bd-ep-histoire').value;
  const liste = document.getElementById('bd-episodes-liste');
  if (!histoireId) { liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Sélectionne une BD.</div>'; return; }

  const { data } = await db.from('chapitres').select('id, numero, titre, gratuit, date_publication')
    .eq('histoire_id', histoireId).order('numero');

  if (!data || !data.length) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucun épisode pour l\'instant.</div>';
    const numInput = document.getElementById('bd-ep-num');
    if (numInput) numInput.value = 1;
    return;
  }

  // Stocker l'histoireId pour les callbacks de suppression
  window._bdEpisodesHistoireId = histoireId;

  // Mettre à jour le numéro d'épisode suivant
  const nextEpNum = Math.max(...data.map(ep => ep.numero)) + 1;
  const numInput = document.getElementById('bd-ep-num');
  if (numInput) numInput.value = nextEpNum;

  liste.innerHTML = data.map(ep => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
      <div>
        <div style="font-size:13px;color:var(--text)">Épisode ${ep.numero} — ${ep.titre || 'Sans titre'}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${ep.gratuit ? 'Gratuit' : '🎟 Ticket'}${ep.date_publication && new Date(ep.date_publication) > new Date() ? ' · <span style="color:var(--accent)">⏰ ' + new Date(ep.date_publication).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) + ' à ' + new Date(ep.date_publication).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) + '</span>' : ''}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="ouvrirPopupEditEp('${ep.id}', '${histoireId}', ${ep.numero}, '${ep.titre||''}', ${ep.gratuit})"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
          ✏️
        </button>
        <button onclick="supprimerEpisodeBD('${ep.id}', '${histoireId}', ${ep.numero})"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">
          🗑
        </button>
      </div>
    </div>
  `).join('');
}

// Prévisualisation des planches sélectionnées
// Tableau accumulant les planches ajoutées
let _bdEpFichiers = [];

function bdAjouterPlanches(input) {
  const nouveaux = Array.from(input.files).sort((a,b) => a.name.localeCompare(b.name));
  _bdEpFichiers = _bdEpFichiers.concat(nouveaux);
  input.value = ''; // reset pour permettre d'ajouter encore
  bdRendrePlanches();
}

function bdViderPlanches() {
  _bdEpFichiers = [];
  bdRendrePlanches();
}

function bdSupprimerPlanche(idx) {
  _bdEpFichiers.splice(idx, 1);
  bdRendrePlanches();
}

function bdRendrePlanches() {
  const preview = document.getElementById('bd-ep-preview');
  const count = document.getElementById('bd-ep-count');
  const vider = document.getElementById('bd-ep-vider');
  if (!preview) return;
  preview.innerHTML = _bdEpFichiers.map((f, i) => {
    const url = URL.createObjectURL(f);
    return `<div draggable="true" data-idx="${i}" style="position:relative;cursor:grab;opacity:1;transition:opacity .2s">
      <img src="${url}" style="height:70px;width:auto;border-radius:4px;object-fit:cover;display:block;pointer-events:none">
      <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;pointer-events:none">${i+1}</span>
      <button onclick="bdSupprimerPlanche(${i})" style="position:absolute;top:2px;right:2px;background:rgba(200,60,60,.8);border:none;color:#fff;font-size:10px;width:16px;height:16px;border-radius:50%;cursor:pointer;padding:0;line-height:1">×</button>
    </div>`;
  }).join('');
  if (count) count.textContent = _bdEpFichiers.length + ' planche(s)';
  if (vider) vider.style.display = _bdEpFichiers.length > 0 ? 'inline-flex' : 'none';
  // Activer le drag & drop
  _bdInitDragDrop(preview);
}

let _bdDragIdx = null;

function _bdInitDragDrop(container) {
  container.querySelectorAll('[draggable]').forEach(el => {
    el.addEventListener('dragstart', e => {
      _bdDragIdx = parseInt(el.dataset.idx);
      el.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => { el.style.opacity = '1'; });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    el.addEventListener('drop', e => {
      e.preventDefault();
      const targetIdx = parseInt(el.dataset.idx);
      if (_bdDragIdx === null || _bdDragIdx === targetIdx) return;
      const moved = _bdEpFichiers.splice(_bdDragIdx, 1)[0];
      _bdEpFichiers.splice(targetIdx, 0, moved);
      _bdDragIdx = null;
      bdRendrePlanches();
    });
  });
}


async function ajouterEpisodeBD() {
  const alertEl = document.getElementById('alert-bd');
  alertEl.textContent = ''; alertEl.className = 'alert';

  const histoireId = document.getElementById('bd-ep-histoire').value;
  const num = parseInt(document.getElementById('bd-ep-num').value);
  const titre = document.getElementById('bd-ep-titre').value.trim();
  const gratuit = document.getElementById('bd-ep-gratuit').checked;
  const _epDateVal=document.getElementById('bd-ep-date-publication').value;
  const epDatePub=_epDateVal?new Date(_epDateVal).toISOString():null;
  const _bdMusiqueFile=document.getElementById('bd-ep-musique-file')?.files[0]||null;
  const files = _bdEpFichiers.slice(); // copie du tableau accumulé

  if (!histoireId) { alertEl.textContent = 'Sélectionne une BD.'; alertEl.className = 'alert alert-error'; return; }
  if (!num || num < 1) { alertEl.textContent = 'Numéro d\'épisode invalide.'; alertEl.className = 'alert alert-error'; return; }
  if (!files.length) { alertEl.textContent = 'Sélectionne au moins une planche.'; alertEl.className = 'alert alert-error'; return; }

  const btn = document.getElementById('bd-ep-btn');
  const progress = document.getElementById('bd-ep-progress');
  btn.disabled = true;
  progress.style.display = 'block';

  // 1. Créer le chapitre
  const epTwStr = _epTws.length ? _epTws.join(', ') : null;
  let _bdMusiqueUrl=null;
  if(_bdMusiqueFile){try{_bdMusiqueUrl=await uploadAudio(_bdMusiqueFile,'musiques');}catch(e){alertEl.textContent='Erreur upload musique : '+e.message;alertEl.className='alert alert-error';btn.disabled=false;return;}}
  const { data: chap, error: chapErr } = await db.from('chapitres').insert({
    histoire_id: histoireId, numero: num, titre: titre || null,
    gratuit, contenu: null, date_publication: epDatePub, tw: epTwStr, musique_url: _bdMusiqueUrl
  }).select().single();

  if (chapErr) {
    alertEl.textContent = 'Erreur création épisode : ' + chapErr.message;
    alertEl.className = 'alert alert-error';
    btn.disabled = false; progress.style.display = 'none';
    return;
  }

  // 2. Uploader les planches une par une
  const imageUrls = [];
  for (let i = 0; i < files.length; i++) {
    progress.textContent = `Upload planche ${i+1} / ${files.length}…`;
    try {
      const url = await uploadImage(files[i], `bd/${histoireId}/ep${num}`);
      imageUrls.push({ histoire_id: histoireId, chapitre_num: num, ordre: i, image_url: url });
    } catch(e) {
      alertEl.textContent = `Erreur upload planche ${i+1} : ` + e.message;
      alertEl.className = 'alert alert-error';
      btn.disabled = false; progress.style.display = 'none';
      return;
    }
  }

  // 3. Insérer toutes les images en base
  const { error: imgErr } = await db.from('episodes_images').insert(imageUrls);
  btn.disabled = false; progress.style.display = 'none';
  btn.textContent = '✦ Publier l\'épisode';

  if (imgErr) {
    alertEl.textContent = 'Erreur enregistrement images : ' + imgErr.message;
    alertEl.className = 'alert alert-error';
    return;
  }

  alertEl.textContent = `✦ Épisode ${num} publié avec ${files.length} planches !`;
  alertEl.className = 'alert alert-success';
  _bdEpFichiers = [];
  bdRendrePlanches();
  _epTws = []; renderEpTws();
  document.getElementById('bd-ep-num').value = '';
  document.getElementById('bd-ep-titre').value = '';
  document.getElementById('bd-ep-date-publication').value = '';
  const _bdMusiqueFileEl=document.getElementById('bd-ep-musique-file'); if(_bdMusiqueFileEl) _bdMusiqueFileEl.value='';
  const _bdMusiquePreview=document.getElementById('bd-ep-musique-preview'); if(_bdMusiquePreview) _bdMusiquePreview.style.display='none';
  loadBDEpisodes();
}

async function supprimerEpisodeBD(chapId, histoireId, chapNum) {
  if (!confirm('Supprimer cet épisode et toutes ses planches ?')) return;
  await db.from('episodes_images').delete()
    .eq('histoire_id', histoireId)
    .eq('chapitre_num', chapNum);
  await db.from('chapitres').delete().eq('id', chapId);
  loadBDEpisodes(histoireId);
}

// Convertit une date ISO en format compatible avec input[type=datetime-local]
function eepPreviewAjout(input) {
  const preview = document.getElementById('eep-preview');
  const countEl = document.getElementById('eep-ajout-count');
  const files = Array.from(input.files).sort((a,b) => a.name.localeCompare(b.name));
  preview.innerHTML = files.map((f, i) => {
    const url = URL.createObjectURL(f);
    return `<div style="position:relative">
      <img src="${url}" style="height:60px;width:auto;border-radius:4px;object-fit:cover">
      <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px">+${i+1}</span>
    </div>`;
  }).join('');
  if (countEl) countEl.textContent = files.length ? files.length + ' planche(s) à ajouter' : '';
}

async function eepSupprimerPlancheExistante(imageUrl, histoireId, chapNum, btn) {
  if (!confirm('Supprimer cette planche ?')) return;
  await db.from('episodes_images').delete()
    .eq('histoire_id', histoireId).eq('chapitre_num', chapNum).eq('image_url', imageUrl);
  // Supprimer visuellement
  btn.closest('div').remove();
  // Renuméroter les badges
  const imgs = document.querySelectorAll('#eep-planches-actuelles > div');
  imgs.forEach((d, i) => { const s = d.querySelector('span'); if (s) s.textContent = i+1; });
}

/* ══════════════════════════════════════════════════════
   BD — TAGS, TW, ÂGE, STATUT, CORBEILLE
   ══════════════════════════════════════════════════════ */

let _bdTags = [], _bdTws = [];

function handleBDTagInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_bdTags.includes(v)) { _bdTags.push(v); renderBDTags(); }
  e.target.value = '';
}
function renderBDTags() {
  const wrap = document.getElementById('bd-tags-wrap');
  const input = document.getElementById('bd-tags-input');
  if (!wrap) return;
  wrap.innerHTML = '';
  _bdTags.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.innerHTML = `${t}<button onclick="_bdTags.splice(${i},1);renderBDTags()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function handleBDTwInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_bdTws.includes(v)) { _bdTws.push(v); renderBDTws(); }
  e.target.value = '';
}
function renderBDTws() {
  const wrap = document.getElementById('bd-tw-wrap');
  const input = document.getElementById('bd-tw-input');
  if (!wrap) return;
  wrap.innerHTML = '';
  _bdTws.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML = `${t}<button onclick="_bdTws.splice(${i},1);renderBDTws()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function setBDStatut(val) {
  document.getElementById('bd-statut').value = val;
  ['brouillon','encours','pause','termine'].forEach(s => {
    const key = s === 'encours' ? 'en-cours' : s;
    const btn = document.getElementById('bd-s-' + s);
    if (btn) btn.className = 'btn' + (val === key ? ' btn-accent' : '');
  });
}
function setBDAge(val) {
  document.getElementById('bd-age-val').value = val;
  ['tout','moins18','adulte'].forEach(s => {
    const btn = document.getElementById('bd-age-' + s);
    if (btn) btn.className = 'btn' + (val === s ? ' btn-accent' : '');
  });
}

let _ebdTags = [], _ebdTws = [];

function handleEBDTagInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_ebdTags.includes(v)) { _ebdTags.push(v); renderEBDTags(); }
  e.target.value = '';
}
function renderEBDTags() {
  const wrap = document.getElementById('ebd-tags-wrap');
  const input = document.getElementById('ebd-tags-input');
  if (!wrap) return;
  wrap.innerHTML = '';
  _ebdTags.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.innerHTML = `${t}<button onclick="_ebdTags.splice(${i},1);renderEBDTags()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function handleEBDTwInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_ebdTws.includes(v)) { _ebdTws.push(v); renderEBDTws(); }
  e.target.value = '';
}
function renderEBDTws() {
  const wrap = document.getElementById('ebd-tw-wrap');
  const input = document.getElementById('ebd-tw-input');
  if (!wrap) return;
  wrap.innerHTML = '';
  _ebdTws.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML = `${t}<button onclick="_ebdTws.splice(${i},1);renderEBDTws()">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}
function setEBDAge(val) {
  document.getElementById('ebd-age-val').value = val;
  ['tout','moins18','adulte'].forEach(s => {
    const btn = document.getElementById('ebd-age-' + s);
    if (btn) btn.className = 'btn' + (val === s ? ' btn-accent' : '');
  });
}

async function loadCorbeilleCommune() {
  const liste = document.getElementById('corbeille-list');
  if (!liste) return;
  liste.innerHTML = '<div class="loading"><span class="spinner"></span>Chargement…</div>';
  const { data } = await db.from('histoires').select('id,titre,statut,format,cover_url').eq('corbeille', true).order('created_at', { ascending: false });
  if (!data || !data.length) {
    liste.innerHTML = '<div class="loading">La corbeille est vide.</div>'; return;
  }
  const icons = { bd: '🎨', webtoon: '📱', roman: '📖' };
  liste.innerHTML = data.map(h => `
    <div class="histoire-item">
      <div class="histoire-item-cover">${h.cover_url ? `<img src="${h.cover_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : (icons[h.format||'roman'])}</div>
      <div class="histoire-item-info">
        <div class="histoire-item-title">${h.titre}</div>
        <div class="histoire-item-meta">${h.format||'roman'} · ${h.statut}</div>
      </div>
      <button class="btn btn-sm btn-success" onclick="restaurerHistoire('${h.id}')">Restaurer</button>
      <button class="btn btn-sm btn-danger" onclick="supprimerDefinitivement('${h.id}')">Suppr. déf.</button>
    </div>`).join('');
}

function _isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  // Ajuster au fuseau local
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset);
  return local.toISOString().slice(0, 16);
}

checkSession();

/* ══════════════════════════════════════════════════════
   SOUS-ONGLETS HISTOIRES (Roman / BD / Webtoon)
   ══════════════════════════════════════════════════════ */

let _currentFormatTab = 'roman';
let _allBD = [];
let _currentFilterBD = 'all';

function switchFormatTab(format) {
  _currentFormatTab = format;
  ['roman','bd','webtoon','audio','corbeille'].forEach(f => {
    const tab = document.getElementById('subtab-' + f);
    const panel = document.getElementById('subpanel-' + f);
    if (tab) tab.classList.toggle('active', f === format);
    if (panel) panel.style.display = f === format ? 'block' : 'none';
  });
  if (format === 'bd') loadBDPubliees();
  if (format === 'webtoon') { loadWebtoonPublies(); loadWTHistoireSelect(); loadWTAuteursSelect(); loadWTTagsSuggestions(); }
  if (format === 'audio') loadAudioPublies();
  if (format === 'corbeille') loadCorbeilleCommune();
}

function filterBD(filtre, btn) {
  _currentFilterBD = filtre;
  document.querySelectorAll('.filter-btn-bd').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderBDListe();
}

function renderBDListe() {
  const liste = document.getElementById('bd-publiees-liste');
  if (!liste) return;
  let filtered = _allBD;
  if (_currentFilterBD !== 'all') filtered = _allBD.filter(h => h.statut === _currentFilterBD);
  if (!filtered.length) {
    liste.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Aucune BD ici.</div>';
    return;
  }
  liste.innerHTML = filtered.map(h => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--glass-border)">
      ${h.cover_url ? `<img src="${h.cover_url}" style="width:40px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0">` : '<div style="width:40px;height:60px;background:var(--glass);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🎨</div>'}
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text);margin-bottom:4px">${h.titre}</div>
        <div style="font-size:11px;color:var(--text3)">${h.statut}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button onclick="ouvrirPopupEditBD('${h.id}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
          ✏️ Modifier
        </button>
        <button onclick="voirEpisodesBD('${h.id}', '${h.titre.replace(/'/g,"\'")}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(126,159,212,.3);background:transparent;color:var(--accent);cursor:pointer;font-family:'Jost',sans-serif">
          Épisodes
        </button>
        <button onclick="ouvrirPopupSupprBD('${h.id}')"
          style="font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(212,126,126,.3);background:transparent;color:var(--danger);cursor:pointer;font-family:'Jost',sans-serif">
          🗑
        </button>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   BD — TW ÉPISODES
   ══════════════════════════════════════════════════════ */

let _epTws = [], _eepTws = [];

function handleEpTwInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_epTws.includes(v)) { _epTws.push(v); renderEpTws(); }
  e.target.value = '';
}
function renderEpTws() {
  const wrap = document.getElementById('ep-tw-wrap');
  const input = document.getElementById('ep-tw-input');
  if (!wrap || !input) return;
  wrap.innerHTML = '';
  _epTws.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML = t + '<button onclick="_epTws.splice('+i+',1);renderEpTws()">×</button>';
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}

function handleEepTwInput(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (v && !_eepTws.includes(v)) { _eepTws.push(v); renderEepTws(); }
  e.target.value = '';
}
function renderEepTws() {
  const wrap = document.getElementById('eep-tw-wrap');
  const input = document.getElementById('eep-tw-input');
  if (!wrap || !input) return;
  wrap.innerHTML = '';
  _eepTws.forEach((t, i) => {
    const chip = document.createElement('div'); chip.className = 'tag-chip';
    chip.style.cssText = 'background:rgba(167,143,212,.15);border-color:rgba(167,143,212,.3);color:var(--accent2)';
    chip.innerHTML = t + '<button onclick="_eepTws.splice('+i+',1);renderEepTws()">×</button>';
    wrap.appendChild(chip);
  });
  wrap.appendChild(input);
}

async function loadEpTwSuggestions(prefix) {
  const {data} = await db.from('trigger_warnings_histoires').select('contenu,ordre').order('ordre',{ascending:true});
  const seen = new Map();
  (data||[]).forEach(t => { if(!seen.has(t.contenu)||t.ordre<seen.get(t.contenu)){seen.set(t.contenu,t.ordre||0);} });
  const uniq = [...seen.keys()];
  const arr = prefix === 'ep' ? _epTws : _eepTws;
  const container = document.getElementById(prefix+'-tw-suggestions');
  const label = document.getElementById(prefix+'-tw-suggestions-label');
  if (!container) return;
  if (!uniq.length) { if(label) label.style.display='none'; container.innerHTML=''; return; }
  if (label) label.style.display = 'block';
  container.innerHTML = uniq.map(t => {
    var cls = arr.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var safe = t.replace(/'/g, "\\'");
    return `<button class="${cls}" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEpTwSug('${prefix}','${safe}')">✦ ${t}</button>`;
  }).join('');
}
function toggleEpTwSug(prefix, val) {
  const arr = prefix === 'ep' ? _epTws : _eepTws;
  if (arr.includes(val)) arr.splice(arr.indexOf(val), 1); else arr.push(val);
  if (prefix === 'ep') renderEpTws(); else renderEepTws();
  loadEpTwSuggestions(prefix);
}

/* ══════════════════════════════════════════════════════
   BD — VOIR ÉPISODES DEPUIS LA LISTE
   ══════════════════════════════════════════════════════ */

async function voirEpisodesBD(histoireId, titre) {
  const card = document.getElementById('bd-episodes-card');
  const titreEl = document.getElementById('bd-episodes-titre');
  if (titreEl) titreEl.textContent = 'Épisodes — ' + titre;
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  await loadBDEpisodes(histoireId);
}

/* ══════════════════════════════════════════════════════
   BD — MODIFIER / SUPPRIMER
   ══════════════════════════════════════════════════════ */

function previewImgGeneric(input, previewId) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(input.files[0]);
}

// — MODIFIER UNE BD —
let _ebdData = null;

async function ouvrirPopupEditBD(id) {
  const { data: h } = await db.from('histoires').select('*').eq('id', id).single();
  if (!h) return;
  _ebdData = h;
  document.getElementById('ebd-id').value = id;
  document.getElementById('ebd-titre').value = h.titre || '';
  document.getElementById('ebd-resume').value = h.resume || '';
  document.getElementById('ebd-gratuit').value = h.gratuit_jusqu_au || 2;
  setEBDStatut(h.statut || 'en-cours');
  // Reset previews images
  ['ebd-cover-preview','ebd-banner-preview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = ''; el.style.display = 'none'; }
  });
  document.getElementById('ebd-cover-input').value = '';
  document.getElementById('ebd-banner-input').value = '';
  // Pré-remplir âge
  const ageVal = h.adulte ? 'adulte' : h.adapte_moins18 ? 'moins18' : 'tout';
  setEBDAge(ageVal);
  // Charger tags et TW
  const { data: htags } = await db.from('histoires_tags').select('tags(nom)').eq('histoire_id', id);
  const { data: htws } = await db.from('trigger_warnings_histoires').select('contenu').eq('histoire_id', id);
  _ebdTags = (htags || []).map(t => t.tags?.nom).filter(Boolean);
  _ebdTws = (htws || []).map(t => t.contenu);
  renderEBDTags(); renderEBDTws();
  // Charger suggestions
  const { data: allTags } = await db.from('tags').select('nom').order('nom');
  const { data: allTws } = await db.from('trigger_warnings_histoires').select('contenu');
  const uniqTws = [...new Set((allTws||[]).map(t=>t.contenu))];
  const sugT = document.getElementById('ebd-tags-suggestions');
  if (sugT) sugT.innerHTML = (allTags||[]).map(function(t) {
    var cls = _ebdTags.includes(t.nom) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var safe = t.nom.replace(/"/g,'&quot;');
    return '<button class="'+cls+'" style="font-size:11px" onclick="toggleEBDTagSug(\'' + safe + '\')">&#10022; ' + t.nom + '</button>';
  }).join('');
  const sugW = document.getElementById('ebd-tw-suggestions');
  if (sugW) sugW.innerHTML = uniqTws.map(function(t) {
    var cls = _ebdTws.includes(t) ? 'btn btn-sm btn-accent' : 'btn btn-sm';
    var safe = t.replace(/"/g,'&quot;');
    return '<button class="'+cls+'" style="font-size:11px;background:rgba(167,143,212,.1);border-color:rgba(167,143,212,.25);color:var(--accent2)" onclick="toggleEBDTwSug(\'' + safe + '\')">&#10022; ' + t + '</button>';
  }).join('');
  document.getElementById('popup-edit-bd').style.display = 'flex';
}

function toggleEBDTagSug(val) {
  if (_ebdTags.includes(val)) _ebdTags.splice(_ebdTags.indexOf(val),1);
  else _ebdTags.push(val);
  renderEBDTags(); ouvrirPopupEditBD(document.getElementById('ebd-id').value);
}
function toggleEBDTwSug(val) {
  if (_ebdTws.includes(val)) _ebdTws.splice(_ebdTws.indexOf(val),1);
  else _ebdTws.push(val);
  renderEBDTws(); ouvrirPopupEditBD(document.getElementById('ebd-id').value);
}

function fermerPopupEditBD() {
  document.getElementById('popup-edit-bd').style.display = 'none';
  _ebdData = null;
}

function setEBDStatut(val) {
  document.getElementById('ebd-statut').value = val;
  ['encours','pause','termine','brouillon'].forEach(s => {
    const key = s === 'encours' ? 'en-cours' : s;
    const btn = document.getElementById('ebd-s-' + s);
    if (btn) btn.className = 'btn' + (val === key ? ' btn-accent' : '');
  });
}

async function sauvegarderBD() {
  const id = document.getElementById('ebd-id').value;
  const titre = document.getElementById('ebd-titre').value.trim();
  if (!titre) { alert('Le titre est obligatoire.'); return; }

  const btn = document.getElementById('ebd-save-btn');
  btn.textContent = 'Sauvegarde…'; btn.disabled = true;

  try {
    let coverUrl = _ebdData?.cover_url || null;
    let bannerUrl = _ebdData?.banner_url || null;
    const coverFile = document.getElementById('ebd-cover-input').files[0];
    const bannerFile = document.getElementById('ebd-banner-input').files[0];
    if (coverFile) coverUrl = await uploadImage(coverFile, 'covers');
    if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banners');

    const _eAgeVal = document.getElementById('ebd-age-val').value;
    const { error } = await db.from('histoires').update({
      titre,
      resume: document.getElementById('ebd-resume').value.trim() || null,
      statut: document.getElementById('ebd-statut').value,
      gratuit_jusqu_au: parseInt(document.getElementById('ebd-gratuit').value) || 2,
      cover_url: coverUrl,
      banner_url: bannerUrl,
      adulte: _eAgeVal === 'adulte',
      adapte_moins18: _eAgeVal === 'moins18' || _eAgeVal === 'adulte',
      adapte_moins16: _eAgeVal === 'tout',
    }).eq('id', id);
    if (error) throw error;
    // Tags
    await db.from('histoires_tags').delete().eq('histoire_id', id);
    for (const tagNom of _ebdTags) {
      let { data: tag } = await db.from('tags').select('id').eq('nom', tagNom).single();
      if (!tag) { const { data: nt } = await db.from('tags').insert({ nom: tagNom }).select().single(); tag = nt; }
      if (tag) await db.from('histoires_tags').insert({ histoire_id: id, tag_id: tag.id });
    }
    // TW
    await db.from('trigger_warnings_histoires').delete().eq('histoire_id', id);
    for (const tw of _ebdTws) {
      await db.from('trigger_warnings_histoires').insert({ histoire_id: id, contenu: tw });
    }

    if (error) throw error;
    fermerPopupEditBD();
    loadBDPubliees();
    showAlert('bd', '✦ BD modifiée avec succès !');
  } catch(e) {
    alert('Erreur : ' + e.message);
  } finally {
    btn.textContent = '✦ Sauvegarder'; btn.disabled = false;
  }
}

// — SUPPRIMER UNE BD —
let _bdASupprimer = null;

function ouvrirPopupSupprBD(id) {
  _bdASupprimer = id;
  document.getElementById('popup-suppr-bd').style.display = 'flex';
}

function fermerPopupSupprBD() {
  document.getElementById('popup-suppr-bd').style.display = 'none';
  _bdASupprimer = null;
}

async function confirmerSupprBD() {
  if (!_bdASupprimer) return;
  const id = _bdASupprimer;
  // Récupérer tous les chapitres pour supprimer les images
  const { data: chaps } = await db.from('chapitres').select('id,numero').eq('histoire_id', id);
  for (const ch of (chaps || [])) {
    await db.from('episodes_images').delete()
      .eq('histoire_id', id).eq('chapitre_num', ch.numero);
  }
  await db.from('chapitres').delete().eq('histoire_id', id);
  await db.from('histoires').delete().eq('id', id);
  fermerPopupSupprBD();
  loadBDPubliees();
  showAlert('bd', 'BD supprimée.');
}

// — MODIFIER UN ÉPISODE —
async function ouvrirPopupEditEp(chapId, histoireId, num, titre, gratuit) {
  document.getElementById('eep-id').value = chapId;
  document.getElementById('eep-histoire-id').value = histoireId;
  document.getElementById('eep-ancien-num').value = num;
  document.getElementById('eep-num').value = num;
  document.getElementById('eep-titre').value = titre || '';
  setEEPGratuit(gratuit === true || gratuit === 'true');
  document.getElementById('eep-images').value = '';
  document.getElementById('eep-preview').innerHTML = '';
  document.getElementById('eep-ajout-count').textContent = '';
  document.getElementById('eep-progress').style.display = 'none';
  // Pré-remplir TW
  const { data: epChap } = await db.from('chapitres').select('tw, musique_url').eq('id', chapId).single();
  _eepTws = epChap?.tw ? epChap.tw.split(',').map(t=>t.trim()).filter(Boolean) : [];
  renderEepTws();
  loadEpTwSuggestions('eep');
  // Musique actuelle
  const _eepMusiqueUrl = epChap?.musique_url || null;
  document.getElementById('eep-musique-url').value = _eepMusiqueUrl || '';
  const _eepMusiqueActuelle = document.getElementById('eep-musique-actuelle');
  if (_eepMusiqueActuelle) {
    if (_eepMusiqueUrl) { _eepMusiqueActuelle.textContent = '🎵 ' + _eepMusiqueUrl.split('/').pop(); _eepMusiqueActuelle.style.display = 'block'; }
    else { _eepMusiqueActuelle.style.display = 'none'; }
  }
  const _eepMusiqueFile = document.getElementById('eep-musique-file');
  if (_eepMusiqueFile) _eepMusiqueFile.value = '';
  const _eepMusiquePreview = document.getElementById('eep-musique-preview');
  if (_eepMusiquePreview) _eepMusiquePreview.style.display = 'none';
  // Pré-remplir la date si déjà programmée
  const { data: epData } = await db.from('chapitres').select('date_publication').eq('id', chapId).single();
  document.getElementById('eep-date-publication').value = epData?.date_publication ? _isoToDatetimeLocal(epData.date_publication) : '';
  // Charger et afficher les planches existantes
  const { data: planches } = await db.from('episodes_images')
    .select('ordre, image_url').eq('histoire_id', histoireId).eq('chapitre_num', num).order('ordre');
  const planchesEl = document.getElementById('eep-planches-actuelles');
  if (planchesEl) {
    if (planches && planches.length) {
      planchesEl.innerHTML = planches.map((p, i) =>
        `<div style="position:relative">
          <img src="${p.image_url}" style="height:60px;width:auto;border-radius:4px;object-fit:cover">
          <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px">${i+1}</span>
          <button onclick="eepSupprimerPlancheExistante('${p.image_url}', ${histoireId ? "'" + histoireId + "'" : ''}, ${num}, this)" style="position:absolute;top:2px;right:2px;background:rgba(200,60,60,.8);border:none;color:#fff;font-size:10px;width:16px;height:16px;border-radius:50%;cursor:pointer;padding:0;line-height:1">×</button>
        </div>`
      ).join('');
    } else {
      planchesEl.innerHTML = '<span style="font-size:11px;color:var(--text3)">Aucune planche.</span>';
    }
  }
  document.getElementById('popup-edit-ep').style.display = 'flex';


}

function fermerPopupEditEp() {
  document.getElementById('popup-edit-ep').style.display = 'none';
}

function setEEPGratuit(val) {
  document.getElementById('eep-gratuit').value = String(val);
  document.getElementById('eep-gratuit-btn').className = 'btn' + (val ? ' btn-accent' : '');
  document.getElementById('eep-payant-btn').className = 'btn' + (val ? '' : ' btn-accent');
}

async function sauvegarderEpisode() {
  const chapId = document.getElementById('eep-id').value;
  const histoireId = document.getElementById('eep-histoire-id').value;
  const ancienNum = parseInt(document.getElementById('eep-ancien-num').value);
  const nouveauNum = parseInt(document.getElementById('eep-num').value);
  const titre = document.getElementById('eep-titre').value.trim();
  const gratuit = document.getElementById('eep-gratuit').value === 'true';
  const _eepDateVal = document.getElementById('eep-date-publication').value;
  const eepDatePub = _eepDateVal ? new Date(_eepDateVal).toISOString() : null;
  const files = Array.from(document.getElementById('eep-images').files)
    .sort((a,b) => a.name.localeCompare(b.name));

  const btn = document.getElementById('eep-save-btn');
  const progress = document.getElementById('eep-progress');
  btn.disabled = true; btn.textContent = 'Sauvegarde…';

  try {
    // Mettre à jour le chapitre
    const eepTwStr = _eepTws.length ? _eepTws.join(', ') : null;
    const _eepMusiqueNewFile = document.getElementById('eep-musique-file')?.files[0] || null;
    let _eepMusiqueUrl = document.getElementById('eep-musique-url')?.value || null;
    if (_eepMusiqueNewFile) { try { _eepMusiqueUrl = await uploadAudio(_eepMusiqueNewFile, 'musiques'); } catch(e) { alert('Erreur upload musique : ' + e.message); btn.disabled=false; btn.textContent='✦ Sauvegarder'; return; } }
    const { error } = await db.from('chapitres').update({
      numero: nouveauNum,
      titre: titre || null,
      gratuit,
      date_publication: eepDatePub,
      tw: eepTwStr,
      musique_url: _eepMusiqueUrl || null,
    }).eq('id', chapId);
    if (error) throw error;

    // Si le numéro change, mettre à jour episodes_images
    if (nouveauNum !== ancienNum) {
      await db.from('episodes_images').update({ chapitre_num: nouveauNum })
        .eq('histoire_id', histoireId).eq('chapitre_num', ancienNum);
    }

    // Si nouvelles planches à ajouter
    if (files.length > 0) {
      progress.style.display = 'block';
      // Récupérer le nombre de planches existantes pour continuer la numérotation
      const { data: existantes } = await db.from('episodes_images')
        .select('ordre').eq('histoire_id', histoireId).eq('chapitre_num', nouveauNum).order('ordre', { ascending: false }).limit(1);
      const ordreDepart = existantes && existantes.length ? existantes[0].ordre + 1 : 0;
      const imageUrls = [];
      for (let i = 0; i < files.length; i++) {
        progress.textContent = `Upload planche ${i+1} / ${files.length}…`;
        const url = await uploadImage(files[i], `bd/${histoireId}/ep${nouveauNum}`);
        imageUrls.push({ histoire_id: histoireId, chapitre_num: nouveauNum, ordre: ordreDepart + i, image_url: url });
      }
      const { error: imgErr } = await db.from('episodes_images').insert(imageUrls);
      if (imgErr) throw imgErr;
      progress.style.display = 'none';
    }

    fermerPopupEditEp();
    loadBDEpisodes();
    showAlert('bd', '✦ Épisode modifié !');
  } catch(e) {
    alert('Erreur : ' + e.message);
  } finally {
    btn.textContent = '✦ Sauvegarder'; btn.disabled = false;
    progress.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════
   GESTION DES RÔLES
   ══════════════════════════════════════════════════════ */

async function rechercherCompteRole() {
  const email = document.getElementById('role-email-input').value.trim();
  const resultat = document.getElementById('role-resultat');
  const introuvable = document.getElementById('role-introuvable');
  resultat.style.display = 'none';
  introuvable.style.display = 'none';
  if (!email) return;
  const { data, error } = await db.from('profils').select('id, pseudo, role, email').eq('email', email).single();
  if (error || !data) { introuvable.style.display = 'block'; return; }
  document.getElementById('role-res-pseudo').textContent = data.pseudo || '(sans pseudo)';
  document.getElementById('role-res-email').textContent = email;
  document.getElementById('role-user-id').value = data.id;
  const badge = document.getElementById('role-res-badge');
  const roleActuel = data.role || 'lectrice';
  const couleurs = { lectrice: '#9aa2c8', autrice: '#c8a96e', admin: '#c084fc' };
  badge.textContent = roleActuel;
  badge.style.color = couleurs[roleActuel] || '#9aa2c8';
  badge.style.background = 'var(--glass)';
  badge.style.border = '1px solid ' + (couleurs[roleActuel] || '#9aa2c8');
  badge.style.borderRadius = '20px';
  const radio = document.querySelector(`input[name="role-choix"][value="${roleActuel}"]`);
  if (radio) radio.checked = true;
  await _peuplerSelectAutrice();
  const selectWrap = document.getElementById('role-autrice-select-wrap');
  if (selectWrap) selectWrap.style.display = roleActuel === 'autrice' ? 'block' : 'none';
  if (roleActuel === 'autrice') {
    const { data: autrice } = await db.from('auteurs').select('id, pseudo').eq('user_id', data.id).single();
    if (autrice) {
      document.getElementById('role-autrice-select').value = autrice.id;
      document.getElementById('role-autrice-selected-txt').textContent = autrice.pseudo;
    }
  }
  resultat.style.display = 'block';
}

async function sauvegarderRole() {
  const userId = document.getElementById('role-user-id').value;
  const role = document.querySelector('input[name="role-choix"]:checked')?.value;
  if (!userId || !role) return;
  if (role === 'autrice') {
    const autriceId = document.getElementById('role-autrice-select')?.value;
    if (!autriceId) { showAlert('roles', 'Merci de choisir un·e auteur·ice à associer.', 'error'); return; }
    await db.from('auteurs').update({ user_id: userId }).eq('id', autriceId);
    await db.from('auteurs').update({ user_id: null }).eq('user_id', userId).neq('id', autriceId);
  } else {
    await db.from('auteurs').update({ user_id: null }).eq('user_id', userId);
  }
  const btn = document.querySelector('#role-resultat .btn-accent');
  btn.textContent = 'Sauvegarde…'; btn.disabled = true;
  const { error } = await db.from('profils').update({ role }).eq('id', userId);
  btn.textContent = '✦ Sauvegarder le rôle'; btn.disabled = false;
  if (error) { showAlert('roles', 'Erreur : ' + error.message, 'error'); return; }
  showAlert('roles', 'Rôle mis à jour avec succès ✦');
  document.getElementById('role-resultat').style.display = 'none';
  document.getElementById('role-autrice-select-wrap').style.display = 'none';
  document.getElementById('role-email-input').value = '';
  loadRolesListe();
}

async function _peuplerSelectAutrice() {
  const dropdown = document.getElementById('role-autrice-dropdown');
  if (!dropdown) return;
  const { data } = await db.from('auteurs').select('id, pseudo').order('pseudo');
  dropdown.innerHTML = '<div onclick="choisirAutrice(\'\',\'— Choisir un·e auteur·ice —\')" style="padding:10px 12px;font-size:13px;color:var(--text3);cursor:pointer;font-family:\'Jost\',sans-serif;" onmouseover="this.style.background=\'rgba(126,159,212,.1)\'" onmouseout="this.style.background=\'\'" >— Choisir un·e auteur·ice —</div>';
  (data || []).forEach(a => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:10px 12px;font-size:13px;color:var(--text);cursor:pointer;font-family:\'Jost\',sans-serif;border-top:1px solid rgba(180,190,230,.08)';
    div.textContent = a.pseudo;
    div.onmouseover = () => div.style.background = 'rgba(126,159,212,.1)';
    div.onmouseout = () => div.style.background = '';
    div.onclick = () => choisirAutrice(a.id, a.pseudo);
    dropdown.appendChild(div);
  });
}

function toggleAutriceDropdown() {
  const dd = document.getElementById('role-autrice-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function choisirAutrice(id, pseudo) {
  document.getElementById('role-autrice-select').value = id;
  document.getElementById('role-autrice-selected-txt').textContent = pseudo;
  document.getElementById('role-autrice-dropdown').style.display = 'none';
}

function modifierRole(email) {
  document.getElementById('role-email-input').value = email;
  document.getElementById('role-resultat').style.display = 'none';
  document.getElementById('role-introuvable').style.display = 'none';
  rechercherCompteRole();
  document.getElementById('role-email-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function loadRolesListe() {
  const liste = document.getElementById('roles-liste');
  if (!liste) return;
  liste.innerHTML = '<div class="loading"><span class="spinner"></span>Chargement…</div>';
  const { data, error } = await db.from('profils').select('pseudo, email, role').in('role', ['autrice', 'admin']).order('role');
  if (error || !data || !data.length) {
    liste.innerHTML = '<p style="font-size:12px;color:var(--text3);text-align:center;padding:16px">Aucun rôle spécial attribué pour le moment.</p>';
    return;
  }
  const couleurs = { autrice: '#c8a96e', admin: '#c084fc' };
  liste.innerHTML = data.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(180,190,255,.08)">
      <div style="font-size:18px">☽</div>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text);font-weight:600">${p.pseudo || '—'}</div>
        <div style="font-size:11px;color:var(--text3)">${p.email || ''}</div>
      </div>
      <span style="font-size:10px;font-weight:600;padding:2px 10px;border-radius:20px;color:${couleurs[p.role]};background:var(--glass);border:1px solid ${couleurs[p.role]}">${p.role}</span>
      <button onclick="modifierRole('${p.email}')" style="background:none;border:1px solid rgba(180,190,255,.2);border-radius:8px;padding:4px 10px;font-size:10px;color:var(--text2);cursor:pointer;font-family:'Jost',sans-serif">Modifier</button>
    </div>
  `).join('');
}

