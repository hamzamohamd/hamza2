import { GoogleGenAI } from "@google/genai";
import { type Campaign, type User, type Donation } from "./types";

// User state simulation (until persistence is fully hooked up)
export const getActiveUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const login = async (username: string, password: string): Promise<User | null> => {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  }
  return null;
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const res = await fetch("/api/campaigns");
  return await res.json();
};

export const makeDonation = async (donation: Partial<Donation>) => {
  const res = await fetch("/api/donate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donation),
  });
  return await res.json();
};

export const getStats = async () => {
  const res = await fetch("/api/stats");
  return await res.json();
};
