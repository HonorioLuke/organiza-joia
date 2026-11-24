import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { DiamondIcon, GoldDiamondDivider } from '../components/JewelryLogo';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

export const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();

  const [usuario, setUsuario] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleLogin = async () => {
    if (carregando) return;

    setErro(null);
    setCarregando(true);

    try {
      await signIn(usuario, senha);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Detalhe decorativo superior */}
          <View style={styles.topAccentCircle} />

          {/* Logotipo e Título */}
          <View style={styles.brandContainer}>
            <DiamondIcon size={64} color={theme.colors.gold} />
            <Text style={styles.brandTitle}>Joias</Text>
            <View style={styles.brandUnderline} />
            <Text style={styles.subtitle}>Acesse sua conta</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Usuário</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Digite seu usuário"
                placeholderTextColor={theme.colors.textMuted}
                value={usuario}
                onChangeText={(text) => {
                  setUsuario(text);
                  if (erro) setErro(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, styles.passwordLabelSpacing]}>
              Senha
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={theme.colors.textMuted}
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (erro) setErro(null);
                }}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha((prev) => !prev)}
                style={styles.eyeButton}
                accessibilityLabel={
                  mostrarSenha ? 'Ocultar senha' : 'Visualizar senha'
                }
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {erro ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={theme.colors.danger}
                />
                <Text style={styles.errorText}>{erro}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                carregando && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Rodapé elegante */}
          <View style={styles.footerContainer}>
            <GoldDiamondDivider />
            <Text style={styles.footerText}>
              Controle de clientes e compras da sua joalheria em um só lugar.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  topAccentCircle: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.goldSoft,
    opacity: 0.55,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  brandTitle: {
    ...theme.typography.brandTitle,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandUnderline: {
    width: 140,
    height: 1.5,
    backgroundColor: theme.colors.gold,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  formContainer: {
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs + 2,
  },
  passwordLabelSpacing: {
    marginTop: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    ...theme.shadows.card,
  },
  inputIcon: {
    marginRight: theme.spacing.sm + 2,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm + 2,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs + 2,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.card,
  },
  loginButtonDisabled: {
    opacity: 0.75,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});