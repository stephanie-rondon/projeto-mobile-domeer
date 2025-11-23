import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Image, ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useMetas } from '@/hooks/MetasContext';
import { useMemo } from 'react';

type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Home: undefined;
    Mes: undefined;
    Metas: undefined;
};

const imageLogo = require('../../../assets/images/Domeer-logo.png');
const imageicone = require('../../../assets/images/icone-user.jpg');
const imagebobao = require('../../../assets/images/Gatobobao.png');
const imagedia = require('../../../assets/images/Gatodia.png');
const imagemes = require('../../../assets/images/Gatomes.png');
const imagemetas = require('../../../assets/images/Gatometas.png');
const imagegrafico = require('../../../assets/images/gatopendurado.png');

interface MetaStatus {
    id: string;
    type: 'concluida' | 'progresso';
    mensagem: string;
}

export default function HomeScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { itensDiarios } = useMetas();
    
    const metasStatusParaHome = useMemo(() => {
    return itensDiarios
        .filter(item => item.type === 'Metas' && item.recompensa && item.recompensa.trim().length > 0)
        .map(item => {
            const progresso = Math.round(item.progresso || 0);
            const recompensa = item.recompensa || 'Sua Recompensa';
            
            let type: 'concluida' | 'progresso';
            let mensagem: string;
            
            if (progresso >= 100) {
                type = 'concluida';
                mensagem = `Parabéns! Agora você pode: ${recompensa}! 🎉`;
            } else {
                type = 'progresso';
                const faltando = 100 - progresso;
                mensagem = `Faltam ${faltando}% para a recompensa: ${recompensa}`;
            }
            
            return {
                id: item.id,
                type,
                mensagem,
            } as MetaStatus;
        });
    }, [itensDiarios]);

    const metasEmProgresso = metasStatusParaHome.filter(m => m.type === 'progresso');
    
    const listaParaExibicao = metasEmProgresso; 

    return (
        <LinearGradient
            colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
            locations={[0.49, 0]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.RolarContent}>
                <Image source={imageLogo} style={styles.imageStyle} />

                <TouchableOpacity
                    style={styles.imageIconeWrapper}
                    onPress={() => {
                        navigation.navigate('Login');
                    }}
                >
                    <Image source={imageicone} style={styles.imageIcone} />
                </TouchableOpacity>
                
                <View style={styles.squaresContainer}>
                    <TouchableOpacity
                        style={styles.GatoSquare}
                        onPress={() => {
                            navigation.navigate('Mes');
                        }}
                    >
                        <Image source={imagebobao} style={styles.imagebobao} />
                        <Image source={imagedia} style={styles.imagedia} />
                        <Text style={[styles.copseText, styles.headerText, styles.GatoSquareText]}>
                            SEU MÊS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.GatoSquare2} onPress={() => {
                        }}>
                        <Image source={imagemes} style={styles.imagemes} />
                        <Text style={[styles.copseText, styles.headerText, styles.GatoSquare2Text]}>
                            SEU DIA
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Metas')}>
                    <Image source={imagemetas} style={styles.imagemetas} />
                </TouchableOpacity>

                <Text style={[styles.copseText, styles.headerText, styles.metasText]}>
                    Acompanhe suas recompensas!
                </Text>

                <View style={styles.GraficoSquare}>
                    <ScrollView style={styles.recompensasList}>
                        {listaParaExibicao.length > 0 ? (
                            listaParaExibicao.map((meta, index) => (
                                <View 
                                    key={meta.id} 
                                    style={[
                                        styles.recompensaItem,
                                        meta.type === 'concluida' ? styles.recompensaItemConcluida : styles.recompensaItemProgresso
                                    ]}
                                >
                                    <Text style={[
                                        styles.copseText, 
                                        styles.recompensaText,
                                        meta.type === 'concluida' ? styles.recompensaTextConcluida : styles.recompensaTextProgresso
                                    ]}>
                                        {meta.type === 'concluida' ? '✅' : '⏳'} {meta.mensagem}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.copseText, styles.recompensaVaziaText]}>
                                Adicione uma meta com recompensa para começar a acompanhar!
                            </Text>
                        )}
                    </ScrollView>
                    <Image source={imagegrafico} style={styles.imagegrafico} />
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    RolarContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 90,
    },
    squaresContainer: {
        flexDirection: 'row',
        width: '90%',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    GatoSquare: {
        zIndex: 1,
        width: '45%',
        height: 150,
        backgroundColor: '#FFFEE5',
        borderRadius: 15,
        position: 'relative',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 10,
    },
    GatoSquare2: {
        width: '45%',
        height: 150,
        backgroundColor: '#FFFEE5',
        borderRadius: 15,
        position: 'relative',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 10,
    },
    GatoSquareText: {
        color: '#ffffff',
        fontSize: 20,
        top: 50,
    },
    GatoSquare2Text: {
        color: '#ffffff',
        fontSize: 20,
        top: 50,
    },
    
    metasText: {
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 25,
        top: 10,
    },
    
    imageStyle: {
        width: 300,
        height: 150,
        resizeMode: 'contain',
        marginTop: -13,
    },
    imageIconeWrapper: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 50,
        height: 50,
        borderRadius: 20,
        zIndex: 10,
    },
    imageIcone: {
        width: 50,
        height: 50,
        borderRadius: 20,
    },
    imagebobao: {
        position: 'absolute',
        top: -60,
        left: 5,
        width: 180,
        height: 90,
        borderRadius: 20,
    },
    imagemes: {
        position: 'absolute',
        top: -44,
        left: 10,
        width: 170,
        height: 230,
        borderRadius: 20,
    },
    imagedia: {
        position: 'absolute',
        top: -45,
        left: 20,
        width: 170,
        height: 230,
        borderRadius: 20,
    },
    imagemetas: {
        width: 460,
        height: 190,
        left: -5,
        top: -10,
    },
    
    GraficoSquare: {
        width: '87%',
        height: 300,
        backgroundColor: '#FFFEE5',
        borderRadius: 59,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        position: 'relative',
    },
    
    GraficoTitle: {
        fontSize: 18,
        color: 'rgba(94, 43, 255, 1)',
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
        zIndex: 2,
        marginTop: 10,
    },
    recompensasList: {
        width: '90%',
        maxHeight: 220,
        paddingHorizontal: 5,
        zIndex: 2,
    },
    recompensaItem: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        zIndex: 2,
    },
    recompensaItemConcluida: {
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
    },
    recompensaItemProgresso: {
        backgroundColor: '#f9e6ff',
        borderColor: '#e1adff',
    },
    recompensaText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    recompensaTextConcluida: {
        color: '#155724',
    },
    recompensaTextProgresso: {
        color: 'rgba(202, 109, 252, 1)',
    },
    recompensaVaziaText: {
        fontSize: 14,
        color: '#808080',
        textAlign: 'center',
        paddingVertical: 10,
    },
    
    imagegrafico: {
        width: 200,
        height: 200,
        left: -90,
        top: -50,
        position: 'absolute', 
        zIndex: 1,
    },
    
    copseText: {
        fontFamily: 'Copse',
        fontWeight: 'normal',
    },
    headerText: {
        fontSize: 33,
    },
});