

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as MailComposer from "expo-mail-composer";
import * as SMS from "expo-sms";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface ReceiptData {
  mandal_name: string;
  donor_name: string;
  amount: number;
  mobile_number: string;
  email?: string;
  donation_date: string;
  donation_time: string;
  receipt_id: string;
  festival_name: string;
}

export default function ReceiptPreviewScreen() {
  const params = useLocalSearchParams();
  const receiptData: ReceiptData = JSON.parse(params.receiptData as string);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const generateReceiptHTML = (receiptData: ReceiptData) => {
    const currentDate = new Date();
    const formattedDate = formatDate(receiptData.donation_date);
    const formattedTime = formatTime(receiptData.donation_time);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Donation Receipt</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .receipt {
              background: white;
 
             max-width: 400px;
              margin: 0 auto;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              border: 2px solid #FF6B35;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #FF6B35;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .mandal-name {
              font-size: 24px;
              font-weight: bold;
              color: #FF6B35;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .festival-name {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 10px;
              background: #FF6B3515;
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
            }
            .receipt-title {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .receipt-id {
              font-size: 12px;
              color: #999;
              font-family: monospace;
              background: #f0f0f0;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .details {
              margin: 25px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 15px 0;
              padding: 12px 0;
              border-bottom: 2px dotted #ddd;
            }
            .detail-label {
              font-weight: 700;
              color: #333;
              font-size: 16px;
            }
            .detail-value {
              color: #666;
              text-align: right;
              font-size: 16px;
            }
            .amount {
              font-size: 28px;
              font-weight: bold;
              color: #FF6B35;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 3px solid #FF6B35;
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            .thank-you {
              font-weight: 700;
              color: #FF6B35;
              margin-bottom: 12px;
              font-size: 18px;
            }
            .blessing {
              font-size: 16px;
              color: #333;
              margin: 8px 0;
            }
            .app-footer {
              font-size: 12px;
              color: #999;
              margin-top: 15px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="mandal-name">${receiptData.mandal_name}</div>
              <div class="festival-name">Festival: ${receiptData.festival_name}</div>
              <div class="receipt-title">Donation Receipt</div>
              <div class="receipt-id">Receipt ID: ${receiptData.receipt_id}</div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Donor Name:</span>
                <span class="detail-value">${receiptData.donor_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Donated:</span>
                <span class="detail-value amount">₹ ${receiptData.amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formattedDate}, ${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${receiptData.mobile_number}</span>
              </div>
              ${receiptData.email ? `
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${receiptData.email}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <div class="thank-you">🙏 Thank you for your generous contribution 🙏</div>
              <div class="blessing">towards ${receiptData.festival_name}.</div>
              <div class="blessing">May the divine bless you and your family!</div>
              <div class="app-footer">Issued by Neem – Smart Chanda Collection App</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const html = generateReceiptHTML(receiptData);
      const { uri } = await Print.printToFileAsync({ html });

      Alert.alert(
        "Share Receipt",
        "How would you like to share the receipt?",
        [
          {
            text: "WhatsApp",
            onPress: () => shareViaWhatsApp(uri),
          },
          {
            text: "Email",
            onPress: () => shareViaEmail(uri),
          },
          {
            text: "SMS",
            onPress: () => shareViaSMS(),
          },
          {
            text: "Other Apps",
            onPress: () => shareViaOtherApps(uri),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error generating receipt:", error);
      Alert.alert("Error", "Failed to generate receipt");
    }
  };

  const handleSave = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const html = generateReceiptHTML(receiptData);
      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Save Receipt",
      });
    } catch (error) {
      console.error("Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt");
    }
  };

  const shareViaWhatsApp = async (receiptUri: string) => {
    try {
      await Sharing.shareAsync(receiptUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt via WhatsApp",
      });
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      Alert.alert("Error", "Failed to share via WhatsApp");
    }
  };

  const shareViaEmail = async (receiptUri: string) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Email is not available on this device");
        return;
      }

      await MailComposer.composeAsync({
        recipients: receiptData.email ? [receiptData.email] : [],
        subject: `Donation Receipt - ${receiptData.mandal_name} - ${receiptData.festival_name}`,
        body: `Dear ${receiptData.donor_name},\n\nThank you for your generous donation of ₹${receiptData.amount} to ${receiptData.mandal_name} for ${receiptData.festival_name}.\n\nYour receipt is attached to this email.\n\nReceipt ID: ${receiptData.receipt_id}\n\nMay the divine bless you and your family!\n\n🙏 With gratitude 🙏`,
        attachments: [receiptUri],
      });
    } catch (error) {
      console.error("Error sharing via email:", error);
      Alert.alert("Error", "Failed to send email");
    }
  };

  const shareViaSMS = async () => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "SMS is not available on this device");
        return;
      }

      const message = `🙏 Thank you fo
r your donation of ₹${receiptData.amount} to ${receiptData.mandal_name} for ${receiptData.festival_name}! Receipt ID: ${receiptData.receipt_id}. May the divine bless you!`;

      await SMS.sendSMSAsync([receiptData.mobile_number], message);
    } catch (error) {
      console.error("Error sending SMS:", error);
      Alert.alert("Error", "Failed to send SMS");
    }
  };

  const shareViaOtherApps = async (receiptUri: string) => {
    try {
      await Sharing.shareAsync(receiptUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.title}>Receipt Preview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.receiptContainer}>
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <Text style={styles.mandalName}>{receiptData.mandal_name}</Text>
              <View style={styles.festivalBadge}>
                <Text style={styles.festivalText}>Festival: {receiptData.festival_name}</Text>
              </View>
              <Text style={styles.receiptTitle}>Donation Receipt</Text>
              <Text style={styles.receiptId}>Receipt ID: {receiptData.receipt_id}</Text>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Donor Name:</Text>
                <Text style={styles.detailValue}>{receiptData.donor_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Donated:</Text>
                <Text style={[styles.detailValue, styles.amount]}>₹ {receiptData.amount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(receiptData.donation_date)}, {formatTime(receiptData.donation_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact:</Text>
                <Text style={styles.detailValue}>{receiptData.mobile_number}</Text>
              </View>
              {receiptData.email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{receiptData.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.thankYou}>🙏 Thank you for your generous contribution 🙏</Text>
              <Text style={styles.blessing}>towards {receiptData.festival_name}.</Text>
              <Text style={styles.blessing}>May the divine bless you and your family!</Text>
              <Text style={styles.appFooter}>Issued by Neem – Smart Chanda Collection App</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="download" size={20} color="#666" />
          <Text style={styles.saveButtonText}>Save Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share" size={20} color="#FFFFFF" />
          
<Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  receiptContainer: {
    padding: 20,
  },
  receipt: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FF6B35",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  receiptHeader: {
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#FF6B35",
    paddingBottom: 20,
    marginBottom: 25,
  },
  mandalName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  festivalBadge: {
    backgroundColor: "#FF6B3515",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  festivalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  receiptTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  receiptId: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  details: {
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E5EA",
    borderStyle: "dotted",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
    flex: 1,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  footer: {
    alignItems: "center",
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 3,
    borderTopColor: "#FF6B35",
  },
  thankYou: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: 8,
    textAlign: "center",
  },
  blessing: {
    fontSize: 14,
    color: "#333",
    marginVertical: 4,
    textAlign: "center",
  },
  appFooter: {
    fontSize: 12,
    color: "#999",
    marginTop: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});