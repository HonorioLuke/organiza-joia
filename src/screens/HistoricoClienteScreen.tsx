import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Cliente } from '../models/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService } from '../services/ClienteService';
import { theme } from '../theme/theme';
import { formatDateBR, getInitials } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'HistoricoCliente'>;

export const HistoricoClienteScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { clienteId } = route.params;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    let ativo = true;

    async function loadCliente() {
      try {
        const data = await ClienteService.buscarPorId(clienteId);
        if (ativo) {
          setCliente(data);
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    loadCliente();
    return () => {
      ativo = false;
    };
  }, [clienteId]);

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
          {cliente ? `Compras de ${cliente.nome}` : 'Cliente'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {carregando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : cliente ? (
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.clientRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {getInitials(cliente.nome)}
                </Text>
              </View>
              <View style={styles.clientDetails}>
                <Text style={styles.clientName}>{cliente.nome}</Text>
                <Text style={styles.clientMeta}>
                  Cliente #{cliente.id} • Cadastro:{' '}
                  {formatDateBR(cliente.created_at)}
                </Text>
                {cliente.contato ? (
                  <Text style={styles.clientContact}>{cliente.contato}</Text>
                ) : null}
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
              size={22}
              color={theme.colors.white}
            />
            <Text style={styles.newPurchaseButtonText}>Nova compra</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={theme.colors.gold}
            />
            <Text style={styles.infoTitle}>Histórico de compras</Text>
            <Text style={styles.infoText}>
              O salvamento no banco (Etapa 4) e a listagem completa do histórico
              (Etapa 5) serão ativados na sequência.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.centerBox}>
          <Text style={styles.infoTitle}>Cliente não encontrado.</Text>
        </View>
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
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  clientDetails: {
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
  newPurchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 50,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  newPurchaseButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  infoTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
});