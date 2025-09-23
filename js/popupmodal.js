(() => {
  const modal = document.getElementById('nlModal');
  if (!modal) return;

  // --- Config ---
  const enabled  = modal.dataset.enable !== "false";
  const once     = modal.dataset.once === "true";
  const key      = "nl2025Seen";
  const delayMs  = 1200; // open after splash finishes (adjust if your splash is longer)
  // --------------

  const dialog = modal.querySelector('.nl__dialog');
  let last = null;

  function open() {
    if (!enabled) return;
    if (once && sessionStorage.getItem(key) === '1') return;
    last = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    dialog.focus();
    if (once) sessionStorage.setItem(key, '1');
    document.addEventListener('keydown', onKey);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', onKey);
    if (last && last.focus) last.focus();
  }
  function onKey(e){ if (e.key === 'Escape') close(); }

  modal.addEventListener('click', e => { if (e.target.dataset.close) close(); });

  // Open after page load + splash (delayMs)
  window.addEventListener('load', () => setTimeout(open, delayMs));
})();