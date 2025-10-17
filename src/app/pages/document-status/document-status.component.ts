import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CompanyService } from '../../core/services/company.service';
import { PdfService } from '../../core/services/pdf.service';
import { CommonModule } from '@angular/common';
import { PdfSharedAgrementService } from '../../core/services/pdf-shared-agrement.service';
import { PdfAoAService } from '../../core/services/pdf-ao-a.service';
import { PdfAoBService } from '../../core/services/pdf-ao-b.service';
import Swal from 'sweetalert2';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-document-status',
  imports: [CommonModule],
  templateUrl: './document-status.component.html',
  styleUrl: './document-status.component.css'
})
export class DocumentStatusComponent implements OnInit, OnDestroy {
  data: any;
  pdfUrl: string | null = null;
  pdfShareUrl: string | null = null;
  pdfAoAUrl: string | null = null;
  currentUploadId: string | null = null;
  showUploadModal = false;
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private pdfService = inject(PdfService);
  private pdfSharesService = inject(PdfSharedAgrementService);
  private pdfAoAService = inject(PdfAoAService);
  private pdfAoABService = inject(PdfAoBService);
  private route!: ActivatedRoute

  companyInformation: any[] = [];
    ShareCapitalList:any = [];
    shareholders: any[] = []
    directorsData: any[] = []
    secretoryData:any[]= [] 

  ngOnInit(): void {
    // Wait for payload before generating PDF
    this.companyService.getPayload().subscribe({
      next: async (data: any) => {
        console.log("full data",data);
        
        if (data) {
          this.data = data;
          console.log('Received payload:', this.data);
          await this.generatePdf(); // Generate PDF after receiving payload
        } else {
          console.warn('No payload found.');
        }
      },
      error: (err: any) => {
        console.error('Error fetching payload:', err);
      },
    });
  }

   getCompanyInformation(companyId:string) {
      this.companyService.getComapnyInfo(companyId).subscribe({
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
        next: (response: any) => {
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
  
    getShareHolderlist(companyId : string) {
      this.companyService.getShareHoldersListSummery(companyId).subscribe({
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

  confirmAndSendData() {
    if (!this.data) {
      const companyId :string = localStorage.getItem('companyId') as string

       // Get ID from URL
    const routeId: string = this.route.snapshot.paramMap.get('id') as string;

    if(companyId != routeId){
      console.warn("local storage company Id and params company Id not same")
      return;
    }
     else{

       console.warn("No data available to send.");

      this.getCompanyInformation(companyId);
      this.getShareCapitalInformation(companyId);
      this.getShareHolderlist(companyId);
      this.getDirectorInformation(companyId);
      this.getCompanySecretaryInformation(companyId)


       const payload = {
      companyInfo: this.companyInformation,
      shareCapital: this.ShareCapitalList,
      shareholders: this.shareholders,
      directors: this.directorsData,
      secretary : this.secretoryData
    };

    this.data = payload
     
     }

      
    }

    this.companyService.storeCompanyData(this.data).subscribe({
      next: (response) => {
         const updateStagePayload = {companyId : this.data.companyInfo[0]._id,index : 0}
         console.log("document status payload to completed", updateStagePayload)
         this.companyService.updateCurrentStage(updateStagePayload).subscribe((response: any) => {
        try {
          console.log('response from updateCurrentStage : ', response);
        } catch (error) {
          console.log(error);
        }
      });
        console.log('Data stored successfully:', response);
        localStorage.removeItem('companyId')
        Swal.fire({
          icon: 'success',
          title: 'Company Data Saved',
          text: 'Company data has been saved successfully!',
          confirmButtonText: 'OK',
        });
       
        this.router.navigate([`/incorporation-completion/${this.data.companyInfo[0]._id}`]);
      },
      error: (error) => {
        console.error('Error storing data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Save Data',
          text: 'An error occurred while saving company data. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    });
    
  }


  ngOnDestroy(): void {
    // Clean up URL object when component is destroyed
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
  }

  getTotalSignedCount(): number {
    return (this.data?.directors?.length || 0) + 
           (this.data?.shareholders?.length || 0);
  }

  async generatePdf() {
    try {
      if (this.data) {
        console.log('Generating PDF with payload:', this.data);
        this.pdfUrl = await this.pdfService.fillPdf(this.data);
        this.pdfShareUrl = await this.pdfSharesService.fillPdf(this.data);
        const businessType = this.data.companyInfo[0]?.type_of_business;
        console.log('Business Type:', businessType);
        if (businessType === 'private') {
          console.log("its privateeeee");
          
        if(this.data.shareholders && this.data.shareholders.length <=1){
          this.pdfAoAUrl = await this.pdfAoAService.fillPdf(this.data);         
         
        }
        else{
          console.log('this.payload.shareholders.length',this.data.shareholders.length)
          
          this.pdfAoAUrl = await this.pdfAoABService.fillPdf(this.data);

          
        }
      }
      else{

        this.pdfAoAUrl=null
      }
        console.log('PDF URL generated:', this.pdfAoAUrl);
        console.log('Documents generated:', {
          pdfUrl: this.pdfUrl,
          pdfShareUrl: this.pdfShareUrl
        });
        
        // Don't open the window automatically
        // window.open(this.pdfShareUrl, '_blank');
      } else {
        console.error('No payload available for PDF generation');
      }
    } catch (error) {
      console.error('Error in generatePdf:', error);
    }
  }
  
  // Add a new method to handle the download when requested
  downloadShareCertificate() {
    this.pdfSharesService.downloadGeneratedFile();
  }

  openUploadModal(id: string): void {
    this.currentUploadId = id;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.currentUploadId = null;
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Here you would handle the file upload to your backend
      console.log(`Uploading file ${file.name} for ID: ${this.currentUploadId}`);
      
      // Mock successful upload
      setTimeout(() => {
        this.closeUploadModal();
        // You might want to refresh your data here
      }, 1000);
    }
  }

  previewDocument(documentUrl: string): void {
    window.open(documentUrl, '_blank');
  }

  // Helper method to generate the appropriate position label
  getPositionLabel(type: string, index: number): string {
    return `${type} ${index + 1}`;
  }

}