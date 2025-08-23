import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as MailComposer from "expo-mail-composer";
import * as SMS from "expo-sms";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

const FESTIVALS = [
  "Ganpati Festival",
  "Holi",
  "Diwali",
  "Ram Navami",
  "Navratri",
  "Durga Puja",
  "Kali Puja",
  "Saraswati Puja",
  "Other"
];

export default function AddChandaScreen() {
  const [mandalName, setMandalName] = useState("Shree Ganesh Mandal");
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [festivalName, setFestivalName] = useState("Ganpati Festival");
  const [showFestivalPicker, setShowFestivalPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createDonation = useMutation(api.donations.create);

  const generateReceiptHTML = (receiptData: any) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-IN");
    const formattedTime = currentDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
              font-size: 
28px;
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

  const generateReceiptId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NM${timestamp}${random}`.toUpperCase();
  };

  const handleSubmit = async () => {
    if (!donorName.trim() || !amount.trim() || !mobileNumber.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const currentDate = new Date();
      const receiptId = generateReceiptId();
      
      const receiptData = {
        mandal_name: mandalName,
        donor_name: donorName.trim(),
        amount: Number(amount),
        mobile_number: mobileNumber,
        email: email.trim()
 || undefined,
        donation_date: currentDate.toISOString().split("T")[0],
        donation_time: currentDate.toTimeString().split(" ")[0],
        receipt_id: receiptId,
        festival_name: festivalName,
      };

      // Save to database
      await createDonation(receiptData);

      // Show success message and navigate to preview
      Alert.alert(
        "Success! 🎉",
        `Donation of ₹${amount} recorded successfully for ${festivalName}!\n\nReceipt ID: ${receiptId}`,
        [
          {
            text: "Preview Receipt",
            onPress: () => {
              router.push({
                pathname: "/receipt-preview",
                params: { receiptData: JSON.stringify(receiptData) },
              });
            },
          },
          {
            text: "Done",
            style: "default",
          },
        ]
      );

      // Reset form
      setDonorName("");
      setAmount("");
      setMobileNumber("");
      setEmail("");

    } catch (error) {
      console.error("Error creating donation:", error);
      Alert.alert("Error", "Failed to create donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const FestivalPicker = () => (
    <Modal
      visible={showFestivalPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFestivalPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Festival</Text>
            <TouchableOpacity
              onPress={() => setShowFestivalPicker(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.festivalList}>
            {FESTIVALS.map((festival) => (
              <TouchableOpacity
                key={festival}
                style={[
                  styles.festivalOption,
                  festivalName === festival && styles.festivalOptionSelected,
                ]}
                onPress={() => {
                  setFestivalName(festival);
                  setShowFestivalPicker(false);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text
                  style={[
                    styles.festivalOptionText,
                    festivalName === festival && styles.festivalOptionTextSelected,
                  ]}
                >
                  {festival}
                </Text>
                {festivalName === festival && (
                  <Ionicons name="checkmark" size={20} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="home" size={32} color="#FF6B35" />
            <Text style={styles.title}>Add Chanda Entry</Text>
            <Text style={styles.subtitle}>Record a new donation</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Festival Name *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowFestivalPicker(true)}
              >
                <Text style={styles.dropdownText}>{festivalName}</Text>
                <Ionicons name="chevron-down" size={20} color="#
666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mandal/Organization Name *</Text>
              <TextInput
                style={styles.input}
                value={mandalName}
                onChangeText={setMandalName}
                placeholder="Enter mandal name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Donor's Name *</Text>
              <TextInput
                style={styles.input}
                value={donorName}
                onChangeText={setDonorName}
                placeholder="Enter donor's full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount Donated (₹) *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.submitButtonText}>Creating Receipt...</Text>
              ) : (
                <>
                  <Ionicons name="receipt" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Generate Receipt</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <FestivalPicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardView: {
    flex: 1,
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
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  submitButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  modalCloseButton: {
    padding: 4,
  },
  festivalList: {
    paddingHorizontal: 20,
  },
  festivalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  festivalOptionSelected: {
    backgroundColor: "#FF6B3510",
  },
  festivalOptionText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  festivalOptionTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
});