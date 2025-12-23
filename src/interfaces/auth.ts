export type User = {
    id: string;
    email: string;
    // add other fields as needed
};

export type Credentials = {
    email: string;
    password: string;
};

export type AuthState = {
    user: User | null;
    token: string | null;
};

export type AuthContextType = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    signIn: (credentials: Credentials) => Promise<void>;
    signOut: () => void;
    updateUser: (partial: Partial<User>) => void;
};