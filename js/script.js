/* ==========================================================================
   Apogee 2026 | Infinity Space Club, UPES
   Header, countdown and the registration popup. No libraries.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ------------------------------------------------------------------
     Header: solid background once the page scrolls, and a mobile menu
     ------------------------------------------------------------------ */
  const header = $(".site-header");
  const menuButton = $(".menu-toggle");
  const nav = $("#site-nav");

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
  };
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.matchMedia("(min-width: 920px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  /* ------------------------------------------------------------------
     Countdown to the registration deadline (set in index.html)
     ------------------------------------------------------------------ */
  const countdown = $(".countdown");
  const deadline = new Date(countdown.dataset.deadline).getTime();
  const units = {
    days: $('[data-unit="days"]', countdown),
    hours: $('[data-unit="hours"]', countdown),
    minutes: $('[data-unit="minutes"]', countdown),
    seconds: $('[data-unit="seconds"]', countdown),
  };
  const pad = (n) => String(n).padStart(2, "0");
  let registrationsClosed = false;
  let countdownTimer = null;

  function closeRegistrations() {
    registrationsClosed = true;
    countdown.classList.add("is-closed");
    $(".countdown__label", countdown).textContent = "Registrations have closed";
    $(".countdown__sr", countdown).textContent = "Registrations have closed.";
    $$("[data-open-register]").forEach((button) => {
      button.disabled = true;
      button.textContent = button.dataset.closedLabel || "Registrations closed";
    });
  }

  function tick() {
    const msLeft = deadline - Date.now();
    if (Number.isNaN(deadline) || msLeft <= 0) {
      clearInterval(countdownTimer);
      closeRegistrations();
      return;
    }
    const total = Math.floor(msLeft / 1000);
    units.days.textContent = pad(Math.floor(total / 86400));
    units.hours.textContent = pad(Math.floor((total % 86400) / 3600));
    units.minutes.textContent = pad(Math.floor((total % 3600) / 60));
    units.seconds.textContent = pad(total % 60);
  }
  countdownTimer = setInterval(tick, 1000);
  tick();

  /* ------------------------------------------------------------------
     Registration popup
     ------------------------------------------------------------------ */
  const dialog = $("#register");
  const form = $("#register-form");
  const banner = $(".reg__banner", form);
  const submitButton = $(".reg__submit", form);
  const success = $(".reg__success", dialog);
  const successTitle = $(".reg__success-title", success);
  const phone = form.elements.phone;

  // Until a real Formspree ID is pasted into the form's action, nothing is sent anywhere.
  const isDemo = form.getAttribute("action").includes("YOUR_FORM_ID");
  let lastTrigger = null;

  function openRegistration(trigger) {
    if (registrationsClosed || dialog.open) return;
    lastTrigger = trigger || null;
    setMenu(false);
    dialog.showModal();
  }

  function closeRegistration() {
    if (dialog.open) dialog.close();
  }

  $$("[data-open-register]").forEach((button) => {
    button.addEventListener("click", () => openRegistration(button));
  });
  $$("[data-close-register]", dialog).forEach((button) => {
    button.addEventListener("click", closeRegistration);
  });

  // Close when the dimmed backdrop is clicked (but not when a drag starts inside the form).
  let pressStartedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressStartedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && pressStartedOnBackdrop) closeRegistration();
  });

  dialog.addEventListener("close", () => {
    // After a successful registration, start fresh next time.
    if (!success.hidden) resetForm();
    if (window.location.hash === "#register") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  });

  // Links to #register (for example in a social bio) open the popup directly.
  const openFromHash = () => {
    if (window.location.hash === "#register") openRegistration(null);
  };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* Team size decides how many teammate rows are shown and required */
  function syncTeammates() {
    const size = Number(form.elements.team_size.value) || 2;
    $$(".member", form).forEach((row) => {
      const active = Number(row.dataset.member) <= size;
      row.hidden = !active;
      row.disabled = !active; // disabled fields are neither validated nor submitted
      if (!active) $$("input", row).forEach(clearError);
    });
  }
  $$('input[name="team_size"]', form).forEach((input) => input.addEventListener("change", syncTeammates));
  syncTeammates();

  /* Validation */
  const messages = {
    team_name: { valueMissing: "Enter a team name." },
    track: { valueMissing: "Choose a track." },
    leader_name: { valueMissing: "Enter your full name." },
    email: {
      valueMissing: "Enter your email address.",
      typeMismatch: "Enter an email address like name@college.edu.",
    },
    phone: {
      valueMissing: "Enter your mobile number.",
      customError: "Enter a 10-digit Indian mobile number, like 98xxx xxxxx.",
    },
    college: { valueMissing: "Enter your college or university." },
    year: { valueMissing: "Choose your year of study." },
    member_name: { valueMissing: "Enter this teammate’s full name." },
    member_email: {
      valueMissing: "Enter this teammate’s email address.",
      typeMismatch: "Enter an email address like name@college.edu.",
    },
    attendance_confirmed: { valueMissing: "Confirm that your whole team can attend both days." },
  };

  function checkPhone() {
    const compact = phone.value.trim().replace(/[\s()-]/g, "");
    const valid = compact === "" || /^(?:\+91|91|0)?[6-9]\d{9}$/.test(compact);
    phone.setCustomValidity(valid ? "" : "invalid");
  }

  function messageFor(input) {
    const set = messages[input.dataset.msg || input.name] || {};
    const state = input.validity;
    if (state.valueMissing) return set.valueMissing || "Fill in this field.";
    if (state.typeMismatch) return set.typeMismatch || "Check the format of this field.";
    if (state.customError) return set.customError || "Check this field.";
    if (state.tooLong) return "This is too long.";
    return "";
  }

  function groupInputs(input) {
    return input.type === "radio" ? $$(`input[name="${input.name}"]`, form) : [input];
  }

  function showError(input) {
    const field = input.closest("[data-field]");
    const output = field && $(".field__error", field);
    const message = input.validity.valid ? "" : messageFor(input);
    if (output) output.textContent = message;
    if (field) field.classList.toggle("has-error", Boolean(message));
    groupInputs(input).forEach((el) => {
      if (message) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    });
    return !message;
  }

  function clearError(input) {
    const field = input.closest("[data-field]");
    if (field) {
      field.classList.remove("has-error");
      const output = $(".field__error", field);
      if (output) output.textContent = "";
    }
    groupInputs(input).forEach((el) => el.removeAttribute("aria-invalid"));
  }

  const validatable = () =>
    $$("input, select", form).filter(
      (el) => !el.disabled && el.type !== "hidden" && !el.closest(".hp") && el.willValidate
    );

  // Check a field when the person leaves it, then keep its message current while they fix it.
  form.addEventListener("focusout", (event) => {
    const input = event.target;
    if (!input.matches("input, select") || input.closest(".hp")) return;
    if (input.type === "radio" || input.type === "checkbox") return; // these are checked on submit
    if (input === phone) checkPhone();
    if (input.value !== "" || input.dataset.touched) {
      input.dataset.touched = "true";
      showError(input);
    }
  });
  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input === phone) checkPhone();
    if (input.getAttribute("aria-invalid") === "true") showError(input);
  });
  form.addEventListener("change", (event) => {
    const input = event.target;
    if (input.type === "radio" || input.type === "checkbox" || input.tagName === "SELECT") {
      if (input.getAttribute("aria-invalid") === "true") showError(input);
    }
  });

  /* Submission */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function makeReference() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    return "APG-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  }

  function setBusy(busy) {
    submitButton.disabled = busy;
    submitButton.setAttribute("aria-busy", String(busy));
    submitButton.textContent = busy ? "Registering…" : "Register team";
  }

  function showBanner(text) {
    banner.textContent = text;
    banner.hidden = !text;
    if (text) $(".reg__body", form).scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSuccess(data) {
    $('[data-out="team"]', success).textContent = data.get("team_name");
    $('[data-out="ref"]', success).textContent = data.get("reference");
    $('[data-out="email"]', success).textContent = data.get("email");
    $(".reg__demo", success).hidden = !isDemo;
    form.hidden = true;
    success.hidden = false;
    successTitle.focus();
  }

  function resetForm() {
    form.reset();
    $$("input, select", form).forEach((el) => {
      delete el.dataset.touched;
      clearError(el);
    });
    phone.setCustomValidity("");
    showBanner("");
    syncTeammates();
    success.hidden = true;
    form.hidden = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    showBanner("");
    checkPhone();

    let firstInvalid = null;
    const seenGroups = new Set();
    for (const input of validatable()) {
      if (input.type === "radio") {
        if (seenGroups.has(input.name)) continue;
        seenGroups.add(input.name);
      }
      input.dataset.touched = "true";
      if (!showError(input) && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    form.elements.reference.value = makeReference();
    const data = new FormData(form);
    setBusy(true);

    try {
      if (isDemo) {
        await wait(900);
        console.info("[Apogee] Demo mode: registration not sent. Add your Formspree form ID to index.html.", Object.fromEntries(data));
      } else {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let response;
        try {
          response = await fetch(form.action, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        if (!response.ok) {
          let detail = "";
          try {
            const body = await response.json();
            if (Array.isArray(body.errors)) detail = body.errors.map((e) => e.message).join(" ");
          } catch (_) {
            /* the server didn't send JSON */
          }
          throw new Error(detail || `The server answered with status ${response.status}.`);
        }
      }
      showSuccess(data);
    } catch (error) {
      let text;
      if (error.name === "AbortError") {
        text = "The registration server took too long to answer. Try again in a moment.";
      } else if (error instanceof TypeError) {
        text = "We couldn’t reach the registration server. Check your internet connection and try again.";
      } else {
        text = `Your registration didn’t go through: ${error.message}`;
      }
      showBanner(`${text} Your answers are still here.`);
    } finally {
      setBusy(false);
    }
  });
})();
