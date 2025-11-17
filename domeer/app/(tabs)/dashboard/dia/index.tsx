import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

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
  isCurrentMonth: boolean; // Novo campo para identificar se o dia pertence ao mês atual
};

type Month = {
  name: string;
  year: number;
  monthIndex: number;
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
    
    // Adiciona dias do mês anterior para completar a primeira semana
    const firstDayOfMonth = new Date(year, m, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, m, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, m - 1, prevMonthLastDay - i);
      days.push({
        date: prevDate,
        dayOfMonth: prevDate.getDate(),
        dayOfWeek: prevDate.getDay(),
        isCurrentMonth: false
      });
    }
    
    // Dias do mês atual
    while (date.getMonth() === m) {
      days.push({
        date: new Date(date),
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        isCurrentMonth: true
      });
      date.setDate(date.getDate() + 1);
    }
    
    // Dias do próximo mês para completar a última semana
    const totalCells = 42; // 6 semanas
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, m + 1, i);
      days.push({
        date: nextDate,
        dayOfMonth: nextDate.getDate(),
        dayOfWeek: nextDate.getDay(),
        isCurrentMonth: false
      });
    }

    months.push({ 
      name: monthNames[m], 
      year: year,
      monthIndex: m,
      days 
    });
  }

  return months;
};

// Gera os dados do calendário para o ano de 2025
const months = generateCalendar(2025);

// --- Componente de Renderização do Mês ---

interface RenderMonthProps {
  item: Month;
  index: number;
  isActive: boolean;
  onSelectMonth: (monthIndex: number) => void;
}

const renderMonth = ({ item, index, isActive, onSelectMonth }: RenderMonthProps) => (
  <TouchableOpacity 
    style={[
      styles.monthItem,
      isActive && styles.activeMonthItem
    ]}
    onPress={() => onSelectMonth(index)}
  >
    <Text style={[
      styles.monthItemText,
      isActive && styles.activeMonthItemText
    ]}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

// --- Componente de Renderização da Semana de Dias ---

interface RenderWeekProps {
  week: Day[];
  selectedDate: string;
  onSelectDate: (date: Date) => void;
}

const renderWeek = ({ week, selectedDate, onSelectDate }: RenderWeekProps) => (
  <View style={styles.weekContainer}>
    {week.map((day, dayIndex) => {
      const dateString = moment(day.date).format('YYYY-MM-DD');
      const isToday = day.date.toDateString() === new Date().toDateString();
      const isSelected = dateString === selectedDate;

      return (
        <TouchableOpacity 
          key={dayIndex} 
          style={[
            styles.dayItem, 
            !day.isCurrentMonth && styles.otherMonthDay,
            isToday && styles.todayDayItem, 
            isSelected && styles.selectedDayItemCarousel
          ]}
          onPress={() => onSelectDate(day.date)}
        >
          <Text style={[
            styles.dayOfMonthTextCarousel,
            !day.isCurrentMonth && styles.otherMonthDayText,
            isSelected && styles.selectedDayTextCarousel
          ]}>
            {day.dayOfMonth}
          </Text>
          <Text style={[
            styles.dayOfWeekText,
            !day.isCurrentMonth && styles.otherMonthDayText,
            isSelected && styles.selectedDayTextCarousel
          ]}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][day.dayOfWeek]}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// --- Componentes RoundButton e Interfaces ---

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

// --- Componente Tutorial Atualizado ---

export default function Tutorial() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonthIndex);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [inputValue, setInputValue] = useState(''); 
  const [habitFrequency, setHabitFrequency] = useState('Diário'); 
  
  const monthCarouselRef = useRef<any>(null);
  const daysCarouselRef = useRef<any>(null);

  // Divide os dias em semanas (7 dias cada)
  const getWeeksForMonth = useCallback((monthIndex: number) => {
    const month = months[monthIndex];
    const weeks: Day[][] = [];
    
    for (let i = 0; i < month.days.length; i += 7) {
      weeks.push(month.days.slice(i, i + 7));
    }
    
    return weeks;
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'));
    
    // Atualiza o mês atual se o dia selecionado for de outro mês
    const selectedMonthIndex = date.getMonth();
    if (selectedMonthIndex !== currentMonthIndex) {
      setCurrentMonthIndex(selectedMonthIndex);
      monthCarouselRef.current?.scrollTo({ index: selectedMonthIndex, animated: true });
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonthIndex(monthIndex);
    
    // Encontra o primeiro dia do mês selecionado para definir como data selecionada
    const firstDayOfMonth = months[monthIndex].days.find(day => day.isCurrentMonth);
    if (firstDayOfMonth) {
      setSelectedDate(moment(firstDayOfMonth.date).format('YYYY-MM-DD'));
    }
    
    // Rola o carrossel de dias para o início
    daysCarouselRef.current?.scrollTo({ index: 0, animated: true });
  };

  const handleMonthCarouselChange = (index: number) => {
    setCurrentMonthIndex(index);
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

  const weeks = getWeeksForMonth(currentMonthIndex);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
        locations={[0, 0.6]}
        style={styles.gradient}
      >
        <Text style={[styles.text, styles.copseText, styles.headerText]}>
         Meu Dia 
        </Text>

        {/* Carrossel de Meses */}
        <View style={styles.monthCarouselWrapper}>
          <Carousel
            ref={monthCarouselRef}
            loop={false}
            data={months}
            width={carouselWidth * 0.3}
            height={40}
            defaultIndex={currentMonthIndex}
            onSnapToItem={handleMonthCarouselChange}
            renderItem={({ item, index }) => (
              renderMonth({ 
                item, 
                index, 
                isActive: index === currentMonthIndex,
                onSelectMonth: handleSelectMonth 
              })
            )}
            style={styles.monthCarousel}
          />
        </View>

        {/* Carrossel de Dias (Semanas) */}
        <View style={styles.daysCarouselWrapper}>
          <Carousel
            ref={daysCarouselRef}
            loop={false}
            data={weeks}
            width={carouselWidth}
            height={80}
            renderItem={({ item }) => (
              renderWeek({ 
                week: item, 
                selectedDate, 
                onSelectDate: handleSelectDate 
              })
            )}
          />
        </View>

        {/* Data Selecionada Atual */}
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {moment(selectedDate).format('DD [de] MMMM [de] YYYY')}
          </Text>
        </View>
        
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

  /* --- Novos Estilos para os Carrosseis --- */
  monthCarouselWrapper: {
    height: 50,
    marginBottom: 10,
    alignItems: 'center',
  },
  monthCarousel: {
    marginHorizontal: 10,
  },
  monthItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeMonthItem: {
    backgroundColor: '#c04cfd',
  },
  monthItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeMonthItemText: {
    color: '#FFFEE5',
    fontWeight: 'bold',
  },

  daysCarouselWrapper: {
    height: 100,
    marginBottom: 10,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.9 / 7.7,
    marginHorizontal: 2,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  todayDayItem: {
    borderWidth: 2,
    borderColor: '#c04cfd',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedDayItemCarousel: {
    backgroundColor: '#c04cfd', 
  },
  dayOfMonthTextCarousel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  dayOfWeekText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '400',
  },
  otherMonthDayText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  selectedDayTextCarousel: {
    color: '#FFFEE5',
    fontWeight: 'bold',
  },

  selectedDateContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedDateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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

  // Estilos antigos
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