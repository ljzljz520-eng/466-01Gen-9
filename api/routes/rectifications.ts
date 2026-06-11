import { Router, type Request, type Response } from 'express';
import { rectificationRepository } from '../db/repositories.js';
import type { CreateRectification } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const rectifications = rectificationRepository.getAll();
    res.status(200).json({ success: true, data: rectifications });
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
    const rectification = rectificationRepository.getById(id);
    if (!rectification) {
      res.status(404).json({ success: false, error: 'Rectification not found' });
      return;
    }
    res.status(200).json({ success: true, data: rectification });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateRectification = req.body;
    if (!data.reportId || !data.elevatorId || !data.description || !data.responsible || !data.deadline) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const rectification = rectificationRepository.create(data);
    res.status(200).json({ success: true, data: rectification });
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
    const existing = rectificationRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Rectification not found' });
      return;
    }
    const updated = rectificationRepository.update(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.put('/:id/complete', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const existing = rectificationRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Rectification not found' });
      return;
    }
    const updated = rectificationRepository.update(id, {
      status: 'completed',
      completionDate: new Date().toISOString(),
    });
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
    const deleted = rectificationRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Rectification not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
