export interface Options {
  loop: boolean;
  typingSpeed: number;
  deletingRate: number;
}

const defaultOptions: Options = {
  loop: false,
  typingSpeed: 50,
  deletingRate: 5,
};

type QueueItem = () => Promise<void>;
type Queue = QueueItem[];
type ResolveFnType = (v?: any) => void;
type ActionType = (resolve: ResolveFnType) => void;

class Typewriter {
  #root: HTMLElement;
  #div: HTMLDivElement;
  #span: HTMLSpanElement;
  #spans: HTMLSpanElement[];
  #cursor: HTMLSpanElement;
  #debug: HTMLDivElement;
  #options: Options;
  #queue: Queue = [];

  constructor(root: HTMLElement, options: Options = defaultOptions) {
    this.#root = root;
    this.#options = options;

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
      }, this.#options.typingSpeed);
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

  doErase(resolve: ResolveFnType) {
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

        console.log(`erase(): num=${numToErase}, erased=${i}`);

        resolve();
      }
    }, Math.floor((1.0 / this.#options.deletingRate) * 1000));
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

  // This will mess up erase -- can add a marker that is used by erase if it matters

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

  async start() {
    const numActions = this.#queue.length;
    let loopNum = 1;
    let actionCount = numActions;

    let cursor = true;
    this.setCursor(cursor);

    const interval = setInterval(() => {
      cursor = !cursor;
      this.setCursor(cursor);
    }, 500);

    this.debugNow(`Starting loop: ${loopNum} with ${numActions} actions`);

    let action = this.#queue.shift();
    while (action) {
      if (this.#options.loop && actionCount === 0) {
        actionCount = numActions;
        if (loopNum % 2 === 0) this.debugClearNow();
        loopNum++;
        this.debugNow(`Starting loop: ${loopNum} with ${numActions} actions`);
      }

      await action();

      if (this.#options.loop) this.#queue.push(action);
      action = this.#queue.shift();
      actionCount--;
    }

    clearInterval(interval);

    this.setCursor(false);
  }
}

export default Typewriter;
