const track = document.getElementById('track');
const originalImages = Array.from(track.querySelectorAll('img'));
const dotsContainer = document.getElementById('dots');
const carousel = document.querySelector('.carousel');

const GAP = 10;
const TOTAL = originalImages.length;   // 6

let slidesPerView = 3;
let slideWidth = 0;
let currentIndex = 0;                  // индекс в массиве с клонами
let dots = [];
let isAnimating = false;
let allSlides = [];
let autoplay = null;

/* ====== Определяем количество слайдов по ширине ====== */
function getSlidesPerView() {
  const w = window.innerWidth;
  if (w <= 480) return 1;
  if (w <= 768) return 2;
  return 3;
}

/* ====== Клонирование слайдов ====== */
function cloneSlides() {
  // Последние SPV — в начало
  const lastClones = originalImages.slice(-slidesPerView).map(img => {
    const clone = img.cloneNode(true);
    clone.dataset.clone = 'true';
    return clone;
  });

  // Первые SPV — в конец
  const firstClones = originalImages.slice(0, slidesPerView).map(img => {
    const clone = img.cloneNode(true);
    clone.dataset.clone = 'true';
    return clone;
  });

  lastClones.reverse().forEach(clone => {
    track.insertBefore(clone, track.firstChild);
  });

  firstClones.forEach(clone => {
    track.appendChild(clone);
  });
}

/* ====== Полная пересборка карусели ====== */
function rebuild() {
  // Очищаем трек и возвращаем оригинальные картинки
  track.innerHTML = '';
  originalImages.forEach(img => {
    img.style.width = '';
    track.appendChild(img);
  });

  slidesPerView = getSlidesPerView();

  // Клонируем заново
  cloneSlides();

  allSlides = Array.from(track.querySelectorAll('img'));

  // Пересчёт ширины
  const containerWidth = carousel.clientWidth;
  slideWidth = (containerWidth - GAP * (slidesPerView - 1)) / slidesPerView;
  allSlides.forEach(img => {
    img.style.width = slideWidth + 'px';
  });

  // Стартовый индекс — первый «настоящий» слайд
  currentIndex = slidesPerView;

  // Точки — по реальным слайдам
  dotsContainer.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToReal(i));
    dotsContainer.appendChild(dot);
  }
  dots = dotsContainer.querySelectorAll('span');

  update(false);
}

/* ====== Обновление позиции трека и точек ====== */
function update(animate = true) {
  if (!animate) {
    track.style.transition = 'none';
  } else {
    track.style.transition = 'transform 0.5s ease';
  }

  const offset = currentIndex * (slideWidth + GAP);
  track.style.transform = `translateX(-${offset}px)`;

  // Определяем «настоящий» индекс для точек
  let realIndex = (currentIndex - slidesPerView) % TOTAL;
  if (realIndex < 0) realIndex += TOTAL;

  dots.forEach((d, i) => d.classList.toggle('active', i === realIndex));

  if (!animate) {
    void track.offsetWidth;
    track.style.transition = 'transform 0.5s ease';
  }
}

/* ====== Навигация ====== */
function next() {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex++;
  update(true);
}

function prev() {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex--;
  update(true);
}

function goToReal(realIndex) {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex = realIndex + slidesPerView;
  update(true);
}

/* ====== Бесшовный переход ====== */
track.addEventListener('transitionend', () => {
  isAnimating = false;

  // Ушли вправо за пределы реальных слайдов
  if (currentIndex >= TOTAL + slidesPerView) {
    currentIndex -= TOTAL;
    update(false);
  }

  // Ушли влево
  if (currentIndex < slidesPerView) {
    currentIndex += TOTAL;
    update(false);
  }
});

/* ====== Кнопки ====== */
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', prev);

/* ====== Автопрокрутка ====== */
function startAutoplay() {
  stopAutoplay();
  autoplay = setInterval(next, 3000);
}

function stopAutoplay() {
  if (autoplay) {
    clearInterval(autoplay);
    autoplay = null;
  }
}

carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

/* ====== Ресайз ====== */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newSPV = getSlidesPerView();
    if (newSPV !== slidesPerView) {
      // Изменилось количество видимых слайдов — пересобираем
      rebuild();
    } else {
      // Просто пересчитываем ширину
      const containerWidth = carousel.clientWidth;
      slideWidth = (containerWidth - GAP * (slidesPerView - 1)) / slidesPerView;
      allSlides.forEach(img => {
        img.style.width = slideWidth + 'px';
      });
      update(false);
    }
    startAutoplay();
  }, 150);
});

/* ====== Старт ====== */
rebuild();
startAutoplay();