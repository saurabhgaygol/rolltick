import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** One device row. */
export interface Device {
  id: number;
  user: string;
  branch: string;
  name: string;
  type: string;
  loc: string;
  emi: string;
  conn: string;
  sim: string;
  created: string;   // filled in by the system
  cuser: string;     // filled in by the system
}

interface Chip { key: string; label: string; value: string; }

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device.component.html',
  styleUrl: './device.component.css',
})
export class DeviceComponent {

  // ---- masters (replace with values from your API) --------------------
  usersAndBranches: Record<string, string[]> = {
    'Beacon High School': ['Head Office', 'Kharadi', 'Baner'],
    'Famous Travel': ['Head Office'],
    'Academic Heights Public School': ['Hyderabad', 'Beeramguda', 'Mallampet'],
    'Baldwin International School': ['Head Office', 'Richmond Road'],
  };

  types = ['UHF RFID Reader', 'HF RFID Reader', 'Face Recognition', 'AI Dashcam', 'GPS Tracker'];
  locations = ['Main Gate', 'Gate 2', 'Block A', 'Block B',
    'Bus MH12AB1234', 'Bus MH12CD5678', 'Reception', 'Staff Door'];
  connections = ['SIM (4G)', 'SIM (2G)', 'Wi-Fi', 'LAN / Ethernet', 'Offline'];
  createdUsers = ['satcop', 'saurabh', 'pranay', 'office'];

  // ---- data ----------------------------------------------------------
  rows: Device[] = [
    {
      id: 1, user: 'Beacon High School', branch: 'Kharadi',
      name: 'Main Gate Reader', type: 'UHF RFID Reader', loc: 'Main Gate',
      emi: '860123456789012', conn: 'SIM (4G)', sim: '89910123456789012345',
      created: '2026-04-12', cuser: 'satcop',
    },
    {
      id: 2, user: 'Beacon High School', branch: 'Baner',
      name: 'Block B Face Unit', type: 'Face Recognition', loc: 'Block B',
      emi: '860234567890123', conn: 'Wi-Fi', sim: '',
      created: '2026-05-03', cuser: 'saurabh',
    },
    {
      id: 3, user: 'Academic Heights Public School', branch: 'Hyderabad',
      name: 'Bus MH12AB1234 Dashcam', type: 'AI Dashcam', loc: 'Bus MH12AB1234',
      emi: '860345678901234', conn: 'SIM (2G)', sim: '89910987654321098765',
      created: '2026-06-21', cuser: 'pranay',
    },
  ];

  private seq = 100;

  page = 1;
  pageSize = 25;
  activeId: number | null = null;

  // ---- filters -------------------------------------------------------
  filtersOpen = false;

  filters = {
    user: '', branch: '', type: '', loc: '', conn: '',
    from: '', to: '', cuser: '',
  };

  searchInput = '';
  appliedSearch = '';

  private readonly chipLabels: Record<string, string> = {
    search: 'Search', user: 'User', branch: 'Branch', type: 'Type',
    loc: 'Location', conn: 'Connectivity', from: 'From', to: 'To', cuser: 'Created by',
  };

  // ---- add / edit -----------------------------------------------------
  formOpen = false;
  editingId: number | null = null;
  form = this.blankForm();
  errors: Record<string, boolean> = {};
  emiTaken = false;

  // ---- delete ---------------------------------------------------------
  deleteOpen = false;
  deleteMany = false;
  deletingId: number | null = null;

  // ---- bulk upload ----------------------------------------------------
  uploadOpen = false;
  uploadMsg = '';
  uploadOk = false;
  private pendingRows: string[][] | null = null;

  // ---- bulk delete ----------------------------------------------------
  bulkOpen = false;
  bulkScope = { user: '', branch: '', type: '' };
  bulkMsg = '';
  bulkOk = false;
  bulkTargets: number[] = [];
  bulkTotal = 0;
  bulkMissed = 0;

  private readonly exportHeaders = [
    'User Name', 'User Branch', 'Device Name', 'Device Type', 'Device Location',
    'Device EMI No', 'Device Connectivity', 'Device SIM No', 'Created Date', 'Created User',
  ];

  /** Created Date and Created User are NOT here - the system fills them in. */
  private readonly templateHeaders = [
    'User Name', 'User Branch', 'Device Name', 'Device Type', 'Device Location',
    'Device EMI No', 'Device Connectivity', 'Device SIM No',
  ];

  // =====================================================================
  // helpers
  // =====================================================================

