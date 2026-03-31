import { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up — Aero Store",
  description: "Create your Aero Store account.",
};

type Props = { searchParams: Promise<{ redirect?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  return <AuthForm mode="sign-up" redirectTo={redirect} />;
}
