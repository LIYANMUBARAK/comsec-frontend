import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-email-template-preview',
  imports: [HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './email-template-preview.component.html',
  styleUrl: './email-template-preview.component.css',
})
export class EmailTemplatePreviewComponent implements OnInit {
  emailHtml: string = '';
  subject: string = '';
  loading: boolean = true;
  error: string | null = null;
  private adminService = inject(AdminService);

  constructor(private route: ActivatedRoute) {}

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
    const templateName = nameMap[templateId];

    this.adminService.getEmailTemplate(templateName).subscribe({
      next: (data) => {
        this.subject = data.subject;
        this.emailHtml = data.html;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load email template.';
        this.loading = false;
      },
    });
  }
}
