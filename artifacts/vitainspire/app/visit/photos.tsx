import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { PhotoSlot } from "@/components/PhotoSlot";
import { useColors } from "@/hooks/useColors";
import { useVisitContext } from "./_layout";
import { useStore } from "@/hooks/useStore";
import { generateFieldId } from "@/utils/idGenerator";
import { uploadToDrive } from "@/utils/driveUpload";
import { syncToSheets } from "@/utils/sheetsSync";

export default function PhotosScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, reset, updateData } = useVisitContext();
  const { fieldVisits, addFieldVisit } = useStore();
  const [submitting, setSubmitting] = useState(false);

  const set = (k: "overview" | "leaf" | "cob") => (uri: string) => {
    updateData({
      photos: {
        ...data.photos,
        [k]: uri,
      },
    });
  };

  const allPhotos = data.photos.overview && data.photos.leaf && data.photos.cob;

  const submit = async () => {
    // No longer blocking with 'submitting' state
    try {
      const fieldId = generateFieldId(
        data.state,
        data.district,
        fieldVisits.map((v) => v.id)
      );

      const visitData = {
        ...data,
        id: fieldId,
        createdAt: new Date().toISOString(),
      };

      // 1. Save locally immediately
      await addFieldVisit(visitData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 2. Redirect/Reset UI immediately
      reset();
      router.replace({ pathname: "/visit/success", params: { id: fieldId } });

      // 3. Start Cloud Sync in Background
      (async () => {
        try {
          const [overviewUrl, leafUrl, cobUrl] = await Promise.all([
            data.photos.overview ? uploadToDrive(data.photos.overview, `field_${fieldId}_overview.jpg`) : Promise.resolve(null),
            data.photos.leaf ? uploadToDrive(data.photos.leaf, `field_${fieldId}_leaf.jpg`) : Promise.resolve(null),
            data.photos.cob ? uploadToDrive(data.photos.cob, `field_${fieldId}_cob.jpg`) : Promise.resolve(null),
          ]);

          await syncToSheets("visit", {
            ...visitData,
            photos: {
              overview: overviewUrl || data.photos.overview,
              leaf: leafUrl || data.photos.leaf,
              cob: cobUrl || data.photos.cob,
            }
          });
        } catch (err) {
          console.error("Field visit background sync failed:", err);
        }
      })();
    } catch (e) {
      console.log("submit error", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Smart Photo Checklist" subtitle="Step 4 of 4 · Final photos" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.foreground }]}>
            Capture all 3 photos before submitting the visit.
          </Text>
        </View>

        <PhotoSlot
          uri={data.photos.overview}
          onPhotoTaken={set("overview")}
          label="Field Overview"
          hint="Wide shot showing the whole field"
        />
        <PhotoSlot
          uri={data.photos.leaf}
          onPhotoTaken={set("leaf")}
          label="Leaf Close-up"
          hint="Single leaf, fill the frame"
        />
        <PhotoSlot
          uri={data.photos.cob}
          onPhotoTaken={set("cob")}
          label="Cob with Scale"
          hint="Include a coin or ruler for size reference"
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={submitting ? "Saving..." : "Submit Field Visit"}
          loading={submitting}
          disabled={!allPhotos}
          icon={<Feather name="check" size={20} color={colors.primaryForeground} />}
          onPress={submit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: { flex: 1, fontWeight: "600", fontSize: 13 },
  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    borderTopWidth: 1,
  },
});
