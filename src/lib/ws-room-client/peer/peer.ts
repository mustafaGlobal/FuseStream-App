import { createLogger } from '../../logger';
import { Message } from '../transport/message';
import SafeEventEmitter from '../utils/safeEventEmitter';
import type {
  RequestResponseMethod,
  NotificationMethod,
  WebSocketMessage,
  Request,
  Response,
  Notification,
  NotificationData,
  RequestData,
  ResponseData
} from '../types';
import { MsgType } from '../types';
import { WebSocketTransport } from '../transport/webSocketTransport';

const logger = createLogger('peer');

interface PeerRequest {
  type: MsgType;
  id: string;
  method: RequestResponseMethod;
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
  close: () => void;
}

class Peer extends SafeEventEmitter {
  private transport: WebSocketTransport;
  private closed = false;
  private sentRequests: Map<string, PeerRequest> = new Map();
  private timeout = 10000;
  public id: string;

  constructor(transport: WebSocketTransport, id: string) {
    super();
    this.id = id;
    this.transport = transport;

    this.handleTransport();
  }

  public async request(method: RequestResponseMethod, data?: RequestData) {
    const request = Message.createRequest(method, data);

    logger.debug('request() method:%s, requestId: %s', method, request.id);

    this.transport.send(request);

    return new Promise((pResolve, pReject) => {
      const sentRequest: PeerRequest = {
        type: request.type,
        id: request.id,
        method: request.method,
        resolve: (data: unknown) => {
          this.sentRequests.delete(request.id);
          clearTimeout(sentRequest.timer);
          pResolve(data);
        },
        reject: (error: Error) => {
          this.sentRequests.delete(request.id);
          clearTimeout(sentRequest.timer);
          pReject(error);
        },
        timer: setTimeout(() => {
          this.sentRequests.delete(request.id);
          pReject(Error('request timeout'));
        }, this.timeout),
        close: () => {
          clearTimeout(sentRequest.timer);
          pReject(Error('peer closed'));
        }
      };

      this.sentRequests.set(request.id, sentRequest);
    });
  }

  public notify(method: NotificationMethod, data: NotificationData) {
    const notification = Message.createNotification(method, data);

    logger.debug('notify() method:%s notification', method);

    this.transport.send(notification);
  }

  public close(): void {
    if (this.closed) {
      return;
    }

    logger.debug('close()');

    this.transport.close();
    this.closed = true;

    for (const request of this.sentRequests.values()) {
      request.close();
    }

    this.safeEmit('close');
  }

  public isClosed(): boolean {
    return this.closed;
  }

  private handleTransport(): void {
    if (this.transport.isClosed()) {
      this.closed = true;
      this.safeEmit('close');
    }

    this.transport.on('open', () => {
      if (this.closed) {
        return;
      }
      logger.debug('open');
      this.closed = false;
      this.safeEmit('open');
    });

    this.transport.on('close', () => {
      if (this.closed) {
        return;
      }
      logger.debug('close');
      this.closed = true;
      this.safeEmit('close');
    });

    this.transport.on('message', (message: WebSocketMessage) => {
      switch (message.type) {
        case MsgType.Request:
          this.handleRequest(message);
          break;

        case MsgType.Response:
          this.handleResponse(message);
          break;

        case MsgType.Notification:
          this.handleNotification(message);
          break;

        default:
          logger.error('unexpected message type');
          break;
      }
    });
  }

  private handleRequest(request: Request) {
    try {
      this.emit(
        'request',
        request,
        (data: ResponseData) => {
          const response = Message.createSuccessResponse(request, data);
          this.transport.send(response);
        },
        (error: string) => {
          const response = Message.createErrorResponse(request, error);
          this.transport.send(response);
        }
      );
    } catch (error) {
      const response = Message.createErrorResponse(request, String(error));
      this.transport.send(response);
    }
  }

  private handleResponse(response: Response) {
    const request = this.sentRequests.get(response.id);
    if (!request) {
      logger.error('recived response does not match any sent request [id:%s]', response.id);
    }

    if (response.success) {
      request?.resolve(response.data);
    } else {
      request?.reject(Error(response.error));
    }
  }

  private handleNotification(notification: Notification) {
    this.safeEmit('notification', notification);
  }
}

export { Peer };
