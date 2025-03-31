import express, { Request, Response }from "express";
import Employee from "../models/Employee";

const router = express.Router();

// Crear empleado
router.post('/employee', async (req: Request, res: Response) => {
    try {
        const { name, role } = req.body;
        const newEmployee = new Employee({ name, role });
        await newEmployee.save();
        res.status(201).json({ message: 'Empleado creado', data: newEmployee});
    } catch (error) {
        console.error('Error al crear empleado', (error as Error).message)
        res.status(500).json({ message: 'Error del servidor'})
    }
})

router.get('/employee', async (req: Request, res: Response) => {
    try {
        const employee = await Employee.find();
        res.json(employee)
    } catch (error) {
        console.error('Error al obtener empleados', (error as Error).message)
        res.status(500).json({ message: 'Error del servidor'})
    }
})

export default router;
