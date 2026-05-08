import express, { Request, Response } from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as dotenv from 'dotenv';
import { GHLMCPServer } from './server.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const ghlServer = new GHLMCPServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => transport.close());
    await ghlServer.startHTTP(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/mcp', (_req: Request, res: Response) => {
  res.status(405).json({ error: 'Use POST for MCP requests' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'GHL MCP Server' });
});

app.listen(PORT, () => {
  console.log(`GHL MCP HTTP server running on port ${PORT}`);
});
