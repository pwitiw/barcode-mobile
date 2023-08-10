import React from 'react';
import {SectionList, StyleSheet, View, Text} from 'react-native';
import {Button, Icon} from '@rneui/themed';

export default function List({data, removeFrontClicked}) {
  const group = () => {
    var ordersWithFronts = new Map();
    data.forEach(entry => {
      const key = entry.order.id;
      if (!ordersWithFronts.has(key)) {
        ordersWithFronts.set(key, {order: entry.order, fronts: []});
      }
      const allFrontsExist = ordersWithFronts.get(key).fronts.length != 0;
      if (!allFrontsExist || ordersWithFronts.get(key).fronts.filter(
          front => front.frontInfo.barcode.barcode
              == entry.front.barcode.barcode).length == 0) {
        ordersWithFronts.get(key).fronts.push(
            {frontInfo: entry.front, frontQuantity: 1});
      } else {
        var frontQuantity = ordersWithFronts.get(key).fronts.filter(
            front => front.frontInfo.barcode.barcode
                == entry.front.barcode.barcode)[0].frontQuantity;
        ordersWithFronts.get(key).fronts.filter(
            front => front.frontInfo.barcode.barcode
                == entry.front.barcode.barcode)[0].frontQuantity = frontQuantity
            + 1;
      }
    });
    return ordersWithFronts;
  };

  const getFrontAmount = (front) => {
    if (front.frontQuantity > front.frontInfo.quantity) {
      return front.frontInfo.quantity
    }
    return front.frontQuantity;
  }

  const formatRow = (front)  => {
    return front.frontInfo.dimensions.height + " x "
        + front.frontInfo.dimensions.width + " "
        + getFrontAmount(front) + "/"
        + front.frontInfo.quantity + "szt.";
  }

 const isFullyScannedFront =( front)=>{
    return front.frontInfo.quantity === front.frontQuantity;
  }

  const sections = [];
  group().forEach(entry => {
    var frontsNumber = entry.fronts.reduce((sum, currentValue) => {
      return sum + currentValue.frontQuantity;
    }, 0);

    if (frontsNumber > entry.order.quantity) {
      frontsNumber = entry.order.quantity;
    }
    
    sections.push({
      title: entry.order.name + "  " + entry.order.customer + "  " + entry.order.route +"  " + frontsNumber + "/" + entry.order.quantity
          + "szt.",
      data: entry.fronts
    });
  });

  const Item = ({ item, section, index }) => {
    return (
    <View style={[styles.singleFrontView, isFullyScannedFront(item)? styles.fullyScanned : {}]}>
      <Text style={styles.item}>{formatRow(item)}</Text>
      <Icon
          name='minus'
          type='font-awesome'
          color='#f50'
          onPress={() => removeFrontClicked(item)}
      />
    </View>
    );
  };
  return (
      <View style={styles.list}>
        <SectionList sections={sections}
                     renderItem={Item}
                     renderSectionHeader={({section}) => <Text
                         style={styles.sectionHeader}>{section.title}</Text>}
                       keyExtractor={(item, index) => index.toString()}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  _list: {
    // flex: 1,
  },
  get list() {
    return this._list;
  },
  set list(value) {
    this._list = value;
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  singleFrontView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10
  },
  fullyScanned: {
    backgroundColor: '#8FBC8F'
  }
});