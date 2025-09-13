import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Xeno CRM",
  description: "Customer engagement platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
