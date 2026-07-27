# Login App

A complete, runnable Angular 18 project: the login screen, and everything
behind it - sidebar layout, dashboard, and sample pages you can copy.

Verified with a clean `npm install` and `npm run build` on Node 22.

---

## Run it

You need **Node.js 18.19+ / 20.11+ / 22**. Check with `node -v`.

```bash
cd login-app
npm install        # first time only, takes a couple of minutes
npm start          # opens http://localhost:4200
```

**Log in with any email and any password of 6 or more characters.**
The login is faked for now - see "Connect your real API" below.

Build for the server:

```bash
npm run build      # output goes to dist/login-app/browser
```

Upload everything inside `dist/login-app/browser/` to your web host.

---

## How the app flows

```
/login                 the design screen
   |  correct password
   v
/app                   the shell: sidebar + top bar (guarded)
   |- /app/dashboard   stat cards + recent scans table
   |- /app/attendance  placeholder page
   \- /app/settings    shows the signed-in account
```

* Not logged in and you open `/app/...` -> you are pushed back to `/login`.
* Already logged in and you open `/login` -> you are pushed to the dashboard.
* Refreshing keeps you logged in (token sits in `localStorage`).
* **Log out** is at the bottom of the sidebar.

Those two rules are the guards in `src/app/core/auth.guard.ts`, four lines each.

---

## What's inside

```
login-app/
|- package.json          dependencies + npm start / npm run build
|- angular.json          Angular CLI settings
|- tsconfig.json
\- src/
   |- index.html         the single page; Google Fonts linked here
   |- main.ts            starts the app
   |- styles.css         global reset (2 lines)
   |- app/
   |  |- app.component.ts    empty shell, just <router-outlet>
   |  |- app.config.ts       app-wide providers
   |  |- app.routes.ts       <- the route table, read this first
   |  |- core/
   |  |  |- auth.service.ts  login / logout / token / current user
   |  |  \- auth.guard.ts    who is allowed on which route
   |  |- layout/
   |  |  \- shell.component.*   sidebar + top bar + <router-outlet>
   |  |- login/
   |  |  \- login.component.*   the design screen
   |  \- pages/
   |     |- dashboard/       <- copy this folder to make a new page
   |     |- attendance/
   |     \- settings/
   \- assets/
      |- login-hero.webp    the illustration
      \- logo.svg           PLACEHOLDER - replace with your logo
```

---

## Add a new page (3 steps)

Say you want **Reports**.

**1.** Copy `src/app/pages/attendance/` to `src/app/pages/reports/`, rename the
three files, and change the class name and selector inside:

```ts
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {}
```

**2.** One line in `src/app/app.routes.ts`, inside the `children` array:

```ts
{ path: 'reports', component: ReportsComponent },
```

**3.** One line in the `nav` array in `src/app/layout/shell.component.ts`:

```ts
{ label: 'Reports', path: '/app/reports', icon: 'grid' },
```

Done. It shows up in the sidebar, and it is protected by the login guard
automatically because it lives under `/app`.

---

## Put your own logo in

Replace **`src/assets/logo.svg`** with your company logo. It is used in two
places (login screen and sidebar) and both pick it up automatically.

* Any format works (svg, png, webp). If the file name changes, update the
  `src="assets/logo.svg"` line in `login.component.html` and
  `shell.component.html`.
* Keep the shape roughly **3.7 : 1** (wide, e.g. 300 x 82).
* The old logo is already erased from the illustration, so nothing overlaps.

---

## Connect your real API

Everything to change sits in **`src/app/core/auth.service.ts`**, in `login()`.
Replace the fake block with:

```ts
login(email: string, password: string): Observable<User> {
  return this.http
    .post<{ token: string; user: User }>('/api/login', { email, password })
    .pipe(
      tap((res) => this.store(res.token, res.user)),
      map((res) => res.user),
    );
}
```

Add at the top of the file:

```ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
```

and inside the class:

```ts
private http = inject(HttpClient);
```

Then register HttpClient in `src/app/app.config.ts`:

```ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
```

Nothing in the login screen or the guards changes - they only talk to
`AuthService`.

To attach the token to every request later, add an interceptor that reads
`authService.token`.

---

## How the login screen sizing works (the only "trick" in the code)

The design was drawn on a **3786 x 2054** artboard.

1. Every position and size in `login.component.css` is a **percentage** of that
   artboard, so nothing ever drifts out of place.
2. Font sizes cannot be percentages. So the component keeps one CSS variable,
   **`--u` = 1% of the artwork width** (set by `updateScale()` in
   `login.component.ts`, re-run on every window resize), and each font size is
   written as `calc(var(--u) * something)`.

Want more or less white space around the artwork? Change `--gap` at the top of
`login.component.css`.

---

## Responsive behaviour

| Screen | Login page | Pages after login |
| --- | --- | --- |
| Wide and tall | Full illustration, form on the right | Sidebar always visible |
| Under 900px wide, or under 600px tall | Illustration hidden, brand purple panel, logo top-left, form centred | Sidebar becomes a slide-in drawer, hamburger in the top bar |

People who switched animations off in their OS see the same screens without
motion.

---

## Notes

* Fonts (Inter + Playfair Display) load from Google Fonts via the `<link>` tags
  in `src/index.html`. For offline users, download them into
  `src/assets/fonts/` and point the CSS `font-family` there instead.
* `optimization.fonts` is `false` in `angular.json` so `npm run build` also
  works on a machine without internet.
* The session lives in `localStorage` under `auth_token` / `auth_user`.
