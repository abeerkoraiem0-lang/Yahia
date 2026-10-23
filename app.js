const assets = './';
const initial = {
  morning: [
    {id:'bed',name:'ترتيب السرير',icon:'bed.jpg'},
    {id:'bath',name:'دخول الحمام',icon:'bath.jpg'},
    {id:'teeth',name:'غسيل الأسنان',icon:'toothbrush.jpg'},
    {id:'prayer',name:'الصلاة',icon:'prayer.jpg'},
    {id:'clothes',name:'ارتداء الملابس',icon:'clothes.jpg'},
    {id:'breakfast',name:'الفطار',icon:'breakfast.jpg'}
  ],
  after: [
    {id:'bag',name:'حقيبة المدرسة',icon:'backpack.jpg'},
    {id:'wash',name:'غسل اليدين',icon:'wash.jpg'},
    {id:'change',name:'تغيير الملابس',icon:'shirt.jpg'},
    {id:'snack',name:'وجبة خفيفة',icon:'snack.jpg'},
    {id:'homework',name:'واجبات',icon:'homework.jpg'},
    {id:'lunch',name:'غداء',icon:'lunch.jpg'},
    {id:'play',name:'لعب',icon:'play.jpg'},
    {id:'sleep',name:'نوم',icon:'sleep.jpg'}
  ],
  schedule: [
    {id:'sleep',name:'نوم',icon:'sleep.jpg'},
    {id:'prepare',name:'الاستعداد للمدرسة',icon:'backpack.jpg'},
    {id:'school',name:'المدرسة',icon:'school.jpg'},
    {id:'homework',name:'الواجبات',icon:'homework.jpg'},
    {id:'screen',name:'شاشة وغداء',icon:'screen-lunch.jpg'},
    {id:'quran',name:'حفظ قرآن',icon:'quran.jpg'},
    {id:'play',name:'لعب حر',icon:'play.jpg'},
    {id:'review',name:'لعب مع مراجعة قرآن',icon:'play-quran.jpg'},
    {id:'bedtime',name:'استعداد للنوم',icon:'bedtime.jpg'}
  ]
};
const titles = {
  morning: {image:'header-morning.jpg', cls:'morning-list'},
  after: {image:'header-after-school.jpg', cls:'after-list'},
  schedule: {image:'header-schedule.jpg', cls:'schedule-list'}
};
let state = JSON.parse(localStorage.getItem('yahia-routine-v1') || 'null') || {
  page:'morning',
  checked:{},
  order:{morning:initial.morning.map(x=>x.id),after:initial.after.map(x=>x.id),schedule:initial.schedule.map(x=>x.id)},
  bagChecked:{}
};
const $ = s => document.querySelector(s);
function save(){localStorage.setItem('yahia-routine-v1',JSON.stringify(state))}
function orderedItems(page){
  const map = Object.fromEntries(initial[page].map(x=>[x.id,x]));
  return (state.order[page]||initial[page].map(x=>x.id)).map(id=>map[id]).filter(Boolean);
}
function rowHTML(item,page){
  const key=page+':'+item.id, checked=!!state.checked[key];
  const draggable=page==='schedule';
  return `<div class="task-row ${checked?'done':''}" data-id="${item.id}" ${draggable?'draggable="true"':''}>
    <img class="task-art" src="${assets+item.icon}" alt="">
    <span class="task-name">${item.name}</span>
    <input type="checkbox" aria-label="تم إنجاز ${item.name}" data-check="${key}" ${checked?'checked':''}>
    ${draggable?'<button class="drag-handle" aria-label="اسحب لإعادة الترتيب" title="اسحب لإعادة الترتيب">⠿</button>':''}
  </div>`;
}
function render(){
  const page=state.page, conf=titles[page];
  $('#headerArt').src=assets+conf.image;
  $('#headerArt').alt=page==='morning'?'صباح الخير':page==='after'?'بعد المدرسة':'الجدول اليومي';
  document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  let html='';
  if(page==='morning'){
    html=`<div class="panel morning-list"><div class="task-list">${orderedItems(page).map(x=>rowHTML(x,page)).join('')}</div></div>
      <section class="backpack-panel"><h2>🎒 شنطة المدرسة</h2>
      ${['زجاجة المياه','علبة الغداء','الكراسات والكتب','المقلمة','الكارت المدرسي'].map((n,i)=>`<label class="pack-item"><input type="checkbox" data-bag="${i}" ${state.bagChecked[i]?'checked':''}><span>${n}</span></label>`).join('')}
      </section>`;
  } else if(page==='after'){
    html=`<div class="panel after-list"><div class="task-list">${orderedItems(page).map(x=>rowHTML(x,page)).join('')}</div></div>`;
  } else {
    html=`<div class="task-list schedule-list">${orderedItems(page).map(x=>rowHTML(x,page)).join('')}</div><p class="hint">⠿ يمكنك سحب العناصر لإعادة ترتيبها</p>`;
  }
  $('#content').innerHTML=html;
  $('#content').querySelectorAll('[data-check]').forEach(box=>box.addEventListener('change',e=>{
    state.checked[e.target.dataset.check]=e.target.checked; save(); render();
  }));
  $('#content').querySelectorAll('[data-bag]').forEach(box=>box.addEventListener('change',e=>{
    state.bagChecked[e.target.dataset.bag]=e.target.checked; save();
  }));
  if(page==='schedule') attachDrag();
}
function attachDrag(){
  let dragged=null;
  document.querySelectorAll('.schedule-list .task-row').forEach(row=>{
    row.addEventListener('dragstart',e=>{dragged=row;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',row.dataset.id)});
    row.addEventListener('dragend',()=>{row.classList.remove('dragging');document.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'));dragged=null});
    row.addEventListener('dragover',e=>{e.preventDefault();if(row!==dragged)row.classList.add('drag-over')});
    row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));
    row.addEventListener('drop',e=>{
      e.preventDefault();row.classList.remove('drag-over');
      if(!dragged||dragged===row)return;
      const list=$('.schedule-list');const rect=row.getBoundingClientRect();
      if(e.clientY>rect.top+rect.height/2) row.after(dragged); else row.before(dragged);
      state.order.schedule=[...list.querySelectorAll('.task-row')].map(x=>x.dataset.id);save();
    });
  });
  // Touch-friendly reorder: dragging the grip up/down moves the row.
  let touchRow=null,startY=0;
  document.querySelectorAll('.schedule-list .drag-handle').forEach(handle=>{
    handle.addEventListener('touchstart',e=>{touchRow=handle.closest('.task-row');startY=e.touches[0].clientY;touchRow.classList.add('dragging')},{passive:true});
    handle.addEventListener('touchmove',e=>{
      if(!touchRow)return;
      const y=e.touches[0].clientY, list=$('.schedule-list');
      const target=[...list.querySelectorAll('.task-row')].find(r=>{const b=r.getBoundingClientRect();return y>=b.top&&y<=b.bottom&&r!==touchRow});
      if(target){const b=target.getBoundingClientRect();if(y>b.top+b.height/2)target.after(touchRow);else target.before(touchRow)}
      startY=y;
    },{passive:true});
    handle.addEventListener('touchend',()=>{if(touchRow){touchRow.classList.remove('dragging');state.order.schedule=[...$('.schedule-list').querySelectorAll('.task-row')].map(x=>x.dataset.id);save();touchRow=null}},{passive:true});
  });
}
document.querySelectorAll('.nav-button').forEach(b=>b.addEventListener('click',()=>{state.page=b.dataset.page;save();render()}));
render();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
