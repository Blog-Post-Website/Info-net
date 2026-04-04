import SignupClient from "./SignupClient";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "";

  return <SignupClient nextPath={nextPath} />;
}
