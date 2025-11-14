import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import Carousel from 'react-native-reanimated-carousel'; // Import Corrigido/Mantido

import 'moment/locale/pt-br';
moment.locale('pt-br');

const gatodeitado = require('../../../../assets/images/gato-deitado.png'); 
const calendario = require ('../../../../assets/images/calendario.png');
const carouselWidth = Dimensions.get('window').width * 0.9;
const initialMonthIndex = new Date().getMonth();

// --- Tipos e Função de Geração de Calendário ---

type Day = {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number; // 0 (Domingo) a 6 (Sábado)
};

type Month = {
  name: string;
  days: Day[];
};

const generateCalendar = (year: number): Month[] => {
  const months: Month[] = [];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  for (let m = 0; m < 12; m++) {
    const days: Day[] = [];
    const date = new Date(year, m, 1);
    while (date.getMonth() === m) {
      days.push({
        date: new Date(date),
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
      });
      date.setDate(date.getDate() + 1);
    }
    months.push({ name: monthNames[m], days });
  }

  return months;
};

// Gera os dados do calendário para o ano de 2025
const months = generateCalendar(2025);

// --- Componente de Renderização do Mês (Agora aceita props para seleção) ---

interface RenderMonthProps {
  item: Month;
  selectedDate: string; // Data selecionada no formato YYYY-MM-DD
  onSelectDate: (date: Date) => void; // Função de callback para selecionar a data
}

