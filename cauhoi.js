// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
var answered = {};   // { q1:true, q2:true, ... }
var picAns   = {};   // { q5: 'b' }
var tfAns    = {};   // { q6: 'true' }
var wSelected= null; // currently selected word chip
var slotVals = { bs7a:'', bs7b:'', bs7c:'' };
var submitted= false;

function tick(q){
  answered[q]=true;
  refreshBar();
}
function refreshBar(){
  var n=Object.keys(answered).length;
  document.getElementById('cntAnswered').textContent=n;
  document.getElementById('progFill').style.width=(n/8*100)+'%';
}



// ─────────────────────────────────────────────
//  CÂU 2 — DRAG & DROP
// ─────────────────────────────────────────────
var dragVal=null;
(function initDrag(){
  var chips=document.querySelectorAll('.chip[draggable]');
  chips.forEach(function(c){
    c.addEventListener('dragstart',function(e){
      dragVal=this.dataset.val;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/plain',dragVal);
    });
    c.addEventListener('dragend',function(){
      this.classList.remove('dragging');
    });
  });
  var zones=document.querySelectorAll('.dzone');
  zones.forEach(function(z){
    z.addEventListener('dragover',function(e){ e.preventDefault(); this.classList.add('over'); });
    z.addEventListener('dragleave',function(){ this.classList.remove('over'); });
    z.addEventListener('drop',function(e){
      e.preventDefault();
      this.classList.remove('over');
      var val=e.dataTransfer.getData('text/plain');
      if(!val) return;
      // remove val from any other zone
      document.querySelectorAll('.dzone').forEach(function(oz){
        var pc=oz.querySelector('.placed-chip');
        if(pc && pc.dataset.val===val){ oz.classList.remove('filled'); pc.remove(); }
      });
      // if zone already has a chip, send it back
      var existing=this.querySelector('.placed-chip');
      if(existing){
        var oldVal=existing.dataset.val;
        existing.remove();
        this.classList.remove('filled');
        var origChip=document.getElementById('ch_'+['a','b','c','d'][['13/8/1945','19/8/1945','23/8/1945','2/9/1945'].indexOf(oldVal)]);
        if(origChip){ origChip.style.visibility='visible'; origChip.classList.remove('used'); }
      }
      // place chip
      var pc=document.createElement('span');
      pc.className='placed-chip';
      pc.dataset.val=val;
      pc.textContent=val;
      this.classList.add('filled');
      this.appendChild(pc);
      // hide original chip
      var vals=['13/8/1945','19/8/1945','23/8/1945','2/9/1945'];
      var ids=['ch_a','ch_b','ch_c','ch_d'];
      var idx=vals.indexOf(val);
      if(idx>=0){ var orig=document.getElementById(ids[idx]); if(orig){orig.style.visibility='hidden';} }
      // check if all filled
      var filled=document.querySelectorAll('#q2 .dzone.filled').length;
      if(filled>=4) tick('q2');
    });
  });
})();

//  CÂU 4 — CLICK ↑↓ SẮP XẾP
// ─────────────────────────────────────────────
function moveItem(btn, dir) {
  if (submitted) return;
  var item = btn.closest('.tl-item');
  var list = document.getElementById('tlList');
  var items = Array.prototype.slice.call(list.querySelectorAll('.tl-item'));
  var idx = items.indexOf(item);
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= items.length) return;
  // swap in DOM
  if (dir === -1) {
    list.insertBefore(item, items[newIdx]);
  } else {
    list.insertBefore(item, items[newIdx].nextSibling);
  }
  // flash animation
  item.classList.add('tl-moved');
  setTimeout(function(){ item.classList.remove('tl-moved'); }, 400);
  tick('q4');
}

// ─────────────────────────────────────────────
//  CÂU 5 — PICTURE PICK
// ─────────────────────────────────────────────
function pickPic(card,qid){
  if(submitted) return;
  document.querySelectorAll('#'+qid+' .pic-card').forEach(function(c){
    c.classList.remove('selected');
  });
  card.classList.add('selected');
  picAns[qid]=card.dataset.val;
  tick(qid);
}

// ─────────────────────────────────────────────
//  CÂU 6 — TRUE / FALSE
// ─────────────────────────────────────────────
function pickTF(val,qid){
  if(submitted) return;
  document.getElementById('tfT').classList.remove('t-sel');
  document.getElementById('tfF').classList.remove('f-sel');
  if(val==='true') document.getElementById('tfT').classList.add('t-sel');
  else             document.getElementById('tfF').classList.add('f-sel');
  tfAns[qid]=val;
  tick(qid);
}

