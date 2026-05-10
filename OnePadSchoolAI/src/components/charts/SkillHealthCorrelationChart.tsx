import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DailyBodyLog } from '../../types/healthTypes';
import MiniBarChart from './MiniBarChart';
import { mapLogsToPoints } from './chartUtils';

type Props = {
  logs: DailyBodyLog[];
  masteryLevel: number;
};

export default function SkillHealthCorrelationChart({ logs, masteryLevel }: Props) {
  return (
    <View>
      <MiniBarChart
        title="Energy and skill context"
        points={mapLogsToPoints(logs, (log) => log.energyLevel)}
        color="#0ea5e9"
        maxValue={5}
        suffix="/5"
      />
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Math word problem mastery: {masteryLevel}%. Use readiness to choose normal or shorter practice.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginTop: -6,
    marginBottom: 12
  },
  noteText: { color: '#475569', fontSize: 13 }
});
