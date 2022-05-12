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
type ActionType = (resolve: () => void) => void;

class Typewriter {
  #root: HTMLElement;
  #span: HTMLSpanElement;
  #cursor: HTMLSpanElement;
  #debug: HTMLDivElement;
  #options: Options;
  #queue: Queue = [];

  constructor(root: HTMLElement, options: Options = defaultOptions) {
    this.#root = root;
    this.#options = options;

    const div = document.createElement("div");
    div.className = "typewriter";
    this.#root.appendChild(div);
    const span = document.createElement("span");
    div.appendChild(span);
    this.#span = span;
    const cursor = document.createElement("span");
    cursor.append("┃");
    div.appendChild(cursor);
    this.#cursor = cursor;

    const debug = document.createElement("div");
    debug.className = "debug";
    this.#root.appendChild(debug);
    this.#debug = debug;
  }

  #addAction(fn: ActionType) {
    this.#queue.push(() => new Promise(fn));
  }

  type(message: string) {
    this.#addAction((resolve) => {
      let i = 0;

      const interval = setInterval(() => {
        this.#span.append(message[i++]);
        if (i === message.length) {
          clearInterval(interval);
          resolve();
        }
      }, this.#options.typingSpeed);
    });

    return this;
  }

  dynamicType(fn: () => string) {
    this.#addAction((resolve) => {
      let i = 0;
      let message = fn();

      const interval = setInterval(() => {
        this.#span.append(message[i++]);
        if (i === message.length) {
          clearInterval(interval);
          resolve();
        }
      }, this.#options.typingSpeed);
    });

    return this;
  }

  clear() {
    this.#addAction((resolve) => {
      this.#span.innerText = "";
      resolve();
    });

    return this;
  }

  delay(ms: number) {
    this.#addAction((resolve) => {
      setTimeout(() => resolve(), ms);
    });

    return this;
  }

  debug(message: string) {
    this.#addAction((resolve) => {
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
