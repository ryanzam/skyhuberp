# SkyHubERP Documentation
![Vercel](https://vercelbadge.vercel.app/api/ryanzam/skyhuberp)

<div>
  <img alt="last-commit" src="https://img.shields.io/github/last-commit/ryanzam/growlytics?style=flat&amp;logo=git&amp;logoColor=white&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
  <img alt="repo-top-language" src="https://img.shields.io/github/languages/top/ryanzam/growlytics?style=flat&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
  <img alt="repo-language-count" src="https://img.shields.io/github/languages/count/ryanzam/growlytics?style=flat&amp;color=0080ff" class="inline-block mx-1" style="margin: 0px 2px;">
</div>

## Overview

SkyHubERP is an open-source Enterprise Resource Planning (ERP) system designed to streamline business processes, including inventory management, sales, human resources, and financial operations. Built with scalability and flexibility in mind, SkyHubERP provides a modular architecture to support small to medium-sized enterprises in managing their operations efficiently.

This documentation provides a comprehensive guide to installing, configuring, using, and contributing to the SkyHubERP project. It is intended for developers, system administrators, and end-users.

---

**Built with the tools and technologies:**

<div align="left">

<div align="left">

![hookform/resolvers](https://img.shields.io/badge/hookform%2Fresolvers-%5E5.1.1-4F46E5?style=flat-square&logo=hookform%2Fresolvers)

![types/bcryptjs](https://img.shields.io/badge/types%2Fbcryptjs-%5E2.4.6-10B981?style=flat-square&logo=types%2Fbcryptjs)
![bcryptjs](https://img.shields.io/badge/bcryptjs-%5E3.0.2-F59E0B?style=flat-square&logo=bcryptjs)

![mongoose](https://img.shields.io/badge/mongoose-%5E8.16.2-880000?style=flat-square&logo=mongoose)
![next](https://img.shields.io/badge/next-15.3.5-10B981?style=flat-square&logo=next)

![postcss](https://img.shields.io/badge/postcss-%5E8.5.6-DD3A0A?style=flat-square&logo=postcss)
![react](https://img.shields.io/badge/react-%5E19.0.0-61DAFB?style=flat-square&logo=react)

![sonner](https://img.shields.io/badge/sonner-%5E2.0.6-10B981?style=flat-square&logo=sonner)

![zod](https://img.shields.io/badge/zod-%5E3.25.76-3E67B1?style=flat-square&logo=zod)
![zustand](https://img.shields.io/badge/zustand-%5E5.0.6-8B5CF6?style=flat-square&logo=zustand)
![eslint/eslintrc](https://img.shields.io/badge/eslint%2Feslintrc-%5E3-F97316?style=flat-square&logo=eslint%2Feslintrc)
![tailwindcss/postcss](https://img.shields.io/badge/tailwindcss%2Fpostcss-%5E4.1.11-4F46E5?style=flat-square&logo=tailwindcss%2Fpostcss)
![types/node](https://img.shields.io/badge/types%2Fnode-%5E20-10B981?style=flat-square&logo=types%2Fnode)
![types/react](https://img.shields.io/badge/types%2Freact-%5E19-F59E0B?style=flat-square&logo=types%2Freact)
![eslint](https://img.shields.io/badge/eslint-%5E9-4B32C3?style=flat-square&logo=eslint)
![tailwindcss](https://img.shields.io/badge/tailwindcss-%5E4.1.11-4F46E5?style=flat-square&logo=tailwindcss)
![typescript](https://img.shields.io/badge/typescript-%5E5-3178C6?style=flat-square&logo=typescript)
</div>

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#clone-the-repository)
   - [Setup Instructions](#setup-instructions)
4. [Configuration](#configuration)
   - [Environment Variables](#environment-variables)
   - [Database Configuration](#database-configuration)
5. [Usage](#usage)
   - [User Roles](#user-roles)
   - [Core Modules](#core-modules)
   - [Accessing the Application](#accessing-the-application)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

SkyHubERP is designed to integrate various business functions into a unified platform, enabling organizations to manage resources, automate processes, and gain actionable insights through a user-friendly interface. The system is built using modern web technologies, ensuring compatibility with multiple platforms and ease of deployment.

This project is hosted on GitHub at [https://github.com/ryanzam/skyhuberp](https://github.com/ryanzam/skyhuberp). Contributions from the community are welcome to enhance functionality and address issues.

---

## Features

SkyHubERP offers the following key features:

- **Modular Architecture**: Extensible modules for inventory, accouting, HR, and finance.
- **User Management**: Role-based access control for administrators, managers, and employees.
- **API Integration**: RESTful APIs for integrating with third-party systems.
- **Multi-Platform Support**: Accessible via web browsers on desktop and mobile devices.
- **Customizable Workflows**: Tailor processes to specific business needs.

---

## Installation

### Prerequisites

Before installing SkyHubERP, ensure the following tools are installed:

1. **Git**: For cloning the repository.
2. **Node.js and npm**: For frontend dependencies.
4. **Database**: MongoDB.

Install these tools using your system's package manager or official installers.

### Clone the Repository

Clone the SkyHubERP repository to your local machine:

```bash
git clone https://github.com/ryanzam/skyhuberp.git
cd skyhuberp
```

### Setup Instructions

1. **Install Frontend Dependencies**:
   Navigate to the skyhubERP directory and install Node.js dependencies:
   ```bash
   cd ../skyhubERP
   npm install
   ```

2. **Database Setup**:
   - Create a database in MongoDB Atlas.
   - Use connection string (MONGO_URI) in .env file

4. **Start the Application**:
     ```bash
     cd skyhubERP
     npm start
     ```

5. **Access SkyHubERP**:
   Open a browser and navigate to `http://localhost:3000`.

---

## Configuration

### Environment Variables

SkyHubERP uses environment variables for configuration. Create a `.env` file with the following variables:

```plaintext
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL

# API Settings
API_BASE_URL=http://localhost:5000/api
```

### Database Configuration

Update the database connection settings in `.env` file. For example use:

```mongodb atlas
MONGODB_URI = "MONGO_CONNECTION_STRING"
```

---

## Usage

### Core Modules

- **Accounting Management**: Manage your accounting ledgers, transactions and journal entries.
- **Inventory Management**: Track stock levels and categories.
- **Orders**: Process sales orders, purchase orders and invoices.
- **Reports**: Generate Balace sheet and Profit-loss statements.
- **Company**
- **Users**

### Accessing the Application

1. Log in using the default demo credentials (for first-time setup):
   - Username: `admin@demo.com`
   - Password: `admin123`
2. Navigate through the dashboard to access modules and configure settings.

---

## API Reference

SkyHubERP provides a RESTful API for integration. Key endpoints include:

- **(GET/POST/PUT/DELETE) /api/users**: Retrieve list of users (Admin only).
- **(GET/POST/PUT/DELETE) /api/orders**: Create a new sales order.
- **(GET/POST/PUT/DELETE) /api/ledgers**: Fetch ledgers.
- **(GET/POST/PUT/DELETE) /api/stocks**
- **(GET/POST/PUT/DELETE) /api/transactions**
- **(GET/POST/PUT/DELETE) /api/profit-loss**
...etc

---

## Troubleshooting

- **Database Connection Error**:
  - Verify database credentials in `.env`.
  - Ensure the database server is running.
- **Frontend Not Loading**:
  - Check if `npm start` is running in the root directory.
  - Clear browser cache or try a different browser.
---

