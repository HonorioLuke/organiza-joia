import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Cliente, Compra } from '../models/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CompraService } from '../services/CompraService';
import { theme } from '../theme/theme';
import {
  formatCurrencyBRL,
  formatDateBR,
  getInitials,
} from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'HistoricoCliente'>;

export const HistoricoClienteScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { clienteId } = route.params;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [totalAcumulado, setTotalAcumulado] = useState<number>(0);
  const [quantidadeCompras, setQuantidadeCompras] = useState<number>(0);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarHistorico = useCallback(async () => {
    try {
      setErro(null);
      const dados = await CompraService.obterHistoricoCliente(clienteId);
      setCliente(dados.cliente);
      setTotalAcumulado(dados.resumo.totalAcumulado);
      setQuantidadeCompras(dados.resumo.quantidadeCompras);
      setCompras(dados.compras);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Erro ao carregar histórico do cliente.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [clienteId]);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  const renderCompraItem = ({ item }: { item: Compra }) => {
    const qtdItens = item.quantidade_itens ?? 0;

    return (
      <View style={styles.purchaseCard}>
        <View style={styles.purchaseLeft}>
          <Text style={styles.purchaseDate}>
            {formatDateBR(item.data_compra)}
          </Text>
          <Text style={styles.purchaseItemsCount}>
            {qtdItens} {qtdItens === 1 ? 'item' : 'itens'}
          </Text>
        </View>

        <View style={styles.purchaseRight}>
          <Text style={styles.purchaseTotal}>
            {formatCurrencyBRL(item.valor_total)}
          </Text>

          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('DetalhesCompra', { compraId: item.id })
            }
          >
            <Ionicons
              name="eye-outline"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.viewButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {cliente ? `Compras de ${cliente.nome}` : 'Histórico do cliente'}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {carregando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : erro || !cliente ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>
            {erro || 'Cliente não encontrado.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCompraItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardHeader}>Resumo do cliente</Text>

                <View style={styles.clientRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {getInitials(cliente.nome)}
                    </Text>
                  </View>

                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{cliente.nome}</Text>
                    {cliente.contato ? (
                      <Text style={styles.clientContact}>
                        {cliente.contato}
                      </Text>
                    ) : (
                      <Text style={styles.clientMeta}>
                        Cadastro: {formatDateBR(cliente.created_at)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.metricsDivider} />

                <View style={styles.metricsRow}>
                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Total de compras</Text>
                    <Text style={styles.metricValue}>
                      {formatCurrencyBRL(totalAcumulado)}
                    </Text>
                  </View>

                  <View style={styles.metricColumnRight}>
                    <Text style={styles.metricLabel}>Compras realizadas</Text>
                    <Text style={styles.metricValue}>{quantidadeCompras}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.newPurchaseButton}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('NovaCompra', { clienteId: cliente.id })
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color={theme.colors.white}
                />
                <Text style={styles.newPurchaseButtonText}>Nova compra</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Histórico de compras</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name="bag-outline"
                size={36}
                color={theme.colors.gold}
              />
              <Text style={styles.emptyTitle}>
                Nenhuma compra registrada
              </Text>
              <Text style={styles.emptySubtitle}>
                Toque em "Nova compra" acima para registrar a primeira compra
                deste cliente.
              </Text>
            </View>
          }
          ListFooterComponent={
            compras.length > 0 ? (
              <View style={styles.footerHintRow}>
                <Ionicons
                  name="eye-outline"
                  size={15}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.footerHintText}>
                  Ao clicar em "Ver" serão exibidos os detalhes da compra.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.screenTitle,
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  summaryCardHeader: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm + 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  clientMeta: {
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
  metricsDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metricColumn: {
    flex: 1,
  },
  metricColumnRight: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  newPurchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 48,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    ...theme.shadows.card,
  },
  newPurchaseButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm + 2,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm + 6,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
    ...theme.shadows.card,
  },
  purchaseLeft: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  purchaseDate: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  purchaseItemsCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  purchaseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 4,
  },
  purchaseTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm + 4,
    height: 36,
    gap: 5,
  },
  viewButtonText: {
    color: theme.colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
  footerHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
  },
  footerHintText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});