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

      // Tlačítko předáváme dál, aby zpětnou vazbu vydal ten, kdo zná
      // výsledek. Dřív se posílalo null a popisek se hned synchronně
      // přepsal na „Zkopírováno“ — tedy i tehdy, když schránka chyběla
      // nebo zápis odmítla. Uživatel odešel s prázdnou schránkou a
      // jistotou, že má zkopírováno; přesně to tvrzení o schopnosti,
      // které konstituce §8 zakazuje.
      copyToClipboard(text, button, { ok: "Zkopírováno", fail: "Nezkopírováno" });
    });
  });
}
