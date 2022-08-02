import WebSocket from 'websocket';
import { waitFor } from './utils.js';

export default class CDPSocket extends WebSocket.w3cwebsocket {
  #opened = false;
  #messageId = 0;
  #replies = [];

  constructor(url) {
    super(url);
  }

  onopen() {
    this.#opened = true;
  }

  onmessage({ data: reply }) {
    this.#replies.push(JSON.parse(reply));
  }

  async send(message) {
    await waitFor(() => this.#opened);
    const id = this.#messageId++;
    message.id = id;
    super.send(JSON.stringify(message));
    return await this.waitForReply(id);
  }

  async waitForReply(id) {
    const findReply = () => {
      const index = this.#replies.findIndex((reply) => reply.id === id);
      if (index === -1) return null;
      const [reply] = this.#replies.splice(index, 1);
      return reply;
    }
    const reply = await waitFor(findReply);
    return reply;
  }
}
