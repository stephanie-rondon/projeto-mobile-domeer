import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CirculoProps {
    style?: ViewStyle;
}

const Circulo = ({ style }: CirculoProps) => {
    return (
        <View style={styles.container}>
            <View style={[styles.circulo, style]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    },
    circulo: {
        backgroundColor: 'rgba(252, 109, 171, 1)',
        position: 'absolute',
        width: 800,
        height: 800,
        borderRadius: 400,
        zIndex: -1, //fica na ultima camada
    },
});

export default Circulo