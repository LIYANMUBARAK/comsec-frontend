import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email-template-preview',
  imports: [HeaderComponent, SidebarComponent, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './email-template-preview.component.html',
  styleUrl: './email-template-preview.component.css',
})
export class EmailTemplatePreviewComponent implements OnInit {
  emailHtml: string = '';
  subject: string = '';
  loading: boolean = true;
  error: string | null = null;
  isEditMode = false;
  isSaving = false;
  template = { subject: '', html: '' };
  originalTemplate = { subject: '', html: '' };
  
  sampleData: Record<string, string> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    loginUrl: 'https://comsec-frontend.vercel.app/login'
  };
  
  
  templateName: string = '';
  private adminService = inject(AdminService);
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const nameMap: { [key: string]: string } = {
      '1': 'Invitation Shareholder for Data Entry',
      '2': 'Invitation Director for Data Entry',
      '3': 'OTP for Guest User',
      '4': 'Inform Shareholder for Signature',
      '5': 'Inform Director for Signature	',
      '6': 'Inform Guest User for Signature	',
      '7': 'Completion for Shareholder',
      '8': 'Completion for Director',
    };

    const templateId = this.route.snapshot.paramMap.get('id')!;
    this.templateName = nameMap[templateId];

    this.getEmailTemplate();
  }

  getEmailTemplate() {
    this.adminService.getEmailTemplate(this.templateName).subscribe({
      next: (data) => {
        this.subject = data.subject;
        this.emailHtml = data.html;
        this.originalTemplate = { ...data };
        this.loading = false;
        this.template = data;
      },
      error: (err) => {
        this.error = 'Failed to load email template.';
        this.loading = false;
      },
    });
  }

  getTemplate() {
    this.adminService.getEmailTemplate(this.templateName).subscribe({
      next: (data) => {
        this.template = data;
        this.originalTemplate = { ...data };
        this.subject = data.subject;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load email template.';
        this.loading = false;
      },
    });
  }

  getPreviewHtml(): string {
    let html = this.template.html || '';
    Object.entries(this.sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });
    return html;
  }

  toggleEditMode() {
    if (this.isEditMode) this.template = { ...this.originalTemplate };
    this.isEditMode = !this.isEditMode;
  }

  confirmSaveTemplate() {
    Swal.fire({
      title: 'Save Changes?',
      text: 'Do you want to save the updated email template?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) this.saveTemplate();
    });
  }

  saveTemplate() {
    Swal.fire({
      title: 'Saving...',
      text: 'Please wait while we save your changes.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.adminService.updateEmailTemplate(this.templateName, this.template).subscribe({
      next: () => {
        this.originalTemplate = { ...this.template };
        this.isEditMode = false;
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Template updated successfully.',
          timer: 1800,
          showConfirmButton: false,
        });
        this.getEmailTemplate();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: err.message || 'An error occurred while saving.',
        });
      },
    });
  }
}
