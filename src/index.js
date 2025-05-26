import { AgentaryClient } from './core/AgentaryClient.js';

export const init = (config) => {
  return new AgentaryClient(config);
}