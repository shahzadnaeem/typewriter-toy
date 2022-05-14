import "./style.css";
import Typewriter, { Options } from "./Typewriter";

const root = document.querySelector("#app") as HTMLElement;
const options: Options = {
  loop: 3,
  autoStart: true,
  typingSpeed: 50,
  deletingRate: 10,
};

const tw = new Typewriter(root, options);

tw.clear()
  .dynamicType(() => `It is now: ${new Date().toLocaleString()}\n`)
  .delay(250)
  .debug("Done waiting 250ms")
  .colour2("orangered", "\nInception!")
  .type("\n\nHey! You totally love this right?")
  .delay(500)
  .type("\n\n")
  .rainbow("ROYGBIV -- I-love-rainbows-a-lot")
  .colour("firebrick")
  .rainbow("\n\nWhat a joyful things this is :)")
  .delay(500)
  .erase()
  .type("\nShould be same colour as last letter of text above!")
  .colour("greenyellow", "\nTHE FUN JUST DOES NOT STOP 👴👴👴")
  .delay(250)
  .colour("yellow")
  .delay(250)
  .type(" ...")
  .delay(250)
  .colour("lightblue", "\n\nHey! How about this???")
  .allInOne(
    "orange",
    "\n\nThis is an all in one, type, delay erase thing!",
    500
  )
  .delay(1500)
  .ready();
// .start();
