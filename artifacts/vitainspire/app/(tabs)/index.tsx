import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { useColors } from "@/hooks/useColors";
import { useStore } from "@/hooks/useStore";
import { uniqueId } from "@/utils/idGenerator";
import { uploadToDrive } from "@/utils/driveUpload";
import { syncToSheets } from "@/utils/sheetsSync";

export default function HarvestHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { farmers, fieldVisits, addFarmer, refresh } = useStore();
  const currentFarmer = farmers[farmers.length - 1];

  useFocusEffect(
    useCallback(() => {
      refresh();
      console.log("DEBUG: SHEETS_URL =", process.env.EXPO_PUBLIC_SHEETS_SCRIPT_URL ? "Defined" : "UNDEFINED");
      console.log("DEBUG: DRIVE_URL =", process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL ? "Defined" : "UNDEFINED");
    }, [refresh])
  );


  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : 90;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandRow}>
        <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="leaf" size={22} color={colors.primaryForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, { color: colors.foreground }]}>Vitainspire</Text>
          <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>
            Smart Farming. Better Yield.
          </Text>
        </View>
      </View>

      <View style={[styles.activeFarmerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.farmerInfo}>
          <View style={[styles.activeFarmerPhoto, { borderColor: colors.primary }]}>
            <Image source={{ uri: currentFarmer?.photoUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeFarmerLabel, { color: colors.mutedForeground }]}>ACTIVE FARMER</Text>
            <Text style={[styles.activeFarmerName, { color: colors.foreground }]}>{currentFarmer?.name || "Unknown Farmer"}</Text>
            <Text style={[styles.activeFarmerId, { color: colors.mutedForeground }]}>ID: {currentFarmer?.id.slice(-6).toUpperCase()}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.replace("/onboarding")}
            style={[styles.switchBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="refresh-cw" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Dashboard</Text>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/visit/field-acres");
        }}
        activeOpacity={0.85}
        style={[
          styles.actionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            borderRadius: colors.radius,
            borderWidth: 2,
          },
        ]}
      >
        <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="map-marker-plus" size={26} color={colors.primaryForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actionTitle, { color: colors.foreground }]}>
            Start a New Field Visit
          </Text>
          <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
            Walk the field, log observations, capture photos
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/visit/list");
        }}
        activeOpacity={0.85}
        style={[
          styles.actionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            borderWidth: 1,
          },
        ]}
      >
        <View style={[styles.actionIcon, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={26} color={colors.accentForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actionTitle, { color: colors.foreground }]}>
            Record Harvest Data
          </Text>
          <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
            {fieldVisits.length} saved {fieldVisits.length === 1 ? "field" : "fields"}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
        Recent Field Visits
      </Text>
      {fieldVisits.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="sprout-outline" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No field visits yet. Start one above.
          </Text>
        </View>
      ) : (
        fieldVisits.slice(0, 5).map((v) => (
          <View
            key={v.id}
            style={[styles.visitRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={[styles.visitBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.visitBadgeText, { color: colors.primary }]}>{v.cropType.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.visitId, { color: colors.foreground }]}>{v.id}</Text>
              <Text style={[styles.visitMeta, { color: colors.mutedForeground }]}>
                {v.cropType} · {v.fieldArea} acres · {new Date(v.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 8 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  brandSub: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  activeFarmerCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  farmerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  activeFarmerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
  },
  activeFarmerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  activeFarmerName: {
    fontSize: 18,
    fontWeight: "700",
  },
  activeFarmerId: {
    fontSize: 12,
    fontWeight: "500",
  },
  switchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 16, fontWeight: "700" },
  actionSub: { fontSize: 13, marginTop: 2 },
  empty: {
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: "500" },
  visitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  visitBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  visitBadgeText: { fontSize: 16, fontWeight: "800" },
  visitId: { fontSize: 15, fontWeight: "700" },
  visitMeta: { fontSize: 12, marginTop: 2 },
});
