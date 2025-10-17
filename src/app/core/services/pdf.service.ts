import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { cmyk } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() { }

  async fillPdf(payload: any): Promise<string> {
    try {
      const existingPdfBytes = await fetch('/assets/documents/NNC1_fillable.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const regularFontBytes = await fetch('/assets/fonts/4c285fdca692ea22-s.p.woff2').then(res => res.arrayBuffer());
      const regularFont = await pdfDoc.embedFont(regularFontBytes);
      const form = pdfDoc.getForm();
      const setFieldValue = (fieldName: string, value: any) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            const fieldValue = value != null ? value.toString() : '';
            field.setText(fieldValue);
            (field as any).setFontSize(12);
            (field as any).setFont(regularFont);
            (field as any).setTextColor(cmyk(0, 0, 0, 1));
            field.setAlignment(1);

          } else {
            console.warn(`Field not found: ${fieldName}`);
          }
        } catch (error) {
          //console.warn(`Error setting field ${fieldName}:`, error);
        }
      };


      const setCheckboxValue = (fieldName: string, isChecked: boolean) => {
        try {
          const field = form.getCheckBox(fieldName);
          if (field) {
            if (isChecked) {
              field.check();
              if (!field.isChecked()) {
                field.check();
              }
            } else {
              field.uncheck();
              if (field.isChecked()) {
                field.uncheck();
                console.log(`Retry unchecking: ${fieldName}`);
              }
            }
          } else {
            //throw new Error(`Checkbox field not found: ${fieldName}`);
          }
        } catch (error) {
          //console.error(`Error setting checkbox ${fieldName}:`, error);
          throw error;
        }
      };

      const companyInfo = payload.companyInfo && payload.companyInfo.length > 0 ? payload.companyInfo[0] : null;
      const shareholders = payload.companyInfo && payload.companyInfo.length > 0 ? payload.shareholders[0] : null;
      const shareholders2 = payload.companyInfo && payload.companyInfo.length > 0 ? payload.shareholders[1] : null;
      const shareCapital = payload.companyInfo && payload.companyInfo.length > 0 ? payload.shareCapital[0] : null;
      const shareCapital2 = payload.companyInfo && payload.companyInfo.length > 0 ? payload.shareCapital[1] : null;
      const secretary = payload.companyInfo && payload.companyInfo.length > 0 ? payload.secretary[0] : null;
      const secretary2 = payload.companyInfo && payload.companyInfo.length > 0 ? payload.secretary[1] : null;
      const director = payload.companyInfo && payload.companyInfo.length > 0 ? payload.directors[0] : null;
      const director2 = payload.companyInfo && payload.companyInfo.length > 0 ? payload.directors[1] : null;
      console.log("shareholders0", shareholders);


      if (companyInfo) {
        try {
          setFieldValue('fill_1_P.1', companyInfo.business_name);
          setFieldValue('fill_1_P.14', companyInfo.business_name);
          setFieldValue('fill_2_P.1', companyInfo.business_name_chinese);
          setFieldValue('fill_4_P.1', companyInfo.natureOfBusiness);
          setFieldValue('fill_3_P.1', companyInfo.natureOfBusiness_code?.toString().padStart(3, '0'));
          setFieldValue('fill_5_P.1', companyInfo.office_address);
          setFieldValue('fill_6_P.1', companyInfo.office_address1);
          setFieldValue('fill_8_P.1', companyInfo.office_state);
          setFieldValue('fill_7_P.1', companyInfo.office_city);
          setFieldValue('fill_9_P.1', companyInfo.presentorChiName);
          setFieldValue('fill_10_P.1', companyInfo.presentorName);
          setFieldValue('fill_11_P.1', companyInfo.presentorAddress);
          setFieldValue('fill_12_P.1', companyInfo.presentorTel);
          setFieldValue('fill_13_P.1', companyInfo.presentorFax);
          setFieldValue('fill_14_P.1', companyInfo.presentorEmail);
          setFieldValue('fill_15_P.1', companyInfo.reference_no);
          setFieldValue('fill_1_P.2', companyInfo.email_id);
          setFieldValue('fill_2_P.2', companyInfo.mobile_number);
          setCheckboxValue("cb_1_P.1", false);
          setCheckboxValue("cb_2_P.1", false);
          setCheckboxValue("cb_1_P.14", true);
          switch (companyInfo.type_of_business?.toLowerCase()) {
            case "private":
              setCheckboxValue("cb_1_P.1", true);
              break;
            case "public":
              setCheckboxValue("cb_2_P.1", true);
              break;
            default:
              console.warn(`Unknown company type: ${companyInfo.companyType}`);
          }
        }
        catch {
          console.warn('Company info is missing in payload.');
        }
      }


      if (shareholders) {
        try {
          setFieldValue('fill_3_P.2', shareholders.shareDetailsClassOfShares);
          setFieldValue('fill_4_P.2', shareholders.shareDetailsNoOfShares);
          setFieldValue('fill_5_P.2', 'HKD');
          setFieldValue('fill_24_P.2', shareholders.shareDetailsClassOfShares);
          setFieldValue('fill_2_P.9', shareholders.surname);
          setFieldValue('fill_1_P.9', shareholders.chineeseName);
          setFieldValue('fill_4_P.9', shareholders.name);
          setFieldValue('fill_12_P.9', 'HKD');
          setFieldValue('fill_5_P.9', shareholders.address);
          setFieldValue('fill_6_P.9', shareholders.building);
          setFieldValue('fill_7_P.9', shareholders.street);
          setFieldValue('fill_8_P.9', shareholders.district);
          setFieldValue('fill_9_P.9', 'Hong Kong');
          setFieldValue('fill_10_P.9', shareholders.shareDetailsClassOfShares);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (shareholders2) {
        try {
          setFieldValue('fill_1_P.3', shareholders2.chineeseName);
          setFieldValue('fill_2_P.3', shareholders2.surname);
          setFieldValue('fill_4_P.3', shareholders2.name);
          setFieldValue('fill__P.9', 'date');
          setFieldValue('fill_25_P.3', 'HKD');
          setFieldValue('fill_5_P.3', shareholders2.address);
          setFieldValue('fill_6_P.3', shareholders2.building);
          setFieldValue('fill_7_P.3', shareholders2.street);
          setFieldValue('fill_8_P.3', shareholders2.district);
          setFieldValue('fill_9_P.3', " Hong Kong");
          setFieldValue('fill_10_P.3', shareholders2.shareDetailsClassOfShares);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (shareCapital) {
        try {
          setFieldValue('fill_6_P.2', shareCapital.total_capital_subscribed);
          setFieldValue('fill_7_P.2', shareCapital.amount_share);
          setFieldValue('fill_8_P.2', shareCapital.unpaid_amount);
          setFieldValue('fill_25_P.2', shareCapital.share_right);
          setFieldValue('fill_11_P.9', shareCapital.total_share);
          setFieldValue('fill_12_P.9', 'HKD');
          setFieldValue('fill_12_P.3', 'HKD');
          setFieldValue('fill_13_P.9', shareCapital.amount_share);
          setFieldValue('fill_16_P.3', 'HKD');
          setFieldValue('fill_13_P.9', shareCapital2?.amount_share);
          setFieldValue('fill_15_P.3', shareholders2?.total_share);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (shareCapital2) {
        try {
          setFieldValue('fill_11_P.3', shareCapital?.total_share);
          setFieldValue('fill_15_P.3', shareCapital2?.total_share);
          setFieldValue('fill_17_P.3', shareCapital2?.amount_share);
          setFieldValue('fill_14_P.3', shareCapital2?.share_class);
          setFieldValue('fill_12_P.3', 'HKD');
          setFieldValue('fill_13_P.3', shareCapital2.amount_share);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (secretary) {
        try {
          const dateObj = new Date(secretary.updatedAt);
          const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
          setFieldValue('fill_1_P.4', secretary.chineeseName);
          setFieldValue('fill_2_P.4', secretary.surname);
          setFieldValue('fill_3_P.4', secretary.name);
          setFieldValue('fill_8_P.4', secretary.address);
          setFieldValue('fill_9_P.4', secretary.building);
          setFieldValue('fill_10_P.4', secretary.street);
          setFieldValue('fill_11_P.4', secretary.district);
          setFieldValue('fill_12_P.4', secretary.email);
          setFieldValue('fill_14_P.4', "HONG KONG");
          setFieldValue('fill_16_P.4', secretary.tcspLicenseNo);
          setFieldValue('fill_17_P.4', secretary.tcspReason);
          setFieldValue('fill_1_P.10', secretary.chineeseName);
          setFieldValue('fill_2_P.10', secretary.surname);
          setFieldValue('fill_3_P.10', secretary.name);
          setFieldValue('fill_8_P.10', secretary.address);
          setFieldValue('fill_9_P.10', secretary.building);
          setFieldValue('fill_10_P.10', secretary.street);
          setFieldValue('fill_11_P.10', secretary.district);
          setFieldValue('fill_12_P.10', secretary.email);
          setFieldValue('fill_17_P.10', secretary.tcspReason);
          setFieldValue('fill_16_P.10', secretary.tcspLicenseNo);
          setFieldValue('fill_14_P.10', 'Hong Kong');
          setFieldValue('fill_1_P.11', secretary.chineeseName);
          setFieldValue('fill_2_P.11', secretary.name);
          setFieldValue('fill_4_P.14', secretary.name);
          setFieldValue('fill_2_P.14', secretary.chineeseName);
          setFieldValue('fill_6_P.14', 'Hong Kong');
          setFieldValue('fill_7_P.8', secretary.name);
          setFieldValue('fill_8_P.8', formattedDate);
          setFieldValue('fill_3_P.14', secretary.surname);
          setFieldValue('fill_8_P.14', secretary.phone);
          setFieldValue('fill_9_P.14', secretary.address);
          setFieldValue('fill_10_P.14', secretary.building);
          setFieldValue('fill_11_P.14', secretary.street);
          setFieldValue('fill_12_P.14', secretary.district);
          setFieldValue('fill_13_P.14', ' Hong Kong');
          setFieldValue('fill_5_P.14', ' Hong Kong');
          setFieldValue('fill_3_P.11', secretary.address);
          setFieldValue('fill_4_P.11', secretary.building);
          setFieldValue('fill_5_P.11', secretary.street);
          setFieldValue('fill_6_P.11', secretary.district);
          setFieldValue('fill_7_P.11', secretary.email);
          setFieldValue('fill_9_P.11', secretary.tcspLicenseNo);
          setFieldValue('fill_10_P.11', secretary.tcspReason);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (secretary2) {
        try {
          setFieldValue('fill_1_P.5', secretary2.chineeseName);
          setFieldValue('fill_2_P.5', secretary2.name);
          setFieldValue('fill_3_P.5', secretary2.address);
          setFieldValue('fill_4_P.5', secretary2.building);
          setFieldValue('fill_5_P.5', secretary2.street);
          setFieldValue('fill_6_P.5', secretary2.district);
          setFieldValue('fill_7_P.5', secretary2.email);
          setFieldValue('fill_9_P.5', secretary2.tcspLicenseNo);
          setFieldValue('fill_10_P.5', secretary2.tcspReason);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }

      if (director) {
        try {
          setFieldValue('fill_1_P.6', director.chineeseName);
          setFieldValue('fill_2_P.6', director.surname);
          setFieldValue('fill_3_P.6', director.name);
          setFieldValue('fill_8_P.6', director.address);
          setFieldValue('fill_9_P.6', director.building);
          setFieldValue('fill_10_P.6', director.street);
          setFieldValue('fill_11_P.6', director.district);
          setFieldValue('fill_12_P.6', 'Hong Kong');
          setFieldValue('fill_15_P.6', 'Hong Kong');
          setFieldValue('fill_13_P.6', director.email);
          setFieldValue('fill_1_P.12', director.chineeseName);
          setFieldValue('fill_2_P.12', director.surname);
          setFieldValue('fill_3_P.12', director.name);
          setFieldValue('fill_8_P.12', director.address);
          setFieldValue('fill_9_P.12', director.building);
          setFieldValue('fill_10_P.12', director.street);
          setFieldValue('fill_11_P.12', director.district);
          setFieldValue('fill_12_P.12', ' Hong Kong');
          setFieldValue('fill_15_P.12', ' Hong Kong');
          setFieldValue('fill_7_P.13', 'Hong Kong');
          setFieldValue('fill_13_P.12', director.email);
          setFieldValue('fill_1_P.13', director.chineeseName);
          setFieldValue('fill_10_P.13', director.name);
          setFieldValue('fill_2_P.13', director.name);
          setFieldValue('fill_3_P.13', director.address);
          setFieldValue('fill_4_P.13', director.building);
          setFieldValue('fill_5_P.13', director.street);
          setFieldValue('fill_6_P.13', director.district);
          setFieldValue('fill_8_P.13', director.email);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }
      if (director2) {
        try {
          setFieldValue('fill_1_P.7', director2.chineeseName);
          setFieldValue('fill_2_P.7', director2.name);
          setFieldValue('fill_10_P.7', director.name);
          setFieldValue('fill_3_P.7', director2.address);
          setFieldValue('fill_4_P.7', director2.building);
          setFieldValue('fill_5_P.7', director2.street);
          setFieldValue('fill_6_P.7', director2.district);
          setFieldValue('fill_7_P.7', 'Hong Kong');
          setFieldValue('fill_8_P.7', director2.email);
        }
        catch {
          console.warn(`Unknown company type: ${companyInfo.companyType}`);
        }
      }
      
      
      const pdfBytes = await pdfDoc.save();
      return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }



}