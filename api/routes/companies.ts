import { Router, type Request, type Response } from 'express';
import { maintenanceCompanyRepository } from '../db/repositories.js';
import type { CreateMaintenanceCompany } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const companies = maintenanceCompanyRepository.getAll();
    res.status(200).json({ success: true, data: companies });
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
    const company = maintenanceCompanyRepository.getById(id);
    if (!company) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateMaintenanceCompany = req.body;
    if (!data.name || !data.contactPerson || !data.contactPhone) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const company = maintenanceCompanyRepository.create(data);
    res.status(200).json({ success: true, data: company });
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
    const existing = maintenanceCompanyRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    const updated = maintenanceCompanyRepository.update(id, req.body);
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
    const deleted = maintenanceCompanyRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
