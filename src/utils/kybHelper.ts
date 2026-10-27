export interface KybDetails {
  bankDetails?: {
    is_verified?: boolean;
  };
  [key: string]: unknown;
}

export function isKybApproved(kybDetails: KybDetails | null | undefined | unknown): boolean {
  if (!kybDetails || typeof kybDetails !== "object") return false;

  const details = kybDetails as KybDetails;
  return details.bankDetails?.is_verified === true;
}