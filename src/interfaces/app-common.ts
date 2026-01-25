export const AppConstant = {
    APP_NAME: "Personal Finance Manager",
    VERSION: "1.0.0",
    STORAGE_KEY: "pf:auth",
    DATA: {
        DEFAULT_CURRENCY: "USD",
        AUTH_STATE: {
            INITIAL_SESSION: "INITIAL_SESSION",
            PASSWORD_RECOVERY: "PASSWORD_RECOVERY",
            SIGNED_IN: "SIGNED_IN",
            SIGNED_OUT: "SIGNED_OUT",
            TOKEN_REFRESHED: "TOKEN_REFRESHED",
            USER_UPDATED: "USER_UPDATED",
        }
    }
}

export interface State<T> {
    data: T | null,
    errors: string[] | null,
    loading: boolean
}