

/**
 * Format a date string to Indian locale format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format a time string to 12-hour format
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Generate a unique receipt ID
 */
export const generateReceiptId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `NM${timestamp}${random}`.toUpperCase();
};

/**
 * Validate mobile number (10 digits)
 */
export const isValidMobileNumber = (mobile: string): boolean => {
  return mobile.length === 10 && /^\d+$/.test(mobile);
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get current date and time in required format
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    time: now.toTimeString().split(" ")[0], // HH:MM:SS
  };
};
