import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { trackShipmentTool } from './trackShipment.js';

const tools = [trackShipmentTool];

export function registerTools(server: McpServer) {
  tools.forEach(({ name, config, handler }) => {
    server.registerTool(name, config, handler);
  });
}