// ─────────────────────────────────────────────
//  CÂU 7 — WORD BANK

// ─────────────────────────────────────────────
function selectW(chip){
  if(submitted) return;
  if(chip.classList.contains('wused')) return;
  // toggle off if clicking same chip
  if(wSelected===chip){
    chip.classList.remove('wselected');
    wSelected=null;
    return;
  }
  // deselect previous
  document.querySelectorAll('#wb7 .wchip').forEach(function(c){ c.classList.remove('wselected'); });
  wSelected=chip;
  chip.classList.add('wselected');
}
function fillB(slot){
  if(submitted) return;
  if(!wSelected){ alert('Hãy chọn một từ trong ngân hàng từ trước!'); return; }
  var word=wSelected.dataset.word;
  // if slot already filled, release that word back
  var prevWord=slotVals[slot.id];
  if(prevWord){
    document.querySelectorAll('#wb7 .wchip').forEach(function(c){
      if(c.dataset.word===prevWord){ c.classList.remove('wused'); }
    });
  }
  // remove word from any other slot
  Object.keys(slotVals).forEach(function(k){
    if(slotVals[k]===word && k!==slot.id){
      var s=document.getElementById(k);
      if(s){ s.textContent='__ điền vào __'; s.classList.remove('bfilled'); }
      slotVals[k]='';
    }
  });
  // fill slot
  slotVals[slot.id]=word;
  slot.textContent=word;
  slot.classList.add('bfilled');
  wSelected.classList.add('wused');
  wSelected.classList.remove('wselected');
  wSelected=null;
  // check all filled
  if(slotVals.bs7a && slotVals.bs7b && slotVals.bs7c) tick('q7');
  else delete answered.q7;
  refreshBar();
}

// ─────────────────────────────────────────────
//  FEEDBACK HELPER
// ─────────────────────────────────────────────
function showFB(id,ok,msg){
  var el=document.getElementById(id);
  el.className='q-fb '+(ok?'show-ok':'show-bad');
  el.innerHTML=(ok?'✅ ':'❌ ')+msg;
  var card=document.getElementById(id.replace('fb','q'));
  card.classList.remove('correct','wrong');
  card.classList.add(ok?'correct':'wrong');
}

