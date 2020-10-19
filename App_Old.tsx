import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  TouchableNativeFeedbackBase
} from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCView,
  MediaStream,
  mediaDevices,
  MediaStreamConstraints
} from 'react-native-webrtc';
import { connect } from 'react-redux';
import { getClient, getPeerConnection } from './src/realtime';

const dimensions = Dimensions.get('window')

interface Props {
  componentId: string;
  comingCall: {
    hasOffer: boolean,
    name: string
  };
}
interface State {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mirror: boolean;
  userName: string;
  secondUser: string;
  usersList: string[];
  comingCall: boolean;
}
class App extends React.Component<Props, State>{
  state: State = {
    localStream: null,
    remoteStream: null,
    mirror: true,
    userName: '',
    secondUser: '',
    usersList: [],
    comingCall: false,
  }

  private pc: RTCPeerConnection;
  private socket: SocketIOClient.Socket;
  private sdp: string = '';
  private candidates: RTCIceCandidate[] = []

  constructor(props: Props) {
    super(props);
    this.pc = getPeerConnection();
    this.socket = getClient();
  }
  componentDidUpdate(prevProps: Props) {
    const { hasOffer } = this.props.comingCall
    if (hasOffer && prevProps.comingCall.hasOffer != hasOffer) {
      this.setState({
        comingCall: hasOffer,
        secondUser: this.props.comingCall.name
      })
    }
  }

  componentDidMount = () => {
    this.peerConnection();
    this.socketListener();
    this.getUserMedia();
  }
  componentWillUnmount() {
    this.socket.disconnect();
  }
  peerConnection = () => {
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.sendToPeer('ice-candidate', { name: this.state.secondUser, from: this.state.userName, candidate: e.candidate })
      }
    }
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    this.pc.onaddstream = (e) => {
      console.log('===========remoteStream=========================');
      console.log(e.stream);
      console.log('====================================');
      this.setState({
        remoteStream: e.stream
      })
    }
  }
  socketListener = () => {
    this.socket.on('conn-success', (data: string) => {
      this.setState({
        userName: data.name,
      })
    })

    this.socket.on('users-list', (data: string[]) => {
      this.setState({
        usersList: data,
      })
    })
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
  sendToPeer = (messageType: string, payload: object) => {
    console.log("messageType", messageType)
    this.socket.emit(messageType, payload)
  }

  createOffer = () => {
    this.pc.createOffer()
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        this.sendToPeer('offer', { name: this.state.secondUser, from: this.state.userName, description: sdp })
      })
  }

  createAnswer = () => {
    this.pc.createAnswer()
      .then(sdp => {
        this.pc.setLocalDescription(sdp)
        this.sendToPeer('answer', { name: this.state.secondUser, from: this.state.userName, description: sdp })
      })
  }
  render() {
    const {
      localStream,
      remoteStream,
    } = this.state

    const remoteVideo = remoteStream ?
      (
        <RTCView
          key={2}
          mirror={true}
          style={{ ...styles.rtcViewRemote }}
          objectFit='contain'
          streamURL={remoteStream && remoteStream.toURL()}
        />
      ) :
      (
        <View style={{ padding: 15, }}>
          <Text style={{ fontSize: 22, textAlign: 'center', color: 'white' }}>Waiting for Peer connection ...</Text>
        </View>
      )
    if (this.state.secondUser === '' && this.props.comingCall.name === '') {
      return (
        <SafeAreaView style={{ flex: 1, }}>
          <StatusBar backgroundColor="blue" barStyle={'dark-content'} />
          <Text style={{ fontSize: 20, alignSelf: 'center' }}>
            My name is {this.state.userName}
          </Text>
          <ScrollView>
            {this.state.usersList?.map(data => {
              if (data !== this.state.userName) {
                return (
                  <TouchableOpacity onPress={() => { this.setState({ secondUser: data }) }}>
                    <Text style={{ fontSize: 20, alignSelf: 'center' }}>
                      {data}
                    </Text>
                  </TouchableOpacity>
                )
              }
              else { return null; }
            })}
          </ScrollView>

        </SafeAreaView>
      )
    }
    else
      return (

        <SafeAreaView style={{ flex: 1, }}>
          <StatusBar backgroundColor="blue" barStyle={'dark-content'} />
          <Text style={{ fontSize: 20, alignSelf: 'center' }}>{this.state.userName}</Text>
          <View style={{ ...styles.buttonsContainer }}>
            <View style={{ flex: 1, }}>
              <TouchableOpacity onPress={this.createOffer}>
                <View style={styles.button}>
                  <Text style={{ ...styles.textContent, }}>Call</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, }}>
              <TouchableOpacity onPress={this.createAnswer}>
                <View style={styles.button}>
                  <Text style={{ ...styles.textContent, }}>Answer</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
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
              <TouchableOpacity onPress={() => {
                this.setState({
                  mirror: !this.state.mirror,
                })
                localStream._tracks[1]._switchCamera()
              }}>
                <View>
                  <RTCView
                    key={1}
                    zOrder={0}
                    objectFit='cover'
                    style={{ ...styles.rtcView }}
                    mirror={this.state.mirror}
                    streamURL={localStream && localStream.toURL()}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
  }
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    margin: 5,
    paddingVertical: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
  },
  textContent: {
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
  },
  videosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rtcView: {
    width: 100, //dimensions.width,
    height: 200,//dimensions.height / 2,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
    // flexDirection: 'row',
    backgroundColor: 'teal',
    padding: 15,
  },
  rtcViewRemote: {
    width: dimensions.width - 30,
    height: 200,//dimensions.height / 2,
    backgroundColor: 'black',
  }
});

const mapStateToProps = (state: any) => ({
  comingCall: state.call.comingCall
})
export default connect(mapStateToProps)(App);