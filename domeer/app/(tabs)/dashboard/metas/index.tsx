import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import { useMetas, ItemDiario } from '@/hooks/MetasContext'; 


interface ItemMetaProps {
  item: ItemDiario;
}

const ItemMeta: React.FC<ItemMetaProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressoMeta = item.progresso || 0; 
  const corDestaque = 'rgba(252, 109, 171, 1)'; 

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
          <Text style={styles.textoCabecalhoMeta}>
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
        <>
          <Text style={styles.rotuloDataMeta}>
            {item.type === 'Metas' ? `Data Alvo: ${item.dataCerta || 'Não Definida'}` : `Frequência: ${item.frequency}`}
          </Text>
          
          <View style={styles.cardConteudoExpandido}>
            <View style={styles.placeholderInput}></View>
            <View style={[styles.placeholderInput, { width: '40%' }]}></View>
            
            <View style={styles.areaImagemPlaceholder}>
                <Text style={styles.textoPlaceholder}>
                    [Espaço para o Desenho/Imagem]
                </Text>
            </View>
            
            <View style={[styles.placeholderInput, { width: '30%', height: 15 }]}></View>
          </View>
        </>
      )}
    </View>
  );
};


export default function Metas() {
    const { itensDiarios } = useMetas();
    const apenasMetas = itensDiarios.filter(item => item.type === 'Metas');

    const metas = useMemo(() => {
        return itensDiarios.filter(item => item.type === 'Metas');
    }, [itensDiarios]);

    const habitos = useMemo(() => {
        return itensDiarios.filter(item => item.type === 'Hábitos');
    }, [itensDiarios]);

  return (
    <LinearGradient
      colors={['rgba(94, 43, 255, 1)', 'rgba(252, 109, 171, 1)']}
      locations={[0, 0.6]}
      style={styles.container}
    >
      <Text style={[styles.texto, styles.copseText, styles.headerText]}>METAS</Text>
      <View style={styles.underline}></View>
      
      <ScrollView contentContainerStyle={styles.containerListaMeta}>
        <Text style={styles.sectionTitle}>Metas ({metas.length})</Text>
        {metas.length > 0 ? (
            metas.map(item => (
                <ItemMeta key={item.id} item={item} />
            ))
        ) : (
            <Text style={styles.noItemsText}>Nenhuma meta cadastrada.</Text>
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
    
    rotuloDataMeta: {
      color: '#FFFEE5',
      fontSize: 12,
      alignSelf: 'flex-start',
      marginLeft: 10, 
      marginTop: 5,
      marginBottom: 5,
    },
    cardConteudoExpandido: {
      width: '100%',
      backgroundColor: '#FFFEE5', 
      borderRadius: 10,
      padding: 20,
      marginTop: 5,
      minHeight: 350, 
      alignItems: 'center',
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
});