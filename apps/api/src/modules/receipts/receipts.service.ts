import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt, ReceiptDocument } from '../../models/receipt.model';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { QueryReceiptDto } from './dto/query-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
  ) {}

  async create(createReceiptDto: CreateReceiptDto): Promise<Receipt> {
    const createdReceipt = new this.receiptModel(createReceiptDto);
    return createdReceipt.save();
  }

  async findAll(query: QueryReceiptDto): Promise<{ data: Receipt[]; total: number }> {
    const { store_id, employee_id, start_date, end_date, status, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (store_id) {
      filter.store_id = store_id;
    }
    
    if (employee_id) {
      filter.employee_id = employee_id;
    }
    
    if (status) {
      filter.status = status;
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
      this.receiptModel
        .find(filter)
        .sort({ closed_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.receiptModel.countDocuments(filter).exec(),
    ]);
    
    return { data, total };
  }

  async findOne(id: string): Promise<Receipt> {
    const receipt = await this.receiptModel.findById(id).exec();
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async findByLoyverseId(loyverseId: string): Promise<Receipt> {
    const receipt = await this.receiptModel.findOne({ loyverse_id: loyverseId }).exec();
    if (!receipt) {
      throw new NotFoundException(`Receipt with Loyverse ID ${loyverseId} not found`);
    }
    return receipt;
  }

  async update(id: string, updateReceiptDto: UpdateReceiptDto): Promise<Receipt> {
    const updatedReceipt = await this.receiptModel
      .findByIdAndUpdate(id, updateReceiptDto, { new: true })
      .exec();
    if (!updatedReceipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return updatedReceipt;
  }

  async upsertByLoyverseId(loyverseId: string, receiptData: CreateReceiptDto): Promise<Receipt> {
    const existingReceipt = await this.receiptModel.findOne({ loyverse_id: loyverseId }).exec();
    
    if (existingReceipt) {
      return this.receiptModel
        .findOneAndUpdate({ loyverse_id: loyverseId }, receiptData, { new: true })
        .exec();
    } else {
      const newReceipt = new this.receiptModel(receiptData);
      return newReceipt.save();
    }
  }

  async remove(id: string): Promise<Receipt> {
    const deletedReceipt = await this.receiptModel.findByIdAndDelete(id).exec();
    if (!deletedReceipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return deletedReceipt;
  }

  async getTotalsByDateRange(storeId: string, startDate: Date, endDate: Date): Promise<any> {
    return this.receiptModel.aggregate([
      {
        $match: {
          store_id: storeId,
          closed_at: { $gte: startDate, $lte: endDate },
          status: 'closed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$closed_at' } },
          total_sales: { $sum: '$total' },
          receipt_count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }

  async getTotalsByPaymentMethod(storeId: string, startDate: Date, endDate: Date): Promise<any> {
    return this.receiptModel.aggregate([
      {
        $match: {
          store_id: storeId,
          closed_at: { $gte: startDate, $lte: endDate },
          status: 'closed'
        }
      },
      { $unwind: '$payments' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$closed_at' } },
            method: '$payments.method'
          },
          amount: { $sum: '$payments.amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          methods: {
            $push: {
              method: '$_id.method',
              amount: '$amount'
            }
          },
          total_day: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }
}
