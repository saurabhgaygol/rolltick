import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth.service';

/**
 * One glowing light drawn on top of the illustration.
 * Positions are percentages of the artwork, so they stay correct on
 * every screen size.
 */
interface Light {
  x: string;          // distance from the left edge of the artwork
  y: string;          // distance from the top edge of the artwork
  size: string;       // diameter
  tone: string;       // colour class: tone-green / tone-purple / tone-blue
  duration: string;   // how long one blink takes
  delay: string;      // negative delay = starts part-way through, so they look out of sync
}

/** A wide, flat light (the strip on the gate, the bar on the face unit). */
interface LightBar {
  x: string;
  y: string;
  width: string;
  height: string;
  tone: string;
  duration: string;
  delay: string;
}

/** A device that sends out signal rings. */
interface SignalSource {
  x: string;
  y: string;
  size: string;
}

/** A tiny particle floating upward in the dark background. */
interface Dust {
  x: string;
  y: string;
  size: string;
  duration: string;
  delay: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  /** The artwork wrapper. Needed so we can measure its width. */
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;

  form!: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  // -------------------------------------------------------------------
  // Animation data.
  // Keeping the numbers here (instead of inside the HTML) keeps the
  // template short, and you can move a light without touching markup.
  // -------------------------------------------------------------------

  /** Green status LEDs on the four readers. */
  leds: Light[] = [
    { x: '6.418%', y: '55.550%', size: '2.0%', tone: 'tone-green', duration: '2.6s', delay: '0s' },
    { x: '29.213%', y: '58.763%', size: '2.2%', tone: 'tone-green', duration: '3.0s', delay: '-0.7s' },
    { x: '40.306%', y: '45.667%', size: '2.6%', tone: 'tone-green', duration: '2.4s', delay: '-1.2s' },
    { x: '57.396%', y: '45.570%', size: '2.6%', tone: 'tone-green', duration: '3.2s', delay: '-0.4s' },
  ];

  /** The four dots in the middle. Staggered delays make them look like they travel. */
  connectorDots: Light[] = [
    { x: '26.836%', y: '37.683%', size: '1.5%', tone: 'tone-purple', duration: '2.4s', delay: '0s' },
    { x: '27.919%', y: '37.683%', size: '1.5%', tone: 'tone-purple', duration: '2.4s', delay: '-0.3s' },
    { x: '29.028%', y: '37.683%', size: '1.5%', tone: 'tone-purple', duration: '2.4s', delay: '-0.6s' },
    { x: '30.111%', y: '37.683%', size: '1.5%', tone: 'tone-purple', duration: '2.4s', delay: '-0.9s' },
  ];

  /** Soft halos: the three feature badges, plus the phone and tablet screens. */
  halos: Light[] = [
    { x: '18.648%', y: '21.178%', size: '5.4%', tone: 'tone-purple', duration: '4.2s', delay: '0s' },
    { x: '35.394%', y: '16.553%', size: '5.4%', tone: 'tone-purple', duration: '4.2s', delay: '-1.4s' },
    { x: '54.358%', y: '23.320%', size: '5.4%', tone: 'tone-purple', duration: '4.2s', delay: '-2.8s' },
    { x: '26.386%', y: '54.820%', size: '3.4%', tone: 'tone-blue', duration: '3.6s', delay: '-0.8s' },
    { x: '59.694%', y: '56.913%', size: '4.2%', tone: 'tone-blue', duration: '4.4s', delay: '-2.2s' },
  ];

  /** Readers that emit signal rings. Each source gets three rings (see ringDelays). */
  signalSources: SignalSource[] = [
    { x: '6.418%', y: '51.412%', size: '2.600%' },   // wall reader, far left
    { x: '29.134%', y: '53.311%', size: '3.000%' },   // kiosk reader
    { x: '57.343%', y: '39.679%', size: '3.600%' },   // high frequency reader
    { x: '15.293%', y: '54.868%', size: '4.649%' },   // tick circle on the door
  ];
  ringDelays: string[] = ['0s', '-1.2s', '-2.4s'];

