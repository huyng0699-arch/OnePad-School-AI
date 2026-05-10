import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReadinessLevel } from '../../types/healthTypes';

type Props = {
  level: ReadinessLevel;
};

const scoreByLevel: Record<ReadinessLevel, number> = {
  fresh: 4,
  okay: 3,
  low_energy: 2,
  needs_rest: 1
};

export default function ReadinessRing({ level }: Props) {
  const score = scoreByLevel[level];
  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <Text style={styles.score}>{score}/4</Text>
        <Text style={styles.label}>{level.replace('_', ' ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 12,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  score: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  label: { color: '#475569', fontSize: 11, marginTop: 2, textTransform: 'capitalize' }
});
