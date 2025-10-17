import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfSharedAgrementService {
  private templatePath = '/assets/documents/sharecertificate.docx';
  private generatedBlob: Blob | null = null;
  private generatedFilename: string = '';

  constructor(private http: HttpClient) { }

  async fillPdf(payload: any): Promise<string> {
    try {
      console.log('Starting document generation process');
  
      const templateArrayBuffer = await firstValueFrom(
        this.http.get(this.templatePath, { responseType: 'arraybuffer' })
      );
  
      const zip = new PizZip(templateArrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });
  
      // Extract and set data with fallback values for missing fields
      doc.setData({
        'New shareholder English name': payload?.shareholders?.[0]?.name ?? '',
        'New shareholder’s address': payload?.shareholders?.[0]?.address ?? '',
        'Issued date': new Date().toLocaleDateString(),
        'Issued date Chinese version': new Date().toLocaleDateString(),
        'No. of Shares -> 1,000': payload?.shareholders?.[0]?.shareDetailsNoOfShares?.toString() ?? '0',
        'Class of Shares': payload?.shareholders?.[0]?.shareDetailsClassOfShares ?? '',
        'Class of Shares Chinese': payload?.shareholders?.[0]?.shareDetailsClassOfShares ?? '',
        'Unit price -> US$1.00': payload?.shareCapital?.[0]?.amount_share ?? '',
        'Company English Name': payload?.companyInfo?.[0]?.business_name ?? '',
        'Company Chinese Name': payload?.companyInfo?.[0]?.business_name_chinese ?? '',
        'Director 1 English name': `${payload?.directors?.[0]?.name ?? ''} ${payload?.directors?.[0]?.surname ?? ''}`.trim(),
        'Director 2 English name': (payload?.directors?.[1]?.name && payload?.directors?.[1]?.surname) 
          ? `${payload.directors[1].name} ${payload.directors[1].surname}`.trim() 
          : '',
        'Company Secretary English name': payload?.secretary?.[0]?.name ?? '',
        'Company Number': payload?.companyInfo?.[0]?.reference_no ?? ''
      });
  
      // Log missing values for debugging purposes
      if (!payload?.directors?.[1]?.name || !payload?.directors?.[1]?.surname) {
        console.log("Director 2 English name not set because value does not exist.");
      }
  
      doc.render();
  
      this.generatedBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
  
      this.generatedFilename = `${payload?.companyInfo?.[0]?.business_name ?? 'Unknown'}_ShareCertificate.docx`;
  
      const blobUrl = URL.createObjectURL(this.generatedBlob);
      return blobUrl;
    } catch (error: any) {
      console.error('Detailed error information:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw error;
    }
  }
  

  downloadGeneratedFile(): void {
    if (this.generatedBlob && this.generatedFilename) {
      saveAs(this.generatedBlob, this.generatedFilename);
    } else {
      console.warn('No file has been generated yet');
    }
  }
}