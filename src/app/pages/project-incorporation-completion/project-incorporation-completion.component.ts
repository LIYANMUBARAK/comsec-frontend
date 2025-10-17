import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-project-incorporation-completion',
  imports: [
    CommonModule,  
    FormsModule   
  ],
  templateUrl: './project-incorporation-completion.component.html',
  styleUrl: './project-incorporation-completion.component.css'
})
export class ProjectIncorporationCompletionComponent {
 activeTab: string = 'revise';
  selectedTemplate: string = '';
  showUploadModal: boolean = false;
  selectedUserId: string = '';
  incorporateDate: string = '';
  businessRegNumber: string = '';

    documents: any[] = [];
    loading = false;
    error: string | null = null;
    
    // Add/Edit form properties
    showAddForm = false;
    editingDocument: any | null = null;
    formData: Partial<any> = {};
    selectedFile: File | null = null;


       private adminService = inject(AdminService);
          private router = inject(Router);

    
  
  // Sample data - replace with actual service calls
  data = {
    shareholders: [
      {
        _id: '1',
        name: 'John',
        surname: 'Doe',
        userType: 'person',
        idProof: 'id-proof-1.pdf',
        addressProof: 'address-proof-1.pdf'
      }
    ],
    directors: [
      {
        _id: '2',
        name: 'Jane',
        surname: 'Smith',
        type: 'person',
        idProof: 'id-proof-2.pdf',
        addressProof: 'address-proof-2.pdf'
      }
    ],
    secretary: [
      {
        _id: '3',
        name: 'Company',
        surname: 'Secretary',
        type: 'person',
        idProof: 'id-proof-3.pdf',
        addressProof: 'address-proof-3.pdf'
      }
    ]
  };

  // documents = [
  //   { id: 1, name: 'NNCI Form (Signed)', status: 'signed', signedCount: 2 },
  //   { id: 2, name: 'Article of Association (A&A)', status: 'signed', signedCount: 2 },
  //   { id: 3, name: 'Share Agreement', status: 'signed', signedCount: 2 },
  //   { id: 4, name: 'Minutes', status: 'signed', signedCount: 2 }
  // ];

  publishedDocuments = [
    { id: 1, name: 'NNCI Form (Signed)' },
    { id: 2, name: 'Article of Association (A&A)' },
    { id: 3, name: 'Share Agreement' },
    { id: 4, name: 'Minutes' }
  ];

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getIncorporationDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        console.log(this.documents)
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load documents';
        this.loading = false;
        console.error('Error loading documents:', error);
      }
    });
  }

  showTab(tabName: string): void {
    this.activeTab = tabName;
  }

  selectTemplate(template: string): void {
    this.selectedTemplate = template;
  }

  revertToCompanyDetails(): void {
    // Logic to revert to company details
    console.log('Reverting to company details');
  }

  proceedNext(): void {
    // Logic to proceed to next step
     this.router.navigate(['/user-dashboard']);
    console.log('Proceeding to next step');

  }

  onFileSelect(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      console.log(`File selected for ${type}:`, file.name);
      // Handle file upload logic
    }
  }

  submitObtainForm(): void {
    console.log('Submitting obtain documents form');
    // Handle form submission
  }

  submitShareCertificate(): void {
    if (!this.selectedTemplate) {
      alert('Please select a template');
      return;
    }
    console.log('Submitting share certificate with template:', this.selectedTemplate);
    // Handle submission
  }

  confirmAndSendData(): void {
    console.log('Confirming and sending data');
    // Handle confirmation
  }

  getTotalSignedCount(): number {
    return 2; // Replace with actual logic
  }



  openUploadModal(userId: string): void {
    this.selectedUserId = userId;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedUserId = '';
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploading file for user:', this.selectedUserId, file.name);
      // Handle file upload
      this.closeUploadModal();
    }
  }

  downloadShareCertificate(): void {
    console.log('Downloading share certificate');
    // Handle download
  }


    previewDocument(document: any): void {
      if (document.templateUrl) {
        window.open(document.templateUrl, '_blank');
      }
    }

  
}
