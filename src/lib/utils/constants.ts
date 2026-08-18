export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  DOKTER: "DOKTER",
  KASIR: "KASIR",
  CUSTOMER: "CUSTOMER",
} as const;

export const INVOICE_TYPES = {
  CLINICAL: "CLINICAL",
  POS: "POS",
  MIXED: "MIXED",
} as const;

export const PAYMENT_STATUSES = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  PARTIAL_PAYMENT: "PARTIAL_PAYMENT",
  OVERDUE: "OVERDUE",
} as const;

export const APPOINTMENT_STATUSES = {
  BOOKED: "BOOKED",
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export const PET_HOTEL_STATUSES = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  MAINTENANCE: "MAINTENANCE",
  DIRTY: "DIRTY",
} as const;

export const ROOM_TYPES = {
  STANDARD: "STANDARD",
  DELUXE: "DELUXE",
  VIP: "VIP",
  LARGE: "LARGE",
} as const;

export const GROOMING_STATUSES = {
  BOOKED: "BOOKED",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const INVENTORY_STATUSES = {
  AVAILABLE: "AVAILABLE",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export const PURCHASE_ORDER_STATUSES = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export const EXPENSE_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const PROMOTION_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
  BUNDLE: "BUNDLE",
  BDAY: "BDAY",
} as const;

export const CUSTOMER_TAGS = {
  VIP: "VIP",
  REGULAR: "REGULAR",
  GUEST: "GUEST",
} as const;

export const PET_SPECIES = {
  DOG: "DOG",
  CAT: "CAT",
  BIRD: "BIRD",
  RABBIT: "RABBIT",
  FISH: "FISH",
  OTHER: "OTHER",
} as const;

export const PET_GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const LOYALTY_TIERS = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  DIAMOND: "DIAMOND",
} as const;

export const LOYALTY_POINT_TYPES = {
  EARN: "EARN",
  REDEEM: "REDEEM",
  ADJUST: "ADJUST",
} as const;

export const MEDICAL_RECORD_STATUSES = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const FEEDBACK_STATUSES = {
  PENDING: "PENDING",
  REPLIED: "REPLIED",
  CLOSED: "CLOSED",
} as const;

export const NOTIFICATION_TYPES = {
  APPOINTMENT: "APPOINTMENT",
  INVOICE: "INVOICE",
  STOCK: "STOCK",
  SYSTEM: "SYSTEM",
  REMINDER: "REMINDER",
} as const;

export const CASH_SHIFT_STATUSES = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export const PAYMENT_METHODS = {
  CASH: "CASH",
  NON_CASH: "NON_CASH",
  MIXED: "MIXED",
} as const;

export const UNIT_TYPES = {
  PIECE: "PIECE",
  KG: "KG",
  GRAM: "GRAM",
  LITER: "LITER",
  ML: "ML",
  PACK: "PACK",
  BOX: "BOX",
} as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;

export const MAX_HOLD_TRANSACTIONS = 5;

export const APPOINTMENT_DURATIONS = [
  { label: "15 menit", value: 15 },
  { label: "30 menit", value: 30 },
  { label: "45 menit", value: 45 },
  { label: "1 jam", value: 60 },
  { label: "1.5 jam", value: 90 },
  { label: "2 jam", value: 120 },
];

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

export const DURATION_OPTIONS = [
  { value: 15, label: "15 menit" },
  { value: 30, label: "30 menit" },
  { value: 45, label: "45 menit" },
  { value: 60, label: "1 jam" },
  { value: 90, label: "1.5 jam" },
  { value: 120, label: "2 jam" },
];

export const LOW_STOCK_THRESHOLD = 10;

export const CUSTOMER_TAG_OPTIONS = [
  { value: "VIP", label: "VIP" },
  { value: "REGULAR", label: "Regular" },
  { value: "NEW", label: "New" },
  { value: "BLACKLIST", label: "Blacklist" },
];

export const DASHBOARD_CHART_DAYS = 7;

export const APPOINTMENT_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

export const GROOMING_SERVICES = [
  { id: "basic", name: "Basic Grooming", duration: 60, price: 150000 },
  { id: "full", name: "Full Grooming", duration: 90, price: 250000 },
  { id: "premium", name: "Premium Package", duration: 120, price: 400000 },
];

export const PET_HOTEL_ROOM_TYPES = [
  { value: "STANDARD", label: "Standard", price: 100000 },
  { value: "DELUXE", label: "Deluxe", price: 200000 },
  { value: "VIP", label: "VIP", price: 350000 },
  { value: "LARGE", label: "Large", price: 500000 },
];

export const PET_HOTEL_LOG_TYPES = [
  { value: "FEEDING", label: "Feeding" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "NOTE", label: "Note" },
] as const;

export const INVOICE_PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "NON_CASH", label: "Non-Cash (Transfer/QRIS)" },
  { value: "MIXED", label: "Mixed" },
];

export const FEEDBACK_CHANNELS = [
  { value: "IN_APP", label: "In-App" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "MANUAL", label: "Manual" },
];

export const EXPENSE_CATEGORIES = [
  { value: "RENT", label: "Rent" },
  { value: "SALARY", label: "Salary" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "MARKETING", label: "Marketing" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "OTHER", label: "Other" },
];

export const REPORT_TYPES = [
  { value: "revenue", label: "Revenue", icon: "BarChart3" },
  { value: "profit-loss", label: "Profit & Loss", icon: "DollarSign" },
  { value: "inventory", label: "Inventory Valuation", icon: "Package" },
  { value: "appointments", label: "Appointments", icon: "Calendar" },
  { value: "customers", label: "Customers", icon: "Users" },
  { value: "pets", label: "Pets", icon: "PawPrint" },
  { value: "pos", label: "POS", icon: "ShoppingCart" },
  { value: "invoices", label: "Invoices", icon: "Receipt" },
  { value: "pet-hotel", label: "Pet Hotel", icon: "Home" },
  { value: "grooming", label: "Grooming", icon: "Scissors" },
  { value: "loyalty", label: "Loyalty", icon: "Award" },
  { value: "expenses", label: "Expenses", icon: "Wallet" },
  { value: "activity", label: "Activity", icon: "Activity" },
  { value: "audit", label: "Audit Log", icon: "FileText" },
] as const;

export const SETTING_KEYS = {
  CLINIC_NAME: "clinic.name",
  CLINIC_LOGO_URL: "clinic.logo_url",
  CLINIC_ADDRESS: "clinic.address",
  CLINIC_OPERATING_HOURS: "clinic.operating_hours",
  CLINIC_TIMEZONE: "clinic.timezone",
  NUMBERING_INVOICE_PREFIX: "numbering.invoice_prefix",
  NUMBERING_MEDICAL_RECORD_PREFIX: "numbering.medical_record_prefix",
  NUMBERING_BOOKING_PREFIX: "numbering.booking_prefix",
  NUMBERING_GROOMING_PREFIX: "numbering.grooming_prefix",
  NUMBERING_PO_PREFIX: "numbering.po_prefix",
  SECURITY_PIN_LENGTH: "security.pin_length",
  SECURITY_MAX_LOGIN_ATTEMPTS: "security.max_login_attempts",
  SECURITY_LOCKOUT_DURATION_MINUTES: "security.lockout_duration_minutes",
  LOYALTY_POINT_VALUE: "loyalty.point_value",
  LOYALTY_MIN_TRANSACTION_FOR_POINTS: "loyalty.min_transaction_for_points",
  TAX_DEFAULT_RATE: "tax.default_rate",
  TAX_ENABLED: "tax.enabled",
} as const;
