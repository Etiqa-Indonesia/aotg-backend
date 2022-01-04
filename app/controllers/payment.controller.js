const { getInvoiceList, InvoiceMidtrans, updateInvoices, 
    validatePaymentSignature, findInvoicesByOrderID, 
    CountInvoiceList, TotalProductionSummary,TotalProductionList, CollectionStatus } = require('../services/invoices.service')
const { GenerateOrderID } = require('../services/global.service');
const OriginalMidtransPaymentNotification = require('../models/response/OriginalMidtransPaymentNotification.model');
const { createResponseLog } = require('../services/responselog.service')
const { updateDynamicQuotation } = require('../services/quotation.service')


const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {

    const DataLog = {
        QuotationID: ID,
        URL: Config,
        isError: StatusCode == '200' ? 0 : 1,
        Param: JSON.stringify(ParamSend),
        StatusCode: StatusCode,
        Response: JSON.stringify(ResponseCareUser)
    };

    createResponseLog(DataLog);
}
exports.TotalProductionSummary = async (req, res) => {
    const results = await TotalProductionSummary(
        req.params.AgentID, req.body.customername
    )
    res.status(200).json({
        status: 200,
        data: results
    });

};
exports.TotalProductionList = async (req, res) => {
    const results = await TotalProductionList(
        req.params.AgentID, req.body.customername
    )
    res.status(200).json({
        status: 200,
        data: results,
    });

};
exports.CollectionStatus = async (req, res) => {
    const results = await CollectionStatus(
        req.params
    )
    res.status(200).json({
        status: 200,
        data: results,
    });

};
exports.getInvoiceList = async (req, res) => {
    const results = await getInvoiceList(
        req.params
    )
    res.status(200).json({
        status: 200,
        data: results
    });

};
exports.CountInvoiceList = async (req, res) => {
    const results = await CountInvoiceList(
        req.params
    )
    res.status(200).json({
        status: 200,
        data: results
    });

};

exports.validatePaymentSignature = async (req, res) => {
    const results = await validatePaymentSignature(
        ' req.params'
    )

    if (results) {
        res.status(200).json({
            status: 200,
            data: 'sama'
        });
    }
    else {
        res.status(200).json({
            status: 200,
            data: 'beda'
        });
    }


};

exports.testmethod = async (req, res) => {
    const result = await findInvoicesByOrderID(req.body.order_id)
    const DataInvoicesUpdate = {
        Amount: req.body.gross_amount,
        OrderID: req.body.order_id,
        Status: req.body.transaction_status,
        Currency: req.body.currency,
        PaymentType: req.body.payment_type,
        PaymentTransactionID: req.body.transaction_id,
        PaymentStatusCode: req.body.status_code,
        PaymentSignatureKey: req.body.signature_key,
        PaymentApprovalCode: req.body.approval_code,
        PaymentTransactionTime: req.body.transaction_time,
        PaymentSettlementTime: req.body.settlement_time,
        PaymentTransactionStatus: req.body.transaction_status
    }

    updateInvoices(result.QuotationID, DataInvoicesUpdate)

    res.status(200).json({
        status: 200,
        data: result.QuotationID
    });
}

exports.handleAfterPayment = async (req, res) => {
    
    const results = await validatePaymentSignature(
        req.body
    )
    const result = await findInvoicesByOrderID(req.body.order_id)

    if (results) {

        
        const DataInvoicesUpdate = {
            Amount: req.body.gross_amount,
            OrderID: req.body.order_id,
            Status: req.body.transaction_status,
            Currency: req.body.currency,
            PaymentType: req.body.payment_type,
            PaymentTransactionID: req.body.transaction_id,
            PaymentStatusCode: req.body.status_code,
            PaymentSignatureKey: req.body.signature_key,
            PaymentApprovalCode: req.body.approval_code,
            PaymentTransactionTime: req.body.transaction_time,
            PaymentSettlementTime: req.body.settlement_time,
            PaymentTransactionStatus: req.body.transaction_status,
            UpdateDate: Date.now()
        }
        await updateInvoices(result.QuotationID, DataInvoicesUpdate)
        if (req.body.transaction_status === 'settlement' && req.body.status_code === '200') {
            const DataUpdateARBucket = {
                UpdateDate: Date.now()
            }
            const DataUpdateQuotation = {
                IsPaid: 1
            }
            await updateDynamicQuotation(result.QuotationID, DataUpdateQuotation)
            await updateInvoices(result.QuotationID, DataUpdateARBucket)
            
            
        }
        SaveCareLog(req.body, 200, result.QuotationID, req.body.order_id, 'Validate Signature Payment')
    }
    else {
        SaveCareLog(req.body, 400, result.QuotationID, req.body.order_id, 'Validate Signature Payment Not Valid')

    }
    res.status(200).json({
        status: 200,
        data: results
    });

};

exports.InvoiceMidtrans = async (req, res) => {

    const results = await InvoiceMidtrans(
        req.body
    )
    console.log(results)
    if (results.message !== 'Error') {
        const UpdateInvoices = {
            PaymentToken: results.response.token,
            PaymentRedirectURL: results.response.redirect_url,
            OrderID: GenerateOrderID(req.body.productid, req.body.quotationid),
            UpdateDate: Date.now()
        }
        updateInvoices(req.body.quotationid, UpdateInvoices)
        res.status(200).json({
            status: 200,
            data: results.response.redirect_url
        });
    }
    else {
        res.status(200).json({
            status: results.statuscode,
            data: results.response
        });
    }


};