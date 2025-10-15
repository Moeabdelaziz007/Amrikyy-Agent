const db = require('../database/db'); // Assuming a db connection module

class Booking {
    constructor(data) {
        this.id = data.id;
        this.telegram_id = data.telegram_id;
        this.offer_id = data.offer_id;
        this.destination = data.destination;
        this.start_date = data.start_date;
        this.end_date = data.end_date;
        this.travelers = data.travelers;
        this.total_price = data.total_price;
        this.status = data.status;
        this.payment_method = data.payment_method;
        this.payment_status = data.payment_status;
        this.booking_reference = data.booking_reference;
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async save(data) {
        const {
            telegram_id,
            offer_id,
            destination,
            start_date,
            end_date,
            travelers,
            total_price,
            status,
            payment_method,
            payment_status,
            booking_reference,
            notes
        } = data;
        const { rows } = await db.query(
            'INSERT INTO bookings (telegram_id, offer_id, destination, start_date, end_date, travelers, total_price, status, payment_method, payment_status, booking_reference, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [telegram_id, offer_id, destination, start_date, end_date, travelers, total_price, status, payment_method, payment_status, booking_reference, notes]
        );
        return new Booking(rows[0]);
    }

    static async update(id, data) {
        // Implementation for updating a booking
        return { id, ...data };
    }

    static async delete(id) {
        // Implementation for deleting a booking
        return { id };
    }

    static async getItinerary(id) {
        // Implementation for getting an itinerary
        return { id, itinerary: [] };
    }
}

module.exports = Booking;
