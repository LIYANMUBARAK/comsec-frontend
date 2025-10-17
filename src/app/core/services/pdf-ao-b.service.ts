import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

@Injectable({
  providedIn: 'root'
})
export class PdfAoBService {
  constructor() { }

  async fillPdf(payload: any): Promise<string> {
    try {
      console.log("Processing PDF generation...");
      
      // Validate payload
      if (!payload) {
        throw new Error('No payload provided');
      }

      const existingPdfBytes = await fetch('/assets/documents/AA_Sample_B.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
  
      const form = pdfDoc.getForm();
      const firstPage = pdfDoc.getPage(0);
      const secondPage = pdfDoc.getPage(1);
      const thirdPage = pdfDoc.getPage(2);
      const fourthPage = pdfDoc.getPage(3); 

      const { width: width2, height: height2 } = secondPage.getSize();
      const { width: width3, height: height3 } = thirdPage.getSize();
      const { width: width4, height: height4 } = fourthPage.getSize();

      // Create form field helper function with error handling
      const createFormField = (name: string, x: number, y: number, width: number, height: number, page = secondPage) => {
        try {
          const field = form.createTextField(name);
          if (!field) {
            console.warn(`Failed to create field: ${name}`);
            return null;
          }
          field.addToPage(page, {
            x: x,
            y: y,
            width: width,
            height: height,
            borderWidth: 0,
            backgroundColor: rgb(1, 1, 0.8)
          });
          return field;
        } catch (error) {
          console.error(`Error creating field ${name}:`, error);
          return null;
        }
      };
      
      // Create all form fields with proper error handling
      const fields = {
        englishName: createFormField('english_company_name', 100, height2 - 231, 400, 30),
        englishName2: createFormField('english_company_name2', 100, height2 - 361, 400, 30),
        chineseName: createFormField('chinese_company_name', 100, height2 - 267, 400, 30),
        chineseName2: createFormField('chinese_company_name2', 100, height2 - 393, 400, 30),
        totalShares: createFormField('total_shares', 370, height2 - 587, 150, 25),
        totalShareCapital: createFormField('amount_share', 370, height2 - 625, 150, 25),
        paidUpCapital: createFormField('paid_up_capital', 370, height2 - 660, 150, 25),
        unpaidCapital: createFormField('unpaid_capital', 370, height2 - 695, 150, 25),
      };

      const thirdPageFields = {
        classOfShares: createFormField('class_of_shares', 370, height3 - 67, 150, 25, thirdPage),
        totalSharesInClass: createFormField('total_shares_in_class', 370, height3 - 100, 150, 25, thirdPage),
        totalShareCapitalInClass: createFormField('total_share_capital', 370, height3 - 135, 150, 25, thirdPage),
        paidUpAmount: createFormField('paid_up_amount', 370, height3 - 175, 150, 25, thirdPage),
        unpaidAmount: createFormField('unpaid_amount', 370, height3 - 211, 150, 25, thirdPage),
        classOfShares2: createFormField('class_of_shares2', 370, height3 - 285, 150, 25, thirdPage),
        totalSharesInClass2: createFormField('total_shares_in_class2', 370, height3 - 320, 150, 25, thirdPage),
        totalShareCapitalInClass2: createFormField('total_share_capital2', 370, height3 - 355, 150, 25, thirdPage),
        paidUpAmount2: createFormField('paid_up_amount2', 370, height3 - 395, 150, 25, thirdPage),
        unpaidAmount2: createFormField('unpaid_amount2', 370, height3 - 427, 150, 25, thirdPage),
      };

      const fourthPageFields = {
        founderName1: createFormField('founder_name_1', 138, height4 - 170, 190, 25, fourthPage),
        founderName2: createFormField('founder_name_chineese', 138, height4 - 195, 190, 25, fourthPage),
        founderName3: createFormField('founder_name_2', 138, height4 - 387, 190, 25, fourthPage),
        founderName4: createFormField('founder_name_chineese2', 138, height4 - 410, 190, 25, fourthPage),
        founderShares1: createFormField('founder_shares_1', 370, height4 - 170, 150, 25, fourthPage),
        founderShareType1: createFormField('founder_share_type_1', 370, height4 - 190, 150, 25, fourthPage),
        founderShareCapital1: createFormField('founder_share_capital_1', 370, height4 - 215, 150, 25, fourthPage),
        founderShares2: createFormField('founder_shares_2', 370, height4 - 235, 150, 25, fourthPage),
        founderShareType2: createFormField('founder_share_type_2', 370, height4 - 250, 150, 25, fourthPage),
        founderShareCapital2: createFormField('founder_share_capital_2', 370, height4 - 270, 150, 25, fourthPage),
        founderShares3: createFormField('founder_shares_3', 370, height4 - 235, 150, 25, fourthPage),
        founderShareType3: createFormField('founder_share_type_3', 370, height4 - 250, 150, 25, fourthPage),
        founderShareCapital3: createFormField('founder_share_capital_3', 370, height4 - 270, 150, 25, fourthPage),
        totalSharesBottom2: createFormField('total_shares_bottom2', 370, height4 - 390, 150, 25, fourthPage),
        totalSharesBottom12: createFormField('total_shares_bottom12', 370, height4 - 410, 150, 25, fourthPage),
        totalShareCapitalBottom2: createFormField('total_share_capital_bottom2', 370, height4 - 430, 150, 25, fourthPage),
        totalSharesBottom3: createFormField('total_shares_bottom3', 370, height4 - 455, 150, 25, fourthPage),
        totalSharesBottom14: createFormField('total_shares_bottom13', 370, height4 - 480, 150, 25, fourthPage),
        totalShareCapitalBottom4: createFormField('total_share_capital_bottom3', 370, height4 - 500, 150, 25, fourthPage),
      };

      // Safe field value setter with error handling
      const setFieldValue = (fieldName: string, value: any) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            const fieldValue = value != null ? value.toString() : '';
            field.setText(fieldValue);
            console.log(`Set ${fieldName} to:`, fieldValue);
          } else {
            console.warn(`Field ${fieldName} not found`);
          }
        } catch (error) {
          console.warn(`Error setting field ${fieldName}:`, error);
        }
      };

