class GoalNotifier {
  handlers = [];

  constructor() {
    let port = window.location.port;
    if (process.env.NODE_ENV !== "production") {
      port = 3000;
    }

    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onmessage = async (event) => {
      const msg = JSON.parse(await event.data.text());
      this.receiveEvent(msg);
    };
  }

  broadcastEvent(from) {
    const event = {
      from: from,
    };
    this.socket.send(JSON.stringify(event));
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers.filter((h) => h !== handler);
  }

  receiveEvent(event) {
    this.handlers.forEach((handler) => {
      handler(event);
    });
  }
}

const GoalEventNotifier = new GoalNotifier();
export { GoalEventNotifier };
