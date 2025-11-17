import { Image, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../../../components/ui/Botao';
import Circulo from '../../../../components/ui/Circulo';

export default function UserScreen() {
  const nomeUsuario = 'Joao Silva';
  const avatarUri = 'https:';

  function handleEditar() {
  }

  function handleSair() {
  }

  return (
    <View style={styles.container}>
      <Circulo
      style={{
        bottom:-900,
        left:-390,
        right:0,
        top:undefined,
      }}
      />
      
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <Text style={styles.text}>{nomeUsuario}</Text>
      <View style={styles.botoes}>
        <Botao texto="Editar" onPress={handleEditar} />
        <Botao texto="Sair" onPress={handleSair} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c04cfd',
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