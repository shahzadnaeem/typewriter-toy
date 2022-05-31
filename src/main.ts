import "./reset.css";
import "./style.css";
import Typewriter, { Options } from "./Typewriter";

const root = document.querySelector("#app") as HTMLElement;
const options: Options = {
  loop: 100,
  autoStart: true,
  typingRate: 20,
  deletingRate: 7,
};

const tw = new Typewriter(root, options);

tw.clear()
  .dynamicType(() => `It is now: ${new Date().toLocaleString()}\n`)
  .delay(1000)
  .debug("Done waiting 1000ms")
  .dynamicType(() => `Time is now: ${new Date().toLocaleTimeString()}\n`)
  .setTypingRate(50)
  .colour(
    "yellow",
    "\nTHE F-A-S-T FUN JUST DOES NOT STOP 👴👴👴 - Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit ipsum eligendi quae atque tempore est temporibus reprehenderit blanditiis iure libero aut hic incidunt, nemo beatae excepturi dolore ducimus! Necessitatibus, dignissimos?"
  )
  .setDeletingRate(100)
  .erase()
  .resetTypingRate()
  .resetDeletingRate()
  .colour2("orangered", "\nThree of me ...")
  .type("\n\nHey! You totally love this right?")
  .delay(500)
  .type("\n\n")
  .rainbow("ROYGBIV -- I-love-rainbows-a-lot")
  .colour("firebrick", "\n\nSometimes, firebrick is nice too!")
  .rainbow("\n\nWhat a joyful things this is :)")
  .delay(500)
  .colour("")
  .type("\n\nSome lazy dogs are being overrun by fast foxes!")
  .delay(250)
  .erase()
  .type("\n\nShould be same colour as last letter of text above!")
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
