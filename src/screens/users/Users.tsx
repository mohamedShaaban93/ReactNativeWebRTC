import React, { Component } from 'react'
import { ActivityIndicator, Button, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';
import UserCard from '../../components/userCard/UserCard';
import { getClient } from '../../realtime';
import { connect } from 'react-redux';

interface Props {
  componentId: string;
  comingCall: {
    hasOffer: boolean,
    name: string
  };
}
interface State {
  userName: string;
  secondUser: string;
  usersList: string[];
  loading: boolean;
}
class Users extends Component<Props, State> {
  private socket: SocketIOClient.Socket;
  constructor(props: Props) {
    super(props);
    this.socket = getClient();
    this.state = {
      userName: '',
      secondUser: '',
      usersList: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.socket.on('conn-success', (data: { name: string }) => {
      this.setState({
        userName: data.name,
      })
    })
    this.socket.on('users-list', (data: string[]) => {
      this.setState({
        usersList: data,
        loading: false
      })
    })
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
    } else if (this.props.comingCall.hasOffer) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title='answer' onPress={() => {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'call',
                passProps: {
                  userName: this.state.userName,
                  secondUser: this.props.comingCall.name,
                  offer: false
                }
              }
            })
          }} />
          <Button title='decline' onPress={() => {}} />
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
            {this.state.usersList?.map((data,index) => {
              if (data !== this.state.userName) {
                return (
                  <TouchableOpacity key={index} onPress={() => {
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
        </SafeAreaView>
      )
  }
}

const mapStateToProps = (state: any) => ({
  comingCall: state.call.comingCall
})
export default connect(mapStateToProps)(Users);