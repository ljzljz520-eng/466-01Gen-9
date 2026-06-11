import { Router, type Request, type Response } from 'express';
import { faultRecordRepository } from '../db/repositories.js';
import type { CreateFaultRecord } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { elevatorId } = req.query;
    const allFaults = faultRecordRepository.getAll();
    if (elevatorId) {
      const filtered = allFaults.filter(f => f.elevatorId === elevatorId);
      res.status(200).json({ success: true, data: filtered });
    } else {
      res.status(200).json({ success: true, data: allFaults });
    }
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
    const fault = faultRecordRepository.getById(id);
    if (!fault) {
      res.status(404).json({ success: false, error: 'Fault record not found' });
      return;
    }
    res.status(200).json({ success: true, data: fault });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateFaultRecord = req.body;
    if (!data.elevatorId || !data.faultDate || !data.description) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const fault = faultRecordRepository.create(data);
    res.status(200).json({ success: true, data: fault });
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
    const existing = faultRecordRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Fault record not found' });
      return;
    }
    const updated = faultRecordRepository.update(id, req.body);
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
    const deleted = faultRecordRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Fault record not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
