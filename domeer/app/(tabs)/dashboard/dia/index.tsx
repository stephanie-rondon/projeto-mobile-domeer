import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import 'moment/locale/pt-br';
moment.locale('pt-br');

import { ItemDiario, useMetas } from '@/hooks/MetasContext';

const gatodeitado = require('../../../../assets/images/gato-deitado.png'); 
const carouselWidth = Dimensions.get('window').width * 0.9;
const initialMonthIndex = new Date().getMonth();

type Diacalendario = {
    date: Date;
    dayOfMonth: number;
    dayOfWeek: number; 
    isCurrentMonth: boolean; 
};

type Mes = {
    name: string;
    year: number;
    monthIndex: number;
    days: Diacalendario[];
};

const generateCalendar = (year: number): Mes[] => {
    const months: Mes[] = [];
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    for (let m = 0; m < 12; m++) {
        const days: Diacalendario[] = [];

        const firstDayOfMonth = new Date(year, m, 1);
        const startingDayOfWeek = firstDayOfMonth.getDay(); 

        const prevMonthLastDay = new Date(year, m, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, m, prevMonthLastDay - i);
            days.push({
                date: prevDate,
                dayOfMonth: prevDate.getDate(),
                dayOfWeek: prevDate.getDay(),
                isCurrentMonth: false
            });
        }

        let date = new Date(year, m, 1);
        while (date.getMonth() === m) {
            days.push({
                date: new Date(date),
                dayOfMonth: date.getDate(),
                dayOfWeek: date.getDay(),
                isCurrentMonth: true
            });
            date.setDate(date.getDate() + 1);
        }

        const totalCells = 42;
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

const meses = generateCalendar(2025);

interface PropsRenderizarMes {
    item: Mes;
    index: number;
    isActive: boolean;
    onSelectMonth: (monthIndex: number) => void;
}

const renderMonth = ({ item, index, isActive, onSelectMonth }: PropsRenderizarMes) => (
    <TouchableOpacity 
        style={[
            styles.monthItem,
            isActive && styles.activeMonthItem
        ]}
        onPress={() => onSelectMonth(index)}
    >
        <Text style={[
            styles.monthItemText,
            styles.copseText, 
            isActive && styles.activeMonthItemText
        ]}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

interface PropsRenderizarSemana {
    week: Diacalendario[];
    selectedDate: string;
    onSelectDate: (date: Date) => void;
}

const renderWeek = ({ week, selectedDate, onSelectDate }: PropsRenderizarSemana) => (
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
                        styles.copseText, 
                        !day.isCurrentMonth && styles.otherMonthDayText,
                        isSelected && styles.selectedDayTextCarousel
                    ]}>
                        {day.dayOfMonth}
                    </Text>
                    <Text style={[
                        styles.dayOfWeekText,
                        styles.copseText, 
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

interface PropsBotaoRedondo {
    iconName: keyof typeof FontAwesome.glyphMap;
    onPress: () => void;
    label: string;
}

const RoundButton: React.FC<PropsBotaoRedondo> = ({ iconName, onPress, label }) => {
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

export default function Dia() {
    const {itensDiarios, adicionarItem, atualizarItemDiario } = useMetas();

    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonthIndex);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); 
    const [inputValue, setInputValue] = useState(''); 
    const [habitFrequency, setHabitFrequency] = useState('Diário'); 
    const [selectedDuration, setSelectedDuration] = useState(30); 
    const [targetDate, setTargetDate] = useState('');

    const monthCarouselRef = useRef<any>(null);
    const daysCarouselRef = useRef<any>(null);

    useEffect(() => {
        monthCarouselRef.current?.scrollTo({ index: initialMonthIndex, animated: false });
    }, []);

    const getWeeksForMonth = useCallback((monthIndex: number) => {
        const month = meses[monthIndex];
        const weeks: Diacalendario[][] = [];

        for (let i = 0; i < month.days.length; i += 7) {
            weeks.push(month.days.slice(i, i + 7));
        }

        return weeks;
    }, []);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(moment(date).format('YYYY-MM-DD'));

        const selectedMonthIndex = date.getMonth();
        if (selectedMonthIndex !== currentMonthIndex) {
            setCurrentMonthIndex(selectedMonthIndex);
            monthCarouselRef.current?.scrollTo({ index: selectedMonthIndex, animated: true });
        }
    };

    const handleSelectMonth = (monthIndex: number) => {
        setCurrentMonthIndex(monthIndex);

        const firstDayOfMonth = meses[monthIndex].days.find(day => day.isCurrentMonth);
        if (firstDayOfMonth) {
            setSelectedDate(moment(firstDayOfMonth.date).format('YYYY-MM-DD'));
        }

        daysCarouselRef.current?.scrollTo({ index: 0, animated: true });
    };

    const handleMonthCarouselChange = (index: number) => {
        setCurrentMonthIndex(index);
        const firstDayOfMonth = meses[index].days.find(day => day.isCurrentMonth);
        if (firstDayOfMonth) {
            setSelectedDate(moment(firstDayOfMonth.date).format('YYYY-MM-DD'));
        }
    };
    
    const handleButtonPress = (buttonName: 'Tarefas' | 'Metas' | 'Hábitos') => {
        setModalType(buttonName); 
        setIsModalVisible(true); 
        setInputValue(''); 
        setHabitFrequency('Diário'); 
        setSelectedDuration(30); 
        setTargetDate(''); 
    };

    const handleSave = () => {
        if (!inputValue.trim()) {
            Alert.alert('Atenção', `O campo de ${modalType} não pode estar vazio.`);
            return;
        }

        const newItem: ItemDiario = {
            id: Date.now().toString(),
            type: modalType as 'Tarefas' | 'Metas' | 'Hábitos',
            content: inputValue,
            date: selectedDate, 
            completed: false, 
        };

        if (modalType === 'Hábitos') {
            newItem.frequency = habitFrequency as 'Diário' | 'Semanal';
            if (habitFrequency === 'Semanal') {
                newItem.dayOfWeekCreated = moment(selectedDate).day(); 
            }
        } else if (modalType === 'Metas') {
            newItem.progresso = 0;
            newItem.dataCerta = targetDate || moment().add(selectedDuration, 'days').format('YYYY-MM-DD');
            newItem.duracaoDias = selectedDuration;
            newItem.diasConcluidos = 0;
        }

        adicionarItem(newItem);
        setInputValue('');
        setIsModalVisible(false);
        setModalType('');
        setHabitFrequency('Diário');
        setSelectedDuration(30);
        setTargetDate('');
    };

    const handleToggleComplete = (item: ItemDiario) => {
        if (item.type === 'Metas' && item.completed) {
            Alert.alert(
                "Meta concluída",
                "Você já marcou essa meta como concluída!"
            );
            return;
        }
        atualizarItemDiario(item.id, { completed: !item.completed });
    };

    const itensFiltrados = useMemo(() => {
        
        const selectedDayOfWeek = moment(selectedDate).day(); 

        return itensDiarios.filter(item => {
            if (item.type === 'Tarefas' || item.type === 'Metas') {
                return item.date === selectedDate; 
            }

            if (item.type === 'Hábitos') {
                if (item.frequency === 'Diário') {
                    
                    return true; 
                }

                if (item.frequency === 'Semanal') {
                    return item.dayOfWeekCreated === selectedDayOfWeek;
                }
            }
            return false;
        });
    }, [itensDiarios, selectedDate]);

    const renderItemCard = (item: ItemDiario) => (
        <TouchableOpacity 
            key={item.id} 
            style={styles.dailyItemCard} 
            onPress={() => handleToggleComplete(item)}
            disabled={item.type === 'Metas' && item.completed}
        >
            <View style={styles.dailyItemHeader}>
                <FontAwesome 
                    name={
                        item.type === 'Tarefas' ? 'list' :
                        item.type === 'Metas' ? 'bullseye' : 
                        'refresh'
                    } 
                    size={16} 
                    color={item.completed ? '#7321e0' : '#c04cfd'} 
                />
                <Text style={[styles.dailyItemTitle, styles.copseText, item.completed && { color: '#808080' }]}>{item.type}</Text>
            </View>
            <Text style={[styles.dailyItemContent, styles.copseText, item.completed && styles.itemCompletedText]}>
                {item.content}
            </Text>
            {item.frequency && (
                <Text style={[styles.dailyItemFrequency, styles.copseText]}>Frequência: {item.frequency}</Text>
            )}
            {item.type === 'Metas' && item.duracaoDias && (
                <Text style={[styles.dailyItemFrequency, styles.copseText]}>
                    Duração: {item.duracaoDias} dias | Progresso: {item.progresso || 0}%
                </Text>
            )}
        </TouchableOpacity>
    );

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
                <View style={styles.monthCarouselWrapper}>
                    <Carousel
                        ref={monthCarouselRef}
                        loop={false}
                        data={meses}
                        width={Dimensions.get('window').width * 0.35} 
                        height={50}
                        defaultIndex={initialMonthIndex}
                        onProgressChange={(_, index) => handleMonthCarouselChange(Math.round(index))}
                        renderItem={({ item, index }) => (
                            renderMonth({ 
                                item, 
                                index, 
                                isActive: index === currentMonthIndex, 
                                onSelectMonth: handleSelectMonth 
                            })
                        )}
                    />
                </View>
                <View style={styles.daysCarouselWrapper}>
                    <Carousel
                        ref={daysCarouselRef}
                        loop={false}
                        data={weeks}
                        width={carouselWidth}
                        height={80}
                        modeConfig={{
                            parallaxScrollingScale: 1,
                            parallaxScrollingOffset: 0,
                            parallaxAdjacentItemScale: 1,
                        }}
                        renderItem={({ item, index }) => (
                            renderWeek({ 
                                week: item, 
                                selectedDate,
                                onSelectDate: handleSelectDate 
                            })
                        )}
                    />
                </View>

                <View style={styles.selectedDateContainer}>
                    <Text style={[styles.selectedDateText, styles.copseText]}>
                        {moment(selectedDate).format('DD [de] MMMM [de] YYYY')}
                    </Text>
                </View>
                <ScrollView style={styles.dailyItemsScrollView} contentContainerStyle={styles.dailyItemsContentContainer}>
                    {itensFiltrados.length > 0 ? (
                        itensFiltrados.map(item => renderItemCard(item))
                    ) : (
                        <Text style={[styles.noItemsText, styles.copseText]}>
                            Nenhum item adicionado para este dia.
                        </Text>
                    )}
                </ScrollView>

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
                        label="Novo Hábito"
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
                            <Text style={[styles.modalTitle, styles.copseText]}>Nova {modalType}</Text>
                            <Text style={[styles.modalDateText, styles.copseText]}>Para o dia: {moment(selectedDate).format('DD/MM/YYYY')}</Text>

                            {modalType === 'Hábitos' ? (
                                <View style={{ width: '100%' }}>
                                    <Text style={[styles.label, styles.copseText]}>O que você quer tornar um Hábito?</Text>
                                    <TextInput
                                        style={[styles.input, { height: 50, marginBottom: 15, fontFamily: 'Copse' }]} 
                                        onChangeText={setInputValue}
                                        value={inputValue}
                                        placeholder="Ex: Beber 2L de água"
                                        placeholderTextColor="#808080"
                                    />

                                    <Text style={[styles.label, styles.copseText]}>Frequência:</Text>
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
                                                    styles.copseText, 
                                                    habitFrequency === freq && styles.frequencyTextSelected,
                                                ]}>{freq}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : modalType === 'Metas' ? (
                                <View style={{ width: '100%' }}>
                                    <Text style={[styles.label, styles.copseText]}>O que você quer alcançar?</Text>
                                    <TextInput
                                        style={[styles.input, { height: 50, marginBottom: 15, fontFamily: 'Copse' }]}
                                        onChangeText={setInputValue}
                                        value={inputValue}
                                        placeholder="Ex: Ler 5 livros"
                                        placeholderTextColor="#808080"
                                    />

                                    <Text style={[styles.label, styles.copseText]}>Duração da Meta (dias):</Text>
                                    <View style={styles.durationContainer}>
                                        {[7, 15, 30, 60, 90].map((days) => (
                                            <TouchableOpacity
                                                key={days}
                                                style={[
                                                    styles.durationButton,
                                                    selectedDuration === days && styles.durationButtonSelected,
                                                ]}
                                                onPress={() => setSelectedDuration(days)}
                                            >
                                                <Text style={[
                                                    styles.durationText,
                                                    styles.copseText,
                                                    selectedDuration === days && styles.durationTextSelected,
                                                ]}>
                                                    {days} dias
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={[styles.label, styles.copseText]}>Data alvo (opcional):</Text>
                                    <TextInput
                                        style={[styles.input, { height: 40, marginBottom: 15, fontFamily: 'Copse' }]}
                                        onChangeText={setTargetDate}
                                        value={targetDate}
                                        placeholder="DD/MM/AAAA"
                                        placeholderTextColor="#808080"
                                    />
                                </View>
                            ) : (
                                <TextInput
                                    style={[styles.input, { fontFamily: 'Copse' }]}
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
                                    <Text style={[styles.textStyle, styles.copseText]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.buttonSave]}
                                    onPress={handleSave}
                                >
                                    <Text style={[styles.textStyle, styles.copseText]}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View> 
                    </View> 
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent:{
        paddingTop: 10,
        paddingBottom: 120,
        alignItems: 'center',
    },
    itemCompletedText: {
        textDecorationLine: 'line-through',
        color: '#808080',
        fontStyle: 'italic',
    },
    imagedeitado: {
        width: '100%',
        height: 180, 
        marginBottom: 80,
        marginTop: 10, 
    },

    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        paddingTop: 50,
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

    monthCarouselFullWidth:{
        width: Dimensions.get('window').width,
    },
    monthCarouselWrapper: {
        height: 50,
        marginBottom: 10,
        alignItems: 'center',
    },
    monthCarousel: {
        paddingHorizontal: 5,
    },
    monthItem: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
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
        alignItems: 'center',
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: carouselWidth,
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 10,
        width: Dimensions.get('window').width * 0.9 / 7.7,
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

    dailyItemsScrollView: {
        flexGrow: 1, 
        maxHeight: 250, 
        width: '100%',
        paddingHorizontal: 20,
    },
    dailyItemsContentContainer: {
        paddingBottom: 20, 
        alignItems: 'center',
    },

    dailyItemsContainer: {
        flex: 1, 
        paddingHorizontal: 20,
        marginTop: 20,
        alignItems: 'center',
        maxHeight: 250,
    },
    dailyItemCard: {
        backgroundColor: '#FFFEE5',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },

    dailyItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    dailyItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#c04cfd', 
        marginLeft: 8,
        textTransform: 'uppercase',
    },
    dailyItemContent: {
        fontSize: 16,
        color: '#343434',
        marginBottom: 5,
    },
    dailyItemFrequency: {
        fontSize: 12,
        color: '#808080',
        fontStyle: 'italic',
    },
    noItemsText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 30,
        fontStyle: 'italic',
    },

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
        minHeight: 100,
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
    durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    durationButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f0f0f0',
        width: '48%',
        marginBottom: 8,
    },
    durationButtonSelected: {
        backgroundColor: '#c04cfd',
        borderColor: '#c04cfd',
    },
    durationText: {
        color: '#343434',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 14,
    },
    durationTextSelected: {
        color: 'white',
        fontWeight: 'bold',
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