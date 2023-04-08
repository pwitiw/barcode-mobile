import React, { useState, useEffect } from 'react';
import { Image, Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Constants from 'expo-constants';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const Scanner =  props => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    props.onScanned(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <BarCodeScanner
    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
    style={[styles.container]}>
    <Text style={styles.description}>Zeskanuj kod</Text>
    <Image
      style={styles.qr}
      source={require('../assets/scanner-img.png')}
    />
    <Text onPress={() => props.onBack()} style={styles.cancel}>
      Cofnij
    </Text>
  </BarCodeScanner>
  );

};

export default Scanner;

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
});
