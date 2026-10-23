
const assets = './';

const initial = {
  morning: [
    { id: 'bed', name: 'ترتيب السرير', icon: 'bed.jpg' },
    { id: 'bath', name: 'دخول الحمام', icon: 'bath.jpg' },
    { id: 'teeth', name: 'غسيل الأسنان', icon: 'toothbrush.jpg' },
    { id: 'prayer', name: 'الصلاة', icon: 'prayer.jpg' },
    { id: 'clothes', name: 'ارتداء الملابس', icon: 'clothes.jpg' },
    { id: 'breakfast', name: 'الفطار', icon: 'breakfast.jpg' }
  ],

  after: [
    { id: 'bag', name: 'حقيبة المدرسة', icon: 'backpack.jpg' },
    { id: 'wash', name: 'غسل اليدين', icon: 'wash.jpg' },
    { id: 'change', name: 'تغيير الملابس', icon: 'shirt.jpg' },
    { id: 'snack', name: 'وجبة خفيفة', icon: 'snack.jpg' },
    { id: 'homework', name: 'واجبات', icon: 'homework.jpg' },
    { id: 'lunch', name: 'غداء', icon: 'lunch.jpg' },
    { id: 'play', name: 'لعب', icon: 'play.jpg' },
    { id: 'sleep', name: 'نوم', icon: 'sleep.jpg' }
  ],

  schedule: [
    { id: 'homework', name: 'الواجبات', icon: 'homework.jpg' },
    { id: 'screen', name: 'شاشة وغداء', icon: 'screen-lunch.jpg' },
    { id: 'quran', name: 'حفظ قرآن', icon: 'quran.jpg' },
    { id: 'play', name: 'لعب حر', icon: 'play.jpg' },
    { id: 'review', name: 'لعب مع مراجعة قرآن', icon: 'play-quran.jpg' },
    { id: 'bedtime', name: 'استعداد للنوم', icon: 'bedtime.jpg' }
  ]
};

const titles = {
  morning: { image: 'header-morning.jpg' },
  after: { image: 'header-after-school.jpg' },
  schedule: { image: 'header-schedule.jpg' }
};

const STORAGE_KEY = 'yahia-routine-v1';

let savedState = null;

try {
  savedState = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || 'null'
  );
} catch (error) {
  savedState = null;
}

let state = savedState || {
  page: 'morning',
  checked: {},
  order: {},
  bagChecked: {}
};

if (!state.checked) state.checked = {};
if (!state.order) state.order = {};
if (!state.bagChecked) state.bagChecked = {};

Object.keys(initial).forEach(page => {
  const savedOrder = Array.isArray(state.order[page])
    ? state.order[page]
    : [];

  const validIds = new Set(
    initial[page].map(item => item.id)
  );

  const existingIds = savedOrder.filter(
    id => validIds.has(id)
  );

  const missingIds = initial[page]
    .map(item => item.id)
    .filter(id => !existingIds.includes(id));

  state.order[page] = [...existingIds, ...missingIds];
});

if (!titles[state.page]) state.page = 'morning';

const $ = selector => document.querySelector(selector);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function orderedItems(page) {
  const itemMap = Object.fromEntries(
    initial[page].map(item => [item.id, item])
  );

  return (state.order[page] || [])
    .map(id => itemMap[id])
    .filter(Boolean);
}

function rowHTML(item, page) {
  const key = page + ':' + item.id;
  const checked = !!state.checked[key];

  return `
    <div class="task-row ${checked ? 'done' : ''}"
         data-id="${item.id}"
         draggable="true">

      <img class="task-art"
           src="${assets + item.icon}"
           alt=""
           loading="lazy"
           draggable="false">

      <span class="task-name">${item.name}</span>

      <input type="checkbox"
             aria-label="تم إنجاز ${item.name}"
             data-check="${key}"
             ${checked ? 'checked' : ''}>

      <button type="button"
              class="drag-handle"
              aria-label="اسحب لإعادة ترتيب المهمة"
              title="اسحب لإعادة الترتيب">⠿</button>
    </div>
  `;
}

function getTaskList(page) {
  if (page === 'morning') {
    return $('.morning-list .task-list');
  }

  if (page === 'after') {
    return $('.after-list .task-list');
  }

  return $('.schedule-list');
}

