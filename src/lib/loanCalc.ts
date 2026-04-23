// Loan calculator math — 2 phương thức phổ biến tại VN cho vay mua BĐS:
//
// 1. "declining" (Dư nợ giảm dần): lãi tính trên dư nợ còn lại mỗi tháng.
//    Gốc cố định mỗi tháng = loan / months. Lãi giảm dần → tổng payment
//    cao tháng đầu, thấp dần. Phổ biến nhất ở VN.
//
// 2. "annuity" (Trả đều hàng tháng): tổng payment cố định mỗi tháng.
//    Tháng đầu phần lớn là lãi, cuối kỳ phần lớn là gốc. Châu Âu style.
//
// Inputs: loanAmount (số tiền vay), annualRatePct (%/năm), termMonths.
// Outputs: schedule đầy đủ (principal/interest/total mỗi tháng + remaining).

export type LoanMethod = 'declining' | 'annuity';

export type AmortizationRow = {
  month: number;          // 1..termMonths
  principalPaid: number;  // gốc trả tháng này
  interestPaid: number;   // lãi tháng này
  totalPaid: number;      // principal + interest
  remaining: number;      // dư nợ cuối tháng này
};

export type LoanResult = {
  loanAmount: number;
  termMonths: number;
  totalPaid: number;      // tổng gốc + lãi qua cả kỳ
  totalInterest: number;  // tổng lãi
  firstPayment: number;   // thanh toán tháng 1 (declining = cao nhất, annuity = cố định)
  lastPayment: number;    // thanh toán tháng cuối (declining = thấp nhất)
  monthlyPayment: number; // annuity only — fixed. Declining = firstPayment (approx)
  schedule: AmortizationRow[];
};

export function calculateLoan(
  loanAmount: number,
  annualRatePct: number,
  termMonths: number,
  method: LoanMethod = 'declining'
): LoanResult {
  if (loanAmount <= 0 || termMonths <= 0) {
    return {
      loanAmount,
      termMonths,
      totalPaid: 0,
      totalInterest: 0,
      firstPayment: 0,
      lastPayment: 0,
      monthlyPayment: 0,
      schedule: [],
    };
  }

  const monthlyRate = annualRatePct / 100 / 12;
  const schedule: AmortizationRow[] = [];

  if (method === 'annuity') {
    // Fixed monthly payment formula
    const fixed =
      monthlyRate === 0
        ? loanAmount / termMonths
        : loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1);

    let remaining = loanAmount;
    for (let m = 1; m <= termMonths; m++) {
      const interestPaid = remaining * monthlyRate;
      const principalPaid = fixed - interestPaid;
      remaining = Math.max(0, remaining - principalPaid);
      schedule.push({
        month: m,
        principalPaid,
        interestPaid,
        totalPaid: principalPaid + interestPaid,
        remaining,
      });
    }
    const totalPaid = fixed * termMonths;
    return {
      loanAmount,
      termMonths,
      totalPaid,
      totalInterest: totalPaid - loanAmount,
      firstPayment: fixed,
      lastPayment: fixed,
      monthlyPayment: fixed,
      schedule,
    };
  }

  // Declining balance
  const principalPerMonth = loanAmount / termMonths;
  let remaining = loanAmount;
  let totalPaid = 0;

  for (let m = 1; m <= termMonths; m++) {
    const interestPaid = remaining * monthlyRate;
    const principalPaid = principalPerMonth;
    const total = principalPaid + interestPaid;
    remaining = Math.max(0, remaining - principalPaid);
    totalPaid += total;
    schedule.push({
      month: m,
      principalPaid,
      interestPaid,
      totalPaid: total,
      remaining,
    });
  }

  return {
    loanAmount,
    termMonths,
    totalPaid,
    totalInterest: totalPaid - loanAmount,
    firstPayment: schedule[0].totalPaid,
    lastPayment: schedule[schedule.length - 1].totalPaid,
    monthlyPayment: schedule[0].totalPaid, // declining — report first as "peak"
    schedule,
  };
}
