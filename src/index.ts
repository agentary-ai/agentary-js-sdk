import { AgentaryClient } from './core/index';
import type { AgentaryClientConfig } from './types/AgentaryClient';

export const init = (config?: AgentaryClientConfig): AgentaryClient => {
  return new AgentaryClient(config);
};