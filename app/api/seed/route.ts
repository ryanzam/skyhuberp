import mongoConnect from "@/lib/mongoConnect";
import Company from "@/models/Company";
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