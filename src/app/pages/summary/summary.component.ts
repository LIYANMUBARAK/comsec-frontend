import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


export interface ShareCapital {
  _id: string;
  companyid: string;
  userid: string;
  total_share: number;
  amount_share: number;
  total_capital_subscribed: number;
  unpaid_amount: number;
  share_class: string;
  share_right: string;


}

@Component({
  selector: 'app-summary',
  imports: [FormsModule, CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {
  companyId!: string;
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  companyInformation: any[] = [];
  ShareCapitalList: ShareCapital[] = [];
  shareholders: any[] = []
  directorsData: any[] = []
  secretoryData: any[] = []
  isViewModalOpen = false;
  selectedShareholder: any

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.companyId = params['companyId'];
      console.log('Company ID:', this.companyId);
      this.getCompanyInformation();
      this.getShareCapitalInformation(this.companyId);
      this.getShareHolderlist();
      this.getDirectorInformation(this.companyId);
      this.getCompanySecretaryInformation(this.companyId)
    });
  }

  getCompanyInformation() {
    this.companyService.getComapnyInfo(this.companyId).subscribe({
      next: (response) => {
        console.log(response);
        this.companyInformation.push(response);
      },
      error: (error) => {
        console.error("Error fetching company information:", error);
      }
    });
  }

  getShareCapitalInformation(companyId: string) {
    this.companyService.getShareCapitalInfo(companyId).subscribe({
      next: (response: ShareCapital[]) => {
        console.log('Share capital information:', response);
        this.ShareCapitalList = response;
      },
      error: (error) => {
        console.error('Error fetching share capital information:', error);
      }
    });
  }


  calculateTotalShareAmount(totalShare: number, amountShare: number): number {
    return totalShare * amountShare;
  }

  getShareHolderlist() {
    this.companyService.getShareHoldersListSummery(this.companyId).subscribe({
      next: (response: { message: string; data: any }) => {
        console.log("Shareholders Data fetched successfully:", response);
        this.shareholders = response.data;
      },
      error: (error) => {
        console.error("Error fetching shareholders list:", error);
      }
    });
  }

  getDirectorInformation(companyId: string) {
    this.companyService.getDirectorInformation(companyId).subscribe(
      (response) => {
        console.log("Director Data fetched successfully:", response);
        this.directorsData = response.data;
      },
      (error) => {
        console.error("Error fetching Directors list:", error);
      }
    );
  }

  getCompanySecretaryInformation(companyId: string) {
    this.companyService.getCompanySecretaryInformation(companyId).subscribe(
      (response) => {
        console.log("Company Secretary Data fetched successfully:", response);
        this.secretoryData = response.data;
      },
      (error) => {
        console.error("Error fetching Company Secretary list:", error);
      }
    );
  }

  confirmNavigation() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the data and proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save and Proceed',
      cancelButtonText: 'No, Cancel',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveDataBeforeNavigation();
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'info',
          title: 'Cancelled',
          text: 'Your data is safe!',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  }

  viewShareDetails(shareholder: any) {
    // Set the selected shareholder
    console.log("00,", shareholder);
    this.selectedShareholder = shareholder;
    console.log("00,", this.selectedShareholder);

    // Show the modal
    this.isViewModalOpen = true;
  }

  closeShareModal() {
    this.isViewModalOpen = false;
  }


  saveDataBeforeNavigation() {
    const payload = {
      companyInfo: this.companyInformation,
      shareCapital: this.ShareCapitalList,
      shareholders: this.shareholders,
      directors: this.directorsData,
      secretary: this.secretoryData
    };
    console.log("payloads", payload);


    this.companyService.setPayload(payload);
    console.log("companyInfo  ", payload)
    const updateStagePayload = { companyId: payload.companyInfo[0]._id, index: 6 }
    console.log("updating current stage in summary", updateStagePayload)
    this.companyService.updateCurrentStage(updateStagePayload).subscribe((response: any) => {
      try {
        console.log('response from updateCurrentStage : ', response);
      } catch (error) {
        console.log(error);
      }
    });

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Saved!',
      text: 'Data has been saved successfully.',
      toast: true,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    }).then(() => {
      this.router.navigate(['/document-status', this.companyId]);
    });
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
    return 'Unknown';
  }

  onEditClicks() {
    this.router.navigate(['/project-form'], {
      queryParams: {
        companyId: this.companyId,
        resume: true,
      },
    });
  }

}