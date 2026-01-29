export interface Doctor {
    doctorId: string;
    name: string;
    role: string; // e.g., 'doctor' or specialization if available
    speciality?: string;
    hospitalName?: string;
    city?: string;
    rating?: number;
    experience?: number;
    image?: string;
    color?: string; // For UI placeholder
    availability?: {
        day: string;
        startTime: string;
        endTime: string;
        appointmentType: string; // 'online' | 'physical'
    }[];
    // Expanded fields for Profile details
    specialization?: string;
    education?: string;
    about?: string;
    clinicName?: string;
    location?: string;
}

export interface SearchParams {
    search?: string;
    specialityId?: string;
    city?: string;
}

export interface SuperSpeciality {
    name: string;
    services: string[];
}

export interface Speciality {
    _id?: string;
    speciality: string;
    super_specialities: SuperSpeciality[];
}

export interface BulkDoctorData {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    experience?: number;
    hospitalName?: string;
    city?: string;
    // Add other fields as needed based on your backend schema
}

const BASE_URL = 'https://appbookingbackend.onrender.com/api/doctor';
const SPECIALITIES_BASE_URL = 'https://appbookingbackend.onrender.com/api/specialities';

export const searchDoctors = async (params: SearchParams = {}): Promise<Doctor[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.city) queryParams.append('city', params.city);
        if (params.specialityId) queryParams.append('specialityId', params.specialityId);

        const url = `${BASE_URL}/search?${queryParams.toString()}`;
        console.log('Fetching doctors from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Search response:', JSON.stringify(data).substring(0, 200) + '...');

        if (data.success && data.data && Array.isArray(data.data.doctors)) {
            // Map backend data to frontend model
            return data.data.doctors.map((doc: any) => ({
                doctorId: doc._id || doc.doctorId,
                name: doc.name,
                role: doc.specialization || doc.role || 'Doctor',
                speciality: doc.specialization,
                hospitalName: doc.hospitalName,
                city: doc.address?.city,
                rating: doc.averageRating || 0,
                experience: doc.experience,
                availability: doc.availability || [],
                // Generate a consistent color based on name for placeholder
                color: generateColor(doc.name)
            }));
        } else if (Array.isArray(data)) {
            // Handle case where some endpoints might return array directly (less likely for search but possible)
            return data.map((doc: any) => ({
                doctorId: doc._id || doc.doctorId,
                name: doc.name,
                role: doc.specialization || doc.role || 'Doctor',
                availability: doc.availability || [],
                color: generateColor(doc.name)
            }));
        }

        return [];
    } catch (error) {
        console.error('Error searching doctors:', error);
        return [];
    }
};

export const getCities = async (): Promise<string[]> => {
    try {
        const url = `${BASE_URL}/cities`;
        console.log('Fetching cities from:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
};

// Helper to generate consistent pastel colors
const generateColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Seed specialities and super-specialities
export const seedSpecialities = async (specialities: Speciality[]): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
        const url = `${SPECIALITIES_BASE_URL}/seed`;
        console.log('Seeding specialities to:', url);
        console.log('Payload:', JSON.stringify(specialities, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(specialities),
        });

        const data = await response.json();
        console.log('Seed specialities response:', data);

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Failed to seed specialities' };
        }
    } catch (error) {
        console.error('Error seeding specialities:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
};

// Get all specialities
export const getSpecialities = async (): Promise<Speciality[]> => {
    try {
        const url = SPECIALITIES_BASE_URL;
        console.log('Fetching specialities from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Get specialities response:', data);

        if (data.success && Array.isArray(data.data)) {
            return data.data;
        } else if (Array.isArray(data)) {
            return data;
        }

        return [];
    } catch (error) {
        console.error('Error fetching specialities:', error);
        return [];
    }
};

// Bulk register doctors
export const bulkRegisterDoctors = async (doctors: BulkDoctorData[]): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
        const url = `${BASE_URL}/bulk-create`;
        console.log('Bulk registering doctors to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ doctors }),
        });

        const data = await response.json();
        console.log('Bulk registration response:', data);

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Failed to bulk register doctors' };
        }
    } catch (error) {
        console.error('Error bulk registering doctors:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
};
