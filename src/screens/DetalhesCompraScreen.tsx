import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { JewelryIllustration } from '../components/JewelryIllustration';
import { Compra, ItemCompra } from '../models/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CompraService } from '../services/CompraService';
import { theme } from '../theme/theme';
import { formatCurrencyBRL, formatDateBR } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalhesCompra'>;

export const DetalhesCompraScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { compraId } = route.params;

  const [compra, setCompra] = useState<Compra | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDetalhes = useCallback(async () => {
    try {
      setErro(null);
      const dados = await CompraService.obterDetalhesCompra(compraId);
      setCompra(dados);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Erro ao carregar os detalhes da compra.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [compraId]);

  useFocusEffect(
    useCallback(() => {
      carregarDetalhes();
    }, [carregarDetalhes])
  );

  const handleExcluirEtapa5 = () => {
    Alert.alert(
      'Lixeira de 10 dias (Etapa 6)',
      'A exclusão lógica com modal de confirmação e retenção de 10 dias na lixeira será ativada na próxima etapa.'
    );
  };

  const getTituloJoia = (item: ItemCompra): string => {
    if (item.tipo_joia === 'Outro' && item.tipo_personalizado) {
      return `${item.tipo_personalizado} (Outro)`;
    }
    return item.tipo_joia;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes da compra</Text>

        <TouchableOpacity
          onPress={handleExcluirEtapa5}
          style={styles.headerIconBtn}
          accessibilityLabel="Excluir compra"
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={theme.colors.danger}
          />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : erro || !compra ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>
            {erro || 'Compra não encontrada.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.generalCard}>
            <Text style={styles.metaLabel}>Cliente</Text>
            <Text style={styles.clientName}>
              {compra.cliente_nome || `Cliente #${compra.cliente_id}`}
            </Text>

            <View style={styles.generalDivider} />

            <Text style={styles.metaLabel}>Data da compra</Text>
            <Text style={styles.purchaseDate}>
              {formatDateBR(compra.data_compra)}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Itens da compra</Text>

          {(compra.itens ?? []).map((item, idx) => (
            <View key={item.id ?? idx} style={styles.itemCard}>
              <JewelryIllustration tipo={item.tipo_joia} size={62} />

              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{getTituloJoia(item)}</Text>

                {item.detalhamento ? (
                  <Text style={styles.itemDetail}>{item.detalhamento}</Text>
                ) : null}

                <Text style={styles.itemCommercialMeta}>
                  Qtd: {item.quantidade}   |   Unit.:{' '}
                  {formatCurrencyBRL(item.valor_unitario)}
                </Text>

                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    {formatCurrencyBRL(item.subtotal)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total da compra</Text>
            <Text style={styles.totalValue}>
              {formatCurrencyBRL(compra.valor_total)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={handleExcluirEtapa5}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.danger}
            />
            <Text style={styles.deleteButtonText}>Excluir compra</Text>
          </TouchableOpacity>
        </ScrollView>
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
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.screenTitle,
    color: theme.colors.primary,
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
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  generalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  generalDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm + 4,
  },
  purchaseDate: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm + 2,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    ...theme.shadows.card,
  },
  itemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  itemCommercialMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subtotalLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 2,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    height: 50,
    gap: theme.spacing.sm,
  },
  deleteButtonText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});