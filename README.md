# Geomockery

![Geomockery Logo](public/logo.svg)

**Geomockery** is an AI-powered application for generating realistic mock geospatial data for testing and development purposes. Built with Next.js and leveraging modern geospatial libraries, it helps developers quickly generate custom data in various formats.

## ⚡ Features

- **Multi-format Geometry Generation**: Create points, lines, polygons with realistic properties and spatial relationships
- **Custom Attribute Definition**: Specify your own attribute schemas with AI-powered value generation
- **Multiple Input Methods**: Draw directly on the map, upload existing GeoJSON, or use the visible map area
- **Multiple Export Formats**: Download your data as GeoJSON, Shapefile, or GeoPackage
- **Visual Customization**: Control quantity, distribution, and properties of all generated features

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/geomockery.git

# Install dependencies
cd geomockery
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application in action.

## 💻 Usage

1. **Define Generation Area**: Choose to generate within the visible map, draw a custom area, or upload your own GeoJSON boundaries
2. **Configure Features**: Select geometry types, quantities, and custom attributes to generate
3. **Generate Data**: Create realistic geospatial features with one click
4. **Export Results**: Download your data in your preferred format for use in GIS applications or development

## 🧩 Technical Architecture

Geomockery is built with a modern web stack:

- **Frontend**: Next.js, React, TailwindCSS (with a brutalist design system)
- **Maps**: OpenLayers for visualization and interaction
- **Geospatial Analysis**: Turf.js for advanced spatial operations
- **Data Processing**: Custom utilities for format conversion and feature generation

## 📊 Attribute Generation

Geomockery supports the following attribute types for your generated features:

- **Nominal**: Categorical values from defined sets (e.g., land use types, facility categories)
- **Ordinal**: Ranked values with specific order (e.g., priority levels, intensity ratings)
- **Quantitative**: Numerical values with customizable ranges and distributions
- **Temporal**: Date and time values within specified ranges
- **Identifiers**: Unique IDs and reference codes following configurable patterns

## 🔄 Roadmap

- Raster data generation (elevation models, land cover)
- Advanced statistical distributions for attribute generation
- Batch mode and API for integration with other tools
- Collaborative feature creation and editing
- Support for more specialized geospatial formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT License](LICENSE)
