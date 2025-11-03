import React from 'react';
import { StyleSheet, View } from 'react-native';

export default BackgroundUser
const BackgroundUser = () => {
    return (
        <View style={styles.container}>
            <View style={styles.circulo} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circulo: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF5733',
        zIndex: -1,
    },
});

