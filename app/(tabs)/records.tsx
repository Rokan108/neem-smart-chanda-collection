

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as MailComposer from "expo-mail-composer";
import * as SMS from "expo-sms";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Donation {
  _id: string;
  mandal_name: string;
  donor_name: string;
  amount: number;
  mobile_number: string;
  email?: string;
  donation_date: string;
  donation_time: string;
  receipt_id: string;
  festival_name?: string; // Made optional for backward compatibility
  _creationTime: number;
}

export default function RecordsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const donations = useQuery(api.donations.list);
  const totalAmount = useQuery(api.donations.getTotalAmount);
  const donationCount = useQuery(api.donations.getCount);

  const filteredDonations = donations?.filter((donation) =>
    donation.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.mobile_number.includes(searchQuery) ||
    donation.receipt_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (donation.festival_name || "General Donation").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  const generateReceiptHTML = (donation: Donation) => {
    const formattedDate = formatDate(donation.donation_date);
    const formattedTime = formatTime(donation.donation_time);
    const festivalName = donation.festival_name || "General Donation";

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
              margin-bottom
: 10px;
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
              <div class="mandal-name">${donation.mandal_name}</div>
              <div class="festival-name">Festival: ${festivalName}</div>
              <div class="receipt-title">Donation Receipt</div>
              <div class="receipt-id">Receipt ID: ${donation.receipt_id}</div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Donor Name:</span>
                <span class="detail-value">${donation.donor_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Donated:</span>
                <span class="detail-value amount">₹ ${donation.amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formattedDate}, ${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${donation.mobile_number}</span>
              </div>
              ${donation.email ? `
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${donation.email}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <div class="thank-you">🙏 Thank you for your generous contribution 🙏</div>
              <div class="blessing">towards ${festivalName}.</div>
              <div class="blessing">May the divine bless you and your family!</div>
              <div class="app-footer">Issued by Neem – Smart Chanda Collection App</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const shareIndividualReceipt = async (donation: Donation) => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const html = generateReceiptHTML(donation);
      const { uri } = await Print.printToFileAsync({ html });

      Alert.alert(
        "Share Receipt",
        `Share receipt for ${donation.donor_name}`,
        [
          {
            text: "WhatsApp",
            onPress: () => shareViaWhatsApp(uri, donation),
          },
          {
            text: "Email",
            onPress: () => shareViaEmail(uri, donation),
          },
          {
            text: "SMS",
            onPress: () => shareViaSMS(donation),
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
      console.error("Error sharing receipt:", error);
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  const shareViaWhatsApp = async (receiptUri: string, donation: Donation) => {
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

  const shareViaEmail = async (receiptUri: string, donation: Donation) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Email is not available on this device");
        return;
      }

      const festivalName = donation.festival_name || "General Donation";

      await MailComposer.composeAsync({
        recipients: donation.email ? [donation.email] : [],
        subject: `Donation Receipt - ${donation.mandal_name} - ${festivalName}`,
        body: `Dear ${donation.donor_name},\n\nThank you for your generous donation of ₹${donation.amount} to ${donation.mandal_name} for ${festivalName}.\n\nYour receipt is attached to this email.\n\nReceipt ID: ${donation.receipt_id}\n\nMay the divine bless you and your family!\n\n🙏 With gratitude 🙏`,
        attachments: [receiptUri],
      });
    } catch (error) {
      console.error("Error sharing via email:", error);
      Alert.alert("Error", "Failed to send email");
    }
  };

  const shareViaSMS = async (donation: Donation) => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "SMS is not available on this device");
        return;
      }

      const festivalName = donation.festival_name || "General Donation";
      const message = `🙏 Thank you for your donation of ₹${donation.amount} to ${donation.mandal_name} for ${festivalName}! Receipt ID: ${donation.receipt_id}. May the divine bless you!`;

      await SMS.sendSMSAsync([donation.mobile_number], message);
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

  const exportAllData = async () => {
    if (!donations || donations.length === 0) {
      Alert.alert("No Data", "No donations to export");
      return;
    }

    try {
      const html = generateExportHTML(donations);
      const { uri } = await Print.printToFileAsync({ html });
      
      Alert.alert(
        "Export Data",
        "Choose export format:",
        [
          {
            text: "Share PDF",
            onPress: () => Sharing.shareAsync(uri, {
              mimeType: "application/pdf",
              dialogTitle: "Export Donations Data",
            }),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const generateExportHTML = (donations: Donation[]) => {
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    
    const donationRows = donations
      .map(
        (donation) => `
        <tr>
          <td>${donation.donor_name}</td>
          <td>₹${donation.amount}</td>
          <td>${formatDate(donation.donation_date)}</td>
          <td>${formatTime(donation.donation_time)}</td>
          <td>${donation.festival_name || "General Donation"}</td>
          <td>${donation.mobile_number}</td>
          <td>${donation.email || "-"}</td>
          <td>${donation.receipt_id}</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Donations Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #FF6B35;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #FF6B35;
              margin-bottom: 10px;
            }
            .summary {
              display: flex;
              justify-content: space-around;
              margin: 20px 0;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
              color: #FF6B35;
            }
            .summary-label {
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #FF6B35;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Neem - Donations Report</div>
            <div>Generated on ${new Date().toLocaleDateString("en-IN")}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${donations.length}</div>
              <div class="summary-label">Total Donations</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">₹${totalAmount}</div>
              <div class="summary-label">Total Amount</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">₹${Math.round(totalAmount / donations.length)}</div>
              <div class="summary-label">Average Donation</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Festival</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Receipt ID</th>
              </tr>
            </thead>
            <tbody>
              ${donationRows}
            </tbody>
          </tabl
e>
          
          <div class="footer">
            <p>This report contains ${donations.length} donation records</p>
            <p>🙏 May the divine bless all our donors 🙏</p>
          </div>
        </body>
      </html>
    `;
  };

  const renderDonationItem = ({ item }: { item: Donation }) => (
    <View style={styles.donationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.donorName}>{item.donor_name}</Text>
          <View style={styles.festivalBadge}>
            <Text style={styles.festivalText}>{item.festival_name || "General Donation"}</Text>
          </View>
        </View>
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.donation_date)} at {formatTime(item.donation_time)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="call" size={14} color="#666" />
          <Text style={styles.detailText}>{item.mobile_number}</Text>
        </View>
        
        {item.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={14} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="receipt" size={14} color="#666" />
          <Text style={styles.receiptId}>{item.receipt_id}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => shareIndividualReceipt(item)}
        >
          <Ionicons name="share" size={16} color="#FF6B35" />
          <Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (donations === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={32} color="#FF6B35" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Records</Text>
        <Text style={styles.subtitle}>View and manage all donations</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{donationCount || 0}</Text>
          <Text style={styles.summaryLabel}>Total Donations</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₹{totalAmount || 0}</Text>
          <Text style={styles.summaryLabel}>Total Amount</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, mobile, festival, or receipt ID"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={exportAllData}>
        <Ionicons name="download" size={18} color="#FF6B35" />
        <Text style={styles.exportButtonText}>Export Data</Text>
      </TouchableOpacity>

      {/* Do
nations List */}
      {filteredDonations && filteredDonations.length > 0 ? (
        <FlatList
          data={filteredDonations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? "No matching records" : "No donations yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Start by adding your first donation"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
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
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  exportButtonText: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  donationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  donorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  festivalBadge: {
    backgroundColor: "#FF6B3515",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  festivalText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  receiptId: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
    fontFamily: "monospace",
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B3510",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});