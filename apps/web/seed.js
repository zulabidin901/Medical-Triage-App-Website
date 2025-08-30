const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');
  
  const p1 = await prisma.patient.create({
    data: {
      name: 'John Smith',
      age: 45,
      gender: 'Male'
    }
  });
  
  const p2 = await prisma.patient.create({
    data: {
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female'
    }
  });
  
  await prisma.vital.create({
    data: {
      patientId: p1.id,
      bloodPressure: '140/90',
      weight: 75.5,
      temperature: 37.2,
      spO2: 98.5,
      heartRate: 88
    }
  });
  
  await prisma.vital.create({
    data: {
      patientId: p2.id,
      bloodPressure: '120/80',
      weight: 65.0,
      temperature: 36.8,
      spO2: 99.0,
      heartRate: 72
    }
  });
  
  await prisma.visit.create({
    data: {
      patientId: p1.id,
      symptoms: 'Chest pain, shortness of breath, dizziness',
      status: 'pending',
      priority: 'high'
    }
  });
  
  await prisma.visit.create({
    data: {
      patientId: p2.id,
      symptoms: 'Headache, nausea, fatigue',
      status: 'pending',
      priority: 'medium'
    }
  });
  
  console.log('✅ Database seeded!');
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});