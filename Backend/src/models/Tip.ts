import { Schema, model, Document } from 'mongoose';

interface Payment {
    method: string,
    amount: number
}

interface Distribution {
    employeeId: string,
    amount: number 
}

export interface Tip extends Document {
    totalAmount: number;
    splitBetween: number;
    distributedTo: Distribution[];
    payments: Payment[];
    createdAt: Date;
    status: 'pendiente' | 'parcial' | 'completo';
}

const tipSchema = new Schema<Tip>({
    totalAmount: { type: Number, required: true },
    splitBetween: { type: Number, required: true},
    distributedTo: [
        {
            employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
            amount: { type: Number, required: true }
        }
    ],
    payments: [
        {
            method: String,
            amount: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pendiente', 'parcial', 'completo'],
        default: 'pendiente'
    }
});

export default model<Tip>('Tip', tipSchema)