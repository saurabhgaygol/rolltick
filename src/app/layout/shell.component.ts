import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;   // key used by the <svg> switch in the template
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
    { label: 'Dashboard',  path: '/app/dashboard',  icon: 'grid' },
    { label: 'Attendance', path: '/app/attendance', icon: 'users' },
    { label: 'Settings',   path: '/app/settings',   icon: 'gear' },
  ];

  /** Sidebar drawer state on small screens. */
  menuOpen = signal(false);

  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.slice(0, 1).toUpperCase() || 'U';
  });

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
