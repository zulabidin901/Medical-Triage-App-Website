import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'John Smith',
      age: 45,
      gender: 'Male',
    },
  })

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
    },
  })

  // Create sample vitals
  await prisma.vital.create({
    data: {
      patientId: patient1.id,
      bloodPressure: '140/90',
      weight: 75.5,
      temperature: 37.2,
      spO2: 98.5,
      heartRate: 88,
    },
  })

  await prisma.vital.create({
    data: {
      patientId: patient2.id,
      bloodPressure: '120/80',
      weight: 65.0,
      temperature: 36.8,
      spO2: 99.0,
      heartRate: 72,
    },
  })

  // Create sample visits
  await prisma.visit.create({
    data: {
      patientId: patient1.id,
      symptoms: 'Chest pain, shortness of breath, dizziness',
      status: 'pending',
      priority: 'high',
    },
  })

  await prisma.visit.create({
    data: {
      patientId: patient2.id,
      symptoms: 'Headache, nausea, fatigue',
      status: 'pending',
      priority: 'medium',
    },
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })