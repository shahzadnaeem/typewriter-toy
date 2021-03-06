export interface Options {
  loop: boolean | number;
  autoStart: boolean;
  typingRate: number; // chars/sec
  deletingRate: number; // chars/sec
}

const defaultOptions: Options = {
  loop: false,
  autoStart: false,
  typingRate: 20,
  deletingRate: 5,
};

type QueueItem = () => Promise<void>;
type Queue = QueueItem[];
type ResolveFnType = (v?: any) => void;
type ActionType = (resolve: ResolveFnType) => void;

class Typewriter {
  #root: HTMLElement;
  #startButton: HTMLButtonElement;
  #div: HTMLDivElement;
  #span: HTMLSpanElement;
  #spans: HTMLSpanElement[];
  #cursor: HTMLSpanElement;
  #debug: HTMLDivElement;
  #initialOptions: Options;
  #options: Options;
  #queue: Queue = [];
  #running: boolean;

  constructor(root: HTMLElement, options: Options = defaultOptions) {
    this.#root = root;
    this.#initialOptions = { ...options };
    this.#options = { ...options };
    this.#running = false;

    const button = document.createElement("button");
    button.setAttribute("disabled", "");
    button.innerText = "Start!";
    button.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (!this.#running) {
        this.start();
      }
    });
    this.#startButton = this.#root.appendChild(button);

    const div = document.createElement("div");
    this.#div = this.#root.appendChild(div);
    this.#div.className = "typewriter";

    const cursor = document.createElement("span");
    this.#cursor = this.#div.appendChild(cursor);
    this.#cursor.className = "cursor-on";
    this.#cursor.append("┃");

    const span = document.createElement("span");
    this.#span = this.#div.insertBefore(span, this.#cursor);
    this.#spans = [this.#span];

    const debug = document.createElement("div");
    this.#debug = this.#root.appendChild(debug);
    this.#debug.className = "debug";
  }

  #newAction = (fn: ActionType) => new Promise(fn);
  #queueAction = (fn: ActionType) =>
    this.#queue.push(() => this.#newAction(fn));

  doType(message: string, resolve: ResolveFnType) {
    let i = 0;

    if (message.length) {
      const interval = setInterval(() => {
        this.#span.append(message[i++]);

        if (i === message.length) {
          clearInterval(interval);
          resolve();
        }
      }, this.#rateToMsDelay(this.#options.typingRate));
    } else {
      resolve();
    }
  }

  type(message: string, msDelay = 0) {
    this.#queueAction((resolve) => {
      this.doType(message, resolve);
    });

    this.delay(msDelay);

    return this;
  }

  dynamicType(fn: () => string, msDelay = 0) {
    this.#queueAction((resolve) => {
      let message = fn();

      this.doType(message, resolve);
    });

    this.delay(msDelay);

    return this;
  }

  colour(col: string, message: string = "") {
    this.#queueAction((resolve) => {
      const span = document.createElement("span");
      span.style.color = col;

      this.#span = this.#div.insertBefore(span, this.#cursor);
      this.#spans.push(this.#span);

      resolve();
    });

    this.type(message);

    return this;
  }

  //
  // DONE: Experiment to use async/await and promises for each sub-action
  //       This is an alternative to allInOne() which adds an action for each
  //
  async doColour2(col: string, message: string, resolve: ResolveFnType) {
    const span = document.createElement("span");
    span.style.color = col;

    this.#span = this.#div.insertBefore(span, this.#cursor);
    this.#spans.push(this.#span);

    await this.#newAction((res) => this.doType(message, res));
    await this.#newAction((res) => this.doDelay(500, res));
    await this.#newAction((res) => this.doType(message, res));
    await this.#newAction((res) => this.doDelay(500, res));
    await this.#newAction((res) => this.doType(message, res));

    resolve();
  }

  colour2(col: string, message: string = "") {
    this.#queueAction((resolve) => {
      this.doColour2(col, message, resolve);
    });

    return this;
  }

  #removeLastChar(el: HTMLSpanElement) {
    el.innerText = el.innerText.slice(0, el.innerText.length - 1);
  }

  #rateToMsDelay(rate: number) {
    return Math.floor(1000.0 / rate);
  }

  doErase(success: ResolveFnType) {
    let i = 0;
    let numToErase = this.#span.innerText.length;

    const interval = setInterval(() => {
      this.#removeLastChar(this.#span);
      i++;
      if (i === numToErase) {
        clearInterval(interval);
        if (this.#spans.length > 1) {
          // We are removing this span - so text will be previous colour
          this.#div.removeChild(this.#span);
          this.#spans.pop();
          this.#span = this.#spans[this.#spans.length - 1];
        }

        success();
      }
    }, this.#rateToMsDelay(this.#options.deletingRate));
  }

  erase() {
    this.#queueAction(async (resolve) => {
      await new Promise((res) => {
        this.doErase(res);
      });

      resolve();
    });

    return this;
  }

  allInOne(col: string, message: string, msDelay: number) {
    this.colour(col, message);
    this.delay(msDelay);
    this.erase();
    this.delay(msDelay);

    return this;
  }

  // This will mess up erase (creates multiple spans of 1 char each) -- can add a marker span that is used by erase if it matters

  rainbow(
    message: string,
    cols: string[] = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "hotpink",
      "violet",
    ]
  ) {
    this.debugNow(`Creating a rainbow with ${message.length} letters`);

    if (message.length && cols.length) {
      const chars = message.split("");
      let i = 0;
      chars.forEach((ch) => {
        this.colour(cols[i], `${ch}`);
        i = (i + 1) % cols.length;
      });
    }

    return this;
  }

  clear() {
    this.#queueAction((resolve) => {
      this.#div.innerHTML = "";
      this.#span = this.#spans[0];
      this.#span.innerText = "";
      this.#div.append(this.#span, this.#cursor);
      this.#spans = [this.#span];
      resolve();
    });

    return this;
  }

  doDelay(ms: number, resolve: ResolveFnType) {
    return new Promise(() => setTimeout(() => resolve(), ms));
  }

  delay(ms: number) {
    this.#queueAction(async (resolve) => {
      await this.doDelay(ms, resolve);
    });

    return this;
  }

  setTypingRate(charsPerSec: number) {
    this.#queueAction(async (resolve) => {
      this.#options.typingRate = charsPerSec;
      resolve();
    });

    return this;
  }

  setDeletingRate(charsPerSec: number) {
    this.#queueAction(async (resolve) => {
      this.#options.deletingRate = charsPerSec;
      resolve();
    });

    return this;
  }

  resetTypingRate() {
    this.#queueAction(async (resolve) => {
      this.#options.typingRate = this.#initialOptions.typingRate;
      resolve();
    });

    return this;
  }

  resetDeletingRate() {
    this.#queueAction(async (resolve) => {
      this.#options.deletingRate = this.#initialOptions.deletingRate;
      resolve();
    });

    return this;
  }

  debug(message: string) {
    this.#queueAction((resolve) => {
      this.debugNow(message);
      resolve();
    });

    return this;
  }

  debugNow(message: string) {
    this.#debug.append(`${message}\n`);
  }

  debugClearNow() {
    this.#debug.innerText = "";
  }

  setCursor(state: boolean) {
    this.#cursor.className = state ? "cursor-on" : "cursor-off";
  }

  #enableStartButton() {
    this.#startButton.removeAttribute("disabled");
    this.debugNow("Start! button ENABLED");
  }

  #disableStartButton() {
    this.#startButton.setAttribute("disabled", "");
    this.debugNow("Start! button disabled");
  }

  ready() {
    this.#enableStartButton();
    if (this.#options.autoStart) {
      this.start();
    }
    return this;
  }

  async start() {
    this.#options = { ...this.#initialOptions };

    this.#running = true;
    this.#disableStartButton();

    this.debugClearNow();
    this.debugNow(`Starting...`);
    this.debugNow(
      `Options: loop: ${this.#options.loop.toString()}, autoStart: ${this.#options.autoStart.toString()}, typingRate: ${
        this.#options.typingRate
      }, deletingRate: ${this.#options.deletingRate}\n`
    );

    let cursor = true;

    const cursorInterval = setInterval(() => {
      this.setCursor(cursor);
      cursor = !cursor;
    }, 500);

    const numActions = this.#queue.length;
    let loopNum = 0;
    const forever = this.#options.loop === true;

    do {
      loopNum++;

      if (loopNum % 2 === 1) {
        if (loopNum !== 1) {
          this.debugClearNow();
        }
        this.debugNow(
          `## Starting loop: ${loopNum} of ${
            this.#options.loop === true ? "∞" : this.#options.loop
          } with ${numActions} actions`
        );
      }

      for (let action of this.#queue) {
        await action();
      }
    } while (forever || (this.#options.loop && this.#options.loop !== loopNum));

    clearInterval(cursorInterval);

    this.setCursor(true);
    this.#enableStartButton();
    this.#running = false;
  }
}

export default Typewriter;
