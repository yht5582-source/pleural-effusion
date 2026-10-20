(function (root) {
  'use strict';
  const labels = {pp:'胸水 total protein',sp:'血清 total protein',pl:'胸水 LDH',sl:'血清 LDH',ul:'血清 LDH 正常上限',pa:'胸水 albumin',sa:'血清 albumin',ph:'胸水 pH',pg:'胸水 glucose',sg:'血清 glucose',chol:'胸水 cholesterol',nt:'血清 NT-proBNP',lymph:'胸水 lymphocytes',neut:'胸水 neutrophils',ada:'胸水 ADA'};
  const gt=(a,b)=>a-b>1e-9*Math.max(1,Math.abs(a),Math.abs(b));
  function evaluate(raw) {
    const d={...raw}, errors=[], warnings=[];
    for(const k of Object.keys(labels)) {
      const v=raw[k]; d[k]=v===''||v==null?null:Number(v);
      if(d[k]!==null && (!Number.isFinite(d[k]) || d[k]<0)) errors.push(labels[k]+'：請輸入有效的非負數值。');
    }
    const pFactor=raw.proteinUnit==='g/L'?0.1:1,gFactor=raw.glucoseUnit==='mmol/L'?18:1;
    for(const k of ['pp','sp','pa','sa']) if(d[k]!==null)d[k]*=pFactor;
    for(const k of ['pg','sg']) if(d[k]!==null)d[k]*=gFactor;
    for(const k of ['sp','sl','ul'])if(d[k]===0)errors.push(labels[k]+'：分母或正常上限必須大於 0。');
    for(const k of ['pp','sp','pa','sa'])if(d[k]>20)errors.push(labels[k]+'：超出本工具輸入範圍，請核對單位（換算後須 ≤20 g/dL）。');
    if(d.ph!==null&&(d.ph<3||d.ph>9))errors.push('胸水 pH：請核對數值；本工具接受 3–9。');
    for(const k of ['lymph','neut'])if(d[k]>100)errors.push(labels[k]+'：百分比不可超過 100。');
    if(d.lymph!==null&&d.neut!==null&&d.lymph+d.neut>100)errors.push('淋巴球與嗜中性球百分比總和不可超過 100%。');
    for(const [a,b] of [['pa','pp'],['sa','sp']])if(d[a]!==null&&d[b]!==null&&gt(d[a],d[b]))errors.push(labels[a]+' 不應高於同份檢體 total protein；請核對。');
    if(d.ph!==null&&(d.ph<6.5||d.ph>7.8))warnings.push('pH 值不常見，請核對採檢、血氣分析及輸入。');
    if(d.paired!=='yes'&&['pp','sp','pl','sl','pa','sa'].some(k=>d[k]!==null))warnings.push('配對採檢時間尚未確認：血液與胸水宜接近同時採集，期間治療可能影響比值與梯度。');
    const valid=errors.length===0;
    const criteria=[
      {name:'蛋白比值',formula:'胸水 protein ÷ 血清 protein > 0.5',value:d.pp!==null&&d.sp>0?d.pp/d.sp:null,threshold:0.5},
      {name:'LDH 比值',formula:'胸水 LDH ÷ 血清 LDH > 0.6',value:d.pl!==null&&d.sl>0?d.pl/d.sl:null,threshold:0.6},
      {name:'LDH 絕對值',formula:'胸水 LDH > 血清 LDH 正常上限 × 2/3',value:d.pl,threshold:d.ul>0?d.ul*2/3:null}
    ];
    criteria.forEach(c=>c.positive=valid&&c.value!==null&&c.threshold!==null?gt(c.value,c.threshold):null);
    const known=criteria.filter(c=>c.positive!==null).length, positive=criteria.filter(c=>c.positive===true).length;
    const light=!valid?'invalid':positive?'exudate':known===3?'transudate':'incomplete';
    const spag=valid&&d.sa!==null&&d.pa!==null?d.sa-d.pa:null;
    const protGap=valid&&d.sp!==null&&d.pp!==null?d.sp-d.pp:null;
    const transContext=!!(d.hf||d.cirrhosis||d.nephrotic||d.overload);
    const pseudo=light==='exudate'&&transContext&&(spag!==null?gt(spag,1.2):protGap!==null&&gt(protGap,3.1));
    const urgent=[];
    if(d.stability==='unstable')urgent.push('生理狀態不穩定：先處理呼吸／循環，立即床邊評估與超音波；勿等待胸水生化分類。');
    if(d.pus==='yes')urgent.push('肉眼膿液：視為膿胸，緊急評估抗菌治療與胸腔引流；不需等待 Light 或 pH。');
    if(d.culture==='yes')urgent.push('胸水 Gram stain／細菌培養陽性：立即評估胸膜腔感染與引流，並核對污染可能性。');
    const suspected=d.infection==='yes'||d.fever||d.pus==='yes'||d.culture==='yes';
    const usablePH=valid&&d.ph!==null&&d.phReliable==='yes';
    let infection={level:'neutral',title:'尚未確認感染情境',text:'先評估肺炎／胸膜腔感染。pH 引流分層僅用於疑似感染情境。'};
    if(d.pus==='yes'||d.culture==='yes')infection={level:'danger',title:'優先處理胸膜腔感染',text:'膿液或可信的陽性微生物結果優先於生化分層，請評估抗菌治療與安全引流。[1]'};
    else if(suspected&&usablePH){
      if(d.ph<=7.2){infection={level:'danger',title:'高風險感染性胸水｜pH ≤7.20',text:'超音波確認有足夠、可安全到達的胸水時，應安排引流評估，並治療感染。[1]'};urgent.push(infection.title+'：優先安排安全引流評估。');}
      else if(d.ph<7.4){
        const ldhHigh=d.pl!==null&&gt(d.pl,900),gluLow=d.pg!==null&&!gt(d.pg,72);
        const text=ldhHigh&&gluLow?'LDH >900 U/L 且 glucose ≤72 mg/dL：符合 BTS 考慮放置引流的條件，超音波見分隔時更應考慮。[1]'
          :ldhHigh&&d.pg===null?'LDH >900 U/L：請補驗胸水 glucose；BTS 以 LDH >900 U/L 且 glucose ≤72 mg/dL作為考慮引流的條件。[1]'
          :d.pl===null||d.pg===null?'請補驗胸水 LDH 與 glucose；LDH >900 U/L 且 glucose ≤72 mg/dL時考慮引流。[1]'
          :'LDH 與 glucose 未同時達 BTS 考慮引流的條件；仍須結合分隔、胸水量與臨床病程，惡化時重新評估。[1]';
        infection={level:'warning',title:'中度風險｜7.20 < pH < 7.40',text};}
      else infection={level:'info',title:'pH 分層為低風險｜pH ≥7.40',text:'僅依此 pH 暫無立即引流指徵；持續臨床追蹤，惡化或分隔時重新評估，並不排除感染。[1]'};
    } else if(suspected){
      if(valid&&d.pg!==null&&gt(60,d.pg)) {infection={level:'danger',title:'缺乏可靠 pH，glucose <60 mg/dL',text:'支持感染高風險，須結合情境評估引流；低糖亦可見於 RA 或惡性疾病。[1]'};urgent.push('疑似感染且缺乏可靠 pH，胸水低糖：優先評估。');}
      else infection={level:'warning',title:'疑似感染｜需要可靠的即時 pH',text:'以血氣方式迅速檢測，避免局部麻醉劑、液態 heparin 或空氣污染；目前不能完成 pH 分層。[1]'};
    } else if(usablePH&&d.ph<=7.2)infection={level:'warning',title:'低 pH，但感染情境未成立',text:'重新評估感染，並考慮 RA、惡性疾病及採檢誤差；不能只因低 pH 自動套用感染引流規則。[1]'};
    if(d.loculated)warnings.push('影像見分隔／包裹：需胸腔專科與超音波評估；單一位置的 pH 未必代表全部胸水。');
    if(d.ckd||d.hd||d.pd)warnings.push('CKD／透析：NT-proBNP 受腎功能與容量影響，不能單用固定切點確診或排除心因性胸水。');
    const triValues=[d.pp,d.pl,d.chol],triCuts=[3,250,55];
    const triple=!valid?'invalid':triValues.some((v,i)=>v!==null&&gt(v,triCuts[i]))?'exudate':triValues.every(v=>v!==null)?'transudate':'incomplete';
    const ddx=[];
    const add=(title,why,next,ref)=>ddx.push({title,why,next,ref});
    const otherTransCause=d.cirrhosis||d.nephrotic||d.pd;
    if(d.hf||d.overload||pseudo||light==='transudate'&&!otherTransCause)add('心衰竭／容量過多',pseudo?'臨床背景與梯度支持可能 pseudoexudate。':d.hf||d.overload?'有心衰竭／容量過多線索。':'生化為漏出液，且未選擇其他漏出液病因；心衰竭最常見。','評估容量、心臟超音波、血清 NT-proBNP 與利尿／超濾反應；可合併其他病因。','1,2,4,6');
    if(d.cirrhosis)add('肝性胸水','已選擇肝硬化背景。','評估腹水與門脈高壓；即使有漏出液表現，發燒或腹痛仍需排除感染。','2');
    if(d.nephrotic)add('腎病症候群／低膠體滲透壓','已選擇腎病症候群背景。','檢視血清 albumin、蛋白尿與容量；不能將所有胸水都歸因於低白蛋白。','2');
    if(suspected||valid&&d.neut>50)add('肺炎旁胸水／胸膜腔感染',suspected?'有臨床感染線索。':'胸水嗜中性球占比 >50%；並非感染專屬。','依上方感染分層處理；送 Gram stain、培養（含血液培養瓶）與可靠 pH。','1');
    if(d.cancer||valid&&d.lymph>50||light==='exudate')add('惡性胸水',d.cancer?'有腫瘤／消瘦／胸膜結節等線索。':'滲出液或淋巴球優勢需列入鑑別，不代表已確診。','胸水細胞學與 cell block、胸部影像；陰性但仍可疑時考慮影像導引／胸腔鏡切片。','1');
    if(d.tb||valid&&d.lymph>50||valid&&d.ada!==null&&d.ada>=40)add('結核性胸膜炎',d.tb?'有結核暴露或臨床疑慮。':'淋巴球優勢或 ADA 升高提供線索。','ADA ≥40 U/L 僅是常用提示；依流行病學與本院方法判讀，必要時胸膜組織培養／病理，不能以 ADA 單獨確診。','1,2');
    if(d.autoimmune)add('自體免疫胸膜炎（SLE／RA）','有自體免疫疾病線索。','結合疾病活動度、血清學與感染排除；RA 亦可低 glucose／低 pH。','1,2');
    if(d.pe)add('肺栓塞','有突發胸痛、VTE 風險或不明低氧線索。','依臨床前測機率走肺栓塞診斷流程；胸水分類不能排除 PE，影像選擇需考量腎功能。','2');
    if(d.ckd||d.hd||d.pd){if(light==='exudate')add('尿毒性胸膜炎（排除性診斷）','腎衰竭背景合併滲出液。','先排除感染、結核、惡性疾病、PE 與容量問題，再評估透析充分性及後續反應。','2');}
    if(d.pd)add('腹膜透析相關胸腹膜交通',valid&&d.pg!==null&&d.sg!==null&&d.pg>d.sg?'胸水 glucose 高於血清，支持透析液漏入可能。':'PD 病人，尤其新出現單側／右側胸水需考慮。','配對測 glucose，檢視透析液與採檢時點；低梯度不能排除。同時評估容量過多／心衰竭。由腎臟／胸腔團隊評估核醫或其他影像確認。','5');
    if(d.bloody)add('血性胸水／血胸待排','已選擇肉眼血性。','測胸水與周邊血 hematocrit，檢視外傷、處置、抗凝、惡性病與 PE；疑持續出血時立即評估。','2');
    if(d.milky)add('乳糜／假性乳糜胸水','已選擇乳白外觀；外觀本身不能確診。','測 triglycerides、cholesterol，必要時 chylomicrons；並鑑別膿液。','2');
    if(!ddx.length)add('尚無足夠線索','先填臨床背景與胸水檢驗。','完成分類後仍需找病因；持續不明胸水應轉胸腔專科評估。','1,2');
    const atypical=d.side==='right'||d.side==='left'||d.fever||d.loculated||d.nonresponse||d.cancer||d.tb||d.pe;
    const sampling=d.stability==='unstable'?'先穩定病人，再由臨床團隊決定緊急處置。':atypical?'有單側、不典型或治療反應不佳線索：考慮超音波導引診斷性胸腔穿刺。':d.side==='bilateral'&&transContext?'典型雙側、臨床支持系統性病因時，可先治療並追蹤；出現不典型表現或未改善應重新評估穿刺。':'以病史、胸部影像與超音波確認是否需要診斷性穿刺。';
    return {d,errors,warnings,valid,criteria,known,positive,light,spag,protGap,pseudo,transContext,urgent,infection,triple,ddx,sampling};
  }
  const API={evaluate,labels};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.PleuralEngine=API;
})(typeof window!=='undefined'?window:globalThis);
