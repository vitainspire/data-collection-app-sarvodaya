import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { LOCATIONS, State, District } from "@/constants/locations";
import { LinearGradient } from "expo-linear-gradient";

interface LocationSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (stateCode: string, districtCode: string) => void;
  initialState?: string;
  initialDistrict?: string;
}

export function LocationSearch({
  visible,
  onClose,
  onSelect,
  initialState,
  initialDistrict,
}: LocationSearchProps) {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"state" | "district">("state");
  const [selectedState, setSelectedState] = useState<State | null>(
    LOCATIONS.find((s) => s.code === initialState) || null
  );

  const filteredStates = useMemo(() => {
    if (step !== "state") return [];
    return LOCATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, step]);

  const filteredDistricts = useMemo(() => {
    if (step !== "district" || !selectedState) return [];
    return selectedState.districts.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, step, selectedState]);

  const handleStateSelect = (state: State) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedState(state);
    setStep("district");
    setSearch("");
  };

  const handleDistrictSelect = (district: District) => {
    if (!selectedState) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect(selectedState.code, district.code);
    onClose();
    // Reset for next time
    setTimeout(() => {
      setStep("state");
      setSearch("");
    }, 300);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("state");
    setSearch("");
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <LinearGradient
            colors={[colors.primary + "15", "transparent"]}
            style={styles.headerGradient}
          />
          
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {step === "state" ? "Select State" : "Select District"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {step === "state" 
                  ? "Choose a state to see districts" 
                  : `In ${selectedState?.name}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              placeholder={step === "state" ? "Search states..." : "Search districts..."}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              value={search}
              onChangeText={setSearch}
              autoFocus={Platform.OS !== "web"}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              onPress={goBack}
              disabled={step === "state"}
              style={[
                styles.tab, 
                step === "state" && styles.tabActive,
                { borderBottomColor: step === "state" ? colors.primary : "transparent" }
              ]}
            >
              <Text style={[
                styles.tabText, 
                { color: step === "state" ? colors.primary : colors.mutedForeground }
              ]}>State</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={!selectedState}
              onPress={() => setStep("district")}
              style={[
                styles.tab, 
                step === "district" && styles.tabActive,
                { borderBottomColor: step === "district" ? colors.primary : "transparent" }
              ]}
            >
              <Text style={[
                styles.tabText, 
                { color: step === "district" ? colors.primary : colors.mutedForeground }
              ]}>District</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            {step === "state" ? (
              <Animated.View 
                key="states-list"
                entering={SlideInRight.duration(300)}
                style={{ flex: 1 }}
              >
                <FlatList
                  data={filteredStates}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleStateSelect(item)}
                      style={[styles.item, { borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.codeBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.codeText, { color: colors.primary }]}>{item.code}</Text>
                      </View>
                      <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Text style={{ color: colors.mutedForeground }}>No states found</Text>
                    </View>
                  }
                />
              </Animated.View>
            ) : (
              <Animated.View 
                key="districts-list"
                entering={SlideInRight.duration(300)}
                style={{ flex: 1 }}
              >
                <FlatList
                  data={filteredDistricts}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleDistrictSelect(item)}
                      style={[styles.item, { borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.codeBadge, { backgroundColor: colors.accent + "20" }]}>
                        <Text style={[styles.codeText, { color: colors.accent }]}>{selectedState?.code}-{item.code}</Text>
                      </View>
                      <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                      <Feather name="check" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Text style={{ color: colors.mutedForeground }}>No districts found in {selectedState?.name}</Text>
                    </View>
                  }
                />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  container: {
    height: "85%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 24,
  },
  tab: {
    paddingBottom: 12,
    borderBottomWidth: 3,
  },
  tabActive: {
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    gap: 16,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  codeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  itemName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingTop: 100,
  },
});
