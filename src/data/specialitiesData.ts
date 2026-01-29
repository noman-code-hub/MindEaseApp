import { Speciality } from '../services/doctorService';

export const specialitiesData: Speciality[] = [
    {
        "speciality": "Cardiology",
        "super_specialities": [
            {
                "name": "Interventional Cardiology",
                "services": [
                    "Angioplasty",
                    "Stenting",
                    "Coronary Angiography",
                    "Peripheral Angioplasty"
                ]
            },
            {
                "name": "Electrophysiology",
                "services": [
                    "ECG",
                    "Holter Monitoring",
                    "Pacemaker Implantation",
                    "Ablation"
                ]
            },
            {
                "name": "Heart Failure Specialist",
                "services": [
                    "Heart Failure Consultation",
                    "Echocardiography",
                    "Cardiac Rehabilitation",
                    "Medication Management"
                ]
            },
            {
                "name": "Pediatric Cardiology",
                "services": [
                    "Pediatric Heart Checkup",
                    "Echo for Kids",
                    "Congenital Heart Disease Screening"
                ]
            }
        ]
    },
    {
        "speciality": "Dermatology",
        "super_specialities": [
            {
                "name": "Cosmetic Dermatology",
                "services": [
                    "Botox",
                    "Fillers",
                    "Laser Hair Removal",
                    "Skin Whitening"
                ]
            },
            {
                "name": "Dermatologic Surgery",
                "services": [
                    "Skin Biopsy",
                    "Mole Removal",
                    "Wart Removal"
                ]
            }
        ]
    },
    {
        "speciality": "ENT (Ear, Nose & Throat)",
        "super_specialities": [
            {
                "name": "Head & Neck Surgery",
                "services": [
                    "Thyroid Surgery",
                    "Neck Mass Removal",
                    "Cancer Surgery"
                ]
            },
            {
                "name": "Pediatric ENT",
                "services": [
                    "Tonsillectomy",
                    "Adenoid Surgery",
                    "Ear Infection Treatment"
                ]
            }
        ]
    },
    {
        "speciality": "Gastroenterology",
        "super_specialities": [
            {
                "name": "Hepatology",
                "services": [
                    "Liver Disease Consultation",
                    "Hepatitis Screening",
                    "Liver Fibrosis Test"
                ]
            },
            {
                "name": "Endoscopy",
                "services": [
                    "Gastroscopy",
                    "Colonoscopy",
                    "ERCP"
                ]
            }
        ]
    },
    {
        "speciality": "Gynecology / Obstetrics",
        "super_specialities": [
            {
                "name": "Infertility / IVF",
                "services": [
                    "IVF Consultation",
                    "IUI",
                    "Fertility Testing",
                    "Ovulation Monitoring"
                ]
            },
            {
                "name": "High Risk Pregnancy",
                "services": [
                    "High Risk Pregnancy Consultation",
                    "Fetal Monitoring",
                    "Ultrasound Scan"
                ]
            }
        ]
    },
    {
        "speciality": "Neurology",
        "super_specialities": [
            {
                "name": "Stroke Specialist",
                "services": [
                    "Stroke Consultation",
                    "CT/MRI Review",
                    "Rehabilitation Planning"
                ]
            },
            {
                "name": "Epilepsy Specialist",
                "services": [
                    "Seizure Evaluation",
                    "EEG Test",
                    "Medication Management"
                ]
            }
        ]
    },
    {
        "speciality": "Oncology",
        "super_specialities": [
            {
                "name": "Medical Oncology",
                "services": [
                    "Chemotherapy",
                    "Cancer Consultation",
                    "Treatment Planning"
                ]
            },
            {
                "name": "Radiation Oncology",
                "services": [
                    "Radiation Therapy",
                    "Treatment Planning",
                    "Follow-up Consultation"
                ]
            }
        ]
    },
    {
        "speciality": "Orthopedics",
        "super_specialities": [
            {
                "name": "Joint Replacement",
                "services": [
                    "Knee Replacement",
                    "Hip Replacement",
                    "Joint Pain Consultation"
                ]
            },
            {
                "name": "Spine Surgery",
                "services": [
                    "Spine Consultation",
                    "Disc Surgery",
                    "Back Pain Management"
                ]
            }
        ]
    },
    {
        "speciality": "Pediatrics",
        "super_specialities": [
            {
                "name": "Neonatology",
                "services": [
                    "Newborn Checkup",
                    "NICU Consultation",
                    "Premature Baby Care"
                ]
            },
            {
                "name": "Pediatric Cardiology",
                "services": [
                    "Child Heart Checkup",
                    "Echo for Kids",
                    "Congenital Heart Screening"
                ]
            }
        ]
    },
    {
        "speciality": "Urology",
        "super_specialities": [
            {
                "name": "Uro-Oncology",
                "services": [
                    "Prostate Cancer Consultation",
                    "Bladder Cancer Treatment",
                    "Kidney Cancer Treatment"
                ]
            },
            {
                "name": "Male Infertility",
                "services": [
                    "Semen Analysis",
                    "Infertility Consultation",
                    "Varicocele Treatment"
                ]
            }
        ]
    }
];
