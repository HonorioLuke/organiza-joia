import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import { theme } from '../theme/theme';

interface DiamondIconProps {
  size?: number;
  color?: string;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({
  size = 56,
  color = theme.colors.gold,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Contorno externo do diamante */}
      <Polygon
        points="18,12 46,12 58,26 32,54 6,26"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Linha horizontal da coroa */}
      <Line
        x1="6"
        y1="26"
        x2="58"
        y2="26"
        stroke={color}
        strokeWidth="2"
      />
      {/* Facetas internas */}
      <Polygon
        points="24,12 40,12 44,26 32,54 20,26"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Line
        x1="18"
        y1="12"
        x2="20"
        y2="26"
        stroke={color}
        strokeWidth="1.8"
      />
      <Line
        x1="46"
        y1="12"
        x2="44"
        y2="26"
        stroke={color}
        strokeWidth="1.8"
      />
    </Svg>
  );
};

export const GoldDiamondDivider: React.FC = () => {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.line} />
      <View style={styles.iconWrapper}>
        <DiamondIcon size={20} color={theme.colors.gold} />
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gold,
    opacity: 0.65,
  },
  iconWrapper: {
    paddingHorizontal: theme.spacing.sm,
  },
});