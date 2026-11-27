import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CompraLixeira } from '../models/types';
import { LixeiraService } from '../services/LixeiraService';
import { theme } from '../theme/theme';
import {
  formatCurrencyBRL,
  formatDateBR,
  getInitials,
} from '../utils/formatters';

export const LixeiraScreen: React.FC = () => {
  const [itensLixeira, setItensLixeira] = useState<CompraLixeira[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [restaurandoId, setRestaurandoId] = useState<number | null>(null);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);

  const carregarLixeira = useCallback(async () => {
    try {
      const lista = await LixeiraService.listarLixeira();
      setItensLixeira(lista);
    } catch (error) {
      console.error('Erro ao carregar lixeira:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarLixeira();
    }, [carregarLixeira])
  );

  const handleRestaurar = async (compra: CompraLixeira) => {
    if (restaurandoId !== null) return;

    setRestaurandoId(compra.id);
    try {
      await LixeiraService.restaurarCompra(compra.id);
      await carregarLixeira();

      const nomeCliente = compra.cliente_nome || 'o cliente';
      setFeedbackSucesso(
        `Compra de ${nomeCliente} (${formatCurrencyBRL(
          compra.valor_total
        )}) restaurada com sucesso!`
      );

      setTimeout(() => {
        setFeedbackSucesso(null);
      }, 4000);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Não foi possível restaurar a compra.';
      Alert.alert('Aviso', msg);
      await carregarLixeira();
    } finally {
      setRestaurandoId(null);
    }
  };

  const renderTrashItem = ({ item }: { item: CompraLixeira }) => {
    const nomeCliente = item.cliente_nome || `Cliente #${item.cliente_id}`;
    const estaRestaurando = restaurandoId === item.id;
    const textoPrazo =
      item.dias_restantes === 1
        ? 'Resta 1 dia'
        : `Restam ${item.dias_restantes} dias`;

    return (
      <View style={styles.trashCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(nomeCliente)}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.clientName} numberOfLines={1}>
            {nomeCliente}
          </Text>

          <Text style={styles.metaText}>
            Compra de {formatDateBR(item.data_compra)}
          </Text>

          {item.deleted_at ? (
            <Text style={styles.deletedDateText}>
              Excluída em {formatDateBR(item.deleted_at)}
            </Text>
          ) : null}

          <Text style={styles.totalText}>
            {formatCurrencyBRL(item.valor_total)}
          </Text>

          <Text style={styles.remainingText}>{textoPrazo}</Text>

          <TouchableOpacity
            style={[
              styles.restoreButton,
              estaRestaurando && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={estaRestaurando || restaurandoId !== null}
            onPress={() => handleRestaurar(item)}
          >
            {estaRestaurando ? (
              <ActivityIndicator size="small" color={theme.colors.success} />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={theme.colors.success}
                />
                <Text style={styles.restoreButtonText}>Restaurar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner explicativo do prazo de retenção de 10 dias (Tela 06) */}
      <View style={styles.infoBanner}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.infoBannerIcon}
        />
        <Text style={styles.infoBannerText}>
          As compras ficam na lixeira por 10 dias. Após esse prazo, serão
          excluídas permanentemente do sistema.
        </Text>
      </View>

      {/* Confirmação visual em verde ao restaurar */}
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

      {carregando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={itensLixeira}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTrashItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name="trash-bin-outline"
                size={38}
                color={theme.colors.gold}
              />
              <Text style={styles.emptyTitle}>Lixeira vazia</Text>
              <Text style={styles.emptySubtitle}>
                Nenhuma compra excluída temporariamente nos últimos 10 dias.
              </Text>
            </View>
          }
        />
      )}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3ECE1',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm + 4,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm + 2,
  },
  infoBannerIcon: {
    marginTop: 1,
  },
  infoBannerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm + 2,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  successBannerText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: '600',
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm + 4,
  },
  trashCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardBody: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deletedDateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  remainingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: theme.colors.danger,
    marginTop: 2,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    height: 38,
    marginTop: theme.spacing.sm + 2,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  restoreButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.success,
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
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
});