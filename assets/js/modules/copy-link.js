// Shared "copy a direct link" helper. Progressive enhancement only: the
// anchor it copies already works as a normal link without this.
// `labels` je volitelné: kdo má na tlačítku slovo, chce slovo zpět, ne
// symbol. Neúspěch se musí dát poznat — tichý úspěch by z tlačítka udělal
// slib, který kód nedrží.
export function copyToClipboard(text, triggerEl, labels) {
  var okLabel = (labels && labels.ok) || "✓";
  var failLabel = (labels && labels.fail) || "✗";

  function showFeedback(ok) {
    if (!triggerEl) return;
    var original = triggerEl.textContent;
    triggerEl.textContent = ok ? okLabel : failLabel;
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
