import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ItemDiario, useMetas } from '@/hooks/MetasContext';

const arranhadorImagem: ImageSourcePropType = require('../../../../assets/images/arranhador.png');
const gatosobe: ImageSourcePropType = require ('../../../../assets/images/Gatosobe.png');
const gatosobindo: ImageSourcePropType = require ('../../../../assets/images/Gatosobindo.png');
const premio: ImageSourcePropType = require ('../../../../assets/images/Premio.png')

interface ItemMetaProps {
  item: ItemDiario;
}

const ItemMeta: React.FC<ItemMetaProps> = ({ item }) => {
  const { atualizarItemDiario } = useMetas();
  const [estaExpandido, setEstaExpandido] = useState(false);
  const [recompensaEmEdicao, setRecompensaEmEdicao] = useState(item.recompensa || '');
  const [mostrarInputRecompensa, setMostrarInputRecompensa] = useState(!item.recompensa);
  
  const [imagemAtualGato, setImagemAtualGato] = useState<ImageSourcePropType>(gatosobe);

  const POSICAO_BASE_INICIAL = -40;
  const ALTURA_UTILIZAVEL = 135;

  const progressoMeta = item.progresso || 0;
  const diasConcluidos = item.diasConcluidos || 0;
  const duracaoTotal = item.duracaoDias || 30;
  const progressoPorDia = 100 / duracaoTotal;

  const corDestaque = progressoMeta >= 100 ? 'rgba(76, 175, 80, 1)' : 'rgba(252, 109, 171, 1)';
  
  const isRecompensaVazia = recompensaEmEdicao.trim().length === 0;

  useEffect(() => {
    setRecompensaEmEdicao(item.recompensa || '');
    
    if (item.recompensa && mostrarInputRecompensa) {
      setMostrarInputRecompensa(false);
    } 
    else if (!item.recompensa) {
      setMostrarInputRecompensa(true);
    }
  }, [item.recompensa]);

  const posicaoGatoY = useMemo(() => {
    if (progressoMeta >= 100) return 0;
    
    const y_subida = (progressoMeta / 100) * ALTURA_UTILIZAVEL;
    
    return y_subida;
  }, [progressoMeta]);


  const handleAumentarProgresso = () => {
    if (progressoMeta >= 100) return;

    const novosDiasConcluidos = diasConcluidos + 1;
    const novoProgresso = Math.min(novosDiasConcluidos * progressoPorDia, 100);

    const updates: Partial<ItemDiario> = {
      progresso: novoProgresso,
      diasConcluidos: novosDiasConcluidos
    };

    if (novoProgresso === 100) {
      updates.completed = true;
      Alert.alert('Parabéns!', `Meta "${item.content}" concluída!`);
    }

    atualizarItemDiario(item.id, updates);

    setImagemAtualGato(prevImagem => 
        prevImagem === gatosobe ? gatosobindo : gatosobe
    );
  };

  const handleSalvarRecompensa = () => {
    const recompensaSalvar = recompensaEmEdicao.trim();
    
    if (recompensaSalvar) {
      atualizarItemDiario(item.id, { recompensa: recompensaSalvar });
      setMostrarInputRecompensa(false);
    } else {
      Alert.alert('Atenção', 'A recompensa não pode ser vazia. Por favor, digite uma recompensa.');
    }
  };

  const handleEditarRecompensa = () => {
    setMostrarInputRecompensa(true);
  };

  return (
    <View style={styles.containerMeta}>
      <TouchableOpacity
        style={styles.cabecalhoMetaWrapper}
        onPress={() => setEstaExpandido(!estaExpandido)}
        activeOpacity={0.8}
      >
        <View style={styles.trilhaProgresso}>
          <View style={[
            styles.preenchimentoProgresso,
            {
              backgroundColor: corDestaque,
              width: `${progressoMeta}%`
            }
          ]} />
        </View>
        <View style={styles.conteudoCabecalhoMeta}>
          <Text style={[styles.textoCabecalhoMeta, styles.copseText]}>
            {item.content}
          </Text>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, styles.copseText]}>
              {diasConcluidos}/{duracaoTotal} dias
            </Text>
            <FontAwesome
              name={estaExpandido ? "chevron-up" : "chevron-down"}
              size={14}
              color="#FFFEE5"
              style={styles.iconeDropdown}
            />
          </View>
        </View>
      </TouchableOpacity>

      {estaExpandido && (
        <View style={styles.cardConteudoExpandido}>
          <View style={styles.progressDetails}>
            <Text style={[styles.progressPercentage, styles.copseText]}>
              {Math.round(progressoMeta)}% concluído
            </Text>
            <Text style={[styles.daysProgress, styles.copseText]}>
              {diasConcluidos} de {duracaoTotal} dias
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.botaoProgresso,
                progressoMeta >= 100 && styles.botaoProgressoConcluido
              ]}
              onPress={handleAumentarProgresso}
              disabled={progressoMeta >= 100}
            >
              <Text style={[styles.textoBotaoProgresso, styles.copseText]}>
                {progressoMeta >= 100 ? 'CONCLUÍDA' : `+${Math.round(progressoPorDia)}% Progresso`}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.dateText, styles.copseText]}>
              Data Alvo: {item.dataCerta ? new Date(item.dataCerta).toLocaleDateString('pt-BR') : 'Não Definida'}
            </Text>
          </View>

          <View style={styles.recompensaContainer}>
            <Text style={[styles.recompensaTitle, styles.copseText]}>
              Minha Recompensa 🎁
            </Text>

            {mostrarInputRecompensa ? (
              <>
                <TextInput
                  style={[styles.recompensaInput, styles.copseText]}
                  value={recompensaEmEdicao}
                  onChangeText={setRecompensaEmEdicao}
                  placeholder="O que você ganhará quando concluir esta meta?"
                  placeholderTextColor="#808080"
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={[
                    styles.botaoSalvarRecompensa,
                    isRecompensaVazia && styles.botaoSalvarRecompensaDesabilitado
                  ]}
                  onPress={handleSalvarRecompensa}
                  disabled={isRecompensaVazia}
                >
                  <Text style={[styles.textoSalvarRecompensa, styles.copseText]}>
                    Salvar Recompensa
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.recompensaSalvaContainer}>
                <View style={styles.recompensaAtualContainer}>
                  <Text style={[styles.recompensaAtualTextMaior, styles.copseText]}>
                    {item.recompensa}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.botaoEditarRecompensa}
                  onPress={handleEditarRecompensa}
                >
                  <FontAwesome name="edit" size={16} color="#c04cfd" />
                  <Text style={[styles.textoEditarRecompensa, styles.copseText]}>
                    Editar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.areaVisualizacao}> 
            {progressoMeta < 100 ? (
              <>
                <Image
                  source={arranhadorImagem}
                  style={styles.imagemArranhadorOriginal} 
                />
                <Image
                  source={imagemAtualGato}
                  style={[
                    styles.imagemGato,
                    { 
                      bottom: posicaoGatoY + POSICAO_BASE_INICIAL, 
                      left: '50%', 
                      marginLeft: -40
                    }
                  ]}
                />
              </>
            ) : (
              <Image
                source={premio}
                style={styles.imagemPremio}
              />
            )}
          </View>

        </View>
      )}
    </View>
  );
};

