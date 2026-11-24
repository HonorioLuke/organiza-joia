import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ClienteSelectModal } from '../components/ClienteSelectModal';
import { JewelryIllustration } from '../components/JewelryIllustration';
import { Cliente, ItemCompraDraft, TipoJoia } from '../models/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService } from '../services/ClienteService';
import { theme } from '../theme/theme';
import {
  applyDateMask,
  formatCurrencyBRL,
  getTodayBR,
  parseDecimalInput,
} from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'NovaCompra'>;

const TIPOS_JOIA: TipoJoia[] = ['Brinco', 'Pulseira', 'Anel', 'Outro'];

function createEmptyItem(): ItemCompraDraft {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo_joia: 'Brinco',
    tipo_personalizado: '',
    detalhamento: '',
    quantidade: '1',
    valor_unitario: '',
  };
}

export const NovaCompraScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialClienteId = route.params?.clienteId ?? null;

  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );
  const [modalClienteVisivel, setModalClienteVisivel] =
    useState<boolean>(false);
  const [dataCompra, setDataCompra] = useState<string>(getTodayBR());
  const [itens, setItens] = useState<ItemCompraDraft[]>([createEmptyItem()]);
  const [tipoDropdownAbertoId, setTipoDropdownAbertoId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!initialClienteId) return;

    ClienteService.buscarPorId(initialClienteId)
      .then((cliente) => setClienteSelecionado(cliente))
      .catch(() => {});
  }, [initialClienteId]);

  const handleAdicionarJoia = () => {
    setItens((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoverJoia = (localId: string) => {
    if (itens.length === 1) {
      Alert.alert(
        'Atenção',
        'A compra precisa ter pelo menos uma joia adicionada.'
      );
      return;
    }

    setItens((prev) => prev.filter((item) => item.localId !== localId));
    if (tipoDropdownAbertoId === localId) {
      setTipoDropdownAbertoId(null);
    }
  };

  const handleAtualizarItem = <K extends keyof ItemCompraDraft>(
    localId: string,
    campo: K,
    valor: ItemCompraDraft[K]
  ) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;
        const updated: ItemCompraDraft = { ...item, [campo]: valor };
        if (campo === 'tipo_joia' && valor !== 'Outro') {
          updated.tipo_personalizado = '';
        }
        return updated;
      })
    );
  };

  const calcularSubtotalItem = (item: ItemCompraDraft): number => {
    const qtd = Math.max(0, Math.floor(parseDecimalInput(item.quantidade)));
    const unit = Math.max(0, parseDecimalInput(item.valor_unitario));
    return Number((qtd * unit).toFixed(2));
  };

  const totalCompra = useMemo(() => {
    const soma = itens.reduce(
      (acc, item) => acc + calcularSubtotalItem(item),
      0
    );
    return Number(soma.toFixed(2));
  }, [itens]);

  const handleSalvarRascunhoEtapa3 = () => {
    if (!clienteSelecionado) {
      Alert.alert('Cliente obrigatório', 'Selecione um cliente antes de continuar.');
      return;
    }

    Alert.alert(
      'Formulário da Etapa 3 validado',
      `Cliente: ${clienteSelecionado.nome}\nData: ${dataCompra}\nJoias adicionadas: ${itens.length}\nTotal prévio: ${formatCurrencyBRL(totalCompra)}\n\nNa Etapa 4 aplicaremos as validações completas e salvaremos no banco SQLite.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho fiel ao protótipo */}
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

        <Text style={styles.headerTitle}>Nova compra</Text>

        <TouchableOpacity
          onPress={handleSalvarRascunhoEtapa3}
          style={styles.headerIconBtn}
          accessibilityLabel="Salvar compra"
        >
          <Ionicons
            name="save-outline"
            size={23}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Seleção do Cliente */}
          <Text style={styles.fieldLabel}>Cliente</Text>
          <TouchableOpacity
            style={styles.selectCard}
            activeOpacity={0.75}
            onPress={() => setModalClienteVisivel(true)}
          >
            <Text
              style={[
                styles.selectCardText,
                !clienteSelecionado && styles.placeholderText,
              ]}
            >
              {clienteSelecionado
                ? clienteSelecionado.nome
                : 'Selecione um cliente...'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Data da Compra */}
          <Text style={[styles.fieldLabel, styles.spacingTopMd]}>
            Data da compra
          </Text>
          <View style={styles.dateInputCard}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
              style={styles.dateIcon}
            />
            <TextInput
              style={styles.dateInput}
              value={dataCompra}
              onChangeText={(text) => setDataCompra(applyDateMask(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Seção: Itens da Compra */}
          <View style={styles.itemsHeaderRow}>
            <Text style={styles.sectionTitle}>Itens da compra</Text>
            <Text style={styles.itemsCountBadge}>
              {itens.length} {itens.length === 1 ? 'joia' : 'joias'}
            </Text>
          </View>

          {itens.map((item) => {
            const subtotal = calcularSubtotalItem(item);
            const dropdownAberto = tipoDropdownAbertoId === item.localId;

            return (
              <View key={item.localId} style={styles.itemCard}>
                {/* Coluna esquerda: Ilustração da joia */}
                <View style={styles.itemLeftColumn}>
                  <JewelryIllustration tipo={item.tipo_joia} size={60} />
                </View>

                {/* Coluna direita: Campos da joia */}
                <View style={styles.itemRightColumn}>
                  {/* Linha Tipo de Joia + Botão Excluir Item */}
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemSmallLabel}>Tipo de joia</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoverJoia(item.localId)}
                      style={styles.removeItemBtn}
                      accessibilityLabel="Remover joia"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Seletor de Tipo */}
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    activeOpacity={0.8}
                    onPress={() =>
                      setTipoDropdownAbertoId(
                        dropdownAberto ? null : item.localId
                      )
                    }
                  >
                    <Text style={styles.dropdownButtonText}>
                      {item.tipo_joia}
                    </Text>
                    <Ionicons
                      name={dropdownAberto ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Opções do Seletor */}
                  {dropdownAberto && (
                    <View style={styles.dropdownMenu}>
                      {TIPOS_JOIA.map((tipoOpcao) => {
                        const ativo = item.tipo_joia === tipoOpcao;
                        return (
                          <TouchableOpacity
                            key={tipoOpcao}
                            style={[
                              styles.dropdownOption,
                              ativo && styles.dropdownOptionActive,
                            ]}
                            onPress={() => {
                              handleAtualizarItem(
                                item.localId,
                                'tipo_joia',
                                tipoOpcao
                              );
                              setTipoDropdownAbertoId(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                ativo && styles.dropdownOptionTextActive,
                              ]}
                            >
                              {tipoOpcao}
                            </Text>
                            {ativo && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={theme.colors.primary}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Campo condicional quando "Outro" for selecionado (Regra 4.4) */}
                  {item.tipo_joia === 'Outro' && (
                    <View style={styles.itemFieldSpacing}>
                      <Text style={styles.itemSmallLabel}>
                        Qual tipo de joia? *
                      </Text>
                      <TextInput
                        style={styles.itemTextInput}
                        placeholder="Ex.: Colar, Pingente, Tornozeleira..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={item.tipo_personalizado}
                        onChangeText={(text) =>
                          handleAtualizarItem(
                            item.localId,
                            'tipo_personalizado',
                            text
                          )
                        }
                      />
                    </View>
                  )}

                  {/* Detalhamento personalizado (disponível para todos os tipos) */}
                  <View style={styles.itemFieldSpacing}>
                    <Text style={styles.itemSmallLabel}>
                      Detalhamento personalizado
                    </Text>
                    <TextInput
                      style={styles.itemTextInput}
                      placeholder="Ex.: Dourado, pedra azul, aro 18"
                      placeholderTextColor={theme.colors.textMuted}
                      value={item.detalhamento}
                      onChangeText={(text) =>
                        handleAtualizarItem(item.localId, 'detalhamento', text)
                      }
                    />
                  </View>

                  {/* Quantidade, Preço unitário e Subtotal */}
                  <View style={styles.commercialRow}>
                    <View style={styles.qtdColumn}>
                      <Text style={styles.itemSmallLabel}>Quantidade</Text>
                      <TextInput
                        style={styles.qtdInput}
                        keyboardType="number-pad"
                        value={item.quantidade}
                        onChangeText={(text) =>
                          handleAtualizarItem(
                            item.localId,
                            'quantidade',
                            text.replace(/\D/g, '')
                          )
                        }
                        placeholder="1"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>

                    <View style={styles.priceColumn}>
                      <Text style={styles.itemSmallLabel}>Preço unitário</Text>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.currencyPrefix}>R$</Text>
                        <TextInput
                          style={styles.priceInput}
                          keyboardType="decimal-pad"
                          value={item.valor_unitario}
                          onChangeText={(text) =>
                            handleAtualizarItem(
                              item.localId,
                              'valor_unitario',
                              text.replace(/[^0-9.,]/g, '')
                            )
                          }
                          placeholder="0,00"
                          placeholderTextColor={theme.colors.textMuted}
                        />
                      </View>

                      <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal</Text>
                        <Text style={styles.subtotalValue}>
                          {formatCurrencyBRL(subtotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Botão "+ Adicionar outra joia" */}
          <TouchableOpacity
            style={styles.addJewelryButton}
            activeOpacity={0.8}
            onPress={handleAdicionarJoia}
          >
            <Ionicons name="add" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.addJewelryText}>Adicionar outra joia</Text>
          </TouchableOpacity>

          {/* Total da compra */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total da compra</Text>
            <Text style={styles.totalValue}>
              {formatCurrencyBRL(totalCompra)}
            </Text>
          </View>

          {/* Botão Salvar compra */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.85}
            onPress={handleSalvarRascunhoEtapa3}
          >
            <Text style={styles.saveButtonText}>Salvar compra</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ClienteSelectModal
        visible={modalClienteVisivel}
        selectedClienteId={clienteSelecionado?.id ?? null}
        onClose={() => setModalClienteVisivel(false)}
        onSelect={(cliente) => setClienteSelecionado(cliente)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
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
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  fieldLabel: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs + 2,
  },
  spacingTopMd: {
    marginTop: theme.spacing.md,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    ...theme.shadows.card,
  },
  selectCardText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  dateInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    ...theme.shadows.card,
  },
  dateIcon: {
    marginRight: theme.spacing.sm + 2,
  },
  dateInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm + 2,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },
  itemsCountBadge: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  itemLeftColumn: {
    marginRight: theme.spacing.sm + 4,
    paddingTop: 4,
  },
  itemRightColumn: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemSmallLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  removeItemBtn: {
    padding: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm + 4,
    height: 40,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dropdownMenu: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: theme.spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownOptionActive: {
    backgroundColor: theme.colors.goldSoft,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  dropdownOptionTextActive: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  itemFieldSpacing: {
    marginTop: theme.spacing.sm + 2,
  },
  itemTextInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm + 4,
    height: 40,
    fontSize: 13.5,
    color: theme.colors.textPrimary,
  },
  commercialRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm + 2,
    gap: theme.spacing.sm + 4,
  },
  qtdColumn: {
    width: 76,
  },
  qtdInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    height: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  priceColumn: {
    flex: 1,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm + 2,
    height: 40,
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  subtotalLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  addJewelryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 48,
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  addJewelryText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});