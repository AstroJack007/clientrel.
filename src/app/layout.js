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
      <body>
        <Providers>
          <Header />
          <div className="pt-16">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
