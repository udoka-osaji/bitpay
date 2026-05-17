/**
 * WebSocket Broadcast Client
 * Sends broadcast requests to the external WebSocket server
 */

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:4000';

interface BroadcastPayload {
  type: 'user' | 'stream' | 'marketplace' | 'treasury' | 'global';
  target?: string;
  event: string;
  payload: any;
}

async function broadcastToSocketServer(data: BroadcastPayload): Promise<void> {
  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to broadcast to WebSocket server:', response.statusText);
    }
  } catch (error) {
    console.error('Error broadcasting to WebSocket server:', error);
  }
}

export const broadcastToUser = async (walletAddress: string, event: string, payload: any) => {
  await broadcastToSocketServer({
    type: 'user',
    target: walletAddress,
    event,
    payload,
  });
  console.log(`📤 Broadcast to user ${walletAddress}:`, event);
};

export const broadcastToStream = async (streamId: string, event: string, payload: any) => {
  await broadcastToSocketServer({
    type: 'stream',
    target: streamId,
    event,
    payload,
  });
  console.log(`📤 Broadcast to stream ${streamId}:`, event);
};

export const broadcastToMarketplace = async (event: string, payload: any) => {
  await broadcastToSocketServer({
    type: 'marketplace',
    event,
    payload,
  });
  console.log(`📤 Broadcast to marketplace:`, event);
};

export const broadcastToTreasury = async (event: string, payload: any) => {
  await broadcastToSocketServer({
    type: 'treasury',
    event,
    payload,
  });
  console.log(`📤 Broadcast to treasury:`, event);
};

export const broadcastGlobal = async (event: string, payload: any) => {
  await broadcastToSocketServer({
    type: 'global',
    event,
    payload,
  });
  console.log(`📤 Global broadcast:`, event);
};
