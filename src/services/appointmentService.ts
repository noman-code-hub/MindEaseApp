export interface BookingData {
    doctorId: string;
    date: string; // YYYY-MM-DD format
    timeSlot: string; // e.g., "02:00 PM"
    appointmentType: 'online' | 'physical' | 'inclinic';
    patientName?: string;
    patientPhone?: string;
    patientEmail?: string;
    locationId?: string; // New field for in-clinic booking
    reason: string;
}

const BASE_URL = 'https://appbookingbackend.onrender.com/api/appointments';

export const bookAppointment = async (bookingData: BookingData, token: string | null = null) => {
    try {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(bookingData)
        });

        const responseText = await response.text();
        console.log(`[API REQUEST] POST ${BASE_URL}`);
        console.log('[API PAYLOAD]', JSON.stringify(bookingData, null, 2));
        console.log(`[API RESPONSE] Status: ${response.status}`);
        console.log('[API BODY]', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('[API ERROR] Failed to parse response as JSON:', responseText);
            throw new Error(`Server returned invalid response: ${response.status}`);
        }

        if (!response.ok) {
            console.error('[API FAILURE]', result);
            throw new Error(result.message || result.error || `Booking failed with status ${response.status}`);
        }

        console.log('[API SUCCESS] Appointment booked successfully:', result.data?._id || result._id || 'N/A');
        return result;
    } catch (error) {
        console.error('Error booking appointment:', error);
        throw error;
    }
};
export const startPayment = async (paymentData: { appointmentId: string; paymentMethod: string; amount: number; userId: string }, token: string | null = null) => {
    const PAYMENT_URL = 'https://appbookingbackend.onrender.com/api/payments/start';
    try {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(PAYMENT_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(paymentData)
        });

        const responseText = await response.text();
        console.log(`[API REQUEST] POST ${PAYMENT_URL}`);
        console.log('[API PAYLOAD]', JSON.stringify(paymentData, null, 2));
        console.log(`[API RESPONSE] Status: ${response.status}`);
        console.log('[API BODY]', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Server returned invalid response: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(result.message || result.error || `Payment start failed with status ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error starting payment:', error);
        throw error;
    }
};
