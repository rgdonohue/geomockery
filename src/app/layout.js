import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Geomockery - Synthetic Geospatial Data Generator",
  description: "Generate synthetic geospatial features for demos, testing, and learning in the browser. Configure geometry, attributes, boundaries, preview on a map, and export.",
  keywords: "synthetic geospatial data, geospatial test data, GIS, GeoJSON, shapefile, geographic information systems",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
