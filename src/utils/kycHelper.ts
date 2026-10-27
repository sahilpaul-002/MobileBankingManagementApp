export interface KycDetails {
  kyc_status?: string;
  [key: string]: unknown;
}

export function isKycApproved(kycDetails: KycDetails | null | undefined | unknown): boolean {
  if (!kycDetails || typeof kycDetails !== "object") return false;

  const details = kycDetails as KycDetails;
  const status = details.kyc_status;

  return typeof status === "string" && status.toUpperCase() === "COMPLETED";
}