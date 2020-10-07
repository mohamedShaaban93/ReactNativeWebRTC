import Socket from 'socket.io-client';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#4F4',
  },
});

const App = () => {
  // you have to keep the peer connections without re-rendering
  // every time a peer connects/disconnects
  const peerConnections = useRef(new Map());
  const [stream, setStream] = useState(null);
  const [users , setUsers] = useState([]);
  const [clientStream, setClientStream] = useState(null);
  const [socket] = useState(Socket.connect("https://webrtc-server-api.herokuapp.com")); // replace with your host machine's IP or public url

  const connectionBuffer = new RTCPeerConnection(config);

  useEffect(() => {
    socket.on('connect', () => {
     console.log("==========================connectiing .......");

     socket.on("users-list",async(data)=>{
       console.log("=============================usserss ",data );
      setUsers(data.users);
     })
     
      if (stream) socket.emit('broadcaster');

      socket.on('watcher', async id => {
        const connectionBuffer = new RTCPeerConnection(config);

        stream.getTracks.forEach(track =>
          connectionBuffer.addTrack(track, stream),
        );

        connectionBuffer.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit('candidate', id, candidate);
        };

        const localDescription = await connectionBuffer.createOffer();
        await connectionBuffer.setLocalDescription(localDescription);
        setClientStream(connectionBuffer);


        socket.emit('offer', id, connectionBuffer.localDescription);

        peerConnections.current.set(id, connectionBuffer);
      });

      socket.on('candidate', (id, candidate) => {
        const candidateBuffer = new RTCIceCandidate(candidate);
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.addIceCandidate(candidateBuffer);
      });

      socket.on('answer', (id, remoteOfferDescription) => {
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.setRemoteDescription(remoteOfferDescription);
      });

      socket.on('disconnectPeer', id => {
        peerConnections.current.get(id).close();
        peerConnections.current.delete(id);
      });
    });

    return () => {
      if (socket.connected) socket.close(); // close the socket if the view is unmounted
    };
  }, [socket, stream]);

  useEffect(() => {
    if (!stream) {
      (async () => {
        const availableDevices = await mediaDevices.enumerateDevices();
        const { deviceId: sourceId } = availableDevices.find(
          device => device.kind === 'videoinput' && device.facing === 'back',
        );

        const streamBuffer = await mediaDevices.getUserMedia({
          audio: true,
          video: {
            mandatory: {
              // Provide your own width, height and frame rate here
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: 'user',
            optional: [{ sourceId }],
          },
        });

        setStream(streamBuffer);
      })();
    }
  }, [stream]);

  return <>
    {/* <RTCView streamURL={stream?.toURL()} style={styles.viewer} />
    <RTCView streamURL={clientStream?.toURL()} style={styles.viewer} /> */}
    <View style={{
      flex:1,
      alignContent:"stretch",
      alignItems:"stretch",
      backgroundColor:"red"
    }}>
  {users?.map((ele , index) => <Text key={index}>{JSON.stringify(ele)}</Text>)}
    </View>
  </>;
};

export default App;