import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

@Injectable({
  providedIn: 'root'
})
export class PdfAoAService {
  constructor() { }

  async fillPdf(payload: any): Promise<string> {
    try {
      const existingPdfBytes = await fetch('/assets/documents/AA_Sample_A.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
  
      const form = pdfDoc.getForm();
      const firstPage = pdfDoc.getPage(0);
      const secondPage = pdfDoc.getPage(1);
      const thirdPage = pdfDoc.getPage(2); 

      const { width: width2, height: height2 } = secondPage.getSize();
      const { width: width3, height: height3 } = thirdPage.getSize();
      const createFormField = (name: string, x: number, y: number, width: number, height: number, page = secondPage) => {
        try {
          const field = form.createTextField(name);
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

      const fields = {
        englishName: createFormField('english_company_name', 100, height2 - 225, 400, 30),
        englishName2: createFormField('english_company_name2', 100, height2 - 370, 400, 30),
        chineseName: createFormField('chinese_company_name', 100, height2 - 255, 400, 30),
        chineseName2: createFormField('chinese_company_name2', 100, height2 - 400, 400, 30),
        totalShares: createFormField('total_shares', 370, height2 - 605, 150, 25),
        totalShareCapital: createFormField('amount_share', 370, height2 - 640, 150, 25),
        paidUpCapital: createFormField('paid_up_capital', 370, height2 - 680, 150, 25),
        unpaidCapital: createFormField('unpaid_capital', 370, height2 - 715, 150, 25),
      };

      const thirdPageFields = {
        classOfShares: createFormField('class_of_shares', 370, height3 - 80, 150, 25, thirdPage),
        totalSharesInClass: createFormField('total_shares_in_class', 370, height3 - 120, 150, 25, thirdPage),
        totalShareCapitalInClass: createFormField('total_share_capital', 370, height3 - 155, 150, 25, thirdPage),
        paidUpAmount: createFormField('paid_up_amount', 370, height3 - 190, 150, 25, thirdPage),
        unpaidAmount: createFormField('unpaid_amount', 370, height3 - 227, 150, 25, thirdPage),
        founderName1: createFormField('founder_name_1', 138, height3 - 425, 200, 25, thirdPage),
        founderName2: createFormField('founder_name_chineese', 138, height3 - 450, 200, 25, thirdPage),
        founderShares1: createFormField('founder_shares_1', 370, height3 - 425, 150, 25, thirdPage),
        founderShareType1: createFormField('founder_share_type_1', 370, height3 - 445, 150, 25, thirdPage),
        founderShareCapital1: createFormField('founder_share_capital_1', 370, height3 - 465, 150, 25, thirdPage),
        totalSharesBottom: createFormField('total_shares_bottom', 370, height3 - 570, 150, 25, thirdPage),
        totalSharesBottom1: createFormField('total_shares_bottom1', 370, height3 - 590, 150, 25, thirdPage),
        totalShareCapitalBottom: createFormField('total_share_capital_bottom', 370, height3 - 610, 150, 25, thirdPage),
      };

      const setFieldValue = (fieldName: string, value: any) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            const fieldValue = value != null ? value.toString() : '';
            field.setText(fieldValue);
            console.log(`Successfully set ${fieldName} to:`, fieldValue);
          }
        } catch (error) {
          console.warn(`Error setting field ${fieldName}:`, error);
        }
      };

      const companyInfo = payload.companyInfo?.[0];
      if (companyInfo) {
        setFieldValue('english_company_name', companyInfo.business_name);
        setFieldValue('english_company_name2', companyInfo.business_name);
        setFieldValue('chinese_company_name', companyInfo.business_name_chinese);
        setFieldValue('chinese_company_name2', companyInfo.business_name_chinese);
      }
  
      const shareCapital = payload.shareCapital?.[0];
      if (shareCapital) {
        setFieldValue('total_shares', shareCapital.total_share);
        setFieldValue('amount_share', shareCapital.total_capital_subscribed);
        setFieldValue('paid_up_capital', shareCapital.amount_share);
        setFieldValue('unpaid_capital', shareCapital.unpaid_amount);
        setFieldValue('class_of_shares', shareCapital.share_class);    
        setFieldValue('total_shares_in_class', shareCapital.total_share);
        setFieldValue('total_share_capital', shareCapital.total_capital_subscribed);
        setFieldValue('paid_up_amount', shareCapital.amount_share);
        setFieldValue('unpaid_amount', shareCapital.unpaid_amount);
        setFieldValue('total_shares_bottom', shareCapital.total_share);
        setFieldValue('total_shares_bottom1', `${shareCapital?.share_class} shares`);
        setFieldValue('total_share_capital_bottom', shareCapital.amount_share);
      }

      if (payload.shareholders && payload.shareholders.length > 0) {
        const founder = payload.shareholders[0];
        setFieldValue('founder_name_1', founder.name);
        setFieldValue('founder_name_chineese', founder.chineeseName);
        setFieldValue('founder_shares_1', founder.shareDetailsNoOfShares);
        setFieldValue('founder_share_type_1', `${shareCapital?.share_class} shares`);
        setFieldValue('founder_share_capital_1', shareCapital?.amount_share);
      }
      const allFields = form.getFields();
      console.log('Created fields:', allFields.map(f => ({
        name: f.getName(),
        type: f.constructor.name
      })));
  
      const pdfBytes = await pdfDoc.save();
      return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}