  /** The light strip on the gate and the blue bar on the face unit. */
  lightBars: LightBar[] = [
    { x: '15.346%', y: '37.488%', width: '10.2%', height: '2.4%', tone: 'tone-blue', duration: '3.4s', delay: '0s' },
    { x: '40.914%', y: '30.623%', width: '4.6%', height: '1.6%', tone: 'tone-blue', duration: '2.8s', delay: '-1.0s' },
  ];

  /** Two big, very faint lights slowly drifting in the background. */
  auras: Light[] = [
    { x: '44%', y: '15%', size: '20%', tone: 'tone-purple', duration: '19s', delay: '0s' },
    { x: '11%', y: '47%', size: '16%', tone: 'tone-blue', duration: '23s', delay: '-6s' },
  ];

  /** Floating dust particles. */
  dust: Dust[] = [
    { x: '5%', y: '68%', size: '0.34%', duration: '16s', delay: '-1s' },
    { x: '12%', y: '30%', size: '0.28%', duration: '19s', delay: '-7s' },
    { x: '19%', y: '60%', size: '0.40%', duration: '14s', delay: '-3s' },
    { x: '24%', y: '22%', size: '0.26%', duration: '21s', delay: '-11s' },
    { x: '31%', y: '66%', size: '0.34%', duration: '17s', delay: '-5s' },
    { x: '37%', y: '40%', size: '0.30%', duration: '15s', delay: '-9s' },
    { x: '43%', y: '58%', size: '0.38%', duration: '18s', delay: '-2s' },
    { x: '48%', y: '26%', size: '0.26%', duration: '20s', delay: '-13s' },
    { x: '53%', y: '62%', size: '0.32%', duration: '16s', delay: '-6s' },
    { x: '60%', y: '34%', size: '0.36%', duration: '19s', delay: '-4s' },
    { x: '64%', y: '66%', size: '0.28%', duration: '14s', delay: '-10s' },
    { x: '15%', y: '46%', size: '0.30%', duration: '22s', delay: '-8s' },
    { x: '28%', y: '52%', size: '0.24%', duration: '17s', delay: '-14s' },
    { x: '45%', y: '70%', size: '0.32%', duration: '20s', delay: '-12s' },
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['user@gmail.com', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit(): void {
    // Outside the Angular zone: these fire a lot and none of them change data.
    this.zone.runOutsideAngular(() => {
      this.updateScale();

      // keep it right while the window is resized
      this.resizeObserver = new ResizeObserver(() => this.updateScale());
      this.resizeObserver.observe(this.stage.nativeElement);

      // the web fonts arrive late and shift the layout a little
      document.fonts?.ready.then(() => this.updateScale());
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  // -------------------------------------------------------------------
  // The design was drawn on a 3786 x 2054 artboard. Instead of fixed
  // pixel sizes we keep one number: --u, which is 1% of the artwork
  // width. Every font size and every animation distance in the CSS is a
  // multiple of --u, so everything scales with the picture.
  // -------------------------------------------------------------------
  private updateScale(): void {
    const el = this.stage?.nativeElement;
    if (!el) {
      return;
    }

    const width = el.clientWidth;

    // On the very first pass the browser may not have laid the element
    // out yet and returns 0. Writing 0 would kill every animation that
    // moves by --u, so wait one frame and measure again.
    if (width < 40) {
      requestAnimationFrame(() => this.updateScale());
      return;
    }

    el.style.setProperty('--u', width / 100 + 'px');
  }

  get email() {
    return this.form.get('email')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Show the red borders if the form is empty or wrong.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const email = this.form.value.email as string;
    const password = this.form.value.password as string;

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err: Error) => {
        this.errorMessage = err.message || 'Login failed, please try again.';
        this.loading = false;
      },
    });
  }
}