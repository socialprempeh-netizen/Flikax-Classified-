import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ tab?: string; category?: string }>;
};

export default async function MyAdvertsRedirectPage({ searchParams }: PageProps) {
  const { tab, category } = await searchParams;
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (category) params.set("category", category);
  const query = params.toString();
  redirect(query ? `/dashboard?${query}` : "/dashboard");
}
