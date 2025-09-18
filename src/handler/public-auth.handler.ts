import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/db";

// Public registration endpoint - only for creating the first admin if none exists
export const createFirstAdmin = async (req: Request, res: Response) => {
  try {
    // Check if any admin users already exist
    const existingAdmin = await db.appUser.findFirst({
      where: {
        role: 'DistrictCommittee'
      }
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Admin user already exists. Please login with existing credentials." 
      });
    }

    // Check if any users exist at all
    const totalUsers = await db.appUser.count();
    
    if (totalUsers > 0) {
      return res.status(400).json({ 
        message: "Users already exist in the system. Admin creation is disabled." 
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    // Create the first admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await db.appUser.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: 'DistrictCommittee', // Admin role
        phone: req.body.phone || null,
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: "First admin user created successfully",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token
    });

  } catch (error: any) {
    console.error("Error creating first admin:", error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }

    return res.status(500).json({ 
      message: "Failed to create admin user" 
    });
  }
};

// Check if system needs initial setup
export const checkSetupStatus = async (req: Request, res: Response) => {
  try {
    const totalUsers = await db.appUser.count();
    const adminUsers = await db.appUser.count({
      where: {
        role: 'DistrictCommittee'
      }
    });

    return res.status(200).json({
      needsSetup: totalUsers === 0,
      hasAdmin: adminUsers > 0,
      totalUsers,
      adminUsers,
    });

  } catch (error) {
    console.error("Error checking setup status:", error);
    return res.status(500).json({ 
      message: "Failed to check setup status" 
    });
  }
};
