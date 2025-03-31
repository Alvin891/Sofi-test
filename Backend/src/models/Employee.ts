import { Schema, model, Document } from 'mongoose';

export interface Employee extends Document {
    name: String,
    role?: string 
}

const employeeSchema = new Schema<Employee>({
    name: { type: String, required: true },
    role: { type: String, default: 'Empleado' }
})

export default model<Employee>('Employee', employeeSchema)