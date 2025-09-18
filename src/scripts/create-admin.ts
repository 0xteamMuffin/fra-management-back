import bcrypt from 'bcrypt';
import db from '../db/db';

async function createFirstAdmin() {
  try {
    console.log('🔧 Creating first admin user...');

    // Check if any admin users already exist
    const existingAdmin = await db.appUser.findFirst({
      where: {
        role: 'DistrictCommittee'
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Use your existing password to login');
      return;
    }

    // Create the first admin user
    const adminEmail = 'admin@fra.gov.in';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await db.appUser.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'DistrictCommittee',
        phone: '+91-9999999999',
      }
    });

    console.log('✅ First admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Role: District Committee (Admin)');
    console.log('');
    console.log('🚀 You can now:');
    console.log('1. Login to the frontend with these credentials');
    console.log('2. Access the Admin Panel at /admin');
    console.log('3. Run "Complete Setup" to seed all reference data');
    console.log('4. Create additional users through the admin panel');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'P2002') {
      console.log('📧 Admin user with this email already exists');
      console.log('🔍 Try logging in with: admin@fra.gov.in / admin123');
    }
  } finally {
    await db.$disconnect();
  }
}

// Run the script
createFirstAdmin();
