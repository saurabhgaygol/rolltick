import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* =====================================================================
   Project -> Module -> Sub Module -> Screen
   Every screen holds one level:
     0 No Access | 1 View | 2 Modify | 3 Add/Delete
   plus an optional "customized" flag.
   ===================================================================== */

export interface Screen { key: string; name: string; }
export interface SubModule { key: string; name: string; screens: Screen[]; }
export interface Module { key: string; name: string; subs: SubModule[]; }

/** level, or { l: level, c: 1 } when the screen has been customized */
export type PermValue = number | { l: number; c: number };
export type Perms = Record<string, PermValue>;

export interface Branch {
  id: number; name: string; code: string; user: string;
  state: string; city: string; contact: string; mobile: string;
  address: string; status: string; perms: Perms;
}

export interface User {
  id: number; reseller: string; name: string; ubranch: string;
  user: string; pass: string;
  country: string; state: string; city: string; zip: string;
  st1: string; st2: string;
  contact: string; mobile: string; wa: string;
  helpmail: string; helptel: string; tz: string; status: string;
  created: string; createdBy: string;
  perms: Perms; branches: Branch[];
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {

  showPassword = false;

  readonly PROJECT = 'Smart Bus';
  readonly LEVELS = ['No Access', 'View', 'Modify', 'Add/Delete'];

  resellers = ['Aurobindo International School', 'Baldwin International School',
    'Bell bunny', 'Beacon High School', 'Satcop Direct'];

  /** the whole permission tree - replace with your own list */
  modules: Module[] = [
    {
      key: 'dashboard', name: 'Dashboard', subs: [
        {
          key: 'db_over', name: 'Overview', screens: [
            { key: 'db_today', name: 'Today Summary' },
            { key: 'db_live', name: 'Live Status' },
            { key: 'db_wid', name: 'Widget Layout' },
          ]
        },
      ]
    },

    {
      key: 'tracking', name: 'Tracking', subs: [
        {
          key: 'tr_live', name: 'Live Tracking', screens: [
            { key: 'tr_map', name: 'Map View' },
            { key: 'tr_veh', name: 'Vehicle List' },
            { key: 'tr_replay', name: 'Route Replay' },
          ]
        },
        {
          key: 'tr_geo', name: 'Geofence-Address', screens: [
            { key: 'tr_gfence', name: 'Geofence' },
            { key: 'tr_addr', name: 'Address Book' },
            { key: 'tr_stop', name: 'Bus Stops' },
          ]
        },
        {
          key: 'tr_alert', name: 'Alert', screens: [
            { key: 'tr_aset', name: 'Alert Setup' },
            { key: 'tr_alog', name: 'Alert Log' },
          ]
        },
      ]
    },

    {
      key: 'reports', name: 'Reports', subs: [
        {
          key: 'rp_trips', name: 'Trips', screens: [
            { key: 'rp_tstat', name: 'Trip Status' },
            { key: 'rp_tsum', name: 'Trips Summary' },
            { key: 'rp_tatt', name: 'Trip Attendance' },
            { key: 'rp_tdata', name: 'Trip Data Summary' },
            { key: 'rp_tviol', name: 'Trip Violation Report' },
            { key: 'rp_tfail', name: 'Trip Failure Summary' },
            { key: 'rp_tveh', name: 'Vehicle Trips' },
          ]
        },
        {
          key: 'rp_students', name: 'Students', screens: [
            { key: 'rp_satt', name: 'Student Attendance' },
            { key: 'rp_sabs', name: 'Absent Report' },
            { key: 'rp_sscan', name: 'RFID Scan Log' },
            { key: 'rp_sboard', name: 'Boarding Summary' },
          ]
        },
        {
          key: 'rp_activity', name: 'Activity', screens: [
            { key: 'rp_alog', name: 'Activity Log' },
            { key: 'rp_login', name: 'Login History' },
          ]
        },
        {
          key: 'rp_geo', name: 'Geofence-Address', screens: [
            { key: 'rp_gin', name: 'Geofence In-Out' },
            { key: 'rp_gsum', name: 'Geofence Summary' },
          ]
        },
        {
          key: 'rp_sensors', name: 'Sensors', screens: [
            { key: 'rp_sdata', name: 'Sensor Data' },
            { key: 'rp_stemp', name: 'Temperature Report' },
          ]
        },
        {
          key: 'rp_alert', name: 'Alert', screens: [
            { key: 'rp_asum', name: 'Alert Summary' },
            { key: 'rp_adet', name: 'Alert Detail' },
          ]
        },
        {
          key: 'rp_reminder', name: 'Reminder', screens: [
            { key: 'rp_rlist', name: 'Reminder List' },
            { key: 'rp_rdue', name: 'Due Reminders' },
          ]
        },
        {
          key: 'rp_expense', name: 'Expense', screens: [
            { key: 'rp_exp', name: 'Expense Report' },
            { key: 'rp_expsum', name: 'Expense Summary' },
          ]
        },
        {
          key: 'rp_fuel', name: 'Fuel', screens: [
            { key: 'rp_fuel', name: 'Fuel Report' },
            { key: 'rp_mile', name: 'Mileage Report' },
            { key: 'rp_ftheft', name: 'Fuel Theft' },
          ]
        },
        {
          key: 'rp_tire', name: 'Tire', screens: [
            { key: 'rp_tire', name: 'Tire Report' },
            { key: 'rp_tirep', name: 'Tire Pressure' },
          ]
        },
        {
          key: 'rp_driver', name: 'Driver Behaviour', screens: [
            { key: 'rp_dscore', name: 'Driver Score' },
            { key: 'rp_dharsh', name: 'Harsh Events' },
            { key: 'rp_dspeed', name: 'Over Speed' },
          ]
        },
        {
          key: 'rp_hw', name: 'Hardware Maintenance', screens: [
            { key: 'rp_hwhealth', name: 'Device Health' },
            { key: 'rp_hwsrv', name: 'Service History' },
          ]
        },
        {
          key: 'rp_logs', name: 'Logs', screens: [
            { key: 'rp_smslog', name: 'SMS Log' },
            { key: 'rp_apilog', name: 'API Log' },
          ]
        },
      ]
    },

    {
      key: 'settings', name: 'Settings', subs: [
        {
          key: 'st_students', name: 'Students', screens: [
            { key: 'st_stud', name: 'Student Master' },
            { key: 'st_bulk', name: 'Bulk Upload' },
            { key: 'st_tag', name: 'RFID Tag Mapping' },
            { key: 'st_par', name: 'Parent Access' },
          ]
        },
        {
          key: 'st_staff', name: 'Staff', screens: [
            { key: 'st_staff', name: 'Staff Master' },
            { key: 'st_drv', name: 'Drivers' },
          ]
        },
        {
          key: 'st_vehicle', name: 'Vehicle', screens: [
            { key: 'st_veh', name: 'Vehicle Master' },
            { key: 'st_route', name: 'Route Master' },
          ]
        },
        {
          key: 'st_device', name: 'Device', screens: [
            { key: 'st_rfid', name: 'RFID Readers' },
            { key: 'st_cam', name: 'AI Dashcam' },
          ]
        },
        {
          key: 'st_sms', name: 'SMS', screens: [
            { key: 'st_tmpl', name: 'SMS Templates' },
            { key: 'st_gw', name: 'SMS Gateway' },
          ]
        },
        {
          key: 'st_user', name: 'User Setting', screens: [
            { key: 'st_users', name: 'User Management' },
            { key: 'st_role', name: 'Roles' },
          ]
        },
      ]
    },
  ];

  // ---- table (replace with your API call) ----------------------------
  rows: User[] = [
    {
      id: 1, reseller: 'Beacon High School', name: 'Beacon High School', ubranch: 'Head Office',
      user: 'beaconhigh@smartbus.com', pass: 'beacon@123',
      country: 'India', state: 'Maharashtra', city: 'Pune', zip: '411014',
      st1: 'Kharadi', st2: 'NA', contact: 'Rakesh Mehta', mobile: '9812345678', wa: '9096166400',
      helpmail: 'support@myschoolride.com', helptel: '', tz: 'Asia/Kolkata',
      status: 'Active', created: '2023-06-29', createdBy: 'satcop',
      perms: {
        db_today: 3, db_live: 1,
        tr_map: 1, tr_veh: 1, tr_replay: 1, tr_gfence: 2, tr_stop: 3, tr_aset: 2, tr_alog: 1,
        rp_tstat: 3, rp_tsum: 3, rp_tatt: 3, rp_tdata: 3, rp_tviol: 3, rp_tfail: 1, rp_tveh: 3,
        rp_satt: 1, rp_sabs: 1, rp_sscan: 1, rp_smslog: 1,
        st_stud: 3, st_bulk: 2, st_tag: 2, st_par: 2, st_veh: 1, st_route: 2, st_tmpl: 2,
      },
      branches: [
        {
          id: 101, name: 'Kharadi', code: 'BHS-KHR', user: 'kharadi@smartbus.com',
          state: 'Maharashtra', city: 'Pune', contact: 'Sunil Rao', mobile: '9822334455',
          address: 'Kharadi Bypass', status: 'Active',
          perms: { db_today: 1, tr_map: 1, tr_veh: 1, rp_tstat: 1, rp_tatt: 1, rp_satt: 1, st_stud: 2, st_bulk: 1 }
        },
        {
          id: 102, name: 'Baner', code: 'BHS-BNR', user: 'baner@smartbus.com',
          state: 'Maharashtra', city: 'Pune', contact: 'Meera Joshi', mobile: '9833445566',
          address: 'Baner Road', status: 'Active',
          perms: { db_today: 1, rp_tstat: 1, st_stud: 1 }
        },
      ],
    },
    {
      id: 2, reseller: 'Aurobindo International School', name: 'Famous Travel', ubranch: 'Head Office',
      user: 'famoustravel@smartbus.com', pass: 'famous@123',
      country: 'India', state: 'Maharashtra', city: 'Mumbai', zip: '400001',
      st1: 'NA', st2: 'NA', contact: 'Amit Desai', mobile: '9765432109', wa: '9096166400',
      helpmail: 'support@myschoolride.com', helptel: '', tz: 'Asia/Kolkata',
      status: 'Active', created: '2023-10-12', createdBy: 'satcop',
      perms: { db_today: 1, tr_map: 1, rp_tstat: 1, rp_tsum: 1, rp_satt: 1, st_stud: 2 },
      branches: [],
    },
    {
      id: 3, reseller: 'Baldwin International School', name: 'Baldwin International School',
      ubranch: 'Head Office', user: 'baldwininternational@smartbus.com', pass: 'baldwin@12',
      country: 'India', state: 'Karnataka', city: 'Bengaluru', zip: '560001',
      st1: 'Richmond Road', st2: 'NA', contact: 'Suresh Nair', mobile: '9776655443', wa: '9096166400',
      helpmail: 'support@myschoolride.com', helptel: '', tz: 'Asia/Kolkata',
      status: 'Active', created: '2023-07-15', createdBy: 'satcop',
      perms: { db_today: 1, rp_satt: 1, st_stud: 1 },
      branches: [],
    },
  ];

  private seq = 1000;

  page = 1;
  pageSize = 25;
  activeId: number | null = null;
  searchInput = '';
  appliedSearch = '';

  // ---- detail view ---------------------------------------------------
  openUser: User | null = null;
  tab: 'account' | 'access' | 'branches' = 'account';

  /** which module / sub module the access grid is showing */
  pickMod = '';
  pickSub = '';

  // ---- forms ---------------------------------------------------------
  userFormOpen = false;
  editingUserId: number | null = null;
  uForm = this.blankUser();

  branchFormOpen = false;
  editingBranchId: number | null = null;
  bForm = this.blankBranch();

  errors: Record<string, boolean> = {};

  /** the permission object the open form is editing */
  formPerms: Perms = {};
  /** null for a user, the parent user's perms for a branch */
  formCap: Perms | null = null;

  deleteOpen = false;
  deleteKind: 'user' | 'branch' = 'user';
  deleteId: number | null = null;

  constructor() {
    this.pickMod = this.modules[0].key;
    this.pickSub = this.modules[0].subs[0].key;
  }

  // =====================================================================
  // permission helpers
  // =====================================================================

  lvl(p: Perms, key: string): number {
    const v = p[key];
    return typeof v === 'object' ? v.l : (v || 0);
  }

  isCustom(p: Perms, key: string): boolean {
    const v = p[key];
    return typeof v === 'object' && !!v.c;
  }

  setLvl(p: Perms, key: string, v: number): void {
    const custom = this.isCustom(p, key);
    if (v > 0) { p[key] = custom ? { l: v, c: 1 } : v; }
    else { delete p[key]; }
  }

  toggleCustom(p: Perms, key: string): void {
    const l = this.lvl(p, key);
    if (!l) { return; }
    p[key] = this.isCustom(p, key) ? l : { l, c: 1 };
  }

  clonePerms(p: Perms): Perms {
    return JSON.parse(JSON.stringify(p));
  }

  get allScreens(): string[] {
    return this.modules.flatMap((m) => m.subs.flatMap((s) => s.screens.map((x) => x.key)));
  }

  granted(p: Perms): number {
    return this.allScreens.filter((k) => this.lvl(p, k) > 0).length;
  }

  subTally(p: Perms, sub: SubModule): number {
    return sub.screens.filter((s) => this.lvl(p, s.key) > 0).length;
  }

  modTally(p: Perms, mod: Module): number {
    return mod.subs.reduce((n, s) => n + this.subTally(p, s), 0);
  }

  modTotal(mod: Module): number {
    return mod.subs.reduce((n, s) => n + s.screens.length, 0);
  }

  /** 0 none, 1 some, 2 all - drives the three state checkbox */
  boxState(got: number, total: number): number {
    return got === 0 ? 0 : got === total ? 2 : 1;
  }

  /** the highest level a screen may reach, given the cap */
  maxLevel(cap: Perms | null, key: string): number {
    return cap ? this.lvl(cap, key) : 3;
  }

  /** never let a child sit above its parent */
  trimToCap(child: Perms, cap: Perms): void {
    Object.keys(child).forEach((k) => {
      const max = this.lvl(cap, k);
      if (this.lvl(child, k) > max) { this.setLvl(child, k, max); }
    });
  }

  // =====================================================================
  // the access grid
  // =====================================================================

  get currentModule(): Module {
    return this.modules.find((m) => m.key === this.pickMod) || this.modules[0];
  }

  get currentSub(): SubModule {
    const m = this.currentModule;
    return m.subs.find((s) => s.key === this.pickSub) || m.subs[0];
  }

  chooseModule(m: Module): void {
    this.pickMod = m.key;
    this.pickSub = m.subs[0].key;
  }

  chooseSub(s: SubModule): void {
    this.pickSub = s.key;
  }

  /** the grid the screen is showing: the form's, or the open user's */
  get perms(): Perms {
    if (this.userFormOpen || this.branchFormOpen) { return this.formPerms; }
    return this.openUser ? this.openUser.perms : {};
  }

  get cap(): Perms | null {
    if (this.branchFormOpen) { return this.formCap; }
    return null;
  }

  /** click one level cell */
  pickLevel(key: string, level: number): void {
    if (level > this.maxLevel(this.cap, key)) { return; }
    this.setLvl(this.perms, key, level);
    this.afterChange();
  }

  /** a column header applies that level to the whole sub module */
  pickColumn(level: number): void {
    this.currentSub.screens.forEach((sc) => {
      this.setLvl(this.perms, sc.key, Math.min(level, this.maxLevel(this.cap, sc.key)));
    });
    this.afterChange();
  }

  /** the checkbox on the project / module / sub module rows */
  toggleGroup(screens: Screen[], turnOn: boolean): void {
    screens.forEach((sc) => {
      this.setLvl(this.perms, sc.key, turnOn ? this.maxLevel(this.cap, sc.key) : 0);
    });
    this.afterChange();
  }

  toggleProject(): void {
    const all = this.modules.flatMap((m) => m.subs.flatMap((s) => s.screens));
    this.toggleGroup(all, this.granted(this.perms) === 0);
  }

  toggleModule(m: Module): void {
    this.toggleGroup(m.subs.flatMap((s) => s.screens), this.modTally(this.perms, m) === 0);
  }

  toggleSub(s: SubModule): void {
    this.toggleGroup(s.screens, this.subTally(this.perms, s) === 0);
  }

  /** the toolbar buttons */
  applyAll(level: number): void {
    this.allScreens.forEach((k) => {
      this.setLvl(this.perms, k, Math.min(level, this.maxLevel(this.cap, k)));
    });
    this.afterChange();
  }

  /** copy the parent user's grid into the branch form */
  sameAsUser(): void {
    if (!this.formCap) { return; }
    Object.keys(this.formPerms).forEach((k) => delete this.formPerms[k]);
    Object.assign(this.formPerms, this.clonePerms(this.formCap));
  }

  /** after any edit on a user, pull every branch back under the new cap */
  private afterChange(): void {
    if (!this.userFormOpen && !this.branchFormOpen && this.openUser) {
      this.openUser.branches.forEach((b) => this.trimToCap(b.perms, this.openUser!.perms));
    }
  }

  accessCount(p: Perms, cap: Perms | null): string {
    return `${this.granted(p)} of ${cap ? this.granted(cap) : this.allScreens.length} screens allowed`;
  }

  screenName(key: string): string {
    for (const m of this.modules) {
      for (const s of m.subs) {
        const x = s.screens.find((y) => y.key === key);
        if (x) { return x.name; }
      }
    }
    return key;
  }

  grantedKeys(p: Perms): string[] {
    return this.allScreens.filter((k) => this.lvl(p, k) > 0);
  }

  // =====================================================================
  // list
  // =====================================================================

  dots(v: string): string {
    return v ? '\u2022'.repeat(Math.min(v.length, 10)) : '-';
  }

  get filtered(): User[] {
    const t = this.appliedSearch.trim().toLowerCase();
    if (!t) { return this.rows; }
    return this.rows.filter((s) =>
      `${s.reseller} ${s.name} ${s.ubranch} ${s.user} ${s.city} ${s.state} ${s.contact} ${s.mobile}`
        .toLowerCase().includes(t));
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageStart(): number { return (this.page - 1) * this.pageSize; }
  get pageEnd(): number { return Math.min(this.pageStart + this.pageSize, this.filtered.length); }
  get paged(): User[] { return this.filtered.slice(this.pageStart, this.pageEnd); }

  applySearch(): void { this.appliedSearch = this.searchInput.trim(); this.page = 1; }
  clearSearch(): void { this.searchInput = ''; this.appliedSearch = ''; this.page = 1; }

  // =====================================================================
  // detail
  // =====================================================================

  open(u: User): void {
    this.openUser = u;
    this.tab = 'account';
    this.pickMod = this.modules[0].key;
    this.pickSub = this.modules[0].subs[0].key;
    window.scrollTo(0, 0);
  }

  back(): void { this.openUser = null; }

  get accountRows(): [string, string][] {
    const u = this.openUser!;
    return [
      ['Reseller', u.reseller], ['User Name', u.name], ['User Branch', u.ubranch || '-'],
      ['User Id', u.user], ['Password', this.dots(u.pass)],
      ['Country', u.country], ['State', u.state], ['City', u.city], ['Zip Code', u.zip || '-'],
      ['Street 1', u.st1 || '-'], ['Street 2', u.st2 || '-'],
      ['Contact Person', u.contact], ['Mobile Number', u.mobile],
      ['WhatsApp Number', u.wa ? '+91-' + u.wa : '-'], ['Help Desk Email', u.helpmail || '-'],
      ['Time Zone', u.tz], ['User Status', u.status],
      ['Created Date', u.created], ['Created User', u.createdBy],
    ];
  }

  // =====================================================================
  // user form
  // =====================================================================

  private blankUser() {
    return {
      reseller: '', name: '', ubranch: '', user: '', pass: '',
      country: 'India', state: '', city: '', zip: '', st1: '', st2: '',
      contact: '', mobile: '', wa: '', helpmail: '', helptel: '',
      tz: 'Asia/Kolkata', status: 'Active',
    };
  }

  openUserForm(u: User | null): void {
    this.errors = {};
    this.editingUserId = u ? u.id : null;
    this.uForm = u
      ? {
        reseller: u.reseller, name: u.name, ubranch: u.ubranch, user: u.user, pass: u.pass,
        country: u.country, state: u.state, city: u.city, zip: u.zip, st1: u.st1, st2: u.st2,
        contact: u.contact, mobile: u.mobile, wa: u.wa, helpmail: u.helpmail,
        helptel: u.helptel, tz: u.tz, status: u.status
      }
      : this.blankUser();

    this.formPerms = u ? this.clonePerms(u.perms) : {};
    this.formCap = null;
    this.pickMod = this.modules[0].key;
    this.pickSub = this.modules[0].subs[0].key;
    this.userFormOpen = true;
  }

  saveUser(): void {
    const f = this.uForm;
    this.errors = {
      reseller: !f.reseller, name: !f.name.trim(), user: !f.user.trim(),
      pass: f.pass.trim().length < 6,
      state: !f.state.trim(), city: !f.city.trim(), contact: !f.contact.trim(),
      mobile: !/^\d{10}$/.test(f.mobile.trim()),
      wa: !!f.wa.trim() && !/^\d{10}$/.test(f.wa.trim()),
      helpmail: !!f.helpmail.trim() && !/^\S+@\S+\.\S+$/.test(f.helpmail.trim()),
    };
    if (Object.values(this.errors).some(Boolean)) { return; }

    if (this.editingUserId) {
      const u = this.rows.find((x) => x.id === this.editingUserId)!;
      Object.assign(u, f, { perms: this.clonePerms(this.formPerms) });
      u.branches.forEach((b) => this.trimToCap(b.perms, u.perms));
    } else {
      this.rows.unshift({
        id: ++this.seq,
        created: new Date().toISOString().slice(0, 10),
        createdBy: 'saurabh',
        branches: [],
        perms: this.clonePerms(this.formPerms),
        ...f,
      });
      this.page = 1;
    }
    this.userFormOpen = false;
  }

  // =====================================================================
  // branch form
  // =====================================================================

  private blankBranch() {
    return {
      name: '', code: '', user: '', state: '', city: '',
      contact: '', mobile: '', address: '', status: 'Active'
    };
  }

  openBranchForm(b: Branch | null): void {
    const u = this.openUser!;
    this.errors = {};
    this.editingBranchId = b ? b.id : null;
    this.bForm = b
      ? {
        name: b.name, code: b.code, user: b.user, state: b.state, city: b.city,
        contact: b.contact, mobile: b.mobile, address: b.address, status: b.status
      }
      : { ...this.blankBranch(), state: u.state, city: u.city };

    this.formPerms = b ? this.clonePerms(b.perms) : {};
    this.formCap = u.perms;
    this.trimToCap(this.formPerms, u.perms);
    this.pickMod = this.modules[0].key;
    this.pickSub = this.modules[0].subs[0].key;
    this.branchFormOpen = true;
  }

  saveBranch(): void {
    const f = this.bForm;
    this.errors = {
      name: !f.name.trim(), code: !f.code.trim(), user: !f.user.trim(),
      state: !f.state.trim(), city: !f.city.trim(), contact: !f.contact.trim(),
      mobile: !/^\d{10}$/.test(f.mobile.trim()),
    };
    if (Object.values(this.errors).some(Boolean)) { return; }

    const u = this.openUser!;
    const perms = this.clonePerms(this.formPerms);
    this.trimToCap(perms, u.perms);              // last guard

    if (this.editingBranchId) {
      Object.assign(u.branches.find((x) => x.id === this.editingBranchId)!, f, { perms });
    } else {
      u.branches.push({ id: ++this.seq, ...f, code: f.code.toUpperCase(), perms });
    }
    this.branchFormOpen = false;
  }

  // =====================================================================
  // delete
  // =====================================================================

  askDeleteUser(): void {
    this.deleteKind = 'user';
    this.deleteId = this.editingUserId;
    this.userFormOpen = false;
    this.deleteOpen = true;
  }

  askDeleteBranch(b: Branch): void {
    this.deleteKind = 'branch';
    this.deleteId = b.id;
    this.branchFormOpen = false;
    this.deleteOpen = true;
  }

  get deletingUser(): User | undefined {
    return this.rows.find((x) => x.id === this.deleteId);
  }

  get deletingBranch(): Branch | undefined {
    return this.openUser?.branches.find((x) => x.id === this.deleteId);
  }

  /** the branch the open form is editing - used by the Delete button */
  get deletingBranchForForm(): Branch | undefined {
    return this.openUser?.branches.find((x) => x.id === this.editingBranchId);
  }

  confirmDelete(): void {
    if (this.deleteKind === 'user') {
      this.rows = this.rows.filter((x) => x.id !== this.deleteId);
      this.openUser = null;
    } else if (this.openUser) {
      this.openUser.branches = this.openUser.branches.filter((x) => x.id !== this.deleteId);
    }
    this.deleteOpen = false;
  }

  closeAll(): void {
    this.userFormOpen = false;
    this.branchFormOpen = false;
    this.deleteOpen = false;
  }

  // =====================================================================
  // excel - a real sheet so the header row can be BOLD
  // =====================================================================

  exportExcel(): void {
    const headers = ['User Name', 'Branch', 'Project', 'Module', 'Sub Module',
      'Screen', 'Access Level', 'Customized'];
    const body: string[][] = [];

    const walk = (userName: string, branchName: string, p: Perms) => {
      this.modules.forEach((m) => m.subs.forEach((s) => s.screens.forEach((sc) => {
        body.push([userName, branchName, this.PROJECT, m.name, s.name, sc.name,
          this.LEVELS[this.lvl(p, sc.key)], this.isCustom(p, sc.key) ? 'Yes' : 'No']);
      })));
    };

    this.filtered.forEach((u) => {
      walk(u.name, '-', u.perms);
      u.branches.forEach((b) => walk(u.name, b.name, b.perms));
    });

    this.download('user-screen-access.xls', headers, body);
  }

  private download(name: string, headers: string[], body: string[][]): void {
    const esc = (v: unknown) => String(v ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const th = headers.map((h) =>
      `<th style="background:#EFEAFB;font-weight:bold;border:1px solid #C6BEE2;` +
      `padding:7px 10px;white-space:nowrap;text-align:left">${esc(h)}</th>`).join('');

    const tr = body.map((row) =>
      '<tr>' + row.map((c) =>
        `<td style="border:1px solid #DED9EF;padding:6px 10px">${esc(c)}</td>`).join('') + '</tr>').join('');

    const html =
      '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8">' +
      '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
      '<x:Name>Screen Access</x:Name><x:WorksheetOptions><x:FreezePanes/>' +
      '<x:SplitHorizontal>1</x:SplitHorizontal><x:TopRowBottomPane>1</x:TopRowBottomPane>' +
      '</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
      `</head><body><table border="1"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`;

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
}