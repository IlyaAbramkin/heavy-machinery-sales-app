from sqlalchemy import Text, ForeignKey, Integer, String, DateTime, Enum, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum
import datetime
from typing import Optional
from database import Base
from werkzeug.security import generate_password_hash, check_password_hash


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=True)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

class Chassis(Base):
    __tablename__ = "chassis"

    chassis_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

class Factory(Base):
    __tablename__ = "factories"

    factory_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class WheelFormula(Base):
    __tablename__ = "wheel_formulas"

    wheel_formula_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

class Engine(Base):
    __tablename__ = "engines"

    engine_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str] = mapped_column(String, nullable=False)

    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"), nullable=True)
    factory_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("factories.factory_id", ondelete="CASCADE"), nullable=True)
    chassis_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("chassis.chassis_id", ondelete="CASCADE"), nullable=True)
    wheel_formula_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("wheel_formulas.wheel_formula_id", ondelete="CASCADE"), nullable=True)
    engine_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("engines.engine_id", ondelete="CASCADE"), nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    category: Mapped["Category"] = relationship("Category", backref="vehicles")
    factory: Mapped["Factory"] = relationship("Factory", backref="vehicles")
    chassis: Mapped["Chassis"] = relationship("Chassis", backref="vehicles")
    wheel_formula: Mapped["WheelFormula"] = relationship("WheelFormula", backref="vehicles")
    engine: Mapped["Engine"] = relationship("Engine", backref="vehicles")
    user: Mapped["User"] = relationship("User", backref="vehicles")

class PriceList(Base):
    __tablename__ = "price_list"

    price_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_time: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), nullable=False)

    vehicle: Mapped["Vehicle"] = relationship("Vehicle", backref="price_lists")

class Requests(Base):
    __tablename__ = "requests"

    class PaymentMethodEnum(enum.Enum):
        BANK_CARD = "банковская карта"
        SBP = "СБП"
        CASH = "наличные"

    class RequestStatusEnum(enum.Enum):
        CREATED = "заявка создана"
        PROCESSING = "заявка обрабатывается"
        RECEIVED = "заявка получена"
        COMPLETED = "заявка выполнена"

    class DeliveryTypeEnum(enum.Enum):
        PICKUP = "самовывоз"
        DELIVERY = "доставка"

    request_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    request_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    payment_method: Mapped[PaymentMethodEnum] = mapped_column(Enum(PaymentMethodEnum), nullable=False)
    delivery_type: Mapped[DeliveryTypeEnum] = mapped_column(Enum(DeliveryTypeEnum), nullable=False)
    status: Mapped[RequestStatusEnum] = mapped_column(Enum(RequestStatusEnum), nullable=False)

    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)

    user: Mapped["User"] = relationship("User", backref="requests")

class TovaryVZayavke(Base):
    __tablename__ = "requisitioned_goods"

    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("requests.request_id", ondelete="CASCADE"), primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    request: Mapped["Requests"] = relationship("Requests", backref="tovary_v_zayavke")
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", backref="tovary_v_zayavke")

class News(Base):
    __tablename__ = "news"

    news_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    publication_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship("User", backref="news")