  get userNames(): string[] { return Object.keys(this.usersAndBranches); }

  branchesFor(user: string): string[] {
    return user
      ? this.usersAndBranches[user] ?? []
      : Object.values(this.usersAndBranches).flat();
  }

  get filterBranches(): string[] { return this.branchesFor(this.filters.user); }
  get formBranches(): string[] { return this.branchesFor(this.form.user); }
  get bulkBranches(): string[] { return this.branchesFor(this.bulkScope.user); }

  /** a SIM number only makes sense on a SIM based device */
  needsSim(conn: string): boolean { return conn.startsWith('SIM'); }

  typeClass(t: string): string {
    if (t.includes('RFID')) { return 'rfid'; }
    if (t.includes('Face')) { return 'face'; }
    if (t.includes('Dashcam')) { return 'dashcam'; }
    if (t.includes('GPS')) { return 'gps'; }
    return 'other';
  }

  // =====================================================================
  // filtering
  // =====================================================================

  onFilterUserChange(): void { this.filters.branch = ''; this.page = 1; }
  onFormUserChange(): void { this.form.branch = ''; }

  onFormConnChange(): void {
    if (!this.needsSim(this.form.conn)) { this.form.sim = ''; }
  }

  get filtered(): Device[] {
    const f = this.filters;
    const term = this.appliedSearch.trim().toLowerCase();

    return this.rows.filter((r) => {
      if (f.user && r.user !== f.user) { return false; }
      if (f.branch && r.branch !== f.branch) { return false; }
      if (f.type && r.type !== f.type) { return false; }
      if (f.loc && r.loc !== f.loc) { return false; }
      if (f.conn && r.conn !== f.conn) { return false; }
      if (f.cuser && r.cuser !== f.cuser) { return false; }
      if (f.from && r.created < f.from) { return false; }
      if (f.to && r.created > f.to) { return false; }

      if (term) {
        const hay = `${r.name} ${r.type} ${r.loc} ${r.emi} ${r.sim} ${r.conn} ${r.user} ${r.branch}`
          .toLowerCase();
        if (!hay.includes(term)) { return false; }
      }
      return true;
    });
  }

  get activeChips(): Chip[] {
    const f = this.filters as unknown as Record<string, string>;
    const out: Chip[] = [];
    if (this.appliedSearch) {
      out.push({ key: 'search', label: 'Search', value: this.appliedSearch });
    }
    Object.keys(f).forEach((k) => {
      if (f[k]) { out.push({ key: k, label: this.chipLabels[k], value: f[k] }); }
    });
    return out;
  }

  clearChip(key: string): void {
    if (key === 'search') {
      this.searchInput = '';
      this.appliedSearch = '';
    } else {
      (this.filters as unknown as Record<string, string>)[key] = '';
      if (key === 'user') { this.filters.branch = ''; }
    }
    this.page = 1;
  }

  resetFilters(): void {
    this.filters = { user: '', branch: '', type: '', loc: '', conn: '', from: '', to: '', cuser: '' };
    this.searchInput = '';
    this.appliedSearch = '';
    this.page = 1;
  }

  applySearch(): void { this.appliedSearch = this.searchInput.trim(); this.page = 1; }
  clearSearch(): void { this.searchInput = ''; this.appliedSearch = ''; this.page = 1; }

  // =====================================================================
  // paging
  // =====================================================================

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageStart(): number { return (this.page - 1) * this.pageSize; }
  get pageEnd(): number { return Math.min(this.pageStart + this.pageSize, this.filtered.length); }
  get paged(): Device[] { return this.filtered.slice(this.pageStart, this.pageEnd); }

  // =====================================================================
  // add / edit
  // =====================================================================

  private blankForm() {
    return { user: '', branch: '', name: '', type: '', loc: '', emi: '', conn: '', sim: '' };
  }

  openForm(id: number | null): void {
    this.errors = {};
    this.emiTaken = false;
    this.editingId = id;

    const r = id ? this.rows.find((x) => x.id === id) : null;
    this.form = r
      ? {
        user: r.user, branch: r.branch, name: r.name, type: r.type,
        loc: r.loc, emi: r.emi, conn: r.conn, sim: r.sim
      }
      : this.blankForm();

    this.formOpen = true;
  }

  get formTitle(): string { return this.editingId ? 'Edit Device' : 'Add Device'; }

  get formSub(): string {
    const r = this.editingId ? this.rows.find((x) => x.id === this.editingId) : null;
    return r ? `${r.name} \u00b7 ${r.emi}` : 'Fill in the details below.';
  }

