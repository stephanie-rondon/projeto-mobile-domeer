import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { BlurView } from 'expo-blur';

const imagemGrafico = require('../../../../assets/images/Gato-espiando.png');
const gatoazuloo = require ('../../../../assets/images/GATOAZULOO.png');
const gatoroxoo = require ('../../../../assets/images/GATOROXOO.png');
const gatorosaoo = require ('../../../../assets/images/GATOROSAOO.png');

const imagensGatos = [gatorosaoo, gatoroxoo, gatoazuloo];

type Dia = {
  data: Date;
  diaDoMes: number;
  diaDaSemana: number;
};

type Mes = {
  nome: string;
  dias: Dia[];
};

type Compromisso = {
  id: number;
  data: Date;
  descricao: string;
  tipo: 'feriado' | 'pessoal';
};

const gerarCalendario = (ano: number): Mes[] => {
  const meses: Mes[] = [];
  const nomesDosMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  for (let m = 0; m < 12; m++) {
    const dias: Dia[] = [];
    const date = new Date(ano, m, 1);
    while (date.getMonth() === m) {
      dias.push({
        data: new Date(date),
        diaDoMes: date.getDate(),
        diaDaSemana: date.getDay(),
      });
      date.setDate(date.getDate() + 1);
    }
    meses.push({ nome: nomesDosMeses[m], dias });
  }

  return meses;
};

const ANO_ATUAL = new Date().getFullYear();
const meses = gerarCalendario(ANO_ATUAL);
const indiceMesInicial = new Date().getMonth();

const larguraJanela = Dimensions.get('window').width;
const larguraCarrossel = Dimensions.get('window').width * 0.85; 

interface RenderizarMesProps {
  item: Mes;
  datasImportantes: Compromisso[];
  lidarComCliqueNoDia: (dia: Dia) => void;
}