// ─────────────────────────────────────────────
//  SUBMIT
// ─────────────────────────────────────────────
function submitAll(){
  submitted=true;
  var score=0;

  // Q1
  var r1=document.querySelector('input[name="q1"]:checked');
  if(r1){
    var ok=(r1.value==='b');

    if(ok) score++;
    showFB('fb1',ok,ok?'Chính xác! Ngày 15/8/1945, Nhật Bản tuyên bố đầu hàng Đồng minh.':'Chưa đúng. Đáp án: Nhật Bản tuyên bố đầu hàng Đồng minh vô điều kiện.');
  } else showFB('fb1',false,'Bạn chưa chọn đáp án.');
  document.querySelectorAll('input[name="q1"]').forEach(function(r){ r.disabled=true; });

  // Q2
  var zones=document.querySelectorAll('#q2 .dzone');
  var q2ok=true; var filled=0;
  zones.forEach(function(z){
    var pc=z.querySelector('.placed-chip');
    if(!pc){ q2ok=false; }
    else{
      filled++;
      if(pc.dataset.val!==z.dataset.ans){ q2ok=false; z.style.borderColor='var(--red-bd)'; z.style.background='var(--red-bg)'; }
      else { z.style.borderColor='var(--green-bd)'; z.style.background='var(--green-bg)'; }
    }
  });
  if(filled<4) showFB('fb2',false,'Bạn chưa kéo đủ 4 mốc. Đúng: 13/8→Tổng KN | 19/8→Hà Nội | 23/8→Huế | 2/9→Tuyên ngôn ĐL');
  else { if(q2ok) score++; showFB('fb2',q2ok,q2ok?'Xuất sắc! Bạn nối đúng tất cả mốc thời gian.':'Có mốc chưa đúng. Đúng: 13/8→Tổng KN | 19/8→Hà Nội | 23/8→Huế | 2/9→Tuyên ngôn ĐL'); }

  // Q3
  var a=document.getElementById('fi3a').value.trim().toLowerCase().replace(/\s/g,'');
  var b=document.getElementById('fi3b').value.trim().toLowerCase().replace(/\s/g,'');
  var oka=(a==='2'||a==='hai'||a==='2triệu'||a==='hơn2triệu'||a==='hơn2');
  var okb=(b.indexOf('tântrào')>=0||b.indexOf('tantrao')>=0||b.indexOf('tân trào')>=0||b==='tântrào'||b==='trào'||b==='trao');
  var ok3=oka&&okb;
  if(ok3) score++;
  showFB('fb3',ok3,ok3?'Chính xác! Hơn 2 triệu người & địa danh Tân Trào.':'Chưa đúng. Đáp án: (1) 2 triệu người — (2) Tân Trào.');
  document.getElementById('fi3a').disabled=true;
  document.getElementById('fi3b').disabled=true;

  // Q4
  var items=Array.prototype.slice.call(document.querySelectorAll('#tlList .tl-item'));
  var orders=items.map(function(i){ return parseInt(i.dataset.order); });
  var ok4=(orders[0]===1&&orders[1]===2&&orders[2]===3&&orders[3]===4);
  if(ok4) score++;
  showFB('fb4',ok4,ok4?'Hoàn hảo! Thứ tự đúng: Tổng KN (13/8) → Hà Nội (19/8) → Sài Gòn (25/8) → Tuyên ngôn ĐL (2/9).':'Thứ tự đúng: 1) Tổng KN (13/8) → 2) KN Hà Nội (19/8) → 3) KN Sài Gòn (25/8) → 4) Tuyên ngôn ĐL (2/9).');
  document.querySelectorAll('#tlList .tl-btn').forEach(function(b){ b.disabled=true; });

  // Q5
  var p5=picAns['q5'];
  if(p5){
    var ok5=(p5==='b');
    if(ok5) score++;
    document.querySelectorAll('#q5 .pic-card').forEach(function(c){
      c.style.pointerEvents='none';
      if(c.dataset.val==='b') c.classList.add('correct-p');
      else if(c.dataset.val===p5&&p5!=='b') c.classList.add('wrong-p');
    });
    showFB('fb5',ok5,ok5?'Đúng! 🗣️📜🗼🕊️ → Bác Hồ nói, Tuyên ngôn, Quảng trường Ba Đình, hòa bình = Tuyên ngôn Độc lập 2/9/1945.':'Chưa đúng. 🗣️📜🗼🕊️ gợi ý: Tuyên ngôn Độc lập được đọc tại Quảng trường Ba Đình, khai sinh VNDCCH.');
  } else showFB('fb5',false,'Bạn chưa chọn đáp án.');

  // Q6
  var tf6=tfAns['q6'];
  if(tf6!==undefined){
    var ok6=(tf6==='true');
    if(ok6) score++;
    showFB('fb6',ok6,ok6?'Đúng! CM tháng Tám toàn thắng trong vòng 15 ngày (14–28/8/1945).':'Nhận định này ĐÚNG — CM tháng Tám toàn thắng trên cả nước trong 15 ngày.');
  } else showFB('fb6',false,'Bạn chưa chọn Đúng hoặc Sai.');
  document.getElementById('tfT').disabled=true;
  document.getElementById('tfF').disabled=true;

  // Q7
  var ok7a=(slotVals.bs7a==='Đảng Cộng sản');
  var ok7b=(slotVals.bs7b==='yêu nước');
  var ok7c=(slotVals.bs7c==='Nhật Bản');
  if(slotVals.bs7a||slotVals.bs7b||slotVals.bs7c){
    var ok7=ok7a&&ok7b&&ok7c;
    if(ok7) score++;
    ['a','b','c'].forEach(function(k){
      var sl=document.getElementById('bs7'+k);
      var correct={a:'Đảng Cộng sản',b:'yêu nước',c:'Nhật Bản'};
      if(slotVals['bs7'+k]===correct[k]) sl.style.color='var(--green)';
      else if(slotVals['bs7'+k]) sl.style.color='var(--red)';
    });
    showFB('fb7',ok7,ok7?'Xuất sắc! Cả 3 ô đều đúng.':'Có ô chưa đúng. Đáp án: (1) Đảng Cộng sản — (2) yêu nước — (3) Nhật Bản.');
    document.querySelectorAll('#wb7 .wchip').forEach(function(c){ c.style.pointerEvents='none'; });
    document.querySelectorAll('.bslot').forEach(function(s){ s.style.pointerEvents='none'; });
  } else showFB('fb7',false,'Bạn chưa điền từ vào ô trống.');

  // Q8
  var r8=document.querySelector('input[name="q8"]:checked');
  if(r8){
    var ok8=(r8.value==='b');
    if(ok8) score++;
    showFB('fb8',ok8,ok8?'Chính xác! Mở ra kỷ nguyên độc lập, tự do là ý nghĩa lớn nhất.':'Chưa đúng. Đáp án: Mở ra kỷ nguyên độc lập, tự do cho dân tộc Việt Nam.');
  } else showFB('fb8',false,'Bạn chưa chọn đáp án.');
  document.querySelectorAll('input[name="q8"]').forEach(function(r){ r.disabled=true; });

  // SHOW RESULT
  var pts=Math.round(score/8*10*10)/10;
  var emoji=score>=7?'🏆':score>=5?'👍':'📚';
  var msg=score>=7?'Xuất sắc! Bạn nắm vững kiến thức Bài 6!':score>=5?'Khá tốt! Hãy ôn lại phần chưa đúng.':'Cần ôn tập thêm. Cố gắng nhé!';
  document.getElementById('resEmoji').textContent=emoji;
  document.getElementById('resScore').textContent=score;
  document.getElementById('resMsg').textContent=msg;
  document.getElementById('resPts').textContent='Điểm quy đổi: '+pts+' / 10';
  document.getElementById('rgC').textContent=score;
  document.getElementById('rgW').textContent=8-score;
  document.getElementById('rgP').textContent=pts;
  var rb=document.getElementById('resultBox');
  rb.style.display='block';
  rb.style.animation='none';
  rb.offsetHeight; // reflow
  rb.style.animation='';
  rb.style.cssText+='animation:popIn .4s cubic-bezier(.34,1.56,.64,1);';
  setTimeout(function(){ rb.scrollIntoView({behavior:'smooth',block:'center'}); },150);
}

