import type { Country } from "./country";

export interface Profile {
    id: string;
    email: string;
    last_name: string;
    first_name: string;
    phone_number: string;
    profile_picture: string;
    country_id: string;
    created_at?: string;
    updated_at?: string;
    country?: Country;
}
