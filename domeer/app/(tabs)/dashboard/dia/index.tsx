import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import 'moment/locale/pt-br';
moment.locale('pt-br');

const { width } = Dimensions.get('window');
const DAY_WIDTH = width / 7;
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

interface CalendarDayProps {
  dayData: DayData;
  isSelected: boolean;
  onSelectDay: (date: string) => void;
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

const CalendarDay: React.FC<CalendarDayProps> = ({ dayData, isSelected, onSelectDay }) => {
  const isToday = moment().format('YYYY-MM-DD') === dayData.date;

  return (
    <TouchableOpacity
      style={[
        styles.dayItem,
        isSelected ? styles.selectedDayItem : {},
        isToday ? styles.todayDayItem : {},
      ]}
      onPress={() => onSelectDay(dayData.date)}
    >
      <Text style={[styles.dayText, styles.dayOfWeekText, isSelected ? styles.selectedDayText : {}]}>
        {dayData.dayOfWeek}
      </Text>
      <Text style={[styles.dayText, styles.dayOfMonthText, isSelected ? styles.selectedDayText : {}]}>
        {dayData.dayOfMonth}
      </Text>
    </TouchableOpacity>
  );
};

// Abreviações personalizadas
const diasSemanaAbreviados: { [key: string]: string } = {
  'domingo': 'Dom',
  'segunda-feira': 'Seg',
  'terça-feira': 'Ter',
  'quarta-feira': 'Qua',
  'quinta-feira': 'Qui',
  'sexta-feira': 'Sext',
  'sábado': 'Sab',
};

const generateDates = (numberOfDays: number): DayData[] => {
  const today = moment();
  const dates: DayData[] = [];
  const startDate = moment(today).subtract(numberOfDays / 2, 'days');

  for (let i = 0; i < numberOfDays; i++) {
    const date = moment(startDate).add(i, 'days');
    const nomeCompleto = date.format('dddd');
    const abreviado = diasSemanaAbreviados[nomeCompleto.toLowerCase()] || nomeCompleto;

    dates.push({
      date: date.format('YYYY-MM-DD'),
      dayOfWeek: abreviado,
      dayOfMonth: date.format('DD'),
    });
  }

  return dates;
};

export default function Tutorial() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const allDates = generateDates(100);
  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    const todayIndex = allDates.findIndex(day => day.date === moment().format('YYYY-MM-DD'));
    if (flatListRef.current && todayIndex !== -1) {
      flatListRef.current.scrollToIndex({
        index: todayIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }
  }, []);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    Alert.alert('Dia Selecionado', `Você selecionou: ${moment(date).format('dddd, DD [de] MMMM [de] YYYY')}`);
  };

  const handleButtonPress = (buttonName: string) => {
    Alert.alert('Botão Pressionado', `Você clicou em: ${buttonName} para a data: ${moment(selectedDate).format('DD/MM')}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
        locations={[0, 0.6]}
        style={styles.gradient}
      >
        <Text style={[styles.text, styles.copseText, styles.headerText]}>Seu dia</Text>


        <Image
          source={calendario} 
          style={styles.calendario}
          resizeMode="contain"
        />

        <View style={styles.calendarContainer}>

          <FlatList
            ref={flatListRef}
            data={allDates}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <CalendarDay
                dayData={item}
                isSelected={item.date === selectedDate}
                onSelectDay={handleDayPress}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialNumToRender={14}
            maxToRenderPerBatch={7}
            getItemLayout={(data, index) => ({
              length: DAY_WIDTH,
              offset: DAY_WIDTH * index,
              index,
            })}
          />
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
    </View>
  );
}

const styles = StyleSheet.create({

  imagedeitado: {
    width: '100%',
    height: 170,
    marginBottom: 90,
    marginTop: 180,
  },
  
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 25,
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
  calendarContainer: {
    height: 80,
    marginBottom: 30,
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
