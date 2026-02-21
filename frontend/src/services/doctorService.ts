import { DoctorStatus } from '../types/enums';

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
    locations?: {
        _id: string;
        name: string;
        phone: string;
        address?: {
            city: string;
            street: string;
        };
        coordinates?: {
            lat: number;
            lng: number;
        };
    }[];
    fees?: {
        online: string | number;
        inclinic: string | number;
    };
    status?: DoctorStatus;
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
    role: doc.specialization || doc.speciality || doc.role || 'Doctor', // Prioritize specialization/speciality
    speciality: doc.specialization || doc.speciality,
    hospitalName: doc.hospitalName,
    city: doc.address?.city,
    rating: doc.averageRating || 0,
    experience: doc.experience,
    availability: doc.availability || [],
    specialization: doc.specialization || doc.speciality,
    education: doc.education || [],
    about: doc.about,
    clinicName: doc.clinicName || doc.hospitalName,
    location: doc.address?.city,
    locations: doc.locations || [],
    fees: doc.fees || { online: '500', inclinic: '500' },
    status: doc.status || DoctorStatus.ACTIVE, // Fallback to ACTIVE if not provided
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
        console.error('Error searching doctors details:', error);
        if (error instanceof TypeError && error.message === 'Network request failed') {
            console.log('[DEBUG] This error usually means the device has no internet connection or the backend is unreachable.');
        }
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

export const getCities = async (retries = 2): Promise<string[]> => {
    try {
        const url = `${BASE_URL}/cities`;
        console.log('Fetching cities from:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch cities: ${response.status}`);
        }

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

        if (retries > 0) {
            console.log(`[DEBUG] Retrying fetch cities... (${retries} retries left)`);
            return getCities(retries - 1);
        }

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
        // console.log('Payload:', JSON.stringify(specialities, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(specialities),
        });

        const responseText = await response.text();
        console.log(`[DEBUG] Seed response status: ${response.status}`);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { message: responseText };
        }

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || `Failed to seed specialities: ${response.status}` };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error seeding specialities:', error);

        if (errorMessage.includes('Network request failed')) {
            return {
                success: false,
                message: 'Network request failed. Please ensure the backend is running and reachable from the emulator.'
            };
        }

        return { success: false, message: errorMessage };
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
// Helper to parse "09:00 AM" into minutes from midnight
// Helper to parse "09:00 AM", "09:00", "4 AM", etc. into minutes from midnight
const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    try {
        const clean = timeStr.trim().toUpperCase();
        // Regex handles: "9", "09:00", "9 AM", "9:00AM", "14:00"
        const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
        if (!match) return 0;

        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const modifier = match[3];

        if (modifier) {
            if (hours === 12 && modifier === 'AM') hours = 0;
            else if (hours !== 12 && modifier === 'PM') hours += 12;
        }

        return hours * 60 + minutes;
    } catch (e) {
        return 0;
    }
};

// Helper to format minutes into "09:00 AM"
const formatMinutesToTime = (minutes: number): string => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const modifier = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${modifier}`;
};

// Get doctor availability
export const getDoctorAvailability = async (
    doctorId: string,
    date: string,
    appointmentType: 'online' | 'inclinic' | 'physical',
    locationId?: string
): Promise<any> => {
    try {
        if (!doctorId) {
            console.error('getDoctorAvailability: doctorId is missing');
            return null;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('doctorId', doctorId);
        queryParams.append('date', date);
        // Map 'physical' to 'inclinic' if needed, or keep as is based on backend expectation. 
        // User screenshot shows 'inclinic'.
        const typeParam = appointmentType === 'physical' ? 'inclinic' : appointmentType;
        queryParams.append('appointmentType', typeParam);

        if (locationId) {
            queryParams.append('locationId', locationId);
        }

        const url = `${BASE_URL}/available-slots?${queryParams.toString()}`;

        console.log('Fetching doctor availability from:', url);

        const response = await fetch(url);
        const responseText = await response.text();

        console.log(`[API RESPONSE] GET ${url} Status: ${response.status}`);

        if (!response.ok) {
            console.error(`[API ERROR] ${response.status}: ${responseText.substring(0, 200)}`);
            return null;
        }

        try {
            const data = JSON.parse(responseText);
            console.log('Get doctor availability success structure check');

            let rawSlots: any[] = [];

            // Expected structure based on user screenshot: { success: true, data: [...] } or data directly?
            // User screenshot shows success response. Assuming data structure is similar to before or straightforward array.

            if (data.success && data.data) {
                if (data.data.availability && Array.isArray(data.data.availability)) {
                    rawSlots = data.data.availability;
                } else if (Array.isArray(data.data)) {
                    rawSlots = data.data;
                } else if (data.data.morning || data.data.afternoon || data.data.evening) {
                    return data.data;
                }
            } else if (Array.isArray(data)) {
                rawSlots = data;
            }

            // Splitting logic for ranges -> 15 min slots (keeping existing logic for safety)
            const result: { morning: any[], afternoon: any[], evening: any[] } = {
                morning: [],
                afternoon: [],
                evening: []
            };

            rawSlots.forEach((slot: any) => {
                // If it's already a split slot
                if (slot.time) {
                    const mins = parseTimeToMinutes(slot.time);
                    if (mins < 720) result.morning.push(slot); // < 12:00 PM
                    else if (mins < 1020) result.afternoon.push(slot); // < 05:00 PM
                    else result.evening.push(slot);
                    return;
                }

                // If it's a range (startTime, endTime)  - PRESERVE EXISTING LOGIC
                if (slot.startTime && slot.endTime) {
                    const startMins = parseTimeToMinutes(slot.startTime);
                    const endMins = parseTimeToMinutes(slot.endTime);
                    const slotLocId = (slot as any).locationId || locationId; // Use param if slot doesn't have it

                    for (let m = startMins; m < endMins; m += 15) {
                        const time = formatMinutesToTime(m);
                        const newSlot = {
                            time,
                            isBooked: slot.isBooked || false,
                            locationId: slotLocId,
                            appointmentType: slot.appointmentType || appointmentType
                        };

                        if (m < 720) result.morning.push(newSlot);
                        else if (m < 1020) result.afternoon.push(newSlot);
                        else result.evening.push(newSlot);
                    }
                }
            });

            return result;
        } catch (e) {
            console.error('JSON Parse Error in getDoctorAvailability:', e);
            return null;
        }
    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        return null;
    }
};
