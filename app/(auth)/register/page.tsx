import type { Metadata } from "next";

import { RegisterForm } from "@/app/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
