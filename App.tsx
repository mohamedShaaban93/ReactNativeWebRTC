import React, { useEffect, useState } from 'react';
import { Button, Text, View, TextInput, Alert } from 'react-native';
import { mediaDevices, MediaStream, RTCIceCandidate, RTCIceCandidateType, RTCPeerConnection, RTCSessionDescription, RTCView } from 'react-native-webrtc';

const App = () => {

    const config = {
        iceServers: [
            {
                urls: ['stun:stun.l.google.com:19302'],
            },
        ],
    };
    const [stream, setStream] = useState(null);
    const [stream1, setStream1] = useState(new MediaStream());
    const [textDisc, setTextDisc] = useState('');
    const [textDisc1, setTextDisc1] = useState('');
    console.log("===============textDis ", textDisc);


    // starconnition with RTCPeer
    const peerConnection = new RTCPeerConnection(config);
    console.log("======peeeeer", peerConnection);





    const onCreateOffer = async () => { // peer 1
        console.log("=================================================onCreateOffer");
        const localSdp = await peerConnection.createOffer();
        console.log("==================create offer =========== ", JSON.stringify(localSdp));
        peerConnection.setLocalDescription(localSdp);
        console.log("======peeeeer", peerConnection);
        setTextDisc(JSON.stringify(localSdp));
    };

    const oncreateAnswer = async () => { //peer2
        console.log("=================================================onCreateOffer");
        const localSdp = await peerConnection.createAnswer();
        console.log("==================create offer =========== ", JSON.stringify(localSdp));
        peerConnection.setLocalDescription(localSdp);
        // console.log("======peeeeer", peerConnection);
        setTextDisc(JSON.stringify(localSdp));
    }

    const onSetRemoteescription = () => {
        console.log("=================================================onSetRemoteescription");
        const value = JSON.parse(textDisc);
        peerConnection.setRemoteDescription(new RTCSessionDescription(value))
        console.log("======peeeeer", peerConnection);
        Alert.alert("1");
    }

    const onAddCandidate = () => {
        const value = JSON.parse(textDisc);
        console.log("=================================================onAddCandidate", typeof (new RTCIceCandidate(value))  , typeof(value) );
        const peerStream = peerConnection.addIceCandidate(new RTCIceCandidate(value)).then((res)=>console.log("success == ", res)).catch(error=> console.log("errorro===",error))
    }


    useEffect(() => {
        if (!stream) {
            (async () => {
                console.log("================00");

                const availableDevices = await mediaDevices.enumerateDevices();
                console.log("=================11111", availableDevices);

                const { deviceId: sourceId } = availableDevices.find(
                    device => device.kind === 'videoinput' && device.facing === 'front',
                );

                const streamBuffer = await mediaDevices.getUserMedia({
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
        if (stream) {
            console.log("====haaannann=====", stream);
            peerConnection.addStream(stream);
        }

        peerConnection.addEventListener("addstream", e => {
            console.info('Remote Stream Added:', e.stream)
            setStream1(e.stream)
        })


        peerConnection.addEventListener("icecandidate", e => {
            if (e.candidate) {
                console.log("+++++++++++++++++++++++++++candidate+++++++++ : ", JSON.stringify(e.candidate));
                setTextDisc1(JSON.stringify(e.candidate));

            }
        });

    }, [stream]);


    return (
        <View style={{
            flex: 1,
            backgroundColor: "red",
            alignSelf: "stretch",
            alignContent: "stretch"
        }}>
            <View style={{
                flex: 1,
                backgroundColor: "red",
                alignSelf: "stretch",
                alignContent: "stretch"
            }}>
                <RTCView streamURL={stream?.toURL()}
                    style={{
                        flex: 1,
                        display: 'flex',
                        backgroundColor: '#4F4',
                    }} />
                <RTCView streamURL={stream1?.toURL()}
                    style={{
                        flex: 1,
                        display: 'flex',
                        backgroundColor: 'black',
                    }} />
            </View>
            <View style={{
                alignSelf: "stretch"
            }}>
                <Button onPress={onCreateOffer} title="create offer" color='red' />
                <Button onPress={oncreateAnswer} title="create answer" color='green' />
                <Button onPress={onSetRemoteescription} title="set Remote Description" color='black' />
                <Button onPress={onAddCandidate} title="setIceCandidate" color='blue' />
                <TextInput value={textDisc} onChangeText={(text) => setTextDisc(text)} />  
                <TextInput style={{backgroundColor:"pink"}} value={textDisc1} onChangeText={(text) => setTextDisc1(text)} />
            </View>

        </View>
    )
}

export default App;