export enum UserVerifyStatus {
  Unverified = 'Unverified',
  Verified = 'Verified',
  Celerity = 'Celerity',
  Banned = 'Banned'
}

export enum UserGenderType {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum CourseStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Blacklisted = 'Blacklisted'
}

export enum EnrollmentStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed'
}

export enum CouponPropertiesType {
  Percentage = 'Percentage',
  Fixed = 'Fixed'
}

export enum CourseLevelType {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  AllLevels = 'AllLevels'
}

export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  ForgotPasswordToken = 'ForgotPasswordToken',
  OTPVerify = 'OTPVerifyToken'
}

export enum UserRole {
  Admin = 'Admin',
  Instructor = 'Instructor',
  Student = 'Student',
  Guest = 'Guest'
}

export enum OrderStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Canceled = 'Canceled'
}

export enum PaymentMethod {
  Cash = 'Cash',
  CreditCard = 'CreditCard',
  PayPal = 'PayPal',
  BankTransfer = 'BankTransfer',
  Other = 'Other',
  MoMo = 'MoMo'
}

export enum RefTypeEnum {
  COURSE = 'course',
  TOPIC = 'topic',
  LESSON = 'lesson'
}

export enum OtpVerifyType {
  EmailVerification = 'email_verification',
  PasswordReset = 'password_reset'
}

export enum CartSourceItemType {
  WEBSITE = 'web',
  MOBILE = 'mobile'
}

export enum CartItemStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired'
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}
