import { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In — Aero Store",
  description: "Sign in to your Aero Store account.",
};

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
