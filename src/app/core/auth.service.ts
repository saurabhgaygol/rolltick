import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export interface User {
  name: string;
  email: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Holds the logged-in user and the token.
 * Everything the rest of the app needs to know about login lives here.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  /** Current user, or null. Components read this to show the name. */
  readonly user = signal<User | null>(this.readUser());

  // -------------------------------------------------------------------
  // FAKE LOGIN — swap this method for your real API call.
  //
  //   return this.http.post<{ token: string; user: User }>('/api/login', { email, password })
  //     .pipe(
  //       tap(res => this.store(res.token, res.user)),
  //       map(res => res.user),
  //     );
  //
  // For now: any email works as long as the password is 6+ characters.
  // -------------------------------------------------------------------
  login(email: string, password: string): Observable<User> {
    if (password.length < 6) {
      return throwError(() => new Error('Wrong email or password'));
    }

    const user: User = { name: this.nameFromEmail(email), email };
    this.store('demo-token', user);
    return of(user).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  /** Put this in an HTTP interceptor header when you wire the real API. */
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private store(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private nameFromEmail(email: string): string {
    const handle = email.split('@')[0].replace(/[._-]+/g, ' ');
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  }
}
