---
description: Bulk register multiple doctors
---

# Bulk Register Doctors Workflow

This workflow guides you through bulk registering multiple doctors to your backend.

## Steps

1. **Prepare doctor data**
   - Create an array of doctor objects with the required fields:
   ```typescript
   import { BulkDoctorData } from './src/services/doctorService';
   
   const doctors: BulkDoctorData[] = [
     {
       name: 'Dr. John Smith',
       email: 'john.smith@example.com',
       password: 'securePassword123',
       phone: '+1234567890',
       specialization: 'Cardiology',
       experience: 10,
       hospitalName: 'City Hospital',
       city: 'New York'
     },
     // Add more doctors...
   ];
   ```

2. **Import the bulk registration function**
   ```typescript
   import { bulkRegisterDoctors } from './src/services/doctorService';
   ```

3. **Call the bulk registration function**
   ```typescript
   const result = await bulkRegisterDoctors(doctors);
   if (result.success) {
     console.log('Doctors registered successfully!');
     console.log('Response:', result.data);
   } else {
     console.error('Error:', result.message);
   }
   ```

4. **Verify the registration**
   - Check the backend database or use the search endpoint to verify doctors were created
   ```typescript
   import { searchDoctors } from './src/services/doctorService';
   const results = await searchDoctors({ city: 'New York' });
   ```

## API Endpoint Used

- **POST** `https://appbookingbackend.onrender.com/api/doctor/bulk-create`

## Notes

- Ensure all required fields are provided for each doctor
- Passwords should be secure and follow your backend's password policy
- Email addresses must be unique
- Phone numbers should include country code
