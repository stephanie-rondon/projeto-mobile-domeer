import { View, Text, StyleSheet } from 'react-native';

export default function PaginaInicial() {
    return (
        <View style={styles.container}>
            <Text>pagina inicial pra nao dar erro..</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});