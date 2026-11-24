import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon } from 'react-native-svg';
import { TipoJoia } from '../models/types';
import { theme } from '../theme/theme';

interface JewelryIllustrationProps {
  tipo: TipoJoia;
  size?: number;
}

export const JewelryIllustration: React.FC<JewelryIllustrationProps> = ({
  tipo,
  size = 56,
}) => {
  const gold = theme.colors.gold;
  const stoneBlue = '#3B78B8';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {tipo === 'Brinco' && (
        <Svg width={size * 0.82} height={size * 0.82} viewBox="0 0 64 64" fill="none">
          {/* Par de brincos pendentes */}
          <Circle cx="21" cy="18" r="5" stroke={gold} strokeWidth="2.4" />
          <Line x1="21" y1="23" x2="21" y2="30" stroke={gold} strokeWidth="2.2" />
          <Ellipse
            cx="21"
            cy="40"
            rx="6.5"
            ry="9"
            stroke={gold}
            strokeWidth="2.4"
            fill="#F9F2E2"
          />
          <Circle cx="21" cy="40" r="2.8" fill={gold} />

          <Circle cx="43" cy="18" r="5" stroke={gold} strokeWidth="2.4" />
          <Line x1="43" y1="23" x2="43" y2="30" stroke={gold} strokeWidth="2.2" />
          <Ellipse
            cx="43"
            cy="40"
            rx="6.5"
            ry="9"
            stroke={gold}
            strokeWidth="2.4"
            fill="#F9F2E2"
          />
          <Circle cx="43" cy="40" r="2.8" fill={gold} />
        </Svg>
      )}

      {tipo === 'Anel' && (
        <Svg width={size * 0.82} height={size * 0.82} viewBox="0 0 64 64" fill="none">
          {/* Aro dourado e pedra azul */}
          <Circle
            cx="32"
            cy="38"
            r="16"
            stroke={gold}
            strokeWidth="3.2"
          />
          <Polygon
            points="25,16 39,16 42,22 32,27 22,22"
            fill={stoneBlue}
            stroke={gold}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </Svg>
      )}

      {tipo === 'Pulseira' && (
        <Svg width={size * 0.82} height={size * 0.82} viewBox="0 0 64 64" fill="none">
          {/* Corrente delicada com zircônias */}
          <Ellipse
            cx="32"
            cy="34"
            rx="21"
            ry="13"
            stroke={gold}
            strokeWidth="2.6"
          />
          <Circle cx="20" cy="45" r="2.6" fill="#F9F2E2" stroke={gold} strokeWidth="1.8" />
          <Circle cx="32" cy="47" r="3" fill="#F9F2E2" stroke={gold} strokeWidth="1.8" />
          <Circle cx="44" cy="45" r="2.6" fill="#F9F2E2" stroke={gold} strokeWidth="1.8" />
          <Path d="M27 21 L37 21" stroke={gold} strokeWidth="3" strokeLinecap="round" />
        </Svg>
      )}

      {tipo === 'Outro' && (
        <Svg width={size * 0.82} height={size * 0.82} viewBox="0 0 64 64" fill="none">
          {/* Diamante lapidado para joias personalizadas */}
          <Polygon
            points="18,16 46,16 56,28 32,52 8,28"
            stroke={gold}
            strokeWidth="2.4"
            fill="#F9F2E2"
            strokeLinejoin="round"
          />
          <Line x1="8" y1="28" x2="56" y2="28" stroke={gold} strokeWidth="2" />
          <Polygon
            points="24,16 40,16 43,28 32,52 21,28"
            stroke={gold}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});