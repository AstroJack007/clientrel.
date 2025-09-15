import "./globals.css";
import Providers from "./providers";
import Header from "../../components/Header";

export const metadata = {
  title: "Xeno CRM",
  description: "Customer engagement platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <Providers>
          <Header />
          <main className="pt-16 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
