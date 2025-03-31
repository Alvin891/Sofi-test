import express, {Request, Response } from 'express';
import Tip from '../models/Tip';

const router = express.Router();

// Dar una propina
router.post('/tips/start', async (req: Request, res: Response) =>{
    try {
        const { totalAmount, splitBetween } = req.body;
        const newTip = new Tip({
            totalAmount,
            splitBetween,
            payments: [],
            distribuite: [],
            status: 'pendiente'
        });
        
        await newTip.save();

        res.status(200).json({ mesagge: 'Propina registrada', data: newTip })
    } catch (error) {
        console.error('Error al registrar la propina', (error as Error).message)
        res.status(500).json({ messsage: 'Error del servidor'})
    }
});

router.patch('/tips/:id/pay', async (req: Request, res: Response)=>{
    try {
        const { id } = req.params;
        const { method, amount } = req.body;

        if (!method || !amount || amount <=0) {
            res.status(400).json({ message: 'Método o monto inválido' });
            return
        }

        const tip = await Tip.findById(id)
        if (!tip) {
            res.send(404).json({ message: 'Propina no encontrada' });
            return
        }
        if (tip.status === 'completo') {
            res.status(400).json({ message: 'La propina ya fue pagada en su totalidad' });
            return;
        }

        const totalPagadoPrevio = tip.payments.reduce((sum, p) => sum + p.amount, 0);
        const restante = tip.totalAmount - totalPagadoPrevio;
    
        let pagoRegistrado = amount;
        let cambio = 0;
    
        if (amount >= restante) {
            pagoRegistrado = restante;
            cambio = amount - restante;
        }
        tip.payments.push({ method, amount: pagoRegistrado });

    const totalPagadoFinal = totalPagadoPrevio + pagoRegistrado;

    if (totalPagadoFinal >= tip.totalAmount) {
        tip.status = 'completo';
    } else {
        tip.status = 'parcial';
    }
        await tip.save();
        res.status(200).json({
            message: 'Pago registrado',
            data: tip,
            cambio: cambio > 0 ? cambio : undefined
        });
    } catch (error) {
        console.error('Error al registrar el pago', (error as Error).message)
        res.status(500).json({ messsage: 'Error del servidor'})
    }
});

router.patch('/tips/:id/distribute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { employeeIds } = req.body; // ["id1", "id2", ...]

        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            res.status(400).json({ message: 'Debes enviar una lista de empleados' });
            return
        }

        const tip = await Tip.findById(id);
        if (!tip) {
            res.status(404).json({ message: 'Propina no encontrada' });
            return
        }

        if (tip.status !== 'completo') {
            res.status(400).json({ message: 'La propina aún no ha sido pagada completamente' });
            return
        }
        if (employeeIds.length !== tip.splitBetween) {
            res.status(400).json({
            message: `Debes distribuir exactamente entre ${tip.splitBetween} empleados`,
            });
            return
        }

        const amountPerEmployee = tip.totalAmount / tip.splitBetween;

        tip.distributedTo = employeeIds.map(id => ({
            employeeId: id,
            amount: amountPerEmployee
        }));
        await tip.save();
        res.status(200).json({
            message: 'Propina distribuida automáticamente de forma equitativa',
            data: tip
        });
    } catch (error) {
        console.error('Error al distribuir la propina', (error as Error).message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.get('/tips', async (req: Request, res: Response) => {
    try {
        const tips = await Tip.find().populate({
            path: 'distributedTo.employeeId',
            select: 'name role' 
        });
        res.status(200).json(tips)
    } catch (error) {
        console.error('Error al obtener las propinas', (error as Error).message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.get('/tips/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tip = await Tip.findById(id).populate({
            path: 'distributedTo.employeeId',
            select: 'name role'
        });

        if (!tip){
            res.status(404).json({ message: 'Propina no encontrada'})
            return
        }
        res.status(200).json(tip)
    } catch (error) {
        console.error('Error al obtener la propina', (error as Error).message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router