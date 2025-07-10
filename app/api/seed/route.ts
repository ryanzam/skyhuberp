import mongoConnect from "@/lib/mongoConnect";
import Company from "@/models/Company";
import Ledger from "@/models/Ledger";
import Order from "@/models/Order";
import Stock from "@/models/Stock";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await mongoConnect()

        // Create sample company
        const company = new Company({
            name: 'Demo Company Ltd',
            address: '123 Business Street, City, State 12345',
            phone: '+1-555-0123',
            email: 'info@democompany.com',
            taxId: 'TAX123456789',
            currency: 'USD',
            financialYear: {
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31')
            }
        });
        await company.save();

        //create demo user
        const user = new User({
            name: "Demo User",
            email: "admin@demo.com",
            password: "admin123",
            role: "admin",
            company: company._id
        })
        await user.save()

        // Create sample ledgers
        const ledgers = [
            {
                name: 'Cash',
                type: 'asset',
                group: 'Current Assets',
                openingBalance: 50000,
                currentBalance: 50000,
                company: company._id
            },
            {
                name: 'Bank Account',
                type: 'asset',
                group: 'Current Assets',
                openingBalance: 100000,
                currentBalance: 100000,
                company: company._id
            },
            {
                name: 'Sales Revenue',
                type: 'income',
                group: 'Revenue',
                openingBalance: 0,
                currentBalance: 0,
                company: company._id
            },
            {
                name: 'Office Expenses',
                type: 'expense',
                group: 'Operating Expenses',
                openingBalance: 0,
                currentBalance: 0,
                company: company._id
            },
            {
                name: 'Inventory',
                type: 'asset',
                group: 'Current Assets',
                openingBalance: 25000,
                currentBalance: 25000,
                company: company._id
            }
        ];

        const savedLedgers = await Ledger.insertMany(ledgers);

        // Create sample transactions
        const transactions = [
            {
                date: new Date('2024-01-15'),
                reference: 'TXN001',
                description: 'Initial cash deposit',
                entries: [
                    {
                        ledger: savedLedgers[0]._id, // Cash
                        debit: 10000,
                        credit: 0
                    },
                    {
                        ledger: savedLedgers[2]._id, // Sales Revenue
                        debit: 0,
                        credit: 10000
                    }
                ],
                totalAmount: 10000,
                company: company._id,
                createdBy: user._id
            },
            {
                date: new Date('2024-01-20'),
                reference: 'TXN002',
                description: 'Office supplies purchase',
                entries: [
                    {
                        ledger: savedLedgers[3]._id, // Office Expenses
                        debit: 1500,
                        credit: 0
                    },
                    {
                        ledger: savedLedgers[0]._id, // Cash
                        debit: 0,
                        credit: 1500
                    }
                ],
                totalAmount: 1500,
                company: company._id,
                createdBy: user._id
            }
        ];

        await Transaction.insertMany(transactions);

        // Create sample stock items
        const stockItems = [
            {
                name: 'Laptop Computer',
                code: 'LPT001',
                category: 'Electronics',
                unit: 'Piece',
                quantity: 25,
                unitPrice: 1200,
                minStock: 5,
                maxStock: 100,
                valuationMethod: 'FIFO',
                company: company._id
            },
            {
                name: 'Office Chair',
                code: 'CHR001',
                category: 'Furniture',
                unit: 'Piece',
                quantity: 15,
                unitPrice: 350,
                minStock: 3,
                maxStock: 50,
                valuationMethod: 'FIFO',
                company: company._id
            },
            {
                name: 'Printer Paper',
                code: 'PPR001',
                category: 'Stationery',
                unit: 'Ream',
                quantity: 2,
                unitPrice: 12,
                minStock: 10,
                maxStock: 200,
                valuationMethod: 'FIFO',
                company: company._id
            }
        ];

        const savedStockItems = await Stock.insertMany(stockItems);

        // Create sample orders
        const orders = [
            {
                orderNumber: 'SO001',
                type: 'sales',
                date: new Date('2024-01-25'),
                customer: 'ABC Corporation',
                items: [
                    {
                        stock: savedStockItems[0]._id,
                        quantity: 2,
                        unitPrice: 1200,
                        totalPrice: 2400
                    }
                ],
                totalAmount: 2400,
                status: 'confirmed',
                company: company._id,
                createdBy: user._id
            },
            {
                orderNumber: 'PO001',
                type: 'purchase',
                date: new Date('2024-01-30'),
                customer: 'XYZ Suppliers',
                items: [
                    {
                        stock: savedStockItems[2]._id,
                        quantity: 50,
                        unitPrice: 12,
                        totalPrice: 600
                    }
                ],
                totalAmount: 600,
                status: 'pending',
                company: company._id,
                createdBy: user._id
            }
        ];

        await Order.insertMany(orders);

        return NextResponse.json({
            message: "Demo data created successfully",
            credentials: { email: "admin@demo.com", password: "admin123" }
        })

    } catch (error) {
        console.error('Error seeding data:', error);
        return NextResponse.json(
            { error: 'Failed to create demo data' },
            { status: 500 }
        );
    }
}