      // Safely handle company info
      const companyInfo = payload.companyInfo?.[0];
      if (companyInfo) {
        setFieldValue('english_company_name', companyInfo.business_name || '');
        setFieldValue('english_company_name2', companyInfo.business_name || '');
        setFieldValue('chinese_company_name', companyInfo.business_name_chinese || '');
        setFieldValue('chinese_company_name2', companyInfo.business_name_chinese || '');
      }
  
      // Safely handle share capital
      const shareCapital = payload.shareCapital?.[0];
      const shareCapital2 = payload.shareCapital?.[1];

      if (shareCapital) {
        setFieldValue('total_shares', shareCapital.total_share || '');
        setFieldValue('amount_share', shareCapital.total_capital_subscribed || '');
        setFieldValue('paid_up_capital', shareCapital.amount_share || '');
        setFieldValue('unpaid_capital', shareCapital.unpaid_amount || '');
        setFieldValue('class_of_shares', shareCapital.share_class || '');
        setFieldValue('total_shares_in_class', shareCapital.total_share || '');
        setFieldValue('total_share_capital', shareCapital.total_capital_subscribed || '');
        setFieldValue('paid_up_amount', shareCapital.amount_share || '');
        setFieldValue('unpaid_amount', shareCapital.unpaid_amount || '');
        setFieldValue('total_shares_bottom', shareCapital.total_share || '');
        setFieldValue('total_shares_bottom1', shareCapital.share_class ? `${shareCapital.share_class} shares` : '');
        setFieldValue('total_share_capital_bottom', shareCapital.amount_share || '');
      }

      // Handle second share capital if exists
      if (shareCapital2) {
        setFieldValue('total_shares_bottom2', shareCapital2.total_share || '');
        setFieldValue('total_shares_bottom12', shareCapital2.share_class ? `${shareCapital2.share_class} shares` : '');
        setFieldValue('total_share_capital_bottom2', shareCapital2.amount_share || '');
      }

      // Calculate and set total shares if both share capitals exist
      if (shareCapital && shareCapital2) {
        const total1 = Number(shareCapital.total_share) || 0;
        const total2 = Number(shareCapital2.total_share) || 0;
        setFieldValue('total_shares_bottom5', total1 + total2);
      }

      // Safely handle shareholders
      if (payload.shareholders && payload.shareholders.length > 0) {
        const founder = payload.shareholders[0];
        if (founder) {
          setFieldValue('founder_name_1', founder.name || '');
          setFieldValue('founder_name_chineese', founder.chineeseName || '');
          setFieldValue('founder_shares_1', founder.shareDetailsNoOfShares || '');
          setFieldValue('founder_share_type_1', shareCapital?.share_class ? `${shareCapital.share_class} shares` : '');
          setFieldValue('founder_share_capital_1', shareCapital?.amount_share || '');
        }

        // Only try to set second founder if exists
        if (payload.shareholders.length > 1) {
          const founders = payload.shareholders[1];
          if (founders) {
            setFieldValue('founder_name_2', founders.name || '');
            setFieldValue('founder_name_chineese2', founders.chineeseName || '');
            setFieldValue('founder_shares_2', founders.shareDetailsNoOfShares || '');
            setFieldValue('founder_share_type_2', shareCapital?.share_class ? `${shareCapital.share_class} shares` : '');
            setFieldValue('founder_share_capital_2', shareCapital?.amount_share || '');
          }
        }
      }

      // Log created fields for debugging
      const allFields = form.getFields();
      console.log('All fields created:', allFields.map(f => ({
        name: f.getName(),
        type: f.constructor.name
      })));
  
      // Generate and return PDF
      const pdfBytes = await pdfDoc.save();
      return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}