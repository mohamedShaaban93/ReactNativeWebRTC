import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';

export interface Props {
  name: string;
  enthusiasmLevel?: number;
}

const Hello: React.FC<Props> = (props) => {
  const [enthusiasmLevel, setEnthusiasmLevel] = React.useState(
    props.enthusiasmLevel
  );
  const [streem , setStreem ] = useState("");
  const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
  const pc = new RTCPeerConnection(configuration);

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
    mediaDevices.getUserMedia({
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
    })
      .then(stream => {
        // Got stream!
      })
      .catch(error => {
        // Log error
      });
  });

  pc.createOffer().then(desc => {
    pc.setLocalDescription(desc).then(() => {
      // Send pc.localDescription to peer
    });
  });

  pc.onicecandidate = function (event) {
    // send event.candidate to peer
  };
  return (
    <View style={styles.root}>
      <Text>{"Hello"}</Text>
      <RTCView streamURL={"stun:stun.l.google.com:19302"}/>
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'center'
  },
  greeting: {
    color: '#999',
    fontWeight: 'bold'
  }
});

export default Hello;