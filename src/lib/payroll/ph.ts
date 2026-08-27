// Philippine Government Contribution Calculations
// Based on 2024-2025 rates

export interface PayrollCalculation {
  basicPay: number;
  allowances: number;
  overtime: number;
  grossPay: number;
  sss: SSSContribution;
  philhealth: PhilHealthContribution;
  pagibig: PagIBIGContribution;
  tax: BIRTax;
  totalDeductions: number;
  netPay: number;
}

export interface SSSContribution {
  employeeShare: number;
  employerShare: number;
  total: number;
}

export interface PhilHealthContribution {
  employeeShare: number;
  employerShare: number;
  total: number;
}

export interface PagIBIGContribution {
  employeeShare: number;
  employerShare: number;
  total: number;
}

export interface BIRTax {
  monthlyTaxableIncome: number;
  taxDue: number;
  annualTaxDue: number;
  monthlyTax: number;
}

// ============================================
// SSS Contribution Table 2024-2025
// ============================================

const SSS_TABLE: { min: number; max: number; employee: number; employer: number }[] = [
  { min: 0, max: 3249, employee: 135.00, employer: 225.00 },
  { min: 3250, max: 3749, employee: 157.50, employer: 262.50 },
  { min: 3750, max: 4249, employee: 180.00, employer: 300.00 },
  { min: 4250, max: 4749, employee: 202.50, employer: 337.50 },
  { min: 4750, max: 5249, employee: 225.00, employer: 375.00 },
  { min: 5250, max: 5749, employee: 247.50, employer: 412.50 },
  { min: 5750, max: 6249, employee: 270.00, employer: 450.00 },
  { min: 6250, max: 6749, employee: 292.50, employer: 487.50 },
  { min: 6750, max: 7249, employee: 315.00, employer: 525.00 },
  { min: 7250, max: 7749, employee: 337.50, employer: 562.50 },
  { min: 7750, max: 8249, employee: 360.00, employer: 600.00 },
  { min: 8250, max: 8749, employee: 382.50, employer: 637.50 },
  { min: 8750, max: 9249, employee: 405.00, employer: 675.00 },
  { min: 9250, max: 9749, employee: 427.50, employer: 712.50 },
  { min: 9750, max: 10249, employee: 450.00, employer: 750.00 },
  { min: 10250, max: 10749, employee: 472.50, employer: 787.50 },
  { min: 10750, max: 11249, employee: 495.00, employer: 825.00 },
  { min: 11250, max: 11749, employee: 517.50, employer: 862.50 },
  { min: 11750, max: 12249, employee: 540.00, employer: 900.00 },
  { min: 12250, max: 12749, employee: 562.50, employer: 937.50 },
  { min: 12750, max: 13249, employee: 585.00, employer: 975.00 },
  { min: 13250, max: 13749, employee: 607.50, employer: 1012.50 },
  { min: 13750, max: 14249, employee: 630.00, employer: 1050.00 },
  { min: 14250, max: 14749, employee: 652.50, employer: 1087.50 },
  { min: 14750, max: 15249, employee: 675.00, employer: 1125.00 },
  { min: 15250, max: 15749, employee: 697.50, employer: 1162.50 },
  { min: 15750, max: 16249, employee: 720.00, employer: 1200.00 },
  { min: 16250, max: 16749, employee: 742.50, employer: 1237.50 },
  { min: 16750, max: 17249, employee: 765.00, employer: 1275.00 },
  { min: 17250, max: 17749, employee: 787.50, employer: 1312.50 },
  { min: 17750, max: 18249, employee: 810.00, employer: 1350.00 },
  { min: 18250, max: 18749, employee: 832.50, employer: 1387.50 },
  { min: 18750, max: 19249, employee: 855.00, employer: 1425.00 },
  { min: 19250, max: 19749, employee: 877.50, employer: 1462.50 },
  { min: 19750, max: 20249, employee: 900.00, employer: 1500.00 },
  { min: 20250, max: 20749, employee: 922.50, employer: 1537.50 },
  { min: 20750, max: 21249, employee: 945.00, employer: 1575.00 },
  { min: 21250, max: 21749, employee: 967.50, employer: 1612.50 },
  { min: 21750, max: 22249, employee: 990.00, employer: 1650.00 },
  { min: 22250, max: 22749, employee: 1012.50, employer: 1687.50 },
  { min: 22750, max: 23249, employee: 1035.00, employer: 1725.00 },
  { min: 23250, max: 23749, employee: 1057.50, employer: 1762.50 },
  { min: 23750, max: 24249, employee: 1080.00, employer: 1800.00 },
  { min: 24250, max: 24749, employee: 1102.50, employer: 1837.50 },
  { min: 24750, max: 25249, employee: 1125.00, employer: 1875.00 },
  { min: 25250, max: 25749, employee: 1147.50, employer: 1912.50 },
  { min: 27750, max: 28249, employee: 1215.00, employer: 2025.00 },
  { min: 28250, max: 28749, employee: 1237.50, employer: 2062.50 },
  { min: 28750, max: 29249, employee: 1260.00, employer: 2100.00 },
  { min: 29250, max: 29749, employee: 1282.50, employer: 2137.50 },
  { min: 29750, max: Infinity, employee: 1305.00, employer: 2175.00 },
];

