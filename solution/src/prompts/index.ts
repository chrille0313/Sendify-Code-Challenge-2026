import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { trackShipmentPrompt } from './trackShipment.js';

const prompts = [trackShipmentPrompt];

export function registerPrompts(server: McpServer) {
  prompts.forEach(({ name, config, handler }) => {
    server.registerPrompt(name, config, handler);
  });
}
