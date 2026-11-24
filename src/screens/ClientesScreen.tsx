import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { NovoClienteModal } from '../components/NovoClienteModal';
import { Cliente } from '../models/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService } from '../services/ClienteService';
import { theme } from '../theme/theme';
import { formatDateBR, getInitials } from '../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ClientesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalVisivel, setModalVisivel] = useState<boolean>(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);

  const carregarClientes = useCallback(async (termoBusca?: string) => {
    try {
      const lista = await ClienteService.listarClientes(termoBusca);
      setClientes(lista);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarClientes(busca);
    }, [carregarClientes, busca])
  );

  const handleClienteCadastrado = async (novoCliente: Cliente) => {
    setModalVisivel(false);
    setFeedbackSucesso(`Cliente "${novoCliente.nome}" cadastrado com sucesso!`);
    await carregarClientes(busca);

    setTimeout(() => {
      setFeedbackSucesso(null);
    }, 3500);
  };

  const renderClienteItem = ({ item }: { item: Cliente }) => {
    const ultimaCompraTexto = item.ultima_compra
      ? `Última compra: ${formatDateBR(item.ultima_compra)}`
      : 'Nenhuma compra realizada';

    return (
      <TouchableOpacity
        style={styles.clientCard}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('HistoricoCliente', { clienteId: item.id })
        }
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientName} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.clientSubtitle} numberOfLines={1}>
            {ultimaCompraTexto}
          </Text>
          {item.contato ? (
            <Text style={styles.clientContact} numberOfLines={1}>
              {item.contato}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão principal "+ Novo cliente" */}
      <TouchableOpacity
        style={styles.newClientButton}
        activeOpacity={0.85}
        onPress={() => setModalVisivel(true)}
      >
        <Ionicons
          name="add-circle-outline"
          size={22}
          color={theme.colors.white}
        />
        <Text style={styles.newClientButtonText}>Novo cliente</Text>
      </TouchableOpacity>

      {/* Barra de busca */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={19}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
          placeholderTextColor={theme.colors.textMuted}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        {busca.length > 0 ? (
          <TouchableOpacity
            onPress={() => setBusca('')}
            accessibilityLabel="Limpar busca"
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Mensagem de feedback ao cadastrar */}
      {feedbackSucesso ? (
        <View style={styles.successBanner}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.successBannerText}>{feedbackSucesso}</Text>
        </View>
      ) : null}

      {/* Título da seção */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lista de clientes</Text>
        <Text style={styles.sectionCount}>
          {clientes.length}{' '}
          {clientes.length === 1 ? 'cadastrado' : 'cadastrados'}
        </Text>
      </View>

      {/* Listagem */}
      {carregando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderClienteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name="people-outline"
                size={36}
                color={theme.colors.gold}
              />
              <Text style={styles.emptyTitle}>
                {busca.trim()
                  ? 'Nenhum cliente encontrado'
                  : 'Nenhum cliente cadastrado'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {busca.trim()
                  ? 'Tente buscar por outro nome ou contato.'
                  : 'Toque em "Novo cliente" para adicionar o primeiro cadastro.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de cadastro */}
      <NovoClienteModal
        visible={modalVisivel}
        onClose={() => setModalVisivel(false)}
        onSuccess={handleClienteCadastrado}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  newClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 50,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  newClientButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    marginTop: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm + 2,
    marginTop: theme.spacing.sm + 4,
    gap: theme.spacing.sm,
  },
  successBannerText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: '600',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },
  sectionCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm + 2,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  clientInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  clientSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clientContact: {
    ...theme.typography.caption,
    color: theme.colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  emptyTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
});