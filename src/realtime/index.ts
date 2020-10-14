import { Alert } from 'react-native';
import { RTCPeerConnection, RTCPeerConnectionConfiguration, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';
import { CALL } from '../actions/types';
import { OfferAnswerPayload } from '../interfaces/OfferAnswer.interface';
import store from '../store/Store';
import { SOCKET_URL } from '../utils/urls';

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

let socket: SocketIOClient.Socket;
export function getClient() {
  if (!socket) {
    socket = io.connect(SOCKET_URL);
  }
  socket.on('offer', (payload: OfferAnswerPayload) => {
    console.log('oferrrrrrrrrrrrrrrrrrrrrrrrrrrr', payload);
    pc.setRemoteDescription(new RTCSessionDescription(payload.description))
    store.dispatch({type:CALL,call:true})
    Alert.alert('offer', 'offer')
    

    // this.sdp = JSON.stringify(payload.description)
  })

  socket.on('answer', (payload: OfferAnswerPayload) => {
    console.log('answreeeeeeeeeeeeeeeeeeeeeeeeeer', payload);
    pc.setRemoteDescription(new RTCSessionDescription(payload.description))
    // this.sdp = JSON.stringify(payload.description)
  })
  return socket;
}

