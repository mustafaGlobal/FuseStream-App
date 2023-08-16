import { createLogger } from '@/lib/logger';
import SafeEventEmitter from '../utils/safeEventEmitter';
import { Message } from './message';

const logger = createLogger('WebSocketTransport');

class WebSocketTransport extends SafeEventEmitter {
  private ws: WebSocket;
  private closed: boolean;
  private connected: boolean;

  static async create(url: string): Promise<WebSocketTransport> {
    try {
      const ws = new WebSocket(url);
      return new Promise((resolve) => {
        if (ws) {
          ws.addEventListener('open', () => {
            resolve(new WebSocketTransport(ws));
          });

          ws.addEventListener('error', (error) => {
            throw error;
          });
          ws.addEventListener('close', () => {
            throw Error('closed');
          });
        }
      });
    } catch (error) {
      logger.debug('failed to connect to websocket error:%o', error);
      throw error;
    }
  }

  constructor(ws: WebSocket) {
    super();
    this.closed = false;
    this.connected = true;
    this.ws = ws;
    this.safeEmit('open');
    this.handleConnection();
  }

  public isClosed(): boolean {
    return this.closed;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public close(): void {
    if (this.closed) {
      return;
    }

    logger.debug('close()');

    this.closed = true;
    this.safeEmit('close');
    if (this.ws) {
      this.ws.close(1000, 'closed by server');
    }
  }

  public send(message: any): void {
    if (this.closed) {
      throw Error('transport closed');
    }

    if (this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error('send() failed: %o', error);
      }
    }
  }

  private handleConnection() {
    if (this.ws) {
      this.ws.addEventListener('close', (event) => {
        logger.debug('connection close event [code:%d. reason:%s]', event.code, event.reason);
        this.connected = false;
        this.closed = true;
        this.safeEmit('close');
      });

      this.ws.addEventListener('error', (error) => {
        if (this.closed) {
          return;
        }

        logger.error('connection error event: [error:%s]', error);
      });

      this.ws.addEventListener('message', (raw: any) => {
        if (this.closed) {
          return;
        }

        const message = Message.parse(raw.data);

        if (!message) {
          return;
        }

        if (this.listenerCount('message') === 0) {
          logger.error('no listiners for "message" event, ignoring recived message');
          return;
        }

        this.safeEmit('message', message);
      });
    }
  }
}

export { WebSocketTransport };
