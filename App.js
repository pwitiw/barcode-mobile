import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import React, {useEffect, useState} from 'react';
import {Text, View, StyleSheet, Alert} from 'react-native';
import {Button} from '@rneui/themed';
import Constants from 'expo-constants';
import {Dimensions} from 'react-native';
import Scanner from './src/Scanner';
import List from './src/List';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

// todo jak powinno sie raportowac bledy aplikacji (toast, alert?) zeby latwiej diagnozowac?
export default function App() {

  const [scannedData, updateScannedData] = useState([]);
  const [isScannerOn, setScannerOn] = useState(false);
  var sending = false;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (sending) {
        return;
      }
      await send();
    }, 30000);
  }, []);

  const send = async () => {
    sending = true;
    const client = new SQSClient({
      region: "eu-central-1",
      credentials: {

      }
    });
    try {
      const barcodes = await getBarcodesFromStorage();
      for (var i = 1; i < barcodes.length; i++) {
        const barcode = barcodes[i];

        const body = {
          "readerId": "90",
          "barcode": barcode.front.barcode,
          "scannedAt": barcode.scannedAt
        };
        const input = {
          "QueueUrl": "https://sqs.eu-central-1.amazonaws.com/189706958568/frontwit-queue",
          "MessageBody": JSON.stringify(body),
          "DelaySeconds": 0
        };
        const command = new SendMessageCommand(input);

        const data = await client.send(command);
        await removeFromStorage(barcode);
      }
    } catch (error) {
      console.debug(error);
      Alert.alert(error)
    } finally {
      sending = false;
    }
  };

  const onScanned = (data) => {
    try {
      const scannedJson = JSON.parse(data);
      if(scannedJson.front === null || scannedJson.front.barcode === null){
        throw new Error("Incorrect code");
      }
      scannedJson.scannedAt = Date.now();
      const alreadyScannedFronts = scannedData.filter(
          entry => entry.front.barcode === scannedJson.front.barcode).length;
      if (alreadyScannedFronts >= scannedJson.front.quantity) {
        Alert.alert("Ten wymiar jest kompletny");
      } else {
        updateScannedData(scannedData.concat(scannedJson));
      }
    } catch (e) {
      Alert.alert("Niepoprawny kod");
    } finally {
      setScannerOn(false);
    }
  }

  const removeFromStorage = async (barcode) => {
    try {
      const barcodes = await getBarcodesFromStorage();
      const elemForRemoval = barcodes.filter(
          e => e.front.barcode === barcode.front.barcode && e.scannedAt
              === barcode.scannedAt)[0];
      const newBarcodes = barcodes.filter(e => e !== elemForRemoval)
      await AsyncStorage.setItem('@barcodes', JSON.stringify(newBarcodes));
    } catch (e) {
      Alert.alert(e);
    }
  }

  const onSave = async () => {
    try {
      var barcodes = await getBarcodesFromStorage();
      var result = JSON.stringify([...barcodes, ...scannedData]);
      await AsyncStorage.setItem('@barcodes', result);
      updateScannedData([]);
    } catch (e) {
      Alert.alert(e);
    }
  }

  const getBarcodesFromStorage = async () => {
    try {
      const barcodes = await AsyncStorage.getItem('@barcodes');
      return barcodes != null ? JSON.parse(barcodes) : [];
    } catch (e) {
      Alert.alert(e);
    }
  }

  const onBack = () => {
    setScannerOn(false);
  }

  const removeFrontClicked = (front) => {
    var elemForRemoval = scannedData.filter(
        e => e.front.barcode === front.frontInfo.barcode)[0];
    updateScannedData(scannedData.filter(e => e !== elemForRemoval));
  }

  if (isScannerOn) {
    return (<SafeAreaProvider>
          <View style={{}}>
            <Scanner onScanned={onScanned} onBack={onBack}></Scanner>
          </View>
        </SafeAreaProvider>
    )
  }
  return (
      <SafeAreaProvider>
        <View style={{
          flex: 1,
          paddingTop: Constants.statusBarHeight,
        }}>
          <Text>Zeskanowano:</Text>
          <List data={scannedData}
                removeFrontClicked={removeFrontClicked}></List>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            padding: 10
          }}>
            <View style={{
              flex: 1,
              alignSelf: 'flex-end',
              flexDirection: 'row',
              width: width,
              alignContent: 'stretch',
              justifyContent: 'space-around',
            }}>
              <Button style={styles.sendButton}
                      onPress={() => setScannerOn(true)}>Skanuj kod</Button>
              <Button style={styles.sendButton} title={'Wyślij'}
                      onPress={onSave}
                      disabled={scannedData.length === 0}>Zapisz</Button>
            </View>
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
    backgroundColor: '#ecf0f1',
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
    width: 2 * width / 5,
  }
});