import { userApis } from "@/redux/features/user/userApis";
import { store } from "@/redux/sotre";
import { isKybApproved } from "@/utils/kybHelper";

export const requireKybApproval = async (): Promise<boolean> => {
    const state = store.getState();
    const email = state.user?.email;

    if (!email) {
        return true;
    }

    const result = await store.dispatch(
        userApis.endpoints.getUserOnboardingDetails.initiate({ email }),
    );

    if (result.isError || !result.data?.data) {
        return true;
    }

    return !isKybApproved(result.data.data);
};