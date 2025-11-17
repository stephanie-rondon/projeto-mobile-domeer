import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface BotaoProps {
  texto: string;
  onPress: () => void;
}

export function Botao({ texto, onPress }: BotaoProps) {
  return (
    <TouchableOpacity style={styles.botao} onPress={onPress}>
      <Text style={styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#FFFEE5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginVertical: 8,
  },
  texto: {
    color: '#c04cfd',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
