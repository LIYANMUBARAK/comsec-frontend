import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-invite-email-template-editor',
  imports: [FormsModule, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './user-invite-email-template-editor.component.html',
  styleUrl: './user-invite-email-template-editor.component.css'
})
export class UserInviteEmailTemplateEditorComponent {
  private adminService = inject(AdminService);
  
  template = {
    subject: '',
    html: ''
  };

  originalTemplate = {
    subject: '',
    html: ''
  };

  isEditMode = false;
  isLoading = false;
  loadingMessage = '';

  // Sample data for preview
  sampleData = {
    firstName: 'James',
    lastName: 'Bond',
    email: 'jamesbond007@gmail.com',
    password: 'jY-A4y467/HI',
    loginUrl: 'https://comsec360.com/login'
  };

  ngOnInit() {
    this.loadTemplate();
  }

  loadTemplate() {
    this.isLoading = true;
    this.loadingMessage = 'Loading template...';
    
    this.adminService.getUserInvitationEmailTemplate().subscribe({
      next: (data) => {
        this.template = { ...data };
        this.originalTemplate = { ...data };
        this.isLoading = false;
        
        // If no template exists, set a default one
        if (!this.template.html) {
          this.setDefaultTemplate();
        }
      },
      error: (err) => {
        console.error('Failed to fetch template:', err);
        this.isLoading = false;
        this.setDefaultTemplate();
      }
    });
  }

  setDefaultTemplate() {
    this.template = {
      subject: 'Welcome to COMSEC360 - Your Account Details',
      html: `<h1>Welcome to COMSEC360</h1>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Your account has been created successfully. Below are your login details:</p>
<ul>
  <li><strong>Full Name:</strong> {{firstName}} {{lastName}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Password:</strong> <span style="background-color: #f2f2f2; padding: 5px; border-radius: 3px;">{{password}}</span></li>
</ul>
<p>You can log in using the following link:</p>
<p style="text-align: center;">
  <a href="{{loginUrl}}" 
     style="display: inline-block; background-color: black; color: white; 
            font-size: 14px; font-weight: bold; text-decoration: none; 
            padding: 12px 24px; border-radius: 6px;">
    Login Now
  </a>
</p>
<p>Best Regards,<br>COMSEC360 Team</p>`
    };
    this.originalTemplate = { ...this.template };
  }

  toggleEditMode() {
    if (this.isEditMode) {
      // Cancel edit - restore original template
      this.template = { ...this.originalTemplate };
    }
    this.isEditMode = !this.isEditMode;
  }

  saveTemplate() {
    this.isLoading = true;
    this.loadingMessage = 'Saving template...';
    
    this.adminService.updateUserInvitationEmailTemplate(this.template).subscribe({
      next: () => {
        this.isLoading = false;
        this.originalTemplate = { ...this.template };
        this.isEditMode = false;
        this.showSuccessMessage('Template saved successfully!');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to save template:', err);
        this.showErrorMessage('Failed to save template: ' + err.message);
      }
    });
  }

  resetTemplate() {
    if (confirm('Are you sure you want to reset the template to its original state?')) {
      this.template = { ...this.originalTemplate };
    }
  }

  getPreviewHtml(): string {
    let html = this.template.html || '';
    
    // Replace template variables with sample data
    Object.entries(this.sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });
    
    return html;
  }

  private showSuccessMessage(message: string) {
    // You can implement a toast notification service here
    // For now, using alert
    
     Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Template Updated.',
              toast: true,
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
  }

  private showErrorMessage(message: string) {
    Swal.fire({
               icon: 'error',
               title: 'Error!',
               text: 'Failed to update template. Please try again.',
               showConfirmButton: true,
             });
  }
}