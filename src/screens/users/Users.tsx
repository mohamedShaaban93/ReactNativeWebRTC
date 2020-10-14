import React, { Component } from 'react'
import { ActivityIndicator, Button, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';
import { RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import UserCard from '../../components/userCard/UserCard';
import { IceCandidatePayload } from '../../interfaces/Candidate.interface';
import { OfferAnswerPayload } from '../../interfaces/OfferAnswer.interface';
import { getClient, getPeerConnection } from '../../realtime';
import { connect } from 'react-redux';

interface Props {
  componentId: string;
  comingCall: boolean;
}
interface State {
  userName: string;
  secondUser: string;
  usersList: string[];
  loading: boolean;
  comingCall: boolean;
}
class Users extends Component<Props, State> {
  private socket: SocketIOClient.Socket;
  private pc: RTCPeerConnection;
  constructor(props: Props) {
    super(props);
    this.socket = getClient();
    this.pc = getPeerConnection();
    this.state = {
      userName: '',
      secondUser: '',
      usersList: [],
      loading: true,
      comingCall: false,
    }
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.comingCall && prevProps.comingCall != this.props.comingCall) {
      console.log('ssssssssssssssssssssssssssssssssss');

      this.setState({
        comingCall: this.props.comingCall,
      })
    }
  }

  componentDidMount() {
    this.socket.on('conn-success', (data: { name: string }) => {
      this.setState({
        userName: data.name,
      })
    })
    console.log('cccccccccccccccccccccccc', this.props.comingCall);

    this.socket.on('users-list', (data: string[]) => {
      this.setState({
        usersList: data,
        loading: false
      })
    })
    //   this.socket.on('offer', (payload: OfferAnswerPayload) => {
    //     this.setState({ comingCall: true, secondUser:payload.name })
    //     console.log('oferrrrrrrrrrrrrrrrrrrrrrrrrrrr', payload);

    //     // this.sdp = JSON.stringify(payload.description)
    //     this.pc.setRemoteDescription(new RTCSessionDescription(payload.description))
    //   })

    //   this.socket.on('answer', (payload: OfferAnswerPayload) => {
    //     console.log('answreeeeeeeeeeeeeeeeeeeeeeeeeer', payload);

    //     // this.sdp = JSON.stringify(payload.description)
    //     this.pc.setRemoteDescription(new RTCSessionDescription(payload.description))
    //   })
    //   this.socket.on('ice-candidate', (payload: IceCandidatePayload) => {
    //     this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
    //   })
  }
  componentWillUnmount() {
    this.socket.disconnect();
  }
  render() {
    if (this.state.loading) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color='orange' />
        </SafeAreaView>
      )
    } else if (this.state.comingCall) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title='answer' onPress={() => {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'call',
                passProps: {
                  userName: this.state.userName,
                  secondUser: this.state.secondUser,
                  offer: false
                }
              }
            })
          }} />
          <Button title='decline' onPress={() => this.setState({ comingCall: false })} />
        </SafeAreaView>
      )

    } else
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
                  <TouchableOpacity onPress={() => {
                    Navigation.push(this.props.componentId, {
                      component: {
                        name: 'call',
                        passProps: {
                          userName: this.state.userName,
                          secondUser: data,
                          offer: true
                        }
                      }
                    })
                  }}>
                    <UserCard data={data} />
                  </TouchableOpacity>
                )
              }
              else { return null; }
            })}
          </ScrollView>
          <Button title='answer' onPress={() => {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'call',
                passProps: {
                  userName: this.state.userName,
                  secondUser: this.state.secondUser,
                  offer: false
                }
              }
            })
          }} />
          <Button title='decline' onPress={() => this.setState({ comingCall: false })} />

        </SafeAreaView>
      )
  }
}

const mapStateToProps = (state: any) => ({
  comingCall: state.call.call
})
export default connect(mapStateToProps)(Users);