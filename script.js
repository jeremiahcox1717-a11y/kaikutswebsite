const SHOP = {
  name: "Kai Kuts",
  hours: {
    Sunday: null,
    Monday: null,
    Tuesday: ["10:00", "19:00"],
    Wednesday: ["10:00", "19:00"],
    Thursday: ["10:00", "19:00"],
    Friday: ["10:00", "19:00"],
    Saturday: ["09:00", "16:00"],
  },
  slotMinutes: 30,
  services: [
    {
      id: "skin-fade",
      name: "Skin fade",
      minutes: 45,
      price: 35,
      blurb: "Tight blend, clean line. Placeholder price.",
    },
    {
      id: "classic-cut",
      name: "Classic cut",
      minutes: 30,
      price: 30,
      blurb: "Scissor work and a tidy finish.",
    },
    {
      id: "beard",
      name: "Beard shape",
      minutes: 20,
      price: 20,
      blurb: "Line-up, shape, and oil.",
    },
    {
      id: "cut-beard",
      name: "Cut + beard",
      minutes: 60,
      price: 50,
      blurb: "Full chair. Cut and beard together.",
    },
    {
      id: "kids",
      name: "Kids cut",
      minutes: 30,
      price: 25,
      blurb: "Placeholder — confirm age policy later.",
    },
    {
      id: "shave",
      name: "Hot towel shave",
      minutes: 30,
      price: 35,
      blurb: "Classic straight-razor service.",
    },
  ],
};

const STORAGE_KEY = "kai-kuts-bookings";
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const state = {
  serviceId: "",
  date: "",
  time: "",
  month: startOfMonth(new Date()),
};

const els = {
  serviceGrid: document.getElementById("service-grid"),
  bookServices: document.getElementById("book-services"),
  hoursList: document.getElementById("hours-list"),
  hoursSummary: document.querySelector("[data-hours-summary]"),
  calLabel: document.getElementById("cal-label"),
  calDays: document.getElementById("cal-days"),
  calPrev: document.getElementById("cal-prev"),
  calNext: document.getElementById("cal-next"),
  timeSlots: document.getElementById("time-slots"),
  slotHint: document.getElementById("slot-hint"),
  form: document.getElementById("booking-form"),
  summary: document.getElementById("booking-summary"),
  modal: document.getElementById("confirm-modal"),
  confirmBody: document.getElementById("confirm-body"),
  confirmClose: document.getElementById("confirm-close"),
  navToggle: document.querySelector(".nav-toggle"),
  year: document.getElementById("year"),
};

init();

function init() {
  els.year.textContent = String(new Date().getFullYear());
  renderHours();
  renderServices();
  renderCalendar();
  renderTimes();
  updateSummary();
  hydratePhotos();
  bindNav();
  bindBooking();
}

function hydratePhotos() {
  document.querySelectorAll(".photo-slot[data-image]").forEach((slot) => {
    const src = slot.getAttribute("data-image");
    if (!src) return;
    slot.style.backgroundImage = `url("${src}")`;
    slot.classList.add("has-photo");
  });
}

function bindNav() {
  els.navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    els.navToggle.setAttribute("aria-expanded", String(open));
    els.navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      els.navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindBooking() {
  els.calPrev.addEventListener("click", () => {
    state.month = addMonths(state.month, -1);
    renderCalendar();
  });

  els.calNext.addEventListener("click", () => {
    state.month = addMonths(state.month, 1);
    renderCalendar();
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitBooking();
  });

  els.confirmClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modal.hidden) closeModal();
  });
}

function renderHours() {
  els.hoursList.innerHTML = DAY_NAMES.map((day) => {
    const hours = SHOP.hours[day];
    const value = hours ? `${formatTime(hours[0])} – ${formatTime(hours[1])}` : "Closed";
    return `<li><span>${day.slice(0, 3)}</span><span>${value}</span></li>`;
  }).join("");

  const openDays = DAY_NAMES.filter((day) => SHOP.hours[day]);
  if (openDays.length) {
    els.hoursSummary.textContent = `${openDays[0].slice(0, 3)}–${openDays[openDays.length - 1].slice(0, 3)} · see hours`;
  }
}

function renderServices() {
  els.serviceGrid.innerHTML = SHOP.services
    .map(
      (service) => `
        <article class="service-card">
          <h3>${service.name}</h3>
          <div class="price">$${service.price}</div>
          <p>${service.blurb} · ${service.minutes} min</p>
        </article>
      `
    )
    .join("");

  els.bookServices.innerHTML = SHOP.services
    .map(
      (service) => `
        <button class="book-choice" type="button" role="listitem" data-service="${service.id}">
          <strong>${service.name}</strong>
          <span>$${service.price} · ${service.minutes} min</span>
        </button>
      `
    )
    .join("");

  els.bookServices.querySelectorAll(".book-choice").forEach((button) => {
    button.addEventListener("click", () => {
      state.serviceId = button.dataset.service;
      state.time = "";
      syncSelected(".book-choice", "service", state.serviceId);
      clearError("service");
      renderTimes();
      updateSummary();
    });
  });
}

