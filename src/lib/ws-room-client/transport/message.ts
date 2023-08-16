import { createLogger } from '@/lib/logger';
import shortUUID from 'short-uuid';
import { unmarshallJSON } from '../utils/json';
import type {
  WebSocketMessage,
  RequestResponseMethod,
  Request,
  Response,
  Notification,
  NotificationMethod
} from '../types';

import { MsgType } from '../types';

const logger = createLogger('Message');

class Message {
  static parse(raw: any): WebSocketMessage | undefined {
    const [message, error]: [WebSocketMessage, unknown] = unmarshallJSON(raw);
    if (error != null) {
      logger.error('parse() | %o', error);
      return;
    }

    if (typeof message !== 'object' || Array.isArray(message)) {
      logger.error('parse() | not an object');
      return;
    }

    if (typeof message.method !== 'string') {
      logger.error('parse() | missing/invalid method field');
      return;
    }

    if (typeof message.type !== 'number') {
      logger.error('parse() | missing/invalid type field');
      return;
    }

    switch (message.type) {
      case MsgType.Request:
        if (typeof message.id !== 'string') {
          logger.error('parse() | missing/invalid id field');
          return;
        }

        message.data = message.data || {};
        break;
      case MsgType.Response:
        if (typeof message.id !== 'string') {
          logger.error('parse() | missing/invalid id field');
          return;
        }

        if (typeof message.success !== 'boolean') {
          logger.error('parse() | missing/invalid success field');
          return;
        }

        if (message.success) {
          message.data = message.data || {};
        }

        break;
      case MsgType.Notification:
        message.data = message.data || {};
        break;
      default:
        logger.error('parse() | unsuported message type');
        return;
    }

    return message;
  }

  static createRequest(method: RequestResponseMethod, data: any): Request {
    const req: Request = {
      type: MsgType.Request,
      id: shortUUID.generate(),
      method: method,
      data: data || {}
    };

    return req;
  }

  static createSuccessResponse(req: Request, data: any): Response {
    const resp: Response = {
      type: MsgType.Response,
      method: req.method,
      id: req.id,
      success: true,
      data: data || {}
    };

    return resp;
  }

  static createErrorResponse(req: Request, reason: string): Response {
    const response: Response = {
      type: MsgType.Response,
      method: req.method,
      id: req.id,
      success: false,
      error: reason
    };

    return response;
  }

  static createNotification(method: NotificationMethod, data: any): Notification {
    const notification: Notification = {
      type: MsgType.Notification,
      method: method,
      data: data || {}
    };

    return notification;
  }
}

export { Message };
