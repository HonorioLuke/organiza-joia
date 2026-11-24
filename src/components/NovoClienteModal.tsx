import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

interface NovoClienteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (novoCliente: Cliente) => void;
}

export const NovoClienteModal: React.FC<NovoClienteModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [nome, setNome] = useState<string>('');
  const [contato, setContato] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<boolean>(false);

  const resetForm = () => {
    setNome('');
    setContato('');
    setErro(null);
    setSalvando(false);
  };

  const handleClose = () => {
    if (salvando) return;
    resetForm();
    onClose();
  };

  const handleSalvar = async () => {
    if (salvando) return;

    setErro(null);
    setSalvando(true);

    try {
      const clienteCriado = await ClienteService.cadastrarCliente(
        nome,
        contato
      );
      resetForm();
      onSuccess(clienteCriado);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o cliente.';
      setErro(mensagem);
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Cabeçalho do Modal */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="person-add-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>Novo cliente</Text>
            <Text style={styles.subtitle}>
              Preencha os dados para cadastrar um cliente na joalheria.
            </Text>
          </View>

          {/* Campos */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Nome completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Maria Clara"
              placeholderTextColor={theme.colors.textMuted}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                if (erro) setErro(null);
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contato (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefone, WhatsApp ou e-mail"
              placeholderTextColor={theme.colors.textMuted}
              value={contato}
              onChangeText={setContato}
              returnKeyType="done"
              onSubmitEditing={handleSalvar}
            />
          </View>

          {erro ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          {/* Ações */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={salvando}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                salvando && styles.buttonDisabled,
              ]}
              onPress={handleSalvar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              {salvando ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 18, 24, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.screenTitle,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  formGroup: {
    marginTop: theme.spacing.sm + 4,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs + 2,
  },
  required: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
    gap: 6,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm + 4,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
});