export default function Metas() {
  const { itensDiarios } = useMetas();

  const metas = useMemo(() => {
    return itensDiarios.filter(item => item.type === 'Metas');
  }, [itensDiarios]);

  const metasAtivas = useMemo(() => {
    return metas.filter(item => (item.progresso || 0) < 100);
  }, [metas]);

  const metasConcluidas = useMemo(() => {
    return metas.filter(item => (item.progresso || 0) === 100);
  }, [metas]);

  return (
    <LinearGradient
      colors={['rgba(94, 43, 255 , 1)', 'rgba(252, 109, 171, 1)']}
      locations={[0, 0]}
      style={styles.container}
    >
      <Text style={[styles.texto, styles.copseText, styles.headerText]}>MINHAS METAS</Text>
      <View style={styles.underline}></View>

      <ScrollView contentContainerStyle={styles.containerListaMeta}>

        <Text style={[styles.sectionTitle, styles.copseText]}>Metas Ativas ({metasAtivas.length})</Text>

        {metasAtivas.length > 0 ? (
          metasAtivas.map(item => (
            <ItemMeta key={item.id} item={item} />
          ))
        ) : (
          <Text style={[styles.noItemsText, styles.copseText]}>Nenhuma meta ativa no momento.</Text>
        )}

        {metasConcluidas.length > 0 && (
          <View style={styles.concluidasContainer}>
            <Text style={[styles.concluidasHeader, styles.copseText]}> Metas Concluídas ({metasConcluidas.length})</Text>
            <View style={styles.concluidasUnderline} />

            {metasConcluidas.map(item => (
              <ItemMeta key={item.id} item={item} />
            ))}
            <Text style={[styles.concluidasInfo, styles.copseText]}>
              Parabéns! Você concluiu sua meta! 🎉</Text>
          </View>
        )}
      </ScrollView>

    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
  },
  texto: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 20,
  },
  copseText: {
    fontFamily: 'Copse',
    fontWeight: 'normal',
  },
  headerText: {
    fontSize: 33,
  },

  containerListaMeta: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
  },
  containerMeta: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  cabecalhoMetaWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  trilhaProgresso: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  preenchimentoProgresso: {
    height: '100%',
  },
  conteudoCabecalhoMeta: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  textoCabecalhoMeta: {
    color: '#FFFEE5',
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 10,
  },
  iconeDropdown: {
    marginLeft: 10,
  },

  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFEE5',
    fontSize: 12,
    marginRight: 10,
    fontWeight: '600',
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c04cfd',
  },
  daysProgress: {
    fontSize: 14,
    color: '#808080',
    fontStyle: 'italic',
  },

  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  botaoProgresso: {
    backgroundColor: '#c04cfd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 2,
  },
  botaoProgressoConcluido: {
    backgroundColor: 'green',
    opacity: 0.8,
  },
  textoBotaoProgresso: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#FFFEE5',
    fontWeight: '600',
  },

  cardConteudoExpandido: {
    width: '100%',
    backgroundColor: '#FFFEE5',
    borderRadius: 10,
    padding: 20,
    marginTop: -10,
    minHeight: 350,
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 15,
    zIndex: 1,
  },

  recompensaContainer: {
    width: '100%',
    marginBottom: 15,
    zIndex: 2, 
  },
  recompensaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c04cfd',
    marginBottom: 10,
    textAlign: 'center',
  },
  recompensaInput: {
    backgroundColor: 'rgba(252, 109, 171, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 109, 171, 0.3)',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#343434',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  botaoSalvarRecompensa: {
    backgroundColor: '#c04cfd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
    zIndex: 3,
  },
  botaoSalvarRecompensaDesabilitado: {
    backgroundColor: '#cccccc',
    opacity: 0.8,
  },
  textoSalvarRecompensa: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recompensaSalvaContainer: {
    width: '100%',
    zIndex: 3,
  },
  recompensaAtualContainer: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recompensaAtualTextMaior: { 
    fontSize: 18, 
    color: 'rgba(94, 43, 255 , 1)',
    fontWeight: '700', 
    textAlign: 'center',
  },
  botaoEditarRecompensa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c04cfd',
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  textoEditarRecompensa: {
    color: '#c04cfd',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },

  areaVisualizacao: { 
    marginTop: -20,
    width: '100%',
    height: 300, 
    position: 'relative', 
    overflow: 'hidden', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 0,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderStyle: 'dashed',
    borderRadius: 10,
  },

  imagemArranhadorOriginal: { 
    width: 630,
    height: 500,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -130, 
    zIndex: 1,
  },
  
  imagemGato: {
    width: 200, 
    height: 200, 
    resizeMode: 'contain',
    position: 'absolute',
    zIndex: 5, 
  },
  
  imagemPremio: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },

  areaImagemPlaceholder: {
    marginTop: 20,
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 0,
  },
  imagemArranhador: {
     width: 500,
     height: 470,
     resizeMode: 'contain',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFEE5',
    marginTop: 25,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: 5,
    width: '100%',
    textTransform: 'uppercase',
  },
  noItemsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  concluidasContainer: {
    width: '100%',
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
  },
  concluidasHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Copse',
  },
  concluidasUnderline: {
    height: 2,
    width: '50%',
    backgroundColor: '#FFFEE5',
    marginBottom: 15,
  },
  concluidasInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});