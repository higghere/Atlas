# Medical Document Intelligence Engine — Architecture Plan

## Overview
Implement an end-to-end Medical Document Intelligence Pipeline in Human Atlas. Users can upload any medical document (PDF, images, lab reports, discharge summaries, prescriptions, ECG, CT/MRI DICOM text reports, handwritten notes), which are parsed, classified, normalized, validated, and integrated into the Patient Digital Twin, timeline, and 3D Anatomy/Physiology simulation engine.

---

## 1. Directory Structure & New Modules

```
src/
 ├── types/
 │    ├── medicalDocument.ts         # Document metadata, OCR results, confidence, extraction schemas
 │    └── patientEHR.ts               # Existing EHR schema extended with document references
 │
 ├── engine/
 │     documentIntelligence/
 │          OCREngine.ts              # OCR text & table extractor with structural layout preservation
 │          DocumentClassifier.ts     # Document type detector (Lab, Imaging, Clinical, Cardiology)
 │          MedicalEntityExtractor.ts # NER parser for Demographics, Diagnoses, Vitals, Labs, Meds
 │          UnitNormalizer.ts         # Lab unit converter (mg/dL <-> mmol/L, g/L, etc.) & reference ranges
 │          AnatomicalMapper.ts       # Maps lab anomalies & diagnoses to affected organs & simulation parameters
 │          DocumentPipeline.ts       # Master orchestrator chaining upload -> OCR -> NER -> Digital Twin
 │
 ├── components/
 │      MedicalRecords/
 │           MedicalRecordsWorkspace.tsx # Full-featured document hub & batch uploader
 │           DocumentUploader.tsx        # Drag-and-drop & folder upload interface
 │           DocumentViewer.tsx         # Document viewer with highlighted extracted text & confidence
 │           ExtractionValidationCard.tsx# Interactive verification & manual edit card
 │           TimelineProgressionView.tsx # Chronological progression viewer for lab trends & organ health
 │
 └── utils/
      ehrCalculations.ts             # Updated to absorb extracted medical entities seamlessly
```

---

## 2. Technical Features & Implementation Details

### A. Document Processing Pipeline (`DocumentPipeline.ts`)
1. **Multi-File Upload & Ingestion**: Drag & drop support for single/batch files or entire folders. Supports PDF, PNG, JPG, TIFF, DICOM text reports, DOCX, TXT.
2. **Robust OCR Engine (`OCREngine.ts`)**: Simulates deep OCR/vision extraction that parses document paragraphs, tabular lab grids (Test Name | Result | Unit | Reference Range), headers, dates, doctor/hospital metadata.
3. **Document Classifier (`DocumentClassifier.ts`)**: Identifies 4 main categories & sub-types:
   - **Laboratory Report** (CBC, KFT, LFT, Lipid Panel, HbA1c, Urinalysis, Hormones)
   - **Clinical Document** (Discharge Summary, Operative Report, Prescription, Referral)
   - **Imaging Report** (X-Ray, CT, MRI, Ultrasound, Echo)
   - **Cardiology** (ECG, Holter, Angiography)
4. **Medical Entity Extractor (`MedicalEntityExtractor.ts`)**: Extracts structured entities:
   - **Demographics**: Name, Age, Sex, Height, Weight, Blood Group
   - **Diagnoses**: Disease name, Category, Stage, Severity, Diagnosis Date
   - **Laboratory Tests**: Test ID, Standardized Name, Raw Value, Unit, Normalized Value, Normalized Unit, Ref Low, Ref High, Status (`low`, `normal`, `high`, `critical`)
   - **Medications**: Generic Name, Brand Name, Dose, Unit, Frequency, Route, Reason
5. **Unit Normalizer & Clinical Classifier (`UnitNormalizer.ts`)**: Normalizes units (e.g. Creatinine mg/dL to µmol/L, Glucose mg/dL to mmol/L) and evaluates flags (`CRITICAL_HIGH`, `HIGH`, `NORMAL`, `LOW`).

### B. Anatomical & Simulation Mapping (`AnatomicalMapper.ts`)
Maps extracted data to the 3D body viewer and physiology simulation parameters:
- **Creatinine > 1.5 mg/dL or eGFR < 60**: Highlights Left/Right Kidneys in amber/red, reduces renal perfusion, updates CKD stage in simulation.
- **ALT/AST > 50 U/L or Bilirubin > 1.2 mg/dL**: Highlights Liver in orange, increases hepatic inflammation score.
- **Hemoglobin < 11.0 g/dL**: Highlights Heart & Circulatory system, reduces blood oxygen carrying capacity in telemetry.
- **HbA1c > 7.0% or Fasting Glucose > 126 mg/dL**: Highlights Pancreas & Vascular system, triggers Type 2 Diabetes simulation coefficients.
- **Hypertension & Coronary Artery Disease**: Highlights Heart ventricles and coronary arteries, updates systemic vascular resistance and blood pressure simulation.

### C. Dedicated UI Component (`MedicalRecordsWorkspace.tsx`)
- Integrated as a tab/modal within **Patient Profile** and top **Laboratory / Medical Records** workflow.
- Features:
  - **Dropzone & Upload History**: Tracks upload date, hospital, confidence score, and parsing status.
  - **Verification & Approval Drawer**: Allows users to inspect extracted values alongside source text, edit any misread values, and approve changes before merging into the Patient Digital Twin.
  - **Timeline Progression Graph**: Plots multi-date laboratory trends (e.g. HbA1c progression over Jan 2025, Mar 2025, Jun 2025).

---

## 3. Implementation Workflow

1. Create `src/types/medicalDocument.ts` schema.
2. Build core extraction & normalization engine in `src/engine/documentIntelligence/`.
3. Create UI components in `src/components/MedicalRecords/`.
4. Connect `AnatomicalMapper.ts` to `AnatomyViewer.tsx` and `patientEHR.ts`.
5. Integrate into `App.tsx` and `Navbar.tsx` so users can access Medical Records Panel or launch document ingestion from Patient Profile.
6. Verify build via `npm run build`.
