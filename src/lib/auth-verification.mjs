export function sanitizeVerificationCode(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 6);
}

export function isVerificationCodeComplete(value = "") {
  return sanitizeVerificationCode(value).length === 6;
}

function getPrimaryClerkErrorMessage(error) {
  return error?.errors?.[0]?.message?.trim() || "";
}

export function getVerificationErrorMessage(
  error,
  {
    fallbackMessage = "Invalid verification code.",
    expiredMessage = "This code expired. Please request a new one.",
  } = {}
) {
  const primaryMessage = getPrimaryClerkErrorMessage(error);
  if (!primaryMessage) {
    return fallbackMessage;
  }

  if (/expired/i.test(primaryMessage)) {
    return expiredMessage;
  }

  return primaryMessage;
}

export function getAuthStatusMessage(
  status,
  {
    fallbackMessage = "Login requires additional verification.",
    needsSecondFactorMessage = "This account requires two-factor authentication. The current popup cannot complete the second step yet.",
  } = {}
) {
  if (status === "needs_second_factor") {
    return needsSecondFactorMessage;
  }

  return fallbackMessage;
}
