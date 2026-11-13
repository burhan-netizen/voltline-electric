(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header state + mobile nav position */
  var header = document.querySelector(".site-header");
  var banner = document.querySelector(".demo-banner");
  function setHdr() {
    var top = header.getBoundingClientRect().bottom;
    doc.style.setProperty("--hdr", Math.max(top, 60) + "px");
    header.classList.toggle("scrolled", window.scrollY > (banner ? banner.offsetHeight : 0) + 4);
  }
  window.addEventListener("scroll", setHdr, { passive: true });
  window.addEventListener("resize", setHdr);
  setHdr();

  /* mobile menu */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  function closeMenu() {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    setHdr();
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(); menuBtn.focus(); }
  });

  /* reveal on scroll (content is visible without JS) */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      io.observe(el);
    });
  }

  /* service tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.svc-tabs [role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(next); next.focus(); e.preventDefault();
      }
    });
  });

  /* quick check */
  var ISSUES = {
    outage: { t: "Find the cause. Not just flip it back on.", d: "People call us after other technicians said they couldn't find anything. Tracing the real fault is what we do best.", l: ["Service, panel and circuits checked step by step", "The fault others missed, found", "Power restored safely, with an explanation"] },
    tripping: { t: "A breaker that keeps tripping is telling you something.", d: "Swapping the breaker rarely fixes it. We find out why it trips first.", l: ["Load check on the circuit", "Tests for shorts, ground faults and loose connections", "Parts replaced only when that's the real problem"] },
    flicker: { t: "Flicker usually means a loose connection or an overload.", d: "It's worth fixing early. Loose connections heat up over time.", l: ["Traced from fixture back to the panel", "Connections tightened and torqued to spec", "A straight answer if it's on the utility side"] },
    panel: { t: "Old panels and fuse boxes, upgraded properly.", d: "A lot of Philadelphia homes still run on equipment from another era. We know it inside out.", l: ["Panel replacement and upgrades", "Subpanels for renovations and new loads", "Service upgrades for more capacity"] },
    violation: { t: "Failed inspections corrected so they actually pass.", d: "Not a patch. The electrical work brought up to code.", l: ["We review the inspection report with you", "The work is corrected to code", "We meet the inspector on site if needed"] },
    lighting: { t: "Fixtures hung level and wired right.", d: "Lighting showrooms in the city send their customers to us for a reason.", l: ["Fixtures, recessed lighting and ceiling fans", "Designer pieces handled with care", "New switches and dimmers where you want them"] },
    ev: { t: "An EV charger your panel can actually handle.", d: "The charger is the easy part. The load check is what matters.", l: ["Load calculation first", "Dedicated circuit and charger install", "Panel upgrade only if it's truly needed"] },
    commercial: { t: "Commercial and industrial, done to spec.", d: "From shop fit-outs to 400 amp mains, drives and motor controls.", l: ["Fit-outs, feeders and service upgrades", "Drives, motor controls and UPS bypass setups", "Torqued, labelled and tested"] }
  };
  var chips = document.querySelectorAll(".chip");
  var empty = document.querySelector(".result-empty");
  var body = document.querySelector(".result-body");
  var rTitle = body.querySelector(".result-title");
  var rText = body.querySelector(".result-text");
  var rList = body.querySelector(".result-list");
  var rCta = body.querySelector("[data-prefill]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.getAttribute("data-issue");
      var data = ISSUES[key];
      if (!data) return;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      rTitle.textContent = data.t;
      rText.textContent = data.d;
      while (rList.firstChild) rList.removeChild(rList.firstChild);
      data.l.forEach(function (item) { var li = document.createElement("li"); li.textContent = item; rList.appendChild(li); });
      rCta.setAttribute("data-prefill", key);
      empty.hidden = true;
      body.hidden = false;
      body.classList.remove("enter"); void body.offsetWidth; body.classList.add("enter");
    });
  });
  rCta.addEventListener("click", function () {
    var key = rCta.getAttribute("data-prefill");
    var sel = document.getElementById("f-service");
    if (key && sel.querySelector('option[value="' + key + '"]')) sel.value = key;
  });

  /* videos: autoplay muted while on screen, pause when off screen.
     Reduced-motion users get a play button instead. */
  var vids = Array.prototype.slice.call(document.querySelectorAll("video[data-autoplay]"));
  function tryPlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () { var w = v.closest(".vid"); if (w) w.classList.add("manual"); }); }
  if (reduce || !("IntersectionObserver" in window)) {
    vids.forEach(function (v) { var w = v.closest(".vid"); if (w) w.classList.add("manual"); });
  } else {
    var vio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (!v.dataset.userPaused) tryPlay(v); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { vio.observe(v); });
  }
  document.querySelectorAll(".vid").forEach(function (wrap) {
    var v = wrap.querySelector("video");
    var play = wrap.querySelector(".play");
    var sound = wrap.querySelector(".sound");
    v.addEventListener("play", function () { wrap.classList.add("playing"); });
    v.addEventListener("pause", function () { if (wrap.classList.contains("manual")) wrap.classList.remove("playing"); });
    if (play) play.addEventListener("click", function () { delete v.dataset.userPaused; tryPlay(v); });
    if (sound) sound.addEventListener("click", function () {
      var on = v.muted;
      // only one video makes sound at a time
      if (on) document.querySelectorAll(".vid video").forEach(function (o) {
        if (o !== v && !o.muted) { o.muted = true; var b = o.closest(".vid").querySelector(".sound"); if (b) { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Turn sound on"); } }
      });
      v.muted = !on;
      if (on) { v.currentTime = 0; tryPlay(v); }
      sound.setAttribute("aria-pressed", String(on));
      sound.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    });
  });

  /* open now (New York time) */
  try {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var get = function (t) { var f = parts.find(function (p) { return p.type === t; }); return f ? f.value : ""; };
    var day = get("weekday");
    var mins = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
    var weekend = day === "Sat" || day === "Sun";
    var open = day === "Sun" ? false : day === "Sat" ? mins >= 480 && mins < 960 : mins >= 420 && mins < 1140;
    var status = document.getElementById("open-status");
    status.textContent = open ? "Open now" : "Closed now · emergency line open";
    status.classList.add(open ? "is-open" : "is-closed");
    var rows = document.querySelectorAll(".hours div");
    var idx = day === "Sat" ? 1 : day === "Sun" ? 2 : 0;
    if (rows[idx]) rows[idx].classList.add("today");
  } catch (e) { /* leave default text */ }

  /* estimate form (demo: validated locally, nothing is sent) */
  var form = document.getElementById("estimate-form");
  var started = Date.now();
  var msg = document.getElementById("f-msg");
  var count = document.getElementById("msg-count");
  msg.addEventListener("input", function () { count.textContent = msg.value.length + " / 1200"; });

  var rules = {
    name: function (v) { return v.trim().length >= 2 && v.trim().length <= 80 && !/[<>{}]/.test(v); },
    phone: function (v) { var d = v.replace(/\D/g, ""); return /^[0-9()+\-.\s]{7,20}$/.test(v.trim()) && d.length >= 10 && d.length <= 15; },
    borough: function (v) { return v !== ""; },
    service: function (v) { return v !== ""; }
  };
  var ids = { name: "f-name", phone: "f-phone", borough: "f-borough", service: "f-service" };
  function check(key) {
    var el = document.getElementById(ids[key]);
    var ok = rules[key](el.value);
    var err = document.getElementById("e-" + key);
    el.setAttribute("aria-invalid", String(!ok));
    if (ok) el.removeAttribute("aria-describedby"); else el.setAttribute("aria-describedby", "e-" + key);
    err.hidden = ok;
    return ok;
  }
  Object.keys(ids).forEach(function (k) {
    // re-check while typing once a field has been flagged, so errors clear before the next click
    ["input", "change"].forEach(function (ev) {
      document.getElementById(ids[k]).addEventListener(ev, function () { if (this.getAttribute("aria-invalid") === "true") check(k); });
    });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(ids).forEach(function (k) { if (!check(k) && !firstBad) firstBad = document.getElementById(ids[k]); });
    if (firstBad) { firstBad.focus(); return; }
    // spam guards: honeypot, minimum fill time, simple rate limit
    if (form.elements.company_website.value) return;
    if (Date.now() - started < 2500) return;
    try {
      var last = parseInt(localStorage.getItem("vl_last_submit") || "0", 10);
      if (Date.now() - last < 60000) { alert0(); return; }
      localStorage.setItem("vl_last_submit", String(Date.now()));
    } catch (err) { /* storage unavailable, continue */ }
    var ok = document.getElementById("form-success");
    document.getElementById("ok-name").textContent = document.getElementById("f-name").value.trim().split(/\s+/)[0].slice(0, 30);
    ok.hidden = false;
    ok.focus();
  });
  function alert0() {
    var n = document.querySelector(".form-note");
    n.textContent = "You just sent a request. Please wait a minute, or call (215) 555-0162.";
  }

  /* hide sticky mobile bar when the form is on screen */
  var bar = document.querySelector(".mobile-bar");
  var est = document.getElementById("estimate");
  if (bar && est && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle("hide", en[0].isIntersecting); }, { threshold: 0.15 }).observe(est);
  }

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
