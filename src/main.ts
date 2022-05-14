import "./style.css";
import Typewriter, { Options } from "./Typewriter";

const root = document.querySelector("#app") as HTMLElement;
const options: Options = {
  loop: true,
  typingSpeed: 50,
  deletingRate: 10,
};

const tw = new Typewriter(root, options);

tw.dynamicType(() => `It is now: ${new Date().toLocaleString()}`)
  .delay(250)
  .debug("Done waiting 250ms")
  .type("\n\nJenny you totally love this right?\n")
  .delay(500)
  .rainbow("ROYGBIV -- I-love-rainbows-a-lot")
  .colour("firebrick")
  .type("\n\nWhat a joyful things this is :)")
  .delay(500)
  .erase()
  .type("\n\nTHE FUN JUST DOES NOT STOP 👴👴👴")
  .delay(250)
  .colour("yellow")
  .delay(250)
  .type(" ...")
  .delay(250)
  .colour("blue", "\n\nHey! How about this???")
  .allInOne(
    "orange",
    "\n\nThis is an all in one, type, delay erase thing!",
    500
  )
  .debug("")
  .delay(250)
  .clear()
  .start();
