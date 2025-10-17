import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { AdminService } from '../../core/services/admin.service';

export interface DocumentTemplate {
  _id?: string;
  srNo: number;
  documentName: string;
  templateUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


@Component({
  selector: 'app-incorporation-documents',
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './incorporation-documents.component.html',
  styleUrl: './incorporation-documents.component.css'
})
export class IncorporationDocumentsComponent implements OnInit {
  documents: DocumentTemplate[] = [];
  loading = false;
  error: string | null = null;
  
  // Add/Edit form properties
  showAddForm = false;
  editingDocument: DocumentTemplate | null = null;
  formData: Partial<DocumentTemplate> = {};
  selectedFile: File | null = null;

   private adminService = inject(AdminService);
 

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getIncorporationDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load documents';
        this.loading = false;
        console.error('Error loading documents:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX, etc.)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
      } else {
        this.error = 'Please select a valid document file (PDF, DOC, DOCX)';
        event.target.value = '';
      }
    }
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.editingDocument = null;
    this.formData = {};
    this.selectedFile = null;
    this.error = null;
  }

  openEditForm(document: DocumentTemplate): void {
    this.showAddForm = true;
    this.editingDocument = document;
    this.formData = { ...document };
    this.selectedFile = null;
    this.error = null;
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingDocument = null;
    this.formData = {};
    this.selectedFile = null;
    this.error = null;
  }

 

  previewDocument(document: DocumentTemplate): void {
    if (document.templateUrl) {
      window.open(document.templateUrl, '_blank');
    }
  }

  downloadDocument(doc: DocumentTemplate): void {
    if (doc.templateUrl) {
      const link = document.createElement('a');
      link.href = doc.templateUrl;
      link.download = doc.documentName;
      link.click();
    }
  }




   // saveDocument(): void {
  //   if (!this.formData.documentName?.trim()) {
  //     this.error = 'Document name is required';
  //     return;
  //   }

  //   if (!this.editingDocument && !this.selectedFile) {
  //     this.error = 'Please select a file to upload';
  //     return;
  //   }

  //   this.loading = true;
  //   this.error = null;

  //   const formData = new FormData();
  //   formData.append('documentName', this.formData.documentName);
    
  //   if (this.selectedFile) {
  //     formData.append('document', this.selectedFile);
  //   }

  //   const request = this.editingDocument 
  //     ? this.http.put<DocumentTemplate>(`/api/documents/${this.editingDocument._id}`, formData)
  //     : this.http.post<DocumentTemplate>('/api/documents', formData);

  //   request.subscribe({
  //     next: (response) => {
  //       this.loadDocuments();
  //       this.closeForm();
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       this.error = 'Failed to save document';
  //       this.loading = false;
  //       console.error('Error saving document:', error);
  //     }
  //   });
  // }

  // deleteDocument(document: DocumentTemplate): void {
  //   if (confirm(`Are you sure you want to delete "${document.documentName}"?`)) {
  //     this.loading = true;
  //     this.error = null;

  //     this.http.delete(`/api/documents/${document._id}`).subscribe({
  //       next: () => {
  //         this.loadDocuments();
  //         this.loading = false;
  //       },
  //       error: (error) => {
  //         this.error = 'Failed to delete document';
  //         this.loading = false;
  //         console.error('Error deleting document:', error);
  //       }
  //     });
  //   }
  // }
}