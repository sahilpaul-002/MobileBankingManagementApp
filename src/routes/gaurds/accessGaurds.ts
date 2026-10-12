import { store } from "@/redux/sotre";
import { requireKybApproval } from "./kybGaurds";
import { requireKycApproval } from "./kycGaurds";

export const requireKycAndKybApproval = async (): Promise<boolean> => {
    const kycBlocked = await requireKycApproval();

    if (kycBlocked) {
        return true;
    }

    return requireKybApproval();
};


export const requireAdminAccess = (): boolean => {
    const state = store.getState().user;

    return !state.isAdmin && !state.isMasterAdmin;
};


export const requireAdminKycAndKybApproval =
    async (): Promise<boolean> => {
        if (requireAdminAccess()) {
            return true;
        }

        return requireKycAndKybApproval();
    };