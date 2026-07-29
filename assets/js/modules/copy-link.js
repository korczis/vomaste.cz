// Shared "copy a direct link" helper. Progressive enhancement only: the
// anchor it copies already works as a normal link without this.
export function copyToClipboard(text, triggerEl) {
  function showFeedback(ok) {
    if (!triggerEl) return;
    var original = triggerEl.textContent;
    triggerEl.textContent = ok ? "✓" : "✗";
    triggerEl.setAttribute("aria-live", "polite");
    window.setTimeout(function () {
      triggerEl.textContent = original;
    }, 1500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      function () {
        showFeedback(true);
      },
      function () {
        showFeedback(false);
      },
    );
  } else {
    showFeedback(false);
  }
}