function renderCalendar() {
  const year = state.month.getFullYear();
  const month = state.month.getMonth();
  els.calLabel.textContent = state.month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(`<span></span>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const iso = toISODate(date);
    const closed = !SHOP.hours[DAY_NAMES[date.getDay()]];
    const past = startOfDay(date) < startOfDay(new Date());
    const disabled = closed || past;
    cells.push(`
      <button
        class="cal-day${state.date === iso ? " is-selected" : ""}"
        type="button"
        data-date="${iso}"
        ${disabled ? "disabled" : ""}
        aria-label="${date.toDateString()}"
      >${day}</button>
    `);
  }

  els.calDays.innerHTML = cells.join("");
  els.calDays.querySelectorAll(".cal-day:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      state.date = button.dataset.date;
      state.time = "";
      renderCalendar();
      renderTimes();
      clearError("date");
      updateSummary();
    });
  });
}

function renderTimes() {
  els.timeSlots.innerHTML = "";
  if (!state.date) {
    els.slotHint.textContent = "Choose a date to see times.";
    return;
  }

  const date = parseISODate(state.date);
  const hours = SHOP.hours[DAY_NAMES[date.getDay()]];
  if (!hours) {
    els.slotHint.textContent = "Closed that day.";
    return;
  }

  const service = selectedService();
  const duration = service ? service.minutes : SHOP.slotMinutes;
  const slots = buildSlots(state.date, hours[0], hours[1], duration);
  const taken = loadBookings()
    .filter((booking) => booking.date === state.date)
    .map((booking) => booking.time);

  if (!slots.length) {
    els.slotHint.textContent = "No times left this day.";
    return;
  }

  els.slotHint.textContent = service
    ? `${service.name} · ${duration} min slots`
    : "Select a service to lock a length. Showing open times.";

  els.timeSlots.innerHTML = slots
    .map((slot) => {
      const booked = taken.includes(slot);
      return `
        <button
          class="time-slot${state.time === slot ? " is-selected" : ""}"
          type="button"
          data-time="${slot}"
          ${booked ? "disabled" : ""}
        >${booked ? "Taken" : formatTime(slot)}</button>
      `;
    })
    .join("");

  els.timeSlots.querySelectorAll(".time-slot:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      state.time = button.dataset.time;
      syncSelected(".time-slot", "time", state.time);
      clearError("time");
      updateSummary();
    });
  });
}

function submitBooking() {
  const form = new FormData(els.form);
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const email = String(form.get("email") || "").trim();
  const notes = String(form.get("notes") || "").trim();
  let valid = true;

  if (!state.serviceId) {
    setError("service", "Pick a service.");
    valid = false;
  }
  if (!state.date) {
    setError("date", "Pick a day.");
    valid = false;
  }
  if (!state.time) {
    setError("time", "Pick a time.");
    valid = false;
  }
  if (!name || !phone) {
    setError("details", "Name and phone are required.");
    valid = false;
  } else {
    clearError("details");
  }

  if (!valid) return;

  const service = selectedService();
  const booking = {
    id: crypto.randomUUID(),
    serviceId: service.id,
    serviceName: service.name,
    date: state.date,
    time: state.time,
    minutes: service.minutes,
    price: service.price,
    name,
    phone,
    email,
    notes,
    createdAt: new Date().toISOString(),
  };

  const bookings = loadBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

  els.confirmBody.textContent = `${name}, ${service.name} is held for ${formatLongDate(state.date)} at ${formatTime(state.time)}. We’ll confirm by phone or message once the shop number is on the site.`;
  els.modal.hidden = false;
  els.form.reset();
  state.serviceId = "";
  state.date = "";
  state.time = "";
  syncSelected(".book-choice", "service", "");
  renderCalendar();
  renderTimes();
  updateSummary();
  els.confirmClose.focus();
}

function updateSummary() {
  const service = selectedService();
  if (!service) {
    els.summary.textContent = "Select a service to start.";
    return;
  }
  const when = state.date && state.time
    ? `${formatLongDate(state.date)} · ${formatTime(state.time)}`
    : "pick a day and time";
  els.summary.textContent = `${service.name} · $${service.price} · ${when}`;
}

function selectedService() {
  return SHOP.services.find((service) => service.id === state.serviceId) || null;
}

function buildSlots(isoDate, open, close, duration) {
  const slots = [];
  let cursor = parseMinutes(open);
  const end = parseMinutes(close);
  const now = new Date();
  const today = toISODate(now) === isoDate;

  while (cursor + duration <= end) {
    if (!(today && cursor <= now.getHours() * 60 + now.getMinutes())) {
      slots.push(fromMinutes(cursor));
    }
    cursor += SHOP.slotMinutes;
  }
  return slots;
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setError(name, message) {
  const node = document.querySelector(`[data-error-for="${name}"]`);
  if (node) node.textContent = message;
}

function clearError(name) {
  setError(name, "");
}

function syncSelected(selector, key, value) {
  document.querySelectorAll(selector).forEach((node) => {
    const selected = node.dataset[key] === value;
    node.classList.toggle("is-selected", selected);
    node.setAttribute("aria-pressed", String(selected));
  });
}

function closeModal() {
  els.modal.hidden = true;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatTime(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return minutes ? `${hour12}:${String(minutes).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
}

function formatLongDate(iso) {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
