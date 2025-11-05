import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../core/services/company.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent {
  activeTab: any = 'project';
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private userService = inject(AdminService);
  isDarkTheme = false;
  userId: any;
  dataEnteringCount: number = 0;
  documentationCount: number = 0;
  finalStageCount: number = 0;
  completedCount: number = 0;
  companies: any[] = [];
  displayedCompanies: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  userData: any;
  isRestrictedUser: boolean = false;
  companyIds: string[] = [];

  ngOnInit(): void {
    this.getUser();
    this.getUserDatas();
    //this.authService.logout()
    this.loadCompanyData();
    console.log(this.activeTab);
    this.applyTheme();
    this.themeService.isDarkTheme$.subscribe(
      (isDark) => (this.isDarkTheme = isDark)
    );
  }

  loadCompanyData(): void {
    this.companyService.getCompanyData().subscribe({
      next: (response) => {
        if (response) {
          this.companies = response;
          const filteredCompanies = this.companies.filter((company) =>
            this.companyIds.includes(company._id)
          );
          this.updateDisplayedCompanies();
          this.updateStatusCounters(filteredCompanies);
        }
      },
      error: (error) => {
        console.error('Error fetching company data:', error);
      },
    });
  }

  updateStatusCounters(companies: any): void {
    // Reset counters
    this.dataEnteringCount = 0;
    this.documentationCount = 0;
    this.finalStageCount = 0;
    this.completedCount = 0;

    for (const company of companies) {
      const stage = Number(company.currentStage);

      if (stage >= 1 && stage <= 5) {
        this.dataEnteringCount++;
      } else if (stage === 6) {
        this.documentationCount++;
      } else if (stage === 7) {
        this.finalStageCount++;
      } else if (stage === 0) {
        this.completedCount++;
      }
    }
  }

  getCompanyStatusLabel(stage: number): string {
    if (stage >= 1 && stage <= 5) {
      return 'Data Entering';
    } else if (stage === 6) {
      return 'Documentation';
    } else if (stage === 7) {
      return 'Final Stage';
    } else if (stage === 0) {
      return 'Completed';
    }
    return 'Unknown'; // fallback if stage is missing
  }

  updateDisplayedCompanies() {
    const filteredCompanies = this.companies.filter((company) =>
      this.companyIds.includes(company._id)
    );

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedCompanies = filteredCompanies.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedCompanies();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedCompanies();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.companyIds.length / this.itemsPerPage);
  }

  getUserDatas() {
    // Get the userId from localStorage directly
    this.userId = localStorage.getItem('userId');
    console.log('userId:', this.userId);

    if (this.userId) {
      this.authService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userData = user;
          console.log('User data:', this.userData);
          if (
            this.userData.roles === 'Company Secretary' &&
            (!this.userData.companyid || this.userData.companyid.length === 0)
          ) {
            Swal.fire({
              title: 'ComSec',
              html: `
                <h2>ComSec360</h2>
                <p><strong>Company Secretarial Management</strong></p>
                <p>You do not have any project or company yet!!</p>
                <p><strong>Project - Company Incorporate Starts.</strong></p>
              `,
              icon: 'info',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
              allowEscapeKey: false,
            });
            this.router.navigate(['/project-form']);
          }
        },
        error: (err: any) => {
          console.error('Error fetching user data:', err);
        },
      });
    } else {
      console.log('User is not logged in or userId is not available.');
    }
  }

  onHandleTabChange(tabName: any) {
    this.activeTab = tabName;
    console.log(this.activeTab);
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  navigateToProjectForm() {
    localStorage.removeItem('companyId');
    this.router.navigate(['/project-form']);
  }

  // New method to handle resume functionality
  resumeProject(company: any) {
    console.log('Resuming project for company:', company);

    // Show confirmation dialog
    Swal.fire({
      title: 'Resume Project',
      text: `Do you want to resume the project for ${company.business_name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Resume',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('companyId');
        localStorage.setItem('companyId', company._id);
        if (company.currentStage >= 1 && company.currentStage < 4) {
          // Navigate to project form with company data or specific resume route
          // You can pass company data as route params or query params

          this.router.navigate(['/project-form'], {
            queryParams: {
              companyId: company.id || company._id,
              resume: true,
              tab: company.currentStage,
              currentStage: company.currentStage,
            },
          });

          // Or navigate to a specific resume route if you have one
          // this.router.navigate(['/resume-project', company.id]);

          Swal.fire(
            'Resumed!',
            'Project has been resumed successfully.',
            'success'
          );
        } else if (company.currentStage == 4) {
          this.router.navigate([`/summary/${company._id}`]);
        } else if (company.currentStage == 5) {
          this.router.navigate([`/summary/${company._id}`]);
        } else if (company.currentStage == 6) {
          this.router.navigate([`/summary/${company._id}`]);
        }
      }
    });
  }

  // Helper method to check if resume button should be shown
  shouldShowResumeButton(company: any): boolean {
    return company.currentStage && company.currentStage !== 0;
  }

  getUser() {
    let userId = <string>localStorage.getItem('userId');
    this.userService.getUserById(userId).subscribe((res) => {
      this.companyIds.push(...res.companyid);
    });
  }

  getNextAnnualReturnDate(incorporateDate: string | Date): Date | null {
    if (!incorporateDate) return null;
    const date = new Date(incorporateDate);
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }
}