export function calculateSSS(monthlySalary: number): SSSContribution {
  const bracket = SSS_TABLE.find(
    (b) => monthlySalary >= b.min && monthlySalary <= b.max
  );

  if (!bracket) {
    return { employeeShare: 0, employerShare: 0, total: 0 };
  }

  return {
    employeeShare: bracket.employee,
    employerShare: bracket.employer,
    total: bracket.employee + bracket.employer,
  };
}

// ============================================
// PhilHealth Contribution 2024-2025
// ============================================

export function calculatePhilHealth(monthlySalary: number): PhilHealthContribution {
  // 2024 rate: 5% of monthly salary, split 50/50
  // Floor: ₱10,000, Ceiling: ₱100,000
  const floor = 10000;
  const ceiling = 100000;
  const rate = 0.05;

  const applicableSalary = Math.min(Math.max(monthlySalary, floor), ceiling);
  const totalContribution = applicableSalary * rate;

  return {
    employeeShare: totalContribution / 2,
    employerShare: totalContribution / 2,
    total: totalContribution,
  };
}

// ============================================
// Pag-IBIG Contribution 2024-2025
// ============================================

export function calculatePagIBIG(monthlySalary: number): PagIBIGContribution {
  // Employee: 2% of monthly salary (max ₱2,400/year = ₱200/month)
  // Employer: 2% of monthly salary (max ₱2,400/year = ₱200/month)
  // For employees earning above ₱5,000, employer contribution is 2%
  const rate = 0.02;
  const maxMonthly = 200;

  const employeeShare = Math.min(monthlySalary * rate, maxMonthly);
  const employerShare = Math.min(monthlySalary * rate, maxMonthly);

  return {
    employeeShare,
    employerShare,
    total: employeeShare + employerShare,
  };
}

// ============================================
// BIR Withholding Tax (Monthly) 2024-2025
// ============================================

const BIR_TABLE: { min: number; max: number; base: number; rate: number; excess: number }[] = [
  { min: 0, max: 20832, base: 0, rate: 0, excess: 0 },
  { min: 20833, max: 33332, base: 0, rate: 0.20, excess: 20833 },
  { min: 33333, max: 66666, base: 2500, rate: 0.25, excess: 33333 },
  { min: 66667, max: 166666, base: 10833.33, rate: 0.30, excess: 66667 },
  { min: 166667, max: 666666, base: 40833.33, rate: 0.32, excess: 166667 },
  { min: 666667, max: Infinity, base: 200833.33, rate: 0.35, excess: 666667 },
];

export function calculateBIRTax(
  annualTaxableIncome: number
): BIRTax {
  const bracket = BIR_TABLE.find(
    (b) => annualTaxableIncome >= b.min && annualTaxableIncome <= b.max
  );

  if (!bracket) {
    return {
      monthlyTaxableIncome: 0,
      taxDue: 0,
      annualTaxDue: 0,
      monthlyTax: 0,
    };
  }

  const excess = annualTaxableIncome - bracket.excess;
  const annualTaxDue = bracket.base + excess * bracket.rate;
  const monthlyTax = annualTaxDue / 12;

  return {
    monthlyTaxableIncome: annualTaxableIncome / 12,
    taxDue: monthlyTax,
    annualTaxDue,
    monthlyTax,
  };
}

// ============================================
// Main Payroll Calculation
// ============================================

export function calculatePayroll(
  monthlySalary: number,
  allowances: number = 0,
  overtime: number = 0,
  daysWorked: number = 22,
  totalWorkingDays: number = 22
): PayrollCalculation {
  // Daily rate calculation
  const dailyRate = monthlySalary / totalWorkingDays;
  const hourlyRate = dailyRate / 8;

  // Basic pay based on days worked
  const basicPay = dailyRate * daysWorked;

  // Gross pay
  const grossPay = basicPay + allowances + overtime;

  // Government contributions (based on monthly salary, not actual pay)
  const sss = calculateSSS(monthlySalary);
  const philhealth = calculatePhilHealth(monthlySalary);
  const pagibig = calculatePagIBIG(monthlySalary);

  // Total statutory deductions (employee share only)
  const statutoryDeductions = sss.employeeShare + philhealth.employeeShare + pagibig.employeeShare;

  // Taxable income (gross - statutory deductions)
  const annualTaxableIncome = (grossPay - statutoryDeductions) * 12;

  // BIR Tax
  const tax = calculateBIRTax(annualTaxableIncome);

  // Total deductions
  const totalDeductions = statutoryDeductions + tax.monthlyTax;

  // Net pay
  const netPay = grossPay - totalDeductions;

  return {
    basicPay,
    allowances,
    overtime,
    grossPay,
    sss,
    philhealth,
    pagibig,
    tax,
    totalDeductions,
    netPay,
  };
}

// ============================================
// Utilities
// ============================================

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
