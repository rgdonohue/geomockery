import "./globals.css";

export const metadata = {
  title: "Geomockery - Synthetic Geospatial Data Generator",
  description: "Generate synthetic geospatial features for demos, testing, and learning in the browser. Configure geometry, attributes, boundaries, preview on a map, and export.",
  keywords: "synthetic geospatial data, geospatial test data, GIS, GeoJSON, shapefile, geographic information systems",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
