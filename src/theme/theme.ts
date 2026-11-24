export const theme = {
  colors: {
    primary: '#4A0E1C',        // Vinho escuro (cor principal)
    primaryLight: '#6B182B',   // Vinho suave para estados pressionados
    gold: '#C59B27',           // Dourado (detalhes, ícones e linhas)
    goldSoft: '#EFE5D1',       // Bege dourado suave (fundo de avatares e destaques)
    background: '#FAF6F0',     // Creme (fundo principal das telas)
    surface: '#FFFFFF',        // Branco (cartões e formulários)
    border: '#E6DDD0',         // Borda sutil elegante
    textPrimary: '#2B1218',    // Texto principal escuro harmonizado com vinho
    textSecondary: '#6E6568',  // Cinza (textos secundários)
    textMuted: '#9A9093',      // Cinza claro para placeholders
    danger: '#C62828',         // Vermelho (ações de exclusão e alertas)
    dangerSoft: '#FDECEA',     // Fundo suave para alerta destrutivo
    success: '#2E7D32',        // Verde (confirmações e restaurações)
    successSoft: '#E8F5E9',    // Fundo suave para confirmação
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  typography: {
    brandTitle: {
      fontSize: 38,
      fontWeight: '700' as const,
      letterSpacing: 1,
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
  shadows: {
    card: {
      shadowColor: '#2B1218',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};