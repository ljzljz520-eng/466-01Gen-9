import { Router, type Request, type Response } from 'express';
import { inspectionReportRepository } from '../db/repositories.js';
import type { CreateInspectionReport } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const reports = inspectionReportRepository.getAll();
    res.status(200).json({ success: true, data: reports });
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
    const report = inspectionReportRepository.getById(id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Inspection report not found' });
      return;
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateInspectionReport = req.body;
    if (!data.elevatorId || !data.companyId || !data.reportDate) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const report = inspectionReportRepository.create(data);
    res.status(200).json({ success: true, data: report });
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
    const existing = inspectionReportRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Inspection report not found' });
      return;
    }
    const updated = inspectionReportRepository.update(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.put('/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { reviewerId, reviewComment, approved } = req.body;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    if (!reviewerId || !reviewComment) {
      res.status(400).json({ success: false, error: 'Missing required fields: reviewerId, reviewComment' });
      return;
    }
    const existing = inspectionReportRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Inspection report not found' });
      return;
    }
    const status = approved === false ? 'rejected' : 'approved';
    const updated = inspectionReportRepository.update(id, {
      status,
      reviewerId,
      reviewComment,
      reviewDate: new Date().toISOString(),
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.put('/:id/reject', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { reviewerId, reviewComment } = req.body;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    if (!reviewerId || !reviewComment) {
      res.status(400).json({ success: false, error: 'Missing required fields: reviewerId, reviewComment' });
      return;
    }
    const existing = inspectionReportRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Inspection report not found' });
      return;
    }
    const updated = inspectionReportRepository.update(id, {
      status: 'rejected',
      reviewerId,
      reviewComment,
      reviewDate: new Date().toISOString(),
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
    const deleted = inspectionReportRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Inspection report not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
