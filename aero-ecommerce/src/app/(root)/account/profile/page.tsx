import { getProfile } from "@/lib/actions/account";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const result = await getProfile();

  if ("error" in result) {
    return <p className="text-[var(--color-red)]">{result.error}</p>;
  }

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Profile</h1>
      <ProfileForm name={result.data.name ?? ""} email={result.data.email} />
    </div>
  );
}
