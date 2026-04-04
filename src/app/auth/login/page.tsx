import LoginClient from "./LoginClient";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/";

  return <LoginClient nextPath={nextPath} />;
}
