import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftDocument } from '../../models/shift.model';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { ReceiptsService } from '../receipts/receipts.service';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    private receiptsService: ReceiptsService,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const createdShift = new this.shiftModel(createShiftDto);
    return createdShift.save();
  }

  async findAll(query: QueryShiftDto): Promise<{ data: Shift[]; total: number }> {
    const { store_id, start_date, end_date, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (store_id) {
      filter.store_id = store_id;
    }
    
    if (start_date || end_date) {
      filter.closed_at = {};
      if (start_date) {
        filter.closed_at.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.closed_at.$lte = new Date(end_date);
      }
    }
    
    const [data, total] = await Promise.all([
      this.shiftModel
        .find(filter)
        .sort({ closed_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.shiftModel.countDocuments(filter).exec(),
    ]);
    
    return { data, total };
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftModel.findById(id).exec();
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async findByLoyverseId(loyverseId: string): Promise<Shift> {
    const shift = await this.shiftModel.findOne({ loyverse_id: loyverseId }).exec();
    if (!shift) {
      throw new NotFoundException(`Shift with Loyverse ID ${loyverseId} not found`);
    }
    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const updatedShift = await this.shiftModel
      .findByIdAndUpdate(id, updateShiftDto, { new: true })
      .exec();
    if (!updatedShift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return updatedShift;
  }

  async upsertByLoyverseId(loyverseId: string, shiftData: CreateShiftDto): Promise<Shift> {
    const existingShift = await this.shiftModel.findOne({ loyverse_id: loyverseId }).exec();
    
    if (existingShift) {
      return this.shiftModel
        .findOneAndUpdate({ loyverse_id: loyverseId }, shiftData, { new: true })
        .exec();
    } else {
      const newShift = new this.shiftModel(shiftData);
      return newShift.save();
    }
  }

  async remove(id: string): Promise<Shift> {
    const deletedShift = await this.shiftModel.findByIdAndDelete(id).exec();
    if (!deletedShift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return deletedShift;
  }

  async recalculateShiftTotals(id: string): Promise<Shift> {
    const shift = await this.findOne(id);
    
    // Get all receipts within the shift time window
    const receiptTotals = await this.receiptsService.getTotalsByPaymentMethod(
      shift.store_id,
      shift.opened_at,
      shift.closed_at
    );
    
    // Extract payment totals by method
    let cashSales = 0;
    let cardSales = 0;
    let otherSales = 0;
    
    if (receiptTotals && receiptTotals.length > 0) {
      const dayTotals = receiptTotals[0];
      if (dayTotals.methods) {
        for (const methodTotal of dayTotals.methods) {
          if (methodTotal.method === 'cash') {
            cashSales = methodTotal.amount;
          } else if (methodTotal.method === 'card') {
            cardSales = methodTotal.amount;
          } else {
            otherSales += methodTotal.amount;
          }
        }
      }
    }
    
    // Calculate expected cash
    const expectedCash = Number(shift.opening_cash) + cashSales;
    
    // Calculate cash difference
    const cashDifference = Number(shift.counted_cash) - expectedCash;
    
    // Update shift with calculated values
    return this.update(id, {
      cash_sales: cashSales,
      card_sales: cardSales,
      other_sales: otherSales,
      expected_cash: expectedCash,
      cash_difference: cashDifference
    });
  }

  async getShiftSummary(storeId: string, startDate: Date, endDate: Date): Promise<any> {
    return this.shiftModel.aggregate([
      {
        $match: {
          store_id: storeId,
          closed_at: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          _id: 1,
          store_id: 1,
          opened_at: 1,
          closed_at: 1,
          opening_cash: 1,
          counted_cash: 1,
          cash_sales: 1,
          card_sales: 1,
          other_sales: 1,
          expected_cash: 1,
          cash_difference: 1,
          notes: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$closed_at' } }
        }
      },
      { $sort: { closed_at: -1 } }
    ]).exec();
  }
}
