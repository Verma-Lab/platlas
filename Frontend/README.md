# Genomics Frontend

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Components](#components)
- [Pages](#pages)
- [Utilities](#utilities)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

## Introduction
The **Genomics Frontend** is a React-based web interface for exploring Genome-Wide Association Studies (GWAS) and Phenome-Wide Association Studies (PheWAS) data. It includes dynamic charts, tables, and filtering tools to visualize genomic data efficiently.

## Features

- **Dynamic Visualization**: Manhattan plots, QQ plots, and PheWAS plots.
- **Interactive UI**: Filter, search, and navigate GWAS/PheWAS results seamlessly.
- **Modular Components**: Well-structured components for reusability and scalability.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Integration**: Connects seamlessly with the backend API.

## Technologies Used

- **React.js**: Core library for building the UI.
- **React Bootstrap**: UI components for faster development.
- **React Router**: Navigation and routing.
- **Lucide Icons**: Modern icons for UI.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **React Hooks**: State and lifecycle management.

## Project Structure

```plaintext
src/
├── components/         # Reusable UI components
│   ├── CohortFilters.js
│   ├── OptionBar.js
│   ├── SearchBar.js
│   └── RelatedPhenotypesSidebar.js
│
├── pages/              # Page components for routing
│   ├── HomePage.js
│   ├── GWASPage.js
│   ├── PhewasPage.js
│   ├── AboutPage.js
│   ├── ContactPage.js
│   └── DocumentationPage.js
│
├── plots/              # Visualization components
│   ├── Manhattan.js
│   ├── QQ.js
│   ├── PheWASPlot.js
│   └── TopResults.js
│
├── util/               # Utility functions
│   ├── Enums.js
│   ├── gwas_data_pipeline.py
│   └── jsontocsv.py
│
├── ui/                 # UI components
│   └── cards.js
│
├── App.js              # Main React app
├── RoutesPage.js       # Routing configuration
├── index.js            # Entry point for React
└── styles/             # Global and component-level styles
```

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/genomics-frontend.git
   cd genomics-frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Running the Project

Start the development server:
```bash
npm start
```
The app will run at `http://localhost:3000`.

## Components

### Key Components

- **CohortFilters**: Filter options based on cohorts.
- **OptionBar**: Toolbar with customizable options.
- **SearchBar**: Global search functionality.
- **RelatedPhenotypesSidebar**: Sidebar to display related phenotypes dynamically.

### Plots

- **Manhattan Plot**: Displays GWAS results visually.
- **QQ Plot**: Visualizes observed vs. expected p-values.
- **PheWAS Plot**: Displays associations for a selected SNP.
- **Top Results**: Displays a table of significant associations.

## Pages

### Key Pages

- **HomePage**: Overview with stats and search options.
- **GWASPage**: Displays GWAS analysis results for selected phenotypes.
- **PheWASPage**: Shows PheWAS results for selected SNPs.
- **AboutPage**: Information about the project.
- **ContactPage**: Contact form for user inquiries.
- **DocumentationPage**: User guide and API documentation.

## Utilities

- **Enums.js**: Define constants for cohort and phenotype management.
- **gwas_data_pipeline.py**: Data processing pipeline for GWAS results.
- **jsontocsv.py**: Converts JSON results to CSV format for download.

## Contribution

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push and create a pull request:
   ```bash
   git push origin feature/your-feature
   ```

## License

This project is licensed under the [MIT License](LICENSE).

