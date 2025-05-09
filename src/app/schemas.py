from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Схемы авторизации
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: str
    exp: datetime
    jti: str

class LoginCredentials(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

# Схемы пользователя
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class UserRead(UserBase):
    user_id: int
    is_active: bool
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

# Схемы категории
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    category_id: int
    model_config = ConfigDict(from_attributes=True)

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

# Схемы шасси
class ChassisBase(BaseModel):
    name: str

class ChassisCreate(ChassisBase):
    pass

class ChassisRead(ChassisBase):
    chassis_id: int
    model_config = ConfigDict(from_attributes=True)

class ChassisUpdate(BaseModel):
    name: Optional[str] = None

# Схемы завода
class FactoryBase(BaseModel):
    name: str

class FactoryCreate(FactoryBase):
    pass

class FactoryRead(FactoryBase):
    factory_id: int
    model_config = ConfigDict(from_attributes=True)

class FactoryUpdate(BaseModel):
    name: Optional[str] = None

# Схемы колесной формулы
class WheelFormulaBase(BaseModel):
    name: str

class WheelFormulaCreate(WheelFormulaBase):
    pass

class WheelFormulaRead(WheelFormulaBase):
    wheel_formula_id: int
    model_config = ConfigDict(from_attributes=True)

class WheelFormulaUpdate(BaseModel):
    name: Optional[str] = None

# Схемы двигателя
class EngineBase(BaseModel):
    name: str

class EngineCreate(EngineBase):
    pass

class EngineRead(EngineBase):
    engine_id: int
    model_config = ConfigDict(from_attributes=True)

class EngineUpdate(BaseModel):
    name: Optional[str] = None

# Схемы транспортного средства
class VehicleBase(BaseModel):
    title: str
    description: Optional[str] = None
    year: int
    color: str
    image_path: Optional[str] = None
    category_id: Optional[int] = None
    factory_id: Optional[int] = None
    chassis_id: Optional[int] = None
    wheel_formula_id: Optional[int] = None
    engine_id: Optional[int] = None

class VehicleCreate(VehicleBase):
    user_id: int
    publication_date: datetime = Field(default_factory=datetime.now)

class VehicleRead(VehicleBase):
    vehicle_id: int
    user_id: int
    publication_date: datetime
    model_config = ConfigDict(from_attributes=True)

class VehicleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    image_path: Optional[str] = None
    category_id: Optional[int] = None
    factory_id: Optional[int] = None
    chassis_id: Optional[int] = None
    wheel_formula_id: Optional[int] = None
    engine_id: Optional[int] = None
    publication_date: Optional[datetime] = None

# Схемы прайс-листа
class PriceListBase(BaseModel):
    price: int
    delivery_time: datetime
    vehicle_id: int
    user_id: int

class PriceListCreate(PriceListBase):
    pass

class PriceListRead(PriceListBase):
    price_id: int
    model_config = ConfigDict(from_attributes=True)

class PriceListUpdate(BaseModel):
    price: Optional[int] = None
    delivery_time: Optional[datetime] = None

# Схемы заявки
class PaymentMethodEnum(str, Enum):
    BANK_CARD = "банковская карта"
    SBP = "СБП"
    CASH = "наличные"

class RequestStatusEnum(str, Enum):
    CREATED = "заявка создана"
    PROCESSING = "заявка обрабатывается"
    RECEIVED = "заявка получена"
    COMPLETED = "заявка выполнена"

class DeliveryTypeEnum(str, Enum):
    PICKUP = "самовывоз"
    DELIVERY = "доставка"

class RequestBase(BaseModel):
    session_id: int
    company_name: Optional[str] = None
    full_name: str
    email: EmailStr
    phone: str
    city: str
    message: Optional[str] = None
    payment_method: PaymentMethodEnum
    delivery_type: DeliveryTypeEnum
    status: RequestStatusEnum = RequestStatusEnum.CREATED
    user_id: Optional[int] = None

class RequestCreate(RequestBase):
    request_date: datetime = Field(default_factory=datetime.now)

class RequestRead(RequestBase):
    request_id: int
    request_date: datetime
    model_config = ConfigDict(from_attributes=True)

class RequestUpdate(BaseModel):
    company_name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    message: Optional[str] = None
    payment_method: Optional[PaymentMethodEnum] = None
    delivery_type: Optional[DeliveryTypeEnum] = None
    status: Optional[RequestStatusEnum] = None

# Схемы товаров в заявке
class TovaryVZayavkeBase(BaseModel):
    request_id: int
    vehicle_id: int
    quantity: int

class TovaryVZayavkeCreate(BaseModel):
    vehicle_id: int
    quantity: int

class TovaryVZayavkeRead(TovaryVZayavkeBase):
    model_config = ConfigDict(from_attributes=True)

class TovaryVZayavkeUpdate(BaseModel):
    quantity: Optional[int] = None

# Схемы для оформления заказа
class OrderItem(TovaryVZayavkeCreate):
    name: str
    price: int

class OrderCreate(RequestCreate):
    tovary_v_zayavke: List[OrderItem]

# Схема для детального просмотра заказа
class OrderItemDetail(TovaryVZayavkeRead):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None

class OrderDetail(RequestRead):
    items: List[OrderItemDetail] = []

# Схемы новостей
class NewsBase(BaseModel):
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    image_path: Optional[str] = None
    user_id: int

class NewsCreate(NewsBase):
    publication_date: datetime = Field(default_factory=datetime.now)

class NewsRead(NewsBase):
    news_id: int
    publication_date: datetime
    model_config = ConfigDict(from_attributes=True)

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    image_path: Optional[str] = None 
