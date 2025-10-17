import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-incorporation-email-templates',
  imports: [HeaderComponent, SidebarComponent,CommonModule],
  templateUrl: './incorporation-email-templates.component.html',
  styleUrl: './incorporation-email-templates.component.css'
})
export class IncorporationEmailTemplatesComponent  {
  loading = true;
  error: string | null = null;

  templates = [
    { id: 1, name: 'Invitation Shareholder for Data Entry' },
    { id: 2, name: 'Invitation Director for Data Entry' },
    { id: 3, name: 'OTP for Guest User' },
    { id: 4, name: 'Inform Shareholder for Signature' },
    { id: 5, name: 'Inform Director for Signature' },
    { id: 6, name: 'Inform Guest User for Signature' },
    { id: 7, name: 'Completion for Shareholder' },
    { id: 8, name: 'Completion for Director' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Simulate API
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  previewTemplate(id: number) {
    this.router.navigate(['/admin/incorporation/emails', id]);
  }
}