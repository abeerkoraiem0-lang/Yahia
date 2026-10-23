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
    { id: 'sleep', name: 'نوم', icon: 'sleep.jpg' },
    { id: 'prepare', name: 'الاستعداد للمدرسة', icon: 'backpack.jpg' },
    { id: 'school', name: 'المدرسة', icon: 'backpack.jpg' },
    { id: 'homework', name: 'الواجبات', icon: 'homework.jpg' },
    { id: 'screen', name: 'شاشة وغداء', icon: 'screen-lunch.jpg' },
    { id: 'quran', name: 'حفظ قرآن', icon: 'quran.jpg' },
    { id: 'play', name: 'لعب حر', icon: 'play.jpg' },
    { id: 'review', name: 'لعب مع مراجعة قرآن', icon: 'play-quran.jpg' },
    { id: 'bedtime', name: 'استعداد للنوم', icon: 'bedtime.jpg' }
  ]
};

const titles = {
  morning: {
    image: 'header-morning.jpg',
    cls: 'morning-list'
  },

  after: {
    image: 'header-after-school.jpg',
    cls: 'after-list'
  },

  schedule: {
    image: 'header-schedule.jpg',
    cls: 'schedule-list'
  }
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
  order: {
    morning: initial.morning.map(item => item.id),
    after: initial.after.map(item => item.id),
    schedule: initial.schedule.map(item => item.id)
  },
  bagChecked: {}
};

// التأكد من وجود بيانات كل الصفحات
if (!state.checked) {
  state.checked = {};
}

if (!state.order) {
  state.order = {};
}

if (!state.bagChecked) {
  state.bagChecked = {};
}

// إضافة المهام الجديدة مع الاحتفاظ بالترتيب القديم
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

  state.order[page] = [
    ...existingIds,
    ...missingIds
  ];
});

if (!titles[state.page]) {
  state.page = 'morning';
}

const $ = selector => document.querySelector(selector);

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function orderedItems(page) {
  const items = initial[page];

  const map = Object.fromEntries(
    items.map(item => [item.id, item])
  );

  const order = state.order[page] || [];

  return order
    .map(id => map[id])
    .filter(Boolean);
}

function rowHTML(item, page) {
  const key = page + ':' + item.id;
  const checked = !!state.checked[key];

  const draggable = page === 'schedule';

  return `
    <div
      class="task-row ${checked ? 'done' : ''}"
      data-id="${item.id}"
      ${draggable ? 'draggable="true"' : ''}
    >

      <img
        class="task-art"
        src="${assets + item.icon}"
        alt=""
        loading="lazy"
      >

      <span class="task-name">
        ${item.name}
      </span>

      <input
        type="checkbox"
        aria-label="تم إنجاز ${item.name}"
        data-check="${key}"
        ${checked ? 'checked' : ''}
      >

      ${
        draggable
          ? `
            <button
              type="button"
              class="drag-handle"
              aria-label="اسحب لإعادة الترتيب"
              title="اسحب لإعادة الترتيب"
            >⠿</button>
          `
          : ''
      }

    </div>
  `;
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

  // تحديث الصفحة النشطة في شريط التنقل
  document.querySelectorAll('.nav-button').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.page === page
    );
  });

  let html = '';

  // صفحة الصباح
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
  }

  // صفحة بعد المدرسة
  else if (page === 'after') {
    html = `
      <div class="panel after-list">

        <div class="task-list">
          ${orderedItems(page)
            .map(item => rowHTML(item, page))
            .join('')}
        </div>

      </div>
    `;
  }

  // صفحة الجدول اليومي
  else {
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

  content.innerHTML = html;

  // حفظ حالة إنجاز كل مهمة
  content.querySelectorAll('[data-check]').forEach(box => {
    box.addEventListener('change', event => {
      const key = event.target.dataset.check;

      state.checked[key] = event.target.checked;

      save();

      render();
    });
  });

  // تفعيل إعادة ترتيب المهام
  if (page === 'schedule') {
    attachDrag();
  }

  save();
}

function attachDrag() {
  let dragged = null;

  const list = $('.schedule-list');

  if (!list) {
    return;
  }

  const rows = list.querySelectorAll('.task-row');

  // إعادة الترتيب بالماوس
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

      document
        .querySelectorAll('.drag-over')
        .forEach(element => {
          element.classList.remove('drag-over');
        });

      dragged = null;

      saveOrder();
    });

    row.addEventListener('dragover', event => {
      event.preventDefault();

      if (row !== dragged) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', event => {
      event.preventDefault();

      row.classList.remove('drag-over');

      if (!dragged || dragged === row) {
        return;
      }

      const rect = row.getBoundingClientRect();

      if (event.clientY > rect.top + rect.height / 2) {
        row.after(dragged);
      } else {
        row.before(dragged);
      }

      saveOrder();
    });

  });

  // إعادة الترتيب باللمس على الموبايل
  let touchRow = null;

  document
    .querySelectorAll('.schedule-list .drag-handle')
    .forEach(handle => {

      handle.addEventListener(
        'touchstart',
        event => {
          touchRow = handle.closest('.task-row');

          if (touchRow) {
            touchRow.classList.add('dragging');
          }
        },
        { passive: true }
      );

      handle.addEventListener(
        'touchmove',
        event => {
          if (!touchRow) {
            return;
          }

          const touch = event.touches[0];
          const y = touch.clientY;

          const currentList = $('.schedule-list');

          if (!currentList) {
            return;
          }

          const target = [
            ...currentList.querySelectorAll('.task-row')
          ].find(row => {
            const rect = row.getBoundingClientRect();

            return (
              y >= rect.top &&
              y <= rect.bottom &&
              row !== touchRow
            );
          });

          if (target) {
            const rect = target.getBoundingClientRect();

            if (y > rect.top + rect.height / 2) {
              target.after(touchRow);
            } else {
              target.before(touchRow);
            }
          }
        },
        { passive: true }
      );

      handle.addEventListener(
        'touchend',
        () => {
          if (!touchRow) {
            return;
          }

          touchRow.classList.remove('dragging');

          touchRow = null;

          saveOrder();
        },
        { passive: true }
      );

      handle.addEventListener(
        'touchcancel',
        () => {
          if (touchRow) {
            touchRow.classList.remove('dragging');
            touchRow = null;
          }

          saveOrder();
        },
        { passive: true }
      );

    });
}

function saveOrder() {
  const list = $('.schedule-list');

  if (!list) {
    return;
  }

  state.order.schedule = [
    ...list.querySelectorAll('.task-row')
  ].map(row => row.dataset.id);

  save();
}

// التنقل بين الصفحات الثلاث
document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;

    if (!titles[page]) {
      return;
    }

    state.page = page;

    save();

    render();
  });
});

// عرض الصفحة عند فتح التطبيق
render();

// تسجيل Service Worker
if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker
    .register('./sw.js')
    .catch(error => {
      console.error(
        'تعذر تسجيل Service Worker:',
        error
      );
    });
}
