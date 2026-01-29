---
description: Seed specialities to the backend database
---

# Seed Specialities Workflow

This workflow guides you through seeding the specialities data to your backend.

## Steps

1. **Ensure the backend is running**
   - Make sure your backend server at `https://appbookingbackend.onrender.com` is accessible

2. **Import the required functions**
   ```typescript
   import { seedSpecialities } from './src/services/doctorService';
   import { specialitiesData } from './src/data/specialitiesData';
   ```

3. **Call the seed function**
   ```typescript
   const result = await seedSpecialities(specialitiesData);
   if (result.success) {
     console.log('Specialities seeded successfully!');
   } else {
     console.error('Error:', result.message);
   }
   ```

4. **Verify the data**
   - Use the `getSpecialities()` function to verify the data was seeded correctly
   ```typescript
   import { getSpecialities } from './src/services/doctorService';
   const specialities = await getSpecialities();
   console.log(`Fetched ${specialities.length} specialities`);
   ```

## Using the Management Screen

Alternatively, you can use the `SpecialitiesManagementScreen` component:

1. Add the screen to your navigation
2. Navigate to the screen in your app
3. Tap "Seed Specialities" button
4. Tap "Get Specialities" to verify

## API Endpoints Used

- **POST** `https://appbookingbackend.onrender.com/api/specialities/seed`
- **GET** `https://appbookingbackend.onrender.com/api/specialities/`
