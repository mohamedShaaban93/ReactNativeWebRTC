import io from 'socket.io-client';
import {SOCKET_URL} from '../utils/urls';

let client: SocketIOClient.Socket;
export function getClient() {
  if (!client) {
    client = io.connect(SOCKET_URL);
  }
  return client;
}
