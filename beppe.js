import CDPSocket from './socket.js';
import { execFile } from 'child_process';
import { waitFor } from './utils.js';

export default class Beppe {
  #url;
  #port;
  #cdpSocket;

  constructor(
    url = 'https://example.com',
    path = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    port = 1337
  ) {
    this.#url = url;
    this.#port = port;

    const userDataDir = `--user-data-dir=${process.env.APPDATA}/../Local/Google/Chrome/User Data`;
    const remoteDebuggingPort = `--remote-debugging-port=${port}`;
    const args = [remoteDebuggingPort, userDataDir, url];
    execFile(path, args);
  }

  async connect() {
    const checkPort = async () => {
      try {
        return await fetch(`http://127.0.0.1:${this.#port}`);
      } catch (e) {}
    };
    await waitFor(checkPort);
    const resp = await fetch(
      `http://127.0.0.1:${this.#port}/json/list?t=${new Date().getTime()}`
    );
    const pages = await resp.json();
    const [page] = pages;

    this.#cdpSocket = new CDPSocket(
      `ws://127.0.0.1:${this.#port}/devtools/page/${page.id}`
    );

    if (this.#url !== 'about:blank') {
      const waitForNavigation = async () => {
        const location = await this.eval('window.location.href');
        return location !== 'about:blank';
      };

      await waitFor(waitForNavigation);
    }

    return this;
  }

  async goto(url) {
    const priorURL = this.#url;
    this.#url = url;
    await this.eval(`window.location.href = "${url}"`);
    const waitForNavigation = async () => {
      const location = await this.eval('window.location.href');
      return location !== priorURL;
    };
    await waitFor(waitForNavigation);
  }

  async execFunc(func) {
    return await this.eval(`(${func.toString()})()`);
  }

  async eval(js) {
    const message = {
      method: 'Runtime.evaluate',
      params: { expression: js, returnByValue: true, awaitPromise: true },
    };

    const reply = await this.#cdpSocket.send(message);
    return this.#parseReply(reply);
  }

  #parseReply = function (reply) {
    if (reply.error) {
      return new Error(reply.error.message);
    }
    if (reply.result?.exceptionDetails) {
      return new Error(reply.result.exceptionDetails.text);
    }
    switch (reply.result?.result?.type) {
      case 'undefined': {
        return undefined;
      }
      case 'object': {
        switch (reply.result.result.subtype) {
          default: {
            return reply.result.result.value;
          }
        }
        return reply;
      }
      case 'boolean':
      case 'string':
      case 'number': {
        return reply.result.result.value;
      }
      default: {
        if (reply.result?.result?.unserializableValue) {
          return eval(reply.result.result.unserializableValue);
        }
      }
    }
    return reply;
  };
}
