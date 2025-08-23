

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function SettingsScreen() {
  const totalAmount = useQuery(api.donations.getTotalAmount);
  const donationCount = useQuery(api.donations.getCount);

  const handleHapticFeedback = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAbout = () => {
    handleHapticFeedback();
    Alert.alert(
      "About Neem",
      "Neem is a smart Chanda collection and receipt generator app designed for mandals and organizations during Indian festivals.\n\nVersion: 1.0.0\n\nDeveloped with ❤️ for the community",
      [{ text: "OK" }]
    );
  };

  const handleSupport = () => {
    handleHapticFeedback();
    Alert.alert(
      "Support",
      "Need help with the app?",
      [
        {
          text: "Email Support",
          onPress: () => Linking.openURL("mailto:support@neemapp.com"),
        },
        {
          text: "WhatsApp",
          onPress: () => Linking.openURL("https://wa.me/1234567890"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleRateApp = () => {
    handleHapticFeedback();
    Alert.alert(
      "Rate Neem",
      "If you're enjoying Neem, please consider rating us on the App Store!",
      [
        {
          text: "Rate Now",
          onPress: () => {
            // This would open the app store rating page
            Alert.alert("Thank you!", "This would open the App Store rating page in a real app.");
          },
        },
        {
          text: "Later",
          style: "cancel",
        },
      ]
    );
  };

  const handleShare = () => {
    handleHapticFeedback();
    Alert.alert(
      "Share Neem",
      "Help other mandals discover Neem!",
      [
        {
          text: "Share",
          onPress: () => {
            // This would open the native share dialog
            Alert.alert("Share", "This would open the native share dialog in a real app.");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handlePrivacy = () => {
    handleHapticFeedback();
    Alert.alert(
      "Privacy Policy",
      "Your privacy is important to us. Neem stores all donation data locally on your device and in your secure cloud database. We do not share your data with third parties.\n\nFor detailed privacy information, visit our website.",
      [
        {
          text: "Visit Website",
          onPress: () => Linking.openURL("https://neemapp.com/privacy"),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  };

  const handleTerms = () => {
    handleHapticFeedback();
    Alert.alert(
      "Terms of Service",
      "By using Neem, you agree to our terms of service. The app is provided as-is for donation management purposes.",
      [
        {
          text: "View Full Terms",
          onPress: () => Linking.openURL("https://neemapp.com/terms"),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    color = "#1A1A1A" 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
    
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="settings" size={32} color="#FF6B35" />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences</Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{donationCount || 0}</Text>
              <Text style={styles.statLabel}>Total Donations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{totalAmount || 0}</Text>
              <Text style={styles.statLabel}>Total Amount</Text>
            </View>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="star"
              title="Rate Neem"
              subtitle="Help us improve with your feedback"
              onPress={handleRateApp}
              color="#FFD700"
            />
            <SettingItem
              icon="share"
              title="Share App"
              subtitle="Tell other mandals about Neem"
              onPress={handleShare}
              color="#4CAF50"
            />
            <SettingItem
              icon="help-circle"
              title="Support"
              subtitle="Get help and contact us"
              onPress={handleSupport}
              color="#2196F3"
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="shield-checkmark"
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={handlePrivacy}
              color="#9C27B0"
            />
            <SettingItem
              icon="document-text"
              title="Terms of Service"
              subtitle="App usage terms and conditions"
              onPress={handleTerms}
              color="#FF9800"
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="information-circle"
              title="About Neem"
              subtitle="Version 1.0.0"
              onPress={handleAbout}
              color="#FF6B35"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🙏 Ganpati Bappa Morya 🙏</Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for the community
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
  
  paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  settingsGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF6B35",
    textAlign: "center",
  },
  footerSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});