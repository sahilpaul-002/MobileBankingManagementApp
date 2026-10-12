import { kycApis } from "@/redux/features/kyc/kycApis";
import { store } from "@/redux/sotre";
import { isKycApproved } from "@/utils/kycHelper";

export const requireKycApproval = async (): Promise<boolean> => {
    const state = store.getState();
    const email = state.user.email;

    if (!email) {
        return true;
    }

    const result = await store.dispatch(
        kycApis.endpoints.getKycDetails.initiate({ email }),
    );

    if (result.isError || !result.data?.data) {
        return true;
    }

    return !isKycApproved(result.data.data);
};