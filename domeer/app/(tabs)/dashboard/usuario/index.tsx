import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../../../components/ui/Botao.tsx';

export default function UserScreen() {
  const nomeUsuario = 'Joao Silva';
  const avatarUri = 'https:';

  function handleEditar() {
  }

  function handleSair() {
  }

  return (
    <LinearGradient
      colors={['rgba(252, 109, 171, 1)', 'rgba(94, 43, 255, 1)']} //a primeira cor é em cima, e a segunda é embaixo
      locations={[0.5, 0]} //aqui tu muda o nivel do degrade, se aumentar o primmeiro numero, a primeira cor fica maior, segundo numero, segunda cor..
      style={styles.container}
    >
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <Text style={styles.text}>{nomeUsuario}</Text>
      <View style={styles.botoes}>
        <Botao texto="Editar" onPress={handleEditar} />
        <Botao texto="Sair" onPress={handleSair} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#145',
  },
  text: {
    color: '#FFFEE5',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#FFFEE5',
  },
  botoes: {
    width: '80%',
    marginTop: 10,
  },
});