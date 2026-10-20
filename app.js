'use strict';
const $=id=>document.getElementById(id);
const form=$('assessment');
const backgrounds=[['hf','已知／疑似心衰竭'],['overload','臨床容量過多'],['cirrhosis','肝硬化'],['nephrotic','腎病症候群'],['ckd','CKD'],['hd','血液透析'],['pd','腹膜透析'],['diuretic','已接受利尿治療']];
const clues=[['fever','發燒／持續感染徵象'],['loculated','影像分隔／包裹'],['nonresponse','治療後未改善'],['cancer','腫瘤／消瘦／胸膜結節'],['tb','結核暴露／疑慮'],['autoimmune','SLE／RA 等線索'],['pe','肺栓塞風險／疑慮'],['bloody','肉眼血性胸水'],['milky','乳白色胸水']];
const sourceData=[
['BTS Guideline for pleural disease · 2023','https://www.brit-thoracic.org.uk/document-library/guidelines/pleural-disease/bts-guideline-for-pleural-disease/','正式指引：感染分層、病因檢查與 NT-proBNP。'],
['ICS / NCCP Pleural effusion guidelines · 2024','https://pmc.ncbi.nlm.nih.gov/articles/PMC11093145/','正式指引：Light 分類、albumin／protein gradient 與診斷流程。'],
['Porcel et al. Revisiting Light’s criteria · ERJ Open Res 2026;12(2):00821-2025','https://pmc.ncbi.nlm.nih.gov/articles/PMC12991015/','診斷研究：7,280 例，只用胸水的 triple combination；驗證組敏感度 98%、特異度 70%。'],
['Bielsa et al. Cardiac and hepatic false exudates · 2012','https://doi.org/10.1111/j.1440-1843.2012.02155.x','原始研究：假性滲出液梯度。'],
['PD-related hydrothorax: single-center experience · 2021','https://pmc.ncbi.nlm.nih.gov/articles/PMC8722551/','病例系列：胸腹膜交通的診斷線索與影像。'],
['Porcel et al. BANCA score · 2025','https://pmc.ncbi.nlm.nih.gov/articles/PMC12208600/','診斷研究：心因性胸水；NT-proBNP 門檻受族群影響，本頁不計算 BANCA。']
];
function checks(items){return items.map(([key,text])=>`<label class="check"><input type="checkbox" name="${key}" id="${key}"><span>${text}</span></label>`).join('');}
function input(key,label,unit=''){return `<div class="field"><label for="${key}">${label} <span class="unit ${['pp','sp','pa','sa'].includes(key)?'protein-unit':['pg','sg'].includes(key)?'glucose-unit':''}">${unit}</span></label><input id="${key}" name="${key}" type="number" min="0" step="any" inputmode="decimal" placeholder="未填寫"></div>`;}
$('backgroundChecks').innerHTML=checks(backgrounds);$('clueChecks').innerHTML=checks(clues);
$('lightLabs').innerHTML=`<div class="lab-row"><span>Total protein</span>${input('pp','胸水 protein','g/dL')}${input('sp','血清 protein','g/dL')}</div><div class="lab-row"><span>LDH</span>${input('pl','胸水 LDH','U/L')}${input('sl','血清 LDH','U/L')}</div>`;
$('albuminLabs').innerHTML=input('pa','胸水 albumin','g/dL')+input('sa','血清 albumin','g/dL');
$('glucoseLabs').innerHTML=input('pg','胸水 glucose','mg/dL')+input('sg','血清 glucose（PD 選填）','mg/dL');
$('cellLabs').innerHTML=input('lymph','Lymphocytes','%')+input('neut','Neutrophils','%')+input('ada','ADA','U/L');
$('sources').innerHTML=sourceData.map(([t,u,d])=>`<li><a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a><small>${d}</small></li>`).join('');
const cases={
 hf:{title:'心衰竭・典型漏出液',note:'雙側胸水、容量過多。預期：Light 三項陰性；臨床支持心因性漏出液。',data:{stability:'stable',pus:'no',side:'bilateral',hf:true,overload:true,paired:'yes',pp:2,sp:6.8,pl:80,sl:200,ul:240,pa:1,sa:3.5,nt:3500,infection:'no'}},
 pseudo:{title:'利尿後・假性滲出液',note:'心衰竭利尿後，protein ratio 輕度超標。預期：Light 滲出液，SPAG 1.7 g/dL 支持 pseudoexudate，但不能排除混合病因。',data:{stability:'stable',pus:'no',side:'bilateral',hf:true,overload:true,diuretic:true,ckd:true,paired:'yes',pp:3.2,sp:6,pl:110,sl:230,ul:240,pa:1.8,sa:3.5,nt:4800,infection:'no'}},
 infection:{title:'肺炎旁胸水・低 pH',note:'發燒、分隔胸水。預期：感染高風險，pH 7.10 應優先安全引流評估，毋須等待完整病因分類。',data:{stability:'stable',pus:'no',side:'right',fever:true,loculated:true,paired:'yes',pp:4.1,sp:6.5,pl:1800,sl:240,ul:240,ph:7.1,phReliable:'yes',pg:40,infection:'yes',culture:'unknown',neut:88,lymph:8}},
 malignancy:{title:'淋巴球優勢・腫瘤線索',note:'單側反覆胸水、消瘦與腫瘤線索。預期：滲出液；惡性疾病與結核均須鑑別，細胞學陰性不能單獨排除腫瘤。',data:{stability:'stable',pus:'no',side:'left',cancer:true,nonresponse:true,paired:'yes',pp:4.4,sp:6.8,pl:350,sl:220,ul:240,ph:7.34,phReliable:'yes',pg:75,infection:'no',lymph:82,neut:10,ada:18}},
 pd:{title:'腹膜透析・右側胸水',note:'PD 後新出現右側胸水，胸水 glucose 280、血清 120 mg/dL。預期：漏出液並提示胸腹膜交通；高糖是支持線索，仍需確認。',data:{stability:'stable',pus:'no',side:'right',pd:true,ckd:true,paired:'yes',pp:0.6,sp:6.4,pl:35,sl:200,ul:240,pg:280,sg:120,infection:'no'}},
 missing:{title:'缺少配對血液・研究比較',note:'只有胸水 protein 3.4、LDH 120、cholesterol 60，缺少血清及 ULN。預期：Light 資料不足；研究 triple 為滲出液，兩者必須分開呈現。',data:{stability:'stable',pus:'no',side:'right',pp:3.4,pl:120,chol:60,infection:'unknown'}}
};
let step=0,lastResult=null,caseLabel='',caseOriginalNote='',dirty=false,proteinUnit='g/dL',glucoseUnit='mg/dL',pendingAction=null;
const names=['臨床起點','胸水分類','進一步判讀','病因鑑別','摘要與依據'];
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function num(v,d=3){return v===null?'—':Number(v.toFixed(d)).toString();}
function badge(p){return `<span class="badge ${p===true?'positive':p===false?'negative':'missing'}">${p===true?'陽性':p===false?'陰性':'未完成'}</span>`;}
function read(){const data={};for(const e of form.elements){if(!e.name)continue;data[e.name]=e.type==='checkbox'?e.checked:e.value;if(e.type==='number'&&e.validity.badInput)data[e.name]='invalid';}return data;}
function callout(level,title,text){return `<div class="callout ${level}"><b>${escapeHTML(title)}</b>${text?`<p>${escapeHTML(text)}</p>`:''}</div>`;}
function classification(r){return {invalid:['輸入需更正','Input check'],incomplete:['資料尚未完整','Awaiting data'],exudate:['滲出液','Exudate'],transudate:['漏出液','Transudate']}[r.light];}
function update(){
 const raw=read(),r=PleuralEngine.evaluate(raw);lastResult=r;
 $('validation').innerHTML=r.errors.length?callout('danger','請先更正輸入，生化判讀暫停',r.errors.join(' ')):'';
 $('urgent').innerHTML=r.urgent.length?callout('danger','優先處理 · 勿等待分類',r.urgent.join(' ')):'';
 $('contextWarnings').innerHTML=r.warnings.length?callout('warning','判讀時需核對',r.warnings.join(' ')):'';
 const [title,en]=classification(r);
 const incomplete=r.known<3&&r.light==='exudate'?'已有一項陽性，符合分類；仍有未完成指標。':r.light==='incomplete'?'缺少資料時不會推定為漏出液。':r.light==='transudate'?'三項皆未超過門檻；仍需確認實際病因。':'分類不等於病因確診。';
 $('liveStatus').innerHTML=`<div class="status-en">${en}</div><div class="status-title">${title}</div><div class="status-note">${r.light==='invalid'?'請核對頁面上方的輸入錯誤。':incomplete}</div>${r.pseudo?'<div class="callout warning">可能假性滲出液<br><small>保留 Light 分類，另註病因線索。</small></div>':''}`;
 $('miniCriteria').innerHTML=r.criteria.map(c=>`<div class="mini-row"><span>${c.name}</span>${badge(c.positive)}</div>`).join('');
 $('safetyStatus').innerHTML=r.urgent.length?callout('danger','已有優先處理事項','請看頁面上方警示。'):raw.stability==='unknown'||raw.pus==='unknown'?callout('warning','急症評估尚未完整','請回到步驟 01 確認；未評估不代表安全。'):callout('neutral','目前未輸入生理不穩定或膿液','仍須持續床邊評估。');
 $('nextFocus').textContent=r.urgent.length?'優先處理急症與感染風險，再繼續病因評估。':raw.stability==='unknown'?'先完成呼吸與循環狀態評估。':r.light==='invalid'?'修正數值與單位。':r.light==='incomplete'?'補齊配對 protein、LDH 與本院血清 LDH 正常上限。':r.pseudo?'整合心臟／肝臟評估與治療反應，留意混合病因。':'結合臨床線索，前往病因鑑別。';
 $('sampling').textContent=r.sampling+' [2]';
 $('lightDetail').innerHTML=r.criteria.map(c=>`<div class="criteria-row"><div><b>${c.name}</b>${badge(c.positive)}</div><small>${c.formula}</small><div class="value">${c.value===null?'缺少檢驗值':num(c.value,4)} ${c.threshold===null?'｜缺少正常上限':'｜門檻 > '+num(c.threshold,4)}${c.name==='LDH 絕對值'?' U/L':''}</div></div>`).join('');
 const triText={invalid:'輸入需更正',incomplete:'資料不足，不能判為漏出液',exudate:'研究組合分類：滲出液',transudate:'研究組合分類：漏出液'}[r.triple];
 $('tripleResult').textContent=triText+(r.triple!==r.light&&['exudate','transudate'].includes(r.triple)?'。與 Light 結果不同，請保留差異並核對臨床情境。':'。僅供研究比較。');
 const gradientText=!r.valid?'輸入有誤，暫不判讀梯度。':r.light!=='exudate'?'此步驟用於 Light 滲出液與臨床漏出液病因不一致時；目前不據此重新分類。':!r.transContext?'尚未輸入心衰竭、肝硬化、腎病症候群或容量過多背景。梯度不可脫離情境單獨改判。':r.pseudo?'梯度支持可能假性滲出液；不是排除感染或腫瘤的證據。':r.spag===null&&r.protGap===null?'補驗配對 albumin；若無法取得才以 protein gradient 輔助。':'目前梯度未提供假性滲出液的充分支持；仍應依臨床檢查病因。';
 $('gradientResult').innerHTML=`<div class="metric-grid"><div><span>SPAG · 血清 − 胸水</span><strong>${num(r.spag,2)}</strong><span>g/dL · >1.2 支持</span></div><div><span>Protein gradient</span><strong>${num(r.protGap,2)}</strong><span>g/dL · >3.1 支持</span></div></div>${callout(r.pseudo?'warning':'info',gradientText,'Albumin gradient 優先；protein gradient 為無 albumin 資料時的替代。[2,4]')}`;
 $('ntResult').textContent=!r.valid?'輸入需更正，暫不判讀 NT-proBNP。':r.d.nt===null?'未填寫。臨床懷疑心因性胸水時，可用血清 NT-proBNP 輔助；不需常規另驗胸水 NT-proBNP。[1]':`目前 ${num(r.d.nt,0)} pg/mL。文獻曾用 1,500 或 2,500 pg/mL，但不能單憑固定切點確診，尤其 CKD／透析、年齡與容量均會影響結果。[2,6]`;
 $('infectionResult').innerHTML=callout(r.infection.level,r.infection.title,r.infection.text);
 $('differentials').innerHTML=(r.valid?'':callout('warning','檢驗數值尚有錯誤','以下僅保留臨床背景引出的方向，請先修正數值。'))+r.ddx.map(x=>`<article class="ddx-card"><h3>${x.title}</h3><p class="why">${x.why}</p><p>${x.next}</p><small>依據 [${x.ref}]</small></article>`).join('');
 $('summaryText').textContent=summary(r,raw);
 $('liveBarText').textContent='目前判讀：'+title+(r.pseudo?'（可能假性滲出液）':'');
 $('liveBarFlag').className=r.urgent.length?'flag':'';$('liveBarFlag').textContent=r.urgent.length?'優先處理 '+r.urgent.length:'';
}
function summary(r,raw){
 const [title,en]=classification(r),lines=['成人胸水鑑別評估摘要','工具版本 v1.1｜文獻檢視 2026-10-20',caseLabel?'教學病例（虛構）：'+caseLabel:'個別評估（未輸入識別資料）','',`Light’s criteria：${title} / ${en}`,`可判讀 ${r.known}/3 項，陽性 ${r.positive}/3 項。`];
 r.criteria.forEach(c=>lines.push(`• ${c.name}：${num(c.value,4)}；門檻 >${num(c.threshold,4)}；${c.positive===null?'未完成':c.positive?'陽性':'陰性'}`));
 lines.push('','輸入數值：');for(const [k,label]of Object.entries(PleuralEngine.labels)){if(raw[k]!==''&&raw[k]!=null)lines.push(raw[k]==='invalid'?`${label}：（無效輸入）`:`${label}：${raw[k]} ${['pp','sp','pa','sa'].includes(k)?raw.proteinUnit:['pg','sg'].includes(k)?'mg/dL':['pl','sl','ul','ada'].includes(k)?'U/L':k==='nt'?'pg/mL':k==='chol'?'mg/dL':['lymph','neut'].includes(k)?'%':''}`);}
 const checked=[...backgrounds,...clues].filter(([k])=>raw[k]).map(([,label])=>label);
 lines.push('','背景／線索：'+(checked.join('、')||'尚未勾選（不代表陰性）'),`穩定度：${{unknown:'未評估',stable:'目前穩定',unstable:'不穩定'}[raw.stability]}`,`膿液：${{unknown:'未評估',yes:'是',no:'否'}[raw.pus]}；感染疑慮：${{unknown:'未評估',yes:'是',no:'目前不懷疑'}[raw.infection]}`,`胸水分布：${{unknown:'未確認',right:'右側',left:'左側',bilateral:'雙側'}[raw.side]}`,`配對採檢：${{unknown:'未確認',yes:'接近同時',no:'不同時'}[raw.paired]}`,`pH 品質：${{unknown:'未確認',yes:'可靠',no:'不可靠／待核對'}[raw.phReliable]}`,'',`SPAG：${num(r.spag,2)} g/dL；protein gradient：${num(r.protGap,2)} g/dL`,r.pseudo?'假性滲出液：臨床背景與梯度支持可能；保留 Light 分類，仍需排除混合病因。':'假性滲出液：未獲本工具支持或不適用，不能據此排除。','',r.infection.title,r.infection.text);
 if(raw.chol!=='')lines.push('',`2026 研究 triple combination：${{invalid:'輸入有誤',incomplete:'資料不足',exudate:'滲出液',transudate:'漏出液'}[r.triple]}（僅研究比較，不能取代 Light）`);
 if(r.urgent.length)lines.push('','【優先處理】',...r.urgent);
 if(r.errors.length)lines.push('','【輸入錯誤】',...r.errors);
 if(r.warnings.length)lines.push('','【待核對】',...r.warnings);
 lines.push('','病因方向與下一步（非確診／機率排名）：',...r.ddx.map(x=>`• ${x.title}：${x.next} [${x.ref}]`),'','此摘要為臨床／教學輔助，未經前瞻性臨床驗證。',...sourceData.map(([t,u],i)=>`[${i+1}] ${t} ${u}`));return lines.join('\n');
}
function go(n,focus=true){step=Math.max(0,Math.min(4,n));document.querySelectorAll('[data-panel]').forEach(e=>e.hidden=Number(e.dataset.panel)!==step);document.querySelectorAll('[data-step]').forEach(e=>{const on=Number(e.dataset.step)===step;e.classList.toggle('active',on);if(on)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});$('prev').disabled=step===0;$('next').hidden=step===4;$('next').textContent=step<4?'下一步：'+names[step+1]+' →':'';$('stepProgress').textContent='0'+(step+1)+' / 05';if(focus){const panel=document.querySelector(`[data-panel="${step}"]`);panel.setAttribute('tabindex','-1');panel.focus({preventScroll:true});$('urgent').scrollIntoView({behavior:'smooth',block:'start'});}}
function syncUnits(){document.querySelectorAll('.protein-unit').forEach(e=>e.textContent=$('proteinUnit').value);}
function clear(){form.reset();proteinUnit='g/dL';glucoseUnit='mg/dL';caseLabel='';dirty=false;$('caseNote').hidden=true;$('caseSelect').value='';$('copyStatus').textContent='';syncUnits();update();go(0);}
function confirmAction(title,fn){if(!dirty){fn();return;}$('dialogTitle').textContent=title;pendingAction=fn;$('confirmDialog').showModal();}
function loadCase(key){const c=cases[key];if(!c){$('caseNote').hidden=false;$('caseNote').textContent='請先選擇一個教學病例。';return;}clear();for(const[k,v]of Object.entries(c.data)){const e=form.elements.namedItem(k);if(e.type==='checkbox')e.checked=v;else e.value=v;}caseLabel=c.title;caseOriginalNote=c.note;dirty=true;$('caseSelect').value=key;$('caseNote').hidden=false;$('caseNote').textContent='虛構教學病例｜'+c.note;update();go(key==='missing'?1:0);if(key==='missing')document.querySelector('.research').open=true;}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('input',e=>{if(['proteinUnit','glucoseUnit'].includes(e.target.id))return;dirty=true;if(caseLabel){$('caseNote').textContent='虛構教學病例（已編輯）｜原始題目：'+caseOriginalNote;}update();});
form.addEventListener('change',e=>{const id=e.target.id;if(id==='proteinUnit'||id==='glucoseUnit'){const isP=id==='proteinUnit',old=isP?proteinUnit:glucoseUnit,newUnit=e.target.value;const keys=isP?['pp','sp','pa','sa']:['pg','sg'];const factor=isP?(old==='g/dL'?10:.1):(old==='mg/dL'?1/18:18);if(old!==newUnit)for(const k of keys)if($(k).value!=='')$(k).value=Number((Number($(k).value)*factor).toFixed(9));if(isP)proteinUnit=newUnit;else glucoseUnit=newUnit;syncUnits();dirty=true;update();}});
document.querySelectorAll('[data-step]').forEach(e=>e.addEventListener('click',()=>go(Number(e.dataset.step))));$('prev').onclick=()=>go(step-1);$('next').onclick=()=>go(step+1);$('goSummary').onclick=()=>go(4);$('liveBar').onclick=()=>document.querySelector('.result-card').scrollIntoView({behavior:'smooth',block:'start'});
$('reset').onclick=()=>confirmAction('清除目前所有輸入？',clear);
$('loadCase').onclick=()=>{const key=$('caseSelect').value;if(!key){loadCase(key);return;}confirmAction('以教學病例取代目前輸入？',()=>loadCase(key));};
$('confirmDialog').addEventListener('close',()=>{pendingAction=null;});$('cancelDialog').onclick=()=>{$('confirmDialog').close();pendingAction=null;};$('confirmDialogAction').onclick=()=>{const fn=pendingAction;pendingAction=null;$('confirmDialog').close();fn?.();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('summaryText').textContent);$('copyStatus').textContent='已複製摘要。';}catch{const sel=window.getSelection(),range=document.createRange();range.selectNodeContents($('summaryText'));sel.removeAllRanges();sel.addRange(range);$('copyStatus').textContent='瀏覽器未允許直接複製，已選取摘要，請按 Ctrl/Cmd+C。';}};
$('print').onclick=()=>window.print();$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$ ('summaryText').textContent],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='pleural-assessment.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
update();go(0,false);
