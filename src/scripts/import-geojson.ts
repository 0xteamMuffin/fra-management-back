import fs from 'fs';
import path from 'path';
import db from '../db/db';

interface DistrictFeature {
  type: 'Feature';
  properties: {
    dt_code: string;
    district: string;
    st_code: string;
    year: string;
    st_nm: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface VillageFeature {
  type: 'Feature';
  properties: {
    SUB_DIST: string;
    DISTRICT: string;
    STATE: string;
    NAME: string;
    CEN_2001: string;
    TYPE: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: DistrictFeature[] | VillageFeature[];
}

async function importOdishaData() {
  try {
    console.log('🗺️  Starting Odisha GeoJSON data import...');

    // 1. Ensure Odisha state exists
    console.log('📋 Step 1: Ensuring Odisha state exists...');
    let odishaState = await db.state.findUnique({
      where: { code: 'OR' }
    });

    if (!odishaState) {
      console.log('Creating Odisha state...');
      odishaState = await db.state.create({
        data: {
          name: 'Odisha',
          code: 'OR'
        }
      });
      console.log(`✅ Created Odisha state with ID: ${odishaState.id}`);
    } else {
      console.log(`✅ Odisha state already exists with ID: ${odishaState.id}`);
    }

    // 2. Import Districts
    console.log('🏛️  Step 2: Importing districts...');
    await importDistricts(odishaState.id);

    // 3. Import Villages
    console.log('🏘️  Step 3: Importing villages...');
    await importVillages(odishaState.id);

    console.log('🎉 Odisha data import completed successfully!');

  } catch (error) {
    console.error('❌ Error importing Odisha data:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

async function importDistricts(stateId: string) {
  try {
    const filePath = path.join(__dirname, '../../data/district.odisha.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const geoData: GeoJSONData = JSON.parse(fileContent);

    console.log(`📊 Found ${geoData.features.length} districts in GeoJSON file`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const feature of geoData.features as DistrictFeature[]) {
      const { properties, geometry } = feature;
      const { district: districtName, dt_code: districtCode } = properties;

      try {
        // Check if district already exists
        const existingDistrict = await db.district.findFirst({
          where: {
            name: districtName,
            stateId: stateId
          }
        });

        if (existingDistrict) {
          console.log(`⏭️  Skipping existing district: ${districtName}`);
          skippedCount++;
          continue;
        }

        // Create district with geometry
        const geometryJson = JSON.stringify(geometry);
        
        await db.$queryRaw`
          INSERT INTO "District" (id, name, code, "stateId", boundary, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(), 
            ${districtName}, 
            ${districtCode}, 
            ${stateId}, 
            ST_GeomFromGeoJSON(${geometryJson}), 
            NOW(), 
            NOW()
          )
        `;

        console.log(`✅ Imported district: ${districtName} (${districtCode})`);
        importedCount++;

      } catch (districtError) {
        console.error(`❌ Failed to import district ${districtName}:`, districtError);
      }
    }

    console.log(`📈 Districts import summary: ${importedCount} imported, ${skippedCount} skipped`);

  } catch (error) {
    console.error('❌ Error importing districts:', error);
    throw error;
  }
}

async function importVillages(stateId: string) {
  try {
    const filePath = path.join(__dirname, '../../data/village.odisha.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const geoData: GeoJSONData = JSON.parse(fileContent);

    console.log(`📊 Found ${geoData.features.length} villages in GeoJSON file`);

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process villages in batches to avoid memory issues
    const batchSize = 100;
    const totalBatches = Math.ceil(geoData.features.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, geoData.features.length);
      const batch = geoData.features.slice(startIndex, endIndex) as VillageFeature[];

      console.log(`🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${startIndex + 1}-${endIndex})`);

      for (const feature of batch) {
        const { properties, geometry } = feature;
        const {
          NAME: villageName,
          DISTRICT: districtName,
          SUB_DIST: subDistrictName
        } = properties;

        try {
          // Find or create the district
          let district = await db.district.findFirst({
            where: {
              name: districtName
            }
          });

          if (!district) {
            district = await db.district.create({
              data: {
                name: districtName,
                stateId: stateId
              }
            });
          }

          // Find or create the sub-district
          let subDistrict = await db.subDistrict.findFirst({
            where: {
              name: subDistrictName,
              districtId: district.id
            }
          });

          if (!subDistrict) {
            subDistrict = await db.subDistrict.create({
              data: {
                name: subDistrictName,
                districtId: district.id
              }
            });
          }

          // Check if village already exists
          const existingVillage = await db.village.findFirst({
            where: {
              name: villageName,
              districtId: district.id
            }
          });

          if (existingVillage) {
            skippedCount++;
            continue;
          }

          // Calculate centroid for coordinates
          const coordinates = calculateCentroid(geometry.coordinates[0]);
          const coordinatesJson = JSON.stringify({
            type: 'Point',
            coordinates: coordinates
          });

          const geometryJson = JSON.stringify(geometry);

          // Create village with geometry
          await db.$queryRaw`
            INSERT INTO "Village" (id, name, "districtId", "subDistrictId", coordinates, boundary, "createdAt", "updatedAt")
            VALUES (
              gen_random_uuid(), 
              ${villageName}, 
              ${district.id}, 
              ${subDistrict.id},
              ST_GeomFromGeoJSON(${coordinatesJson}), 
              ST_GeomFromGeoJSON(${geometryJson}), 
              NOW(), 
              NOW()
            )
          `;

          importedCount++;

        } catch (villageError) {
          console.error(`❌ Failed to import village ${villageName}:`, villageError);
          errorCount++;
        }
      }

      // Log progress
      if (batchIndex % 10 === 0 || batchIndex === totalBatches - 1) {
        console.log(`📊 Progress: ${importedCount} imported, ${skippedCount} skipped, ${errorCount} errors`);
      }
    }

    console.log(`📈 Villages import summary: ${importedCount} imported, ${skippedCount} skipped, ${errorCount} errors`);

  } catch (error) {
    console.error('❌ Error importing villages:', error);
    throw error;
  }
}

function calculateCentroid(coordinates: number[][]): number[] {
  let x = 0, y = 0;
  const len = coordinates.length;

  for (const coord of coordinates) {
    x += coord[0];
    y += coord[1];
  }

  return [x / len, y / len];
}

// Statistics function
async function getImportStats() {
  try {
    const [states, districts, subDistricts, villages] = await Promise.all([
      db.state.count(),
      db.district.count(),
      db.subDistrict.count(),
      db.village.count()
    ]);

    console.log('\n📊 Current Database Statistics:');
    console.log(`States: ${states}`);
    console.log(`Districts: ${districts}`);
    console.log(`Sub-Districts: ${subDistricts}`);
    console.log(`Villages: ${villages}`);

    // Get Odisha specific stats
    const odishaDistricts = await db.district.count({
      where: {
        state: {
          code: 'OR'
        }
      }
    });

    const odishaSubDistricts = await db.subDistrict.count({
      where: {
        district: {
          state: {
            code: 'OR'
          }
        }
      }
    });

    const odishaVillages = await db.village.count({
      where: {
        district: {
          state: {
            code: 'OR'
          }
        }
      }
    });

    console.log('\n🗺️  Odisha Specific Statistics:');
    console.log(`Districts: ${odishaDistricts}`);
    console.log(`Sub-Districts: ${odishaSubDistricts}`);
    console.log(`Villages: ${odishaVillages}`);

  } catch (error) {
    console.error('❌ Error getting stats:', error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'import':
      await importOdishaData();
      break;
    case 'stats':
      await getImportStats();
      break;
    case 'help':
      console.log(`
🗺️  Odisha GeoJSON Import Script

Usage:
  npm run import-geojson import    - Import districts and villages from GeoJSON files
  npm run import-geojson stats     - Show current database statistics
  npm run import-geojson help      - Show this help message

Files required:
  - data/district.odisha.geojson
  - data/village.odisha.geojson
      `);
      break;
    default:
      console.log('❌ Unknown command. Use "help" to see available commands.');
      process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
