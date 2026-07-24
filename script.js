const memories = [
  { month: 12, label: "JUL", date: "2025.07", caption: "첫 번째 생일을 맞이한 날", image: "./images/12.jpg" },
  { month: 13, label: "AUG", date: "2025.08", caption: "혼자 일어서기 시작한 날", image: "./images/13.jpg" },
  { month: 14, label: "SEP", date: "2025.09", caption: "인생 첫 더운 여름", image: "./images/14.jpg" },
  { month: 15, label: "OCT", date: "2025.10", caption: "친할아버지와 함께한 괌 여행", image: "./images/15.jpg" },
  { month: 16, label: "NOV", date: "2025.11", caption: "할머니와 어린이대공원 간 날", image: "./images/16.jpg" },
  { month: 17, label: "DEC", date: "2025.12", caption: "삼촌 집에서 환하게 웃던 날", image: "./images/17.jpg" },
  { month: 18, label: "JAN", date: "2026.01", caption: "새해를 함께 맞이한 순간", image: "./images/18.jpg" },
  { month: 19, label: "FEB", date: "2026.02", caption: "색동 한복을 입고 맞이한 설날", image: "./images/19.jpg" },
  { month: 20, label: "MAR", date: "2026.03", caption: "할머니와 함께 결혼식에 간 날", image: "./images/20.jpg" },
  { month: 21, label: "APR", date: "2026.04", caption: "벚꽃처럼 웃음이 피어난 일본 여행", image: "./images/21.jpg" },
  { month: 22, label: "MAY", date: "2026.05", caption: "멋쟁이로 한층 성장한 22개월", image: "./images/22.jpg" },
  { month: 23, label: "JUN", date: "2026.06", caption: "두 번째 괌에서 행복한 시간", image: "./images/23.jpg" }
];

const feed = document.querySelector("#feed");
const timeline = document.querySelector("#timelineMonths");

memories.forEach((item, index) => {
  const card = document.createElement("article");
  card.className = "card";
  card.id = `month-${item.month}`;
  card.dataset.month = item.month;

  card.innerHTML = `
    <img
      class="card__image"
      src="${item.image}"
      alt="은재 ${item.month}개월 사진"
      loading="${index < 2 ? "eager" : "lazy"}"
      onerror="this.src='./images/placeholder.svg'"
    />
    <div class="card__copy">
      <span class="card__month">${item.month}</span>
      <span class="card__unit">MONTHS</span>
      <div class="card__divider"></div>
      <p class="card__caption">${item.caption}</p>
      <div class="card__date">${item.date}</div>
    </div>
    ${index === 0 ? '<div class="card__hint">SCROLL</div>' : ""}
  `;

  feed.appendChild(card);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "timeline__item";
  button.dataset.month = item.month;
  button.textContent = item.label;
  button.setAttribute("aria-label", `${item.month}개월로 이동`);
  button.addEventListener("click", () => {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  timeline.appendChild(button);
});

const cards = [...document.querySelectorAll(".card")];
const timelineItems = [...document.querySelectorAll(".timeline__item")];

function activate(month) {
  cards.forEach(card => card.classList.toggle("is-active", card.dataset.month === month));
  timelineItems.forEach(item => {
    const active = item.dataset.month === month;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
}

const observer = new IntersectionObserver(
  entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) activate(visible.target.dataset.month);
  },
  {
    threshold: [0.35, 0.55, 0.75],
    rootMargin: "-10% 0px -25% 0px"
  }
);

cards.forEach(card => observer.observe(card));
activate("12");


/* 모바일 한 장씩 넘기는 스와이프 */
let pageIndex = 0;
let startY = 0;
let currentY = 0;
let touching = false;
let moving = false;

const pages = [...document.querySelectorAll(".card"), document.querySelector("#invitation")].filter(Boolean);

function nearestPage() {
  const center = window.scrollY + window.innerHeight / 2;
  let result = 0;
  let distance = Infinity;

  pages.forEach((page, index) => {
    const pageCenter = page.offsetTop + page.offsetHeight / 2;
    const diff = Math.abs(center - pageCenter);
    if (diff < distance) {
      distance = diff;
      result = index;
    }
  });

  return result;
}

function resetSwipe(page) {
  if (!page) return;
  page.classList.remove("is-dragging", "is-returning", "is-leaving-up", "is-leaving-down", "is-arriving");
  page.style.removeProperty("--drag-y");
  page.style.removeProperty("--drag-progress");
}

function moveTo(index, direction) {
  if (moving) return;

  const fromIndex = nearestPage();
  const toIndex = Math.max(0, Math.min(pages.length - 1, index));
  if (fromIndex === toIndex) {
    resetSwipe(pages[fromIndex]);
    return;
  }

  moving = true;
  const from = pages[fromIndex];
  const to = pages[toIndex];

  from.classList.add(direction === "up" ? "is-leaving-up" : "is-leaving-down");
  to.classList.add("is-arriving");
  to.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    pages.forEach(resetSwipe);
    pageIndex = toIndex;
    moving = false;
  }, 620);
}

document.addEventListener("touchstart", event => {
  if (moving || event.touches.length !== 1) return;
  pageIndex = nearestPage();
  startY = event.touches[0].clientY;
  currentY = startY;
  touching = true;
  pages[pageIndex]?.classList.add("is-dragging");
}, { passive: true });

document.addEventListener("touchmove", event => {
  if (!touching || moving || event.touches.length !== 1) return;

  currentY = event.touches[0].clientY;
  const delta = currentY - startY;
  const page = pages[pageIndex];
  const progress = Math.min(Math.abs(delta) / 180, 1);

  page.style.setProperty("--drag-y", `${delta * .22}px`);
  page.style.setProperty("--drag-progress", progress.toFixed(3));
}, { passive: true });

document.addEventListener("touchend", () => {
  if (!touching || moving) return;
  touching = false;

  const delta = currentY - startY;
  const threshold = Math.min(72, window.innerHeight * .09);
  const page = pages[pageIndex];

  if (delta < -threshold) {
    moveTo(pageIndex + 1, "up");
  } else if (delta > threshold) {
    moveTo(pageIndex - 1, "down");
  } else {
    page?.classList.add("is-returning");
    window.setTimeout(() => resetSwipe(page), 320);
  }
}, { passive: true });

document.addEventListener("touchcancel", () => {
  touching = false;
  resetSwipe(pages[pageIndex]);
}, { passive: true });

window.addEventListener("scroll", () => {
  if (!touching && !moving) pageIndex = nearestPage();
}, { passive: true });
