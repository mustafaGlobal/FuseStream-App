import type { NotificationData, NotificationMethod } from './notification';
import type { RequestData, RequestResponseMethod } from './request';
import type { ResponseData } from './response';

export type WebSocketMessage = Request | Response | Notification;

export type Method = RequestResponseMethod | NotificationMethod;

export enum MsgType {
  Request = 0,
  Response = 1,
  Notification = 2
}

export interface Request {
  type: MsgType.Request;
  method: RequestResponseMethod;
  id: string;
  data: RequestData;
}

export interface Response {
  type: MsgType.Response;
  method: RequestResponseMethod;
  id: string;
  success: boolean;
  data?: ResponseData;
  error?: string;
}

export interface Notification {
  type: MsgType.Notification;
  method: Method;
  data: NotificationData;
}
