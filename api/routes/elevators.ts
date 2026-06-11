import { Router, type Request, type Response } from 'express';
import { elevatorRepository, faultRecordRepository, inspectionReportRepository } from '../db/repositories.js';
import type { CreateElevator } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const elevators = elevatorRepository.getAll();
    res.status(200).json({ success: true, data: elevators });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const elevator = elevatorRepository.getById(id);
    if (!elevator) {
      res.status(404).json({ success: false, error: 'Elevator not found' });
      return;
    }
    res.status(200).json({ success: true, data: elevator });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.get('/:id/faults', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const elevator = elevatorRepository.getById(id);
    if (!elevator) {
      res.status(404).json({ success: false, error: 'Elevator not found' });
      return;
    }
    const allFaults = faultRecordRepository.getAll();
    const faults = allFaults.filter(f => f.elevatorId === id);
    res.status(200).json({ success: true, data: faults });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.get('/:id/reports', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const elevator = elevatorRepository.getById(id);
    if (!elevator) {
      res.status(404).json({ success: false, error: 'Elevator not found' });
      return;
    }
    const allReports = inspectionReportRepository.getAll();
    const reports = allReports.filter(r => r.elevatorId === id);
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateElevator = req.body;
    if (!data.building || !data.nextInspectionDate || !data.maintenanceCompanyId) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const elevator = elevatorRepository.create(data);
    res.status(200).json({ success: true, data: elevator });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const existing = elevatorRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Elevator not found' });
      return;
    }
    const updated = elevatorRepository.update(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const deleted = elevatorRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Elevator not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