// ─────────────────────────────────────────────
//  RESET
// ─────────────────────────────────────────────
function resetAll(){
  submitted=false;
  answered={}; picAns={}; tfAns={}; wSelected=null;
  slotVals={bs7a:'',bs7b:'',bs7c:''};

  // Q1, Q8 radio
  document.querySelectorAll('input[type=radio]').forEach(function(r){ r.checked=false; r.disabled=false; });

  // Q2 — restore zones & chips
  document.querySelectorAll('#q2 .dzone').forEach(function(z){
    z.querySelectorAll('.placed-chip').forEach(function(p){ p.remove(); });
    z.classList.remove('filled');
    z.style.borderColor=''; z.style.background='';
  });
  ['ch_a','ch_b','ch_c','ch_d'].forEach(function(id){
    var c=document.getElementById(id); if(c){ c.style.visibility='visible'; c.classList.remove('used','dragging'); }
  });

  // Q3
  document.getElementById('fi3a').value=''; document.getElementById('fi3a').disabled=false;
  document.getElementById('fi3b').value=''; document.getElementById('fi3b').disabled=false;

  // Q4 — reset to scrambled order: 3,1,4,2
  var tl=document.getElementById('tlList');
  var items=Array.prototype.slice.call(tl.querySelectorAll('.tl-item'));
  var desired=[3,1,4,2];
  desired.forEach(function(ord){
    items.forEach(function(item){
      if(parseInt(item.dataset.order)===ord){ tl.appendChild(item); }
    });
  });
  tl.querySelectorAll('.tl-item').forEach(function(i){ i.classList.remove('tl-moved'); });
  tl.querySelectorAll('.tl-btn').forEach(function(b){ b.disabled=false; });

  // Q5
  document.querySelectorAll('#q5 .pic-card').forEach(function(c){ c.classList.remove('selected','correct-p','wrong-p'); c.style.pointerEvents=''; });

  // Q6
  document.getElementById('tfT').classList.remove('t-sel'); document.getElementById('tfT').disabled=false;
  document.getElementById('tfF').classList.remove('f-sel'); document.getElementById('tfF').disabled=false;


  // Q7
  document.querySelectorAll('#wb7 .wchip').forEach(function(c){ c.classList.remove('wselected','wused'); c.style.pointerEvents=''; });
  ['bs7a','bs7b','bs7c'].forEach(function(id){
    var s=document.getElementById(id); if(s){ s.textContent='__ điền vào __'; s.classList.remove('bfilled'); s.style.color=''; s.style.pointerEvents=''; }
  });

  // feedback + cards
  document.querySelectorAll('.q-fb').forEach(function(f){ f.className='q-fb'; f.innerHTML=''; });
  document.querySelectorAll('.q-card').forEach(function(c){ c.classList.remove('correct','wrong'); });

  refreshBar();
  document.getElementById('resultBox').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
}

// result animation keyframe
var sty=document.createElement('style');
sty.textContent='@keyframes popIn{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}';
document.head.appendChild(sty);
