import { Router, type Request, type Response } from 'express';
import { reminderRepository, elevatorRepository } from '../db/repositories.js';
import type { CreateReminder, ReminderType } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const reminders = reminderRepository.getAll();
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.get('/check', (req: Request, res: Response): void => {
  try {
    const elevators = elevatorRepository.getAll();
    const existingReminders = reminderRepository.getAll();
    const existingKeys = new Set(existingReminders.map(r => `${r.elevatorId}-${r.type}`));
    let count = 0;
    const now = new Date();

    for (const elevator of elevators) {
      const nextInspection = new Date(elevator.nextInspectionDate);
      const diffTime = nextInspection.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const typesToCheck: ReminderType[] = ['30days', '15days', '7days', '1day'];
      const thresholds: Record<ReminderType, number> = {
        '30days': 30,
        '15days': 15,
        '7days': 7,
        '1day': 1,
      };

      for (const type of typesToCheck) {
        if (diffDays > 0 && diffDays <= thresholds[type]) {
          const key = `${elevator.id}-${type}`;
          if (!existingKeys.has(key)) {
            const data: CreateReminder = {
              elevatorId: elevator.id,
              type,
            };
            reminderRepository.create(data);
            existingKeys.add(key);
            count++;
          }
        }
      }
    }

    res.status(200).json({ success: true, data: { generated: count } });
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
    const reminder = reminderRepository.getById(id);
    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }
    res.status(200).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data: CreateReminder = req.body;
    if (!data.elevatorId || !data.type) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const reminder = reminderRepository.create(data);
    res.status(200).json({ success: true, data: reminder });
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
    const existing = reminderRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }
    const updated = reminderRepository.update(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

router.put('/:id/read', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing id parameter' });
      return;
    }
    const existing = reminderRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }
    const updated = reminderRepository.update(id, { isRead: true });
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
    const deleted = reminderRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

export default router;
