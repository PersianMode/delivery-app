export enum ORDER_LINE_STATUS  {
  default = 1,
  WaitForOnlineWarehouse = 2,
  WaitForOnlineWarehouseCancel = 3,
  OnlineWarehouseVerified = 4,
  OnlineWarehouseCanceled = 5,
  ReadyToDeliver = 6,
  DeliverySet = 7,
  OnDelivery = 8,
  Delivered = 9,
  Recieved = 10,
  FinalCheck = 11,
  Checked = 12,
  NotExists = 13,
  ReturnRequested = 14,
  StoreCancel = 15,
  Renew = 16,
  Canceled = 17
  };