import { RTCIceCandidate, RTCPeerConnection, RTCPeerConnectionConfiguration, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';
import { CALL, REMOTE_STREAM } from '../actions/types';
import { IceCandidatePayload } from '../interfaces/Candidate.interface';
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
    pc.onaddstream = (e) => {
      console.log('===========remoteStream=========================');
      console.log(e.stream);
      console.log('====================================');
      store.dispatch({ type: REMOTE_STREAM, payload: e.stream });
    }
  }
  return pc;
}

let socket: SocketIOClient.Socket;
export function getClient() {
  if (!socket) {
    socket = io.connect(SOCKET_URL);
  }
  pc = getPeerConnection();
  socket.on('offer', (payload: OfferAnswerPayload) => {
    console.log('oferrrrrrrrrrrrrrrrrrrrrrrrrrrr',payload);
    pc.setRemoteDescription(new RTCSessionDescription(payload.description))
    store.dispatch({ type: CALL, payload: {hasOffer:true,name:payload.from} });
    })

  socket.on('answer', (payload: OfferAnswerPayload) => {
    console.log('answreeeeeeeeeeeeeeeeeeeeeeeeeer',payload.description);
    pc.setRemoteDescription(new RTCSessionDescription(payload.description))
  })
  socket.on('ice-candidate', (payload: IceCandidatePayload) => {
    pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
  })
  return socket;
}

