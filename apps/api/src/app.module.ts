import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ItemsModule } from './modules/items/items.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/golmarcadmin',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    
    // Application modules
    AuthModule,
    UsersModule,
    StoresModule,
    EmployeesModule,
    ItemsModule,
    ReceiptsModule,
    ShiftsModule,
    InventoryModule,
    SuppliersModule,
    PurchaseOrdersModule,
    WebhooksModule,
    ReportsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
