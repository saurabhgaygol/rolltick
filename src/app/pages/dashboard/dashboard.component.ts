import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/auth.service';

interface Stat {
  label: string;
  value: string;
  trend: string;
  down?: boolean;
}

interface Scan {
  name: string;
  device: string;
  time: string;
  direction: 'in' | 'out';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {

  private auth = inject(AuthService);
  user = this.auth.user;

  // Sample data. Replace with a service call when the API is ready.
  stats: Stat[] = [
    { label: 'Present today',   value: '1,248', trend: '+3.2% vs yesterday' },
    { label: 'Absent',          value: '64',    trend: '-1.1% vs yesterday', down: true },
    { label: 'Devices online',  value: '18/19', trend: '1 device offline',   down: true },
    { label: 'Scans this hour', value: '327',   trend: '+12% vs last hour' },
  ];

  recent: Scan[] = [
    { name: 'Aarav Mehta',   device: 'Main Gate - RFID',   time: '09:12 AM', direction: 'in'  },
    { name: 'Diya Sharma',   device: 'Block B - Face',     time: '09:11 AM', direction: 'in'  },
    { name: 'Kabir Nair',    device: 'Main Gate - RFID',   time: '09:10 AM', direction: 'in'  },
    { name: 'Ishaan Rao',    device: 'Staff Door - HF',    time: '09:08 AM', direction: 'out' },
    { name: 'Ananya Iyer',   device: 'Block B - Face',     time: '09:07 AM', direction: 'in'  },
  ];
}
