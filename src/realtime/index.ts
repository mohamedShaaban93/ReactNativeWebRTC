import { RTCPeerConnection, RTCPeerConnectionConfiguration } from 'react-native-webrtc';
import io from 'socket.io-client';
import {SOCKET_URL} from '../utils/urls';

let socket: SocketIOClient.Socket;
export function getClient() {
  if (!socket) {
    socket = io.connect(SOCKET_URL);
  }
  return socket;
}

const pc_config: RTCPeerConnectionConfiguration = {
  "iceServers": [
    {
      urls: ['stun:stun.l.google.com:19302']
    }
  ]
}
let pc: RTCPeerConnection
export function getPeerConnection() {
  if (!pc) {
    pc = new RTCPeerConnection(pc_config)
  }
  return pc;
}