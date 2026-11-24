import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cliente } from '../models/types';
import { ClienteService } from '../services/ClienteService';
import { theme } from '../theme/theme';
import { getInitials } from '../utils/formatters';

interface ClienteSelectModalProps {
  visible: boolean;
  selectedClienteId: number | null;
  onClose: () => void;
  onSelect: (cliente: Cliente) => void;
}

export const ClienteSelectModal: React.FC<ClienteSelectModalProps> = ({
  visible,
  selectedClienteId,
  onClose,
  onSelect,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) return;

    let ativo = true;
    setCarregando(true);

    ClienteService.listarClientes(busca)
      .then((lista) => {
        if (ativo) setClientes(lista);
      })
      .catch((err) => console.error('Erro ao listar clientes no seletor:', err))
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [visible, busca]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecionar cliente</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome..."
              placeholderTextColor={theme.colors.textMuted}
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          {carregando ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={clientes}
              keyExtractor={(item) => String(item.id)}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedClienteId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.clientOption,
                      isSelected && styles.clientOptionSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(item.nome)}
                      </Text>
                    </View>
                    <View style={styles.clientMeta}>
                      <Text style={styles.clientName}>{item.nome}</Text>
                      {item.contato ? (
                        <Text style={styles.clientContact}>{item.contato}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={theme.colors.primary}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Nenhum cliente encontrado. Cadastre um cliente na aba
                  Clientes primeiro.
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 18, 24, 0.55)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    maxHeight: '78%',
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm + 4,
  },
  title: {
    ...theme.typography.screenTitle,
    color: theme.colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm + 4,
    height: 44,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm + 4,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  loadingBox: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  list: {
    flexGrow: 0,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  clientOptionSelected: {
    backgroundColor: theme.colors.goldSoft,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm + 4,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  clientMeta: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  clientContact: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});