const renderizarMes = ({ item, datasImportantes, lidarComCliqueNoDia }: RenderizarMesProps) => {
    const temCompromisso = (dia: Dia) => {
        const diaString = dia.data.toDateString();
        return datasImportantes.some(comp => comp.data.toDateString() === diaString);
    };
    
    const larguraItemDia = (larguraCarrossel - 20) / 7; 

    return (
        <View style={styles.containerMes}>
            <Text style={[styles.tituloMes, styles.copseText]}>{item.nome}</Text>
            <View style={styles.containerNomesDia}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((nomeDia) => (
                    <Text key={nomeDia} style={[styles.textoNomeDia, styles.copseText, { width: larguraItemDia }]}>
                        {nomeDia}
                    </Text>
                ))}
            </View>
            <View style={styles.containerDiasMes}>
                {[...Array(item.dias[0].diaDaSemana)].map((_, idx) => (
                    <View key={`vazio-${idx}`} style={[styles.diaVazio, { width: larguraItemDia }]} />
                ))}
                {item.dias.map((dia, idx) => {
                    const destaque = temCompromisso(dia);
                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.itemDia,
                                { width: larguraItemDia },
                                destaque && styles.itemDiaComCompromisso
                            ]}
                            onPress={() => lidarComCliqueNoDia(dia)}
                        >
                            <Text style={[styles.textoDiaDoMesCarrossel, styles.copseText]}>
                                {dia.diaDoMes}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};


export default function TelaMes() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<Dia | null>(null);
  const [descricaoCompromisso, setDescricaoCompromisso] = useState('');
  const [compromissosPessoais, setCompromissosPessoais] = useState<Compromisso[]>([]);
  const [feriados, setFeriados] = useState<Compromisso[]>([]);
  const [proximoIdCompromisso, setProximoIdCompromisso] = useState(0);
  
  const [mesAtivoI, setMesAtivoI] = useState(indiceMesInicial);

  const [modalExclusaoVisivel, setModalExclusaoVisivel] = useState(false);
  const [compromissoParaExcluir, setCompromissoParaExcluir] = useState<Compromisso | null>(null);


  const datasImportantes = useMemo(() => 
    [...feriados, ...compromissosPessoais]
        .sort((a, b) => a.data.getTime() - b.data.getTime() || a.id - b.id)
    , [feriados, compromissosPessoais]);

  const datasImportantesFiltradas = useMemo(() => {
    return datasImportantes.filter(item => item.data.getMonth() === mesAtivoI);
  }, [datasImportantes, mesAtivoI]);


  const carregarFeriados = useCallback(async () => {
    const url = `https://brasilapi.com.br/api/feriados/v1/${ANO_ATUAL}`;
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error('Falha ao carregar feriados');
      }
      const dados = await resposta.json();
      
      const feriadosMapeados: Compromisso[] = dados.map((item: any, index: number) => ({
        id: -(index + 1), 
        data: new Date(item.date),
        descricao: item.name,
        tipo: 'feriado' as const,
      }));
      
      setFeriados(feriadosMapeados);
    } catch (error) {
      console.error("Erro ao buscar feriados:", error);
    }
  }, []);

  useEffect(() => {
    carregarFeriados();
  }, [carregarFeriados]);


  const lidarComCliqueNoDia = (dia: Dia) => {
    setDiaSelecionado(dia);
    setModalVisivel(true);
  };

  const lidarComSalvarCompromisso = () => {
    if (diaSelecionado && descricaoCompromisso.trim() !== '') {
      const novoCompromisso: Compromisso = {
        id: proximoIdCompromisso,
        data: diaSelecionado.data,
        descricao: descricaoCompromisso.trim(),
        tipo: 'pessoal',
      };
      
      setCompromissosPessoais([...compromissosPessoais, novoCompromisso].sort((a, b) => a.data.getTime() - b.data.getTime() || a.id - b.id));
      setProximoIdCompromisso(proximoIdCompromisso + 1);
      setDescricaoCompromisso('');
      setModalVisivel(false);
      setDiaSelecionado(null);
    } else {
        Alert.alert("Erro", "Por favor, digite a descrição do compromisso.");
    }
  };

  const lidarComCancelar = () => {
    setDescricaoCompromisso('');
    setModalVisivel(false);
    setDiaSelecionado(null);
  };
  
  const lidarComCliqueEmCompromisso = (compromisso: Compromisso) => {
    if (compromisso.tipo === 'feriado') {
        Alert.alert("Informação", "Este é um feriado nacional e não pode ser removido.");
        return;
    }
    setCompromissoParaExcluir(compromisso);
    setModalExclusaoVisivel(true);
  };

  const lidarComCancelamentoExclusao = () => {
    setModalExclusaoVisivel(false);
    setCompromissoParaExcluir(null);
  };

  const lidarComExclusaoFinal = () => {
    if (compromissoParaExcluir) {
        setCompromissosPessoais(prevCompromissos => 
            prevCompromissos.filter(comp => comp.id !== compromissoParaExcluir.id)
        );
    }
    lidarComCancelamentoExclusao();
  };


  const renderizarCompromisso = (compromisso: Compromisso, index: number) => {
    const dataFormatada = `${compromisso.data.getDate().toString().padStart(2, '0')}/${(compromisso.data.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const isFeriado = compromisso.tipo === 'feriado';
    const coresGradiente = isFeriado 
        ? ['#F8C3FA', '#F8C3FA', '#FFFEE5'] as const
        : ['#FF93FF', '#FF93FF',  '#FFFEE5'] as const; 
    const localizacoes = [0.0, 0.16, 0.210] as const;

    const imagemGato = imagensGatos[index % imagensGatos.length];

    return (
      <View key={compromisso.id} style={styles.containerCompromissoRow}>
        <TouchableOpacity
          onPress={() => lidarComCliqueEmCompromisso(compromisso)} 
          activeOpacity={0.8}
          style={styles.compromissoArea}
        >
          <LinearGradient
            colors={coresGradiente}
            locations={localizacoes}
            style={styles.itemCompromisso}
            start={{ x: 0, y: 0.5 }} 
            end={{ x: 1, y: 0.5 }}   
          >
            <Text style={[styles.textoDiaCompromisso, styles.copseText, isFeriado && { color: '#C04CFD' }]}>{dataFormatada}</Text>
            <Text 
              style={[styles.textoDescricaoCompromisso, styles.copseText, isFeriado && { fontWeight: 'bold' }]}
              numberOfLines={0} 
              ellipsizeMode='tail'
            >
              {compromisso.descricao}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.imagemGatoContainer}>
            <Image source={imagemGato} style={styles.imagemGatoEstilo} />
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['rgba(252, 109, 171, 1)', 'rgba(94, 43, 255, 1)']}
      locations={[0.49, 0]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.conteudoScroll}>
        <View style={styles.containerCabecalho}>
          <Text style={[styles.texto, styles.copseText, styles.textoCabecalho]}>
            Seu Mês
          </Text>
          <View style={styles.sublinhado}></View>
        </View>

        <Image
          source={imagemGrafico}
          style={styles.estiloImagem}
        />

        <View style={styles.quadradoBranco}>
          <Carousel
            loop={false}
            data={meses}
            width={larguraCarrossel}
            height={290} 
            defaultIndex={indiceMesInicial}
            onSnapToItem={setMesAtivoI} 
            renderItem={({ item }) => renderizarMes({ 
                item, 
                datasImportantes: datasImportantes, 
                lidarComCliqueNoDia 
            })}
          />
        </View>

        <View style={styles.containerCompromissos}>
            {datasImportantesFiltradas.length > 0 ? (
                datasImportantesFiltradas.map((compromisso, index) => renderizarCompromisso(compromisso, index))
            ) : (
                <Text style={[styles.textoSemCompromisso, styles.copseText]}>
                    Nenhum compromisso agendado para {meses[mesAtivoI].nome}.
                </Text>
            )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={lidarComCancelar}
      >
        <BlurView intensity={20} tint="dark" style={styles.absoluto} />

        <View style={styles.areaCentralizada}>
          <View style={styles.janelaModal}>
            <Text style={[styles.tituloModal, styles.copseText]}>
              Agendar para: {diaSelecionado?.diaDoMes}/{diaSelecionado ? (diaSelecionado.data.getMonth() + 1) : ''}
            </Text>
            <TextInput
              style={[styles.input, styles.copseText]}
              onChangeText={setDescricaoCompromisso}
              value={descricaoCompromisso}
              placeholder="Digite o compromisso ou data festiva"
              placeholderTextColor="#999"
              multiline
            />
            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={lidarComCancelar}
              >
                <Text style={[styles.textoBotao, styles.copseText]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botao, styles.botaoSalvar]}
                onPress={lidarComSalvarCompromisso}
              >
                <Text style={[styles.textoBotao, styles.copseText]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalExclusaoVisivel}
        onRequestClose={lidarComCancelamentoExclusao}
      >
        <BlurView intensity={20} tint="dark" style={styles.absoluto} />

        <View style={styles.areaCentralizada}>
          <View style={styles.janelaModal}>
            <Text style={[styles.tituloModal, styles.copseText]}>
              Deseja remover este compromisso?
            </Text>
            <Text style={[styles.textoDescricaoExclusao, styles.copseText]}>
              {compromissoParaExcluir?.data.toLocaleDateString('pt-BR')} - "{compromissoParaExcluir?.descricao}"
            </Text>
            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={lidarComCancelamentoExclusao}
              >
                <Text style={[styles.textoBotao, styles.copseText]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botao, styles.botaoRemover]} 
                onPress={lidarComExclusaoFinal}
              >
                <Text style={[styles.textoBotao, styles.copseText]}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    conteudoScroll: {
        paddingBottom: 50,
        alignItems: 'center',
    },
    containerCabecalho: {
        paddingTop: 25,
        width: '80%',
        alignItems: 'center',
        marginBottom: 20,
    },
    sublinhado: {
        height: 2,
        width: '100%',
        backgroundColor: 'white',
        marginTop: 5,
    },
    estiloImagem: {
        width: 300,
        height: 120,
        resizeMode: 'contain',
        marginTop: -40,
    },
    quadradoBranco: {
        width: '98%',
        height: 340, 
        backgroundColor: '#FFFEE5',
        borderRadius: 15,
        marginTop: -1,
        padding: 10,
        alignItems: 'center',
    },
    texto: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    copseText: {
        fontWeight: 'normal',
    },
    textoCabecalho: {
        fontSize: 33,
    },
    containerMes: {
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        height: '100%',
    },
    tituloMes: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgba(194, 76, 253, 1)',
        marginBottom: 10,
    },
    containerNomesDia: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 5,
    },
    textoNomeDia: {
        color: 'rgba(194, 76, 253, 1)',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
    },
    containerDiasMes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
    },
    itemDia: {
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 6,
        borderRadius: 5,
    },
    itemDiaComCompromisso: {
        backgroundColor: '#FFD1F2',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#c04cfd',
    },
    diaVazio: {
        height: 25,
        marginVertical: 2,
    },
    textoDiaDoMesCarrossel: {
        fontSize: 14,
        color: 'rgba(94, 43, 255, 1)',
        fontWeight: '600',
    },
    absoluto: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    areaCentralizada: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    janelaModal: {
        margin: 20,
        backgroundColor: '#FFFEE5',
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
    tituloModal: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'rgba(94, 43, 255, 1)',
    },
    textoDescricaoExclusao: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        color: 'rgba(94, 43, 255, 1)',
    },
    input: {
        height: 80,
        width: '100%',
        borderColor: 'rgba(194, 76, 253, 1)',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        padding: 10,
        textAlignVertical: 'top',
        color: 'rgba(94, 43, 255, 1)',
    },
    botoesModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    botao: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        width: '45%',
        alignItems: 'center',
    },
    botaoCancelar: {
        backgroundColor: '#FF93FF',
    },
    botaoSalvar: {
        backgroundColor: 'rgba(94, 43, 255, 1)',
    },
    botaoRemover: {
        backgroundColor: 'red', 
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    containerCompromissos: {
        width: Dimensions.get ('window').width * 0.85,
        marginTop: 20,
    },
    containerCompromissoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        width: '100%',
    },
    compromissoArea: {
        width: '85%', 
        marginRight: 0,
    },
    itemCompromisso: {
        paddingVertical: 15,
        paddingLeft: 15,
        paddingRight: 5,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: '#FF93FF',
        minHeight: 60,
    },
    imagemGatoContainer: {
        width: '20%', 
        height: '15%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagemGatoEstilo: {
        width: 50, 
        height: 50,
        resizeMode: 'cover',
    },
    textoDiaCompromisso: {
        fontSize: 16,
        fontWeight: 'bold', 
        color: 'rgba(94, 43, 255, 1)',
        width: 60,
        textAlign: 'center',
        marginRight: 10,
    },
    textoDescricaoCompromisso: {
        fontSize: 14,
        color: 'rgba(94, 43, 255, 1)',
        flex: 1,
    },
    textoSemCompromisso: {
        color: '#FFFEE5',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        opacity: 0.7,
    }
});