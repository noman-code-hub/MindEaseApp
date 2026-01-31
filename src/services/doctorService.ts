export interface Education {
    degree: string;
    institute: string;
    startYear: string;
    endYear: string;
}

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
    education?: string | Education[];
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

// Helper function to map doctor data from API response
const mapDoctorData = (doc: any): Doctor => ({
    doctorId: doc._id || doc.doctorId,
    name: doc.name,
    role: doc.specialization || doc.role || 'Doctor',
    speciality: doc.specialization,
    hospitalName: doc.hospitalName,
    city: doc.address?.city,
    rating: doc.averageRating || 0,
    experience: doc.experience,
    availability: doc.availability || [],
    specialization: doc.specialization,
    education: doc.education || [],
    about: doc.about,
    clinicName: doc.clinicName || doc.hospitalName,
    location: doc.address?.city,
    color: generateColor(doc.name)
});

export const searchDoctors = async (params: SearchParams = {}): Promise<Doctor[]> => {
    try {
        // Validate minimum search length (3 characters)
        if (params.search && params.search.trim().length > 0 && params.search.trim().length < 3) {
            console.log('[DEBUG] Search query too short, minimum 3 characters required');
            return [];
        }

        const queryParams = new URLSearchParams();
        if (params.search && params.search.trim().length >= 3) {
            queryParams.append('search', params.search.trim());
        }
        if (params.city) queryParams.append('city', params.city);
        if (params.specialityId) queryParams.append('specialityId', params.specialityId);

        const url = `${BASE_URL}/search?${queryParams.toString()}`;
        console.log('Fetching doctors from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Search response:', JSON.stringify(data).substring(0, 200) + '...');

        if (data.success && data.data && Array.isArray(data.data.doctors)) {
            return data.data.doctors.map(mapDoctorData);
        } else if (Array.isArray(data)) {
            return data.map(mapDoctorData);
        }

        return [];
    } catch (error) {
        console.error('Error searching doctors:', error);
        return [];
    }
};

// Get all doctors (by status - all active doctors)
export const getDoctorsByStatus = async (): Promise<Doctor[]> => {
    try {
        const url = `${BASE_URL}/`;
        console.log('Fetching all doctors from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Get doctors response:', JSON.stringify(data).substring(0, 200) + '...');

        if (data.success && data.data && Array.isArray(data.data.doctors)) {
            return data.data.doctors.map(mapDoctorData);
        } else if (Array.isArray(data)) {
            return data.map(mapDoctorData);
        }

        return [];
    } catch (error) {
        console.error('Error fetching doctors by status:', error);
        return [];
    }
};

// Get doctor by ID
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
    try {
        const url = `${BASE_URL}/${doctorId}`;
        console.log('Fetching doctor by ID from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Get doctor by ID response:', JSON.stringify(data).substring(0, 200) + '...');

        if (data.success && data.data) {
            return mapDoctorData(data.data);
        } else if (data._id || data.doctorId) {
            return mapDoctorData(data);
        }

        return null;
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        return null;
    }
};

// Comprehensive list of major Pakistani cities
const PAKISTAN_CITIES = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
    'Larkana',
    'Sheikhupura',
    'Rahim Yar Khan',
    'Jhang',
    'Dera Ghazi Khan',
    'Gujrat',
    'Sahiwal',
    'Wah Cantonment',
    'Mardan',
    'Kasur',
    'Okara',
    'Mingora',
    'Nawabshah',
    'Chiniot',
    'Kotri',
    'Khanpur',
    'Hafizabad',
    'Sadiqabad',
    'Mirpur Khas',
    'Burewala',
    'Kohat',
    'Khanewal',
    'Dera Ismail Khan',
    'Turbat',
    'Muzaffargarh',
    'Abbottabad',
    'Mandi Bahauddin',
    'Shikarpur',
    'Jacobabad',
    'Jhelum',
    'Khanpur',
    'Khairpur',
    'Khuzdar',
    'Pakpattan',
    'Tando Allahyar',
    'Tando Adam',
    'Vehari',
    'Chakwal',
    'Attock',
    'Mianwali',
    'Jauharabad',
    'Bhakkar',
    'Zhob',
    'Dera Murad Jamali',
    'Gwadar',
    'Chaman',
    'Bannu',
    'Swabi',
    'Nowshera',
    'Charsadda',
    'Mansehra',
    'Haripur',
    'Malakand',
    'Batagram',
    'Kohistan',
    'Shangla',
    'Buner',
    'Swat',
    'Dir',
    'Chitral',
    'Gilgit',
    'Skardu',
    'Hunza',
    'Ghanche',
    'Shigar',
    'Kharmang',
    'Mirpur',
    'Muzaffarabad',
    'Rawalakot',
    'Kotli',
    'Bhimber',
    'Bagh',
    'Neelum',
    'Hattian',
    'Haveli',
    'Poonch',
    'Sudhnoti'
].sort();

// Get top 5 major cities for quick selection
export const getMajorCities = (): string[] => {
    return ['Islamabad', 'Peshawar', 'Lahore', 'Karachi', 'Quetta'];
};

export const getCities = async (): Promise<string[]> => {
    try {
        const url = `${BASE_URL}/cities`;
        console.log('Fetching cities from:', url);

        const response = await fetch(url);
        const data = await response.json();

        let apiCities: string[] = [];
        if (data.success && Array.isArray(data.data)) {
            apiCities = data.data;
        }

        // Merge API cities with fallback list and remove duplicates
        const allCities = [...new Set([...apiCities, ...PAKISTAN_CITIES])].sort();

        console.log(`[DEBUG] Total cities available: ${allCities.length} (API: ${apiCities.length}, Fallback: ${PAKISTAN_CITIES.length})`);

        return allCities;
    } catch (error) {
        console.error('Error fetching cities:', error);
        // Return fallback list if API fails
        console.log(`[DEBUG] Using fallback cities list (${PAKISTAN_CITIES.length} cities)`);
        return PAKISTAN_CITIES;
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
