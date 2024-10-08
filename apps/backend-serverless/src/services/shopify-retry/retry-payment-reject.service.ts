import { ShopifyMutationPaymentReject } from '../../models/sqs/shopify-mutation-retry.model.js';
import { PrismaClient, PaymentRecordStatus } from '@prisma/client';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { MissingExpectedDatabaseValueError } from '../../errors/missing-expected-database-value.error.js';
import { makePaymentSessionReject } from '../shopify/payment-session-reject.service.js';
import axios from 'axios';
import { validatePaymentSessionRejected } from '../shopify/validate-payment-session-rejected.service.js';

export const retryPaymentReject = async (
    paymentRejectInfo: ShopifyMutationPaymentReject | null,
    prisma: PrismaClient,
    axiosInstance: typeof axios
) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentRejectInfo == null) {
        throw new Error('Payment reject info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentRejectInfo.paymentId });

    if (paymentRecord == null) {
        throw new MissingExpectedDatabaseRecordError('payment record');
    }

    if (paymentRecord.shopGid == null) {
        throw new MissingExpectedDatabaseValueError('payment record shop gid');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseValueError('merchant access token');
    }

    const paymentSessionReject = makePaymentSessionReject(axiosInstance);

    const rejectPaymentResponse = await paymentSessionReject(
        paymentRecord.shopGid,
        paymentRejectInfo.reason,
        merchant.shop,
        merchant.accessToken
    );

    validatePaymentSessionRejected(rejectPaymentResponse);

    try {
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.rejected,
            completedAt: new Date(),
        });
    } catch (error) {
        // CRITICAL: Add to critical message queue
        // We should be logging with sentry underneath
        throw error;
    }
};
