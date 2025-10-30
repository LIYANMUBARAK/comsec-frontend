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
      chineeseName: ["", [Validators.minLength(3)]],
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

      // Restore validation for address proof
      addressProofControl?.setValidators([Validators.required]);
    }

    // Update all controls
    surnameControl?.updateValueAndValidity();
    chineseNameControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity();
    nameControl?.updateValueAndValidity();
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

    // Check overall form validity
    console.log("Form Errors:", this.editShareholderForm.value);
    console.log("Form Valid:", !this.editShareholderForm.invalid); // Should be true if valid

    // Identify specific invalid fields
    const invalidFields: any = {};
    Object.keys(this.editShareholderForm.controls).forEach((key) => {
      const control = this.editShareholderForm.get(key);
      if (control?.invalid) {
        invalidFields[key] = control.errors;
      }
    });

    // Log invalid fields and their errors
    console.log("Invalid Fields:", invalidFields);

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

  close() {
    this.closeModal.emit()
  }
}

