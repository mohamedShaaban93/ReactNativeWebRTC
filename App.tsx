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
    RTCSessionDescription,
    RTCView,
    MediaStream,
    RTCIceCandidateType,
    mediaDevices,
    RTCPeerConnectionConfiguration,
    MediaStreamConstraints
} from 'react-native-webrtc';

import io from 'socket.io-client'
import { IceCandidatePayload } from './src/interfaces/Candidate.interface';
import { OfferAnswerPayload } from './OfferAnswer.interface';

const dimensions = Dimensions.get('window')

interface Props {

}
interface State {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    mirror: boolean;
    userName: string;
    secondUser: string;
    usersList: string[]
}
const pc_config: RTCPeerConnectionConfiguration = {
    "iceServers": [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
}
class App extends React.Component<Props, State>{
    state: State = {
        localStream: null,
        remoteStream: null,
        mirror: true,
        userName: '',
        secondUser: '',
        usersList: [],
    }

    private pc: any;
    private socket: any;
    private sdp: string = '';
    private candidates: RTCIceCandidate[] = []

    constructor(props: Props) {
        super(props);
    }

    componentDidMount = () => {
        this.peerConnection();
        this.socketListener();
        this.getUserMedia();
    }
    peerConnection = () => {
        this.pc = new RTCPeerConnection(pc_config)
        this.pc.onicecandidate = (e) => {
            // send the candidates to the remote peer
            // see addCandidate below to be triggered on the remote peer
            if (e.candidate) {
                // console.log(JSON.stringify(e.candidate))
                this.sendToPeer('candidate', e.candidate)
            }
        }

        // triggered when there is a change in connection state
        this.pc.oniceconnectionstatechange = (e) => {
            console.log(e)
        }

        this.pc.onaddstream = (e) => {
            debugger
            // this.remoteVideoref.current.srcObject = e.streams[0]
            this.setState({
                remoteStream: e.stream
            })
        }
    }
    socketListener = () => {
        this.socket = io.connect('https://webrtc-server-api.herokuapp.com/')

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

        this.socket.on('offer', (payload: OfferAnswerPayload) => {
            this.sdp = JSON.stringify(payload.description)
            this.pc.setRemoteDescription(new RTCSessionDescription(payload.description))
        })

        this.socket.on('answer', (payload: OfferAnswerPayload) => {
            this.sdp = JSON.stringify(payload.description)
            this.pc.setRemoteDescription(new RTCSessionDescription(payload.description))
        })

        this.socket.on('ice-candidat', (payload: IceCandidatePayload) => {
            this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
        })
    }
    getUserMedia = () => {
        const success = (stream: MediaStream) => {
            console.log(stream.toURL())
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
    sendToPeer = (messageType: string, payload: object) => {
        console.log("messageType", messageType)
        this.socket.emit(messageType, payload)
    }

    createOffer = () => {

        // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
        // initiates the creation of SDP
        this.pc.createOffer({ offerToReceiveVideo: 1 })
            .then(sdp => {
                // console.log(JSON.stringify(sdp))

                // set offer sdp as local description
                this.pc.setLocalDescription(sdp)
                this.sendToPeer('offer', { name: this.state.secondUser, from:this.state.userName, description: sdp })
            })
    }

    createAnswer = () => {
        console.log('Answer')
        this.pc.createAnswer({ offerToReceiveVideo: 1 })
            .then(sdp => {
                // console.log(JSON.stringify(sdp))

                // set answer sdp as local description
                this.pc.setLocalDescription(sdp)

                this.sendToPeer('answer', { name: this.state.secondUser, from:this.state.userName, description: sdp })
            })
    }

    setRemoteDescription = () => {
        // retrieve and parse the SDP copied from the remote peer
        const desc = JSON.parse(this.sdp)

        // set sdp as remote description
        this.pc.setRemoteDescription(new RTCSessionDescription(desc))
    }

    addCandidate = () => {
        // retrieve and parse the Candidate copied from the remote peer
        // const candidate = JSON.parse(this.textref.value)
        // console.log('Adding candidate:', candidate)

        // add the candidate to the peer connection
        // this.pc.addIceCandidate(new RTCIceCandidate(candidate))

        this.candidates.forEach(candidate => {
            console.log(JSON.stringify(candidate))
            this.pc.addIceCandidate(new RTCIceCandidate(candidate))
        });
        console.log("RTC=======>", this.rtc);

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
        if (this.state.secondUser === '') {
            return (
                <SafeAreaView style={{ flex: 1, }}>
                    <StatusBar backgroundColor="blue" barStyle={'dark-content'} />
                    <Text style={{ fontSize: 20, alignSelf: 'center' }}>
                        My name is {this.state.userName}
                    </Text>
                    <ScrollView>
                        {this.state.usersList?.map(data => {
                            if (data !== this.state.userName)
                                return (
                                    <TouchableOpacity onPress={() => { this.setState({ secondUser: data }) }}>
                                        <Text style={{ fontSize: 20, alignSelf: 'center' }}>
                                            {data}
                                        </Text>
                                    </TouchableOpacity>
                                )
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

export default App;
