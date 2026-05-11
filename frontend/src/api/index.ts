import type { Agent } from '../types';

const BASE_URL = '';

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getAgents: () => getJSON<{ agents: Agent[] }>('/api/agents'),

  getAgent: (name: string) => getJSON<Agent>(`/api/agents/${name}`),

  sendMessage: (message: string, agent = 'main_agent') =>
    postJSON<{ response: string; agent: string }>('/api/chat', { message, agent }),
};

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, (data: any) => void> = new Map();

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handler = this.handlers.get(data.type);
      if (handler) handler(data);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 3000);
    };
  }

  send(message: string, agent = 'main_agent') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message, agent }));
    }
  }

  on(type: string, handler: (data: any) => void) {
    this.handlers.set(type, handler);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
