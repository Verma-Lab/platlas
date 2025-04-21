# PLATLAS: PLeiotropic ATLAS

<div align="center">
  <img src="/Frontend/public/images/platypushomepage.png" alt="PLATLAS Logo" width="400"/>
  <br/>
  <h3>A Comprehensive Multi-Ancestry Genome-Wide Association Browser</h3>
</div>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT">
  </a>
  <a href="#data-format">
    <img src="https://img.shields.io/badge/format-JSON-brightgreen.svg" alt="Format: JSON">
  </a>
  <a href="#development-status">
    <img src="https://img.shields.io/badge/status-in%20development-yellow.svg" alt="Status: In Development">
  </a>
  <a href="#version">
    <img src="https://img.shields.io/badge/version-1.0.0--beta-orange.svg" alt="Version: 1.0.0-beta">
  </a>
  <a href="https://github.com/yourusername/platlas/issues">
    <img src="https://img.shields.io/github/issues/yourusername/platlas.svg" alt="GitHub Issues">
  </a>
</p>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Data Structure](#data-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Home Page](#home-page)
  - [GWAS Analysis](#gwas-analysis)
  - [PheWAS Analysis](#phewas-analysis)
  - [Population Comparison](#population-comparison)
  - [Downloads](#downloads)
- [API Reference](#api-reference)
- [Component Documentation](#component-documentation)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [Team and Institutions](#team-and-institutions)
- [Licensing](#licensing)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Overview

**PLATLAS** (**PL**eiotropic **ATLAS**) is a specialized web application designed for exploring and analyzing genome-wide association meta-analyses across diverse populations. The platform integrates data from up to 1,678 traits and diseases from major biobanks worldwide:

- Million Veteran Program (MVP)
- UK Biobank (UKB)
- FinnGen
- Biobank Japan (BBJ)
- Tohoku Medical Megabank (ToMMo)
- Korean Genome and Epidemiology Study (KoGES)

PLATLAS provides researchers and clinicians with interactive tools to explore genetic associations, compare findings across different ancestral populations, and investigate the genetic architecture of complex traits and diseases.

## Features

### GWAS Analysis
- **Interactive Manhattan Plots**: Visualize genome-wide association results with dynamic filtering and zooming capabilities
- **QQ Plots**: Assess the statistical validity of GWAS results with quantile-quantile plots
- **P-value Filtering**: Dynamically filter results based on significance thresholds
- **Lead Variant Identification**: Automatically identify and display the most significant variants

### PheWAS Analysis
- **Phenome-Wide Visualization**: Explore the associations between a specific genetic variant and multiple phenotypes
- **Category-Based Coloring**: Identify patterns across different disease/trait categories
- **Interactive Data Tables**: Sort, filter, and explore detailed results

### Population Comparison (Hudson Plots)
- **Side-by-Side Manhattan Plots**: Compare genetic associations across different ancestral populations
- **Ancestry-Specific Analysis**: Examine population-specific genetic effects
- **Study Type Selection**: Compare results between different statistical approaches (GWAMA and MR-MEGA)

### Data Management
- **Summary Statistics Download**: Access and download complete association statistics
- **File Format Options**: Multiple file formats for compatibility with various analysis tools
- **Result Caching**: Efficient data retrieval for repeated analyses

### User Interface
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Intuitive Navigation**: Easy-to-use interface requiring minimal training
- **Interactive Tooltips**: Contextual help and information throughout the application
- **Related Phenotype Suggestions**: Discover connected traits and diseases

## Architecture

### Frontend

The frontend is built using React.js with a component-based architecture focused on performance and reusability.

#### Key Technologies
- **React.js**: Core library for building the user interface
- **React Router**: Client-side routing for seamless navigation
- **Recharts**: Data visualization library for interactive plots
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library
- **React Bootstrap**: UI component library

#### Directory Structure
```
client/
├── public/                 # Static assets
│   ├── images/             # Application images and logos
│   └── favicon.ico         # Site favicon
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── NavigationBar/  # Global navigation
│   │   ├── LeadVariantStats/ # Lead variant component
│   │   ├── OptionBar/      # Filter options
│   │   ├── QQPlotView/     # QQ plot visualization
│   │   ├── RelatedPhenotypesSidebar/ # Sidebar for related phenotypes
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.js     # Main search page
│   │   ├── GWASPage.js     # GWAS analysis page
│   │   ├── PhewasPage.js   # PheWAS analysis page
│   │   ├── AboutPage.js    # Team and project information
│   │   ├── Downloads.js    # Data download page
│   │   └── ...
│   ├── plots/              # Data visualization components
│   │   ├── Manhattan.js    # Manhattan plot component
│   │   ├── QQ.js           # QQ plot component
│   │   ├── Hudson.js       # Population comparison plot
│   │   ├── TopResults.js   # Top results table
│   │   └── PheWASPlot.js   # PheWAS plot component
│   ├── routes/             # Application routes
│   ├── styles/             # Global style definitions
│   ├── utils/              # Utility functions
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
└── package.json            # Dependencies and scripts
```

#### Core Components

**GWASPage.js**
- Central component for GWAS analysis
- Manages state for data fetching, filtering, and visualization
- Contains nested components:
  - Manhattan plot
  - QQ plot
  - Top results table
  - Hudson plots
  - Stats bar
  - Study and cohort selectors

**PheWASPage.js**
- Handles phenome-wide association study visualization
- Shows associations between a specific SNP and multiple phenotypes
- Features interactive table for exploring detailed results

**Manhattan.js**
- Implements the interactive Manhattan plot visualization
- Supports highlighting of significant variants
- Provides zooming and panning capabilities
- Handles click events for navigating to PheWAS

**StatsBar Component**
- Displays key statistics about the current analysis
- Shows SNP count, sample size, and lead variant information
- Includes download functionality for summary statistics

### Backend

The backend is built using Node.js with Express.js, providing a RESTful API for data retrieval and processing.

#### Key Technologies
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **File-based Storage**: Direct access to data files
- **Debug**: Debugging utility
- **Logger**: Customized logging system

#### Directory Structure
```
server/
├── config/                # Configuration files
│   └── constants.js       # System-wide constants
├── controllers/           # Request handlers
│   ├── gwasController.js  # GWAS data handlers
│   ├── phewasController.js # PheWAS data handlers
│   ├── phenotypeController.js # Phenotype data handlers
│   └── ...
├── routes/                # API routes
│   └── index.js           # Route definitions
├── services/              # Business logic
│   └── phenotypeService.js # Phenotype-related services
├── utils/                 # Utility functions
│   └── logger.js          # Logging utility
├── app.js                 # Application entry point
└── package.json           # Dependencies and scripts
```

#### API Routes

The `routes/index.js` file defines the following endpoints:

- `/getRelatedPhenotypes`: Get phenotypes related to a specific phenotype
- `/getGWASMetadata`: Retrieve metadata for GWAS studies
- `/queryGWASData`: Get GWAS data for a specific phenotype and cohort
- `/getTopResults`: Retrieve top significant variants
- `/getLeadVariants`: Get lead variants for a phenotype
- `/phewas`: Get phenome-wide associations for a specific variant
- `/findfiles`: Check availability of data files for a phenotype
- `/getPhenotypeStats/:phenoId`: Get statistics for a specific phenotype
- `/getPhenotypeMapping`: Get phenotype category mappings
- `/getManhattanPlot`: Get pre-rendered Manhattan plot image
- `/getQQPlot`: Get pre-rendered QQ plot image
- `/getSNPAnnotation`: Get annotation information for a specific SNP

### Data Structure

PLATLAS uses a file-based data storage system optimized for large-scale genomic data:

#### File Organization
- **GWAS Data**: Organized by phenotype, population, and study type
  - Format: `[phenoId].[cohortId].[studyType]_pval_up_to_[threshold].gz`
  - Example: `body_mass_index.EUR.gwama_pval_up_to_1e-05.gz`
- **QQ Plots**: Pre-rendered plot images for quick loading
  - Format: `[phenoId].[cohortId].[studyType].sumstats.txt.png`
- **Manhattan Plots**: Pre-rendered plot images
  - Format: `[plotType]_[phenoId].[cohortId].[studyType]_pval_up_to_0.1.png`

#### Data Access Patterns
- **Dynamic Filtering**: Server-side filtering based on p-value thresholds
- **Caching**: Client-side caching of retrieved data for improved performance
- **Lazy Loading**: Data is loaded only when needed to minimize memory usage

## Installation

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn package manager
- Git
- Access to the genomic data files (not included in the repository)

### Setting Up the Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/platlas.git
   cd platlas
   ```

2. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../client
   npm install
   ```

4. **Set up data directories**:
   - Create a directory for GWAS data files
   - Set up appropriate permissions for file access

### Configuration

1. **Backend Configuration**:
   Create a `.env` file in the server directory with the following settings:
   ```
   PORT=5001
   NODE_ENV=development
   GWAS_FILES_PATH=/path/to/your/gwas/files
   DEBUG=app:*
   LOG_LEVEL=info
   ```

2. **Frontend Configuration**:
   Create a `.env` file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_VERSION=1.0.0
   ```

3. **Data Files Setup**:
   The application expects data files to be organized in a specific structure:
   ```
   /path/to/your/gwas/files/
   ├── [phenoId].[cohortId].gwama_pval_up_to_1e-05.gz
   ├── [phenoId].[cohortId].mrmega_pval_up_to_1e-05.gz
   └── ...
   ```

## Usage

### Running the Application

1. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**:
   ```bash
   cd client
   npm start
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### Home Page

The home page provides a search interface for exploring available phenotypes:

1. Use the search bar to find phenotypes by name or ID
2. Browse phenotypes by category using the category filters
3. Click on a phenotype card to navigate to its GWAS analysis page

### GWAS Analysis

The GWAS Analysis page (`/gwas/:phenoId`) displays genetic associations for a specific phenotype:

1. **Study Selection**:
   - Choose between GWAMA (population-specific) or MR-MEGA (multi-ancestry meta-analysis)
   - For GWAMA, select a specific ancestral population (EUR, AFR, EAS, AMR, SAS)

2. **P-value Filtering**:
   - Set minimum and maximum p-value thresholds in -log10(p) format
   - Apply filters to focus on variants of interest

3. **Manhattan Plot Navigation**:
   - View genome-wide associations with chromosomal positions on the x-axis and -log10(p) values on the y-axis
   - Click on a significant point to navigate to its PheWAS analysis
   - Horizontal line indicates significance threshold

4. **Top Results Table**:
   - View detailed information about the most significant variants
   - Sort by chromosome, position, p-value, etc.
   - Click on a phenotype to navigate to its GWAS page

5. **QQ Plot**:
   - Assess the distribution of observed vs. expected p-values
   - Identify potential inflation or deflation in test statistics

6. **Ancestry Comparison (Hudson Plot)**:
   - Compare genetic associations between two selected populations
   - Identify population-specific or shared genetic effects

7. **Data Download**:
   - Download summary statistics for further analysis
   - Choose between .gz and .gz.tbi file formats

### PheWAS Analysis

The PheWAS Analysis page (`/phewas`) shows phenotype associations for a specific variant:

1. **Variant Information**:
   - View details about the selected variant (chromosome, position, alleles)
   - See gene annotation and rsID when available

2. **PheWAS Plot**:
   - Visualize associations between the variant and multiple phenotypes
   - Different colors represent different phenotype categories
   - Horizontal line indicates significance threshold

3. **SNP Details Table**:
   - Browse detailed association statistics
   - Sort and filter results
   - Click on phenotypes to navigate to their GWAS pages

### Population Comparison

The Hudson plots allow comparison of genetic associations across different ancestral populations:

1. Select the top and bottom populations to compare
2. View side-by-side Manhattan plots
3. Identify shared and population-specific genetic effects
4. Compare effect sizes and significance levels

### Downloads

The Downloads page provides access to downloadable data files:

1. **Summary Statistics**:
   - Download complete association statistics for specific phenotypes
   - Choose specific populations and study types
   - Available in compressed formats for efficient transfer

2. **Documentation**:
   - Access file format specifications
   - View usage guidelines and best practices

## API Reference

### Core Endpoints

#### Get GWAS Data
```
GET /api/queryGWASData
```
Parameters:
- `cohortId` (string): Ancestral population ID (EUR, AFR, EAS, AMR, SAS, ALL)
- `phenoId` (string): Phenotype identifier
- `study` (string): Study type (gwama, mrmega)
- `minPval` (number, optional): Minimum significance threshold (-log10(p))
- `maxPval` (number, optional): Maximum significance threshold (-log10(p))

Response:
```json
{
  "data": {
    "1": [
      {"id": "rs12345", "pos": 1000000, "p": 5e-8, "log10p": 7.3},
      ...
    ],
    "2": [
      ...
    ],
    ...
  },
  "pValueRange": {
    "minLog10P": 5,
    "maxLog10P": 30
  }
}
```

#### Get PheWAS Data
```
GET /api/phewas
```
Parameters:
- `snp` (string): SNP identifier
- `chromosome` (string): Chromosome number
- `position` (number): Base pair position
- `study` (string): Study type (gwama, mrmega)

Response:
```json
{
  "plot_data": [
    {
      "phenotype": "body_mass_index",
      "chromosome": "1",
      "position": 1000000,
      "pvalue": 5e-8,
      "ref_allele": "A",
      "alt_allele": "G"
    },
    ...
  ]
}
```

#### Get Top Results
```
GET /api/getTopResults
```
Parameters:
- `cohortId` (string): Ancestral population ID
- `phenoId` (string): Phenotype identifier
- `study` (string): Study type (gwama, mrmega)

Response:
```json
[
  {
    "trait": {
      "category": "Anthropometric",
      "name": "body_mass_index"
    },
    "chromosome": "1",
    "position": 1000000,
    "ref_allele": "A",
    "alt_allele": "G",
    "pvalue": 5e-8
  },
  ...
]
```

#### Check File Availability
```
GET /api/findfiles
```
Parameters:
- `phenoId` (string): Phenotype identifier

Response:
```json
{
  "gwamaAvailable": true,
  "mrmegaAvailable": true,
  "gwamaCohorts": ["EUR", "AFR", "EAS"]
}
```

For a complete API reference, see the API documentation page in the application.

## Component Documentation

### GWASHeader Component
The GWASHeader component displays the title section of the GWAS analysis page, including phenotype information and key statistics.

Props:
- `phenoId` (string): Phenotype identifier
- `cohorts` (array): Available cohorts
- `selectedCohort` (string): Currently selected cohort
- `setSelectedCohort` (function): Cohort setter function
- `phenoStats` (object): Statistics about the phenotype
- `onOpenSidebar` (function): Sidebar toggle handler
- `leadVariants` (array): Lead variants for the phenotype
- `selectedStudy` (string): Current study type
- `phenoCategory` (string): Phenotype category

### Manhattan Component
The Manhattan component renders the interactive Manhattan plot visualization.

Props:
- `stat` (array): Non-significant variant data
- `dyn` (array): Significant variant data
- `ticks` (array): Chromosome tick positions
- `threshold` (number): Significance threshold line
- `onSNPClick` (function): Click handler for SNP points
- `phenoId` (string): Current phenotype ID
- `selectedCohort` (string): Current cohort
- `selectedStudy` (string): Current study type
- `filterLimit` (string): Limit for number of variants
- `filterMinPValue` (number): Minimum p-value filter

### Hudson Component
The Hudson component displays side-by-side Manhattan plots for population comparison.

Props:
- `dynTop` (array): Significant variants for top population
- `statTop` (array): Non-significant variants for top population
- `dynBott` (array): Significant variants for bottom population
- `statBott` (array): Non-significant variants for bottom population
- `ticksTop` (array): Chromosome ticks for top plot
- `ticksBott` (array): Chromosome ticks for bottom plot
- `selectedTopAncestry` (string): Top population selection
- `selectedBottomAncestry` (string): Bottom population selection
- `onTopAncestryChange` (function): Top population change handler
- `onBottomAncestryChange` (function): Bottom population change handler
- `loadingTop` (boolean): Loading state for top plot
- `loadingBottom` (boolean): Loading state for bottom plot
- `availableCohorts` (array): Available cohorts for selection

### PheWASPlot Component
The PheWASPlot component renders the phenome-wide association study visualization.

Props:
- `data` (object): PheWAS data containing plot_data array
- `selectedSNP` (string): Currently selected SNP

### StatsBar Component
The StatsBar component displays statistics about the current analysis.

Props:
- `phenoStats` (object): Statistics about the phenotype
- `leadVariants` (array): Lead variants for the phenotype
- `phenoId` (string): Current phenotype ID
- `selectedCohort` (string): Current cohort
- `selectedStudy` (string): Current study type

## Development Guidelines

### Code Style

- **JavaScript**: Follow Airbnb JavaScript Style Guide
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind utility classes with consistent naming
- **Commits**: Use conventional commit messages

### Performance Considerations

1. **Data Handling**:
   - Implement client-side caching for repeated queries
   - Use pagination for large result sets
   - Apply dynamic filtering on the server side

2. **Rendering Optimization**:
   - Use React.memo for expensive components
   - Implement virtualized lists for large data tables
   - Optimize chart rendering with memoization

3. **Asset Optimization**:
   - Use compressed image formats
   - Implement lazy loading for non-critical assets
   - Minimize bundle size with code splitting

### Testing

1. **Unit Tests**:
   - Test individual components and utility functions
   - Use Jest for test framework
   - Use React Testing Library for component tests

2. **Integration Tests**:
   - Test component interactions
   - Verify API integration

3. **End-to-End Tests**:
   - Test complete user workflows
   - Use Cypress for E2E testing

## Contributing

We welcome contributions to PLATLAS! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Create a Pull Request

### Contribution Guidelines

- Follow the code style guidelines
- Write unit tests for new features
- Update documentation for API changes
- Keep pull requests focused on a single change
- Reference issues in pull request descriptions

### Bug Reports

If you find a bug, please create an issue with:
- A clear title and description
- Steps to reproduce the bug
- Expected and actual behavior
- Screenshots if applicable
- Any additional context

## Team and Institutions

PLATLAS is a collaborative project developed by researchers and developers from:

### University of Pennsylvania
- **Investigators**: Anurag Verma, Scott Damrauer, Benjamin Voight
- **Data Analysis**: Michael Levin, Sarah Abramowitz, David Zhang
- **Development**: Hritvik Gupta

### Argonne National Laboratory
- **Investigators**: Ravi Madduri
- **Data Analysis**: Alex Rodriguez
- **Development**: Taylor Cohron

### Massachusetts General Hospital
- **Investigators**: Pradeep Natarajan
- **Data Analysis**: Satoshi Koyama, Buu Truong

## Licensing

- This project is licensed under the MIT License - see the LICENSE file for details.
- The MIT License is a permissive free software license that puts only very limited restriction on reuse and has high compatibility with other licenses. It permits users to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.

## Acknowledgments

- This project uses data from multiple biobanks and genome-wide association studies
- We thank all the participants who contributed their genetic data to make these resources possible
- Funding provided by [FUNDING SOURCES]

## Contact

For questions, issues, or collaboration inquiries, please open a new issue or email: anurag.verma@pennmedicine.upenn.edu and hritvik.gupta@pennmedicine.upenn.edu
