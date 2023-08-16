type RequestResponseMethod = 'getRouterRtpCapabilities' | 'createSendTransport';
type NotificationMethod = '';

type Method = RequestResponseMethod | NotificationMethod;

enum MsgType {
  Request = 0,
  Response = 1,
  Notification = 2
}

interface Request {
  type: MsgType.Request;
  method: string;
  id: string;
  data: any;
}

interface Response {
  type: MsgType.Response;
  method: string;
  id: string;
  success: boolean;
  error?: string;
  data?: any;
}

interface Notification {
  type: MsgType.Notification;
  method: string;
  data: any;
}

type WebSocketMessage = Request | Response | Notification;

export type {
  WebSocketMessage,
  RequestResponseMethod,
  NotificationMethod,
  Method,
  Request,
  Response,
  Notification
};
export { MsgType };
