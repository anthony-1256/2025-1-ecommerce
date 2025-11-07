/***** src/app/core/types/enums.ts *****/
export enum Gender {

    male = 'male',
    female = 'female',
    other= 'other'

}

export enum Role {
    guest = 'guest',
    user = 'user',
    admin = 'admin'
}

export enum ProductCategory {

    other = 'other',
    HDD = "Disco Duro Mecánico",
    SSD_SATA = "SSD SATA",
    SSD_M2_NVME = "SSD M.2 NVMe",
    MICRO_SD = "MicroSD",
    SD_CARD = "Tarjeta SD",
    USB = "Memoria USB"

}

export enum Brand {
  Kingston = 'Kingston',
  Samsung = 'Samsung',
  SanDisk = 'SanDisk',
  Seagate = 'Seagate',
  WesternDigital = 'Western Digital',
  Crucial = 'Crucial',
  Lexar = 'Lexar',
  Toshiba = 'Toshiba',
  Adata = 'Adata',
  Transcend = 'Transcend',
  PNY = 'PNY',
  Apacer = 'Apacer',
  HP = 'HP',
  Other = 'Otra'
}

export enum Capacity {
  GB16 = '16 GB',
  GB32 = '32 GB',
  GB64 = '64 GB',
  GB128 = '128 GB',
  GB256 = '256 GB',
  GB512 = '512 GB',
  TB1 = '1 TB',
  TB2 = '2 TB',
  TB4 = '4 TB',
  TB8 = '8 TB',
  Other = 'Otra'
}

export enum Speed {
  MB90 = '90 MB/s',
  MB100 = '100 MB/s',
  MB150 = '150 MB/s',
  MB300 = '300 MB/s',
  MB500 = '500 MB/s',
  MB1000 = '1,000 MB/s',
  MB2000 = '2,000 MB/s',
  MB3500 = '3,500 MB/s',
  MB7000 = '7,000 MB/s',
  Other = 'Otra'
}

export enum PaymentMethod {

  CreditCard = 'Tarjeta de crédito',
  DebitCard = 'Tarjeta de débito',
  Paypal = 'Paypal',
  BankTransfer = 'Transferencia bancaria',
  Cash = 'Pago en efectivo'

}

export enum BankOption {

  BBVA = 'BBVA',
  Banamex = 'Banamex',
  Santander = 'Santander',
  Banorte = 'Banorte',
  HSBC = 'HSBC',
  Scotiabank = 'Scotiabank',
  Inbursa = 'Inbursa',
  Afirme = 'Afirme',
  Otros = 'Otro banco'

}

export enum DeliveryOption {

  Delivery = 'Envio a domicilio',
  StorePickUp = 'Recoger en tienda'

}

export enum OrderStatus {
  Pending = 'Pendiente',
  Confirmed = 'Confirmado',
  Shipped = 'Enviado',
  Delivered = 'Entregado',
  Cancelled = 'Cancelado'  
}