const renderMonth = ({ item, selectedDate, onSelectDate }: RenderMonthProps) => (
  <View style={styles.monthContainer}>
    <Text style={styles.monthTitle}>{item.name}</Text>
    <View style={styles.dayNamesContainer}>
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
        <Text key={dayName} style={styles.dayNameText}>
          {dayName}
        </Text>
      ))}
    </View>
    <View style={styles.monthDaysContainer}>
      {/* Preenche os dias vazios no início do mês (para alinhar com o domingo) */}
      {[...Array(item.days[0].dayOfWeek)].map((_, idx) => (
        <View key={`empty-${idx}`} style={styles.dayEmpty} />
      ))}
      
      {item.days.map((day, idx) => {
        const dateString = moment(day.date).format('YYYY-MM-DD');
        const isToday = day.date.toDateString() === new Date().toDateString();
        const isSelected = dateString === selectedDate;

        return (
          <TouchableOpacity 
            key={idx} 
            style={[
              styles.dayItem, 
              isToday && styles.todayDayItem, 
              isSelected && styles.selectedDayItemCarousel // Novo estilo para o dia selecionado
            ]}
            onPress={() => onSelectDate(day.date)} // Adiciona a função de seleção
          >
            <Text style={[
              styles.dayOfMonthTextCarousel,
              isSelected && styles.selectedDayTextCarousel
            ]}>
              {day.dayOfMonth}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// --- Componentes RoundButton e Interfaces (Apenas limpeza da duplicação) ---

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
      <Text style={[styles.buttonLabel, styles.copseText]}>{label}</Text>
    </View>
  );
};

// --- Componente Tutorial (Com o estado de data e a função de seleção) ---

export default function Tutorial() {
  // 1. Mudança: selectedDate agora é um estado para que o componente reaja à seleção.
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD')); 
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [inputValue, setInputValue] = useState(''); 
  const [habitFrequency, setHabitFrequency] = useState('Diário'); 
  
  const handleSelectDate = (date: Date) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'));
  };

  const handleButtonPress = (buttonName: string) => {
    setModalType(buttonName); 
    setIsModalVisible(true); 
    setInputValue(''); 
    setHabitFrequency('Diário'); 
  };
  
  const handleSave = () => {
    if (!inputValue.trim()) {
      Alert.alert('Atenção', `O campo de ${modalType} não pode estar vazio.`);
      return;
    }

    // Usa a selectedDate do estado
    let message = `Adicionado: "${inputValue}" para o dia ${moment(selectedDate).format('DD/MM/YYYY')}`;

    if (modalType === 'Hábitos') {
      message += `\nFrequência: ${habitFrequency}`;
    }

    Alert.alert(`Nova ${modalType}`, message);

    setIsModalVisible(false); 
    setModalType(''); 
    setInputValue('');
    setHabitFrequency('Diário');
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
        locations={[0, 0.6]}
        style={styles.gradient}
      >
        <Text style={[styles.text, styles.copseText, styles.headerText]}>
          Dia Selecionado: {moment(selectedDate).format('DD/MM')}
        </Text>

        <View style={styles.carouselWrapper}>
        <Carousel
            loop={false}
            data={months}
            width={carouselWidth} 
            height={200}
            renderItem={({ item }) => (
             renderMonth({ item, selectedDate, onSelectDate: handleSelectDate })
            )}
        />
        </View>
        {/* ---------------------------------- */}
        
        <Image
          source={gatodeitado} 
          style={styles.imagedeitado}
          resizeMode="contain"
        />

        <View style={styles.buttonContainer}>
          <RoundButton
            iconName="list"
            onPress={() => handleButtonPress('Tarefas')}
            label="Nova Tarefa"
          />
          <RoundButton
            iconName="bullseye"
            onPress={() => handleButtonPress('Metas')}
            label="Nova Meta"
          />
          <RoundButton
            iconName="refresh"
            onPress={() => handleButtonPress('Hábitos')}
            label="novo Hábito"
          />
        </View>
      </LinearGradient>

      {/* --- O MODAL FOI ATUALIZADO PARA USAR selectedDate DO ESTADO --- */}
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
              {/* Agora usa a selectedDate do estado */}
              <Text style={styles.modalDateText}>Para o dia: {moment(selectedDate).format('DD/MM/YYYY')}</Text>

              {modalType === 'Hábitos' ? (
                <View style={{ width: '100%' }}>
                  <Text style={styles.label}>O que você quer tornar um Hábito?</Text>
                  <TextInput
                    style={[styles.input, { height: 50, marginBottom: 15 }]} 
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
            </View> 
          </View> 
        </BlurView>
      </Modal>

    </View>
  );
}

// --- Estilos Atualizados ---

const styles = StyleSheet.create({

  imagedeitado: {
    width: '100%',
    height: 250, 
    marginBottom: 20,
    marginTop: 40, 
  },
  
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 25,
    justifyContent: 'space-between', 
    paddingBottom: 100, 
  },
  text: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10, 
  },
  copseFont: {
  },
  
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
    backgroundColor: 'transparent', 
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
  absolute: { 
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%', 
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
    width: '85%', 
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
    textAlignVertical: 'top', 
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
    backgroundColor: 'rgba(94, 43, 255, 1)', 
  },
  buttonSave: {
    backgroundColor: '#c04cfd', 
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

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
    backgroundColor: '#c04cfd', 
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


  /* --- Estilos do Calendário no Carousel --- */
  carouselWrapper: {
    height: 200, 
    marginBottom: 20,
  },
  monthContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    height: '100%',
    overflow: 'hidden', 
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 5,
  },
  dayNameText: {
    color: '#FFFEE5',
    fontWeight: 'bold',
    width: Dimensions.get('window').width * 0.9 / 7.7, 
    textAlign: 'center',
    fontSize: 12,
  },
  monthDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  dayItem: {
    width: Dimensions.get('window').width * 0.9 / 7.7, 
    height: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 5,
  },
  dayEmpty: {
    width: Dimensions.get('window').width * 0.9 / 7.7, 
    height: 25,
    marginVertical: 2,
  },
  dayOfMonthTextCarousel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  todayDayItem: {
    borderWidth: 2,
    borderColor: '#c04cfd', // Borda para o dia de hoje
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Fundo um pouco mais claro
  },
  selectedDayItemCarousel: { // NOVO estilo para o dia selecionado
    backgroundColor: '#c04cfd', 
    borderWidth: 0,
  },
  selectedDayTextCarousel: { // NOVO estilo para o texto do dia selecionado
    color: '#FFFEE5',
    fontWeight: 'bold',
  },
  
  // Estilos antigos (removidos ou adaptados/renomeados)
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