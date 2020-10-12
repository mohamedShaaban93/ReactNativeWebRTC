import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { styles } from './styles'

interface Props {
  data: string;
}

export default class UserCard extends Component<Props> {

  render() {
    const { data } = this.props;
    return (
      <View style={styles.continer}>
        <Text style={styles.text}>{data}</Text>
      </View>
    )
  }
}
