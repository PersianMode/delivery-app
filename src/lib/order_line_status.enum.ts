export enum ORDER_LINE_STATUS  {
    default = 1,
    WaitForOnlineWarehouse = 2,
    OnlineWarehouseVerified = 3,
    ReadyToDeliver = 4,
    DeliverySet = 5,
    OnDelivery = 6,
    Delivered = 7,
    Recieved = 8,
    FinalCheck =9,
    Checked = 10,
    NotExists = 11,
    Return =12,
    CustomerCancel =13,
    StoreCancel = 14,
    Renew = 15
  };