import React from 'react';
import { SectionList, StyleSheet, View, Text } from 'react-native';


export default function List({ data }) {
    const group = () => {
        var ordersWithFronts = new Map();
        data.forEach(entry => {
            const key = entry.order.id;
            if (!ordersWithFronts.has(key)) {
                ordersWithFronts.set(key, { order: entry.order, fronts: [] });
            }
            const allFrontsExist = ordersWithFronts.get(key).fronts.length != 0;
            if (!allFrontsExist || ordersWithFronts.get(key).fronts.filter(front => front.frontInfo.barcode.barcode == entry.front.barcode.barcode).length == 0) {
                ordersWithFronts.get(key).fronts.push({ frontInfo: entry.front, frontQuantity: 1 });
            }
            else {
                var frontQuantity = ordersWithFronts.get(key).fronts.filter(
                    front => front.frontInfo.barcode.barcode == entry.front.barcode.barcode)[0].frontQuantity;
                ordersWithFronts.get(key).fronts.filter(
                    front => front.frontInfo.barcode.barcode == entry.front.barcode.barcode)[0].frontQuantity = frontQuantity + 1;
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

    const sections = [];
    group().forEach(entry => {
        var frontsNumber = entry.fronts.reduce((sum, currentValue) => {
            return sum + currentValue.frontQuantity;
        }, 0);

        if (frontsNumber > entry.order.quantity) frontsNumber = entry.order.quantity;

        sections.push({
            title: entry.order.name + "  " + frontsNumber + "/" + entry.order.quantity + "szt.",
            data: entry.fronts.map(front =>
                front.frontInfo.dimensions.height + " x "
                + front.frontInfo.dimensions.width + " "
                + getFrontAmount(front) + "/"
                + front.frontInfo.quantity + "szt.")
        });
    })
    return (
        <View style={styles.list}>
            <SectionList sections={sections}
                renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
                renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => index}
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
});