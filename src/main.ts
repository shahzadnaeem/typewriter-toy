import "./style.css";
import Typewriter, { Options } from "./Typewriter";

const root = document.querySelector("#app") as HTMLElement;
const options: Options = {
  loop: true,
  typingSpeed: 120,
  deletingRate: 4,
};

const tw = new Typewriter(root, options);

tw.dynamicType(() => `It is now: ${new Date().toLocaleString()}`)
  .delay(250)
  .debug("Done waiting 250ms")
  .type("\n\nLine 1 - Hello!")
  .type("\n\nLine 2 ...")
  .delay(500)
  .clear()
  .delay(250)
  .type("More ...")
  .delay(250)
  .debug("Bored yet?")
  .clear()
  .start();
