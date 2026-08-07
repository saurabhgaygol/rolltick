import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth.service';

interface NavChild {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: string;   // key used by the <svg> switch in the template
  children?: NavChild[];
}

/**
 * The frame every page after login sits in:
 * sidebar on the left, top bar, and a <router-outlet> for the page itself.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
})
export class ShellComponent {

  /** Add a line here and a route in app.routes.ts - that is a new page. */
  nav: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/app/dashboard',
      icon: 'grid',
      children: [],
    },
    {
      label: 'Attendance',
      path: '/app/attendance',
      icon: 'users',
      children: [],
    },
    {
      label: 'Report',
      path: '/app/report',
      icon: 'report',
      children: [],
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: 'gear',
      children: [
        { label: 'Users', path: '/app/settings/user' },
        { label: 'Student', path: '/app/settings/student' },
        { label: 'Scanners', path: '/app/settings/scanners' },
        { label: 'Users', path: '/app/settings/users' },
        { label: 'Report', path: '/app/settings/report' },
      ],
    },
  ];

  /** Sidebar drawer state on small screens. */
  menuOpen = signal(false);

  /** Which group is expanded in the mobile drawer (path of the parent). */
  openGroup = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.slice(0, 1).toUpperCase() || 'U';
  });

  trackByPath = (_: number, item: { path: string }) => item.path;

  /** Mobile only - desktop opens the flyout on hover/focus instead. */
  toggleGroup(path: string): void {
    this.openGroup.update((open) => (open === path ? null : path));
  }

  isGroupOpen(path: string): boolean {
    return this.openGroup() === path;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.openGroup.set(null);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}