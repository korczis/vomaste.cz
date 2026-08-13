// Kopírovací tlačítko u příkazových bloků.
//
// Progresivní vylepšení a nic víc: text v bloku je normálně vybratelný
// i bez JS, takže bez tohohle modulu se ztratí pohodlí, ne obsah.
//
// Zpětná vazba jde přes `aria-live`, ne jen změnou popisku. Odečítač
// obrazovky se o úspěšném zkopírování jinak nedozví — a „změnilo se to
// vizuálně" není oznámení.
import { copyToClipboard } from "./copy-link.js";

export function initCopyCommands(root = document) {
  var buttons = root.querySelectorAll(".js-copy-command");
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy-text");
      if (!text) return;

      copyToClipboard(text, null);

      var original = button.textContent;
      button.textContent = "Zkopírováno";
      button.setAttribute("aria-live", "polite");
      window.setTimeout(function () {
        button.textContent = original;
      }, 1600);
    });
  });
}
