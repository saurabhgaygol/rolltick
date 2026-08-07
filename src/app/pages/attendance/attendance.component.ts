import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** One row of the attendance report - the 25 columns. */
export interface AttendanceRow {
  id: number;
  date: string;
  school: string;
  branch: string;
  student: string;
  grNo: string;
  classDiv: string;
  uhfId: string;
  inScannerId: string;
  inScannerLocation: string;
  inScannerType: string;
  entryTime: string;
  entryStatus: string;
  outScannerId: string;
  outScannerLocation: string;
  outScannerType: string;
  exitTime: string;
  exitStatus: string;
  parentName: string;
  parentMobile: string;
  inSmsStatus: string;
  inSmsTime: string;
  outSmsStatus: string;
  outSmsTime: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent {

  // ---- dropdown options (replace with values from your API) ----------
  schools = ['DPS', 'NPS', 'CP Goenka', 'Sanskriti Delhi', 'Chrysalis Bangalore'];

  branchesBySchool: Record<string, string[]> = {
    'DPS': ['Sector 45', 'Vasant Kunj', 'Rohini'],
    'NPS': ['Indiranagar', 'Rajajinagar'],
    'CP Goenka': ['Juhu', 'Thane'],
    'Sanskriti Delhi': ['Main Campus'],
    'Chrysalis Bangalore': ['Whitefield', 'Hebbal'],
  };

  classes = ['I-A', 'I-B', 'II-A', 'II-B', 'III-A', 'IV-A', 'V-B', 'VI-A'];

  // ---- filter state --------------------------------------------------
  filters = {
    search: '',
    school: '',
    branch: '',
    classDiv: '',
    from: '',
    to: '',
    entryStatus: '',
    exitStatus: '',
    smsStatus: '',
  };

  // ---- paging --------------------------------------------------------
  page = 1;
  pageSize = 25;

  /** The filter drawer is closed until the user asks for it. */
  filtersOpen = false;

  /**
   * What is typed in the search box. It is NOT applied while typing -
   * only applySearch() copies it into filters.search.
   */
  searchInput = '';

  // ---- sample data (replace with your API call) ----------------------
  rows: AttendanceRow[] = [
    {
      id: 1, date: '2026-07-28', school: 'DPS', branch: 'Sector 45',
      student: 'Aarav Mehta', grNo: 'GR10241', classDiv: 'IV-A', uhfId: 'E2004A1B2C',
      inScannerId: 'SCN-01', inScannerLocation: 'Main Gate', inScannerType: 'UHF RFID',
      entryTime: '07:52 AM', entryStatus: 'Success',
      outScannerId: 'SCN-04', outScannerLocation: 'Main Gate', outScannerType: 'UHF RFID',
      exitTime: '02:10 PM', exitStatus: 'Success',
      parentName: 'Rakesh Mehta', parentMobile: '98XXXXXX21',
      inSmsStatus: 'Sent', inSmsTime: '07:52 AM',
      outSmsStatus: 'Sent', outSmsTime: '02:11 PM',
    },
    {
      id: 2, date: '2026-07-28', school: 'DPS', branch: 'Sector 45',
      student: 'Diya Sharma', grNo: 'GR10298', classDiv: 'IV-A', uhfId: 'E2004A1B7F',
      inScannerId: 'SCN-02', inScannerLocation: 'Block B', inScannerType: 'Face',
      entryTime: '07:58 AM', entryStatus: 'Success',
      outScannerId: '', outScannerLocation: '-', outScannerType: '-',
      exitTime: '', exitStatus: 'Missed',
      parentName: 'Neha Sharma', parentMobile: '99XXXXXX07',
      inSmsStatus: 'Sent', inSmsTime: '07:58 AM',
      outSmsStatus: 'Pending', outSmsTime: '',
    },
    {
      id: 3, date: '2026-07-28', school: 'NPS', branch: 'Indiranagar',
      student: 'Kabir Nair', grNo: 'GR20115', classDiv: 'VI-A', uhfId: 'E2004C93D1',
      inScannerId: 'SCN-11', inScannerLocation: 'Gate 2', inScannerType: 'UHF RFID',
      entryTime: '08:05 AM', entryStatus: 'Failed',
      outScannerId: 'SCN-12', outScannerLocation: 'Gate 2', outScannerType: 'UHF RFID',
      exitTime: '03:02 PM', exitStatus: 'Success',
      parentName: 'Suresh Nair', parentMobile: '97XXXXXX44',
      inSmsStatus: 'Failed', inSmsTime: '',
      outSmsStatus: 'Sent', outSmsTime: '03:03 PM',
    },
    {
      id: 3, date: '2026-07-28', school: 'NPS', branch: 'Indiranagar',
      student: 'Kabir Nair', grNo: 'GR20115', classDiv: 'VI-A', uhfId: 'E2004C93D1',
      inScannerId: 'SCN-11', inScannerLocation: 'Gate 2', inScannerType: 'UHF RFID',
      entryTime: '08:05 AM', entryStatus: 'Failed',
      outScannerId: 'SCN-12', outScannerLocation: 'Gate 2', outScannerType: 'UHF RFID',
      exitTime: '03:02 PM', exitStatus: 'Success',
      parentName: 'Suresh Nair', parentMobile: '97XXXXXX44',
      inSmsStatus: 'Failed', inSmsTime: '',
      outSmsStatus: 'Sent', outSmsTime: '03:03 PM',
    }
  ];

  /** Branches shown in the dropdown depend on the chosen school. */
  get branchOptions(): string[] {
    return this.filters.school
      ? this.branchesBySchool[this.filters.school] ?? []
      : Object.values(this.branchesBySchool).flat();
  }

  /** Human labels for the chips shown under the title. */
  private readonly chipLabels: Record<string, string> = {
    search: 'Search',
    school: 'School',
    branch: 'Branch',
    classDiv: 'Class',
    from: 'From',
    to: 'To',
    entryStatus: 'Entry',
    exitStatus: 'Exit',
    smsStatus: 'SMS',
  };

  /** Every filter that is actually set, so it can be shown and removed. */
  get activeChips(): { key: string; label: string; value: string }[] {
    const f = this.filters as unknown as Record<string, string>;
    return Object.keys(this.chipLabels)
      .filter((k) => f[k])
      .map((k) => ({ key: k, label: this.chipLabels[k], value: f[k] }));
  }

  clearChip(key: string): void {
    const f = this.filters as unknown as Record<string, string>;
    f[key] = '';
    if (key === 'school') {
      this.filters.branch = '';
    }
    if (key === 'search') {
      this.searchInput = '';
    }
    this.page = 1;
  }

  /** Runs the search - called by the magnifier button and by Enter. */
  applySearch(): void {
    this.filters.search = this.searchInput.trim();
    this.page = 1;
  }

  clearSearch(): void {
    this.searchInput = '';
    this.filters.search = '';
    this.page = 1;
  }

  onSchoolChange(): void {
    this.filters.branch = '';
    this.page = 1;
  }

  resetFilters(): void {
    this.searchInput = '';
    this.filters = {
      search: '', school: '', branch: '', classDiv: '',
      from: '', to: '', entryStatus: '', exitStatus: '', smsStatus: '',
    };
    this.page = 1;
  }

  /** All filters applied together. */
  get filtered(): AttendanceRow[] {
    const f = this.filters;
    const term = f.search.trim().toLowerCase();

    return this.rows.filter((r) => {
      if (f.school && r.school !== f.school) { return false; }
      if (f.branch && r.branch !== f.branch) { return false; }
      if (f.classDiv && r.classDiv !== f.classDiv) { return false; }
      if (f.from && r.date < f.from) { return false; }
      if (f.to && r.date > f.to) { return false; }
      if (f.entryStatus && r.entryStatus !== f.entryStatus) { return false; }
      if (f.exitStatus && r.exitStatus !== f.exitStatus) { return false; }
      if (f.smsStatus && r.inSmsStatus !== f.smsStatus && r.outSmsStatus !== f.smsStatus) { return false; }

      if (term) {
        const hay = `${r.student} ${r.grNo} ${r.uhfId} ${r.parentName} ${r.parentMobile}`.toLowerCase();
        if (!hay.includes(term)) { return false; }
      }

      return true;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageStart(): number {
    return (this.page - 1) * this.pageSize;
  }

  get pageEnd(): number {
    return Math.min(this.pageStart + this.pageSize, this.filtered.length);
  }

  get paged(): AttendanceRow[] {
    return this.filtered.slice(this.pageStart, this.pageEnd);
  }

  /** Green / red / amber pill depending on the word. */
  statusClass(status: string): string {
    switch (status) {
      case 'Success':
      case 'Sent': return 'ok';
      case 'Failed': return 'bad';
      case 'Missed':
      case 'Pending': return 'warn';
      default: return 'neutral';
    }
  }

  // -------------------------------------------------------------------
  // Excel export.
  // This writes a UTF-8 CSV, which Excel opens directly - no extra
  // library needed. For a real .xlsx file run `npm i xlsx` and swap the
  // body of this method for:
  //
  //   import * as XLSX from 'xlsx';
  //   const sheet = XLSX.utils.json_to_sheet(this.filtered);
  //   const book  = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(book, sheet, 'Attendance');
  //   XLSX.writeFile(book, 'attendance.xlsx');
  // -------------------------------------------------------------------
  exportExcel(): void {
    const headers = [
      'ID', 'Attendance Date', 'School Name', 'Branch Name', 'Student Name',
      'GR No', 'Class / Division', 'UHF ID', 'IN Scanner ID', 'IN Scanner Location',
      'IN Scanner Type', 'Entry Time', 'Entry Scan Status', 'OUT Scanner ID',
      'OUT Scanner Location', 'OUT Scanner Type', 'Exit Time', 'Exit Scan Status',
      'Parent Name', 'Parent Mobile No.', 'In SMS Status', 'In SMS Time',
      'Out SMS Status', 'Out SMS Time',
    ];

    const lines = this.filtered.map((r) => [
      r.id, r.date, r.school, r.branch, r.student, r.grNo, r.classDiv, r.uhfId,
      r.inScannerId, r.inScannerLocation, r.inScannerType, r.entryTime, r.entryStatus,
      r.outScannerId, r.outScannerLocation, r.outScannerType, r.exitTime, r.exitStatus,
      r.parentName, r.parentMobile, r.inSmsStatus, r.inSmsTime, r.outSmsStatus, r.outSmsTime,
    ]);

    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...lines].map((row) => row.map(escape).join(',')).join('\r\n');

    // the BOM makes Excel read the file as UTF-8
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }
}