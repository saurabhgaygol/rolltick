import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** One student row - the 16 report columns. */
export interface Student {
  id: number;
  school: string;
  branch: string;
  cls: string;
  div: string;
  gr: string;
  name: string;
  rfid: string;
  p1: string;
  m1: string;
  p2: string;
  m2: string;
  created: string;      // filled in by the system
  user: string;         // filled in by the system
  sms1: string;         // Yes / No
  sms2: string;         // Yes / No
  access: string;       // Yes / No
}

interface Chip {
  key: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {

  // ---- dropdown options (replace with values from your API) ----------
  schools = ['DPS', 'NPS', 'CP Goenka', 'Sanskriti Delhi', 'Chrysalis Bangalore'];

  branchesBySchool: Record<string, string[]> = {
    'DPS': ['Sector 45', 'Vasant Kunj', 'Rohini'],
    'NPS': ['Indiranagar', 'Rajajinagar'],
    'CP Goenka': ['Juhu', 'Thane'],
    'Sanskriti Delhi': ['Main Campus'],
    'Chrysalis Bangalore': ['Whitefield', 'Hebbal'],
  };

  classes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  divisions = ['A', 'B', 'C', 'D'];

  // ---- table state ---------------------------------------------------
  rows: Student[] = [
    {
      id: 1, school: 'DPS', branch: 'Sector 45', cls: 'IV', div: 'A',
      gr: 'GR10241', name: 'Aarav Mehta', rfid: 'E2004A1B2C',
      p1: 'Rakesh Mehta', m1: '9812345678', p2: 'Neha Mehta', m2: '9887654321',
      created: '2026-05-14', user: 'admin', sms1: 'Yes', sms2: 'No', access: 'Yes',
    },
    {
      id: 2, school: 'DPS', branch: 'Sector 45', cls: 'IV', div: 'B',
      gr: 'GR10298', name: 'Diya Sharma', rfid: 'E2004A1B7F',
      p1: 'Neha Sharma', m1: '9998887770', p2: '', m2: '',
      created: '2026-05-16', user: 'saurabh', sms1: 'Yes', sms2: 'No', access: 'Yes',
    },
    {
      id: 3, school: 'NPS', branch: 'Indiranagar', cls: 'VI', div: 'A',
      gr: 'GR20115', name: 'Kabir Nair', rfid: 'E2004C93D1',
      p1: 'Suresh Nair', m1: '9776655443', p2: 'Priya Nair', m2: '9665544332',
      created: '2026-06-02', user: 'office', sms1: 'No', sms2: 'Yes', access: 'No',
    },
  ];

  private seq = 3;

  page = 1;
  pageSize = 25;
  activeId: number | null = null;

  // ---- filters -------------------------------------------------------
  filtersOpen = false;

  filters = {
    school: '', branch: '', cls: '', div: '',
    access: '', sms1: '', sms2: '',
  };

  searchInput = '';
  appliedSearch = '';

  private readonly chipLabels: Record<string, string> = {
    search: 'Search', school: 'School', branch: 'Branch', cls: 'Class',
    div: 'Division', access: 'Access', sms1: 'SMS 1', sms2: 'SMS 2',
  };

  // ---- add / edit form ------------------------------------------------
  formOpen = false;
  editingId: number | null = null;

  form = this.blankForm();
  errors: Record<string, boolean> = {};

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
  bulkScope = { school: '', branch: '', cls: '', div: '' };
  bulkMsg = '';
  bulkOk = false;
  bulkTargets: number[] = [];
  bulkTotal = 0;
  bulkMissed = 0;

  private readonly exportHeaders = [
    'School Name', 'Branch', 'Class', 'Division', 'GR Number', 'Student Name', 'RFID Tag',
    'Parent Name 1', 'Mobile Number 1', 'Parent Name 2', 'Mobile Number 2',
    'Created Date', 'Created User', 'Parent SMS Send 1', 'Parent SMS Send 2', 'Parent Access',
  ];

  /** Created Date and Created User are NOT here - the system fills them in. */
  private readonly templateHeaders = [
    'School Name', 'Branch', 'Class', 'Division', 'GR Number', 'Student Name', 'RFID Tag',
    'Parent Name 1', 'Mobile Number 1', 'Parent Name 2', 'Mobile Number 2',
    'Parent SMS Send 1', 'Parent SMS Send 2', 'Parent Access',
  ];

  // =====================================================================
  // filtering
  // =====================================================================

  branchesFor(school: string): string[] {
    return school
      ? this.branchesBySchool[school] ?? []
      : Object.values(this.branchesBySchool).flat();
  }

  get branchOptions(): string[] {
    return this.branchesFor(this.filters.school);
  }

  get formBranchOptions(): string[] {
    return this.branchesFor(this.form.school);
  }

  get bulkBranchOptions(): string[] {
    return this.branchesFor(this.bulkScope.school);
  }

  onFilterSchoolChange(): void {
    this.filters.branch = '';
    this.page = 1;
  }

  onFormSchoolChange(): void {
    this.form.branch = '';
  }

  get filtered(): Student[] {
    const f = this.filters;
    const term = this.appliedSearch.trim().toLowerCase();

    return this.rows.filter((r) => {
      if (f.school && r.school !== f.school) { return false; }
      if (f.branch && r.branch !== f.branch) { return false; }
      if (f.cls && r.cls !== f.cls) { return false; }
      if (f.div && r.div !== f.div) { return false; }
      if (f.access && r.access !== f.access) { return false; }
      if (f.sms1 && r.sms1 !== f.sms1) { return false; }
      if (f.sms2 && r.sms2 !== f.sms2) { return false; }

      if (term) {
        const hay = `${r.name} ${r.gr} ${r.rfid} ${r.p1} ${r.m1} ${r.p2} ${r.m2}`.toLowerCase();
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
      if (key === 'school') { this.filters.branch = ''; }
    }
    this.page = 1;
  }

  resetFilters(): void {
    this.filters = { school: '', branch: '', cls: '', div: '', access: '', sms1: '', sms2: '' };
    this.searchInput = '';
    this.appliedSearch = '';
    this.page = 1;
  }

  applySearch(): void {
    this.appliedSearch = this.searchInput.trim();
    this.page = 1;
  }

  clearSearch(): void {
    this.searchInput = '';
    this.appliedSearch = '';
    this.page = 1;
  }

  // =====================================================================
  // paging
  // =====================================================================

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageStart(): number { return (this.page - 1) * this.pageSize; }
  get pageEnd(): number { return Math.min(this.pageStart + this.pageSize, this.filtered.length); }
  get paged(): Student[] { return this.filtered.slice(this.pageStart, this.pageEnd); }

  ynClass(v: string): string { return v === 'Yes' ? 'yes' : 'no'; }

  // =====================================================================
  // add / edit
  // =====================================================================

  private blankForm() {
    return {
      school: '', branch: '', cls: '', div: '',
      gr: '', name: '', rfid: '',
      p1: '', m1: '', p2: '', m2: '',
      sms1: true, sms2: false, access: true,
    };
  }

  openForm(id: number | null): void {
    this.errors = {};
    this.editingId = id;

    const r = id ? this.rows.find((x) => x.id === id) : null;
    this.form = r
      ? {
        school: r.school, branch: r.branch, cls: r.cls, div: r.div,
        gr: r.gr, name: r.name, rfid: r.rfid,
        p1: r.p1, m1: r.m1, p2: r.p2, m2: r.m2,
        sms1: r.sms1 === 'Yes', sms2: r.sms2 === 'Yes', access: r.access === 'Yes',
      }
      : this.blankForm();

    this.formOpen = true;
  }

  get formTitle(): string { return this.editingId ? 'Edit Student' : 'Add Student'; }

  get formSub(): string {
    const r = this.editingId ? this.rows.find((x) => x.id === this.editingId) : null;
    return r ? `${r.name} \u00b7 ${r.gr}` : 'Fill in the details below.';
  }

  saveForm(): void {
    const f = this.form;
    this.errors = {
      school: !f.school, branch: !f.branch, cls: !f.cls, div: !f.div,
      gr: !f.gr.trim(), name: !f.name.trim(), p1: !f.p1.trim(),
      m1: !/^\d{10}$/.test(f.m1.trim()),
      m2: !!f.m2.trim() && !/^\d{10}$/.test(f.m2.trim()),
    };
    if (Object.values(this.errors).some(Boolean)) { return; }

    const data = {
      school: f.school, branch: f.branch, cls: f.cls, div: f.div,
      gr: f.gr.trim(), name: f.name.trim(), rfid: f.rfid.trim(),
      p1: f.p1.trim(), m1: f.m1.trim(), p2: f.p2.trim(), m2: f.m2.trim(),
      sms1: f.sms1 ? 'Yes' : 'No',
      sms2: f.sms2 ? 'Yes' : 'No',
      access: f.access ? 'Yes' : 'No',
    };

    if (this.editingId) {
      Object.assign(this.rows.find((x) => x.id === this.editingId)!, data);
    } else {
      this.rows.unshift({
        id: ++this.seq,
        created: new Date().toISOString().slice(0, 10),
        user: 'saurabh',                       // put the signed-in user here
        ...data,
      });
      this.page = 1;
    }
    this.formOpen = false;
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

  get deletingRow(): Student | undefined {
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
  // bulk upload (add many)
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
      if (!rows.length) {
        this.uploadOk = false;
        this.uploadMsg = `${file.name} - no data rows found.`;
        this.pendingRows = null;
        return;
      }
      this.pendingRows = rows;
      this.uploadOk = true;
      this.uploadMsg = `${file.name} - ${rows.length} row(s) ready to import.`;
    };
    reader.readAsText(file);
  }

  get canImport(): boolean { return !!this.pendingRows?.length; }

  importRows(): void {
    if (!this.pendingRows) { return; }
    const today = new Date().toISOString().slice(0, 10);
    const yn = (v: string) => (String(v ?? '').trim().toLowerCase().startsWith('y') ? 'Yes' : 'No');

    this.pendingRows.forEach((c) => {
      this.rows.unshift({
        id: ++this.seq,
        school: (c[0] || '').trim(), branch: (c[1] || '').trim(),
        cls: (c[2] || '').trim(), div: (c[3] || '').trim(),
        gr: (c[4] || '').trim(), name: (c[5] || '').trim(), rfid: (c[6] || '').trim(),
        p1: (c[7] || '').trim(), m1: (c[8] || '').trim(),
        p2: (c[9] || '').trim(), m2: (c[10] || '').trim(),
        created: today, user: 'saurabh',
        sms1: yn(c[11]), sms2: yn(c[12]), access: yn(c[13]),
      });
    });

    this.pendingRows = null;
    this.uploadOpen = false;
    this.page = 1;
  }

  downloadTemplate(): void {
    const blank = Array.from({ length: 30 }, () => this.templateHeaders.map(() => ''));
    this.downloadExcel('students-template.xls', this.templateHeaders, blank);
  }

  // =====================================================================
  // bulk delete (school scope + a file of GR numbers)
  // =====================================================================

  openBulk(): void {
    this.bulkScope = { school: '', branch: '', cls: '', div: '' };
    this.bulkTargets = [];
    this.bulkMsg = '';
    this.bulkOk = false;
    this.bulkOpen = true;
  }

  onBulkSchoolChange(): void {
    this.bulkScope.branch = '';
    this.resetBulkFile();
  }

  resetBulkFile(): void {
    this.bulkTargets = [];
    this.bulkMsg = '';
    this.bulkOk = false;
    this.bulkTotal = 0;
    this.bulkMissed = 0;
  }

  /** Students that sit inside the chosen school / branch / class / division. */
  get scopeRows(): Student[] {
    const s = this.bulkScope;
    if (!s.school) { return []; }
    return this.rows.filter((r) =>
      r.school === s.school &&
      (!s.branch || r.branch === s.branch) &&
      (!s.cls || r.cls === s.cls) &&
      (!s.div || r.div === s.div));
  }

  get scopeLine(): string {
    const s = this.bulkScope;
    if (!s.school) { return 'Choose a school to begin.'; }
    const n = this.scopeRows.length;
    const parts = [
      s.school,
      s.branch || 'all branches',
      s.cls ? 'class ' + s.cls : 'all classes',
      s.div ? 'division ' + s.div : 'all divisions',
    ];
    return `${n} student${n === 1 ? '' : 's'} in ${parts.join(' \u00b7 ')}`;
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
    if (!this.bulkScope.school) {
      this.bulkOk = false;
      this.bulkMsg = 'Pick a school first, then upload.';
      return;
    }
    if (!/\.csv$/i.test(file.name)) {
      this.bulkOk = false;
      this.bulkMsg = `${file.name} - only .csv is read here.`;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // template order: Student Name, GR Number
      const rows = this.parseCsv(String(reader.result)).slice(1);
      const scope = this.scopeRows;
      const matched: number[] = [];
      let missed = 0;

      rows.forEach((c) => {
        const gr = (c[1] || '').trim().toLowerCase();
        if (!gr) { return; }
        const hit = scope.find((r) => r.gr.toLowerCase() === gr);
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
    if (!this.bulkScope.school) { return 'Choose a school first.'; }
    if (!this.bulkMsg) { return 'Upload the filled template to see what will be removed.'; }
    const n = this.bulkTargets.length;
    return `${n} of ${this.bulkTotal} rows will be removed` +
      (this.bulkMissed ? ` \u00b7 ${this.bulkMissed} not found in this selection` : '') + '.';
  }

  downloadDeleteTemplate(): void {
    const blank = Array.from({ length: 30 }, () => ['', '']);
    this.downloadExcel('students-delete-template.xls', ['Student Name', 'GR Number'], blank);
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
    const body = this.filtered.map((r) => [
      r.school, r.branch, r.cls, r.div, r.gr, r.name, r.rfid,
      r.p1, r.m1, r.p2, r.m2, r.created, r.user, r.sms1, r.sms2, r.access,
    ]);
    this.downloadExcel('students.xls', this.exportHeaders, body);
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
      '<x:Name>Students</x:Name><x:WorksheetOptions><x:FreezePanes/>' +
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
