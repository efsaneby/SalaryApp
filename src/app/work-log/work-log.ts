import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WorkEntryModal } from '../work-entry-modal/work-entry-modal';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [CommonModule, WorkEntryModal, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './work-log.html',
  styleUrls: ['./work-log.css']
})
export class WorkLog implements OnInit {
  selectedDate: Date | null = null;
  showModal = false;

  modalInitialData: {
    date: string;
    startTime: string;
    endTime: string;
    breakTime: string;
    stayStart: string;
    stayEnd: string;
    segmentId?: number;
    segmentType?: string;
    workEntryId?: number;
  } | null = null;

  days: Date[] = [];
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  truckStaySegments: any[] = [];
  segmentMap = new Map<string, any>();
  workEntries: any[] = [];
  workMap = new Map<string, {
    netHours: number;
    toeslag: number;
    startTime: string;
    endTime: string;
    breakTime: string;
    id: number;
  }>();

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateCalendar();
    this.loadTruckStaySegments();
    this.loadWorkEntries();
    setTimeout(() => {
      this.logTodayData();
      this.debugMaps();
    }, 1000);
  }

  trackByDate = (index: number, item: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return item ? `${item.getFullYear()}-${pad(item.getMonth() + 1)}-${pad(item.getDate())}` : index.toString();
  };


  private getLocalDateKey(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }


  loadTruckStaySegments() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<any[]>('https://localhost:7094/api/truckstay/segments', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (segments) => {
        const newSegmentMap = new Map<string, any>();
        const validSegments: any[] = [];

        segments.forEach(seg => {
          if (!seg.stayStart || !seg.stayEnd) {
            console.warn('❌ Eksik saatli segment:', seg);
            return;
          }

          const startDate = new Date(seg.stayStart);
          const endDate = new Date(seg.stayEnd);

          for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
          ) {
            const key = this.getLocalDateKey(new Date(d));
            newSegmentMap.set(key, seg);
          }

          validSegments.push(seg);
        });

        this.truckStaySegments = validSegments;
        this.segmentMap = newSegmentMap;
        this.cdr.detectChanges();

        console.log('📦 SegmentMap entries:', Array.from(newSegmentMap.entries()));
      },
      error: (err) => {
        console.error("❌ Segment yükleme hatası:", err);
      }
    });
  }

  loadWorkEntries() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("❌ Token bulunamadı, giriş yapılmamış olabilir.");
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    this.http.get<any[]>(`https://localhost:7094/api/worklog/entries/me`, { headers })
      .subscribe({
        next: (entries) => {
          console.log('📥 Gelen WorkEntry:', entries);
          this.workEntries = entries;

          const newWorkMap = new Map<string, {
            netHours: number;
            toeslag: number;
            startTime: string;
            endTime: string;
            breakTime: string;
            id: number;
          }>();

          entries.forEach(entry => {
            const key = entry.date.split('T')[0];
            newWorkMap.set(key, {
              netHours: entry.netHours,
              toeslag: entry.nightToeslagAmount ?? 0, // ✅ calculatedAmount yerine backend'den gelen gerçek toeslag
              startTime: entry.startTime ?? '',
              endTime: entry.endTime ?? '',
              breakTime: entry.extraBreakTime ?? '00:00',
              id: entry.id
            });
          });

          this.workMap = newWorkMap;
          this.updateCalendar();
          this.cdr.detectChanges();

          if (this.showModal && this.selectedDate) {
            const key = this.getLocalDateKey(this.selectedDate);
            const updatedEntry = this.workMap.get(key);
            this.modalInitialData = {
              date: key,
              startTime: updatedEntry?.startTime ?? '',
              endTime: updatedEntry?.endTime ?? '',
              breakTime: updatedEntry?.breakTime ?? '00:00',
              stayStart: this.modalInitialData?.stayStart ?? '',
              stayEnd: this.modalInitialData?.stayEnd ?? '',
              segmentId: this.modalInitialData?.segmentId,
              segmentType: this.modalInitialData?.segmentType ?? '',
              workEntryId: updatedEntry?.id
            };
          }
        },
        error: (err) => {
          console.error("❌ WorkEntry yükleme hatası:", err);
        }
      });
  }

  handleDeleteFullDay(workEntryId: number | null | undefined, segmentId: number | null | undefined) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
      return;
    }

    const confirmed = window.confirm("Bu günün tüm kayıtları silinecek. Devam edilsin mi?");
    if (!confirmed) return;

    const headers = { Authorization: `Bearer ${token}` };

    console.log("🧪 Silme çağrısı başlatılıyor:");
    console.log("   - workEntryId:", workEntryId, "typeof:", typeof workEntryId);
    console.log("   - segmentId:", segmentId, "typeof:", typeof segmentId);

    // 🔁 Önce TruckStay sil
    if (typeof segmentId === 'number' && !isNaN(segmentId)) {
      this.http.delete(`https://localhost:7094/api/truckstay/group/${segmentId}`, { headers }).subscribe({
        next: () => {
          console.log(`✅ TruckStay silindi: segmentId=${segmentId}`);
          this.loadTruckStaySegments();
        },
        error: (err) => {
          if (err.status === 404) {
            console.warn("⚠️ Segment zaten silinmiş olabilir.");
          } else {
            console.error("❌ TruckStay silme hatası:", err);
            alert("TruckStay silme işlemi başarısız oldu.");
          }
        }
      });
    } else {
      console.warn("⚠️ Geçersiz segmentId, silme çağrısı atlanıyor:", segmentId);
    }

    // 🔁 Sonra WorkEntry sil
    if (typeof workEntryId === 'number' && !isNaN(workEntryId)) {
      this.http.delete(`https://localhost:7094/api/worklog/entry/${workEntryId}`, { headers }).subscribe({
        next: () => {
          console.log(`✅ WorkEntry silindi: workEntryId=${workEntryId}`);
          this.workMap.delete(this.getLocalDateKey(this.selectedDate!));
          this.loadWorkEntries();
        },
        error: (err) => {
          if (err.status === 404) {
            console.warn("⚠️ WorkEntry zaten silinmiş olabilir.");
          } else {
            console.error("❌ WorkEntry silme hatası:", err);
            alert("WorkEntry silme işlemi başarısız oldu.");
          }
        }
      });
    } else {
      console.warn("⚠️ Geçersiz workEntryId, silme çağrısı atlanıyor:", workEntryId);
    }

    // 🔁 UI güncellemesi
    setTimeout(() => {
      this.updateCalendar();
      this.cdr.detectChanges();
      this.closeModal();
    }, 500);
  }

  getWorkHours(date: Date): number {
    const key = this.getLocalDateKey(date);
    return this.workMap.get(key)?.netHours ?? 0;
  }

  getSegmentHours(date: Date): number {
    const key = this.getLocalDateKey(date);
    const seg = this.segmentMap.get(key);
    if (!seg) return 0;
    return Math.round((seg.generalHours + seg.eveningHours + seg.nightHours) * 100) / 100;
  }

  getTruckStayToeslag(date: Date): number {
    const key = this.getLocalDateKey(date);
    const seg = this.segmentMap.get(key);
    if (seg) return Math.round(seg.totalToeslag * 100) / 100;
    return Math.round((this.workMap.get(key)?.toeslag ?? 0) * 100) / 100;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  getWeekdayName(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  }

  getDayClass(date: Date): string {
    const dayOfWeek = date.getDay();
    if (this.isToday(date)) return 'today';
    if (dayOfWeek === 0) return 'sunday';
    if (dayOfWeek === 6) return 'saturday';
    return 'weekday';
  }

  updateCalendar() {
    const tempDays: Date[] = [];
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1).getDay();
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < offset; i++) {
      tempDays.push(null as any);
    }

    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      tempDays.push(date);
    }

    this.days = [...tempDays];
    this.cdr.detectChanges();
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.updateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.updateCalendar();
  }

  formatHoursDecimal(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  openModal(date: Date) {
    this.selectedDate = date;
    const key = this.getLocalDateKey(date); // UTC’ye kaymadan string üret
    const workEntry = this.workMap.get(key);

    console.log("🔍 workMap keys:", Array.from(this.workMap.keys()));
    console.log("🔍 Aranan key:", key);
    console.log("🔍 workMap.get(key):", this.workMap.get(key));


    // 🔍 Segmenti stayStart/stayEnd aralığına göre bul
    let truckSegment = null;

    for (const seg of this.truckStaySegments) {
      if (!seg.stayStart || !seg.stayEnd) continue;

      const startKey = seg.stayStart.split('T')[0];
      const endKey = seg.stayEnd.split('T')[0];

      if (key >= startKey && key <= endKey) {
        truckSegment = seg;
        break;
      }
    }

    console.log('📅 selectedDate:', date);
    console.log('📅 key:', key);
    console.log('🧪 Seçilen segment:', truckSegment);

    this.modalInitialData = {
      date: key,
      startTime: workEntry?.startTime ?? '',
      endTime: workEntry?.endTime ?? '',
      breakTime: workEntry?.breakTime ?? '00:00',
      stayStart: truckSegment?.stayStart ?? '',
      stayEnd: truckSegment?.stayEnd ?? '',
      segmentId: truckSegment?.id ?? '',
      segmentType: truckSegment?.segmentType ?? '',
      workEntryId: workEntry?.id
    };

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
  }

  logTodayData() {
    const todayKey = this.getLocalDateKey(new Date());
    console.log('📅 Today key:', todayKey);
    console.log('🧱 WorkMap:', this.workMap.get(todayKey));
    console.log('🚚 SegmentMap:', this.segmentMap.get(todayKey));
  }

  debugMaps() {
    console.log('📦 SegmentMap entries:', Array.from(this.segmentMap.entries()));
    console.log('🧱 WorkMap entries:', Array.from(this.workMap.entries()));
  }

  handleSaveWorkEntry() {
    this.loadWorkEntries();
    setTimeout(() => {
      this.updateCalendar();
      this.cdr.detectChanges();
      this.closeModal();
    }, 300);
  }

}
