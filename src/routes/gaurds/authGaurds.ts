import { store } from "@/redux/sotre";

export const requireAuthentication = (): boolean => {
    const state = store.getState();

    if (!state.user.isAuthenticated) {
        return true
    }

    return false;
};

export const requireAuthorization = (): boolean => {
    const state = store.getState();

    if (!state.user.isAuthorized) {
        return true
    }

    return false
}