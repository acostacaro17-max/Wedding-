/* ==========================================================
   Wedding details — edit these as plans are confirmed.
   Any value left empty keeps the placeholder text in the page.
   ========================================================== */
const CONFIG = {
  // Used by the countdown in the hero. ISO format, local time in Vilnius.
  // Placeholder until the exact date is set.
  countdownTo: "2027-08-01T14:00:00+03:00",

  ceremonyDate: "",   // e.g. "Friday, 6 August 2027"
  ceremonyTime: "",   // e.g. "2:00 pm"
  ceremonyVenue: "",  // e.g. "Vilnius Civil Registry Office, Old Town"

  marsanneDates: "",  // e.g. "Thursday 12 – Sunday 15 August 2027"
  receptionDate: "",  // e.g. "Saturday, 14 August 2027 · from 6 pm"
  marsanneVenue: "",  // e.g. "Domaine de …, Marsanne"
  night1: "",         // e.g. "Thursday 12 August"
  night2: "",         // e.g. "Saturday 14 August"
  night3: "",         // e.g. "Sunday 15 August"

  rsvpDeadline: "",   // e.g. "Kindly respond by 1 March 2027."

  // RSVP delivery. Set ONE of these:
  //  - rsvpEndpoint: a form service URL (e.g. https://formspree.io/f/xxxxxx)
  //  - rsvpEmail:    opens the guest's email app with their answers pre-filled
  rsvpEndpoint: "",
  rsvpEmail: "",
};

document.documentElement.classList.remove("no-js");

/* ---------- Fill in configured details ---------- */
document.querySelectorAll("[data-fill]").forEach((el) => {
  const value = CONFIG[el.dataset.fill];
  if (value) el.textContent = value;
});

/* ---------- Navigation ---------- */
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  links.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- Countdown ---------- */
const target = new Date(CONFIG.countdownTo).getTime();
const units = {};
document.querySelectorAll("#countdown [data-unit]").forEach((el) => (units[el.dataset.unit] = el));

function tick() {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  units.days.textContent = Math.floor(s / 86400);
  units.hours.textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  units.minutes.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  units.seconds.textContent = String(s % 60).padStart(2, "0");
}
if (!Number.isNaN(target)) {
  tick();
  setInterval(tick, 1000);
}

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal, .section .title, .chapter__body, .card, .timeline li");
if ("IntersectionObserver" in window) {
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- RSVP ---------- */
const form = document.getElementById("rsvpForm");
const status = document.getElementById("formStatus");

const setStatus = (msg, type) => {
  status.textContent = msg;
  status.className = "form__status" + (type ? " is-" + type : "");
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = form.elements.name;
  const email = form.elements.email;
  const choices = ["attend_vilnius", "attend_marsanne", "decline"].some((n) => form.elements[n].checked);

  name.classList.toggle("is-invalid", !name.value.trim());
  email.classList.toggle("is-invalid", !email.validity.valid || !email.value);

  if (!name.value.trim() || !email.value || !email.validity.valid) {
    return setStatus("Please add your name and a valid email.", "error");
  }
  if (!choices) {
    return setStatus("Please let us know which events you can attend.", "error");
  }

  const data = Object.fromEntries(new FormData(form));

  if (CONFIG.rsvpEndpoint) {
    setStatus("Sending…");
    try {
      const res = await fetch(CONFIG.rsvpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.statusText);
      form.reset();
      setStatus("Thank you! Your RSVP has been received.", "success");
    } catch {
      setStatus("Something went wrong — please try again or contact us directly.", "error");
    }
    return;
  }

  if (CONFIG.rsvpEmail) {
    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Vilnius ceremony: ${data.attend_vilnius ? "Yes" : "No"}`,
      `Marsanne celebration: ${data.attend_marsanne ? "Yes" : "No"}`,
      `Unable to attend: ${data.decline ? "Yes" : "No"}`,
      `Guests: ${data.guests}`,
      `Dietary: ${data.dietary || "—"}`,
      "",
      data.message || "",
    ];
    const href = `mailto:${CONFIG.rsvpEmail}?subject=${encodeURIComponent("RSVP — " + data.name)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = href;
    setStatus("Your email app should open — just press send. Thank you!", "success");
    return;
  }

  setStatus("Online RSVP opens soon — please check back, or contact us directly.", "error");
});
