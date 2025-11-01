import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-work-entry-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './work-entry-modal.html',
  styleUrl: './work-entry-modal.css'
})
export class WorkEntryModal implements OnInit, OnChanges {
  @Input() initialData: {
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

  @Input() selectedDate: Date | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() deleteWorkEntry = new EventEmitter<{ workEntryId?: number }>();
  @Output() deleteDay = new EventEmitter<{ segmentId?: number }>();
  @Output() deleteFullDay = new EventEmitter<{ workEntryId?: number, segmentId?: number }>();
  @Output() saveWorkEntry = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();
  workForm: FormGroup;
  userId: number | null = null;
  token: string | null = null;
  isDeleting = false;


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.workForm = this.fb.group({
      date: ['', Validators.required],
      userId: ['', Validators.required],
      workHoursGroup: this.fb.group({
        startTime: [''],
        endTime: [''],
        breakTime: ['00:00']
      }),
      truckStayGroup: this.fb.group({
        stayStart: [''],
        stayEnd: ['']
      })
    });

    this.token = localStorage.getItem('token');
    if (this.token) {
      const jwt = new JwtHelperService();
      const decoded = jwt.decodeToken(this.token);
      this.userId = parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
    }
  }

  ngOnInit() {
    if (this.userId) {
      this.workForm.patchValue({ userId: this.userId.toString() });
    }

    if (this.initialData) {
      this.workForm.patchValue({
        date: this.initialData.date,
        workHoursGroup: {
          startTime: this.initialData.startTime,
          endTime: this.initialData.endTime,
          breakTime: this.initialData.breakTime
        },
        truckStayGroup: {
          stayStart: this.toDatetimeLocal(this.initialData.stayStart),
          stayEnd: this.toDatetimeLocal(this.initialData.stayEnd)
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData) {
      console.log('🧪 Gelen initialData:', this.initialData);

      this.workForm.patchValue({
        date: this.initialData.date,
        workHoursGroup: {
          startTime: this.initialData.startTime,
          endTime: this.initialData.endTime,
          breakTime: this.initialData.breakTime
        },
        truckStayGroup: {
          stayStart: this.toDatetimeLocal(this.initialData.stayStart),
          stayEnd: this.toDatetimeLocal(this.initialData.stayEnd)
        }
      });
    }
  }

  private toDatetimeLocal(value: string): string {
    if (!value) return '';
    const [datePart, timePart] = value.split('T');
    if (!datePart || !timePart) return '';
    const [hour, minute] = timePart.split(':');
    return `${datePart}T${hour}:${minute}`;
  }


  private formatTime(value: string): string {
    if (!value) return '00:00:00';
    return value.length === 5 ? value + ':00' : value;
  }

  private formatDateTime(value: string): string | null {
    if (!value || value.trim() === '') return null;

    // datetime-local input zaten local saat verir → elle ISO formatla
    const [datePart, timePart] = value.split('T');
    if (!datePart || !timePart) return null;

    return `${datePart}T${timePart}:00`;
  }


  onSubmit() {
    console.log('📤 Gönderilen veri:', this.workForm.value);

    if (this.isDeleting) return;

    const formData = this.workForm.value;
    if (!this.token) {
      console.warn("❌ Token eksik, yetkilendirme yapılamaz.");
      alert("Giriş yapılmamış. Lütfen tekrar oturum açın.");
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };

    const { startTime, endTime, breakTime } = formData.workHoursGroup;
    const { stayStart, stayEnd } = formData.truckStayGroup;

    const stayStartFormatted = this.formatDateTime(stayStart);
    const stayEndFormatted = this.formatDateTime(stayEnd);

    const hasWorkHours = !!(startTime && endTime);
    const hasTruckStay = !!(stayStartFormatted && stayEndFormatted);

    if (!hasWorkHours && !hasTruckStay) {
      console.warn("❌ Hiçbir veri girilmedi. En az bir alan dolu olmalı.");
      return;
    }

    let successCount = 0;

    const refreshAfterBoth = () => {
      if ((hasWorkHours && hasTruckStay && successCount === 2) ||
        (hasWorkHours && !hasTruckStay && successCount === 1) ||
        (!hasWorkHours && hasTruckStay && successCount === 1)) {
        console.log("🔄 Kayıt sonrası workMap güncelleniyor");
        this.refreshRequested.emit();
        this.closeModal();
      }
    };

    if (hasWorkHours) {
      const workPayload = {
        date: formData.date,
        startTime: this.formatTime(startTime),
        endTime: this.formatTime(endTime),
        extraBreakTime: this.formatTime(breakTime)
      };

      this.http.post('https://localhost:7094/api/worklog/overtime/save', workPayload, { headers }).subscribe({
        next: (res: any) => {
          console.log('✅ Work Hours kaydedildi:', res);
          console.log('📤 Gönderilen veri:', JSON.stringify(workPayload, null, 2));
          alert('✅ Work Hours başarıyla kaydedildi.');
          successCount++;
          refreshAfterBoth();
        },
        error: (err) => {
          console.error('❌ Work Hours hatası:', err);
          console.log('📤 Gönderilen veri:', JSON.stringify(workPayload, null, 2));
        }
      });
    }

    if (hasTruckStay) {
      const truckStayPayload = {
        stayStart: stayStartFormatted,
        stayEnd: stayEndFormatted
      };

      this.http.post('https://localhost:7094/api/truckstay/save', truckStayPayload, { headers }).subscribe({
        next: (res: any) => {
          console.log('✅ Truck Stay kaydedildi:', res);
          alert('✅ Truck Stay başarıyla kaydedildi.');
          successCount++;
          refreshAfterBoth();
        },
        error: (err) => {
          console.error('❌ Truck Stay hatası:', err);
        }
      });
    }
  }


  private emitRefreshIfDone(successCount: number, hasOther: boolean) {
    if (!hasOther || successCount === 2) {
      this.refresh.emit();
    }
  }

  closeModal() {
    this.close.emit();
  }

  onDeleteDay() {
    console.log("🧪 Silme kontrolü:", {
      segmentId: this.initialData?.segmentId,
      workEntryId: this.initialData?.workEntryId
    });

    console.log("🧪 Delete butonuna basıldı");

    const segmentId = this.initialData?.segmentId;
    const workEntryId = this.initialData?.workEntryId;

    if (!segmentId && !workEntryId) {
      console.warn("❌ Silinecek veri bulunamadı");
      alert("Bu gün için silinebilir bir veri bulunamadı.");
      return;
    }

    const confirmed = window.confirm(
      `This will delete the work entry${segmentId ? ' and truck stay segment' : ''} for ${this.initialData?.date}. Continue?`
    );
    if (!confirmed) {
      console.log("🚫 Kullanıcı silmeyi iptal etti");
      return;
    }

    if (workEntryId) {
      console.log("✅ WorkEntry siliniyor:", workEntryId);
      this.deleteWorkEntry.emit({ workEntryId: +workEntryId });
    }

    if (segmentId) {
      console.log("✅ TruckStay segment siliniyor:", segmentId);
      this.deleteDay.emit({ segmentId: +segmentId });
    }

    // ✅ Silme sonrası modal içeriğini sıfırla
    this.initialData = {
      date: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : '',
      startTime: '',
      endTime: '',
      breakTime: '00:00',
      stayStart: '',
      stayEnd: '',
      segmentType: ''
    };

    this.workForm.patchValue({
      workHoursGroup: {
        startTime: '',
        endTime: '',
        breakTime: '00:00'
      },
      truckStayGroup: {
        stayStart: '',
        stayEnd: ''
      }
    });

    console.log("🧹 Modal içeriği sıfırlandı");
  }







}

