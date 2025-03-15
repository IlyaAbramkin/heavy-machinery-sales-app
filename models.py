from sqlalchemy import Text, ForeignKey, Column, Integer, String, create_engine, DateTime, PrimaryKeyConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from passlib.hash import bcrypt

Base = declarative_base()

def hash_password(plain_password: str) -> str:
    """Хеширование пароля (bcrypt)."""
    return bcrypt.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля (bcrypt)."""
    return bcrypt.verify(plain_password, hashed_password)

class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<Category(id={self.category_id}, name='{self.name}')>"

class Factory(Base):
    __tablename__ = "factory"

    factory_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<Factory(id={self.factory_id}, name='{self.name}')>"

class Chassis(Base):
    __tablename__ = "chassis"

    chassis_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<Chassis(id={self.chassis_id}, name='{self.name}')>"

class WheelFormula(Base):
    __tablename__ = "wheel_formula"

    wheel_formula_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<WheelFormula(id={self.wheel_formula_id}, name='{self.name}')>"

class Engine(Base):
    __tablename__ = "engine"

    engine_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<Engine(id={self.engine_id}, name='{self.name}')>"

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=True)

    def set_password(self, plain_password: str) -> None:
        """Сохраняет хешированную версию пароля."""
        self.password = hash_password(plain_password)

    def check_password(self, plain_password: str) -> bool:
        """Проверяет пароль."""
        return verify_password(plain_password, self.password)

    def __repr__(self):
        return f"<User(id={self.user_id}, email='{self.email}')>"

class Vehicle(Base):
    __tablename__ = "vehicle"

    vehicle_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    category_id = Column(Integer, ForeignKey("category.category_id"), nullable=True)
    factory_id = Column(Integer, ForeignKey("factory.factory_id"), nullable=True)
    chassis_id = Column(Integer, ForeignKey("chassis.chassis_id"), nullable=True)
    wheel_formula_id = Column(Integer, ForeignKey("wheel_formula.wheel_formula_id"), nullable=True)
    engine_id = Column(Integer, ForeignKey("engine.engine_id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    category = relationship("Category", backref="vehicles")
    factory = relationship("Factory", backref="vehicles")
    chassis = relationship("Chassis", backref="vehicles")
    wheel_formula = relationship("WheelFormula", backref="vehicles")
    engine = relationship("Engine", backref="vehicles")
    user = relationship("User", backref="vehicles")

    def __repr__(self):
        return f"<Vehicle(id={self.vehicle_id}, name='{self.name}')>"

class PriceList(Base):
    __tablename__ = "price_list"

    price_id = Column(Integer, primary_key=True, autoincrement=True)
    price = Column(Integer, nullable=False)
    delivery_time = Column(DateTime, default=datetime.utcnow)
    vehicle_id = Column(Integer, ForeignKey("vehicle.vehicle_id"), nullable=False)

    vehicle = relationship("Vehicle", backref="price_lists")

    def __repr__(self):
        return f"<PriceList(id={self.price_id}, price={self.price})>"

class Requests(Base):
    __tablename__ = "requests"

    request_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    request_date = Column(DateTime, default=datetime.utcnow)
    message = Column(Text, nullable=True)
    status = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    user = relationship("User", backref="requests")

    def __repr__(self):
        return f"<Requests(id={self.request_id}, full_name='{self.full_name}')>"

class TovaryVZayavke(Base):
    __tablename__ = "tovary_v_zayavke"

    request_id = Column(Integer, ForeignKey("requests.request_id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicle.vehicle_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # составной первичный ключ
    __table_args__ = (
        PrimaryKeyConstraint("request_id", "vehicle_id"),
    )

    request = relationship("Requests", backref="tovary")
    vehicle = relationship("Vehicle", backref="requests")

    def __repr__(self):
        return f"<TovaryVZayavke(request_id={self.request_id}, vehicle_id={self.vehicle_id}, qty={self.quantity})>"

class News(Base):
    __tablename__ = "news"

    news_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    publication_date = Column(DateTime, default=datetime.utcnow)
    content = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    user = relationship("User", backref="news")

    def __repr__(self):
        return f"<News(id={self.news_id}, title='{self.title}')>"
    


engine = create_engine('postgresql+psycopg2://postgres:12345@localhost:5433/postgres')
Base.metadata.create_all(engine)