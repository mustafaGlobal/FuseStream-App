import type { WebSocketMessage } from '../types';

export type Result<T, E> = [T, E];

export const unmarshallJSON = (data: string): Result<WebSocketMessage | null, unknown> => {
  let result = null;
  try {
    result = JSON.parse(data);
  } catch (error) {
    return [null, error];
  }
  return [result, null];
};
