## DB Schenker Shipment MCP Server

This MCP server exposes a single tool, `track-shipment`, that fetches DB Schenker shipment tracking data (sender/receiver, goods totals, package IDs, and shipment events) using the public tracking site at: https://www.dbschenker.com/app/tracking-public. Output is normalized via zod schemas defined in `src/schemas.ts`.

## Requirements

- Node.js 20+
- npm
- Google Chrome (matching the npm `chromedriver` version in package.json)

## Setup

```bash
cd solution
npm install
```

## Running the MCP server

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
npm run start
```

## Usage (using Cursor)

1. Within Cursor, open your mcp settings (File > Preferences > Cursor Settings > Tools & MCP)

2. Click "New MCP Server". This should open a json file with the following structure:

```json
{
  "mcpServers": {
    ...
  }
}
```

3. Add the following to the `mcpServers` object (replace the paths with the absolute paths to the tsconfig.json and src/index.ts files on your computer) and save the file:

```json
"dbschenker-mcp-server": {
  "command": "npx",
  "args": [
    "--yes",
    "tsx",
    "--tsconfig",
    <path to tsconfig.json>,
    <path to src/index.ts>
  ]
}
```

4. The MCP server should now be available in the MCP Servers list. Enable it by clicking the toggle next to it.

5. Open a new chat in Cursor, and create a prompt by typing "/dbschenker-mcp-server/track-shipment" (it should autocomplete when you write "/") and pressing enter.

6. You should now see a popup aksing for the reference number. Enter a reference number and press enter. This should create the prompt in the chat.

7. Send the prompt and wait for the response.

8. You should now see the shipment tracking data in the chat.

Note: When configured in Cursor, you don’t need to start the MCP server manually. Cursor will launch it using the command above.
