// Seed data for Auto One MVP
// Run this script to populate Firestore with sample data

import { db } from '../src/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sample workshops
    const workshops = [
      {
        name: "Al Futtaim Auto Center",
        description: "Full-service automotive center with certified technicians and state-of-the-art equipment.",
        address: "Dubai Festival City, Dubai, UAE",
        phone: "+971-4-331-0000",
        email: "info@alfuttaimauto.ae",
        website: "https://alfuttaimauto.ae",
        latitude: 25.2170,
        longitude: 55.3614,
        rating: 4.8,
        reviewCount: 127,
        isActive: true,
        workingHours: {
          monday: { open: "08:00", close: "18:00", isOpen: true },
          tuesday: { open: "08:00", close: "18:00", isOpen: true },
          wednesday: { open: "08:00", close: "18:00", isOpen: true },
          thursday: { open: "08:00", close: "18:00", isOpen: true },
          friday: { open: "08:00", close: "18:00", isOpen: true },
          saturday: { open: "09:00", close: "17:00", isOpen: true },
          sunday: { open: "09:00", close: "17:00", isOpen: true },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Dyno Tuning Services",
        description: "Specialized performance tuning and ECU programming for all vehicle types.",
        address: "Al Quoz Industrial Area, Dubai, UAE",
        phone: "+971-4-331-1234",
        email: "contact@dynotuning.ae",
        latitude: 25.1185,
        longitude: 55.2268,
        rating: 4.5,
        reviewCount: 89,
        isActive: true,
        workingHours: {
          monday: { open: "09:00", close: "19:00", isOpen: true },
          tuesday: { open: "09:00", close: "19:00", isOpen: true },
          wednesday: { open: "09:00", close: "19:00", isOpen: true },
          thursday: { open: "09:00", close: "19:00", isOpen: true },
          friday: { open: "09:00", close: "19:00", isOpen: true },
          saturday: { open: "10:00", close: "18:00", isOpen: true },
          sunday: { open: "10:00", close: "18:00", isOpen: true },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Quick Lane Auto Center",
        description: "Fast and reliable auto maintenance services including oil changes and tire rotations.",
        address: "Sheikh Zayed Road, Dubai, UAE",
        phone: "+971-4-331-5678",
        email: "service@quicklane.ae",
        latitude: 25.2048,
        longitude: 55.2708,
        rating: 4.2,
        reviewCount: 156,
        isActive: true,
        workingHours: {
          monday: { open: "07:00", close: "20:00", isOpen: true },
          tuesday: { open: "07:00", close: "20:00", isOpen: true },
          wednesday: { open: "07:00", close: "20:00", isOpen: true },
          thursday: { open: "07:00", close: "20:00", isOpen: true },
          friday: { open: "07:00", close: "20:00", isOpen: true },
          saturday: { open: "08:00", close: "19:00", isOpen: true },
          sunday: { open: "08:00", close: "19:00", isOpen: true },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Add workshops to Firestore
    const workshopRefs = [];
    for (const workshop of workshops) {
      const workshopRef = await addDoc(collection(db, 'workshops'), workshop);
      workshopRefs.push({ id: workshopRef.id, ...workshop });
      console.log(`✅ Added workshop: ${workshop.name}`);
    }

    // Sample services for each workshop
    const workshopServices = [
      // Al Futtaim Auto Center services
      {
        workshopId: workshopRefs[0].id,
        name: "Full Service Oil Change",
        description: "Complete oil change with filter replacement, multi-point inspection, and fluid top-up.",
        category: "maintenance",
        price: 150,
        duration: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workshopId: workshopRefs[0].id,
        name: "Brake Pad Replacement",
        description: "Replace front or rear brake pads with high-quality parts and professional installation.",
        category: "brake_service",
        price: 300,
        duration: 90,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workshopId: workshopRefs[0].id,
        name: "Engine Diagnostic",
        description: "Comprehensive engine analysis using advanced diagnostic equipment.",
        category: "diagnostic",
        price: 200,
        duration: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Dyno Tuning Services
      {
        workshopId: workshopRefs[1].id,
        name: "ECU Tuning",
        description: "Custom ECU remapping for improved performance and fuel efficiency.",
        category: "performance",
        price: 800,
        duration: 180,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workshopId: workshopRefs[1].id,
        name: "Dyno Testing",
        description: "Professional dynamometer testing to measure engine performance.",
        category: "diagnostic",
        price: 400,
        duration: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Quick Lane Auto Center
      {
        workshopId: workshopRefs[2].id,
        name: "Express Oil Change",
        description: "Quick oil change service with synthetic oil and new filter.",
        category: "maintenance",
        price: 80,
        duration: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workshopId: workshopRefs[2].id,
        name: "Tire Rotation & Balance",
        description: "Complete tire rotation service with balancing for optimal performance.",
        category: "maintenance",
        price: 120,
        duration: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workshopId: workshopRefs[2].id,
        name: "Battery Testing",
        description: "Comprehensive battery testing and replacement if needed.",
        category: "diagnostic",
        price: 50,
        duration: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add services to Firestore
    for (const service of workshopServices) {
      await addDoc(collection(db, 'workshops', service.workshopId, 'services'), service);
      console.log(`✅ Added service: ${service.name} to ${workshopRefs.find(w => w.id === service.workshopId)?.name}`);
    }

    // Sample car wash services
    const carWashServices = [
      {
        name: "Express Wash",
        description: "Exterior wash and tire shine - perfect for a quick clean.",
        type: "express",
        price: 40,
        duration: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Standard Wash",
        description: "Exterior wash, interior vacuuming, and dashboard cleaning.",
        type: "standard",
        price: 80,
        duration: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Premium Detailing",
        description: "Full interior and exterior detail with wax protection.",
        type: "premium",
        price: 150,
        duration: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add car wash services to Firestore
    for (const service of carWashServices) {
      await addDoc(collection(db, 'car_wash_services'), service);
      console.log(`✅ Added car wash service: ${service.name}`);
    }

    // Create a demo admin user (in a real app, this would be done through Firebase Auth)
    const demoAdmin = {
      email: "admin@autoone.ae",
      displayName: "Auto One Admin",
      role: "admin",
      language: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: true,
      lastLoginAt: new Date(),
    };

    // Note: In production, user creation should be handled through Firebase Auth
    // This is just for demo purposes
    console.log('📝 Demo admin user data prepared (create through Firebase Auth):', demoAdmin);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Added ${workshopRefs.length} workshops, ${workshopServices.length} workshop services, and ${carWashServices.length} car wash services`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// For running as a standalone script
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData;