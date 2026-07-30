import React, { useState } from 'react';
import { PatientEHR, MedicalCondition, MedicationEntry, SurgicalProcedure, VaccinationEntry, AllergyEntry, FamilyHistoryEntry } from '../../types/patientEHR';
import { EHRCalculationsEngine } from '../../utils/ehrCalculations';
import {
  User, Activity, Heart, Shield, Plus, Trash2, Copy, Download, Upload, Save, CheckCircle2, AlertTriangle, Scale, Flame, Droplet, Stethoscope, Syringe, Pill, FileText, ChevronDown, ChevronRight, Target, Sparkles
} from 'lucide-react';

interface PatientProfilePageProps {
  currentProfile: PatientEHR;
  onUpdateProfile: (updated: PatientEHR) => void;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  currentProfile,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<PatientEHR>(currentProfile);
  const [activeSection, setActiveSection] = useState<string>('demographics');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Sync state changes upward to main app state
  const handleFieldChange = <K extends keyof PatientEHR>(section: K, value: PatientEHR[K]) => {
    const updated = { ...profile, [section]: value, updatedAt: new Date().toISOString() };
    const recalculated = {
      ...updated,
      calculatedMetrics: EHRCalculationsEngine.calculate(updated),
    };
    setProfile(recalculated);
    onUpdateProfile(recalculated);
  };

  const triggerSaveNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Profile Action handlers
  const handleCreateNew = () => {
    const fresh = EHRCalculationsEngine.createDefaultProfile(`Patient ${Date.now().toString().slice(-4)}`);
    setProfile(fresh);
    onUpdateProfile(fresh);
    triggerSaveNotification('Created new digital patient profile.');
  };

  const handleDuplicate = () => {
    const clone: PatientEHR = {
      ...profile,
      id: `patient_${Date.now()}`,
      patientName: `${profile.patientName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(clone);
    onUpdateProfile(clone);
    triggerSaveNotification('Duplicated patient profile.');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${profile.patientName.toLowerCase().replace(/\s+/g, '_')}_ehr.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSaveNotification('Exported patient EHR JSON.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as PatientEHR;
        if (imported.demographics && imported.anthropometrics) {
          const recalculated = {
            ...imported,
            calculatedMetrics: EHRCalculationsEngine.calculate(imported),
          };
          setProfile(recalculated);
          onUpdateProfile(recalculated);
          triggerSaveNotification('Imported EHR patient data successfully.');
        }
      } catch (err) {
        alert('Invalid Patient EHR JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const calc = profile.calculatedMetrics || EHRCalculationsEngine.calculate(profile);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full py-2 select-none">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: 16-DOMAIN EHR FORMS (8 COLS)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto pr-1 max-h-[85vh] scrollbar-thin">
        {/* Header Bar */}
        <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-500/10 border border-medical-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-medical-400" />
            </div>
            <div>
              <input
                type="text"
                value={profile.patientName}
                onChange={(e) => setProfile({ ...profile, patientName: e.target.value })}
                className="bg-transparent text-base font-extrabold text-slate-100 focus:outline-none border-b border-transparent focus:border-medical-500"
              />
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <span>ID: {profile.id}</span>
                <span>•</span>
                <span>Updated: {new Date(profile.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={handleCreateNew} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={handleDuplicate} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Clone
            </button>
            <button onClick={handleExportJson} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <label className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Import
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {saveNotification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveNotification}</span>
          </div>
        )}

        {/* Section 1: Demographics */}
        <div className="glass-panel p-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-400 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
            <User className="w-4 h-4" /> 1. Demographics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Age (Years)</label>
              <input
                type="number" min="1" max="120"
                value={profile.demographics.age}
                onChange={(e) => handleFieldChange('demographics', { ...profile.demographics, age: parseInt(e.target.value) || 30 })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Biological Sex</label>
              <select
                value={profile.demographics.sex}
                onChange={(e) => handleFieldChange('demographics', { ...profile.demographics, sex: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Blood Group</label>
              <select
                value={profile.demographics.bloodGroup || 'O+'}
                onChange={(e) => handleFieldChange('demographics', { ...profile.demographics, bloodGroup: e.target.value as any })}
                className="glass-input w-full"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Dominant Hand</label>
              <select
                value={profile.demographics.dominantHand}
                onChange={(e) => handleFieldChange('demographics', { ...profile.demographics, dominantHand: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="ambidextrous">Ambidextrous</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Anthropometrics */}
        <div className="glass-panel p-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-400 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Scale className="w-4 h-4" /> 2. Anthropometrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Height (cm)</label>
              <input
                type="number" min="50" max="250"
                value={profile.anthropometrics.heightCm}
                onChange={(e) => handleFieldChange('anthropometrics', { ...profile.anthropometrics, heightCm: parseFloat(e.target.value) || 170 })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Weight (kg)</label>
              <input
                type="number" min="20" max="300"
                value={profile.anthropometrics.weightKg}
                onChange={(e) => handleFieldChange('anthropometrics', { ...profile.anthropometrics, weightKg: parseFloat(e.target.value) || 70 })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Body Fat (%)</label>
              <input
                type="number" min="3" max="60"
                value={profile.anthropometrics.bodyFatPercentage || ''}
                onChange={(e) => handleFieldChange('anthropometrics', { ...profile.anthropometrics, bodyFatPercentage: parseFloat(e.target.value) || 20 })}
                className="glass-input w-full"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Waist (cm)</label>
              <input
                type="number"
                value={profile.anthropometrics.waistCircumferenceCm || ''}
                onChange={(e) => handleFieldChange('anthropometrics', { ...profile.anthropometrics, waistCircumferenceCm: parseFloat(e.target.value) || undefined })}
                className="glass-input w-full"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pregnancy & Lactation Status */}
        {profile.demographics.sex === 'female' && (
          <div className="glass-panel p-4 border-l-4 border-pink-500">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-pink-400 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
              <Heart className="w-4 h-4" /> 3. Pregnancy & Gestational Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.pregnancy.isPregnant}
                  onChange={(e) => handleFieldChange('pregnancy', { ...profile.pregnancy, isPregnant: e.target.checked })}
                  className="accent-pink-500 rounded"
                />
                <span className="font-semibold text-slate-300">Currently Pregnant</span>
              </label>

              {profile.pregnancy.isPregnant && (
                <>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Trimester</label>
                    <select
                      value={profile.pregnancy.trimester || 2}
                      onChange={(e) => handleFieldChange('pregnancy', { ...profile.pregnancy, trimester: parseInt(e.target.value) as any })}
                      className="glass-input w-full"
                    >
                      <option value={1}>1st Trimester</option>
                      <option value={2}>2nd Trimester</option>
                      <option value={3}>3rd Trimester</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Gestational Age (Weeks)</label>
                    <input
                      type="number" min="1" max="42"
                      value={profile.pregnancy.gestationalAgeWeeks || 20}
                      onChange={(e) => handleFieldChange('pregnancy', { ...profile.pregnancy, gestationalAgeWeeks: parseInt(e.target.value) || 20 })}
                      className="glass-input w-full"
                    />
                  </div>
                </>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.pregnancy.isLactating}
                  onChange={(e) => handleFieldChange('pregnancy', { ...profile.pregnancy, isLactating: e.target.checked })}
                  className="accent-pink-500 rounded"
                />
                <span className="font-semibold text-slate-300">Currently Lactating</span>
              </label>
            </div>
          </div>
        )}

        {/* Section 4: Lifestyle */}
        <div className="glass-panel p-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-400 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Activity className="w-4 h-4" /> 4. Lifestyle & Habitual Stressors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Smoking</label>
              <select
                value={profile.lifestyle.smoking}
                onChange={(e) => handleFieldChange('lifestyle', { ...profile.lifestyle, smoking: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="occasionally">Occasionally</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Alcohol</label>
              <select
                value={profile.lifestyle.alcohol}
                onChange={(e) => handleFieldChange('lifestyle', { ...profile.lifestyle, alcohol: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="never">Never</option>
                <option value="social">Social</option>
                <option value="weekly">Weekly</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Exercise Freq (Days/Wk)</label>
              <input
                type="number" min="0" max="7"
                value={profile.lifestyle.exerciseFrequencyDaysPerWeek}
                onChange={(e) => handleFieldChange('lifestyle', { ...profile.lifestyle, exerciseFrequencyDaysPerWeek: parseInt(e.target.value) || 0 })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Exercise Intensity</label>
              <select
                value={profile.lifestyle.exerciseIntensity}
                onChange={(e) => handleFieldChange('lifestyle', { ...profile.lifestyle, exerciseIntensity: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="vigorous">Vigorous</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Medical History (Structured Conditions) */}
        <div className="glass-panel p-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-400 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> 5. Medical History & Chronic Pathology
            </h3>
            <button
              onClick={() => {
                const newCond: MedicalCondition = {
                  id: `cond_${Date.now()}`,
                  name: 'New Condition',
                  category: 'cardiovascular',
                  severity: 'mild',
                  active: true,
                };
                handleFieldChange('medicalConditions', [...profile.medicalConditions, newCond]);
              }}
              className="px-2 py-1 rounded bg-medical-600/20 border border-medical-500/40 text-medical-300 text-[9px] font-bold uppercase flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Condition
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {profile.medicalConditions.map((cond, idx) => (
              <div key={cond.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs">
                <input
                  type="text"
                  value={cond.name}
                  onChange={(e) => {
                    const next = [...profile.medicalConditions];
                    next[idx].name = e.target.value;
                    handleFieldChange('medicalConditions', next);
                  }}
                  className="glass-input sm:col-span-2 font-bold text-amber-400"
                />
                <select
                  value={cond.category}
                  onChange={(e) => {
                    const next = [...profile.medicalConditions];
                    next[idx].category = e.target.value as any;
                    handleFieldChange('medicalConditions', next);
                  }}
                  className="glass-input"
                >
                  <option value="cardiovascular">Cardiovascular</option>
                  <option value="endocrine">Endocrine</option>
                  <option value="respiratory">Respiratory</option>
                  <option value="renal">Renal</option>
                  <option value="hepatic">Hepatic</option>
                  <option value="gastrointestinal">Gastrointestinal</option>
                  <option value="neurological">Neurological</option>
                  <option value="musculoskeletal">Musculoskeletal</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={cond.severity || 'mild'}
                  onChange={(e) => {
                    const next = [...profile.medicalConditions];
                    next[idx].severity = e.target.value as any;
                    handleFieldChange('medicalConditions', next);
                  }}
                  className="glass-input"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <input
                  type="text"
                  placeholder="Stage / Notes"
                  value={cond.notes || ''}
                  onChange={(e) => {
                    const next = [...profile.medicalConditions];
                    next[idx].notes = e.target.value;
                    handleFieldChange('medicalConditions', next);
                  }}
                  className="glass-input"
                />
                <button
                  onClick={() => {
                    const next = profile.medicalConditions.filter((_, i) => i !== idx);
                    handleFieldChange('medicalConditions', next);
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1 flex justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Pharmacotherapy (PK-Ready Medications) */}
        <div className="glass-panel p-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-400 flex items-center gap-2">
              <Pill className="w-4 h-4" /> 6. Active Pharmacotherapy (PK/PD Ready)
            </h3>
            <button
              onClick={() => {
                const newMed: MedicationEntry = {
                  id: `med_${Date.now()}`,
                  genericName: 'Metformin',
                  dose: 500,
                  unit: 'mg',
                  frequency: 'BD',
                  route: 'oral',
                  startedOn: new Date().toISOString().split('T')[0],
                  reason: 'Glycemic control',
                };
                handleFieldChange('medications', [...profile.medications, newMed]);
              }}
              className="px-2 py-1 rounded bg-medical-600/20 border border-medical-500/40 text-medical-300 text-[9px] font-bold uppercase flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Medication
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {profile.medications.map((med, idx) => (
              <div key={med.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 grid grid-cols-2 sm:grid-cols-7 gap-2 items-center text-xs">
                <input
                  type="text"
                  placeholder="Generic Name"
                  value={med.genericName}
                  onChange={(e) => {
                    const next = [...profile.medications];
                    next[idx].genericName = e.target.value;
                    handleFieldChange('medications', next);
                  }}
                  className="glass-input font-bold text-emerald-400"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={med.dose}
                    onChange={(e) => {
                      const next = [...profile.medications];
                      next[idx].dose = parseFloat(e.target.value) || 0;
                      handleFieldChange('medications', next);
                    }}
                    className="glass-input w-2/3"
                  />
                  <select
                    value={med.unit}
                    onChange={(e) => {
                      const next = [...profile.medications];
                      next[idx].unit = e.target.value as any;
                      handleFieldChange('medications', next);
                    }}
                    className="glass-input w-1/3"
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
                <select
                  value={med.frequency}
                  onChange={(e) => {
                    const next = [...profile.medications];
                    next[idx].frequency = e.target.value as any;
                    handleFieldChange('medications', next);
                  }}
                  className="glass-input"
                >
                  <option value="OD">OD (Once Daily)</option>
                  <option value="BD">BD (Twice Daily)</option>
                  <option value="TDS">TDS (3x Daily)</option>
                  <option value="QID">QID (4x Daily)</option>
                  <option value="PRN">PRN (As Needed)</option>
                </select>
                <select
                  value={med.route}
                  onChange={(e) => {
                    const next = [...profile.medications];
                    next[idx].route = e.target.value as any;
                    handleFieldChange('medications', next);
                  }}
                  className="glass-input"
                >
                  <option value="oral">Oral</option>
                  <option value="iv">IV</option>
                  <option value="im">IM</option>
                  <option value="subcutaneous">Subcutaneous</option>
                  <option value="inhaled">Inhaled</option>
                </select>
                <input
                  type="text"
                  placeholder="Indication / Reason"
                  value={med.reason}
                  onChange={(e) => {
                    const next = [...profile.medications];
                    next[idx].reason = e.target.value;
                    handleFieldChange('medications', next);
                  }}
                  className="glass-input sm:col-span-2"
                />
                <button
                  onClick={() => {
                    const next = profile.medications.filter((_, i) => i !== idx);
                    handleFieldChange('medications', next);
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1 flex justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Health Goals */}
        <div className="glass-panel p-4 border-l-4 border-amber-500">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Target className="w-4 h-4" /> 7. Primary Simulation Health Goals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Primary Objective</label>
              <select
                value={profile.healthGoals.primaryGoalType}
                onChange={(e) => handleFieldChange('healthGoals', { ...profile.healthGoals, primaryGoalType: e.target.value as any })}
                className="glass-input w-full font-bold text-amber-300"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Hypertrophy / Muscle Gain</option>
                <option value="bp_control">Blood Pressure Optimization</option>
                <option value="glucose_control">Glycemic Optimization</option>
                <option value="general_wellness">General Wellness</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Target Weight (kg)</label>
              <input
                type="number"
                value={profile.healthGoals.targetWeightKg || ''}
                onChange={(e) => handleFieldChange('healthGoals', { ...profile.healthGoals, targetWeightKg: parseFloat(e.target.value) || undefined })}
                className="glass-input w-full"
                placeholder="Target Weight"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Target Sys BP (mmHg)</label>
              <input
                type="number"
                value={profile.healthGoals.targetSystolicBp || 120}
                onChange={(e) => handleFieldChange('healthGoals', { ...profile.healthGoals, targetSystolicBp: parseInt(e.target.value) || 120 })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Target Glucose (mg/dL)</label>
              <input
                type="number"
                value={profile.healthGoals.targetBloodSugarMgDl || 90}
                onChange={(e) => handleFieldChange('healthGoals', { ...profile.healthGoals, targetBloodSugarMgDl: parseInt(e.target.value) || 90 })}
                className="glass-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: LIVE CLINICAL EHR SUMMARY CARD (4 COLS)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-4 glass-panel p-4 flex flex-col gap-4 overflow-y-auto max-h-[85vh] scrollbar-none border-l border-slate-900">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Live Patient EHR Summary
          </h3>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
            Simulation Ready
          </span>
        </div>

        {/* Calculated Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">BMI</span>
            <span className="text-base font-black text-cyan-400">{calc.bmi}</span>
            <span className="text-[8px] text-slate-400 block truncate">{calc.bmiCategory}</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Blood Volume</span>
            <span className="text-base font-black text-rose-400">{calc.bloodVolumeLiters} L</span>
            <span className="text-[8px] text-slate-400 block">Nadler + Expansion</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">BMR</span>
            <span className="text-base font-black text-amber-400">{calc.bmrKcal}</span>
            <span className="text-[8px] text-slate-400 block">kcal / day</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Estimated TDEE</span>
            <span className="text-base font-black text-emerald-400">{calc.tdeeKcal}</span>
            <span className="text-[8px] text-slate-400 block">kcal / day</span>
          </div>
        </div>

        {/* Extended Calculations */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5 text-[10px] text-slate-300">
          <div className="flex justify-between border-b border-slate-900/60 pb-1">
            <span className="text-slate-500">Body Surface Area (BSA):</span>
            <span className="font-mono font-bold text-slate-200">{calc.bodySurfaceAreaM2} m²</span>
          </div>
          <div className="flex justify-between border-b border-slate-900/60 pb-1">
            <span className="text-slate-500">Lean Body Mass (Boer):</span>
            <span className="font-mono font-bold text-slate-200">{calc.leanBodyMassKg} kg</span>
          </div>
          <div className="flex justify-between border-b border-slate-900/60 pb-1">
            <span className="text-slate-500">Estimated eGFR:</span>
            <span className="font-mono font-bold text-cyan-400">{calc.estimatedGfrMlMin} mL/min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Healthy Weight Range:</span>
            <span className="font-mono font-bold text-emerald-400">{calc.idealWeightRangeKg[0]} - {calc.idealWeightRangeKg[1]} kg</span>
          </div>
        </div>

        {/* Current Active Pathologies */}
        <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2">
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Active Medical Conditions</span>
          {profile.medicalConditions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {profile.medicalConditions.map(c => (
                <span key={c.id} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-semibold">
                  • {c.name} ({c.severity || 'mild'})
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic">No active chronic conditions</span>
          )}
        </div>

        {/* Current Active Medications */}
        <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2">
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Active Pharmacotherapy</span>
          {profile.medications.length > 0 ? (
            <div className="flex flex-col gap-1">
              {profile.medications.map(m => (
                <div key={m.id} className="bg-slate-950/80 px-2 py-1 rounded border border-slate-900 flex justify-between text-[9px]">
                  <span className="font-bold text-emerald-400">{m.genericName}</span>
                  <span className="text-slate-400 font-mono">{m.dose} {m.unit} {m.frequency}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic">No active medications</span>
          )}
        </div>
      </div>
    </div>
  );
};
