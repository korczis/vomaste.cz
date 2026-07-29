// Generic fullscreen toggle for any `.fs-btn` / `data-fs-target` pair
// (dossier.html has two: the status chart and the relationship graph).
// Consumers register a resize callback per box id — called after the
// browser has actually applied the fullscreen box size, not before.
export const resizeHandlers = {};

export function initFullscreenButtons() {
  var buttons = document.querySelectorAll(".fs-btn[data-fs-target]");
  buttons.forEach(function (btn) {
    if (btn.dataset.fsInit) return;
    btn.dataset.fsInit = "true";
    var boxId = btn.getAttribute("data-fs-target");
    var box = document.getElementById(boxId);
    if (!box) return;

    btn.addEventListener("click", function () {
      if (document.fullscreenElement === box) {
        document.exitFullscreen();
      } else if (box.requestFullscreen) {
        box.requestFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", function () {
      var isFs = document.fullscreenElement === box;
      box.classList.toggle("fs-active", isFs);
      btn.textContent = isFs ? "⤢" : "⛶";
      btn.title = isFs ? "Ukončit celou obrazovku" : "Zobrazit na celou obrazovku";
      btn.setAttribute("aria-label", btn.title);
      // one frame so the browser has applied the fullscreen box size first
      requestAnimationFrame(function () {
        setTimeout(function () {
          if (typeof resizeHandlers[boxId] === "function") resizeHandlers[boxId]();
        }, 50);
      });
    });
  });
}
