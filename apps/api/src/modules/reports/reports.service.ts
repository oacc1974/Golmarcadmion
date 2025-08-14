import { Injectable } from '@nestjs/common';
import { ReceiptsService } from '../receipts/receipts.service';
import { ShiftsService } from '../shifts/shifts.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly receiptsService: ReceiptsService,
    private readonly shiftsService: ShiftsService,
  ) {}

  async getSalesSummary(storeId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get daily sales totals
    const dailySales = await this.receiptsService.getTotalsByDateRange(
      storeId,
      start,
      end,
    );
    
    // Get payment method breakdown
    const paymentMethodSales = await this.receiptsService.getTotalsByPaymentMethod(
      storeId,
      start,
      end,
    );
    
    // Calculate summary statistics
    let totalSales = 0;
    let totalReceipts = 0;
    
    if (dailySales && dailySales.length > 0) {
      for (const day of dailySales) {
        totalSales += Number(day.total_sales);
        totalReceipts += Number(day.receipt_count);
      }
    }
    
    const averageTicket = totalReceipts > 0 ? totalSales / totalReceipts : 0;
    
    return {
      summary: {
        total_sales: totalSales,
        total_receipts: totalReceipts,
        average_ticket: averageTicket,
        date_range: {
          start: startDate,
          end: endDate,
        },
      },
      daily_sales: dailySales,
      payment_methods: paymentMethodSales,
    };
  }

  async getShiftSummary(storeId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get shift data for the period
    const shifts = await this.shiftsService.getShiftSummary(
      storeId,
      start,
      end,
    );
    
    // Calculate summary statistics
    let totalCashSales = 0;
    let totalCardSales = 0;
    let totalOtherSales = 0;
    let totalCashDifference = 0;
    let shiftCount = 0;
    
    if (shifts && shifts.length > 0) {
      shiftCount = shifts.length;
      
      for (const shift of shifts) {
        totalCashSales += Number(shift.cash_sales || 0);
        totalCardSales += Number(shift.card_sales || 0);
        totalOtherSales += Number(shift.other_sales || 0);
        totalCashDifference += Number(shift.cash_difference || 0);
      }
    }
    
    const totalSales = totalCashSales + totalCardSales + totalOtherSales;
    
    return {
      summary: {
        shift_count: shiftCount,
        total_sales: totalSales,
        total_cash_sales: totalCashSales,
        total_card_sales: totalCardSales,
        total_other_sales: totalOtherSales,
        total_cash_difference: totalCashDifference,
        date_range: {
          start: startDate,
          end: endDate,
        },
      },
      shifts,
    };
  }

  async getDashboardSummary(storeId: string) {
    // Get today's date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Get today's sales
    const todaySales = await this.receiptsService.getTotalsByDateRange(
      storeId,
      startOfToday,
      endOfToday,
    );
    
    // Get yesterday's sales
    const yesterdaySales = await this.receiptsService.getTotalsByDateRange(
      storeId,
      startOfYesterday,
      endOfYesterday,
    );
    
    // Get current week's sales
    const weekSales = await this.receiptsService.getTotalsByDateRange(
      storeId,
      startOfWeek,
      endOfToday,
    );
    
    // Get current month's sales
    const monthSales = await this.receiptsService.getTotalsByDateRange(
      storeId,
      startOfMonth,
      endOfToday,
    );
    
    // Get today's shift data
    const todayShifts = await this.shiftsService.getShiftSummary(
      storeId,
      startOfToday,
      endOfToday,
    );
    
    // Calculate summary values
    const todayTotal = todaySales.length > 0 ? todaySales.reduce((sum, day) => sum + Number(day.total_sales), 0) : 0;
    const yesterdayTotal = yesterdaySales.length > 0 ? yesterdaySales.reduce((sum, day) => sum + Number(day.total_sales), 0) : 0;
    const weekTotal = weekSales.length > 0 ? weekSales.reduce((sum, day) => sum + Number(day.total_sales), 0) : 0;
    const monthTotal = monthSales.length > 0 ? monthSales.reduce((sum, day) => sum + Number(day.total_sales), 0) : 0;
    
    // Calculate day-over-day change
    const dayOverDayChange = yesterdayTotal > 0 
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    return {
      today: {
        date: startOfToday.toISOString().split('T')[0],
        total_sales: todayTotal,
        receipt_count: todaySales.length > 0 ? todaySales[0].receipt_count : 0,
        day_over_day_change: dayOverDayChange,
      },
      yesterday: {
        date: startOfYesterday.toISOString().split('T')[0],
        total_sales: yesterdayTotal,
      },
      current_week: {
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfToday.toISOString().split('T')[0],
        total_sales: weekTotal,
      },
      current_month: {
        start_date: startOfMonth.toISOString().split('T')[0],
        end_date: endOfToday.toISOString().split('T')[0],
        total_sales: monthTotal,
      },
      today_shifts: todayShifts,
    };
  }
}
