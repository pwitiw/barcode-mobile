import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import Constants from 'expo-constants';
import { Dimensions } from 'react-native';
import Scanner from './src/Scanner';
import List from './src/List';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const { width } = Dimensions.get('window');

export default function App() {
  const [scannedData, updateScannedData] = useState([]);
  const [isScannerOn, setScannerOn] = useState(false);

  const onScanned = (data) => {
      alert('Scanned data: ' + data);
      updateScannedData(scannedData.concat(JSON.parse(data)));
      setScannerOn(false);
  }

  const sendData = async () => {
    const input = {
      "QueueUrl": "https://sqs.eu-central-1.amazonaws.com/189706958568/dev-frontwit-scanned-barcode",
      "MessageBody": JSON.stringify({"DUPA": "dupa"}),
      "DelaySeconds": 0
    };
    const command = new SendMessageCommand(input);
    const client = new SQSClient({ region: "eu-central-1", credentials: {accessKeyId:"AKIASYK3KO3UFTTPB4FY", secretAccessKey:"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"} });
    try {
      const data = await client.send(command);
      updateScannedData([]);
    } catch (error) {
console.debug(error);
      } finally {
      // finally.
    }
   
  }

  const onBack = () => {
    setScannerOn(false);
  }

  if(isScannerOn) {
    return (<SafeAreaProvider>
    <View
      style={{
      }}>
        <Scanner onScanned={onScanned} onBack={onBack}></Scanner>
    </View>
    </SafeAreaProvider>
    )
  }
  return (
    <SafeAreaProvider>
    <View
      style={{
        // flexDirection: 'column',
        justifyContent:'space-around',
        marginBottom: 30,
        marginTop: 30,
        margin: 10
      }}>
        <Text>Zeskanowano:</Text>
        <List data={scannedData}></List>
        <View style={{
            flexDirection: 'row',
            // justifyContent: 'center-around',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <Button style={styles.sendButton} radius={'sm'} type="solid" onPress={()=>setScannerOn(true)}>Skanuj kod</Button>
          <Button style={styles.sendButton} title={'Wyślij'} onPress={sendData} >Wyślij</Button>
        </View>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    // marginBottom: 30,
    backgroundColor: '#ecf0f1',
    // padding: 8,
  },
  qr: {
    marginTop: '20%',
    marginBottom: '20%',
    width: width,
    height: width,
    color: 'white'
  },
  description: {
    fontSize: width * 0.09,
    marginTop: '10%',
    textAlign: 'center',
    width: '70%',
    color: 'white',
  },
  cancel: {
    fontSize: width * 0.05,
    textAlign: 'center',
    width: '70%',
    color: 'white',
  },
  sendButton: {
    alignSelf: 'stretch'
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
  }
});