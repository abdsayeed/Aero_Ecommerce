import { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up — Aero Store",
  description: "Create your Aero Store account.",
};

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
