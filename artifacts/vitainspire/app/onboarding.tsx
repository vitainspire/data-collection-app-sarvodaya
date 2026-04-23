import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useStore } from "@/hooks/useStore";
import { Button } from "@/components/Button";
import { uniqueId } from "@/utils/idGenerator";
import { uploadToDrive } from "@/utils/driveUpload";
import { syncToSheets } from "@/utils/sheetsSync";

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addFarmer } = useStore();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need camera access to capture the farmer's photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter the farmer's name.");
      return;
    }
    if (!photo) {
      Alert.alert("Photo Required", "Please capture a photo of the farmer.");
      return;
    }

    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const farmerId = uniqueId();
      const capturedAt = new Date().toISOString();

      const farmerData = {
        id: farmerId,
        name: name.trim(),
        photoUri: photo,
        capturedAt,
      };

      // 1. Save locally
      await addFarmer(farmerData);

      // 2. Start sync in background
      (async () => {
        try {
          const driveUrl = await uploadToDrive(photo, `farmer_${farmerId}.jpg`);
          await syncToSheets("farmer", {
            ...farmerData,
            photoUri: driveUrl || photo
          });
        } catch (err) {
          console.error("Farmer sync failed:", err);
        }
      })();

      // 3. Navigate to Dashboard
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Failed to save farmer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(200).duration(800)}>
            <MaterialCommunityIcons name="leaf" size={48} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome to Vitainspire</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Let's start by registering the farmer for this session.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.foreground }]}>Farmer Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="user" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter full name"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground }]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.photoContainer}>
              <Text style={[styles.label, { color: colors.foreground }]}>Farmer Photo</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickPhoto}
                style={[
                  styles.photoButton,
                  { backgroundColor: colors.card, borderColor: colors.border, borderStyle: photo ? "solid" : "dashed" }
                ]}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoPreview} contentFit="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <View style={[styles.photoIconCircle, { backgroundColor: colors.primary + "15" }]}>
                      <Feather name="camera" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.photoText, { color: colors.mutedForeground }]}>
                      Tap to capture photo
                    </Text>
                  </View>
                )}
                {photo && (
                  <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="edit-2" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={loading ? "Registering..." : "Start Session"}
          loading={loading}
          disabled={!name.trim() || !photo}
          onPress={handleSubmit}
          icon={<Feather name="arrow-right" size={20} color="#fff" />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  content: {
    padding: 24,
    paddingTop: 80,
    gap: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  form: {
    gap: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    gap: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  photoContainer: {
    gap: 4,
  },
  photoButton: {
    height: 240,
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  photoIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    fontSize: 15,
    fontWeight: "600",
  },
  editBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopWidth: 1,
  },
});
