import { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In — Aero Store",
  description: "Sign in to your Aero Store account.",
};

type Props = { searchParams: Promise<{ redirect?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  return <AuthForm mode="sign-in" redirectTo={redirect} />;
}
