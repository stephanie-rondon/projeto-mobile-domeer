import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';

import 'moment/locale/pt-br';
moment.locale('pt-br');

// Removendo: const { width } = Dimensions.get('window');
// Removendo: const DAY_WIDTH = width / 7;

const gatodeitado = require('../../../../assets/images/gato-deitado.png'); 
const calendario = require ('../../../../assets/images/calendario.png');

interface RoundButtonProps {

  iconName: keyof typeof FontAwesome.glyphMap;
  onPress: () => void;
  label: string;
}

interface DayData {
  date: string;
  dayOfWeek: string;
  dayOfMonth: string;
}

const RoundButton: React.FC<RoundButtonProps> = ({ iconName, onPress, label }) => {
  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <FontAwesome name={iconName} size={20} color="#c04cfd" />
      </TouchableOpacity>
      <Text style={styles.buttonLabel}>{label}</Text>
    </View>
  );
};

export default function Tutorial() {
  const selectedDate = moment().format('YYYY-MM-DD'); 
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // Armazena 'Tarefas', 'Metas' ou 'Hábitos'
  const [inputValue, setInputValue] = useState(''); // Estado para o input de informação
  const [habitFrequency, setHabitFrequency] = useState('Diário'); // Estado para frequência de Hábito
  
  const handleButtonPress = (buttonName: string) => {
    setModalType(buttonName); 
    setIsModalVisible(true); 
    setInputValue(''); // Limpa o input
    setHabitFrequency('Diário'); // Define o padrão para Hábito
  };
  
  const handleSave = () => {
    if (!inputValue.trim()) {
      Alert.alert('Atenção', `O campo de ${modalType} não pode estar vazio.`);
      return;
    }

    let message = `Adicionado: "${inputValue}" para o dia ${moment(selectedDate).format('DD/MM')}`;

    if (modalType === 'Hábitos') {
      message += `\nFrequência: ${habitFrequency}`;
    }

    Alert.alert(`Nova ${modalType}`, message);

    setIsModalVisible(false); // Fecha o modal
    setModalType(''); 
    setInputValue('');
    setHabitFrequency('Diário');
  };
  // --------------------------------------------------------

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
        locations={[0, 0.6]}
        style={styles.gradient}
      >
        <Text style={[styles.text, styles.copseText, styles.headerText]}>Seu dia</Text>

        {/* REMOVIDO: CalendarContainer e FlatList */}
        {/* <View style={styles.calendarContainer}>...</View> */}

        <Image
         source={gatodeitado} 
         style={styles.imagedeitado}
         resizeMode="contain"
        />

        <View style={styles.buttonContainer}>
          <RoundButton
            iconName="list"
            onPress={() => handleButtonPress('Tarefas')}
            label="nova Tarefa"
          />
          <RoundButton
            iconName="bullseye"
            onPress={() => handleButtonPress('Metas')}
            label="nova Meta"
          />
          <RoundButton
            iconName="refresh"
            onPress={() => handleButtonPress('Hábitos')}
            label="novo Hábito"
          />
        </View>
      </LinearGradient>

      {/* --- O MODAL COM BLUR AQUI --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
      >
        <BlurView
          style={styles.absolute}
          intensity={40}
          tint="dark"
        >
          <View style={styles.modalCenteredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Nova {modalType}</Text>
              {/* O Modal ainda mostra a data de HOJE, já que não há mais seleção */}
              <Text style={styles.modalDateText}>Para o dia: {moment(selectedDate).format('DD/MM/YYYY')}</Text>

              {/* LÓGICA CONDICIONAL DE INPUT */}
              {modalType === 'Hábitos' ? (
                <View style={{ width: '100%' }}>
                  <Text style={styles.label}>O que você quer tornar um Hábito?</Text>
                  <TextInput
                    style={[styles.input, { height: 50, marginBottom: 15 }]} // Estilo ajustado para Hábito
                    onChangeText={setInputValue}
                    value={inputValue}
                    placeholder="Ex: Beber 2L de água"
                    placeholderTextColor="#808080"
                  />

                  <Text style={styles.label}>Frequência:</Text>
                  <View style={styles.frequencyContainer}>
                    {['Diário', 'Semanal'].map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyButton,
                          habitFrequency === freq && styles.frequencyButtonSelected,
                        ]}
                        onPress={() => setHabitFrequency(freq)}
                      >
                        <Text style={[
                          styles.frequencyText,
                          habitFrequency === freq && styles.frequencyTextSelected,
                        ]}>{freq}</Text>
                      </TouchableOpacity>
                  ))}
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  onChangeText={setInputValue}
                  value={inputValue}
                  placeholder={`O que você quer ${modalType === 'Metas' ? 'alcançar' : 'fazer'}?`}
                  placeholderTextColor="#808080"
                  multiline
                />
              )}
              {/* FIM DA LÓGICA CONDICIONAL */}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonClose]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.textStyle}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.textStyle}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View> {/* FECHA modalView */}
          </View> {/* FECHA modalCenteredView */}
        </BlurView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  imagedeitado: {
    width: '100%',
    height: 250, // Aumentado para ocupar mais espaço
    marginBottom: 20,
    marginTop: 40, // Adicionado um pouco de espaço superior
  },
  
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 25,
    justifyContent: 'space-between', // Ajustado para distribuir o conteúdo verticalmente
    paddingBottom: 100, // Espaço para os botões fixos
  },
  text: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 35,
  },
  copseFont: {
    // fontFamily: 'Copse',
  },
  // REMOVIDO: calendarContainer
  // REMOVIDO: dayItem, selectedDayItem, todayDayItem, dayText, selectedDayText, dayOfWeekText, dayOfMonthText
  
buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
        backgroundColor: 'transparent', // <-- MUDANÇA AQUI: Removendo o fundo roxo semi-transparente
      },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#FFFEE5',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 4,
  },
  buttonLabel: {
    color: '#FFFEE5',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  copseText: {
    fontFamily: 'Copse', 
    fontWeight: 'normal', 
  },
  
  headerText: {
    fontSize: 33,
  },

  /* --- Estilos para o Modal --- */
  absolute: { // Estilo para cobrir 100% da tela para o BlurView
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center', // Centraliza o conteúdo (modalView)
    alignItems: 'center', // Centraliza o conteúdo (modalView)
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%', // Adicionado para garantir alinhamento
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%', // Largura do modal na tela
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#343434',
  },
  modalDateText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#808080',
  },
  input: {
    height: 100,
    borderColor: '#c04cfd',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top', // Para o texto começar no topo em multiline
    color: '#343434',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '48%',
  },
  buttonClose: {
    backgroundColor: 'rgba(94, 43, 255, 1)', // Cor de cancelar (Roxo escuro)
  },
  buttonSave: {
    backgroundColor: '#c04cfd', // Sua cor de destaque
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  /* --- Estilos de Hábito --- */
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(252, 109, 171, 1)',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  frequencyButtonSelected: {
    backgroundColor: '#c04cfd', // Sua cor de destaque
    borderColor: '#c04cfd',
  },
  frequencyText: {
    color: '#343434',
    fontWeight: '500',
  },
  frequencyTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },


  
  dayItem: {
    width: 65,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedDayItem: {
    backgroundColor: '#FFFEE5',
  },
  todayDayItem: {
    borderWidth: 2,
    borderColor: '#c04cfd',
  },
  dayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#343434',
  },
  dayOfWeekText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dayOfMonthText: {
    fontSize: 20,
  },
  

    calendario: {
    position: 'absolute',
    top: 25,
    right: 20, 
    width: 80,
    height: 50,
    zIndex: 10, 
    tintColor: '#FFFFFF',
    
  }

});