// Generic resize + fullscreen lifecycle for a graph container. Extracted
// out of the renderer so a controller's destroy() has one obvious place
// to release everything it opened (mission § 6.3): observer, listener,
// and the fullscreen resize-handler registration.
import { resizeHandlers } from "../fullscreen.js";

// rAF-batched: coalesces bursts of ResizeObserver callbacks (e.g. during
// a CSS transition, sidebar collapse, fullscreen enter/exit) into one
// call per frame, and never fires after destroy() — a pending rAF whose
// callback runs after kill() would touch a dead renderer.
export function attachResizeLifecycle(container, onResize) {
  let pending = false;
  let destroyed = false;
  const scheduled = () => {
    if (pending || destroyed) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (!destroyed) onResize();
    });
  };

  let observer = null;
  if (window.ResizeObserver) {
    observer = new ResizeObserver(scheduled);
    observer.observe(container);
  } else {
    window.addEventListener("resize", scheduled);
  }

  const fsBox = container.closest(".fs-box");
  const fsBoxId = fsBox && fsBox.id ? fsBox.id : null;
  if (fsBoxId) resizeHandlers[fsBoxId] = scheduled;

  return {
    destroy() {
      destroyed = true;
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", scheduled);
      if (fsBoxId && resizeHandlers[fsBoxId] === scheduled) delete resizeHandlers[fsBoxId];
    },
  };
}
