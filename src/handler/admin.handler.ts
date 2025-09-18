import { Request, Response } from "express";
import db from "../db/db";
import { AuthRequest } from "../middleware/auth.middleware";

// Get admin dashboard statistics
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Fetching admin stats...");
    
    // Get counts for all major entities
    const [
      states,
      districts, 
      villages,
      users,
      claims,
      schemes
    ] = await Promise.all([
      db.state.count(),
      db.district.count(),
      db.village.count(),
      db.appUser.count(),
      db.fRAClaim.count(),
      db.scheme.count(),
    ]);

    const stats = {
      states,
      districts,
      villages,
      users,
      claims,
      schemes,
    };

    console.log("Admin stats:", stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

// Bulk create states
export const bulkCreateStates = async (req: AuthRequest, res: Response) => {
  try {
    const { states } = req.body;

    if (!states || !Array.isArray(states)) {
      return res.status(400).json({ message: "Invalid states data" });
    }

    // Use createMany for bulk insert
    const result = await db.state.createMany({
      data: states,
      skipDuplicates: true, // Skip if state code already exists
    });

    // Get the created states to return
    const createdStates = await db.state.findMany({
      where: {
        code: {
          in: states.map((s: any) => s.code),
        },
      },
    });

    return res.status(201).json(createdStates);
  } catch (error) {
    console.error("Error bulk creating states:", error);
    return res.status(500).json({ message: "Failed to create states" });
  }
};

// Bulk create districts
export const bulkCreateDistricts = async (req: AuthRequest, res: Response) => {
  try {
    const { districts } = req.body;

    if (!districts || !Array.isArray(districts)) {
      return res.status(400).json({ message: "Invalid districts data" });
    }

    // Create districts one by one because of geometry fields
    const createdDistricts = [];

    for (const district of districts) {
      try {
        const created = await db.$queryRaw`
          INSERT INTO "District" (id, name, code, "stateId", boundary, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${district.name}, ${district.code}, ${district.stateId}, ST_GeomFromGeoJSON(${district.boundary}), NOW(), NOW())
          RETURNING *;
        `;
        
        if (Array.isArray(created) && created.length > 0) {
          createdDistricts.push(created[0]);
        }
      } catch (districtError) {
        console.error(`Failed to create district ${district.name}:`, districtError);
      }
    }

    return res.status(201).json(createdDistricts);
  } catch (error) {
    console.error("Error bulk creating districts:", error);
    return res.status(500).json({ message: "Failed to create districts" });
  }
};

// Bulk create villages
export const bulkCreateVillages = async (req: AuthRequest, res: Response) => {
  try {
    const { villages } = req.body;

    if (!villages || !Array.isArray(villages)) {
      return res.status(400).json({ message: "Invalid villages data" });
    }

    // Create villages one by one because of geometry fields
    const createdVillages = [];

    for (const village of villages) {
      try {
        const created = await db.$queryRaw`
          INSERT INTO "Village" (id, name, "districtId", coordinates, boundary, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(), 
            ${village.name}, 
            ${village.districtId}, 
            ST_GeomFromGeoJSON(${village.coordinates}), 
            ${village.boundary ? `ST_GeomFromGeoJSON(${village.boundary})` : null}, 
            NOW(), 
            NOW()
          )
          RETURNING *;
        `;
        
        if (Array.isArray(created) && created.length > 0) {
          createdVillages.push(created[0]);
        }
      } catch (villageError) {
        console.error(`Failed to create village ${village.name}:`, villageError);
      }
    }

    return res.status(201).json(createdVillages);
  } catch (error) {
    console.error("Error bulk creating villages:", error);
    return res.status(500).json({ message: "Failed to create villages" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await db.appUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        villageId: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password hash
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Create user (admin only)
export const createUserAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, phone, villageId } = req.body;

    // Check if user already exists
    const existingUser = await db.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password (using bcrypt as in auth handler)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.appUser.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        phone,
        villageId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        villageId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting the current admin user
    if (userId === req.user?.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await db.appUser.delete({
      where: { id: userId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// Quick seed data for demo
export const seedDemoData = async (req: AuthRequest, res: Response) => {
  try {
    const { includeStates, includeDistricts, includeVillages, includeUsers } = req.body;

    const results: any = {};

    // Seed Indian states
    if (includeStates) {
      const indianStates = [
        { name: "Odisha", code: "OR" },
        { name: "West Bengal", code: "WB" },
        { name: "Jharkhand", code: "JH" },
        { name: "Chhattisgarh", code: "CG" },
        { name: "Andhra Pradesh", code: "AP" },
        { name: "Telangana", code: "TG" },
        // Add more as needed
      ];

      const statesResult = await db.state.createMany({
        data: indianStates,
        skipDuplicates: true,
      });

      results.states = statesResult.count;
    }

    // Add sample districts for Odisha
    if (includeDistricts) {
      const odishaState = await db.state.findUnique({
        where: { code: "OR" },
      });

      if (odishaState) {
        const sampleDistricts = [
          { 
            name: "Mayurbhanj", 
            code: "MAY", 
            stateId: odishaState.id,
            boundary: JSON.stringify({ type: "Polygon", coordinates: [[]] })
          },
          { 
            name: "Balasore", 
            code: "BLS", 
            stateId: odishaState.id,
            boundary: JSON.stringify({ type: "Polygon", coordinates: [[]] })
          },
        ];

        let createdDistricts = 0;
        for (const district of sampleDistricts) {
          try {
            await db.$queryRaw`
              INSERT INTO "District" (id, name, code, "stateId", boundary, "createdAt", "updatedAt")
              VALUES (gen_random_uuid(), ${district.name}, ${district.code}, ${district.stateId}, ST_GeomFromGeoJSON(${district.boundary}), NOW(), NOW())
              ON CONFLICT DO NOTHING;
            `;
            createdDistricts++;
          } catch (error) {
            console.error(`Failed to create district ${district.name}:`, error);
          }
        }

        results.districts = createdDistricts;
      }
    }

    // Add sample villages
    if (includeVillages) {
      const mayurbhanjDistrict = await db.district.findFirst({
        where: { name: "Mayurbhanj" },
      });

      if (mayurbhanjDistrict) {
        const sampleVillages = [
          { 
            name: "Lembujharan", 
            districtId: mayurbhanjDistrict.id,
            coordinates: JSON.stringify({ type: "Point", coordinates: [85.8245, 21.9162] })
          },
          { 
            name: "Baripada", 
            districtId: mayurbhanjDistrict.id,
            coordinates: JSON.stringify({ type: "Point", coordinates: [86.7346, 21.9347] })
          },
        ];

        let createdVillages = 0;
        for (const village of sampleVillages) {
          try {
            await db.$queryRaw`
              INSERT INTO "Village" (id, name, "districtId", coordinates, "createdAt", "updatedAt")
              VALUES (gen_random_uuid(), ${village.name}, ${village.districtId}, ST_GeomFromGeoJSON(${village.coordinates}), NOW(), NOW())
              ON CONFLICT DO NOTHING;
            `;
            createdVillages++;
          } catch (error) {
            console.error(`Failed to create village ${village.name}:`, error);
          }
        }

        results.villages = createdVillages;
      }
    }

    return res.status(200).json({
      message: "Demo data seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Error seeding demo data:", error);
    return res.status(500).json({ message: "Failed to seed demo data" });
  }
};

// Export data
export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const [states, districts, villages, users, claims] = await Promise.all([
      db.state.findMany(),
      db.district.findMany(),
      db.village.findMany(), 
      db.appUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          villageId: true,
          createdAt: true,
        },
      }),
      db.fRAClaim.findMany(),
    ]);

    const exportData = {
      timestamp: new Date().toISOString(),
      data: {
        states,
        districts,
        villages,
        users,
        claims,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="fra_data_export_${Date.now()}.json"`);
    
    return res.status(200).json(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    return res.status(500).json({ message: "Failed to export data" });
  }
};
