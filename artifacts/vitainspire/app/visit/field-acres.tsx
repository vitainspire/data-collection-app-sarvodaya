import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Card } from "@/components/Card";
import { useColors } from "@/hooks/useColors";
import { useVisitContext } from "./_layout";

import { LocationSearch } from "@/components/LocationSearch";
import { LOCATIONS } from "@/constants/locations";

const CROPS = [
  { value: "Maize", icon: "corn" },
  { value: "Rice", icon: "rice" },
  { value: "Wheat", icon: "barley" },
  { value: "Sugarcane", icon: "sprout" },
  { value: "Cotton", icon: "flower-tulip" },
] as const;

export default function FieldAcresScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, updateData } = useVisitContext();

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  
  const currentState = LOCATIONS.find((s) => s.code === data.state) || LOCATIONS[0];
  const currentDistrict = currentState.districts.find(d => d.code === data.district) || currentState.districts[0];

  const canContinue = data.fieldArea.trim().length > 0 && parseFloat(data.fieldArea) > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="New Field Visit" subtitle="Step 1 of 4 · Field details" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.foreground }]}>Location</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setLocationModalOpen(true)}
          style={[
            styles.locationRow,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={[styles.codeBadge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{data.state}-{data.district}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.locText, { color: colors.foreground }]}>
              {currentState.name} · {currentDistrict.name}
            </Text>
            <Text style={[styles.locSub, { color: colors.mutedForeground }]}>
              Used to generate unique ID: {data.state}{data.district}-XXXX
            </Text>
          </View>
          <Feather name="search" size={18} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>
          Field area (acres)
        </Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <TextInput
            value={data.fieldArea}
            onChangeText={(t) => updateData({ fieldArea: t.replace(/[^0-9.]/g, "") })}
            placeholder="e.g. 2.5"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { color: colors.foreground }]}
          />
          <Text style={[styles.suffix, { color: colors.mutedForeground }]}>acres</Text>
        </View>

        <Button
          title="Use Acre Walker"
          variant="outline"
          size="md"
          icon={<MaterialCommunityIcons name="walk" size={20} color={colors.primary} />}
          onPress={() => router.push("/visit/walker")}
          style={{ marginTop: 12 }}
        />

        <Text style={[styles.label, { color: colors.foreground, marginTop: 28 }]}>Crop type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          {CROPS.map((c) => {
            const selected = data.cropType === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateData({ cropType: c.value });
                }}
                activeOpacity={0.85}
                style={[
                  styles.cropChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={c.icon as any}
                  size={22}
                  color={selected ? colors.primaryForeground : colors.primary}
                />
                <Text
                  style={[
                    styles.cropText,
                    { color: selected ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {c.value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Next"
          disabled={!canContinue}
          icon={<Feather name="arrow-right" size={20} color={colors.primaryForeground} />}
          onPress={() => router.push("/visit/field-walk")}
        />
      </View>

      <LocationSearch
        visible={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={(s, d) => updateData({ state: s, district: d })}
        initialState={data.state}
        initialDistrict={data.district}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  locText: { fontSize: 15, fontWeight: "700" },
  locSub: { fontSize: 12, marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    height: 56,
    gap: 8,
  },
  input: { flex: 1, fontSize: 18, fontWeight: "700" },
  suffix: { fontSize: 14, fontWeight: "600" },
  cropChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
  },
  cropText: { fontWeight: "700", fontSize: 14 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    borderTopWidth: 1,
  },
  stateHeader: { fontSize: 14, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  districtChip: { paddingHorizontal: 14, paddingVertical: 10 },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
