import React, { createContext, ReactNode, useContext, useState } from 'react';

type ItemTipo = 'Tarefas' | 'Metas' | 'Hábitos';

export interface ItemDiario {
  id: string;
  type: ItemTipo;
  content: string;
  date: string; 
  completed: boolean;
  frequency?: 'Diário' | 'Semanal';
  dayOfWeekCreated?: number;
  
  dataCerta?: string;
  imagemUrl?: string;
  progresso?: number;
  // Novas propriedades para metas
  duracaoDias?: number;
  diasConcluidos?: number;
  // Nova propriedade para recompensa
  recompensa?: string;
}

interface MetasContextType {
  itensDiarios: ItemDiario[];
  adicionarItem: (item: ItemDiario) => void;
  atualizarItemDiario: (itemId: string, updates: Partial<ItemDiario>) => void; 
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

interface MetasProviderProps {
  children: ReactNode;
}

export const MetasProvider: React.FC<MetasProviderProps> = ({ children }) => {
  const [itensDiarios, setItensDiarios] = useState<ItemDiario[]>([]);
  
  const adicionarItem = (item: ItemDiario) => {
    const newItem = {
        ...item,
        progresso: item.type === 'Metas' ? (item.progresso ?? 0) : undefined,
        completed: item.type !== 'Metas' ? (item.completed ?? false) : item.completed,
        duracaoDias: item.type === 'Metas' ? (item.duracaoDias ?? 30) : undefined,
        diasConcluidos: item.type === 'Metas' ? (item.diasConcluidos ?? 0) : undefined,
        recompensa: item.type === 'Metas' ? (item.recompensa ?? '') : undefined,
    };
    setItensDiarios(prev => [...prev, newItem]);
  };
  
  const atualizarItemDiario = (itemId: string, updates: Partial<ItemDiario>) => {
    setItensDiarios(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };
  
  return (
    <MetasContext.Provider value={{ itensDiarios, adicionarItem, atualizarItemDiario }}>
      {children}
    </MetasContext.Provider>
  );
};

export const useMetas = () => {
  const context = useContext(MetasContext);
  if (context === undefined) {
    throw new Error('useMetas deve ser usado dentro de um MetasProvider');
  }
  return context;
};