function render() {
  const page = state.page;
  const conf = titles[page];
  const headerArt = $('#headerArt');

  if (headerArt) {
    headerArt.src = assets + conf.image;
    headerArt.alt =
      page === 'morning'
        ? 'صباح الخير'
        : page === 'after'
          ? 'بعد المدرسة'
          : 'الجدول اليومي';
  }

  document.querySelectorAll('.nav-button').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.page === page
    );
  });

  let html = '';

  if (page === 'morning') {
    html = `
      <div class="panel morning-list">
        <div class="task-list">
          ${orderedItems(page)
            .map(item => rowHTML(item, page))
            .join('')}
        </div>
      </div>
    `;
  } else if (page === 'after') {
    html = `
      <div class="panel after-list">
        <div class="task-list">
          ${orderedItems(page)
            .map(item => rowHTML(item, page))
            .join('')}
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="task-list schedule-list">
        ${orderedItems(page)
          .map(item => rowHTML(item, page))
          .join('')}
      </div>

      <p class="hint">
        ⠿ يمكنك سحب العناصر لإعادة ترتيبها
      </p>
    `;
  }

  const content = $('#content');

  if (!content) {
    console.error('لم يتم العثور على عنصر content');
    return;
  }

  content.innerHTML = `
    ${html}

    <button type="button"
            class="new-day-button"
            id="newDayButton">
      <span class="new-day-icon">☀️</span>
      <span class="new-day-label">يوم جديد</span>
      <span class="new-day-sparkle">✦</span>
    </button>
  `;

  content.querySelectorAll('[data-check]').forEach(box => {
    box.addEventListener('change', event => {
      const key = event.target.dataset.check;
      state.checked[key] = event.target.checked;
      save();
      render();
    });
  });

  // تفعيل السحب في كل الصفحات
  attachDrag(page);

  // زر يوم جديد: تصفير الصفحة الحالية فقط
  const newDayButton = $('#newDayButton');

  if (newDayButton) {
    newDayButton.addEventListener('click', () => {
      const confirmed = confirm(
        'نبدأ يوم جديد؟ هتتم إزالة علامات الصح من مهام الصفحة دي فقط.'
      );

      if (!confirmed) return;

      Object.keys(state.checked).forEach(key => {
        if (key.startsWith(page + ':')) {
          delete state.checked[key];
        }
      });

      save();
      render();
    });
  }

  save();
}

function saveOrder(page) {
  const list = getTaskList(page);
  if (!list) return;

  state.order[page] = [
    ...list.querySelectorAll('.task-row')
  ].map(row => row.dataset.id);

  save();
}

function attachDrag(page) {
  const list = getTaskList(page);
  if (!list) return;

  let dragged = null;
  let touchRow = null;
  let touchStartY = 0;
  let touchMoved = false;

  const rows = list.querySelectorAll('.task-row');

  rows.forEach(row => {
    row.addEventListener('dragstart', event => {
      dragged = row;
      row.classList.add('dragging');

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(
          'text/plain',
          row.dataset.id
        );
      }
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');

      list.querySelectorAll('.drag-over').forEach(element => {
        element.classList.remove('drag-over');
      });

      dragged = null;
      saveOrder(page);
    });

    row.addEventListener('dragover', event => {
      event.preventDefault();

      if (dragged && dragged !== row) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', event => {
      event.preventDefault();
      row.classList.remove('drag-over');

      if (!dragged || dragged === row) return;

      const rect = row.getBoundingClientRect();

      if (event.clientY > rect.top + rect.height / 2) {
        row.after(dragged);
      } else {
        row.before(dragged);
      }

      saveOrder(page);
    });
  });

  list.querySelectorAll('.drag-handle').forEach(handle => {
    handle.addEventListener('touchstart', event => {
      touchRow = handle.closest('.task-row');
      if (!touchRow) return;

      touchStartY = event.touches[0].clientY;
      touchMoved = false;
      touchRow.classList.add('dragging');
    }, { passive: true });

    handle.addEventListener('touchmove', event => {
      if (!touchRow) return;

      const currentY = event.touches[0].clientY;

      if (Math.abs(currentY - touchStartY) > 5) {
        touchMoved = true;
      }

      if (!touchMoved) return;

      const target = [...list.querySelectorAll('.task-row')]
        .find(row => {
          if (row === touchRow) return false;

          const rect = row.getBoundingClientRect();

          return currentY >= rect.top && currentY <= rect.bottom;
        });

      if (!target) return;

      const rect = target.getBoundingClientRect();

      if (currentY > rect.top + rect.height / 2) {
        target.after(touchRow);
      } else {
        target.before(touchRow);
      }
    }, { passive: true });

    const finishTouch = () => {
      if (!touchRow) return;

      touchRow.classList.remove('dragging');
      touchRow = null;
      saveOrder(page);
    };

    handle.addEventListener('touchend', finishTouch, {
      passive: true
    });

    handle.addEventListener('touchcancel', finishTouch, {
      passive: true
    });
  });
}

// التنقل بين الصفحات
document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    if (!titles[page]) return;

    state.page = page;
    save();
    render();
  });
});

// تشغيل التطبيق
render();

// تسجيل Service Worker
if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker
    .register('./sw.js')
    .catch(error => {
      console.error('تعذر تسجيل Service Worker:', error);
    });
}
