import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'; 
import Carousel from 'react-native-reanimated-carousel';
import moment from 'moment';
import { CardStyleInterpolators } from '@react-navigation/stack';

const imageGrafico = require('../../../../assets/images/Gato-espiando.png'); 

type Day = {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number;
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

const months = generateCalendar(2025);
const windowWidth = Dimensions.get('window').width;
const carouselWidth = Dimensions.get('window').width * 0.9;
const carouselContainedWidth = windowWidth * 0.8 - 20;

const renderMonth = ({ item }: { item: Month }) => (
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
      {[...Array(item.days[0].dayOfWeek)].map((_, idx) => (
        <View key={`empty-${idx}`} style={styles.dayEmpty} />
      ))}
      {item.days.map((day, idx) => (
        <View key={idx} style={styles.dayItem}>
          <Text style={styles.dayOfMonthTextCarousel}>{day.dayOfMonth}</Text>
        </View>
      ))}
    </View>
  </View>
);

export default function MesScreen() {
  return (
    <LinearGradient
      colors={['rgba(252, 109, 171, 1)', 'rgba(94, 43, 255, 1)']}
      locations={[0.49, 0]}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.text, styles.copseText, styles.headerText]}>
          Seu Mês
        </Text>
        <View style={styles.underline}></View>
      </View>

      <Image 
        source={imageGrafico}
        style={styles.imageStyle}
      />
      
      <View style={styles.whiteSquare}>
        <Carousel
          loop={false}
          data={months}
          width={carouselWidth}
          height={250}
          renderItem={({ item }) => renderMonth({ item })}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 25, 
    width: '80%', 
    alignItems: 'center',
    marginBottom: 20,
  },
  underline: {
    height: 2, 
    width: '100%', 
    backgroundColor: 'white', 
    marginTop: 5,
  },
  imageStyle: {
    width: 300, 
    height: 120, 
    resizeMode: 'contain',
    marginTop: -40, 
  },
  whiteSquare: {
    width: '90%', 
    height: 300, 
    backgroundColor: '#FFFEE5',
    borderRadius: 15,
    marginTop: -1,
    padding: 10,
    alignItems: 'center',
   },
   CarouselWrapper:{
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
   },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  copseText: {
    fontFamily: 'Copse', 
    fontWeight: 'normal', 
  },
  headerText: {
    fontSize: 33,
  },
  
  monthContainer: {
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    height: '100%',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(194, 76, 253, 1)',
    marginBottom: 10,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 5,
  },
  dayNameText: {
    color: 'rgba(194, 76, 253, 1)',
    fontWeight: 'bold',
    width: Dimensions.get('window').width / 7.2, 
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
    width: Dimensions.get('window').width / 7.2, 
    height: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    borderRadius: 5,
  },
  dayEmpty: {
    width: Dimensions.get('window').width  / 7.2, 
    height: 25,
    marginVertical: 2,
  },
  dayOfMonthTextCarousel: {
    fontSize: 14,
    color: 'rgba(94, 43, 255, 1)',
    fontWeight: '600',
  },
});
