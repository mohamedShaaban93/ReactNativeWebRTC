import React, { Component } from 'react'
import { SafeAreaView, StatusBar, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { mediaDevices, MediaStream, MediaStreamConstraints, RTCPeerConnection, RTCSessionDescription, RTCView } from 'react-native-webrtc';
import { Socket } from 'socket.io-client';
import { OfferAnswerPayload } from '../../interfaces/OfferAnswer.interface';
import { getClient, getPeerConnection } from '../../realtime';
import { styles } from './styles'


interface Props {
  componentId: string;
  userName: string;
  secondUser: string;
  offer: boolean;
}
interface State {
  remoteStream: MediaStream | null,
  localStream: MediaStream | null,
  mirror: boolean,
}

export default class Call extends Component<Props, State> {
  private socket: SocketIOClient.Socket;
  private pc: RTCPeerConnection;
  state: State = {
    remoteStream: null,
    localStream: null,
    mirror: true,
  }
  constructor(props: Props) {
    super(props);
    this.socket = getClient();
    this.pc = getPeerConnection();
    this.peerConnection();
    this.getUserMedia();
  }

  peerConnection = () => {
    this.props.offer ? this.createOffer() : this.createAnswer();
    
    this.pc.onicecandidate = (e) => {

      if (e.candidate) {
        console.log('ccccccccccccccccccccccccccccc', { name: this.props.secondUser, from: this.props.userName, candidate: e.candidate })
        this.sendToPeer('ice-candidate', { name: this.props.secondUser, from: this.props.userName, candidate: e.candidate })
      }
    }


    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    this.pc.onaddstream = (e) => {
      console.log('====================================');
      console.log('onaddstream');
      console.log('====================================');
      debugger
      // this.remoteVideoref.current.srcObject = e.streams[0]
      this.setState({
        remoteStream: e.stream
      })
    }
  }
  createOffer = () => {
    this.pc.createOffer()
      .then(sdp => {
        this.pc.setLocalDescription(sdp);
        this.sendToPeer('offer', { name: this.props.secondUser, from: this.props.userName, description: sdp })
      })
  }
  createAnswer = () => {
    this.pc.createAnswer()
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        this.sendToPeer('answer', { name: this.props.secondUser, from: this.props.userName, description: sdp })
        console.log('====================================');
        console.log('answer', { name: this.props.secondUser, from: this.props.userName, description: sdp });
        console.log('====================================');
      })
  }
  sendToPeer = (messageType: string, payload: object) => {
    console.log("messageType", messageType)
    this.socket.emit(messageType, payload)
  }
  getUserMedia = () => {
    const success = (stream: MediaStream) => {
      this.setState({
        localStream: stream
      })
      this.pc.addStream(stream)
    }

    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }
    let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
          videoSourceId = sourceInfo.deviceId;
        }
      }

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30
          },
          facingMode: (isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
        }
      }

      mediaDevices.getUserMedia(constraints)
        .then(success)
        .catch(failure);
    });
  }

  render() {
    const {
      localStream,
      remoteStream,
    } = this.state
    const localVideo = localStream ?
      (
        <RTCView
          key={2}
          mirror={true}
          style={{ ...styles.rtcViewRemote }}
          objectFit='contain'
          streamURL={localStream && localStream.toURL()}
        />
      ) :
      (
        <View style={{ padding: 15, }}>
          <Text style={{ fontSize: 22, textAlign: 'center', color: 'white' }}>Waiting for Peer connection ...</Text>
        </View>
      )
    const remoteVideo = remoteStream ?
      (
        <TouchableOpacity onPress={() => {
          this.setState({
            mirror: !this.state.mirror,
          })
          localStream._tracks[1]._switchCamera()
        }}>
          <RTCView
            key={2}
            mirror={true}
            style={{ ...styles.rtcViewRemote }}
            objectFit='contain'
            streamURL={remoteStream && remoteStream.toURL()}
          />
        </TouchableOpacity>
      ) :
      (
        <View style={{ padding: 15, }}>
          <Text style={{ fontSize: 22, textAlign: 'center', color: 'white' }}>Waiting for Peer connection ...</Text>
        </View>
      )
    return (
      <SafeAreaView style={{ flex: 1, }}>
        <StatusBar backgroundColor="blue" barStyle={'dark-content'} />
        <Text style={{ fontSize: 20, alignSelf: 'center' }}>{this.props.userName}</Text>                                            
        <View style={{ ...styles.videosContainer, }}>
          <ScrollView style={{ ...styles.scrollView }}>
            <View style={{
              flex: 1,
              width: '100%',
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {remoteVideo}

            </View>
            {localVideo}
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}
