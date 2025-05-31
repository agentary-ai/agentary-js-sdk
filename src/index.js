import { AgentaryClient } from './core/index.js';

export const init = (config) => {
  return new AgentaryClient(config);
}