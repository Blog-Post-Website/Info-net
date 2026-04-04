import AdminLoginClient from "./AdminLoginClient";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorParam = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  return <AdminLoginClient errorParam={errorParam} />;
}
