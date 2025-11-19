import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
//text
import { useMetas, ItemDiario } from '@/hooks/MetasContext'; 

interface ItemMetaProps {
  item: ItemDiario;
}

const ItemMeta: React.FC<ItemMetaProps> = ({ item }) => {
  const { atualizarItemDiario } = useMetas(); 
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressoMeta = item.progresso || 0; 
  const corDestaque = progressoMeta >= 100 ? 'rgba(76, 175, 80, 1)' : 'rgba(252, 109, 171, 1)'; 

  const handleIncreaseProgress = () => {
    if (progressoMeta >= 100) return;
    const novoProgresso = Math.min(progressoMeta + 10, 100); 
    const updates: Partial <ItemDiario> = { progresso: novoProgresso};

    if (novoProgresso === 100) {
      updates.completed = true;
      Alert.alert ('Parabéns!', `Meta "${item.content}" concluída!`)
    }

    atualizarItemDiario(item.id, updates);
  };

  return (
    <View style={styles.containerMeta}>
      <TouchableOpacity 
        style={styles.cabecalhoMetaWrapper}
        onPress={() => setIsExpanded(!isExpanded)}
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
          <FontAwesome 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={14} 
            color="#FFFEE5" 
            style={styles.iconeDropdown} 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardConteudoExpandido}>
            
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.progressButton,
                        progressoMeta >= 100 && styles.progressButtonCompleted 
                    ]}
                    onPress={handleIncreaseProgress}
                    disabled={progressoMeta >= 100} 
                >
                    <Text style={[styles.progressButtonText, styles.copseText]}>
                        {progressoMeta >= 100 ? 'CONCLUÍDA' : '+10% Progresso'}
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.dateText, styles.copseText]}>
                    Data Alvo: {item.dataCerta || 'Não Definida'}
                </Text>
            </View>

            <View style={styles.placeholderInput}></View>
            <View style={[styles.placeholderInput, { width: '40%' }]}></View>
            
            <View style={styles.areaImagemPlaceholder}>
                <Text style={[styles.textoPlaceholder, styles.copseText]}>
                    [Espaço para o Desenho/Imagem]
                </Text>
            </View>
            
            <View style={[styles.placeholderInput, { width: '30%', height: 15 }]}></View>
            
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
    
    const metasAtivas = useMemo (() => {
      return metas.filter(item => (item.progresso || 0) < 100);
    }, [metas]);
    
    const metasConcluidas = useMemo (() => {
      return metas.filter(item => (item.progresso || 0) === 100);
    }, [metas]);


  return (
    <LinearGradient
      colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
      locations={[0, 0.6]}
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
            <View style= {styles.concluidasContainer}>
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
    progressButton: {
        backgroundColor: '#c04cfd',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    progressButtonCompleted: {
        backgroundColor: 'green',
        opacity: 0.8,
    },
    progressButtonText: {
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
    },
    placeholderInput: {
        backgroundColor: 'rgba(252, 109, 171, 0.2)', 
        height: 40,
        width: '100%',
        borderRadius: 8,
        marginBottom: 10,
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
    },
    textoPlaceholder: {
        color: '#808080',
        fontStyle: 'italic',
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