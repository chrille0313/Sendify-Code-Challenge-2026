import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from '@/tools/index.js';
import { registerPrompts } from '@/prompts/index.js';

const server = new McpServer(
  {
    name: 'dbschenker-mcp-server',
    version: '0.1.0',
    title: 'DB Schenker MCP Server'
  },
  {
    capabilities: {
      tools: {},
      prompts: {}
    }
  }
);

async function main() {
  registerTools(server);
  registerPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP server running on stdio...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
