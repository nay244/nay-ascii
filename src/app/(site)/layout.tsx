import { Header } from "@/components/Header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="main">{children}</main>
    </>
  );
}
