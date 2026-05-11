import { create } from 'zustand';
import type { Agent, Message, CLICommand } from '../types';

interface AppState {
  currentMode: 'incubation' | 'production' | 'dashboard';
  setCurrentMode: (mode: 'incubation' | 'production' | 'dashboard') => void;

  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  // 对话
  messages: Message[];
  addMessage: (msg: Message) => void;
  appendToLastMessage: (content: string) => void;
  clearMessages: () => void;
  currentAgent: string;
  setCurrentAgent: (agent: string) => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;

  // CLI 终端
  cliHistory: CLICommand[];
  addCLICommand: (cmd: CLICommand) => void;
  updateLastCLIOutput: (output: string, status: 'success' | 'error') => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentMode: 'dashboard',
  setCurrentMode: (mode) => set({ currentMode: mode }),
  agents: [],
  setAgents: (agents) => set({ agents }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendToLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + content };
      }
      return { messages: msgs };
    }),
  clearMessages: () => set({ messages: [] }),
  currentAgent: 'main_agent',
  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  isStreaming: false,
  setIsStreaming: (v) => set({ isStreaming: v }),

  cliHistory: [],
  addCLICommand: (cmd) => set((s) => ({ cliHistory: [...s.cliHistory, cmd] })),
  updateLastCLIOutput: (output, status) =>
    set((s) => {
      const history = [...s.cliHistory];
      const last = history[history.length - 1];
      if (last) {
        history[history.length - 1] = { ...last, output, status };
      }
      return { cliHistory: history };
    }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