  saveForm(): void {
    const f = this.form;
    const emi = f.emi.trim();
    const sim = f.sim.trim();

    this.emiTaken = /^\d{15}$/.test(emi) &&
      this.rows.some((x) => x.emi === emi && x.id !== this.editingId);

    this.errors = {
      user: !f.user, branch: !f.branch, name: !f.name.trim(),
      type: !f.type, loc: !f.loc.trim(), conn: !f.conn,
      emi: !/^\d{15}$/.test(emi) || this.emiTaken,
      sim: (!!sim && !/^\d{19,20}$/.test(sim)) || (this.needsSim(f.conn) && !sim),
    };
    if (Object.values(this.errors).some(Boolean)) { return; }

    const data = {
      user: f.user, branch: f.branch, name: f.name.trim(), type: f.type,
      loc: f.loc.trim(), emi, conn: f.conn, sim,
    };

    if (this.editingId) {
      Object.assign(this.rows.find((x) => x.id === this.editingId)!, data);
    } else {
      this.rows.unshift({
        id: ++this.seq,
        created: new Date().toISOString().slice(0, 10),
        cuser: 'saurabh',                       // put the signed-in user here
        ...data,
      });
      this.page = 1;
    }
    this.formOpen = false;
  }

  /** message under the SIM box - it changes with the reason */
  get simError(): string {
    if (this.needsSim(this.form.conn) && !this.form.sim.trim()) {
      return 'Required for a SIM based device';
    }
    return 'Enter 19 or 20 digits';
  }

  get emiError(): string {
    return this.emiTaken ? 'This EMI number is already used' : 'Enter 15 digits';
  }

  // =====================================================================
  // delete
  // =====================================================================

  askDelete(id: number): void {
    this.deleteMany = false;
    this.deletingId = id;
    this.formOpen = false;
    this.deleteOpen = true;
  }

  get deletingRow(): Device | undefined {
    return this.rows.find((x) => x.id === this.deletingId);
  }

  confirmDelete(): void {
    if (this.deleteMany) {
      const kill = new Set(this.bulkTargets);
      this.rows = this.rows.filter((r) => !kill.has(r.id));
      this.bulkTargets = [];
      this.bulkMsg = '';
    } else {
      this.rows = this.rows.filter((r) => r.id !== this.deletingId);
    }
    this.deleteOpen = false;
  }

  // =====================================================================
  // bulk upload
  // =====================================================================

  openUpload(): void {
    this.pendingRows = null;
    this.uploadMsg = '';
    this.uploadOk = false;
    this.uploadOpen = true;
  }

  onUploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.readUpload(input.files[0]); }
  }

  onUploadDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) { this.readUpload(file); }
  }

  private readUpload(file: File): void {
    if (!/\.csv$/i.test(file.name)) {
      this.uploadOk = false;
      this.uploadMsg = `${file.name} - only .csv is read here. Add the xlsx library to accept .xlsx.`;
      this.pendingRows = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = this.parseCsv(String(reader.result)).slice(1);
      const good: string[][] = [];
      let dup = 0;

      rows.forEach((c) => {
        const emi = (c[5] || '').trim();
        if (!emi) { return; }
        const clash = this.rows.some((x) => x.emi === emi) ||
          good.some((g) => (g[5] || '').trim() === emi);
        if (clash) { dup++; } else { good.push(c); }
      });

      this.pendingRows = good;
      this.uploadOk = good.length > 0;
      this.uploadMsg = `${file.name} - ${good.length} ready` +
        (dup ? `, ${dup} skipped (duplicate EMI)` : '') + '.';
    };
    reader.readAsText(file);
  }

  get canImport(): boolean { return !!this.pendingRows?.length; }

  importRows(): void {
    if (!this.pendingRows) { return; }
    const today = new Date().toISOString().slice(0, 10);

    this.pendingRows.forEach((c) => {
      this.rows.unshift({
        id: ++this.seq,
        user: (c[0] || '').trim(), branch: (c[1] || '').trim(),
        name: (c[2] || '').trim(), type: (c[3] || '').trim(),
        loc: (c[4] || '').trim(), emi: (c[5] || '').trim(),
        conn: (c[6] || '').trim(), sim: (c[7] || '').trim(),
        created: today, cuser: 'saurabh',
      });
    });

    this.pendingRows = null;
    this.uploadOpen = false;
    this.page = 1;
  }

  downloadTemplate(): void {
    const blank = Array.from({ length: 30 }, () => this.templateHeaders.map(() => ''));
    this.downloadExcel('devices-template.xls', this.templateHeaders, blank);
  }

  // =====================================================================
  // bulk delete
  // =====================================================================

  openBulk(): void {
    this.bulkScope = { user: '', branch: '', type: '' };
    this.bulkTargets = [];
    this.bulkMsg = '';
    this.bulkOk = false;
    this.bulkOpen = true;
  }

  onBulkUserChange(): void { this.bulkScope.branch = ''; this.resetBulkFile(); }

  resetBulkFile(): void {
    this.bulkTargets = [];
    this.bulkMsg = '';
    this.bulkOk = false;
    this.bulkTotal = 0;
    this.bulkMissed = 0;
  }

  /** devices inside the chosen user / branch / type */
  get scopeRows(): Device[] {
    const s = this.bulkScope;
    if (!s.user) { return []; }
    return this.rows.filter((r) =>
      r.user === s.user &&
      (!s.branch || r.branch === s.branch) &&
      (!s.type || r.type === s.type));
  }

  get scopeLine(): string {
    const s = this.bulkScope;
    if (!s.user) { return 'Choose a user to begin.'; }
    const n = this.scopeRows.length;
    const parts = [s.user, s.branch || 'all branches', s.type || 'all types'];
    return `${n} device${n === 1 ? '' : 's'} in ${parts.join(' \u00b7 ')}`;
  }

  onBulkFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.readBulkFile(input.files[0]); }
  }

  onBulkDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) { this.readBulkFile(file); }
  }

  private readBulkFile(file: File): void {
    if (!this.bulkScope.user) {
      this.bulkOk = false;
      this.bulkMsg = 'Pick a user first, then upload.';
      return;
    }
    if (!/\.csv$/i.test(file.name)) {
      this.bulkOk = false;
      this.bulkMsg = `${file.name} - only .csv is read here.`;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // template order: Device Name, Device EMI No
      const rows = this.parseCsv(String(reader.result)).slice(1);
      const scope = this.scopeRows;
      const matched: number[] = [];
      let missed = 0;

      rows.forEach((c) => {
        const emi = (c[1] || '').trim();
        if (!emi) { return; }
        const hit = scope.find((r) => r.emi === emi);
        if (hit && !matched.includes(hit.id)) { matched.push(hit.id); }
        else if (!hit) { missed++; }
      });

      this.bulkTargets = matched;
      this.bulkTotal = rows.length;
      this.bulkMissed = missed;
      this.bulkOk = matched.length > 0;
      this.bulkMsg = `${file.name} - ${matched.length} matched, ${missed} not found.`;
    };
    reader.readAsText(file);
  }

  get bulkCountLine(): string {
    if (!this.bulkScope.user) { return 'Choose a user first.'; }
    if (!this.bulkMsg) { return 'Upload the filled template to see what will be removed.'; }
    return `${this.bulkTargets.length} of ${this.bulkTotal} rows will be removed` +
      (this.bulkMissed ? ` \u00b7 ${this.bulkMissed} not found in this selection` : '') + '.';
  }

  downloadDeleteTemplate(): void {
    const blank = Array.from({ length: 30 }, () => ['', '']);
    this.downloadExcel('devices-delete-template.xls', ['Device Name', 'Device EMI No'], blank);
  }

  startBulkDelete(): void {
    if (!this.bulkTargets.length) { return; }
    this.deleteMany = true;
    this.bulkOpen = false;
    this.deleteOpen = true;
  }

  // =====================================================================
  // files
  // =====================================================================

  exportExcel(): void {
    const body = this.filtered.map((r) =>
      [r.user, r.branch, r.name, r.type, r.loc, r.emi, r.conn, r.sim, r.created, r.cuser]);
    this.downloadExcel('devices.xls', this.exportHeaders, body);
  }

  /**
   * Writes a real Excel sheet so the header row can be BOLD.
   * A plain .csv cannot carry any formatting.
   * For a true .xlsx use exceljs instead.
   */
  private downloadExcel(name: string, headers: string[], body: unknown[][]): void {
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
      '<x:Name>Devices</x:Name><x:WorksheetOptions><x:FreezePanes/>' +
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

  /** Small CSV reader that copes with quoted cells. */
  private parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') { quoted = false; }
        else { cell += c; }
      } else if (c === '"') { quoted = true; }
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') { cell += c; }
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }

    return rows.filter((r) => r.some((v) => v.trim() !== ''));
  }
}