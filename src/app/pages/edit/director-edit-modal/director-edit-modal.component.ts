import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CompanyService } from '../../../core/services/company.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-director-edit-modal',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeSelectModule,
    DropdownModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './director-edit-modal.component.html',
  styleUrl: './director-edit-modal.component.css'
})
export class DirectorEditModalComponent implements OnInit {
  @Input() director: any;
  @Input() isOpen: boolean = false;
  @Output() closeDirectorEditModal = new EventEmitter<void>();
  @Output() directorUpdated = new EventEmitter<any>();

  editDirectorForm: FormGroup;
  isLoading: boolean = false;
  isDarkTheme: boolean = false;
  idProofPreview: string | null = null;
  addressProofPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private themeService: ThemeService
  ) {
    this.editDirectorForm = this.fb.group({
      type: ['person', Validators.required],
      surname: ['', [Validators.required, Validators.minLength(4)]],
      name: ['', [Validators.required, Validators.minLength(4)]],
      chineeseName: ['', Validators.minLength(4)],
      idNo: [''],
      idProof: [null],
      address: ['', [Validators.required, Validators.minLength(10)]],
      street: ['', Validators.minLength(4)],
      building: ['', Validators.minLength(4)],
      district: ['', Validators.minLength(4)],
      addressProof: [null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{8}$/)]]
    });
  }

  ngOnInit(): void {
    this.editDirectorForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateFormValidation(type);
    });
    this.themeService.isDarkTheme$.subscribe(isDark => {
      // Apply theme-specific styles or classes here
      if (isDark) {
        // Add classes for dark mode
      } else {
        // Add classes for light mode
      }
    });
  }

  ngOnChanges(): void {
    if (this.director) {
      this.editDirectorForm.patchValue({
        type: this.director.type || 'person',
        surname: this.director.surname || '',
        name: this.director.name || '',
        chineeseName: this.director.chineeseName || '',
        idNo: this.director.idNo || '',
        address: this.director.address || '',
        street: this.director.street || '',
        building: this.director.building || '',
        district: this.director.district || '',
        email: this.director.email || '',
        phone: this.director.phone || ''
      });

      if (this.director.idProof) {
        this.idProofPreview = this.director.idProof;
      }
      if (this.director.addressProof) {
        this.addressProofPreview = this.director.addressProof;
      }

      this.updateFormValidation(this.director.type);
    }
  }

  updateFormValidation(type: string) {
    const surnameControl = this.editDirectorForm.get("surname");
    const chineseNameControl = this.editDirectorForm.get("chineeseName");
    const idNoControl = this.editDirectorForm.get("idNo");
    const addressProofControl = this.editDirectorForm.get("addressProof");

    if (type === "company") {
      surnameControl?.clearValidators();
      surnameControl?.setValue('');
      chineseNameControl?.clearValidators();
      this.editDirectorForm.get("name")?.setValidators([Validators.required,Validators.minLength(3)]);
      addressProofControl?.clearValidators();
      addressProofControl?.setValue('');
    } else {
      surnameControl?.setValidators([Validators.required,Validators.minLength(3)]);
      this.editDirectorForm.get("name")?.setValidators([Validators.required]);
      addressProofControl?.setValidators([Validators.required]);
    }

    surnameControl?.updateValueAndValidity();
    chineseNameControl?.updateValueAndValidity();
    idNoControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity();
  }

  onSelectIDProofImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.idProofPreview = e.target.result;
        this.editDirectorForm.patchValue({
          idProof: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onImageSelectedAddress(event: any) {
    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.addressProofPreview = e.target.result;
        this.editDirectorForm.patchValue({
          addressProof: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.editDirectorForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['minlength']) {
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid phone number (8 digits)';
      }
    }
    return '';
  }

  submitEditForm() {
    this.isLoading = true;

    Object.keys(this.editDirectorForm.controls).forEach(key => {
      const control = this.editDirectorForm.get(key);
      control?.markAsTouched();
    });

    if (this.editDirectorForm.invalid) {
      this.isLoading = false;
      const firstInvalidElement = document.querySelector('.error-message');
      firstInvalidElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formData = {
      ...this.editDirectorForm.value,
      _id: this.director._id,
      userId: localStorage.getItem('userId'),
      companyId: localStorage.getItem('companyId')
    };

    this.companyService.updateDirector(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        this.directorUpdated.emit(formData);
        this.closeDirectorEditModal.emit();
      },
      error: (error) => {
        this.isLoading = false;
        
        console.error('Error occurred during director update:', error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  }

  close() {
    this.closeDirectorEditModal.emit();
  }
}

