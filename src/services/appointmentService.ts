export interface BookingData {
    patientId: string;
    doctorId: string;
    date: string; // YYYY-MM-DD
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    reason: string;
}

const BASE_URL = 'https://appbookingbackend.onrender.com/appointments/book';

export const bookAppointment = async (bookingData: BookingData) => {
    try {
        console.log('Booking appointment with data:', JSON.stringify(bookingData, null, 2));

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header if needed, assuming token might be needed later
                // 'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        console.log('Booking response:', result);

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Failed to book appointment');
        }

        return result;
    } catch (error) {
        console.error('Error booking appointment:', error);
        throw error;
    }
};
