import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/interfaces/profile";
import { cn } from "@/lib/utils";
import { useAppDispatch, type RootState } from "@/store";
import { getUser } from "@/store/auth";
import { clearCountries, getCountries } from "@/store/country";
import { clearProfile, getProfile, updateProfile } from "@/store/profile";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProfilePage() {

  const { data: profile } = useSelector((state: RootState) => state.profile);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const { data: countries } = useSelector((state: RootState) => state.country);
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState(true);
  const [countryId, setCountryId] = useState(profile?.country_id?.toString() ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(getCountries());
    return () => {
      dispatch(clearCountries());
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      dispatch(getProfile(user.id));
    }
    return () => {
      dispatch(clearProfile());
    }
  }, [dispatch, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profile) {
      try {
        const payload: Profile = {
          id: profile.id || user.id,
          email: profile.email,
          last_name: profile.last_name,
          first_name: profile.first_name,
          phone_number: phoneNumber || "",
          profile_picture: "",
          country_id: countryId
        }
        await dispatch(updateProfile(payload)).unwrap();
        setViewMode(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      {viewMode &&
        <div id="profile-info">
          <h1 className="mb-3">Hi {profile?.first_name} {profile?.last_name}</h1>
          <p className="mb-1">Email: {profile?.email}</p>
          <p className="mb-1">Phone: {profile?.phone_number || ""}</p>
          <p className="mb-1">Country: {profile?.country?.name}</p>
          <Button variant="ghost" className="py-2" onClick={() => setViewMode(false)}>Edit Profile</Button>
        </div>
      }
      {!viewMode &&
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="lastName" className="text-sm block">Last Name<sup className="text-rose-600">*</sup></Label>
          <Input
            id="lastName"
            type="text"
            value={profile?.last_name}
            readOnly
            className={cn("mt-1 block w-full rounded border px-3 py-2")}
          />
          <Label htmlFor="firstName" className="text-sm block">First Name<sup className="text-rose-600">*</sup></Label>
          <Input
            id="firstName"
            type="text"
            value={profile?.first_name}
            readOnly
            className={cn("mt-1 block w-full rounded border px-3 py-2")}
          />
          <Label htmlFor="email" className="text-sm block">Email<sup className="text-rose-600">*</sup></Label>
          <Input
            id="email"
            type="email"
            value={profile?.email}
            readOnly
            className={cn("mt-1 block w-full rounded border px-3 py-2")}
          />
          <Label htmlFor="phoneNumber" className="text-sm block">Phone Number</Label>
          <Input
            id="email"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.trim())}
            className={cn("mt-1 block w-full rounded border px-3 py-2")}
          />
          <Label htmlFor="country" className="text-sm block">Country<sup className="text-rose-600">*</sup></Label>
          <Select
            name="country"
            required value={countryId}
            onValueChange={(value) => setCountryId(value)}>
            <SelectTrigger className="w-100">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((c) => (
                <SelectItem key={c.id} value={(c.id).toString()} >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="py-2 mr-2 rounded"> Update Profile</Button>
          <Button variant="outline" className="py-2" onClick={() => setViewMode(true)}> Cancel</Button>
        </form>
      }
    </>
  );
}