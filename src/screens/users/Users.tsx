import React, { Component } from 'react'
import { ActivityIndicator, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import UserCard from '../../components/userCard/UserCard';
import { getClient } from '../../realtime';

interface Props {

}
interface State {
  userName: string;
  secondUser: string;
  usersList: string[];
  loading: boolean;
}
export default class Users extends Component<Props, State> {
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
  render() {
    if (this.state.loading) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color='orange' />
        </SafeAreaView>
      )
    }
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
                  <UserCard data={data}/>
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
