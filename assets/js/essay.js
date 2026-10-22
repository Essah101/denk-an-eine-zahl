/* Denk an eine Zahl — Anmerkungen im Text anzeigen und Link teilen.
   Läuft nur im Browser, speichert nichts, lädt nichts nach. */
(function () {
  "use strict";

  // ---- Anmerkungen als kleines Fenster direkt am Text ----
  var pop = null, opener = null;

  function close() {
    if (!pop) return;
    pop.remove(); pop = null;
    if (opener) { opener.setAttribute("aria-expanded", "false"); opener = null; }
  }

  function open(link) {
    var id = link.getAttribute("href").slice(1);
    var item = document.getElementById(id);
    if (!item) return false;
    var text = item.querySelector(".note-text");
    close();
    opener = link;
    link.setAttribute("aria-expanded", "true");
    pop = document.createElement("div");
    pop.className = "fn-pop";
    pop.setAttribute("role", "note");
    pop.id = "fn-pop";
    link.setAttribute("aria-controls", "fn-pop");
    var num = document.createElement("span");
    num.className = "fn-num";
    num.textContent = link.textContent;
    pop.appendChild(num);
    pop.insertAdjacentHTML("beforeend", text ? text.innerHTML : "");
    var more = document.createElement("a");
    more.className = "fn-more";
    more.href = "#" + id;
    more.textContent = "Zu den Anmerkungen";
    more.addEventListener("click", close);
    pop.appendChild(more);
    document.body.appendChild(pop);

    var r = link.getBoundingClientRect();
    var w = pop.offsetWidth, margin = 16;
    var left = Math.min(Math.max(margin, r.left + window.scrollX - w / 2),
                        window.scrollX + document.documentElement.clientWidth - w - margin);
    var top = r.bottom + window.scrollY + 8;
    if (r.bottom + pop.offsetHeight + 24 > window.innerHeight && r.top > pop.offsetHeight + 24) {
      top = r.top + window.scrollY - pop.offsetHeight - 8;
    }
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    return true;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("sup.fn a");
    if (link) {
      if (opener === link) { e.preventDefault(); close(); return; }
      if (open(link)) e.preventDefault();
      return;
    }
    if (pop && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pop) { var o = opener; close(); if (o) o.focus(); }
  });
  window.addEventListener("resize", close);

  // ---- Link teilen ----
  var btn = document.querySelector("[data-share]");
  if (btn) {
    var url = location.href.split("#")[0];
    var canShare = !!navigator.share;
    var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);
    if (canShare || canCopy) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        if (canShare) {
          navigator.share({ title: document.title, url: url }).catch(function () {});
        } else {
          navigator.clipboard.writeText(url).then(function () {
            var t = btn.textContent;
            btn.textContent = "Link kopiert";
            setTimeout(function () { btn.textContent = t; }, 1800);
          });
        }
      });
    }
  }
})();
