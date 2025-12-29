import { Component, Input, OnInit, Output, EventEmitter, inject } from "@angular/core"
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { CompanyService } from "../../../core/services/company.service"
import Swal from "sweetalert2"
import { FormBuilder } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { SelectModule } from "primeng/select";
import { TreeSelectModule } from "primeng/treeselect";

@Component({
  selector: "app-shareholder-edit-modal",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeSelectModule,
    DropdownModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: "./shareholder-edit-modal.component.html",
  styleUrls: ["./shareholder-edit-modal.component.css"],
})
export class ShareholderEditModalComponent implements OnInit {
  @Input() shareholder: any
  @Input() isOpen = false
  @Output() closeModal = new EventEmitter<void>();
  @Output() shareholderUpdated = new EventEmitter<any>()

  editShareholderForm: FormGroup
  isLoading = false
  idProofPreview: string | null = null
  addressProofPreview: string | null = null
  private fb = inject(FormBuilder)
  private companyService = inject(CompanyService)
  constructor(
  ) {
    this.editShareholderForm = this.fb.group({
      surname: ["", [Validators.required, Validators.minLength(3)]],
      name: ["", [Validators.required, Validators.minLength(3)]],
      chineeseName: [""],
      idNo: [""],
      idProof: [""],
      userType: ["person", Validators.required],
      address: ["", [Validators.required, Validators.minLength(3)]],
      building: ["", Validators.minLength(4)],
      district: ["", Validators.minLength(4)],
      street: ["", Validators.minLength(4)],
      addressProof: [null],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.pattern(/^\d+$/),
      Validators.minLength(8)]],
      shareDetails: this.fb.array([]),
    })
  }

  ngOnInit(): void {
    this.editShareholderForm.get("userType")?.valueChanges.subscribe((userType) => {
      this.updateFormValidation(userType)
    })
  }

  ngOnChanges(): void {
    if (this.shareholder) {
      const shareDetailsArray = this.editShareholderForm.get('shareDetails') as FormArray;
      shareDetailsArray.clear();
      this.shareholder.shareDetails.forEach((detail: any) => {
        shareDetailsArray.push(
          this.fb.group({
            shareDetailsClassOfShares: [detail.shareDetailsClassOfShares],
            shareDetailsNoOfShares: [detail.shareDetailsNoOfShares],
            maxAllowedShares: [0]
          })
        );
      });

      // Pre-populate the form with shareholder data
      this.editShareholderForm.patchValue({
        surname: this.shareholder.surname || "",
        name: this.shareholder.name || "",
        chineeseName: this.shareholder.chineeseName || "",
        idNo: this.shareholder.idNo || "",
        idProof: this.shareholder.idProof || "",
        addressProof: this.shareholder.addressProof || "",
        userType: this.shareholder.userType || "person",
        address: this.shareholder.address || "",
        building: this.shareholder.building || "",
        district: this.shareholder.district || "",
        street: this.shareholder.street || "",
        email: this.shareholder.email || "",
        phone: this.shareholder.phone || "",
        shareDetails: this.shareholder.shareDetails,
      })

      this.shareDetailsFormArray.controls.forEach((row, index) => {
        row
          .get('shareDetailsNoOfShares')
          ?.valueChanges.subscribe((value) => {
            this.enforceShareLimit(index, value);
          });
      });

      console.log("Form after patching:", this.editShareholderForm.value);
      // Set image previews if available
      if (this.shareholder.idProof) {
        this.idProofPreview = this.shareholder.idProof
      }
      if (this.shareholder.addressProof) {
        this.addressProofPreview = this.shareholder.addressProof
      }

      // Update form validation based on user type
      this.updateFormValidation(this.shareholder.userType)
    }

    this.applyInitialShareLimits();
  }

  applyInitialShareLimits(): void {
    const remainingByClass = this.shareholder.total;

    this.shareDetailsFormArray.controls.forEach((row) => {
      const selectedClass = row.get('shareDetailsClassOfShares')?.value;
      if (!selectedClass) return;

      const remaining = remainingByClass[selectedClass] || 0;
      const currentValue = row.get('shareDetailsNoOfShares')?.value;

      const patchedValue =
        currentValue != null && currentValue > remaining
          ? remaining
          : currentValue;

      row.patchValue(
        {
          maxAllowedShares: remaining,
        },
        { emitEvent: false }
      );
    });
  }


  enforceShareLimit(index: number, value: number): void {
    const row = this.shareDetailsFormArray.at(index);
    const max = row.get('maxAllowedShares')?.value;

    if (max == null || value == null) return;

    if (value > max) {
      row.patchValue(
        { shareDetailsNoOfShares: max },
        { emitEvent: false }
      );
    }

    if (value < 0) {
      row.patchValue(
        { shareDetailsNoOfShares: 0 },
        { emitEvent: false }
      );
    }
  }

  get shareDetailsFormArray(): FormArray {
    return this.editShareholderForm.get('shareDetails') as FormArray;
  }

  updateFormValidation(userType: string) {
    const surnameControl = this.editShareholderForm.get("surname");
    const chineseNameControl = this.editShareholderForm.get("chineeseName");
    const idNoControl = this.editShareholderForm.get("idNo");
    const addressProofControl = this.editShareholderForm.get("addressProof");
    const nameControl = this.editShareholderForm.get("name");

    if (userType === "company") {
      surnameControl?.clearValidators();
      surnameControl?.setValue('');

      chineseNameControl?.clearValidators();
      nameControl?.setValidators([Validators.required, Validators.minLength(3)]);

      // Remove validation for address proof
      addressProofControl?.clearValidators();
      addressProofControl?.setValue('');
    } else {
      surnameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      nameControl?.setValidators([Validators.required, Validators.minLength(3)]);
    }

    // Update all controls
    surnameControl?.updateValueAndValidity();
    chineseNameControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity();
    nameControl?.updateValueAndValidity();
  }

  onShareClassChange(index: number): void {
    const row = this.shareDetailsFormArray.at(index);
    const selectedClass = row.get('shareDetailsClassOfShares')?.value;
    if (!selectedClass) return;

    const remainingByClass = this.shareholder.total;
    const remaining = remainingByClass[selectedClass] || 0;

    row.patchValue(
      {
        maxAllowedShares: remaining,
        shareDetailsNoOfShares: 0
      },
      { emitEvent: false }
    );
  }


  onSelectIDProofImage(event: any) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.idProofPreview = e.target.result
        this.editShareholderForm.patchValue({
          idProof: e.target.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  onImageSelectedAddress(event: any) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.addressProofPreview = e.target.result
        this.editShareholderForm.patchValue({
          addressProof: e.target.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.editShareholderForm.get(controlName)
    if (control?.errors) {
      if (control.errors["required"]) {
        return "This field is required"
      }
      if (control.errors["minlength"]) {
        return `Minimum length is ${control.errors["minlength"].requiredLength} characters`
      }
      if (control.errors["email"]) {
        return "Please enter a valid email address"
      }
      if (control.errors["pattern"]) {
        return "Please enter a valid phone number (10 digits)"
      }
    }
    return ""
  }

  submitEditForm() {
    this.isLoading = true;

    // Mark all fields as touched to trigger validation messages
    Object.keys(this.editShareholderForm.controls).forEach((key) => {
      const control = this.editShareholderForm.get(key);
      control?.markAsTouched();
    });

    // Identify specific invalid fields
    const invalidFields: any = {};
    Object.keys(this.editShareholderForm.controls).forEach((key) => {
      const control = this.editShareholderForm.get(key);
      if (control?.invalid) {
        invalidFields[key] = control.errors;
      }
    });

    if (this.editShareholderForm.invalid) {
      this.isLoading = false;
      const firstInvalidElement = document.querySelector(".error-message");
      firstInvalidElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const formData = {
      ...this.editShareholderForm.value,
      _id: this.shareholder._id,
      userId: localStorage.getItem("userId"),
      companyId: localStorage.getItem("companyId"),
    };

    this.companyService.updateShareHolder(formData).subscribe({
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

        this.shareholderUpdated.emit(formData);
        this.closeModal.emit();
      },
      error: (error) => {
        this.isLoading = false;

        console.error("Error occurred during shareholder update:", error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
    });
  }

  dropdowns: { [key: string]: { isOpen: boolean; selected: string | null } } = {
    telephone1: { isOpen: false, selected: '+91' },
    telephone2: { isOpen: false, selected: '+91' },
  };

  countries = [
    { name: 'Australia', code: '+61' },
    { name: 'Brazil', code: '+55' },
    { name: 'China', code: '+86' },
    { name: 'Egypt', code: '+20' },
    { name: 'France', code: '+33' },
    { name: 'Germany', code: '+49' },
    { name: 'Hong Kong', code: '+852' },
    { name: 'India', code: '+91' },
    { name: 'Japan', code: '+81' },
    { name: 'Spain', code: '+34' },
    { name: 'United States', code: '+1' },
  ];

  toggleDropdown(field: string) {
    this.dropdowns[field].isOpen = !this.dropdowns[field].isOpen;

    Object.keys(this.dropdowns).forEach(key => {
      if (key !== field) this.dropdowns[key].isOpen = false;
    });
  }

  selectItem(field: string, item: string) {
    this.dropdowns[field].selected = item;
    this.dropdowns[field].isOpen = false;

    switch (field) {
      case 'telephone1':
        this.editShareholderForm.patchValue({ phone: item });
        break;
    }
  }

  onlyNumber(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  close() {
    this.closeModal.emit()
  }
}

